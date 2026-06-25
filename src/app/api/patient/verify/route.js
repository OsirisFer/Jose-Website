import { NextResponse } from "next/server";
import { validatePatientCode } from "@/lib/sheets";
import { checkRateLimit, isBlacklisted, extractIp, isValidOrigin } from "@/lib/security";

export async function POST(request) {
    if (!isValidOrigin(request)) {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const ip = extractIp(request);

    if (isBlacklisted(ip) || !checkRateLimit(ip, 10, 60000)) {
        return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
    }

    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ ok: false, error: "Missing code" }, { status: 400 });
        }

        const result = await validatePatientCode(code);

        if (!result.valid) {
            // Keep generic
            return NextResponse.json(
                { ok: false, firstInterviewDone: false },
                { status: 401 }
            );
        }

        return NextResponse.json({
            ok: true,
            firstInterviewDone: !!result.firstInterviewDone,
            recurring: result.recurring || null,
            // optional backward compatibility:
            valid: true,
        });
    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
    }
}
