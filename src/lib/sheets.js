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
    // A=Código, B=Activo, C=Nombre, D=Primera Entrevista, E=Notas
    // F=Modalidad, G=Email, H=Teléfono, I=Total Sesiones, J=Última Sesión
    const RANGE = "Patients!A:J";

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

        const activeRaw = row[1];
        const isActive = activeRaw === true || String(activeRaw).toUpperCase() === "TRUE";

        const doneRaw = row[3];
        const isDone = doneRaw === true || String(doneRaw).toUpperCase() === "TRUE";

        const sessionCount = parseInt(row[8]) || 0; // col I

        const absoluteRow = startIndex + index + 1;

        patients[code] = {
            active: isActive,
            firstInterviewDone: isDone,
            sessionCount,
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

    if (!data) return;

    const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Patients!D${data.rowIndex}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[true]] }
    });

    cache = { data: null, timestamp: 0 };
}

// Auto-fill contact info + increment session count + update last session date
export async function updatePatientBookingData(code, { email, phone, date }) {
    if (!code) return;
    const patients = await getPatientData();
    const data = patients[String(code).trim().toUpperCase()];

    if (!data) return;

    const SHEET_ID = process.env.GOOGLE_SHEETS_ID;
    const sheets = await getSheetsClient();
    const row = data.rowIndex;
    const newSessionCount = (data.sessionCount || 0) + 1;

    await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
            valueInputOption: "RAW",
            data: [
                { range: `Patients!G${row}`, values: [[email]] },
                { range: `Patients!H${row}`, values: [[phone || '']] },
                { range: `Patients!I${row}`, values: [[newSessionCount]] },
                { range: `Patients!J${row}`, values: [[date]] },
            ]
        }
    });

    cache = { data: null, timestamp: 0 };
}
