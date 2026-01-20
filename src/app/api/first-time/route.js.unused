import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { checkRateLimit, isBlacklisted } from '@/lib/security';

export async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Rate limit
    if (isBlacklisted(ip) || !checkRateLimit(ip, 5, 600000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const { name, email, phone, message, honeypot } = await request.json();

        if (honeypot) {
            return NextResponse.json({ success: true }); // Silent fail
        }

        if (!name || !email || !phone) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // SMTP Configuration
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFICATION_EMAIL_TO } = process.env;

        // Guard: If no SMTP configured, log and return error (or fallback to calendar if preferred, but user asked to switch)
        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
            console.error('SMTP Configuration Missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT || '465'),
            secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        // Send Email
        await transporter.sendMail({
            from: `"Web Josefina" <${SMTP_USER}>`,
            to: NOTIFICATION_EMAIL_TO || SMTP_USER, // Default to sender if no target set
            replyTo: email, // Allow reply directly to patient
            subject: `Nueva Solicitud: ${name}`,
            html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Nueva Solicitud de Entrevista</h2>
          <p>Has recibido una solicitud desde la web:</p>
          <ul>
            <li><strong>Nombre:</strong> ${name}</li>
            <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
            <li><strong>Teléfono:</strong> ${phone}</li>
          </ul>
          <p><strong>Mensaje:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message || 'Sin mensaje adicional.'}
          </div>
          <br>
          <p><em>Responde a este correo para contactar al paciente.</em></p>
        </div>
      `,
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Email Error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
