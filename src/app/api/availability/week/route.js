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

// Returns the date (YYYY-MM-DD UY) of this week's occurrence of the given JS weekday
// jsDayIdx: 1=Mon, 2=Tue, ..., 5=Fri
function getThisWeekDate(todayUYStr, jsDayIdx) {
    const today = new Date(`${todayUYStr}T12:00:00-03:00`);
    const todayJsDay = today.getDay();
    const diff = jsDayIdx - todayJsDay;
    today.setDate(today.getDate() + diff);
    return today.toLocaleDateString('en-CA', { timeZone: 'America/Montevideo' });
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
        const now = new Date();
        const todayUYStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Montevideo' });

        const { calendar, auth } = await getCalendarService();
        const schedule = await getWeeklySchedule();

        // Recurring is always 60 minutes (only standard sessions can be recurring)
        const durationMinutes = 60;

        // Query freebusy for the next ~14 days to cover first and second occurrences
        const timeMin = new Date(`${todayUYStr}T00:00:00-03:00`).toISOString();
        const timeMaxDate = new Date(`${todayUYStr}T23:59:59-03:00`);
        timeMaxDate.setDate(timeMaxDate.getDate() + 14);
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
            const jsDayIdx = i + 1; // Lunes=1, Martes=2, ... Viernes=5
            const thisWeekDate = getThisWeekDate(todayUYStr, jsDayIdx);

            // First occurrence: this week if today or in the future, else next week
            const firstDate = thisWeekDate >= todayUYStr
                ? thisWeekDate
                : addDays(thisWeekDate, 7);
            const secondDate = addDays(firstDate, 7);

            const daySchedule = schedule[dayName] || { active: false };

            let slotsFirst = computeDaySlots({
                dateStr: firstDate, daySchedule, busySlots: allBusy, durationMinutes
            });
            const slotsSecond = computeDaySlots({
                dateStr: secondDate, daySchedule, busySlots: allBusy, durationMinutes
            });

            // If the first occurrence is today, hide slots whose end already passed
            if (firstDate === todayUYStr) {
                slotsFirst = slotsFirst.filter(slot => {
                    const slotStart = new Date(`${firstDate}T${slot}:00-03:00`);
                    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
                    return slotEnd > now;
                });
            }

            // Only slots free in BOTH first and second weeks survive
            const safeSet = new Set(slotsSecond);
            const slots = slotsFirst.filter(s => safeSet.has(s));

            return {
                day: dayName,
                date: firstDate,
                active: daySchedule.active,
                slots,
            };
        });

        return NextResponse.json({ days: result });

    } catch (error) {
        console.error('Weekly availability error:', error);
        return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }
}
