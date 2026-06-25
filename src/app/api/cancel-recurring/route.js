import { NextResponse } from "next/server";
import { getCalendarService } from "@/lib/google";
import { validatePatientCode, clearRecurringSchedule } from "@/lib/sheets";
import { checkRateLimit, isBlacklisted, extractIp, isValidOrigin, escapeHtml } from "@/lib/security";
import { sendEmail } from "@/lib/email";

async function sendCancellationNotification({ patientCode, dayName, time }) {
    const notificationTo = process.env.NOTIFICATION_EMAIL_TO;
    if (!notificationTo) return;

    const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fdfcf8;">
        <h2 style="color: #2c2420;">Horario fijo cancelado</h2>
        <p>Un paciente canceló su horario fijo semanal.</p>
        <div style="background: #f5f0eb; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>🔑 Código paciente:</strong> ${escapeHtml(patientCode)}</p>
            <p style="margin: 0 0 10px 0;"><strong>📅 Día:</strong> ${escapeHtml(dayName || "—")}</p>
            <p style="margin: 0;"><strong>🕐 Hora:</strong> ${escapeHtml(time || "—")} hs</p>
        </div>
    </div>
    `;

    await sendEmail({
        to: notificationTo,
        subject: `Cancelación horario fijo: ${patientCode} — ${dayName || ''} ${time || ''}`,
        html,
    });
}

export async function POST(request) {
    if (!isValidOrigin(request)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = extractIp(request);
    if (isBlacklisted(ip) || !checkRateLimit(ip, 5, 60000)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    try {
        const { patientCode } = await request.json();
        if (!patientCode) {
            return NextResponse.json({ error: "Missing patient code" }, { status: 401 });
        }

        const authStatus = await validatePatientCode(patientCode);
        if (!authStatus.valid) {
            return NextResponse.json({ error: "Invalid or inactive patient code" }, { status: 403 });
        }
        if (!authStatus.recurring || !authStatus.recurring.eventId) {
            return NextResponse.json({ error: "No recurring schedule found" }, { status: 404 });
        }

        const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
        const { calendar, auth } = await getCalendarService();

        try {
            await calendar.events.delete({
                auth,
                calendarId: CALENDAR_ID,
                eventId: authStatus.recurring.eventId,
                sendUpdates: 'none',
            });
        } catch (e) {
            // If the event was already deleted from Calendar, keep going to clean the sheet
            if (e?.code !== 404 && e?.code !== 410) {
                console.error("Failed to delete recurring event:", e);
                return NextResponse.json({ error: "Failed to cancel event" }, { status: 500 });
            }
        }

        try {
            await clearRecurringSchedule(patientCode);
        } catch (e) {
            console.error("Failed to clear recurring schedule in sheet:", e);
        }

        try {
            await sendCancellationNotification({
                patientCode,
                dayName: authStatus.recurring.day,
                time: authStatus.recurring.time,
            });
        } catch (e) {
            console.error("Failed to send cancellation notification:", e);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Cancel Recurring Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
