/**
 * ria-proxy — Cloudflare Worker
 * Thin CORS-enabled proxy between the browser and the Anthropic API.
 * Holds ANTHROPIC_API_KEY as a Worker secret. Never exposed to client.
 *
 * POST /commentary
 *   Body: { systemPrompt: string, userMessage: string }
 *   Returns: { commentary: string }
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 2048;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/commentary') {
      return json({ error: 'Not found' }, 404);
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'Server configuration error. Contact the administrator.' }, 500);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const { systemPrompt, userMessage } = body ?? {};

    if (!systemPrompt || typeof systemPrompt !== 'string' || systemPrompt.trim() === '') {
      return json({ error: 'Missing or empty systemPrompt' }, 400);
    }
    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
      return json({ error: 'Missing or empty userMessage' }, 400);
    }

    let apiResponse;
    try {
      apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      });
    } catch {
      return json({ error: 'Failed to reach Anthropic API. Try again shortly.' }, 502);
    }

    if (!apiResponse.ok) {
      const status = apiResponse.status;
      let detail = '';
      try { detail = await apiResponse.text(); } catch {}
      const message = status === 429
        ? 'Rate limit reached. Please wait a moment and try again.'
        : `Anthropic API error ${status}: ${detail}`;
      return json({ error: message }, status);
    }

    let data;
    try {
      data = await apiResponse.json();
    } catch {
      return json({ error: 'Unexpected response from Anthropic API.' }, 502);
    }

    const commentary = data?.content?.[0]?.text ?? '';
    return json({ commentary });
  }
};
