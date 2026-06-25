import { Resend } from 'resend';

let cachedClient = null;

function getClient() {
    if (!cachedClient) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) throw new Error('Missing RESEND_API_KEY');
        cachedClient = new Resend(apiKey);
    }
    return cachedClient;
}

function getFrom() {
    return process.env.EMAIL_FROM || 'Lic. Josefina <onboarding@resend.dev>';
}

export async function sendEmail({ to, subject, html, replyTo }) {
    const resend = getClient();
    const { data, error } = await resend.emails.send({
        from: getFrom(),
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
        const err = new Error(error.message || 'Resend error');
        err.code = error.name || 'RESEND_ERROR';
        throw err;
    }

    return data;
}
