// Test helper — read sheet state and Calendar events for verification
import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const private_key = process.env.GOOGLE_PRIVATE_KEY
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");

const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key },
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/calendar",
    ],
});
const client = await auth.getClient();
const sheets = google.sheets({ version: "v4", auth: client });
const calendar = google.calendar({ version: "v3", auth: client });

const command = process.argv[2];

if (command === "patients") {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Patients!A:N",
    });
    const rows = res.data.values || [];
    console.log("All patients (showing code, active, firstInterview, recurring fields):");
    rows.slice(1).forEach((row, i) => {
        const code = row[0];
        const active = row[1];
        const firstDone = row[3];
        const recurring = row[10];
        const day = row[11];
        const time = row[12];
        const eventId = row[13];
        console.log(`  Row ${i+2}: code=${code} active=${active} firstDone=${firstDone} recurring=${recurring} day=${day} time=${time} eventId=${eventId ? eventId.slice(0,12)+'…' : ''}`);
    });
}

if (command === "events") {
    const now = new Date();
    const inAYear = new Date(now); inAYear.setFullYear(now.getFullYear() + 1);
    const res = await calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: now.toISOString(),
        timeMax: inAYear.toISOString(),
        singleEvents: false,
        maxResults: 50,
    });
    console.log(`Upcoming events in ${CALENDAR_ID}:`);
    (res.data.items || []).forEach(e => {
        const rec = e.recurrence ? ` [RECURRING: ${e.recurrence.join(',')}]` : '';
        console.log(`  ${e.id.slice(0,16)}… | ${e.summary} | ${e.start?.dateTime || e.start?.date}${rec}`);
    });
}

if (command === "event") {
    const eventId = process.argv[3];
    const res = await calendar.events.get({
        calendarId: CALENDAR_ID,
        eventId,
    });
    console.log(JSON.stringify(res.data, null, 2));
}
