/**
 * Queue API Endpoint
 * Returns the current queue items for display on the website
 */

export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);

    // CORS headers for frontend access
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=30' // Cache for 30 seconds
    };

    try {
        // Get query parameters
        const status = url.searchParams.get('status'); // pending, in_progress, completed
        const limit = parseInt(url.searchParams.get('limit') || '50');

        if (!env.QUEUE_KV) {
            // Return mock data if KV not configured
            return new Response(JSON.stringify({
                success: true,
                queue: getMockQueue(),
                source: 'mock'
            }), { status: 200, headers });
        }

        // Get the queue index
        const indexKey = 'queue:index';
        const indexData = await env.QUEUE_KV.get(indexKey);
        const index = indexData ? JSON.parse(indexData) : [];

        // Fetch queue items
        const items = [];
        for (const id of index.slice(0, limit)) {
            const itemData = await env.QUEUE_KV.get(`item:${id}`);
            if (itemData) {
                const item = JSON.parse(itemData);
                // Filter by status if specified
                if (!status || item.status === status) {
                    // Only include public-safe fields
                    items.push(sanitizeItem(item));
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            queue: items,
            total: items.length,
            source: 'kv'
        }), { status: 200, headers });

    } catch (error) {
        console.error('Queue API error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch queue'
        }), { status: 500, headers });
    }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
}

/**
 * Sanitize item for public display
 * Removes sensitive information like email
 */
function sanitizeItem(item) {
    return {
        id: item.id,
        type: item.type,
        from_name: item.is_public ? item.from_name : 'Anonymous',
        message: item.is_public ? (item.message || '') : '',
        amount: item.amount,
        currency: item.currency,
        status: item.status,
        created_at: item.created_at,
        is_subscription: item.is_subscription,
        tier_name: item.tier_name
    };
}

/**
 * Mock queue data for development/testing
 */
function getMockQueue() {
    return [
        {
            id: 'mock-001',
            type: 'Donation',
            from_name: 'Alex T.',
            message: 'Help me figure out why my Raspberry Pi keeps overheating during long renders.',
            amount: '20',
            currency: 'USD',
            status: 'pending',
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
            is_subscription: false,
            tier_name: null
        },
        {
            id: 'mock-002',
            type: 'Donation',
            from_name: 'Jordan M.',
            message: 'Need advice on setting up a home lab for learning Kubernetes.',
            amount: '20',
            currency: 'USD',
            status: 'pending',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            is_subscription: false,
            tier_name: null
        },
        {
            id: 'mock-003',
            type: 'Donation',
            from_name: 'Sam K.',
            message: 'Looking for the best approach to automate my invoice processing workflow.',
            amount: '20',
            currency: 'USD',
            status: 'in_progress',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            is_subscription: false,
            tier_name: null
        },
        {
            id: 'mock-004',
            type: 'Donation',
            from_name: 'Casey R.',
            message: 'Build vs buy decision for a custom CRM. Need help evaluating options.',
            amount: '20',
            currency: 'USD',
            status: 'completed',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            is_subscription: false,
            tier_name: null
        }
    ];
}
