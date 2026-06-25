import { NextResponse } from "next/server";
import { getCalendarService } from "@/lib/google";
import { validatePatientCode, setRecurringSchedule, updatePatientBookingData } from "@/lib/sheets";
import { checkRateLimit, isBlacklisted, extractIp, isValidOrigin, isValidDate, isValidTime, escapeHtml } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

const DURATION_MINUTES = 60;

function formatDateLong(dateStr) {
    return new Date(`${dateStr}T12:00:00-03:00`).toLocaleDateString('es-UY', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        timeZone: 'America/Montevideo'
    });
}

// Builds a Google Calendar "add to calendar" URL with weekly recurrence
function generateGoogleCalendarRecurringLink({ firstDate, time, durationMinutes }) {
    const [h, m] = time.split(':').map(Number);
    const endTotal = h * 60 + m + durationMinutes;
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;

    const dateCompact = firstDate.replace(/-/g, '');
    const start = `${dateCompact}T${String(h).padStart(2,'0')}${String(m).padStart(2,'0')}00`;
    const end = `${dateCompact}T${String(endH).padStart(2,'0')}${String(endM).padStart(2,'0')}00`;

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: 'Sesión semanal - Lic. Josefina García da Rosa',
        dates: `${start}/${end}`,
        details: 'Tu sesión semanal con la Lic. Josefina García da Rosa. Si necesitás cancelar o modificar tu horario fijo, ingresá con tu código en el sitio web.',
        ctz: 'America/Montevideo',
        recur: 'RRULE:FREQ=WEEKLY',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

async function sendRecurringConfirmationEmail({ to, name, dayName, time, firstDate }) {
    const formattedFirst = formatDateLong(firstDate);
    const calendarLink = generateGoogleCalendarRecurringLink({
        firstDate, time, durationMinutes: DURATION_MINUTES
    });

    const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fdfcf8;">
        <h2 style="color: #2c2420;">Horario fijo semanal confirmado</h2>
        <p>Hola <strong>${escapeHtml(name)}</strong>,</p>
        <p>Tu horario fijo semanal con la Lic. Josefina García da Rosa ha quedado confirmado.</p>

        <div style="background: #f5f0eb; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>📅 Día:</strong> Todos los ${dayName}</p>
            <p style="margin: 0 0 10px 0;"><strong>🕐 Hora:</strong> ${time} hs (Uruguay)</p>
            <p style="margin: 0 0 10px 0;"><strong>⏱️ Duración:</strong> 60 minutos</p>
            <p style="margin: 0;"><strong>🚀 Primera sesión:</strong> ${formattedFirst}</p>
        </div>

        <p>Agregalo a tu calendario para que se repita todas las semanas y te lleguen recordatorios automáticos:</p>
        <a href="${calendarLink}" target="_blank" style="display: inline-block; margin: 8px 0 20px; background: #4285f4; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 0.95rem; font-weight: 500;">📅 Agregar a Google Calendar (recurrente)</a>

        <p style="font-size: 0.9rem; color: #666;">Si necesitas modificar o cancelar tu horario fijo, podés hacerlo ingresando con tu código en el sitio web.</p>

        <hr style="border: none; border-top: 1px solid #e8d5c4; margin: 20px 0;">
        <p style="font-size: 0.85rem; color: #888;">Este correo fue enviado automáticamente.</p>
    </div>
    `;

    await sendEmail({
        to,
        subject: `Horario fijo confirmado — ${dayName} ${time} hs`,
        html,
    });
}

async function sendRecurringNotificationEmail({ name, email, phone, dayName, time, firstDate, patientCode }) {
    const notificationTo = process.env.NOTIFICATION_EMAIL_TO;
    if (!notificationTo) return;

    const formattedFirst = formatDateLong(firstDate);

    const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fdfcf8;">
        <h2 style="color: #2c2420;">Nuevo horario fijo semanal</h2>
        <p>Un paciente reservó un horario fijo semanal desde el sitio web.</p>

        <div style="background: #f5f0eb; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>👤 Paciente:</strong> ${escapeHtml(name)}</p>
            <p style="margin: 0 0 10px 0;"><strong>📧 Email:</strong> ${escapeHtml(email)}</p>
            <p style="margin: 0 0 10px 0;"><strong>📱 Teléfono:</strong> ${escapeHtml(phone || "No proporcionado")}</p>
            <p style="margin: 0 0 10px 0;"><strong>📅 Día fijo:</strong> Todos los ${dayName}</p>
            <p style="margin: 0 0 10px 0;"><strong>🕐 Hora:</strong> ${time} hs</p>
            <p style="margin: 0 0 10px 0;"><strong>🚀 Primera sesión:</strong> ${formattedFirst}</p>
            <p style="margin: 0;"><strong>🔑 Código paciente:</strong> ${patientCode}</p>
        </div>
    </div>
    `;

    await sendEmail({
        to: notificationTo,
        subject: `Nuevo horario fijo: ${name} — ${dayName} ${time} hs`,
        html,
        replyTo: email,
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
        const body = await request.json();
        const { firstDate, time, dayName, name, email, phone, honeypot, patientCode } = body;

        if (honeypot) return NextResponse.json({ success: true });
        if (!patientCode) return NextResponse.json({ error: "Missing patient code" }, { status: 401 });

        const authStatus = await validatePatientCode(patientCode);
        if (!authStatus.valid) {
            return NextResponse.json({ error: "Invalid or inactive patient code" }, { status: 403 });
        }
        if (authStatus.recurring) {
            return NextResponse.json({ error: "Patient already has a recurring schedule" }, { status: 409 });
        }

        if (!firstDate || !time || !dayName || !name || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        if (!isValidDate(firstDate) || !isValidTime(time)) {
            return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        const TIMEZONE = process.env.TIMEZONE || "America/Montevideo";
        const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
        if (!CALENDAR_ID) {
            return NextResponse.json({ error: "Calendar configuration missing" }, { status: 500 });
        }

        const { calendar, auth } = await getCalendarService();

        const startDateTime = new Date(`${firstDate}T${time}:00-03:00`);
        const endDateTime = new Date(startDateTime.getTime() + DURATION_MINUTES * 60000);

        // Safety: check that the first occurrence slot is still free
        const freebusy = await calendar.freebusy.query({
            auth,
            requestBody: {
                timeMin: startDateTime.toISOString(),
                timeMax: endDateTime.toISOString(),
                timeZone: TIMEZONE,
                items: [{ id: CALENDAR_ID }],
            },
        });
        if ((freebusy.data.calendars?.[CALENDAR_ID]?.busy || []).length > 0) {
            return NextResponse.json({ error: "Slot no longer available" }, { status: 409 });
        }

        const bookingId = crypto.randomUUID();

        const event = {
            summary: `Sesión semanal: ${name}`,
            description: `
<strong>Paciente:</strong> ${name}<br>
<strong>Email:</strong> ${email}<br>
<strong>Teléfono:</strong> ${phone || ""}<br>
<strong>Tipo:</strong> Horario fijo semanal (60 min)<br><br>
Reserva semanal realizada desde el sitio web.<br>
<strong>Código Paciente:</strong> ${patientCode}
            `,
            start: { dateTime: startDateTime.toISOString(), timeZone: TIMEZONE },
            end: { dateTime: endDateTime.toISOString(), timeZone: TIMEZONE },
            recurrence: ['RRULE:FREQ=WEEKLY'],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 30 },
                ],
            },
            extendedProperties: {
                private: {
                    bookingId,
                    source: "website_booking_recurring",
                    patientCode,
                    type: "recurring",
                },
            },
        };

        const inserted = await calendar.events.insert({
            auth,
            calendarId: CALENDAR_ID,
            sendUpdates: 'none',
            requestBody: event,
        });

        const eventId = inserted.data.id;

        // Update sheet: K=TRUE, L=day, M=time, N=eventId
        try {
            await setRecurringSchedule(patientCode, { day: dayName, time, eventId });
        } catch (e) {
            console.error("Failed to set recurring schedule in sheet:", e);
        }

        // Also keep contact info updated
        try {
            await updatePatientBookingData(patientCode, { email, phone, date: firstDate });
        } catch (e) {
            console.error("Failed to update patient booking data:", e);
        }

        try {
            await sendRecurringConfirmationEmail({ to: email, name, dayName, time, firstDate });
        } catch (e) {
            console.error("Failed to send recurring confirmation email:", e);
        }

        try {
            await sendRecurringNotificationEmail({ name, email, phone, dayName, time, firstDate, patientCode });
        } catch (e) {
            console.error("Failed to send recurring notification email:", e);
        }

        return NextResponse.json({ success: true, bookingId, eventId });
    } catch (error) {
        console.error("Recurring Booking Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
