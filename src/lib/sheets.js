// src/lib/sheets.js
import { google } from "googleapis";
import { getAuthClient } from "./google";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
const SHEETS_SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 60 * 1000; // 60s

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
    const RANGE = process.env.GOOGLE_SHEETS_RANGE || "Patients!A:C";

    if (!SHEET_ID) {
        throw new Error("GOOGLE_SHEETS_ID not set");
    }

    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: RANGE,
    });

    const rows = response.data.values || [];

    // Build: { "JF-001": true, "JF-002": false }
    // Skip header row if it looks like one
    const startIndex =
        rows[0]?.[0]?.toLowerCase?.() === "code" ? 1 : 0;

    const patients = rows.slice(startIndex).reduce((acc, row) => {
        const code = (row[0] || "").toString().trim();
        const activeRaw = row[1];

        const isActive =
            activeRaw === true ||
            String(activeRaw).toUpperCase() === "TRUE";

        if (code) acc[code] = isActive;
        return acc;
    }, {});

    cache = { data: patients, timestamp: now };
    return patients;
}

export async function validatePatientCode(code) {
    if (!code) return false;
    const patients = await getPatientData();
    return patients[String(code).trim()] === true;
}
