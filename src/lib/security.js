const rateLimitMap = new Map();

// Clear old entries every 10 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap.entries()) {
        if (now - val.startTime > 60000) rateLimitMap.delete(key);
    }
}, 1000 * 60 * 10);

// Extract real IP from x-forwarded-for (take only the first, validate format)
export function extractIp(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const raw = forwarded ? forwarded.split(',')[0].trim() : null;
    // Basic IPv4/IPv6 format check
    const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6 = /^[0-9a-fA-F:]+$/;
    if (raw && (ipv4.test(raw) || ipv6.test(raw))) return raw;
    return '0.0.0.0';
}

// Verify request comes from the same site (CSRF protection)
export function isValidOrigin(request) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    // In dev there may be no origin — allow it
    if (!origin && !referer) return true;

    const source = origin || referer;
    return source.includes(host);
}

export function checkRateLimit(ip, limit = 5, windowMs = 60000) {
    const now = Date.now();
    const userData = rateLimitMap.get(ip) || { count: 0, startTime: now };

    if (now - userData.startTime > windowMs) {
        userData.count = 1;
        userData.startTime = now;
    } else {
        userData.count++;
    }

    rateLimitMap.set(ip, userData);
    return userData.count <= limit;
}

export function isBlacklisted(identifier) {
    const blocklist = ['malicious@example.com', '1.2.3.4'];
    return blocklist.includes(identifier);
}

// Escape HTML characters to prevent injection in event descriptions
export function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// Validate date format YYYY-MM-DD and that it's a real future date
export function isValidDate(dateStr) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const date = new Date(`${dateStr}T12:00:00`);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
}

// Validate time format HH:MM (00:00 - 23:59)
export function isValidTime(timeStr) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr);
}
