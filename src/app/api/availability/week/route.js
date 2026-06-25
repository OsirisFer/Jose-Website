import { NextResponse } from 'next/server';
import { getCalendarService } from '@/lib/google';
import { validatePatientCode, getWeeklySchedule } from '@/lib/sheets';
import { checkRateLimit, isBlacklisted, extractIp, isValidOrigin, isValidDate } from '@/lib/security';

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

function addDays(dateStr, days) {
    const d = new Date(`${dateStr}T12:00:00-03:00`);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-CA', { timeZone: 'America/Montevideo' });
}

// Returns the Monday of the week following the given date (Uruguay timezone)
function getNextMondayDate(fromDateStr) {
    const d = new Date(`${fromDateStr}T12:00:00-03:00`);
    const day = d.getDay(); // 0=Sun ... 6=Sat
    const daysUntilNextMonday = day === 0 ? 1 : (8 - day);
    d.setDate(d.getDate() + daysUntilNextMonday);
    return d.toLocaleDateString('en-CA', { timeZone: 'America/Montevideo' });
}

function formatTime(date) {
    return date.toLocaleTimeString('es-UY', {
        timeZone: 'America/Montevideo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

function computeDaySlots({ dateStr, daySchedule, busySlots, durationMinutes }) {
    if (!daySchedule.active) return [];

    const workStart = new Date(`${dateStr}T${daySchedule.start}:00-03:00`);
    const workEnd   = new Date(`${dateStr}T${daySchedule.end}:00-03:00`);
    const lunchStart = daySchedule.lunchStart ? new Date(`${dateStr}T${daySchedule.lunchStart}:00-03:00`) : null;
    const lunchEnd   = daySchedule.lunchEnd   ? new Date(`${dateStr}T${daySchedule.lunchEnd}:00-03:00`)   : null;

    const slots = [];
    let cursor = new Date(workStart);

    while (cursor < workEnd) {
        const slotEnd = new Date(cursor.getTime() + durationMinutes * 60000);
        if (slotEnd > workEnd) break;

        const overlapsLunch = lunchStart && lunchEnd && cursor < lunchEnd && slotEnd > lunchStart;
        const isBusy = busySlots.some(busy => {
            const bs = new Date(busy.start);
            const be = new Date(busy.end);
            return (cursor < be) && (slotEnd > bs);
        });

        if (!overlapsLunch && !isBusy) {
            slots.push(formatTime(cursor));
        }

        cursor = new Date(cursor.getTime() + 30 * 60000);
    }

    return slots;
}

export async function GET(request) {
    if (!isValidOrigin(request)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ip = extractIp(request);
    if (isBlacklisted(ip) || !checkRateLimit(ip, 10, 60000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const patientCode = request.headers.get('x-patient-code');
    if (!patientCode) {
        return NextResponse.json({ error: 'Missing patient code' }, { status: 401 });
    }
    const authStatus = await validatePatientCode(patientCode);
    if (!authStatus.valid) {
        return NextResponse.json({ error: 'Invalid or inactive patient code' }, { status: 403 });
    }

    const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
    if (!CALENDAR_ID) {
        return NextResponse.json({ error: 'Calendar configuration missing' }, { status: 500 });
    }

    try {
        // Use the next Monday as starting point — first occurrence of any recurring event
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Montevideo' });
        const firstMonday = getNextMondayDate(todayStr);
        const secondMonday = addDays(firstMonday, 7);

        const { calendar, auth } = await getCalendarService();
        const schedule = await getWeeklySchedule();

        // Recurring is always 60 minutes (only standard sessions can be recurring)
        const durationMinutes = 60;

        // Query freebusy for a 14-day window covering both weeks
        const timeMin = new Date(`${firstMonday}T00:00:00-03:00`).toISOString();
        const timeMaxDate = new Date(`${secondMonday}T23:59:59-03:00`);
        timeMaxDate.setDate(timeMaxDate.getDate() + 4); // through Friday of second week
        const timeMax = timeMaxDate.toISOString();

        const freebusy = await calendar.freebusy.query({
            auth,
            requestBody: {
                timeMin,
                timeMax,
                items: [{ id: CALENDAR_ID }],
            },
        });
        const allBusy = freebusy.data.calendars[CALENDAR_ID].busy || [];

        const result = WEEKDAYS.map((dayName, i) => {
            const dateWeek1 = addDays(firstMonday, i);
            const dateWeek2 = addDays(secondMonday, i);
            const daySchedule = schedule[dayName] || { active: false };

            const slotsWeek1 = computeDaySlots({
                dateStr: dateWeek1, daySchedule, busySlots: allBusy, durationMinutes
            });
            const slotsWeek2 = computeDaySlots({
                dateStr: dateWeek2, daySchedule, busySlots: allBusy, durationMinutes
            });

            // Only slots that are free in BOTH weeks survive
            const safeSet = new Set(slotsWeek2);
            const slots = slotsWeek1.filter(s => safeSet.has(s));

            return {
                day: dayName,
                date: dateWeek1, // first occurrence date
                active: daySchedule.active,
                slots,
            };
        });

        return NextResponse.json({ days: result, firstOccurrenceWeekStart: firstMonday });

    } catch (error) {
        console.error('Weekly availability error:', error);
        return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }
}
