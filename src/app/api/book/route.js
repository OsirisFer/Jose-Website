import { NextResponse } from "next/server";
import { getCalendarService } from "@/lib/google";
import { validatePatientCode } from "@/lib/sheets";
import { checkRateLimit, isBlacklisted } from "@/lib/security";
import crypto from "crypto";

export async function POST(request) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

    // Rate limit + blacklist
    if (isBlacklisted(ip) || !checkRateLimit(ip, 10, 60000)) {
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
        const isAuthorized = await validatePatientCode(patientCode);
        if (!isAuthorized) {
            return NextResponse.json({ error: "Invalid or inactive patient code" }, { status: 403 });
        }

        // Input validation
        if (!date || !time || !name || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

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
            summary: `Sesión: ${name}`,
            description: `
<strong>Paciente:</strong> ${name}<br>
<strong>Email:</strong> ${email}<br>
<strong>Teléfono:</strong> ${phone || ""}<br><br>
Reserva realizada desde el sitio web.<br>
Código Paciente: ${patientCode}
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
                },
            },
        };

        await calendar.events.insert({
            auth,
            calendarId: CALENDAR_ID,
            requestBody: event,
        });

        return NextResponse.json({ success: true, bookingId });
    } catch (error) {
        console.error("Booking Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
