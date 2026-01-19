import { NextResponse } from "next/server";
import { getCalendarService } from "@/lib/google";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const TIMEZONE = process.env.TIMEZONE || "America/Montevideo";
    const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
    const WORK_START = parseInt((process.env.WORK_START || "09:00").split(":")[0], 10);
    const WORK_END = parseInt((process.env.WORK_END || "18:00").split(":")[0], 10);

    if (!CALENDAR_ID) {
        return NextResponse.json({ error: "Calendar configuration missing" }, { status: 500 });
    }

    try {
        const { calendar, auth } = await getCalendarService();

        // Full-day range for the selected date
        const startOfDay = new Date(`${dateParam}T00:00:00`);
        const endOfDay = new Date(`${dateParam}T23:59:59`);

        const timeMin = startOfDay.toISOString();
        const timeMax = endOfDay.toISOString();

        // ✅ IMPORTANT: pass auth explicitly
        const response = await calendar.freebusy.query({
            auth,
            requestBody: {
                timeMin,
                timeMax,
                timeZone: TIMEZONE,
                items: [{ id: CALENDAR_ID }],
            },
        });

        const busySlots = response.data?.calendars?.[CALENDAR_ID]?.busy || [];

        const availableSlots = [];

        for (let hour = WORK_START; hour < WORK_END; hour++) {
            for (const min of [0, 30]) {
                const slotStartTime = new Date(
                    `${dateParam}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`
                );
                const slotEndTime = new Date(slotStartTime.getTime() + 60 * 60 * 1000); // +1h

                const workCloseTime = new Date(`${dateParam}T${String(WORK_END).padStart(2, "0")}:00:00`);
                if (slotEndTime > workCloseTime) continue;

                const isBusy = busySlots.some((busy) => {
                    const busyStart = new Date(busy.start);
                    const busyEnd = new Date(busy.end);
                    return slotStartTime < busyEnd && slotEndTime > busyStart; // overlap
                });

                if (!isBusy) {
                    availableSlots.push(`${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
                }
            }
        }

        return NextResponse.json(availableSlots);
    } catch (error) {
        console.error("Calendar API Error:", error);
        return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
    }
}
