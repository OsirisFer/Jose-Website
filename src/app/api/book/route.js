import { NextResponse } from "next/server";
import { getCalendarService } from "@/lib/google";
import crypto from "crypto";

export async function POST(request) {
    try {
        const body = await request.json();
        const { date, time, name, email, phone, honeypot } = body;

        // 1) Honeypot check
        if (honeypot) {
            console.warn("Bot detected via honeypot");
            return NextResponse.json({ success: true }); // fake success
        }

        // 2) Input validation
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

        // ✅ get both calendar + auth
        const { calendar, auth } = await getCalendarService();

        // 3) Construct timestamps
        const startDateTime = new Date(`${date}T${time}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

        // 4) Double booking prevention (re-check busy)
        const freebusy = await calendar.freebusy.query({
            auth, // ✅ IMPORTANT
            requestBody: {
                timeMin: startDateTime.toISOString(),
                timeMax: endDateTime.toISOString(),
                timeZone: TIMEZONE,
                items: [{ id: CALENDAR_ID }],
            },
        });

        const busySlots = freebusy?.data?.calendars?.[CALENDAR_ID]?.busy || [];
        if (busySlots.length > 0) {
            return NextResponse.json({ error: "Slot no longer available" }, { status: 409 });
        }

        // 5) Create event
        const bookingId = crypto.randomUUID();

        const event = {
            summary: `Sesión: ${name}`,
            description: `
<strong>Paciente:</strong> ${name}<br>
<strong>Email:</strong> ${email}<br>
<strong>Teléfono:</strong> ${phone || ""}<br>
<br>
Reserva realizada desde el sitio web.
      `,
            start: { dateTime: startDateTime.toISOString(), timeZone: TIMEZONE },
            end: { dateTime: endDateTime.toISOString(), timeZone: TIMEZONE },
            extendedProperties: {
                private: {
                    bookingId,
                    source: "website_booking_wizard",
                },
            },
        };

        await calendar.events.insert({
            auth, // ✅ IMPORTANT
            calendarId: CALENDAR_ID,
            requestBody: event,
        });

        return NextResponse.json({ success: true, bookingId });
    } catch (error) {
        console.error("Booking Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
