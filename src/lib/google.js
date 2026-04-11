// src/lib/google.js
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

function getPrivateKey() {
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;
    if (!rawKey) throw new Error("Missing GOOGLE_PRIVATE_KEY");

    // 1. Remove surrounding quotes if they exist (sometimes dotenv leaves them if multiple)
    let key = rawKey.replace(/^"|"$/g, "");

    // 2. Convert literal \n to real newlines
    key = key.replace(/\\n/g, "\n");

    return key;
}

export async function getAuthClient(scopes = SCOPES) {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    if (!email) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL");

    const private_key = getPrivateKey();

    const auth = new google.auth.GoogleAuth({
        credentials: { client_email: email, private_key },
        scopes,
    });

    return await auth.getClient();
}

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
