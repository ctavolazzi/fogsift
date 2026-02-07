/**
 * Ko-fi Webhook Handler
 * Receives payment notifications from Ko-fi and adds them to the queue
 *
 * Ko-fi sends webhooks as application/x-www-form-urlencoded with a 'data' field
 * containing JSON payment information.
 *
 * Webhook types: Donation, Subscription, Commission, Shop Order
 */

// Ko-fi verification token - MUST be set as KOFI_VERIFICATION_TOKEN in Cloudflare Pages environment variables

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Parse the form data
        const formData = await request.formData();
        const dataString = formData.get('data');

        if (!dataString) {
            return new Response(JSON.stringify({ error: 'Missing data field' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse the JSON data
        const data = JSON.parse(dataString);

        // Verify the token via Cloudflare environment variable
        if (!env.KOFI_VERIFICATION_TOKEN || data.verification_token !== env.KOFI_VERIFICATION_TOKEN) {
            console.error('Invalid verification token');
            return new Response(JSON.stringify({ error: 'Invalid token' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create queue item from Ko-fi data
        const queueItem = {
            id: data.kofi_transaction_id || `kofi-${Date.now()}`,
            type: data.type, // Donation, Subscription, Commission, Shop Order
            timestamp: data.timestamp || new Date().toISOString(),
            from_name: data.from_name || 'Anonymous',
            email: data.email || null,
            amount: data.amount || '0',
            currency: data.currency || 'USD',
            message: data.message || '',
            is_public: data.is_public !== false, // Default to public
            is_subscription: data.is_subscription_payment || false,
            is_first_subscription: data.is_first_subscription_payment || false,
            tier_name: data.tier_name || null,
            shop_items: data.shop_items || [],
            status: 'pending', // pending, in_progress, completed
            created_at: new Date().toISOString(),
            message_id: data.message_id // For deduplication
        };

        // Check for duplicate (Ko-fi retries if no 200 response)
        if (env.QUEUE_KV) {
            const existing = await env.QUEUE_KV.get(`item:${queueItem.id}`);
            if (existing) {
                console.log('Duplicate webhook received, ignoring:', queueItem.id);
                return new Response(JSON.stringify({ success: true, duplicate: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // Store the queue item
            await env.QUEUE_KV.put(`item:${queueItem.id}`, JSON.stringify(queueItem));

            // Update the queue index
            const indexKey = 'queue:index';
            const existingIndex = await env.QUEUE_KV.get(indexKey);
            const index = existingIndex ? JSON.parse(existingIndex) : [];
            index.unshift(queueItem.id); // Add to front
            await env.QUEUE_KV.put(indexKey, JSON.stringify(index));

            console.log('Queue item added:', queueItem.id, queueItem.type);
        } else {
            // Fallback: log to console if KV not available
            console.log('KV not available, logging webhook:', JSON.stringify(queueItem));
        }

        // Return 200 to acknowledge receipt
        return new Response(JSON.stringify({
            success: true,
            id: queueItem.id,
            type: queueItem.type
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle GET requests (for testing/verification)
export async function onRequestGet(context) {
    return new Response(JSON.stringify({
        status: 'Ko-fi webhook endpoint active',
        method: 'POST required for webhooks'
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
