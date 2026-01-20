import { NextResponse } from 'next/server';
import { validatePatientCode } from '@/lib/sheets';
import { checkRateLimit, isBlacklisted } from '@/lib/security';

export async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    if (isBlacklisted(ip) || !checkRateLimit(ip, 20, 60000)) { // 20 req/min
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ valid: false }, { status: 400 });
        }

        const isValid = await validatePatientCode(code);

        if (isValid) {
            return NextResponse.json({ valid: true });
        } else {
            // Intentionally generic
            return NextResponse.json({ valid: false }, { status: 401 });
        }

    } catch (error) {
        console.error('Verification Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
