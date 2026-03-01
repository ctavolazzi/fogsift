/**
 * Newsletter Signup Handler
 * POST /api/newsletter — accepts { email, source? } JSON body
 *
 * Stores signups in Cloudflare KV under the binding NEWSLETTER_KV.
 * Works gracefully without KV (logs to console, returns success).
 *
 * KV structure:
 *   newsletter:emails       → JSON array of { email, ts, source }
 *   newsletter:email:<hash> → "1"  (dedup sentinel)
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

// Simple deterministic hash for dedup key (no crypto needed)
function simpleHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return Math.abs(h).toString(36);
}

export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost(context) {
    const { request, env } = context;

    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Invalid JSON body' }, 400);
    }

    const email = (body.email || '').trim().toLowerCase();
    const source = (body.source || 'homepage').slice(0, 40);

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: 'Invalid email address' }, 400);
    }

    // Rate-limit: check Referer header is from fogsift.com (loose check)
    const referer = request.headers.get('Referer') || '';
    if (referer && !referer.includes('fogsift.com') && !referer.includes('localhost')) {
        return json({ error: 'Forbidden' }, 403);
    }

    if (!env.NEWSLETTER_KV) {
        // KV not bound — log and succeed gracefully (useful in dev/preview)
        console.log('[newsletter] KV not bound. Would have stored:', email, source);
        return json({ success: true, message: 'Subscribed (dev mode)' });
    }

    try {
        const dedupKey = `newsletter:email:${simpleHash(email)}`;

        // Check for duplicate
        const exists = await env.NEWSLETTER_KV.get(dedupKey);
        if (exists) {
            return json({ success: true, message: 'Already subscribed' });
        }

        // Mark as seen
        await env.NEWSLETTER_KV.put(dedupKey, '1', { expirationTtl: 60 * 60 * 24 * 365 * 5 }); // 5 years

        // Append to list
        const listKey = 'newsletter:emails';
        const existing = await env.NEWSLETTER_KV.get(listKey);
        const list = existing ? JSON.parse(existing) : [];
        list.push({ email, ts: new Date().toISOString(), source });
        await env.NEWSLETTER_KV.put(listKey, JSON.stringify(list));

        console.log('[newsletter] New signup:', email, 'from', source);
        return json({ success: true, message: 'Subscribed successfully' });
    } catch (err) {
        console.error('[newsletter] KV error:', err);
        return json({ error: 'Server error' }, 500);
    }
}
