/**
 * GIF Vault — Web Worker
 * Handles filtering and sorting off the main thread.
 * Placed at the root of your site alongside index.html.
 */

importScripts('https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js');

let fuseIndex = null;
let currentGifs = [];

// Tracking params to strip from URLs
const TRACKING = new Set([
    'utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id',
    'fbclid','gclid','mc_eid','yclid','igshid','msclkid','twclid','ttclid',
    '_ga','_gac','_gl','ref','referrer','s','si','li_fat_id'
]);

function stripTracking(rawUrl) {
    try {
        const u = new URL(rawUrl);
        [...u.searchParams.keys()].forEach(k => {
            if (TRACKING.has(k.toLowerCase())) u.searchParams.delete(k);
        });
        let s = u.toString();
        return s.replace(/[?&]$/, '');
    } catch { return rawUrl; }
}

self.onmessage = ({ data }) => {
    const { id, type, payload } = data;

    // ── Build Fuse search index ────────────────────────────────────
    if (type === 'buildIndex') {
        currentGifs = payload.gifs;
        fuseIndex = new Fuse(currentGifs, {
            keys: ['source','type'],
            threshold: 0.35,
            minMatchCharLength: 2,
            ignoreLocation: true,
        });
        self.postMessage({ id, result: { ok: true, count: currentGifs.length } });
    }

    // ── Filter + sort ──────────────────────────────────────────────
    if (type === 'filter') {
        const { searchStr, typeFilter, sortBy } = payload;
        let result = [...currentGifs];

        // Text search via Fuse
        if (searchStr && fuseIndex) {
            result = fuseIndex.search(searchStr).map(r => r.item);
        }

        // Type filter
        if (typeFilter && typeFilter !== 'all') {
            result = result.filter(g => {
                const ext = (g.url || '').split('.').pop().toLowerCase().split('?')[0];
                if (typeFilter === 'other') {
                    return !['gif','webm','mp4','webp','png','jpg','jpeg'].includes(ext);
                }
                return ext === typeFilter || ext === typeFilter.replace('jpg','jpeg');
            });
        }

        // Sort
        if (sortBy === 'oldest') result.reverse();
        else if (sortBy === 'type') result.sort((a,b) => (a.type||'').localeCompare(b.type||''));

        self.postMessage({ id, result });
    }

    // ── Strip tracking params from a batch of URLs ─────────────────
    if (type === 'stripUrls') {
        const stripped = payload.urls.map(stripTracking);
        self.postMessage({ id, result: stripped });
    }
};
