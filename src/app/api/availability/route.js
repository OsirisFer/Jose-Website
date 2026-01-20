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
    if (!isAuthorized) {
        return NextResponse.json({ error: 'Invalid or inactive patient code' }, { status: 403 });
    }

    if (!dateParam) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Configuration
    const TIMEZONE = process.env.TIMEZONE || 'America/Montevideo';
    const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
    const WORK_START = parseInt((process.env.WORK_START || '09:00').split(':')[0]); // 9
    const WORK_END = parseInt((process.env.WORK_END || '18:00').split(':')[0]);     // 18

    if (!CALENDAR_ID) {
        console.warn('GOOGLE_CALENDAR_ID not set');
        return NextResponse.json({ error: 'Calendar configuration missing' }, { status: 500 });
    }

    try {
        const { calendar, auth } = await getCalendarService();


        const startOfDay = new Date(`${dateParam}T00:00:00`);
        const endOfDay = new Date(`${dateParam}T23:59:59`);

        const timeMin = startOfDay.toISOString();
        const timeMax = endOfDay.toISOString();

        const response = await calendar.freebusy.query({
            auth,
            requestBody: {
                timeMin,
                timeMax,
                timeZone: TIMEZONE,
                items: [{ id: CALENDAR_ID }],
            },
        });


        const busySlots = response.data.calendars[CALENDAR_ID].busy;
        const availableSlots = [];

        for (let hour = WORK_START; hour < WORK_END; hour++) {
            const minutes = [0, 30];

            for (let min of minutes) {
                const slotStartStr = `${dateParam}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00`;
                const slotStartTime = new Date(slotStartStr);
                let slotEndTime = new Date(slotStartTime.getTime() + 60 * 60 * 1000); // Add 1 hour

                const workCloseTime = new Date(`${dateParam}T${WORK_END}:00:00`);
                if (slotEndTime > workCloseTime) continue;

                const isBusy = busySlots.some(busy => {
                    const busyStart = new Date(busy.start);
                    const busyEnd = new Date(busy.end);
                    return (slotStartTime < busyEnd && slotEndTime > busyStart);
                });

                if (!isBusy) {
                    const timeLabel = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                    availableSlots.push(timeLabel);
                }
            }
        }

        return NextResponse.json(availableSlots);

    } catch (error) {
        console.error('Calendar API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }
}
