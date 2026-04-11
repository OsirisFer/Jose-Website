import { NextResponse } from "next/server";
import { getCalendarService } from "@/lib/google";
import { validatePatientCode, markFirstInterviewDone } from "@/lib/sheets";
import { checkRateLimit, isBlacklisted, extractIp, isValidOrigin, isValidDate, isValidTime, escapeHtml } from "@/lib/security";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Helper to send confirmation email
async function sendConfirmationEmail({ to, name, date, time, durationMinutes }) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const formattedDate = new Date(`${date}T${time}:00`).toLocaleDateString('es-UY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Montevideo'
    });

    const isFirstInterview = durationMinutes === 30;
    const sessionType = isFirstInterview ? "Primera Entrevista (30 min)" : "Sesión (60 min)";

    const bodyContent = isFirstInterview
        ? `<p>Hola <strong>${name}</strong>,</p>
           <p>Tu primera entrevista con la Lic. Josefina ha sido agendada. Es un espacio de 30 minutos para conocerte y evaluar juntos cómo acompañarte de la mejor manera.</p>`
        : `<p>Hola <strong>${name}</strong>,</p>
           <p>Tu sesión con la Lic. Josefina ha sido agendada correctamente.</p>`;

    const htmlContent = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fdfcf8;">
        <h2 style="color: #2c2420;">${isFirstInterview ? 'Primera Entrevista Confirmada' : '¡Reserva Confirmada!'}</h2>
        ${bodyContent}

        <div style="background: #f5f0eb; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>📅 Fecha:</strong> ${formattedDate}</p>
            <p style="margin: 0 0 10px 0;"><strong>🕐 Hora:</strong> ${time} hs (Uruguay)</p>
            <p style="margin: 0;"><strong>⏱️ Duración:</strong> ${sessionType}</p>
        </div>

        <p style="font-size: 0.9rem; color: #666;">
            Si necesitas cancelar o reprogramar, por favor comunícate con anticipación.
        </p>

        <hr style="border: none; border-top: 1px solid #e8d5c4; margin: 20px 0;">
        <p style="font-size: 0.85rem; color: #888;">
            Este correo fue enviado automáticamente. Por favor no respondas a este mensaje.
        </p>
    </div>
    `;

    await transporter.sendMail({
        from: `"Lic. Josefina" <${process.env.SMTP_USER}>`,
        to: to,
        subject: isFirstInterview
            ? `Primera Entrevista Confirmada - ${formattedDate}`
            : `Confirmación de Sesión - ${formattedDate}`,
        html: htmlContent,
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
        const { date, time, name, email, phone, honeypot, patientCode } = body;

        // Honeypot
        if (honeypot) {
            console.warn("Bot detected via honeypot");
            return NextResponse.json({ success: true });
        }

        // Patient code guard
        if (!patientCode) {
            return NextResponse.json({ error: "Missing patient code" }, { status: 401 });
        }
        const authStatus = await validatePatientCode(patientCode);
        if (!authStatus.valid) {
            return NextResponse.json({ error: "Invalid or inactive patient code" }, { status: 403 });
        }

        // Duration Check
        const isFirstInterview = !authStatus.firstInterviewDone;
        const durationMinutes = isFirstInterview ? 30 : 60;

        // Input validation
        if (!date || !time || !name || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!isValidDate(date)) {
            return NextResponse.json({ error: "Invalid date" }, { status: 400 });
        }

        if (!isValidTime(time)) {
            return NextResponse.json({ error: "Invalid time" }, { status: 400 });
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

        // Construct timestamps
        const startDateTime = new Date(`${date}T${time}:00`);
        const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

        // Double booking check
        const freebusy = await calendar.freebusy.query({
            auth,
            requestBody: {
                timeMin: startDateTime.toISOString(),
                timeMax: endDateTime.toISOString(),
                timeZone: TIMEZONE,
                items: [{ id: CALENDAR_ID }],
            },
        });

        const busySlots = freebusy.data.calendars?.[CALENDAR_ID]?.busy || [];
        if (busySlots.length > 0) {
            return NextResponse.json({ error: "Slot no longer available" }, { status: 409 });
        }

        // Create event
        const bookingId = crypto.randomUUID();

        const event = {
            summary: isFirstInterview ? `Primera Entrevista: ${name}` : `Sesión: ${name}`,
            description: `
<strong>Paciente:</strong> ${name}<br>
<strong>Email:</strong> ${email}<br>
<strong>Teléfono:</strong> ${phone || ""}<br>
<strong>Tipo:</strong> ${isFirstInterview ? "Primera Entrevista (30 min)" : "Sesión Standard (60 min)"}<br><br>
Reserva realizada desde el sitio web.<br>
<strong>Código Paciente:</strong> ${patientCode}
      `,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: TIMEZONE,
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: TIMEZONE,
            },
            extendedProperties: {
                private: {
                    bookingId,
                    source: "website_booking_wizard",
                    patientCode,
                    type: isFirstInterview ? "first_interview" : "standard"
                },
            },
        };

        // Insert event (simple, no attendees)
        await calendar.events.insert({
            auth,
            calendarId: CALENDAR_ID,
            requestBody: event,
        });

        // Update Sheet if it was first interview
        if (isFirstInterview) {
            try {
                await markFirstInterviewDone(patientCode);
            } catch (sheetError) {
                console.error("Failed to update Sheet status:", sheetError);
            }
        }

        // Send confirmation email (fail-soft)
        try {
            await sendConfirmationEmail({
                to: email,
                name,
                date,
                time,
                durationMinutes
            });
        } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
            // Do not fail the booking if email fails
        }

        return NextResponse.json({ success: true, bookingId });
    } catch (error) {
        console.error("Booking Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
