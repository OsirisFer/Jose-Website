// One-off: add headers to columns K-N and copy formatting from existing header row
// Run with: node --env-file=.env.local scripts/setup-recurring-columns.mjs
import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const private_key = process.env.GOOGLE_PRIVATE_KEY
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");

const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });

// 1) Get the sheetId of the "Patients" tab
const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
const patients = meta.data.sheets.find(s => s.properties.title === "Patients");
if (!patients) throw new Error("Patients sheet not found");
const sheetId = patients.properties.sheetId;

// 2) Write headers in K1:N1
await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: "Patients!K1:N1",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [["Horario Fijo", "Día Fijo", "Hora Fija", "Event ID"]] }
});

console.log("✓ Headers written");

// 3) Copy formatting from A1 (existing header) to K1:N1
await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
        requests: [
            {
                copyPaste: {
                    source: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 1 },
                    destination: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 10, endColumnIndex: 14 },
                    pasteType: "PASTE_FORMAT",
                },
            },
            // Set column K as a checkbox data validation for the data rows
            {
                setDataValidation: {
                    range: { sheetId, startRowIndex: 1, startColumnIndex: 10, endColumnIndex: 11 },
                    rule: {
                        condition: { type: "BOOLEAN" },
                        strict: true,
                    },
                },
            },
        ],
    },
});

console.log("✓ Formatting copied + column K set as checkbox");
console.log("Done.");
