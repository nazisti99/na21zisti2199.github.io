/**
 * GIF Vault — Cloudflare Worker (CORS Proxy)
 *
 * DEPLOY INSTRUCTIONS:
 *   1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 *   2. Paste this entire file, click "Save and Deploy"
 *   3. Copy your worker URL (e.g. https://gif-vault-proxy.USERNAME.workers.dev)
 *   4. In GIF Vault → Settings → Cloudflare Worker URL, paste that URL and Save
 *
 * USAGE: Requests go to  YOUR_WORKER_URL?url=https://target.site/api/endpoint
 * The worker fetches the target server-side and adds CORS headers to the response.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
  'Access-Control-Max-Age':       '86400',
};

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing ?url= parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    // Only allow HTTPS targets
    if (!targetUrl.startsWith('https://')) {
      return new Response(
        JSON.stringify({ error: 'Only HTTPS targets allowed' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    try {
      // Forward relevant request headers to the target
      const forwardHeaders = new Headers();
      forwardHeaders.set('Accept', request.headers.get('Accept') || 'application/json');
      const auth = request.headers.get('Authorization');
      if (auth) forwardHeaders.set('Authorization', auth);
      const ct = request.headers.get('Content-Type');
      if (ct) forwardHeaders.set('Content-Type', ct);

      const targetResponse = await fetch(targetUrl, {
        method:  request.method,
        headers: forwardHeaders,
        body:    ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
        redirect: 'follow',
      });

      // Stream response back with CORS headers
      const responseHeaders = new Headers(CORS_HEADERS);
      const contentType = targetResponse.headers.get('Content-Type');
      if (contentType) responseHeaders.set('Content-Type', contentType);
      // Expose rate-limit headers if present
      ['X-RateLimit-Limit','X-RateLimit-Remaining','X-RateLimit-Reset'].forEach(h => {
        const v = targetResponse.headers.get(h); if (v) responseHeaders.set(h, v);
      });

      return new Response(targetResponse.body, {
        status:  targetResponse.status,
        headers: responseHeaders,
      });

    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }
  },
};
