# Ko-fi Integration Guide

## Overview

This document outlines how to connect Ko-fi payments to the FogSift queue system.

## Current State

- **Queue Page**: `queue.html` - Shows pending and completed problems
- **Queue Data**: `content/queue.json` - Data file with queue entries
- **Mock Data**: Currently showing example submissions (clearly labeled)

---

## Phase 1: Ko-fi Commission Setup (Manual)

### Step 1: Create Ko-fi Account
1. Go to [ko-fi.com](https://ko-fi.com) and sign up
2. Set up your creator page at `ko-fi.com/fogsift`

### Step 2: Create Commission Listing
1. Go to **Commissions** in your Ko-fi dashboard
2. Create a new commission:
   - **Title**: "Problem Shark Tank - $20"
   - **Price**: $20
   - **Description**: 
     ```
     Submit your problem and join the queue.
     
     What you get:
     - Your problem added to the public queue
     - 75 minutes of filmed problem-solving (no face)
     - A written report with findings
     - One of three outcomes
     
     What to include:
     - What's the problem you're trying to solve?
     - What have you already tried?
     - What would success look like?
     - Do you want to stay anonymous? (Yes/No)
     
     By submitting, you agree that your problem becomes content.
     Videos will be published. You can request anonymization.
     ```
   - **Slots**: Unlimited (or set a limit if you want)

### Step 3: Manual Queue Updates
When a commission comes in:
1. Check Ko-fi Orders tab
2. Add entry to `content/queue.json` manually
3. Rebuild and deploy site

---

## Phase 2: Webhook Integration (Automated)

### Step 1: Create Webhook Endpoint

You'll need a server endpoint to receive Ko-fi webhooks. Options:

**Option A: Cloudflare Worker (Free, Recommended)**
```javascript
// workers/kofi-webhook.js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    const formData = await request.formData();
    const data = JSON.parse(formData.get('data'));
    
    // Verify it's a commission payment
    if (data.type !== 'Commission') {
      return new Response('OK', { status: 200 });
    }
    
    // Extract queue entry
    const entry = {
      id: `PST-${Date.now()}`,
      status: 'in_queue',
      submitted: new Date().toISOString(),
      display_name: data.is_public ? data.from_name : 'Anonymous',
      problem_summary: extractSummary(data.message),
      category: 'Uncategorized',
      anonymized: !data.is_public
    };
    
    // Store in KV or forward to GitHub API
    await env.QUEUE_KV.put('pending-' + entry.id, JSON.stringify(entry));
    
    return new Response('OK', { status: 200 });
  }
};
```

**Option B: Netlify Function**
```javascript
// netlify/functions/kofi-webhook.js
exports.handler = async (event) => {
  const data = JSON.parse(new URLSearchParams(event.body).get('data'));
  
  // Process and store...
  
  return { statusCode: 200, body: 'OK' };
};
```

**Option C: Simple Express Server**
```javascript
// server.js
const express = require('express');
const app = express();

app.post('/webhook/kofi', express.urlencoded({ extended: true }), (req, res) => {
  const data = JSON.parse(req.body.data);
  
  // Process and store...
  
  res.sendStatus(200);
});
```

### Step 2: Configure Ko-fi Webhook

1. Go to Ko-fi **Settings** → **Webhooks**
2. Enter your webhook URL (e.g., `https://fogsift.com/api/kofi-webhook`)
3. Enable notifications for: **Commissions**
4. Click **Send Test** to verify

### Step 3: Ko-fi Webhook Payload

Ko-fi sends a POST with form data containing a `data` field (JSON string):

```json
{
  "verification_token": "your-token",
  "message_id": "abc123",
  "timestamp": "2026-01-21T12:00:00Z",
  "type": "Commission",
  "is_public": true,
  "from_name": "John Doe",
  "message": "My problem is...",
  "amount": "20.00",
  "url": "https://ko-fi.com/Home/CoffeeShop?txid=...",
  "email": "john@example.com",
  "currency": "USD",
  "is_subscription_payment": false,
  "is_first_subscription_payment": false,
  "kofi_transaction_id": "xxx",
  "shop_items": null,
  "tier_name": null,
  "shipping": null
}
```

### Step 4: Queue Update Options

**Option A: Direct File Update (GitHub API)**
```javascript
// Update queue.json via GitHub API
const response = await fetch(
  'https://api.github.com/repos/ctavolazzi/fogsift/contents/src/content/queue.json',
  {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add queue entry ${entry.id}`,
      content: btoa(JSON.stringify(updatedQueue, null, 2)),
      sha: currentSha
    })
  }
);
```

**Option B: Separate API + Static Site**
- Webhook stores to database (KV, Supabase, etc.)
- Queue page fetches from API instead of static JSON
- Decouples data from build

---

## Phase 3: Full Automation

### Architecture
```
Ko-fi Payment
    ↓
Ko-fi Webhook
    ↓
Cloudflare Worker
    ↓
GitHub API (update queue.json)
    ↓
GitHub Actions (rebuild site)
    ↓
Cloudflare Pages (deploy)
    ↓
Queue page shows new entry
```

### Estimated Setup Time
- Phase 1 (Manual): 30 minutes
- Phase 2 (Webhook): 2-4 hours
- Phase 3 (Full Auto): Additional 2-4 hours

---

## Recommended Path

1. **Start with Phase 1** - Get Ko-fi commission live, process manually
2. **Validate the model** - See if people actually submit
3. **Build Phase 2** - Once you have consistent submissions, automate

Don't over-engineer before you have customers.

---

## Security Notes

- **Verify Ko-fi requests** using `verification_token`
- **Sanitize all input** before displaying on queue page
- **Never expose email addresses** in public queue
- **Rate limit webhook endpoint** to prevent abuse
- **Store verification token securely** (environment variable)

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/queue.html` | Queue page UI |
| `src/content/queue.json` | Queue data (mock + real) |
| `KOFI_INTEGRATION.md` | This document |
