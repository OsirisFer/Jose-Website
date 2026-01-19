// src/lib/google.js
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

export async function getCalendarService() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!email || !rawKey) {
        throw new Error("Missing Google credentials");
    }

    // Remove accidental wrapping quotes and convert \n to real newlines
    const private_key = rawKey.replace(/^"|"$/g, "").replace(/\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: email,
            private_key,
        },
        scopes: SCOPES,
    });

    const client = await auth.getClient();
    const calendar = google.calendar({ version: "v3", auth: client });

    // return both for convenience
    return { calendar, auth: client };
}
