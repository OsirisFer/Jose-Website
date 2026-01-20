import { NextResponse } from "next/server";
import { validatePatientCode } from "@/lib/sheets";
import { checkRateLimit, isBlacklisted } from "@/lib/security";

export async function POST(request) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

    if (isBlacklisted(ip) || !checkRateLimit(ip, 20, 60000)) {
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
            // optional backward compatibility:
            valid: true,
        });
    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
    }
}
