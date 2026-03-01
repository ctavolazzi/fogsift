/**
 * Contact Form Handler
 * POST /api/contact — accepts { name, email, subject, message } JSON body
 *
 * Stores submissions in Cloudflare KV under the binding QUEUE_KV.
 * Works gracefully without KV (logs to console, returns success).
 *
 * KV structure:
 *   contact:submissions   → JSON array of { name, email, subject, message, ts, ip }
 *   contact:count         → running total (integer string)
 */

const CORS = {
    'Access-Control-Allow-Origin': 'https://fogsift.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...CORS },
    });
}

function sanitize(str, maxLen) {
    return String(str || '').trim().slice(0, maxLen);
}

export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost(context) {
    const { request, env } = context;

    // Loose referer check
    const referer = request.headers.get('Referer') || '';
    if (referer && !referer.includes('fogsift.com') && !referer.includes('localhost')) {
        return json({ error: 'Forbidden' }, 403);
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Invalid request body' }, 400);
    }

    const name    = sanitize(body.name,    80);
    const email   = sanitize(body.email,   120).toLowerCase();
    const subject = sanitize(body.subject, 100);
    const message = sanitize(body.message, 2000);

    // Validate required fields
    if (!name)    return json({ error: 'Name is required.' }, 400);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: 'A valid email address is required.' }, 400);
    }
    if (!message) return json({ error: 'Message is required.' }, 400);

    const submission = {
        name,
        email,
        subject: subject || 'General question',
        message,
        ts: new Date().toISOString(),
        ip: request.headers.get('CF-Connecting-IP') || 'unknown',
    };

    if (!env.QUEUE_KV) {
        // KV not bound — log and succeed gracefully (dev/preview environments)
        console.log('[contact] KV not bound. Would have stored:', submission);
        return json({ success: true, message: 'Message received (dev mode)' });
    }

    try {
        // Append to submissions list
        const listKey = 'contact:submissions';
        const existing = await env.QUEUE_KV.get(listKey);
        const list = existing ? JSON.parse(existing) : [];
        list.push(submission);
        await env.QUEUE_KV.put(listKey, JSON.stringify(list));

        // Increment counter
        const countKey = 'contact:count';
        const count = parseInt(await env.QUEUE_KV.get(countKey) || '0', 10) + 1;
        await env.QUEUE_KV.put(countKey, String(count));

        console.log('[contact] New submission from:', email);
        return json({ success: true, message: 'Message received. We\'ll be in touch soon.' });
    } catch (err) {
        console.error('[contact] KV error:', err);
        return json({ error: 'Server error. Please try emailing info@fogsift.com directly.' }, 500);
    }
}
