import { NextResponse } from 'next/server';
import { getCalendarService } from '@/lib/google';
import { validatePatientCode, getScheduleForDate } from '@/lib/sheets';
import { checkRateLimit, isBlacklisted, extractIp, isValidOrigin, isValidDate } from '@/lib/security';

export async function GET(request) {
    if (!isValidOrigin(request)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ip = extractIp(request);

    if (isBlacklisted(ip) || !checkRateLimit(ip, 20, 60000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (!isValidDate(dateParam)) {
        return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }
    const patientCode = request.headers.get('x-patient-code');

    // Security Check 2: Patient Code Guard
    if (!patientCode) {
        return NextResponse.json({ error: 'Missing patient code' }, { status: 401 });
    }
    const isAuthorized = await validatePatientCode(patientCode);
    if (!isAuthorized.valid) { // Note: validatePatientCode returns object now
        return NextResponse.json({ error: 'Invalid or inactive patient code' }, { status: 403 });
    }


    // Configuration
    const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

    if (!CALENDAR_ID) {
        console.warn('GOOGLE_CALENDAR_ID not set');
        return NextResponse.json({ error: 'Calendar configuration missing' }, { status: 500 });
    }

    try {
        const { calendar, auth } = await getCalendarService();

        // Check patient status for duration
        let durationMinutes = 60; // Default
        if (!isAuthorized.firstInterviewDone) { // from validatePatientCode result
            durationMinutes = 30;
        }

        const startOfDay = new Date(`${dateParam}T00:00:00`);
        const endOfDay = new Date(`${dateParam}T23:59:59`);

        const timeMin = startOfDay.toISOString();
        const timeMax = endOfDay.toISOString();

        const response = await calendar.freebusy.query({
            auth,
            requestBody: {
                timeMin,
                timeMax,
                items: [{ id: CALENDAR_ID }],
            },
        });

        const busySlots = response.data.calendars[CALENDAR_ID].busy;
        const availableSlots = [];

        // Get work schedule from Sheet
        const schedule = await getScheduleForDate(dateParam);
        if (!schedule.active) {
            return NextResponse.json({ slots: [], duration: durationMinutes });
        }

        const workStart = new Date(`${dateParam}T${schedule.start}:00`);
        const workEnd   = new Date(`${dateParam}T${schedule.end}:00`);
        const lunchStart = schedule.lunchStart ? new Date(`${dateParam}T${schedule.lunchStart}:00`) : null;
        const lunchEnd   = schedule.lunchEnd   ? new Date(`${dateParam}T${schedule.lunchEnd}:00`)   : null;

        let currentSlot = new Date(workStart);

        while (currentSlot < workEnd) {
            const slotEnd = new Date(currentSlot.getTime() + durationMinutes * 60000);
            if (slotEnd > workEnd) break;

            // Skip lunch break
            const overlapsLunch = lunchStart && lunchEnd &&
                currentSlot < lunchEnd && slotEnd > lunchStart;

            // Check calendar busy slots
            const isBusy = busySlots.some(busy => {
                const busyStart = new Date(busy.start);
                const busyEnd   = new Date(busy.end);
                return (currentSlot < busyEnd) && (slotEnd > busyStart);
            });

            if (!overlapsLunch && !isBusy) {
                availableSlots.push(currentSlot.toTimeString().slice(0, 5));
            }

            currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
        }

        return NextResponse.json({ slots: availableSlots, duration: durationMinutes });

    } catch (error) {
        console.error('Calendar API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }
}
