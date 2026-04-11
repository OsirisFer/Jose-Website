// src/lib/sheets.js
import { google } from "googleapis";
import { getAuthClient } from "./google";

// Full access required to update cells
const SHEETS_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 15 * 1000; // 15s

async function getSheetsClient() {
    const client = await getAuthClient(SHEETS_SCOPES);
    return google.sheets({ version: "v4", auth: client });
}

async function getPatientData() {
    const now = Date.now();
    if (cache.data && now - cache.timestamp < CACHE_TTL) {
        return cache.data;
    }

    const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
    // Assuming A=Code, B=Active, C=Notes, D=FirstInterviewDone
    const RANGE = "Patients!A:D";

    if (!SHEET_ID) {
        throw new Error("GOOGLE_SHEETS_ID not set");
    }

    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: RANGE,
    });

    const rows = response.data.values || [];

    // Detect start index (skip header if present)
    const firstCell = rows[0]?.[0]?.toLowerCase?.().trim() ?? '';
    const startIndex = ['code', 'código', 'codigo'].includes(firstCell) ? 1 : 0;

    const patients = {};

    rows.slice(startIndex).forEach((row, index) => {
        const code = (row[0] || "").toString().trim().toUpperCase();
        if (!code) return;

        // Parse Active
        const activeRaw = row[1];
        const isActive = activeRaw === true || String(activeRaw).toUpperCase() === "TRUE";

        // Parse FirstInterviewDone (Column D)
        const doneRaw = row[3];
        const isDone = doneRaw === true || String(doneRaw).toUpperCase() === "TRUE";

        // Store rowIndex (absolute 1-based index for updating)
        // index is 0-based from slice, so actual row = startIndex + index + 1
        const absoluteRow = startIndex + index + 1;

        patients[code] = {
            active: isActive,
            firstInterviewDone: isDone,
            rowIndex: absoluteRow
        };
    });

    cache = { data: patients, timestamp: now };
    return patients;
}

export async function validatePatientCode(code) {
    if (!code) return { valid: false };
    const patients = await getPatientData();
    const data = patients[String(code).trim().toUpperCase()];

    if (!data || !data.active) return { valid: false };

    return {
        valid: true,
        firstInterviewDone: data.firstInterviewDone
    };
}

export async function markFirstInterviewDone(code) {
    if (!code) return;
    const patients = await getPatientData();
    const data = patients[String(code).trim().toUpperCase()];

    if (!data) return; // Code not found

    const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
    const sheets = await getSheetsClient();

    // Update Column D at the specific row
    const range = `Patients!D${data.rowIndex}`;

    await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: range,
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [[true]]
        }
    });

    // Invalidate cache immediately so next read sees the update
    cache = { data: null, timestamp: 0 };
}
