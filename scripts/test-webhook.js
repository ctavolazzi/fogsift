#!/usr/bin/env node
/**
 * Ko-fi Webhook Test Script
 * Simulates Ko-fi webhook payloads for local testing
 *
 * Usage:
 *   node scripts/test-webhook.js [target-url]
 *
 * Default target: http://localhost:8788/api/webhook/kofi
 *
 * You can also use this with webhook.site for testing:
 *   node scripts/test-webhook.js https://webhook.site/YOUR-UUID
 */

const https = require('https');
const http = require('http');

// Ko-fi verification token - set via KOFI_VERIFICATION_TOKEN env var
const VERIFICATION_TOKEN = process.env.KOFI_VERIFICATION_TOKEN || 'test-token-set-env-var';

// Sample Ko-fi webhook payloads
const samplePayloads = {
    // Single donation/tip
    donation: {
        verification_token: VERIFICATION_TOKEN,
        message_id: `test-${Date.now()}-donation`,
        timestamp: new Date().toISOString(),
        type: 'Donation',
        is_public: true,
        from_name: 'Test User',
        message: 'Help me figure out why my Docker containers keep running out of memory.',
        amount: '20.00',
        url: 'https://ko-fi.com/fogsift',
        email: 'test@example.com',
        currency: 'USD',
        is_subscription_payment: false,
        is_first_subscription_payment: false,
        kofi_transaction_id: `KO-FI-TEST-${Date.now()}`
    },

    // Shop order
    shopOrder: {
        verification_token: VERIFICATION_TOKEN,
        message_id: `test-${Date.now()}-shop`,
        timestamp: new Date().toISOString(),
        type: 'Shop Order',
        is_public: true,
        from_name: 'Field Guide Buyer',
        message: '',
        amount: '5.00',
        url: 'https://ko-fi.com/fogsift',
        email: 'buyer@example.com',
        currency: 'USD',
        is_subscription_payment: false,
        is_first_subscription_payment: false,
        kofi_transaction_id: `KO-FI-SHOP-${Date.now()}`,
        shop_items: [
            { direct_link_code: 'field-guide-pdf' }
        ]
    },

    // Commission request
    commission: {
        verification_token: VERIFICATION_TOKEN,
        message_id: `test-${Date.now()}-commission`,
        timestamp: new Date().toISOString(),
        type: 'Commission',
        is_public: true,
        from_name: 'Commission Client',
        message: 'I need help setting up a CI/CD pipeline for my small team.',
        amount: '500.00',
        url: 'https://ko-fi.com/fogsift',
        email: 'client@company.com',
        currency: 'USD',
        is_subscription_payment: false,
        is_first_subscription_payment: false,
        kofi_transaction_id: `KO-FI-COMM-${Date.now()}`
    },

    // Subscription payment
    subscription: {
        verification_token: VERIFICATION_TOKEN,
        message_id: `test-${Date.now()}-sub`,
        timestamp: new Date().toISOString(),
        type: 'Subscription',
        is_public: true,
        from_name: 'Monthly Supporter',
        message: 'Love your content!',
        amount: '10.00',
        url: 'https://ko-fi.com/fogsift',
        email: 'supporter@example.com',
        currency: 'USD',
        is_subscription_payment: true,
        is_first_subscription_payment: true,
        kofi_transaction_id: `KO-FI-SUB-${Date.now()}`,
        tier_name: 'Supporter Tier'
    },

    // Private donation (is_public: false)
    privateDonation: {
        verification_token: VERIFICATION_TOKEN,
        message_id: `test-${Date.now()}-private`,
        timestamp: new Date().toISOString(),
        type: 'Donation',
        is_public: false,
        from_name: 'Anonymous Supporter',
        message: 'This is a private message that should not be shown publicly.',
        amount: '20.00',
        url: 'https://ko-fi.com/fogsift',
        email: 'private@example.com',
        currency: 'USD',
        is_subscription_payment: false,
        is_first_subscription_payment: false,
        kofi_transaction_id: `KO-FI-PRIV-${Date.now()}`
    }
};

// Parse command line arguments
const args = process.argv.slice(2);
const targetUrl = args[0] || 'http://localhost:8788/api/webhook/kofi';
const payloadType = args[1] || 'donation';

// Get the payload
const payload = samplePayloads[payloadType];
if (!payload) {
    console.error(`Unknown payload type: ${payloadType}`);
    console.error(`Available types: ${Object.keys(samplePayloads).join(', ')}`);
    process.exit(1);
}

console.log('Ko-fi Webhook Test Script');
console.log('='.repeat(50));
console.log(`Target URL: ${targetUrl}`);
console.log(`Payload Type: ${payloadType}`);
console.log(`Transaction ID: ${payload.kofi_transaction_id}`);
console.log('');
console.log('Payload:');
console.log(JSON.stringify(payload, null, 2));
console.log('');

// Ko-fi sends data as application/x-www-form-urlencoded
// with a 'data' field containing JSON
const formData = `data=${encodeURIComponent(JSON.stringify(payload))}`;

// Parse the URL
const url = new URL(targetUrl);
const isHttps = url.protocol === 'https:';
const httpModule = isHttps ? https : http;

const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData),
        'User-Agent': 'Ko-fi-Webhook-Test/1.0'
    }
};

console.log('Sending webhook...');
console.log('');

const req = httpModule.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log(`Response Status: ${res.statusCode}`);
        console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
        console.log('');
        console.log('Response Body:');
        try {
            console.log(JSON.stringify(JSON.parse(data), null, 2));
        } catch {
            console.log(data);
        }
        console.log('');

        if (res.statusCode === 200) {
            console.log('✅ Webhook sent successfully!');
        } else {
            console.log(`⚠️  Unexpected status code: ${res.statusCode}`);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error sending webhook:', error.message);
    console.error('');
    console.error('Make sure your local dev server is running:');
    console.error('  npx wrangler pages dev dist');
});

req.write(formData);
req.end();
