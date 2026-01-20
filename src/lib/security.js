// In-memory store for rate limiting
// In a serverless environment (like Vercel), this resets often, which is acceptable for basic protection.
// For robust limiting, use Redis/KV.
const rateLimitMap = new Map();

// Clear old entries periodically to prevent memory leaks
setInterval(() => {
    rateLimitMap.clear();
}, 1000 * 60 * 60); // Clear every hour

export function checkRateLimit(ip, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const userData = rateLimitMap.get(ip) || { count: 0, startTime: now };

    if (now - userData.startTime > windowMs) {
        // Reset window
        userData.count = 1;
        userData.startTime = now;
    } else {
        userData.count++;
    }

    rateLimitMap.set(ip, userData);

    return userData.count <= limit;
}

export function isBlacklisted(identifier) {
    // Simple blocklist - can be moved to env var if needed
    const blocklist = ['malicious@example.com', '1.2.3.4'];
    return blocklist.includes(identifier);
}
