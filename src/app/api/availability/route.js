import { NextResponse } from 'next/server';
import { getCalendarService } from '@/lib/google';
import { validatePatientCode } from '@/lib/sheets';
import { checkRateLimit, isBlacklisted } from '@/lib/security';

export async function GET(request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Security Check 1: Blacklist & Rate Limit
    if (isBlacklisted(ip) || !checkRateLimit(ip, 20, 60000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const patientCode = request.headers.get('x-patient-code');

    // Security Check 2: Patient Code Guard
    if (!patientCode) {
        return NextResponse.json({ error: 'Missing patient code' }, { status: 401 });
    }
    const isAuthorized = await validatePatientCode(patientCode);
    if (!isAuthorized.valid) { // Note: validatePatientCode returns object now
        return NextResponse.json({ error: 'Invalid or inactive patient code' }, { status: 403 });
    }

    if (!dateParam) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
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

        // Generate slots
        // If 30 min duration: :00 and :30 are valid start times.
        // If 60 min duration: :00 and :30 are still valid start times.
        // We use env vars for Work Start/End or defaults
        const workStartStr = process.env.WORK_START || '09:00';
        const workEndStr = process.env.WORK_END || '17:00';

        const workStart = new Date(`${dateParam}T${workStartStr}:00`);
        const workEnd = new Date(`${dateParam}T${workEndStr}:00`);

        let currentSlot = new Date(workStart);

        while (currentSlot < workEnd) {
            // Check if slot + duration fits in work day
            const slotEnd = new Date(currentSlot.getTime() + durationMinutes * 60000);
            if (slotEnd > workEnd) break;

            // Check overlap with busy slots
            const isBusy = busySlots.some(busy => {
                const busyStart = new Date(busy.start);
                const busyEnd = new Date(busy.end);

                // Overlap condition: (StartA < EndB) and (EndA > StartB)
                return (currentSlot < busyEnd) && (slotEnd > busyStart);
            });

            if (!isBusy) {
                // Return just the start time string HH:mm
                availableSlots.push(currentSlot.toTimeString().slice(0, 5));
            }

            // Increment by 30 mins always (slots start at :00 or :30)
            currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
        }

        return NextResponse.json({ slots: availableSlots, duration: durationMinutes });

    } catch (error) {
        console.error('Calendar API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }
}
