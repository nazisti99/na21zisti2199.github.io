// ════════════════════════════════════════════════════════
// GIF VAULT — script.js v16
// ════════════════════════════════════════════════════════

const WEBHOOK_URL    = "https://discord.com/api/webhooks/1503377536812318840/ZbspBeE9J-ZbifruBV1ER53vxik3Lrax0AJ2Op1GPK_4mqhqYoidWqhW-GqbUvJNhmW5";
const GOFILE_TOKEN   = "DgOJkhjizplmNY9zIORNpi1NGuMPVMXC";
const GOFILE_ACCT    = "e5b34509-e426-4628-951e-b2053e9e44a8";

const DANBOORU_USER  = "ihatekfcpeople";
const DANBOORU_KEY   = "V6piRwXEu1jb5jvowVoPFdkD";
const GELBOORU_KEY   = "6fe516bbbba3524c5c2d508c69884f0dfd15bcdcc97a8c2d85673d70ca30af6936034bde012c48b9a3996398ad94a571db0d60a82b263e9e98782fd973ab18f2";
const GELBOORU_UID   = "1950791";
const R34_KEY        = "b1d7575227cb9f60d78789ad330b373ed7f4e57ea9bfb5d9e1e885cc781208dcc0f3cea57959f8f5093343eb9a8c098e60c894f07f07a3fc562d1351b2d5428d";
const R34_UID        = "6116170";

const REDDIT_CLIENT_ID     = "PsoZtaZZ4MeEQg2xn2gZPA";
const REDDIT_CLIENT_SECRET = "UPx3H0wTmf6_oMoTaiG2H3XNQjsEbQ";
const REDDIT_USER_AGENT    = "GifVault/1.0 by nazisti99";

const BSKY_HANDLE   = "maitaranasosi.bsky.social";
const BSKY_PASSWORD = "6wks-352c-of7j-ivin";


// ── STATE ─────────────────────────────────────────────────
let gifs = [];
let filtered = [];
let activeFilter = "all";
let activeSort   = "newest";
let searchQuery  = "";
let modalIndex   = 0;
const PAGE_SIZE  = 60;
let rendered     = 0;
let bulkMode     = false;
let selectedIds  = new Set();
let contextTarget = null;
let lastRawSettings = null;
let currentTagGif   = null;
let deadIds = new Set();
let pendingUrls = [];
let saveToVaultEnabled = true;
let layoutMode = "grid";
let fitMode    = "contain";
let maxPlayingVideos = 15;
let activeVideoSet   = new Set();
let activeGifSet     = new Set();
const passiveDeadIds = new Set();

let redditAccessToken  = null;
let redditTokenExpiry  = 0;
let redditFetchMode    = "original";

let redditSessions     = [];
let redditSessionIndex = 0;
let savedSubs = JSON.parse(localStorage.getItem("gif_vault_subs") || "[]");
let redditLoaded     = 0;
let redditTotalAdded = 0;
const redditShownUrls = new Set();

let globalBlacklist = JSON.parse(localStorage.getItem("gif_vault_blacklist") || "[]");

function makeBooruState() {
    return {
        page: 0, loading: false, done: false,
        currentTags: "", currentSort: "score",
        currentFilter: "all", currentRating: "all",
        shownIds: new Set()
    };
}
const booruState = {
    danbooru: makeBooruState(),
    gelbooru: makeBooruState(),
    rule34:   makeBooruState()
};

let bskyAccessToken = null;
let bskyState = {
    cursor: null, loading: false, done: false,
    currentQuery: "", currentFilter: "all",
    shownUris: new Set()
};

// RedGifs state
let redgifsToken = null;
let redgifsTokenExpiry = 0;
let redgifsState = {
    page: 0, loading: false, done: false,
    currentQuery: "", currentFilter: "all",
    shownIds: new Set(), items: []
};
let redgifsUsername = localStorage.getItem("redgifs_username") || "";
let redgifsUserPassword = localStorage.getItem("redgifs_password") || "";
let redgifsUserToken = null;

let universalModalItems = [];
let universalModalIndex = 0;

const BLANK_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// ── ELEMENT GETTER ────────────────────────────────────────
function el(id) {
    const e = document.getElementById(id);
    if (!e) console.warn("Missing element:", id);
    return e;
}

// ── CORE ELEMENTS ─────────────────────────────────────────
const gallery          = el("gallery");
const importBtn        = el("importBtn");
const exportBtn        = el("exportBtn");
const bulkBtn          = el("bulkBtn");
const searchInput      = el("searchInput");
const sortSelect       = el("sortSelect");
const gridSlider       = el("gridSlider");
const gifCount         = el("gifCount");
const loadMoreWrap     = el("loadMoreWrap");
const loadMoreBtn      = el("loadMoreBtn");
const filterBtns       = document.querySelectorAll(".filter-btn");
const progressWrap     = el("progressWrap");
const progressBar      = el("progressBar");
const progressLabel    = el("progressLabel");
const broadcastStatus  = el("broadcastStatus");
const bulkToolbar      = el("bulkToolbar");
const bulkCount        = el("bulkCount");
const bulkSelectAll    = el("bulkSelectAll");
const bulkExport       = el("bulkExport");
const bulkDelete       = el("bulkDelete");
const bulkCancel       = el("bulkCancel");
const incomingTray     = el("incomingTray");
const incomingTitle    = el("incomingTitle");
const incomingAccept   = el("incomingAccept");
const incomingTogglePreview = el("incomingTogglePreview");
const incomingReject   = el("incomingReject");
const incomingPreviewRow = el("incomingPreviewRow");
const modal            = el("modal");
const modalImg         = el("modalImg");
const modalClose       = el("modalClose");
const modalBackdrop    = el("modalBackdrop");
const modalPrev        = el("modalPrev");
const modalNext        = el("modalNext");
const modalIndex_el    = el("modalIndex");
const modalOpen        = el("modalOpen");
const modalCopy        = el("modalCopy");
const modalDownload    = el("modalDownload");
const modalDelete      = el("modalDelete");
const modalAddTag      = el("modalAddTag");
const modalTagsEl      = el("modalTags");
const tagModal         = el("tagModal");
const tagInput         = el("tagInput");
const tagAddBtn        = el("tagAddBtn");
const tagList          = el("tagList");
const tagCloseBtn      = el("tagCloseBtn");
const collectionInput  = el("collectionInput");
const collectionAddBtn = el("collectionAddBtn");
const collectionList   = el("collectionList");
const importModal      = el("importModal");
const importTextarea   = el("importTextarea");
const importConfirmBtn = el("importConfirmBtn");
const importCancelBtn  = el("importCancelBtn");
const importInfo       = el("importInfo");
const contextMenu      = el("contextMenu");
const ctxView          = el("ctxView");
const ctxCopy          = el("ctxCopy");
const ctxDownload      = el("ctxDownload");
const ctxTag           = el("ctxTag");
const ctxSelect        = el("ctxSelect");
const ctxDelete        = el("ctxDelete");
const shortcutsPanel   = el("shortcutsPanel");
const shortcutsClose   = el("shortcutsClose");
const shortcutsFab     = el("shortcutsFab");
const statGif          = el("statGif");
const statWebm         = el("statWebm");
const statMp4          = el("statMp4");
const statOther        = el("statOther");
const statVisible      = el("statVisible");
const statDead         = el("statDead");
const toast            = el("toast");
const settingsBtn      = el("settingsBtn");
const settingsPanel    = el("settingsPanel");
const settingsClose    = el("settingsClose");

const subredditInput     = el("subredditInput");
const redditSortEl       = el("redditSort");
const redditFilterEl     = el("redditFilter");
const redditLoadBtn      = el("redditLoadBtn");
const redditClearBtn     = el("redditClearBtn");
const redditAddBtn       = el("redditAddBtn");
const savedSubsEl        = el("savedSubs");
const redditGallery      = el("redditGallery");
const redditLoadMoreWrap = el("redditLoadMoreWrap");
const redditLoadingEl    = el("redditLoading");
const redditStats        = el("redditStats");
const redditStatSub      = el("redditStatSub");
const redditStatCount    = el("redditStatCount");
const redditStatAdded    = el("redditStatAdded");
const viewMasonryBtn     = el("viewMasonry");
const viewGridBtn        = el("viewGrid");

let toastTimer;
let renderQueue = [], renderScheduled = false;

// ════════════════════════════════════════════════════════
// RENDER SCHEDULER
// ════════════════════════════════════════════════════════
function scheduleRender(fn) {
    renderQueue.push(fn);
    if (!renderScheduled) {
        renderScheduled = true;
        requestAnimationFrame(() => {
            const fns = renderQueue.splice(0);
            renderScheduled = false;
            fns.forEach(f => f());
        });
    }
}
function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ════════════════════════════════════════════════════════
// INTERSECTION OBSERVER
// ════════════════════════════════════════════════════════
const mediaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const target = entry.target;
        if (entry.isIntersecting) {
            if (target.tagName === "VIDEO" && target.dataset.src) {
                target.src = target.dataset.src;
                delete target.dataset.src;
                target.load();
                tryPlayVideo(target);
                mediaObserver.unobserve(target);
            } else if (target.tagName === "VIDEO" && !target.dataset.src) {
                tryPlayVideo(target);
            }
            if (target.tagName === "IFRAME" && target.dataset.src) {
                target.src = target.dataset.src;
                delete target.dataset.src;
                mediaObserver.unobserve(target);
            }
            if (target.tagName === "IMG" && target.dataset.gifSrc) {
                tryPlayGif(target);
            }
            if (target.tagName === "IMG" && target.dataset.lazySrc) {
                target.src = target.dataset.lazySrc;
                delete target.dataset.lazySrc;
                mediaObserver.unobserve(target);
            }
        } else {
            if (target.tagName === "VIDEO") releaseVideo(target);
            if (target.tagName === "IMG" && target.dataset.gifSrc) releaseGif(target);
        }
    });
}, { rootMargin: "1200px 0px", threshold: 0 });

function tryPlayVideo(vid) {
    for (const v of activeVideoSet) { if (!document.contains(v) || v.paused) activeVideoSet.delete(v); }
    if (activeVideoSet.size >= maxPlayingVideos) {
        const oldest = activeVideoSet.values().next().value;
        if (oldest) { oldest.pause(); activeVideoSet.delete(oldest); }
    }
    activeVideoSet.add(vid);
    vid.play().catch(() => {});
}
function releaseVideo(vid) { activeVideoSet.delete(vid); if (!vid.paused) vid.pause(); }
function tryPlayGif(img) {
    for (const g of activeGifSet) { if (!document.contains(g)) activeGifSet.delete(g); }
    if (activeGifSet.size >= maxPlayingVideos) {
        const oldest = activeGifSet.values().next().value;
        if (oldest) releaseGif(oldest);
    }
    activeGifSet.add(img);
    if (img.src !== img.dataset.gifSrc) img.src = img.dataset.gifSrc;
}
function releaseGif(img) { activeGifSet.delete(img); if (img.src !== BLANK_GIF) img.src = BLANK_GIF; }

// ════════════════════════════════════════════════════════
// PASSIVE DEAD DETECTOR
// ════════════════════════════════════════════════════════
function attachPassiveDeadDetector(el2, gifId) {
    const markDead = () => {
        if (!gifId || passiveDeadIds.has(gifId)) return;
        passiveDeadIds.add(gifId); deadIds.add(gifId);
        const card = gallery.querySelector(`[data-id="${gifId}"]`);
        if (card) {
            card.classList.add("dead-link");
            if (!card.querySelector(".dead-badge")) {
                const db2 = document.createElement("div");
                db2.className = "dead-badge"; db2.textContent = "💀 DEAD";
                card.appendChild(db2);
            }
        }
        statDead.classList.remove("hidden");
        statDead.textContent = `💀 Dead: ${deadIds.size}`;
    };
    el2.addEventListener("error", markDead, { once: true });
}

// ════════════════════════════════════════════════════════
// TOAST / PROGRESS
// ════════════════════════════════════════════════════════
function showToast(msg, type = "info", duration = 2800) {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.className = `toast ${type} show`;
    toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
}
function showProgress(pct, label) {
    progressWrap.classList.remove("hidden");
    progressBar.style.width = `${Math.min(pct, 100)}%`;
    progressLabel.textContent = label;
}
function hideProgress() {
    progressBar.style.width = "100%";
    progressLabel.textContent = "Done!";
    setTimeout(() => { progressWrap.classList.add("hidden"); progressBar.style.width = "0%"; }, 700);
}

// ════════════════════════════════════════════════════════
// TABS
// ════════════════════════════════════════════════════════
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        el("tab-" + btn.dataset.tab).classList.add("active");
        const isVault = btn.dataset.tab === "vault";
        el("filterBar").style.display = isVault ? "" : "none";
        el("statsBar").style.display  = isVault ? "" : "none";
    };
});

// ════════════════════════════════════════════════════════
// SETTINGS PANEL
// ════════════════════════════════════════════════════════
function initSettings() {
    if (!settingsBtn || !settingsPanel || !settingsClose) return;
    settingsBtn.onclick = () => settingsPanel.classList.toggle("hidden");
    settingsClose.onclick = () => settingsPanel.classList.add("hidden");

    const layoutBtn = el("settingsLayoutBtn");
    if (layoutBtn) {
        updateSettingsLayoutBtn(layoutBtn);
        layoutBtn.onclick = () => {
            layoutMode = layoutMode === "grid" ? "masonry" : "grid";
            updateSettingsLayoutBtn(layoutBtn);
            applyGalleryLayout();
            showToast(layoutMode === "grid" ? "Grid layout" : "Masonry layout", "info");
        };
    }
    const fitBtn = el("settingsFitBtn");
    if (fitBtn) {
        updateSettingsFitBtn(fitBtn);
        fitBtn.onclick = () => {
            fitMode = fitMode === "contain" ? "cover" : "contain";
            updateSettingsFitBtn(fitBtn);
            applyFitMode();
        };
    }
    const saveBtn = el("settingsSaveBtn");
    if (saveBtn) {
        updateSettingsSaveBtn(saveBtn);
        saveBtn.onclick = () => {
            saveToVaultEnabled = !saveToVaultEnabled;
            updateSettingsSaveBtn(saveBtn);
            showToast(saveToVaultEnabled ? "Auto-save ON" : "Auto-save OFF", saveToVaultEnabled ? "success" : "info");
        };
    }
    const cdBtn = el("settingsClearDiscord");
    if (cdBtn) cdBtn.onclick = () => { settingsPanel.classList.add("hidden"); clearDiscordMedia(); };
    const caBtn = el("settingsClearAll");
    if (caBtn) caBtn.onclick = async () => {
        settingsPanel.classList.add("hidden");
        if (!confirm(`Delete all ${gifs.length} items?`)) return;
        gallery.querySelectorAll("video,iframe").forEach(e2 => mediaObserver.unobserve(e2));
        await clearAllGifsDB(); gifs = []; filtered = [];
        renderGallery(true); updateStats();
        showToast("Vault cleared", "info");
    };
    const maxVidInput = el("settingsMaxVideos");
    if (maxVidInput) {
        maxVidInput.value = maxPlayingVideos;
        maxVidInput.onchange = () => {
            const v = parseInt(maxVidInput.value);
            if (!isNaN(v) && v > 0) { maxPlayingVideos = v; showToast(`Max media: ${v}`, "info"); }
        };
    }
    const fetchModeBtn = el("settingsRedditMode");
    if (fetchModeBtn) {
        updateFetchModeBtn(fetchModeBtn);
        fetchModeBtn.onclick = () => {
            redditFetchMode = redditFetchMode === "original" ? "current" : "original";
            updateFetchModeBtn(fetchModeBtn);
            showToast(`Reddit mode: ${redditFetchMode}`, "info");
        };
    }
}
function updateSettingsLayoutBtn(btn) { btn.textContent = layoutMode === "grid" ? "⊟ Switch to Masonry" : "⊞ Switch to Grid"; }
function updateSettingsFitBtn(btn)    { btn.textContent = fitMode === "contain" ? "⛶ Switch to Cropped" : "⛶ Switch to Full Size"; }
function updateSettingsSaveBtn(btn)   { btn.textContent = saveToVaultEnabled ? "💾 Auto-save: ON" : "💾 Auto-save: OFF"; btn.className = saveToVaultEnabled ? "settings-btn active" : "settings-btn"; }
function updateFetchModeBtn(btn)      { btn.textContent = redditFetchMode === "original" ? "🔄 Reddit Mode: Original (v9)" : "🔄 Reddit Mode: Current"; }

// ════════════════════════════════════════════════════════
// LAYOUT / FIT
// ════════════════════════════════════════════════════════
function applyGalleryLayout() {
    const cols = gridSlider ? parseInt(gridSlider.value) : 4;
    if (layoutMode === "grid") {
        gallery.classList.remove("masonry-layout"); gallery.classList.add("grid-layout");
        gallery.style.gridTemplateColumns = `repeat(${cols}, 1fr)`; gallery.style.columns = "";
    } else {
        gallery.classList.remove("grid-layout"); gallery.classList.add("masonry-layout");
        gallery.style.gridTemplateColumns = ""; gallery.style.columns = `${cols}`; gallery.style.columnGap = "13px";
    }
}
function applyFitMode() {
    document.querySelectorAll(".img-wrapper img, .video-wrapper video").forEach(el2 => { el2.style.objectFit = fitMode; });
}

// ════════════════════════════════════════════════════════
// CLEAR DISCORD
// ════════════════════════════════════════════════════════
function isDiscordUrl(gif) { const u = (gif.url || "").toLowerCase(); return u.includes("cdn.discordapp.com") || u.includes("media.discordapp.net"); }
async function clearDiscordMedia() {
    const dGifs = gifs.filter(g => !g.origin || g.origin.toLowerCase().includes("discord") || isDiscordUrl(g));
    if (dGifs.length === 0) { showToast("No Discord media found", "info"); return; }
    if (!confirm(`Delete ${dGifs.length} Discord items?`)) return;
    await deleteManyFromDB(dGifs.map(g => g.id));
    gifs = await getAllGifs(); buildFuseIndex(); applyFilters(); updateStats();
    showToast(`Cleared ${dGifs.length} Discord items`, "success", 4000);
}

// ════════════════════════════════════════════════════════
// INDEXEDDB
// ════════════════════════════════════════════════════════
const DB_NAME = "GifVaultDB", DB_VERSION = 5, STORE_NAME = "gifs";
let db;
function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = e => {
            const d = e.target.result;
            if (d.objectStoreNames.contains(STORE_NAME)) d.deleteObjectStore(STORE_NAME);
            const store = d.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            store.createIndex("url",     "url",     { unique: true });
            store.createIndex("type",    "type",    { unique: false });
            store.createIndex("addedAt", "addedAt", { unique: false });
        };
        req.onsuccess = e => { db = e.target.result; resolve(db); };
        req.onerror   = e => reject(e.target.error);
    });
}
function getAllGifs() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror   = e => reject(e.target.error);
    });
}
function addGifsToDB(urls, origin = null) {
    return new Promise(async resolve => {
        if (!db) { console.error("[addGifsToDB] DB not open yet"); resolve(0); return; }
        // Strip tracking params from URLs before storing
        urls = urls.map(u => { try { return stripTracking(u); } catch { return u; } });
        let added = 0;
        const CHUNK = 200, total = urls.length;
        for (let i = 0; i < total; i += CHUNK) {
            const chunk = urls.slice(i, i + CHUNK);
            if (total > 20) showProgress(Math.round(((i + chunk.length) / total) * 100), `Importing...`);
            await new Promise(res => {
                const tx = db.transaction(STORE_NAME, "readwrite");
                const store = tx.objectStore(STORE_NAME);
                chunk.forEach(url => {
                    const req = store.add({ url, type: detectType(url), addedAt: Date.now(), tags: [], collections: [], origin: origin || null });
                    req.onsuccess = () => added++;
                    req.onerror   = () => {};
                });
                tx.oncomplete = () => res(); tx.onerror = () => res();
            });
        }
        resolve(added);
    });
}
function updateGifInDB(gif) { return new Promise((resolve, reject) => { const tx = db.transaction(STORE_NAME, "readwrite"); const req = tx.objectStore(STORE_NAME).put(gif); req.onsuccess = () => resolve(); req.onerror = e => reject(e.target.error); }); }
function deleteGifFromDB(id) { return new Promise((resolve, reject) => { const tx = db.transaction(STORE_NAME, "readwrite"); const req = tx.objectStore(STORE_NAME).delete(id); req.onsuccess = () => resolve(); req.onerror = e => reject(e.target.error); }); }
function deleteManyFromDB(ids) { return new Promise(resolve => { const tx = db.transaction(STORE_NAME, "readwrite"); const store = tx.objectStore(STORE_NAME); ids.forEach(id => store.delete(id)); tx.oncomplete = () => resolve(); tx.onerror = () => resolve(); }); }
function clearAllGifsDB() { return new Promise((resolve, reject) => { const tx = db.transaction(STORE_NAME, "readwrite"); const req = tx.objectStore(STORE_NAME).clear(); req.onsuccess = () => resolve(); req.onerror = e => reject(e.target.error); }); }

// ════════════════════════════════════════════════════════
// TYPE DETECTION
// ════════════════════════════════════════════════════════
function detectType(url) {
    if (!url) return "other";
    const lower = url.toLowerCase(), clean = lower.split("?")[0].split("#")[0];
    if (clean.endsWith(".gif"))  return "gif";
    if (clean.endsWith(".webm")) return "webm";
    if (clean.endsWith(".mp4"))  return "mp4";
    if (clean.endsWith(".webp")) return "webp";
    if (clean.endsWith(".png"))  return "png";
    if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "jpg";
    if (clean.endsWith(".apng")) return "apng";
    if (clean.endsWith(".avif")) return "avif";
    if (clean.endsWith(".mov") || clean.endsWith(".gifv")) return "mp4";
    if (lower.includes("v.redd.it")) return "mp4";
    if (lower.includes(".gif"))  return "gif";
    if (lower.includes(".webm")) return "webm";
    if (lower.includes(".mp4"))  return "mp4";
    if (lower.includes(".webp")) return "webp";
    if (lower.includes(".png"))  return "png";
    if (lower.includes(".jpg") || lower.includes(".jpeg")) return "jpg";
    return "other";
}
function normaliseUrl(url) {
    try {
        const u = new URL(url);
        ["size","width","height","w","h","quality","q","format","fit","dpr","scale","thumbnail","thumb","resize","crop","auto","fm","s","v","e","t","ts"].forEach(p => u.searchParams.delete(p));
        u.hash = ""; return u.toString().toLowerCase();
    } catch(e) { return url.toLowerCase().split("?")[0]; }
}
function extractUrls(text) {
    const raw = text.replace(/\r\n|\r|\n/g,"").replace(/\s+/g," ").match(/https?:\/\/[^\s"'\\<>\x00-\x1F]+/gi) || [];
    const results = [];
    for (let url of raw) {
        url = url.replace(/[\\'")\]>,;:!]+$/, ""); if (url.length < 16) continue;
        const lower = url.toLowerCase(), clean = lower.split("?")[0].split("#")[0];
        const isMedia = clean.endsWith(".gif")||clean.endsWith(".webm")||clean.endsWith(".mp4")||clean.endsWith(".webp")||clean.endsWith(".apng")||clean.endsWith(".avif")||clean.endsWith(".gifv")||clean.endsWith(".mov")||clean.endsWith(".png")||clean.endsWith(".jpg")||clean.endsWith(".jpeg")||lower.includes(".gif?")||lower.includes(".webm?")||lower.includes(".mp4?")||lower.includes(".webp?")||lower.includes(".png?")||lower.includes(".jpg?")||lower.includes("cdn.discordapp.com/attachments")||lower.includes("media.discordapp.net/attachments");
        if (!isMedia) continue;
        if (lower.includes("/emojis/")||lower.includes("/icons/")||lower.includes("/stickers/")||lower.includes("favicon")||lower.includes("/assets/")) continue;
        results.push(url);
    }
    return [...new Set(results)];
}
function decodeBlob(blob) {
    const results = [], tryX = t => { try { results.push(...extractUrls(t)); } catch(e) {} };
    let d1 = null; try { d1 = atob(blob.trim()); tryX(d1); } catch(e) {} tryX(blob);
    if (d1) { try { tryX(atob(d1.trim())); } catch(e) {} try { tryX(decodeURIComponent(d1)); } catch(e) {} }
    return [...new Set(results)];
}

// ════════════════════════════════════════════════════════
// FUSE.JS
// ════════════════════════════════════════════════════════
let fuseInstance = null;
function buildFuseIndex() {
    if (typeof Fuse === "undefined") return;
    fuseInstance = new Fuse(gifs, { keys: ["url","tags","collections","origin","type"], threshold: 0.35, ignoreLocation: true, includeScore: true });
}
function fuzzySearch(query) { if (!fuseInstance || !query.trim()) return gifs; return fuseInstance.search(query).map(r => r.item); }
// ════════════════════════════════════════════════════════
// GOFILE
// ════════════════════════════════════════════════════════
async function uploadToGofile(content, filename) {
    try {
        const serverRes = await fetch("https://api.gofile.io/servers", { headers: { "Authorization": `Bearer ${GOFILE_TOKEN}` } });
        if (!serverRes.ok) throw new Error(`HTTP ${serverRes.status}`);
        const servers = (await serverRes.json())?.data?.servers;
        if (!servers?.length) throw new Error("No servers");
        const bestServer = servers[0].name;
        let folderId = null;
        try {
            const acctRes = await fetch(`https://api.gofile.io/accounts/${GOFILE_ACCT}`, { headers: { "Authorization": `Bearer ${GOFILE_TOKEN}` } });
            if (acctRes.ok) {
                const rootId = (await acctRes.json())?.data?.rootFolder;
                if (rootId) {
                    const fr = await fetch("https://api.gofile.io/contents/createFolder", { method: "POST", headers: { "Authorization": `Bearer ${GOFILE_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ parentFolderId: rootId, folderName: `vault-${Date.now()}` }) });
                    if (fr.ok) folderId = (await fr.json())?.data?.id || null;
                }
            }
        } catch(e) {}
        const form = new FormData();
        form.append("token", GOFILE_TOKEN);
        form.append("file", new Blob([content], { type: "text/plain" }), filename);
        if (folderId) form.append("folderId", folderId);
        const upData = await (await fetch(`https://${bestServer}.gofile.io/uploadfile`, { method: "POST", body: form })).json();
        if (upData.status !== "ok") throw new Error("Upload failed");
        const finalFolder = upData.data?.parentFolder || folderId;
        if (finalFolder) {
            try { await fetch(`https://api.gofile.io/contents/${finalFolder}/update`, { method: "PUT", headers: { "Authorization": `Bearer ${GOFILE_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ attribute: "public", attributeValue: "true" }) }); } catch(e) {}
        }
        return upData.data?.downloadPage || (finalFolder ? `https://gofile.io/d/${finalFolder}` : null);
    } catch(e) { console.error("[Gofile]", e.message); return null; }
}

// ════════════════════════════════════════════════════════
// DISCORD WEBHOOK
// ════════════════════════════════════════════════════════
async function sendWebhook(payload) {
    if (!WEBHOOK_URL) return false;
    try { const res = await fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); return res.status === 204 || res.status === 200; } catch(e) { return false; }
}
async function sendWebhookImport(rawContent, urls, added, skipped) {
    showToast("Uploading to gofile.io...", "info", 5000);
    const gofileLink = await uploadToGofile(rawContent, `vault-${Date.now()}.txt`);
    await sendWebhook({ embeds: [{ title: "📥 GIF Vault — Import", color: 0x5865F2, timestamp: new Date().toISOString(), fields: [{ name: "📊 Stats", value: `**Found:** ${urls.length}\n**Added:** ${added}\n**Dupes:** ${skipped}`, inline: false }, { name: "📁 File", value: gofileLink ? `[gofile.io](${gofileLink})` : "Upload failed", inline: false }, { name: "🔗 Samples", value: urls.slice(0,5).map(u=>`• ${u.slice(0,80)}`).join("\n")||"—", inline: false }], footer: { text: "GIF Vault" } }] });
}
async function sendWebhookGeneral(urls, added, skipped, origin) {
    await sendWebhook({ embeds: [{ title: "📡 GIF Vault — Media Added", color: 0x57f287, timestamp: new Date().toISOString(), fields: [{ name: "📊 Stats", value: `**Added:** ${added}\n**Dupes:** ${skipped}\n**Source:** ${origin||"unknown"}`, inline: false }, { name: "🔗 Samples", value: urls.slice(0,3).map(u=>`• ${u.slice(0,80)}`).join("\n")||"—", inline: false }], footer: { text: "GIF Vault" } }] });
}

// ════════════════════════════════════════════════════════
// REDDIT — OAUTH2
// ════════════════════════════════════════════════════════
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getRedditToken() {
    if (redditAccessToken && Date.now() < redditTokenExpiry - 60000) return redditAccessToken;
    const creds = btoa(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`);
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: { "Authorization": `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": REDDIT_USER_AGENT },
        body: "grant_type=client_credentials"
    });
    if (!res.ok) throw new Error(`Reddit token error: HTTP ${res.status}`);
    const data = await res.json();
    redditAccessToken = data.access_token;
    redditTokenExpiry = Date.now() + (data.expires_in * 1000);
    return redditAccessToken;
}

let _lastRedditCall = 0;
const REDDIT_GAP = 1000;

async function redditFetch(url) {
    const wait = Math.max(0, REDDIT_GAP - (Date.now() - _lastRedditCall));
    if (wait > 0) await sleep(wait);
    _lastRedditCall = Date.now();
    const oauthUrl = url.replace("https://old.reddit.com", "https://oauth.reddit.com").replace("https://www.reddit.com", "https://oauth.reddit.com");
    const token = await getRedditToken();
    const res = await fetch(oauthUrl, { headers: { "Authorization": `Bearer ${token}`, "User-Agent": REDDIT_USER_AGENT }, signal: AbortSignal.timeout(15000) });
    if (res.status === 401) { redditAccessToken = null; redditTokenExpiry = 0; const newToken = await getRedditToken(); const retry = await fetch(oauthUrl, { headers: { "Authorization": `Bearer ${newToken}`, "User-Agent": REDDIT_USER_AGENT }, signal: AbortSignal.timeout(15000) }); if (!retry.ok) throw new Error(`Reddit retry HTTP ${retry.status}`); return await retry.json(); }
    if (res.status === 429) { const wait2 = parseInt(res.headers.get("Retry-After") || "10") * 1000; await sleep(wait2); return redditFetch(url); }
    if (res.status === 404) throw new Error("Subreddit not found (404)");
    if (res.status === 403) throw new Error("Subreddit private or banned (403)");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.trim().startsWith("{") && !text.trim().startsWith("[")) throw new Error("Response not JSON");
    return JSON.parse(text);
}

// ════════════════════════════════════════════════════════
// MEDIA EXTRACTION (Reddit)
// ════════════════════════════════════════════════════════
function dedupeKey(url) { try { const u = new URL(url); return (u.hostname + u.pathname).toLowerCase(); } catch(e) { return url.toLowerCase(); } }
function resolveImgur(url) { if (/\.gifv$/i.test(url)) return url.replace(/\.gifv$/i, ".mp4"); const m = url.match(/^https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/); if (m) return `https://i.imgur.com/${m[1]}.gif`; return url; }
function isDirectMedia(url) { if (!url || !url.startsWith("http")) return false; const l = url.toLowerCase().split("?")[0]; return l.endsWith(".gif")||l.endsWith(".webm")||l.endsWith(".mp4")||l.endsWith(".webp")||l.endsWith(".png")||l.endsWith(".jpg")||l.endsWith(".jpeg")||l.endsWith(".gifv")||l.endsWith(".apng")||l.includes("i.redd.it")||l.includes("v.redd.it")||l.includes("i.imgur.com")||l.includes("preview.redd.it"); }
function scoreUrl(url) { const l = url.toLowerCase().split("?")[0]; if (l.includes("i.redd.it")) { if (l.endsWith(".gif")) return 100; if (l.endsWith(".mp4")) return 99; if (l.endsWith(".webm")) return 98; return 60; } if (l.includes("v.redd.it")) return 95; if (l.includes("i.imgur.com")) { if (l.endsWith(".mp4")) return 92; if (l.endsWith(".gif")) return 91; return 75; } if (l.endsWith(".mp4")) return 80; if (l.endsWith(".gif")) return 79; if (l.endsWith(".webm")) return 78; return 1; }
function detectEmbedType(url) { const l = url.toLowerCase(); if (l.includes("redgifs.com")) return "redgifs"; if (l.includes("gfycat.com")) return "gfycat"; if (l.includes("tenor.com")) return "tenor"; if (l.includes("giphy.com")) return "giphy"; return null; }
function getEmbedSrc(url) { const rg = url.match(/redgifs\.com\/watch\/([a-zA-Z0-9]+)/i); if (rg) return `https://www.redgifs.com/ifr/${rg[1]}`; const gf = url.match(/gfycat\.com\/(?:ifr\/)?([a-zA-Z0-9]+)/i); if (gf) return `https://gfycat.com/ifr/${gf[1]}`; const tn = url.match(/tenor\.com\/view\/([^/?#]+)/i); if (tn) return `https://tenor.com/embed/${tn[1]}`; const gi = url.match(/giphy\.com\/gifs\/(?:[^/]+-)?([a-zA-Z0-9]+)$/i); if (gi) return `https://giphy.com/embed/${gi[1]}`; return null; }

function extractMediaFromPost(post) {
    const d = post.data;
    if (d.stickied || d.is_self) return [];
    const results = [];
    if (d.gallery_data && d.media_metadata) {
        for (const item of d.gallery_data.items) {
            const meta = d.media_metadata[item.media_id]; if (!meta) continue;
            const mime = meta.m || "";
            if (mime.startsWith("image/gif")) { const url = `https://i.redd.it/${meta.id}.gif`; results.push({ url, type:"gif", key:dedupeKey(url) }); }
            else if (mime.startsWith("video/")) { const src = meta.s; if (src?.mp4) { const url = src.mp4.replace(/&amp;/g,"&"); results.push({ url, type:"mp4", key:dedupeKey(url) }); } }
            else if (mime.startsWith("image/")) { const ext = mime.split("/")[1]||"jpg"; const url = `https://i.redd.it/${meta.id}.${ext}`; results.push({ url, type:detectType(url), key:dedupeKey(url) }); }
        }
        return results;
    }
    const rv = d.media?.reddit_video || d.secure_media?.reddit_video;
    if (rv?.fallback_url) { const url = rv.fallback_url.replace(/&amp;/g,"&").split("?")[0]; results.push({ url, type:"mp4", key:dedupeKey(url), isRedditVideo:true }); return results; }
    if (d.crosspost_parent_list?.length > 0) { const p = extractMediaFromPost({ data: d.crosspost_parent_list[0] }); if (p.length > 0) return p; }
    const postUrl = (d.url||"").replace(/&amp;/g,"&").trim();
    const embedType = detectEmbedType(postUrl);
    if (embedType) { const embedSrc = getEmbedSrc(postUrl); if (embedSrc) { results.push({ url:postUrl, embedSrc, embedType, type:"gif", key:dedupeKey(postUrl), isEmbed:true, width:d.media_embed?.width||640, height:d.media_embed?.height||480 }); return results; } }
    const embed = d.secure_media_embed || d.media_embed;
    if (embed?.content) { const srcMatch = embed.content.replace(/&amp;/g,"&").match(/src=["']([^"']+)["']/i); if (srcMatch) { const embedSrc = srcMatch[1]; const eType = detectEmbedType(embedSrc); results.push({ url:embedSrc, embedSrc, embedType:eType||"iframe", type:"gif", key:dedupeKey(embedSrc), isEmbed:true, width:embed.width||640, height:embed.height||480 }); return results; } }
    if (postUrl) {
        let url = resolveImgur(postUrl);
        const prev = d.preview?.images?.[0];
        const candidates = new Map();
        if (isDirectMedia(url)) candidates.set(url, scoreUrl(url));
        if (prev?.variants?.mp4?.source?.url) { const u = prev.variants.mp4.source.url.replace(/&amp;/g,"&").split("?")[0]; candidates.set(u, scoreUrl(u)); }
        if (prev?.variants?.gif?.source?.url) { const u = prev.variants.gif.source.url.replace(/&amp;/g,"&").split("?")[0]; candidates.set(u, scoreUrl(u)); }
        if (prev?.source?.url) { const u = prev.source.url.replace(/&amp;/g,"&").split("?")[0]; if (isDirectMedia(u)) candidates.set(u, scoreUrl(u)); }
        if (candidates.size > 0) { let best=url, bestScore=-1; candidates.forEach((s,u)=>{ if(s>bestScore){bestScore=s;best=u;} }); results.push({ url:best, type:detectType(best), key:dedupeKey(best) }); }
    }
    return results;
}

function passesRedditFilter(item, filter) {
    if (filter === "all") return true;
    if (filter === "long30") return item.type==="mp4"||item.type==="webm"||item.type==="gif";
    const url=(item.url||"").toLowerCase(), clean=url.split("?")[0].split("#")[0], type=item.type||detectType(item.url||""), embed=(item.embedType||"").toLowerCase();
    switch(filter) {
        case "gif":  return type==="gif"||type==="apng"||clean.endsWith(".gif")||clean.endsWith(".gifv")||embed==="redgifs"||embed==="gfycat"||embed==="tenor"||embed==="giphy";
        case "mp4":  return type==="mp4"||clean.endsWith(".mp4")||clean.endsWith(".mov")||url.includes("v.redd.it")||!!item.isRedditVideo;
        case "webm": return type==="webm"||clean.endsWith(".webm");
        case "webp": return type==="webp"||clean.endsWith(".webp");
        case "img":  return clean.endsWith(".png")||clean.endsWith(".jpg")||clean.endsWith(".jpeg")||type==="png"||type==="jpg";
        default: return true;
    }
}

async function loadRedditPage(sub, sort, after) {
    let url = `https://old.reddit.com/r/${sub}/${sort}.json?limit=100&raw_json=1`;
    if (after) url += `&after=${encodeURIComponent(after)}`;
    const data = await redditFetch(url);
    const posts = data?.data?.children || [];
    const next  = data?.data?.after    || null;
    const items = [];
    for (const post of posts) items.push(...extractMediaFromPost(post));
    return { items, nextAfter: next };
}

async function fetchSessionPage(session) {
    if (session.loading || session.done) return;
    session.loading = true;
    session.errorCount = session.errorCount || 0;
    try {
        const { items, nextAfter } = await loadRedditPage(session.sub, session.sort, session.after);
        for (const item of items) {
            if (!passesRedditFilter(item, session.filter)) continue;
            const key = item.key || dedupeKey(item.url);
            if (session.seenKeys.has(key)) continue;
            session.seenKeys.add(key); session.queue.push(item);
        }
        session.after = nextAfter;
        if (!nextAfter) session.done = true;
        session.errorCount = 0;
        if (session.queue.length === 0 && !session.hadResults) showRedditError(session.sub, "No media found matching filter");
        else session.hadResults = true;
    } catch(e) {
        session.errorCount++;
        showRedditError(session.sub, e.message);
        if (session.errorCount >= 3) session.done = true;
    }
    session.loading = false;
}

function showRedditError(sub, message) {
    const existing = redditGallery.querySelector(`[data-error-sub="r/${sub}"]`); if (existing) existing.remove();
    const card = document.createElement("div"); card.className = "card"; card.dataset.errorSub = `r/${sub}`;
    card.style.cssText = "padding:18px;display:flex;flex-direction:column;gap:8px;";
    card.innerHTML = `<div style="font-weight:700;color:var(--danger);">⚠️ r/${sub}</div><div style="font-size:.78rem;color:var(--muted);word-break:break-all;">${message}</div><button class="btn btn-warning" style="font-size:.75rem;padding:5px 10px;" onclick="this.closest('[data-error-sub]').remove()">Dismiss</button>`;
    redditGallery.insertBefore(card, redditGallery.firstChild);
}

async function pullItems(n) {
    await Promise.all(redditSessions.map(s => { if (s.queue.length < 5 && !s.loading && !s.done) return fetchSessionPage(s); return Promise.resolve(); }));
    const taken = []; let attempts = 0, maxAttempts = n * Math.max(redditSessions.length,1) * 4;
    while (taken.length < n && attempts < maxAttempts) {
        attempts++;
        if (redditSessions.length === 0) break;
        const idx = redditSessionIndex % redditSessions.length;
        const session = redditSessions[idx];
        redditSessionIndex = (redditSessionIndex+1) % redditSessions.length;
        if (session.queue.length > 0) {
            const item = session.queue.shift();
            const key  = item.key || dedupeKey(item.url);
            if (redditShownUrls.has(key)) continue;
            redditShownUrls.add(key); taken.push({ item, sub: session.sub });
            if (session.queue.length < 10 && !session.loading && !session.done) fetchSessionPage(session);
        } else if (!session.loading && !session.done) { await fetchSessionPage(session); }
    }
    return taken;
}

let pickedSubs = [];
function injectRedditUI() {
    const inputRow = document.querySelector("#tab-reddit .reddit-input-row");
    if (inputRow && !el("redditBatchSize")) {
        const bw = document.createElement("div"); bw.style.cssText = "display:flex;align-items:center;gap:6px;";
        bw.innerHTML = `<label style="font-size:.8rem;white-space:nowrap;color:var(--muted);">Batch</label><input type="number" id="redditBatchSize" value="10" min="1" max="200" style="width:62px;padding:6px 8px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:.85rem;">`;
        inputRow.appendChild(bw);
    }
    const ctrl = document.querySelector("#tab-reddit .reddit-controls");
    if (ctrl && !el("pickedSubsList")) {
        const pw = document.createElement("div"); pw.id = "pickedSubsList"; pw.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;";
        const sd = el("savedSubs"); if (sd) ctrl.insertBefore(pw, sd); else ctrl.appendChild(pw);
    }
}
function renderPickedSubs() {
    const wrap = el("pickedSubsList"); if (!wrap) return; wrap.innerHTML = "";
    pickedSubs.forEach(sub => {
        const chip = document.createElement("div"); chip.style.cssText = "display:flex;align-items:center;gap:5px;padding:4px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;font-size:.8rem;";
        chip.innerHTML = `r/${sub} <span style="cursor:pointer;color:#ed4245;font-weight:700;">✕</span>`;
        chip.querySelector("span").onclick = () => { pickedSubs = pickedSubs.filter(s=>s!==sub); renderPickedSubs(); };
        wrap.appendChild(chip);
    });
}
function addPickedSub(sub) { sub = sub.trim().replace(/^r\//i,""); if (!sub) return; if (pickedSubs.includes(sub)) { showToast(`r/${sub} already added`,"info"); return; } pickedSubs.push(sub); renderPickedSubs(); }

async function doRedditLoad() {
    try { showToast("Getting Reddit token...", "info", 3000); await getRedditToken(); }
    catch(e) { showToast("Reddit auth failed: " + e.message, "error", 6000); return; }
    let subsToLoad = [...pickedSubs];
    savedSubs.forEach(s => { if (!subsToLoad.includes(s)) subsToLoad.push(s); });
    const inputVal = subredditInput.value.trim().replace(/^r\//i,"");
    if (inputVal && !subsToLoad.includes(inputVal)) subsToLoad.push(inputVal);
    if (subsToLoad.length === 0) { showToast("Enter or pick a subreddit","error"); return; }
    const sort = redditSortEl.value, filter = redditFilterEl.value;
    redditLoaded = 0; redditSessionIndex = 0; redditTotalAdded = 0; redditShownUrls.clear();
    redditSessions = subsToLoad.map(sub => ({ sub, sort, filter, after:null, seenKeys:new Set(), loading:false, done:false, queue:[], errorCount:0, hadResults:false }));
    redditStats.style.display = "";
    redditStatSub.textContent = subsToLoad.map(s=>`r/${s}`).join(" + ");
    redditStatCount.textContent = "Loading..."; redditStatAdded.textContent = "";
    redditLoadMoreWrap.classList.remove("hidden"); redditLoadingEl.style.display = "flex";
    redditGallery.querySelectorAll("[data-error-sub]").forEach(c=>c.remove());
    await Promise.all(redditSessions.map(s => fetchSessionPage(s)));
    redditLoadingEl.style.display = "none";
    if (redditSessions.every(s => s.done && s.queue.length === 0)) { redditStatCount.textContent = "Failed to load"; showToast("All subreddits failed","error",6000); return; }
    await renderNextRedditBatch();
}

async function renderNextRedditBatch() {
    const batchInput = el("redditBatchSize");
    const n = batchInput ? Math.max(1, parseInt(batchInput.value)||10) : 10;
    redditLoadingEl.style.display = "flex";
    const pulled = await pullItems(n);
    redditLoadingEl.style.display = "none";
    if (pulled.length === 0) { if (redditSessions.every(s=>s.done&&s.queue.length===0)) { redditLoadMoreWrap.classList.add("hidden"); showToast("All subreddits exhausted!","success",4000); } return; }
    redditLoaded += pulled.length;
    if (saveToVaultEnabled) {
        const urls = pulled.filter(p=>!p.item.isEmbed).map(p=>p.item.url);
        if (urls.length > 0) { const added = await addGifsToDB(urls,"reddit"); gifs=await getAllGifs(); buildFuseIndex(); redditTotalAdded+=added; if(added>0){applyFilters();updateStats();} }
    }
    redditStatCount.textContent = `${redditLoaded} loaded`;
    redditStatAdded.textContent = saveToVaultEnabled ? `${redditTotalAdded} added to vault` : "(saving disabled)";
    scheduleRender(() => { const frag=document.createDocumentFragment(); pulled.forEach(({item,sub})=>frag.appendChild(buildRedditCard(item,sub))); redditGallery.appendChild(frag); });
    const allDone = redditSessions.every(s=>s.done&&s.queue.length===0);
    if (allDone) { redditLoadMoreWrap.classList.add("hidden"); showToast(`Done! ${redditLoaded} items`,"success",4000); }
    else redditLoadMoreWrap.classList.remove("hidden");
}

redditClearBtn.onclick = () => {
    redditGallery.querySelectorAll("video,iframe,img").forEach(e2=>mediaObserver.unobserve(e2));
    redditGallery.innerHTML=""; redditShownUrls.clear();
    redditLoaded=0; redditTotalAdded=0; redditSessions=[]; redditSessionIndex=0;
    activeVideoSet.clear(); activeGifSet.clear();
    redditLoadMoreWrap.classList.add("hidden"); redditStats.style.display="none";
    showToast("Reddit gallery cleared","info");
};
redditLoadBtn.onclick = () => doRedditLoad();
subredditInput.onkeydown = e => { if (e.key==="Enter") { const v=subredditInput.value.trim().replace(/^r\//i,""); if(v){addPickedSub(v);subredditInput.value="";} } };
redditAddBtn.onclick = () => {
    const sub = subredditInput.value.trim().replace(/^r\//i,"");
    if (!sub) { showToast("Enter a subreddit","error"); return; }
    if (savedSubs.includes(sub)) { showToast("Already saved","info"); return; }
    savedSubs.push(sub); localStorage.setItem("gif_vault_subs",JSON.stringify(savedSubs)); renderSavedSubs(); showToast(`r/${sub} saved!`,"success");
};
function renderSavedSubs() {
    savedSubsEl.innerHTML = "";
    savedSubs.forEach(sub => {
        const chip = document.createElement("div"); chip.className = "sub-chip";
        chip.innerHTML = `r/${sub} <span class="remove-sub">✕</span>`;
        chip.onclick = e => { if(e.target.classList.contains("remove-sub")){savedSubs=savedSubs.filter(s=>s!==sub);localStorage.setItem("gif_vault_subs",JSON.stringify(savedSubs));renderSavedSubs();return;} addPickedSub(sub); showToast(`r/${sub} added to queue`,"success"); };
        savedSubsEl.appendChild(chip);
    });
}
const redditObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting && redditSessions.length>0 && redditSessions.some(s=>!s.done||s.queue.length>0)) renderNextRedditBatch(); });
}, { threshold: 0.1 });
if (redditLoadMoreWrap) redditObserver.observe(redditLoadMoreWrap);
viewMasonryBtn.onclick = () => { redditGallery.className="gallery reddit-gallery masonry-mode"; viewMasonryBtn.classList.add("active"); viewGridBtn.classList.remove("active"); };
viewGridBtn.onclick    = () => { redditGallery.className="gallery reddit-gallery grid-mode-reddit"; viewGridBtn.classList.add("active"); viewMasonryBtn.classList.remove("active"); };

function buildRedditCard(item, sub) {
    const { url, type, isEmbed, embedSrc, embedType, isRedditVideo } = item;
    const card = document.createElement("div"); card.className="card reddit-card"; card.dataset.url=url;
    const badge = document.createElement("div"); badge.className=`card-source-badge type-${type}`; badge.textContent=type.toUpperCase();
    const subBadge = document.createElement("div"); subBadge.className="reddit-sub-badge"; subBadge.textContent=`r/${sub}`;
    let mediaEl;
    if (isEmbed && embedSrc) {
        const wrapper=document.createElement("div"); wrapper.className="embed-wrapper";
        const iframe=document.createElement("iframe"); iframe.dataset.src=embedSrc; iframe.src="";
        iframe.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;border:none;display:block;";
        iframe.setAttribute("allowfullscreen","true"); iframe.setAttribute("allow","autoplay; fullscreen; encrypted-media; picture-in-picture");
        if (embedType==="redgifs") iframe.setAttribute("sandbox","allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox");
        wrapper.appendChild(iframe); mediaObserver.observe(iframe); mediaEl=wrapper;
    } else if (type==="mp4"||type==="webm"||isRedditVideo) {
        const wrapper=document.createElement("div"); wrapper.className="video-wrapper";
        const vid=document.createElement("video"); vid.style.cssText=`width:100%;display:block;max-height:400px;object-fit:${fitMode};`;
        vid.controls=true; vid.loop=true; vid.muted=true; vid.playsInline=true; vid.preload="metadata"; vid.dataset.src=url;
        vid.onerror=()=>{ wrapper.innerHTML=`<div style="padding:16px;color:var(--muted);font-size:.75rem;text-align:center;min-height:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;"><span>⚠️ Video unavailable</span><a href="${url}" target="_blank" style="color:var(--accent);font-size:.7rem;">Open ↗</a></div>`; };
        const unmuteBtn=document.createElement("button"); unmuteBtn.className="unmute-btn"; unmuteBtn.textContent="🔇 Unmute";
        unmuteBtn.onclick=e=>{ e.stopPropagation(); vid.muted=!vid.muted; if(!vid.muted&&vid.volume===0)vid.volume=1; unmuteBtn.textContent=vid.muted?"🔇 Unmute":"🔊 Muted"; };
        wrapper.appendChild(vid); wrapper.appendChild(unmuteBtn); mediaObserver.observe(vid); mediaEl=wrapper;
    } else if (type==="gif") {
        const wrapper=document.createElement("div"); wrapper.className="img-wrapper";
        const img=document.createElement("img"); img.loading="lazy"; img.decoding="async"; img.dataset.gifSrc=url; img.src=BLANK_GIF; img.alt=type;
        img.style.cssText=`width:100%;height:auto;object-fit:${fitMode};display:block;`; img.onerror=()=>wrapper.style.display="none";
        wrapper.appendChild(img); mediaObserver.observe(img); mediaEl=wrapper;
    } else {
        const wrapper=document.createElement("div"); wrapper.className="img-wrapper";
        const img=document.createElement("img"); img.loading="lazy"; img.decoding="async"; img.dataset.lazySrc=url; img.src=BLANK_GIF; img.alt=type;
        img.style.cssText=`width:100%;height:auto;object-fit:${fitMode};display:block;`; img.onerror=()=>wrapper.style.display="none";
        wrapper.appendChild(img); mediaObserver.observe(img); mediaEl=wrapper;
    }
    card.oncontextmenu = e => { e.preventDefault(); showRedditContextMenu(e,{url,type,sub,isEmbed}); };
    card.append(badge,subBadge,mediaEl);
    return card;
}

let redditCtxTarget = null;
function showRedditContextMenu(e, data) {
    redditCtxTarget = data;
    const menu = el("redditContextMenu"); if (!menu) return;
    menu.style.left=`${Math.min(e.clientX,window.innerWidth-180)}px`;
    menu.style.top=`${Math.min(e.clientY,window.innerHeight-200)}px`;
    menu.classList.remove("hidden");
}
// ════════════════════════════════════════════════════════
// GLOBAL TAG BLACKLIST
// ════════════════════════════════════════════════════════
function renderBlacklist() {
    const wrap = el("blacklistChips"); if (!wrap) return; wrap.innerHTML = "";
    globalBlacklist.forEach(tag => {
        const chip = document.createElement("div"); chip.className="blacklist-chip";
        chip.innerHTML = `${tag} <span data-tag="${tag}">✕</span>`;
        chip.querySelector("span").onclick = () => { globalBlacklist=globalBlacklist.filter(t=>t!==tag); localStorage.setItem("gif_vault_blacklist",JSON.stringify(globalBlacklist)); renderBlacklist(); };
        wrap.appendChild(chip);
    });
}
function addToBlacklist(tag) {
    tag = tag.trim().toLowerCase().replace(/^#/,""); if (!tag) return;
    if (globalBlacklist.includes(tag)) { showToast(`"${tag}" already blacklisted`,"info"); return; }
    globalBlacklist.push(tag); localStorage.setItem("gif_vault_blacklist",JSON.stringify(globalBlacklist)); renderBlacklist(); showToast(`"${tag}" blacklisted`,"success");
}
function isBlacklisted(tags) { if (!tags||!Array.isArray(tags)) return false; return tags.some(t=>globalBlacklist.includes(t.toLowerCase())); }
function isTextBlacklisted(text) { if (!text) return false; const lower = text.toLowerCase(); return globalBlacklist.some(t => lower.includes(t)); }
function initBlacklist() {
    const input=el("blacklistInput"), addBtn=el("blacklistAddBtn");
    if (addBtn&&input) { addBtn.onclick=()=>{addToBlacklist(input.value);input.value="";}; input.onkeydown=e=>{if(e.key==="Enter"){addToBlacklist(input.value);input.value="";}}; }
    renderBlacklist();
}

// ════════════════════════════════════════════════════════
// UNIVERSAL MEDIA MODAL
// ════════════════════════════════════════════════════════
function openUniversalModal(items, index) {
    universalModalItems = items;
    universalModalIndex = Math.max(0, Math.min(index, items.length - 1));
    showUniversalModalAt(universalModalIndex);
    const uModal = el("universalModal");
    if (uModal) { uModal.classList.remove("hidden"); document.body.style.overflow = "hidden"; }
}

function showUniversalModalAt(index) {
    const uModal = el("universalModal");
    const uModalImg = el("uModalImg");
    const uModalVid = el("uModalVid");
    const uModalIndexEl = el("uModalIndexEl");
    const uModalPrev = el("uModalPrev");
    const uModalNext = el("uModalNext");
    const uModalOpen = el("uModalOpen");
    const uModalCopy = el("uModalCopy");
    const uModalDownload = el("uModalDownload");
    const uModalSave = el("uModalSave");
    const uModalTitle = el("uModalTitle");

    if (!uModal) return;
    const item = universalModalItems[index]; if (!item) return;
    universalModalIndex = index;

    const type = item.type || detectType(item.url);

    // Reset
    if (uModalImg) { uModalImg.style.display = "none"; uModalImg.src = ""; }
    if (uModalVid) { uModalVid.style.display = "none"; uModalVid.pause && uModalVid.pause(); uModalVid.src = ""; }

    if (type === "mp4" || type === "webm") {
        if (uModalVid) {
            uModalVid.style.display = "block";
            uModalVid.referrerPolicy = "origin";
            uModalVid.src = item.url;
            uModalVid.load();
            uModalVid.play().catch(()=>{});
        }
    } else {
        if (uModalImg) { uModalImg.style.display = "block"; uModalImg.referrerPolicy = "origin"; uModalImg.src = item.url; }
    }

    if (uModalIndexEl) uModalIndexEl.textContent = `${index + 1} / ${universalModalItems.length}`;
    if (uModalTitle) uModalTitle.textContent = item.source ? `[${item.source}]` : "";
    if (uModalPrev) uModalPrev.style.opacity = index === 0 ? "0.3" : "1";
    if (uModalNext) uModalNext.style.opacity = index === universalModalItems.length - 1 ? "0.3" : "1";
    if (uModalOpen) uModalOpen.onclick = () => window.open(item.url, "_blank");
    if (uModalCopy) uModalCopy.onclick = () => copyUrl(item.url);
    if (uModalDownload) uModalDownload.onclick = () => { const a=document.createElement("a"); a.href=item.url; a.download=`media-${Date.now()}.${type}`; a.target="_blank"; a.click(); };
    if (uModalSave) uModalSave.onclick = async () => {
        if (!saveToVaultEnabled) { showToast("Save to Vault is OFF","info"); return; }
        const added = await addGifsToDB([item.url], item.source||"external");
        gifs = await getAllGifs(); buildFuseIndex(); updateStats();
        showToast(added > 0 ? "Saved to vault!" : "Already in vault", added > 0 ? "success" : "info");
    };
}

function closeUniversalModal() {
    const uModal = el("universalModal");
    const uModalVid = el("uModalVid");
    const uModalImg = el("uModalImg");
    if (!uModal) return;
    uModal.classList.add("hidden");
    if (uModalVid) { uModalVid.pause && uModalVid.pause(); uModalVid.src = ""; }
    if (uModalImg) uModalImg.src = "";
    document.body.style.overflow = "";
}

function initUniversalModal() {
    const uModalClose    = el("uModalClose");
    const uModalBackdrop = el("uModalBackdrop");
    const uModalPrev     = el("uModalPrev");
    const uModalNext     = el("uModalNext");
    if (uModalClose)    uModalClose.onclick    = closeUniversalModal;
    if (uModalBackdrop) uModalBackdrop.onclick = closeUniversalModal;
    if (uModalPrev) uModalPrev.onclick = () => { if (universalModalIndex > 0) showUniversalModalAt(universalModalIndex - 1); };
    if (uModalNext) uModalNext.onclick = () => { if (universalModalIndex < universalModalItems.length - 1) showUniversalModalAt(universalModalIndex + 1); };
}

// ════════════════════════════════════════════════════════
// DANBOORU — with User-Agent + API key, CORS proxy fallback
// ════════════════════════════════════════════════════════
async function danbooruFetch(tags, page, sort, rating, limit=20) {
    const sortTag = sort === "score_desc" || sort === "score" ? "order:score"     :
                    sort === "score_asc"                      ? "order:score_asc" :
                    sort === "date_desc" || sort === "date"   ? "order:id_desc"   :
                    sort === "date_asc"  || sort === "asc"    ? "order:id"        :
                    sort === "popular"                        ? "order:rank"      :
                    sort === "random"                         ? "order:random"    : "order:score";

    let ratingTag = "";
    if (rating === "g" || rating === "safe")              ratingTag = "rating:g";
    else if (rating === "s" || rating === "sensitive")    ratingTag = "rating:s";
    else if (rating === "q" || rating === "questionable") ratingTag = "rating:q";
    else if (rating === "e" || rating === "explicit")     ratingTag = "rating:e";

    const allTags = [tags, sortTag, ratingTag].filter(Boolean).join(" ").trim();
    const params  = new URLSearchParams({ page: String(page), limit: String(limit), login: DANBOORU_USER, api_key: DANBOORU_KEY });
    const directUrl = `https://danbooru.donmai.us/posts.json?${params}&tags=${encodeURIComponent(allTags)}`;

    const res = await fetch(directUrl, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) throw new Error(`Danbooru HTTP ${res.status}`);
    return await res.json();
}

function normalizeDanbooruPost(post) {
    const url = post.file_url || post.large_file_url || post.preview_file_url;
    if (!url) return null;
    const tags = (post.tag_string||"").split(" ").filter(Boolean);
    if (isBlacklisted(tags)) return null;
    return { url, type:detectType(url), tags, id:post.id, score:post.score, source:"danbooru" };
}

async function loadDanbooru(reset=false) {
    const state=booruState.danbooru;
    const tagsEl=el("danbooruTags"), sortEl=el("danbooruSort"), filterEl=el("danbooruFilter"), ratingEl=el("danbooruRating"), gallery2=el("danbooruGallery");
    if (!gallery2) return;
    if (reset) {
        state.page=1; state.done=false; state.shownIds=new Set();
        state.currentTags=tagsEl?.value.trim()||"";
        state.currentSort=sortEl?.value||"score";
        state.currentFilter=filterEl?.value||"all";
        state.currentRating=ratingEl?.value||"all";
        gallery2.innerHTML="";
        el("danbooruLoadMore")?.classList.add("hidden");
        window.scrollTo({top: gallery2.offsetTop - 80, behavior: "smooth"});
    }
    if (state.loading||state.done) return;
    state.loading=true;
    const loadingEl=el("danbooruLoading"); if(loadingEl) loadingEl.style.display="flex";
    const lmBtn=el("danbooruLoadMoreBtn"); if(lmBtn) lmBtn.style.display="none";
    try {
        const limit = Math.max(1, parseInt(el("danbooruLimit")?.value) || 20);
        const posts = await danbooruFetch(state.currentTags, state.page, state.currentSort, state.currentRating, limit);
        const valid  = posts.map(normalizeDanbooruPost).filter(p=>p&&!state.shownIds.has(p.id)&&passesTypeFilter(p.url,state.currentFilter));
        valid.forEach(p=>state.shownIds.add(p.id));
        if (posts.length < limit) state.done=true;
        state.page++;
        const startIdx = gallery2.querySelectorAll(".card").length;
        const frag=document.createDocumentFragment();
        valid.forEach((p,i)=>frag.appendChild(buildBooruCard(p,"danbooru",startIdx+i)));
        gallery2.appendChild(frag);
        updateBooruModalItems("danbooru", gallery2);
        if (saveToVaultEnabled&&valid.length>0) { await addGifsToDB(valid.map(p=>p.url),"danbooru"); gifs=await getAllGifs(); buildFuseIndex(); applyFilters(); updateStats(); }
        updateBooruStats("danbooru",gallery2.querySelectorAll(".card").length);
        if (state.done) { el("danbooruLoadMore")?.classList.add("hidden"); showToast("Danbooru: all loaded","success",3000); }
        else { el("danbooruLoadMore")?.classList.remove("hidden"); if(lmBtn) lmBtn.style.display=""; }
        if (valid.length === 0 && !state.done) showBooruError("danbooruGallery","Danbooru","No results for this query/filter combo.");
    } catch(e) { console.error("[Danbooru]",e.message); showBooruError("danbooruGallery","Danbooru",e.message); }
    state.loading=false; if(loadingEl) loadingEl.style.display="none";
}

// ════════════════════════════════════════════════════════
// GELBOORU — direct fetch with User-Agent, JSONP fallback
// ════════════════════════════════════════════════════════
function buildGelbooruUrl(tags, pid, sort, rating) {
    const isScore  = sort === "score_desc" || sort === "score_asc" || sort === "popular" || sort === "score";
    const sortField = isScore ? "score" : "id";
    const sortDir   = sort === "score_asc" || sort === "date_asc" || sort === "asc" ? "asc" : "desc";

    let tagStr = (tags || "").trim();
    tagStr += (tagStr ? " " : "") + `sort:${sortField}:${sortDir}`;

    if (rating === "general" || rating === "safe")  tagStr += " rating:general";
    else if (rating === "sensitive")                tagStr += " rating:sensitive";
    else if (rating === "questionable")             tagStr += " rating:questionable";
    else if (rating === "explicit")                 tagStr += " rating:explicit";

    return tagStr.trim();
}

async function gelbooruDirectFetch(tags, pid, sort, rating, limit=20) {
    const tagStr = buildGelbooruUrl(tags, pid, sort, rating);
    const params = new URLSearchParams({
        page: "dapi", s: "post", q: "index", json: "1",
        pid: String(pid), limit: String(limit),
        api_key: GELBOORU_KEY, user_id: GELBOORU_UID,
        tags: tagStr
    });
    const url = `https://gelbooru.com/index.php?${params}`;
    const res = await fetch(url, {
        headers: { "User-Agent": "GifVault/1.0", "Accept": "application/json" },
        signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) throw new Error(`Gelbooru HTTP ${res.status}`);
    const data = await res.json();
    return data?.post || [];
}

function gelbooruJsonp(tags, pid, sort, rating) {
    return new Promise((resolve, reject) => {
        const cbName = `_gb_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const timer = setTimeout(() => {
            delete window[cbName];
            const s = document.getElementById(cbName); if (s) s.remove();
            reject(new Error("Gelbooru JSONP timeout"));
        }, 15000);
        window[cbName] = (data) => {
            clearTimeout(timer); delete window[cbName];
            const s = document.getElementById(cbName); if (s) s.remove();
            resolve(data?.post || []);
        };
        const tagStr = buildGelbooruUrl(tags, pid, sort, rating);
        const params = new URLSearchParams({
            page: "dapi", s: "post", q: "index", json: "1",
            pid: String(pid), limit: "40",
            api_key: GELBOORU_KEY, user_id: GELBOORU_UID,
            tags: tagStr, callback: cbName
        });
        const script = document.createElement("script");
        script.id  = cbName;
        script.src = `https://gelbooru.com/index.php?${params}`;
        script.onerror = () => { clearTimeout(timer); delete window[cbName]; script.remove(); reject(new Error("Gelbooru JSONP script error")); };
        document.head.appendChild(script);
    });
}

async function gelbooruFetch(tags, pid, sort, rating, limit=20) {
    return await gelbooruDirectFetch(tags, pid, sort, rating, limit);
}

function normalizeGelbooruPost(post) {
    const url = post.file_url; if (!url) return null;
    const tags = (post.tags||"").split(" ").filter(Boolean);
    if (isBlacklisted(tags)) return null;
    return { url, type:detectType(url), tags, id:post.id, score:post.score, source:"gelbooru" };
}

async function loadGelbooru(reset=false) {
    const state=booruState.gelbooru;
    const tagsEl=el("gelbooruTags"), sortEl=el("gelbooruSort"), filterEl=el("gelbooruFilter"), ratingEl=el("gelbooruRating"), gallery2=el("gelbooruGallery");
    if (!gallery2) return;
    if (reset) {
        state.page=0; state.done=false; state.shownIds=new Set();
        state.currentTags=tagsEl?.value.trim()||"";
        state.currentSort=sortEl?.value||"score";
        state.currentFilter=filterEl?.value||"all";
        state.currentRating=ratingEl?.value||"all";
        gallery2.innerHTML="";
        el("gelbooruLoadMore")?.classList.add("hidden");
        window.scrollTo({top: gallery2.offsetTop - 80, behavior: "smooth"});
    }
    if (state.loading||state.done) return;
    state.loading=true;
    const loadingEl=el("gelbooruLoading"); if(loadingEl) loadingEl.style.display="flex";
    try {
        const limit = Math.max(1, parseInt(el("gelbooruLimit")?.value) || 20);
        const posts = await gelbooruFetch(state.currentTags, state.page, state.currentSort, state.currentRating, limit);
        const valid  = posts.map(normalizeGelbooruPost).filter(p=>p&&!state.shownIds.has(p.id)&&passesTypeFilter(p.url,state.currentFilter));
        valid.forEach(p=>state.shownIds.add(p.id));
        if (posts.length < limit) state.done=true;
        state.page++;
        const startIdx=gallery2.querySelectorAll(".card").length;
        const frag=document.createDocumentFragment();
        valid.forEach((p,i)=>frag.appendChild(buildBooruCard(p,"gelbooru",startIdx+i)));
        gallery2.appendChild(frag);
        updateBooruModalItems("gelbooru",gallery2);
        if (saveToVaultEnabled&&valid.length>0) { await addGifsToDB(valid.map(p=>p.url),"gelbooru"); gifs=await getAllGifs(); buildFuseIndex(); applyFilters(); updateStats(); }
        updateBooruStats("gelbooru",gallery2.querySelectorAll(".card").length);
        if (state.done) { el("gelbooruLoadMore")?.classList.add("hidden"); showToast("Gelbooru: all loaded","success",3000); }
        else el("gelbooruLoadMore")?.classList.remove("hidden");
    } catch(e) { console.error("[Gelbooru]",e.message); showBooruError("gelbooruGallery","Gelbooru",e.message); }
    state.loading=false; if(loadingEl) loadingEl.style.display="none";
}

// ════════════════════════════════════════════════════════
// RULE34
// ════════════════════════════════════════════════════════
async function rule34Fetch(tags, page, sort, rating, limit=20) {
    const sortTag = sort === "score_desc" || sort === "score"   ? "sort:score:desc" :
                    sort === "score_asc"                         ? "sort:score:asc"  :
                    sort === "date_desc"                         ? "sort:id:desc"    :
                    sort === "date_asc"  || sort === "asc"       ? "sort:id:asc"     :
                    sort === "popular"                           ? "sort:score:desc" : "sort:id:desc";

    let ratingTag = "";
    if (rating === "safe")          ratingTag = "rating:general";
    else if (rating === "questionable") ratingTag = "rating:questionable";
    else if (rating === "explicit") ratingTag = "rating:explicit";

    const allTags = [tags, sortTag, ratingTag].filter(Boolean).join(" ");
    const params  = new URLSearchParams({ page:"dapi", s:"post", q:"index", json:"1", pid:String(page), limit:String(limit), api_key:R34_KEY, user_id:R34_UID });
    const url = `https://api.rule34.xxx/index.php?${params}&tags=${encodeURIComponent(allTags)}`;

    const res = await fetch(url, { headers: { "Accept": "application/json" }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`Rule34 HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.post||[]);
}

function normalizeRule34Post(post) {
    const url = post.file_url; if (!url) return null;
    const tags = (post.tags||"").split(" ").filter(Boolean);
    if (isBlacklisted(tags)) return null;
    return { url, type:detectType(url), tags, id:post.id, score:post.score, source:"rule34" };
}

async function loadRule34(reset=false) {
    const state=booruState.rule34;
    const tagsEl=el("rule34Tags"), sortEl=el("rule34Sort"), filterEl=el("rule34Filter"), ratingEl=el("rule34Rating"), gallery2=el("rule34Gallery");
    if (!gallery2) return;
    if (reset) {
        state.page=0; state.done=false; state.shownIds=new Set();
        state.currentTags=tagsEl?.value.trim()||"";
        state.currentSort=sortEl?.value||"score";
        state.currentFilter=filterEl?.value||"all";
        state.currentRating=ratingEl?.value||"all";
        gallery2.innerHTML="";
        el("rule34LoadMore")?.classList.add("hidden");
        window.scrollTo({top: gallery2.offsetTop - 80, behavior: "smooth"});
    }
    if (state.loading||state.done) return;
    state.loading=true;
    const loadingEl=el("rule34Loading"); if(loadingEl) loadingEl.style.display="flex";
    try {
        const limit = Math.max(1, parseInt(el("rule34Limit")?.value) || 20);
        const posts = await rule34Fetch(state.currentTags, state.page, state.currentSort, state.currentRating, limit);
        const valid  = posts.map(normalizeRule34Post).filter(p=>p&&!state.shownIds.has(p.id)&&passesTypeFilter(p.url,state.currentFilter));
        valid.forEach(p=>state.shownIds.add(p.id));
        if (posts.length < limit) state.done=true;
        state.page++;
        const startIdx=gallery2.querySelectorAll(".card").length;
        const frag=document.createDocumentFragment();
        valid.forEach((p,i)=>frag.appendChild(buildBooruCard(p,"rule34",startIdx+i)));
        gallery2.appendChild(frag);
        updateBooruModalItems("rule34",gallery2);
        if (saveToVaultEnabled&&valid.length>0) { await addGifsToDB(valid.map(p=>p.url),"rule34"); gifs=await getAllGifs(); buildFuseIndex(); applyFilters(); updateStats(); }
        updateBooruStats("rule34",gallery2.querySelectorAll(".card").length);
        if (state.done) { el("rule34LoadMore")?.classList.add("hidden"); showToast("Rule34: all loaded","success",3000); }
        else el("rule34LoadMore")?.classList.remove("hidden");
    } catch(e) { console.error("[Rule34]",e.message); showBooruError("rule34Gallery","Rule34",e.message); }
    state.loading=false; if(loadingEl) loadingEl.style.display="none";
}

// ════════════════════════════════════════════════════════
// BOORU SHARED
// ════════════════════════════════════════════════════════
function passesTypeFilter(url, filter) {
    if (filter==="all") return true;
    const type = detectType(url);
    switch(filter) {
        case "gif":   return type==="gif";
        case "webm":  return type==="webm";
        case "mp4":   return type==="mp4";
        case "video": return type==="mp4"||type==="webm"||type==="gif";
        case "image": return type==="jpg"||type==="png"||type==="webp"||type==="jpeg"||type==="avif";
        case "png":   return type==="png";
        case "jpg":   return type==="jpg";
        case "webp":  return type==="webp";
        case "animated": return type==="gif"||type==="webm"||type==="mp4"||type==="apng";
        default: return true;
    }
}

function showBooruError(galleryId, name, message) {
    const g=el(galleryId); if(!g) return;
    const existing=g.querySelector(".booru-error-card"); if(existing) existing.remove();
    const card=document.createElement("div"); card.className="card booru-error-card";
    card.style.cssText="padding:18px;display:flex;flex-direction:column;gap:8px;";
    card.innerHTML=`<div style="font-weight:700;color:var(--danger);">⚠️ ${name} Error</div><div style="font-size:.78rem;color:var(--muted);word-break:break-all;">${message}</div><div style="font-size:.7rem;color:var(--muted);">Check console (F12)</div><button class="btn btn-warning" style="font-size:.75rem;padding:5px 10px;" onclick="this.closest('.booru-error-card').remove()">Dismiss</button>`;
    g.insertBefore(card,g.firstChild);
}
function updateBooruStats(which, count) { const e2=el(`${which}StatCount`); if(e2) e2.textContent=`${count} loaded`; }

const booruModalItems = { danbooru:[], gelbooru:[], rule34:[], bluesky:[], redgifs:[], kemono:[], coomer:[], nijie:[] };
function updateBooruModalItems(source, galleryEl) {
    booruModalItems[source] = [];
    galleryEl.querySelectorAll(".card[data-url]").forEach(card => {
        booruModalItems[source].push({ url: card.dataset.url, type: detectType(card.dataset.url), source });
    });
}

function buildBooruCard(post, source, globalIndex) {
    const { url, type, tags, score } = post;
    const card=document.createElement("div"); card.className=`card booru-card ${source}-card`; card.dataset.url=url; card.dataset.source=source;
    const badge=document.createElement("div"); badge.className=`card-source-badge type-${type}`; badge.textContent=type.toUpperCase();
    const srcBadge=document.createElement("div"); srcBadge.className="booru-source-badge"; srcBadge.textContent=source;
    if (score!=null) { const sb=document.createElement("div"); sb.className="booru-score-badge"; sb.textContent=`★ ${score}`; card.appendChild(sb); }
    let mediaEl;
    if (type==="mp4"||type==="webm") {
        const wrapper=document.createElement("div"); wrapper.className="video-wrapper";
        const vid=document.createElement("video"); vid.style.cssText=`width:100%;display:block;max-height:400px;object-fit:${fitMode};`;
        vid.controls=true; vid.loop=true; vid.muted=true; vid.playsInline=true; vid.preload="metadata"; vid.referrerPolicy="origin";
        vid.src=url; vid.load();
        vid.onerror=()=>{ wrapper.style.opacity="0.4"; };
        const unmuteBtn=document.createElement("button"); unmuteBtn.className="unmute-btn"; unmuteBtn.textContent="🔇 Unmute";
        unmuteBtn.onclick=e=>{ e.stopPropagation(); vid.muted=!vid.muted; if(!vid.muted&&vid.volume===0)vid.volume=1; unmuteBtn.textContent=vid.muted?"🔇 Unmute":"🔊 Muted"; };
        wrapper.appendChild(vid); wrapper.appendChild(unmuteBtn); mediaObserver.observe(vid); mediaEl=wrapper;
    } else if (type==="gif") {
        const wrapper=document.createElement("div"); wrapper.className="img-wrapper";
        const img=document.createElement("img"); img.loading="lazy"; img.decoding="async"; img.referrerPolicy="origin"; img.dataset.gifSrc=url; img.src=BLANK_GIF; img.alt=type;
        img.style.cssText=`width:100%;height:auto;object-fit:${fitMode};display:block;`; img.onerror=()=>wrapper.style.display="none";
        wrapper.appendChild(img); mediaObserver.observe(img); mediaEl=wrapper;
    } else {
        const wrapper=document.createElement("div"); wrapper.className="img-wrapper";
        const img=document.createElement("img"); img.decoding="async"; img.referrerPolicy="origin"; img.src=url; img.alt=type;
        img.style.cssText=`width:100%;height:auto;object-fit:${fitMode};display:block;min-height:120px;background:var(--bg2);`; img.onerror=()=>wrapper.style.display="none";
        wrapper.appendChild(img); mediaEl=wrapper;
    }
    card.onclick = (e) => {
        if (e.target.closest(".unmute-btn") || e.target.closest("video")) return;
        const items = booruModalItems[source];
        const idx = items.findIndex(i => i.url === url);
        openUniversalModal(items, idx >= 0 ? idx : 0);
    };
    if (tags&&tags.length>0) { const row=document.createElement("div"); row.className="card-tag-row"; row.innerHTML=tags.slice(0,6).map(t=>`<span class="card-tag">${t}</span>`).join(""); card.appendChild(row); }
    card.oncontextmenu=e=>{ e.preventDefault(); showBooruContextMenu(e,{url,type,source,tags}); };
    card.append(badge,srcBadge,mediaEl);
    return card;
}

let booruCtxTarget=null;
function showBooruContextMenu(e,data) { booruCtxTarget=data; const menu=el("booruContextMenu"); if(!menu)return; menu.style.left=`${Math.min(e.clientX,window.innerWidth-180)}px`; menu.style.top=`${Math.min(e.clientY,window.innerHeight-220)}px`; menu.classList.remove("hidden"); }

function initBooruControls() {
    // Danbooru
    el("danbooruLoadBtn")?.addEventListener("click",()=>loadDanbooru(true));
    el("danbooruClearBtn")?.addEventListener("click",()=>{ const g=el("danbooruGallery"); if(g){g.querySelectorAll("video,img,iframe").forEach(e2=>mediaObserver.unobserve(e2));g.innerHTML="";} booruState.danbooru=makeBooruState(); booruModalItems.danbooru=[]; el("danbooruLoadMore")?.classList.add("hidden"); showToast("Danbooru cleared","info"); });
    el("danbooruTags")?.addEventListener("keydown",e=>{ if(e.key==="Enter")loadDanbooru(true); });
    el("danbooruLoadMoreBtn")?.addEventListener("click",()=>loadDanbooru(false));

    // Gelbooru
    el("gelbooruLoadBtn")?.addEventListener("click",()=>loadGelbooru(true));
    el("gelbooruClearBtn")?.addEventListener("click",()=>{ const g=el("gelbooruGallery"); if(g){g.querySelectorAll("video,img,iframe").forEach(e2=>mediaObserver.unobserve(e2));g.innerHTML="";} booruState.gelbooru=makeBooruState(); booruModalItems.gelbooru=[]; el("gelbooruLoadMore")?.classList.add("hidden"); showToast("Gelbooru cleared","info"); });
    el("gelbooruTags")?.addEventListener("keydown",e=>{ if(e.key==="Enter")loadGelbooru(true); });

    // Rule34
    el("rule34LoadBtn")?.addEventListener("click",()=>loadRule34(true));
    el("rule34ClearBtn")?.addEventListener("click",()=>{ const g=el("rule34Gallery"); if(g){g.querySelectorAll("video,img,iframe").forEach(e2=>mediaObserver.unobserve(e2));g.innerHTML="";} booruState.rule34=makeBooruState(); booruModalItems.rule34=[]; el("rule34LoadMore")?.classList.add("hidden"); showToast("Rule34 cleared","info"); });
    el("rule34Tags")?.addEventListener("keydown",e=>{ if(e.key==="Enter")loadRule34(true); });

    // Save All Visible buttons
    ["danbooru","gelbooru","rule34"].forEach(src => {
        const btn = el(`${src}SaveAllBtn`);
        if (btn) btn.onclick = async () => {
            const gallery2 = el(`${src}Gallery`);
            if (!gallery2) return;
            const urls = [...gallery2.querySelectorAll("[data-url]")].map(c=>c.dataset.url);
            if (!urls.length) { showToast("Nothing to save","error"); return; }
            const added = await addGifsToDB(urls, src);
            gifs = await getAllGifs(); buildFuseIndex(); applyFilters(); updateStats();
            showToast(`Saved ${added} items to vault`,"success",4000);
        };
    });

    // Booru context menu
    document.addEventListener("click",e=>{
        const btn=e.target.closest("[data-booru-ctx]");
        const menu=el("booruContextMenu");
        if (!btn||!booruCtxTarget) { if(menu&&!menu.classList.contains("hidden")&&!menu.contains(e.target))menu.classList.add("hidden"); return; }
        const action=btn.dataset.booruCtx,{url,source,tags}=booruCtxTarget;
        if (action==="open") window.open(url,"_blank");
        if (action==="copy") copyUrl(url);
        if (action==="save") { if(!saveToVaultEnabled){showToast("Save to Vault is OFF","info");return;} addGifsToDB([url],source).then(async added=>{gifs=await getAllGifs();buildFuseIndex();updateStats();showToast(added>0?"Saved!":"Already in vault",added>0?"success":"info");}); }
        if (action==="blacklist-tag"&&tags?.length>0) { const tag=prompt("Blacklist which tag?",tags[0]); if(tag)addToBlacklist(tag); }
        if(menu)menu.classList.add("hidden"); booruCtxTarget=null;
    });

    // Auto load-more scroll
    const makeIntersect=(loaderFn,wrapperId)=>{ const wrap=el(wrapperId); if(!wrap)return; new IntersectionObserver(entries=>{ entries.forEach(entry=>{ if(entry.isIntersecting)loaderFn(false); }); },{threshold:0.1}).observe(wrap); };
    makeIntersect(loadDanbooru,"danbooruLoadMore");
    makeIntersect(loadGelbooru,"gelbooruLoadMore");
    makeIntersect(loadRule34,"rule34LoadMore");
}
// ════════════════════════════════════════════════════════
// BLUESKY
// ════════════════════════════════════════════════════════
async function bskyLogin() {
    if (bskyAccessToken) return bskyAccessToken;
    const res = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: BSKY_HANDLE, password: BSKY_PASSWORD })
    });
    if (!res.ok) { const err=await res.text(); throw new Error(`Bluesky login failed: ${res.status} ${err}`); }
    const data = await res.json();
    bskyAccessToken = data.accessJwt;
    return bskyAccessToken;
}

async function bskyFetch(query, cursor=null, limit=20) {
    const token = await bskyLogin();
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    const url = `https://bsky.social/xrpc/app.bsky.feed.searchPosts?${params}`;
    const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}` }, signal: AbortSignal.timeout(15000) });
    if (res.status === 401) { bskyAccessToken = null; const newToken = await bskyLogin(); const retry = await fetch(url, { headers: { "Authorization": `Bearer ${newToken}` }, signal: AbortSignal.timeout(15000) }); if (!retry.ok) throw new Error(`Bluesky retry HTTP ${retry.status}`); return await retry.json(); }
    if (!res.ok) throw new Error(`Bluesky HTTP ${res.status}`);
    return await res.json();
}

function extractBskyMedia(post) {
    const results=[];
    const embed=post.embed||post.record?.embed;
    if (!embed) return results;
    if (embed.$type==="app.bsky.embed.images#view"||embed.$type==="app.bsky.embed.images") {
        (embed.images||[]).forEach(img=>{ const url=img.fullsize||img.thumb||img.url; if(url) results.push({url,type:detectType(url)||"jpg"}); });
    }
    if (embed.$type==="app.bsky.embed.video#view"||embed.$type==="app.bsky.embed.video") {
        const url=embed.playlist||embed.video?.ref?.$link;
        if(url) results.push({url,type:"mp4"});
        else if(embed.thumbnail) results.push({url:embed.thumbnail,type:"jpg"});
    }
    if (embed.$type==="app.bsky.embed.recordWithMedia#view"||embed.$type==="app.bsky.embed.recordWithMedia") {
        const media=embed.media||{};
        if(media.images) media.images.forEach(img=>{ const url=img.fullsize||img.thumb; if(url) results.push({url,type:detectType(url)||"jpg"}); });
        if(media.video) { const url=media.video.playlist||media.video.thumbnail; if(url) results.push({url,type:"mp4"}); }
    }
    return results;
}

function bskyPostIsBlacklisted(post) {
    const text = (post.record?.text || post.text || "").toLowerCase();
    const tags  = (post.record?.tags || post.tags || []).map(t => t.toLowerCase());
    const author = (post.author?.handle || "").toLowerCase();
    return globalBlacklist.some(b => text.includes(b) || tags.includes(b) || author.includes(b));
}

async function loadBluesky(reset=false) {
    const state=bskyState;
    const queryEl=el("bskyQuery"), filterEl=el("bskyFilter"), gallery2=el("bskyGallery");
    if (!gallery2) return;
    if (reset) {
        state.cursor=null; state.done=false; state.shownUris=new Set();
        state.currentQuery=queryEl?.value.trim().replace(/^#/,"")||"";
        state.currentFilter=filterEl?.value||"all";
        gallery2.innerHTML=""; booruModalItems.bluesky=[];
        window.scrollTo({top: gallery2.offsetTop - 80, behavior: "smooth"});
    }
    if (!state.currentQuery) { showToast("Enter a keyword or #hashtag","error"); return; }
    if (state.loading||state.done) return;
    state.loading=true;
    const loadingEl=el("bskyLoading"); if(loadingEl) loadingEl.style.display="flex";
    const statsEl=el("bskyStats"); if(statsEl) statsEl.style.display="";
    try {
        const bskyLim = Math.max(1, parseInt(el("bskyLimit")?.value) || 20);
        const data=await bskyFetch(state.currentQuery, state.cursor, bskyLim);
        const posts=data.posts||[];
        state.cursor=data.cursor||null;
        if (!state.cursor||posts.length===0) state.done=true;
        const frag=document.createDocumentFragment();
        for (const post of posts) {
            if (bskyPostIsBlacklisted(post)) continue;
            const uri=post.uri; if(state.shownUris.has(uri))continue; state.shownUris.add(uri);
            const media=extractBskyMedia(post);
            for (const m of media) {
                if (!passesTypeFilter(m.url,state.currentFilter)) continue;
                m.source="bluesky";
                frag.appendChild(buildBskyCard(m,post));
            }
        }
        gallery2.appendChild(frag);
        updateBooruModalItems("bluesky",gallery2);
        if (saveToVaultEnabled) {
            const urls=[...gallery2.querySelectorAll("[data-url]")].map(c=>c.dataset.url);
            if(urls.length>0){await addGifsToDB(urls,"bluesky");gifs=await getAllGifs();buildFuseIndex();applyFilters();updateStats();}
        }
        const countEl=el("bskyStatCount"); if(countEl) countEl.textContent=`${gallery2.querySelectorAll(".card").length} loaded`;
        if (state.done) { el("bskyLoadMore")?.classList.add("hidden"); showToast("Bluesky: all loaded","success",3000); }
        else el("bskyLoadMore")?.classList.remove("hidden");
    } catch(e) { console.error("[Bluesky]",e.message); showBooruError("bskyGallery","Bluesky",e.message); }
    state.loading=false; if(loadingEl) loadingEl.style.display="none";
}

function buildBskyCard(media, post) {
    const {url,type}=media;
    const card=document.createElement("div"); card.className="card bsky-card"; card.dataset.url=url; card.dataset.source="bluesky";
    const badge=document.createElement("div"); badge.className=`card-source-badge type-${type}`; badge.textContent=type.toUpperCase();
    const srcBadge=document.createElement("div"); srcBadge.className="booru-source-badge bsky-badge"; srcBadge.textContent="bluesky";
    const author=post.author?.handle||""; if(author){const ab=document.createElement("div");ab.className="bsky-author-badge";ab.textContent=`@${author}`;card.appendChild(ab);}
    let mediaEl;
    if (type==="mp4"||type==="webm") {
        const wrapper=document.createElement("div"); wrapper.className="video-wrapper";
        const vid=document.createElement("video"); vid.style.cssText=`width:100%;display:block;max-height:400px;object-fit:${fitMode};`;
        vid.controls=true; vid.loop=true; vid.muted=true; vid.playsInline=true; vid.preload="metadata"; vid.dataset.src=url;
        const unmuteBtn=document.createElement("button"); unmuteBtn.className="unmute-btn"; unmuteBtn.textContent="🔇 Unmute";
        unmuteBtn.onclick=e=>{ e.stopPropagation(); vid.muted=!vid.muted; if(!vid.muted&&vid.volume===0)vid.volume=1; unmuteBtn.textContent=vid.muted?"🔇 Unmute":"🔊 Muted"; };
        wrapper.appendChild(vid); wrapper.appendChild(unmuteBtn); mediaObserver.observe(vid); mediaEl=wrapper;
    } else if (type==="gif") {
        const wrapper=document.createElement("div"); wrapper.className="img-wrapper";
        const img=document.createElement("img"); img.loading="lazy"; img.decoding="async"; img.dataset.gifSrc=url; img.src=BLANK_GIF; img.alt=type;
        img.style.cssText=`width:100%;height:auto;object-fit:${fitMode};display:block;`; img.onerror=()=>wrapper.style.display="none";
        wrapper.appendChild(img); mediaObserver.observe(img); mediaEl=wrapper;
    } else {
        const wrapper=document.createElement("div"); wrapper.className="img-wrapper";
        const img=document.createElement("img"); img.loading="lazy"; img.decoding="async"; img.dataset.lazySrc=url; img.src=BLANK_GIF; img.alt=type;
        img.style.cssText=`width:100%;height:auto;object-fit:${fitMode};display:block;`; img.onerror=()=>wrapper.style.display="none";
        wrapper.appendChild(img); mediaObserver.observe(img); mediaEl=wrapper;
    }
    card.onclick=(e)=>{ if(e.target.closest(".unmute-btn")||e.target.closest("video"))return; const items=booruModalItems.bluesky; const idx=items.findIndex(i=>i.url===url); openUniversalModal(items,idx>=0?idx:0); };
    card.oncontextmenu=e=>{ e.preventDefault(); showBskyContextMenu(e,{url,type,post}); };
    card.append(badge,srcBadge,mediaEl);
    return card;
}

let bskyCtxTarget=null;
function showBskyContextMenu(e,data){ bskyCtxTarget=data; const menu=el("bskyContextMenu"); if(!menu)return; menu.style.left=`${Math.min(e.clientX,window.innerWidth-180)}px`; menu.style.top=`${Math.min(e.clientY,window.innerHeight-200)}px`; menu.classList.remove("hidden"); }

function initBluesky() {
    el("bskyLoadBtn")?.addEventListener("click",()=>loadBluesky(true));
    el("bskyClearBtn")?.addEventListener("click",()=>{ const g=el("bskyGallery"); if(g){g.querySelectorAll("video,img").forEach(e2=>mediaObserver.unobserve(e2));g.innerHTML="";} bskyState={cursor:null,loading:false,done:false,currentQuery:"",currentFilter:"all",shownUris:new Set()}; booruModalItems.bluesky=[]; el("bskyLoadMore")?.classList.add("hidden"); const s=el("bskyStats");if(s)s.style.display="none"; showToast("Bluesky cleared","info"); });
    el("bskyLoadMore")?.addEventListener("click",()=>loadBluesky(false));
    el("bskyQuery")?.addEventListener("keydown",e=>{ if(e.key==="Enter")loadBluesky(true); });
    const lm=el("bskyLoadMore"); if(lm){ new IntersectionObserver(entries=>{ entries.forEach(entry=>{ if(entry.isIntersecting&&!bskyState.done&&bskyState.currentQuery)loadBluesky(false); }); },{threshold:0.1}).observe(lm); }

    // Save all visible
    el("bskySaveAllBtn")?.addEventListener("click", async()=>{
        const g=el("bskyGallery"); if(!g)return;
        const urls=[...g.querySelectorAll("[data-url]")].map(c=>c.dataset.url);
        if(!urls.length){showToast("Nothing to save","error");return;}
        const added=await addGifsToDB(urls,"bluesky");
        gifs=await getAllGifs();buildFuseIndex();applyFilters();updateStats();
        showToast(`Saved ${added} items`,"success",4000);
    });

    document.addEventListener("click",e=>{
        const btn=e.target.closest("[data-bsky-ctx]"); const menu=el("bskyContextMenu");
        if(!btn||!bskyCtxTarget){ if(menu&&!menu.classList.contains("hidden")&&!menu.contains(e.target))menu.classList.add("hidden"); return; }
        const action=btn.dataset.bskyCtx,{url,post}=bskyCtxTarget;
        if(action==="open")window.open(url,"_blank");
        if(action==="copy")copyUrl(url);
        if(action==="save"){ if(!saveToVaultEnabled){showToast("Save to Vault is OFF","info");return;} addGifsToDB([url],"bluesky").then(async added=>{gifs=await getAllGifs();buildFuseIndex();updateStats();showToast(added>0?"Saved!":"Already in vault",added>0?"success":"info");}); }
        if(action==="open-post"&&post?.uri){ const parts=post.uri.replace("at://","").split("/"); if(parts.length>=3)window.open(`https://bsky.app/profile/${parts[0]}/post/${parts[2]}`,"_blank"); }
        if(action==="blacklist-author"&&post?.author?.handle) addToBlacklist(post.author.handle);
        if(menu)menu.classList.add("hidden"); bskyCtxTarget=null;
    });
}

// ════════════════════════════════════════════════════════
// REDGIFS
// ════════════════════════════════════════════════════════
async function getRedgifsToken() {
    if (redgifsToken && Date.now() < redgifsTokenExpiry - 60000) return redgifsToken;
    // RedGifs uses Google/Apple OAuth — username/password auth is not available via API.
    // Guest temporary token works for all public content.
    const res = await fetch("https://api.redgifs.com/v2/auth/temporary");
    if (!res.ok) throw new Error(`RedGifs auth HTTP ${res.status}`);
    const data = await res.json();
    redgifsToken = data.token;
    redgifsTokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
    console.log("[RedGifs] Got guest token");
    return redgifsToken;
}

async function redgifsFetch(endpoint) {
    // Attempt 1: unauthenticated simple GET — no preflight, works if ACAO: * on response
    const url = `https://api.redgifs.com/v2/${endpoint}`;
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (res.ok) return await res.json();
        if (res.status === 403) throw new Error('RedGifs 403');
        // 401 means auth required — fall through to Worker with token
        if (res.status !== 401) throw new Error(`RedGifs HTTP ${res.status}`);
    } catch(e) {
        if (!e.message.includes('401') && !e.message.includes('403') && !e.message.includes('CORS') && !e.message.includes('Failed')) throw e;
    }
    // Attempt 2: via Cloudflare Worker (forwards Authorization header to RedGifs)
    const w = getWorkerUrl();
    if (!w) throw new Error('RedGifs CORS blocked. Add a Cloudflare Worker URL in Settings to fix this.');
    const token = await getRedgifsToken();
    const r2 = await fetch(`${w}?url=${encodeURIComponent(url)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(20000)
    });
    if (!r2.ok) throw new Error(`Worker RedGifs ${r2.status}`);
    return await r2.json();
}

function normalizeRedgifsItem(gif) {
    if (!gif?.urls) return null;
    const url = gif.urls.hd || gif.urls.sd || gif.urls.gif || gif.urls.thumbnail;
    if (!url) return null;
    const type = url.endsWith(".gif") ? "gif" : "mp4";
    const tags = gif.tags || [];
    if (isBlacklisted(tags)) return null;
    return { url, type, tags, id: gif.id, score: gif.likes || gif.views || 0, title: gif.title || gif.id, source: "redgifs", width: gif.width, height: gif.height };
}

async function loadRedgifs(reset=false) {
    const state = redgifsState;
    const queryEl = el("redgifsQuery"), filterEl = el("redgifsFilter"), sortEl = el("redgifsSort"), gallery2 = el("redgifsGallery");
    if (!gallery2) return;
    if (reset) {
        state.page=0; state.done=false; state.shownIds=new Set(); state.items=[];
        state.currentQuery=queryEl?.value.trim()||"";
        state.currentFilter=filterEl?.value||"all";
        state.currentSort=sortEl?.value||"trending";
        gallery2.innerHTML=""; booruModalItems.redgifs=[];
        window.scrollTo({top: gallery2.offsetTop - 80, behavior: "smooth"});
    }
    if (state.loading||state.done) return;
    state.loading=true;
    const loadingEl=el("redgifsLoading"); if(loadingEl) loadingEl.style.display="flex";
    const statsEl=el("redgifsStats"); if(statsEl) statsEl.style.display="";

    try {
        let endpoint = "";
        const page = state.page + 1;
        const order = state.currentSort === "trending" ? "trending" :
                      state.currentSort === "top"      ? "top"      :
                      state.currentSort === "latest"   ? "latest"   :
                      state.currentSort === "oldest"   ? "oldest"   :
                      state.currentSort === "views"    ? "views"    :
                      state.currentSort === "likes"    ? "likes"    :
                      state.currentSort === "newest"   ? "new"      : "trending";

        const limit = Math.max(1, parseInt(el("redgifsLimit")?.value) || 20);
        if (state.currentQuery) {
            endpoint = `gifs/search?search_text=${encodeURIComponent(state.currentQuery)}&order=${order}&count=${limit}&page=${page}`;
        } else {
            endpoint = `gifs/trending?order=${order}&count=${limit}&page=${page}`;
        }

        const data = await redgifsFetch(endpoint);
        const items = (data.gifs || data.items || []).map(normalizeRedgifsItem).filter(p => p && !state.shownIds.has(p.id) && passesTypeFilter(p.url, state.currentFilter));
        items.forEach(p => { state.shownIds.add(p.id); state.items.push(p); });

        if ((data.gifs||data.items||[]).length < limit) state.done = true;
        state.page++;

        const startIdx = gallery2.querySelectorAll(".card").length;
        const frag = document.createDocumentFragment();
        items.forEach((p,i) => frag.appendChild(buildRedgifsCard(p, startIdx+i)));
        gallery2.appendChild(frag);
        updateBooruModalItems("redgifs", gallery2);

        if (saveToVaultEnabled && items.length > 0) {
            await addGifsToDB(items.map(p=>p.url), "redgifs");
            gifs = await getAllGifs(); buildFuseIndex(); applyFilters(); updateStats();
        }
        const countEl = el("redgifsStatCount"); if(countEl) countEl.textContent=`${gallery2.querySelectorAll(".card").length} loaded`;
        if (state.done) { el("redgifsLoadMore")?.classList.add("hidden"); showToast("RedGifs: all loaded","success",3000); }
        else el("redgifsLoadMore")?.classList.remove("hidden");
    } catch(e) { console.error("[RedGifs]",e.message); showBooruError("redgifsGallery","RedGifs",e.message); }
    state.loading=false; if(loadingEl) loadingEl.style.display="none";
}

function buildRedgifsCard(post, globalIndex) {
    const {url, type, tags, score, title, id: gifId} = post;
    const card=document.createElement("div"); card.className="card redgifs-card"; card.dataset.url=url; card.dataset.source="redgifs";
    const badge=document.createElement("div"); badge.className=`card-source-badge type-${type}`; badge.textContent=type.toUpperCase();
    const srcBadge=document.createElement("div"); srcBadge.className="booru-source-badge"; srcBadge.style.background="rgba(255,60,120,.85)"; srcBadge.textContent="redgifs";
    if (score) { const sb=document.createElement("div"); sb.className="booru-score-badge"; sb.textContent=`▶ ${score}`; card.appendChild(sb); }
    // Use official RedGifs iframe embed — bypasses CORS entirely, works from any origin
    const wrapper=document.createElement("div"); wrapper.className="video-wrapper redgifs-embed-wrapper";
    const iframeUrl = gifId ? `https://www.redgifs.com/ifr/${gifId}` : url;
    const iframe=document.createElement("iframe");
    iframe.src=iframeUrl; iframe.frameBorder="0"; iframe.scrolling="no"; iframe.allowFullscreen=true;
    iframe.setAttribute("allow","autoplay; fullscreen");
    iframe.style.cssText="width:100%;height:260px;border:none;border-radius:6px;display:block;background:#111;";
    wrapper.appendChild(iframe);
    card.onclick=(e)=>{ if(e.target.closest("iframe"))return; const items=booruModalItems.redgifs; const idx=items.findIndex(i=>i.url===url); openUniversalModal(items,idx>=0?idx:0); };
    card.oncontextmenu=e=>{ e.preventDefault(); showRedgifsContextMenu(e,{url,type,tags,title}); };
    if (tags&&tags.length>0) { const row=document.createElement("div"); row.className="card-tag-row"; row.innerHTML=tags.slice(0,5).map(t=>`<span class="card-tag">${t}</span>`).join(""); card.appendChild(row); }
    card.append(badge,srcBadge,wrapper);
    return card;
}

let redgifsCtxTarget = null;
function showRedgifsContextMenu(e,data) { redgifsCtxTarget=data; const menu=el("redgifsContextMenu"); if(!menu)return; menu.style.left=`${Math.min(e.clientX,window.innerWidth-180)}px`; menu.style.top=`${Math.min(e.clientY,window.innerHeight-220)}px`; menu.classList.remove("hidden"); }

function initRedgifs() {
    el("redgifsLoadBtn")?.addEventListener("click",()=>loadRedgifs(true));
    el("redgifsClearBtn")?.addEventListener("click",()=>{
        const g=el("redgifsGallery"); if(g){g.querySelectorAll("video,img").forEach(e2=>mediaObserver.unobserve(e2));g.innerHTML="";}
        redgifsState={page:0,loading:false,done:false,currentQuery:"",currentFilter:"all",currentSort:"trending",shownIds:new Set(),items:[]};
        booruModalItems.redgifs=[]; el("redgifsLoadMore")?.classList.add("hidden");
        const s=el("redgifsStats");if(s)s.style.display="none";
        showToast("RedGifs cleared","info");
    });
    el("redgifsLoadMore")?.addEventListener("click",()=>loadRedgifs(false));
    el("redgifsQuery")?.addEventListener("keydown",e=>{ if(e.key==="Enter")loadRedgifs(true); });

    // Trending button
    el("redgifsTrendingBtn")?.addEventListener("click",()=>{
        const qi=el("redgifsQuery"); if(qi)qi.value="";
        loadRedgifs(true);
    });

    // Account login
    el("redgifsLoginBtn")?.addEventListener("click",()=>{
        // RedGifs uses Google/Apple OAuth — password login is not available via API.
        // This button refreshes the guest token used for all public content.
        redgifsToken=null; redgifsTokenExpiry=0;
        getRedgifsToken().then(()=>showToast("RedGifs guest token refreshed","success",4000)).catch(e=>showToast("Token error: "+e.message,"error",6000));
    });
    el("redgifsLogoutBtn")?.addEventListener("click",()=>{
        redgifsToken=null; redgifsUserToken=null; redgifsTokenExpiry=0;
        showToast("RedGifs token cleared","info");
    });

    // Save all
    el("redgifsSaveAllBtn")?.addEventListener("click", async()=>{
        const g=el("redgifsGallery"); if(!g)return;
        const urls=[...g.querySelectorAll("[data-url]")].map(c=>c.dataset.url);
        if(!urls.length){showToast("Nothing to save","error");return;}
        const added=await addGifsToDB(urls,"redgifs");
        gifs=await getAllGifs();buildFuseIndex();applyFilters();updateStats();
        showToast(`Saved ${added} items`,"success",4000);
    });

    // Auto load-more
    const lm=el("redgifsLoadMore"); if(lm){ new IntersectionObserver(entries=>{ entries.forEach(entry=>{ if(entry.isIntersecting&&!redgifsState.done)loadRedgifs(false); }); },{threshold:0.1}).observe(lm); }

    // Context menu
    document.addEventListener("click",e=>{
        const btn=e.target.closest("[data-redgifs-ctx]"); const menu=el("redgifsContextMenu");
        if(!btn||!redgifsCtxTarget){ if(menu&&!menu.classList.contains("hidden")&&!menu.contains(e.target))menu.classList.add("hidden"); return; }
        const action=btn.dataset.redgifsCtx,{url,tags}=redgifsCtxTarget;
        if(action==="open")window.open(url,"_blank");
        if(action==="copy")copyUrl(url);
        if(action==="save"){ if(!saveToVaultEnabled){showToast("Save to Vault is OFF","info");return;} addGifsToDB([url],"redgifs").then(async added=>{gifs=await getAllGifs();buildFuseIndex();updateStats();showToast(added>0?"Saved!":"Already in vault",added>0?"success":"info");}); }
        if(action==="blacklist-tag"&&tags?.length>0){ const tag=prompt("Blacklist which tag?",tags[0]); if(tag)addToBlacklist(tag); }
        if(menu)menu.classList.add("hidden"); redgifsCtxTarget=null;
    });
}

// ════════════════════════════════════════════════════════
// DEAD LINKS
// ════════════════════════════════════════════════════════
async function checkDeadLinks() {
    if (gifs.length===0) { showToast("Vault is empty","error"); return; }
    const deadBtnEl=el("deadBtn"); if(deadBtnEl){deadBtnEl.disabled=true;deadBtnEl.textContent="Checking...";}
    statDead.classList.remove("hidden"); statDead.textContent=`💀 Dead: ${deadIds.size}`;
    const toCheck=gifs.filter(g=>!deadIds.has(g.id));
    const BATCH=20; let checked=0, newDead=0;
    for (let i=0;i<toCheck.length;i+=BATCH) {
        const chunk=toCheck.slice(i,i+BATCH);
        showProgress(Math.round(((i+chunk.length)/toCheck.length)*100),`Checking ${i+chunk.length}/${toCheck.length} — Dead: ${deadIds.size}`);
        await Promise.all(chunk.map(async gif=>{
            const isDead=await checkSingleUrl(gif.url);
            if(isDead){ deadIds.add(gif.id); passiveDeadIds.add(gif.id); newDead++; const card=gallery.querySelector(`[data-id="${gif.id}"]`); if(card){card.classList.add("dead-link");if(!card.querySelector(".dead-badge")){const db2=document.createElement("div");db2.className="dead-badge";db2.textContent="💀 DEAD";card.appendChild(db2);}} }
            checked++;
        }));
        statDead.textContent=`💀 Dead: ${deadIds.size}`; await sleep(150);
    }
    hideProgress(); if(deadBtnEl){deadBtnEl.disabled=false;deadBtnEl.textContent="💀 Dead";}
    if(deadIds.size===0){showToast("All links alive!","success");statDead.classList.add("hidden");return;}
    showToast(`Found ${deadIds.size} dead (${newDead} new)`,"warning",6000);
    if(confirm(`Delete ${deadIds.size} dead links?`)){ await deleteManyFromDB([...deadIds]); gifs=await getAllGifs(); deadIds.clear(); passiveDeadIds.clear(); buildFuseIndex(); statDead.classList.add("hidden"); applyFilters(); showToast("Dead links removed","success"); }
}
async function checkSingleUrl(url) {
    const type=detectType(url);
    const imgResult=await checkViaImageElement(url,type); if(imgResult!==null) return imgResult;
    try { const ctrl=new AbortController(); const t=setTimeout(()=>ctrl.abort(),8000); await fetch(url,{method:"HEAD",mode:"no-cors",signal:ctrl.signal,cache:"no-store"}); clearTimeout(t); return false; }
    catch(e) { if(e.name==="AbortError") return true; return false; }
}
async function checkViaImageElement(url,type) {
    return new Promise(resolve=>{
        const isVid=type==="mp4"||type==="webm";
        if(isVid){ const vid=document.createElement("video"); vid.preload="metadata"; vid.referrerPolicy="origin"; const t=setTimeout(()=>{vid.src="";resolve(null);},8000); vid.onloadedmetadata=()=>{clearTimeout(t);vid.src="";resolve(false);}; vid.onerror=()=>{clearTimeout(t);vid.src="";resolve(true);}; vid.src=url; return; }
        const img=new Image(); img.referrerPolicy="origin"; const t=setTimeout(()=>{img.src="";resolve(null);},8000);
        img.onload=()=>{clearTimeout(t);resolve(img.naturalWidth===0||img.naturalHeight===0);};
        img.onerror=()=>{clearTimeout(t);resolve(true);};
        img.src=url+(url.includes("?")?"&":"?")+"_nc="+Date.now();
    });
}

// ════════════════════════════════════════════════════════
// ZIP
// ════════════════════════════════════════════════════════
async function downloadZip() {
    if(typeof JSZip==="undefined"){showToast("JSZip not loaded","error");return;}
    if(gifs.length===0){showToast("Nothing to download","error");return;}
    const toZip=filtered.length>0?filtered:gifs;
    if(!confirm(`Download ${toZip.length} files as ZIP?`)) return;
    const zip=new JSZip(),folder=zip.folder("gif-vault");
    let done=0,failed=0;
    const zipBtnEl=el("zipBtn"); if(zipBtnEl){zipBtnEl.disabled=true;zipBtnEl.textContent="Zipping...";}
    for(const gif of toZip){ try{const res=await fetch(gif.url);if(!res.ok)throw new Error();folder.file(`${gif.id}.${gif.type}`,await res.blob());}catch(e){failed++;} done++; showProgress(Math.round((done/toZip.length)*100),`${done}/${toZip.length}`); }
    showProgress(99,"Building ZIP...");
    try{ const blob=await zip.generateAsync({type:"blob"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`gif-vault-${Date.now()}.zip`; a.click(); URL.revokeObjectURL(url); showToast(`ZIP ready — ${done-failed} files`,"success",5000); }
    catch(e){showToast("ZIP failed: "+e.message,"error");}
    hideProgress(); if(zipBtnEl){zipBtnEl.disabled=false;zipBtnEl.textContent="📦 ZIP";}
}

// ════════════════════════════════════════════════════════
// DUPE DETECTION
// ════════════════════════════════════════════════════════
async function findAndRemoveDupes() {
    if(gifs.length===0){showToast("Vault is empty","error");return;}
    showProgress(0,"Scanning..."); await new Promise(r=>setTimeout(r,30));
    const exactSeen=new Map(),normSeen=new Map(),dupeIds=[];
    gifs.forEach((g,i)=>{ if(i%200===0)showProgress(Math.round((i/gifs.length)*100),"Scanning..."); if(exactSeen.has(g.url)){dupeIds.push(g.id);return;}exactSeen.set(g.url,g.id); const norm=normaliseUrl(g.url); if(normSeen.has(norm)){dupeIds.push(g.id);return;}normSeen.set(norm,g.id); });
    hideProgress();
    if(dupeIds.length===0){showToast("No duplicates!","success");return;}
    if(!confirm(`Found ${dupeIds.length} duplicates. Delete?`)) return;
    await deleteManyFromDB(dupeIds); gifs=await getAllGifs(); buildFuseIndex(); applyFilters(); showToast(`Removed ${dupeIds.length} dupes`,"success");
}

// ════════════════════════════════════════════════════════
// LS POLLING + BROADCAST
// ════════════════════════════════════════════════════════
const LS_KEY="gif_vault_incoming"; let lastAck=Date.now();
function startPolling() {
    setInterval(()=>{
        try{ const raw=localStorage.getItem(LS_KEY); if(!raw)return; const data=JSON.parse(raw); if(!data?.timestamp||data.timestamp<=lastAck)return; lastAck=data.timestamp; localStorage.removeItem(LS_KEY); const urls=Array.isArray(data.urls)?data.urls:[],origin=typeof data.origin==="string"?data.origin:null; if(urls.length===0)return; pendingUrls=urls; showIncomingTray(urls,origin); }catch(e){localStorage.removeItem(LS_KEY);}
    },600);
}
try{ const ch=new BroadcastChannel("gif_vault"); ch.onmessage=e=>{ const{type,urls,origin}=e.data||{}; if(type!=="ADD_URLS"||!Array.isArray(urls)||urls.length===0)return; const valid=urls.filter(u=>typeof u==="string"&&u.startsWith("http")); if(valid.length===0)return; pendingUrls=valid; showIncomingTray(valid,origin||null); }; }catch(e){}

// ════════════════════════════════════════════════════════
// INCOMING TRAY
// ════════════════════════════════════════════════════════
function showIncomingTray(urls,origin){
    let hostname="external page"; if(origin){try{hostname=new URL(origin).hostname;}catch(e){hostname=origin;}}
    incomingTitle.textContent=`📡 ${urls.length} item${urls.length!==1?"s":""} from ${hostname}`;
    incomingPreviewRow.innerHTML="";
    urls.slice(0,20).forEach(url=>{ const type=detectType(url); let e2; if(type==="webm"||type==="mp4"){e2=document.createElement("video");e2.src=url;e2.autoplay=true;e2.loop=true;e2.muted=true;e2.playsInline=true;}else{e2=document.createElement("img");e2.src=url;e2.alt="preview";} e2.className="incoming-thumb"; e2.onerror=()=>e2.style.display="none"; incomingPreviewRow.appendChild(e2); });
    incomingTray.classList.remove("hidden");
    broadcastStatus.textContent="📡 Receiving!"; broadcastStatus.style.color="#c084fc";
    setTimeout(()=>{broadcastStatus.textContent="📡 Listening";broadcastStatus.style.color="var(--success)";},2000);
}
incomingAccept.onclick=async()=>{ if(pendingUrls.length===0)return; const origin=(()=>{const m=incomingTitle.textContent.match(/from (.+)$/);return m?m[1]:null;})(); const urls=[...pendingUrls]; const added=await addGifsToDB(urls,origin); gifs=await getAllGifs(); buildFuseIndex(); pendingUrls=[]; incomingTray.classList.add("hidden"); incomingPreviewRow.innerHTML=""; applyFilters(); showToast(`Added ${added} items`,"success",4000); sendWebhookGeneral(urls,added,urls.length-added,origin); };
incomingTogglePreview.onclick=()=>{ incomingPreviewRow.style.display=incomingPreviewRow.style.display==="none"?"flex":"none"; };
incomingReject.onclick=()=>{ pendingUrls=[]; incomingTray.classList.add("hidden"); incomingPreviewRow.innerHTML=""; showToast("Dismissed","info"); };

// ════════════════════════════════════════════════════════
// TAGS
// ════════════════════════════════════════════════════════
function openTagModal(gif){ currentTagGif=gif; renderTagModal(); tagModal.classList.remove("hidden"); }
function renderTagModal(){ if(!currentTagGif)return; tagList.innerHTML=""; (currentTagGif.tags||[]).forEach(tag=>{ const chip=document.createElement("div");chip.className="tag-chip";chip.innerHTML=`${tag} <span class="remove-tag">✕</span>`;chip.querySelector(".remove-tag").onclick=()=>removeTag(tag);tagList.appendChild(chip); }); collectionList.innerHTML=""; (currentTagGif.collections||[]).forEach(col=>{ const chip=document.createElement("div");chip.className="collection-chip";chip.innerHTML=`📁 ${col} <span class="remove-col">✕</span>`;chip.querySelector(".remove-col").onclick=()=>removeCollection(col);collectionList.appendChild(chip); }); }
async function addTag(){ const tag=tagInput.value.trim().toLowerCase(); if(!tag||!currentTagGif)return; if(!currentTagGif.tags)currentTagGif.tags=[]; if(currentTagGif.tags.includes(tag)){showToast("Tag exists","error");return;} currentTagGif.tags.push(tag); await updateGifInDB(currentTagGif); const i=gifs.findIndex(g=>g.id===currentTagGif.id);if(i>-1)gifs[i]=currentTagGif; tagInput.value=""; renderTagModal(); renderCardTags(currentTagGif); showToast(`"${tag}" added`,"success"); }
async function removeTag(tag){ if(!currentTagGif)return; currentTagGif.tags=(currentTagGif.tags||[]).filter(t=>t!==tag); await updateGifInDB(currentTagGif); const i=gifs.findIndex(g=>g.id===currentTagGif.id);if(i>-1)gifs[i]=currentTagGif; renderTagModal(); renderCardTags(currentTagGif); }
async function addCollection(){ const col=collectionInput.value.trim(); if(!col||!currentTagGif)return; if(!currentTagGif.collections)currentTagGif.collections=[]; if(currentTagGif.collections.includes(col)){showToast("Already in collection","error");return;} currentTagGif.collections.push(col); await updateGifInDB(currentTagGif); const i=gifs.findIndex(g=>g.id===currentTagGif.id);if(i>-1)gifs[i]=currentTagGif; collectionInput.value=""; renderTagModal(); showToast(`Added to "${col}"`,"success"); }
async function removeCollection(col){ if(!currentTagGif)return; currentTagGif.collections=(currentTagGif.collections||[]).filter(c=>c!==col); await updateGifInDB(currentTagGif); const i=gifs.findIndex(g=>g.id===currentTagGif.id);if(i>-1)gifs[i]=currentTagGif; renderTagModal(); }
function renderCardTags(gif){ const card=gallery.querySelector(`[data-id="${gif.id}"]`);if(!card)return; let row=card.querySelector(".card-tag-row"); if(!(gif.tags||[]).length){if(row)row.remove();return;} if(!row){row=document.createElement("div");row.className="card-tag-row";card.appendChild(row);} row.innerHTML=gif.tags.map(t=>`<span class="card-tag">${t}</span>`).join(""); }
tagAddBtn.onclick=addTag; tagCloseBtn.onclick=()=>tagModal.classList.add("hidden"); collectionAddBtn.onclick=addCollection;
tagInput.onkeydown=e=>{if(e.key==="Enter")addTag();}; collectionInput.onkeydown=e=>{if(e.key==="Enter")addCollection();};

// ════════════════════════════════════════════════════════
// BULK MODE
// ════════════════════════════════════════════════════════
function enterBulkMode(){ bulkMode=true;selectedIds.clear();gallery.classList.add("bulk-mode");bulkToolbar.classList.remove("hidden");bulkBtn.textContent="✕ Exit Select";updateBulkCount(); }
function exitBulkMode(){ bulkMode=false;selectedIds.clear();gallery.classList.remove("bulk-mode");bulkToolbar.classList.add("hidden");bulkBtn.textContent="☑️ Select";document.querySelectorAll(".card-checkbox").forEach(c=>c.classList.remove("checked"));document.querySelectorAll(".card.selected").forEach(c=>c.classList.remove("selected")); }
function updateBulkCount(){ bulkCount.textContent=`${selectedIds.size} selected`; }
function toggleCardSelect(id){ const card=gallery.querySelector(`[data-id="${id}"]`);const cb=card?.querySelector(".card-checkbox"); if(selectedIds.has(id)){selectedIds.delete(id);cb?.classList.remove("checked");card?.classList.remove("selected");}else{selectedIds.add(id);cb?.classList.add("checked");card?.classList.add("selected");} updateBulkCount(); }
bulkBtn.onclick=()=>{ if(bulkMode)exitBulkMode();else enterBulkMode(); };
bulkCancel.onclick=exitBulkMode;
bulkSelectAll.onclick=()=>{ const allIds=filtered.map(g=>g.id);const allSel=allIds.every(id=>selectedIds.has(id)); allIds.forEach(id=>{ const card=gallery.querySelector(`[data-id="${id}"]`);const cb=card?.querySelector(".card-checkbox"); if(allSel){selectedIds.delete(id);cb?.classList.remove("checked");card?.classList.remove("selected");}else{selectedIds.add(id);cb?.classList.add("checked");card?.classList.add("selected");} }); updateBulkCount(); };
bulkDelete.onclick=async()=>{ if(!selectedIds.size){showToast("Nothing selected","error");return;} if(!confirm(`Delete ${selectedIds.size} items?`))return; const ids=[...selectedIds]; await deleteManyFromDB(ids);gifs=await getAllGifs();buildFuseIndex();exitBulkMode();applyFilters();showToast(`Deleted ${ids.length} items`,"success"); };
bulkExport.onclick=()=>{ if(!selectedIds.size){showToast("Nothing selected","error");return;} const urls=gifs.filter(g=>selectedIds.has(g.id)).map(g=>g.url); const blob=new Blob([JSON.stringify(urls,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`selected-${Date.now()}.json`;a.click();URL.revokeObjectURL(url);showToast(`Exported ${urls.length} URLs`,"success"); };

// ════════════════════════════════════════════════════════
// GRID SLIDER
// ════════════════════════════════════════════════════════
const debouncedSlider=debounce(()=>applyGalleryLayout(),120);
gridSlider.oninput=()=>debouncedSlider();

// ════════════════════════════════════════════════════════
// CONTEXT MENU — vault
// ════════════════════════════════════════════════════════
function showContextMenu(e,gif){ e.preventDefault();contextTarget=gif;contextMenu.style.left=`${Math.min(e.clientX,window.innerWidth-170)}px`;contextMenu.style.top=`${Math.min(e.clientY,window.innerHeight-270)}px`;contextMenu.classList.remove("hidden"); }
function hideContextMenu(){ contextMenu.classList.add("hidden");contextTarget=null; }
gallery.addEventListener("contextmenu",e=>{ const card=e.target.closest(".card[data-id]");if(!card)return; const id=parseInt(card.dataset.id);const gif=gifs.find(g=>g.id===id);if(gif)showContextMenu(e,gif); });
gallery.addEventListener("click",e=>{ const card=e.target.closest(".card[data-id]");if(!card)return; if(e.target.classList.contains("card-checkbox"))return; if(e.target.closest("video")||e.target.closest(".unmute-btn"))return; const id=parseInt(card.dataset.id);const gif=gifs.find(g=>g.id===id);if(!gif)return; if(bulkMode)toggleCardSelect(id);else openModal(gif); });
ctxView.onclick=()=>{ if(contextTarget)openModal(contextTarget);hideContextMenu(); };
ctxCopy.onclick=()=>{ if(contextTarget)copyUrl(contextTarget.url);hideContextMenu(); };
ctxTag.onclick=()=>{ if(contextTarget)openTagModal(contextTarget);hideContextMenu(); };
ctxSelect.onclick=()=>{ if(!bulkMode)enterBulkMode();if(contextTarget)toggleCardSelect(contextTarget.id);hideContextMenu(); };
ctxDelete.onclick=async()=>{ if(contextTarget)await deleteGif(contextTarget.id);hideContextMenu(); };
ctxDownload.onclick=()=>{ if(!contextTarget)return; const a=document.createElement("a");a.href=contextTarget.url;a.download=`media-${Date.now()}.${contextTarget.type}`;a.target="_blank";a.click();hideContextMenu(); };

document.addEventListener("click",e=>{
    if(!contextMenu.classList.contains("hidden")&&!contextMenu.contains(e.target))hideContextMenu();
    const rMenu=el("redditContextMenu"); if(rMenu&&!rMenu.classList.contains("hidden")&&!rMenu.contains(e.target)){rMenu.classList.add("hidden");redditCtxTarget=null;}
    if(settingsPanel&&!settingsPanel.classList.contains("hidden")&&!settingsPanel.contains(e.target)&&e.target!==settingsBtn)settingsPanel.classList.add("hidden");
});
document.addEventListener("click",e=>{
    const btn=e.target.closest("[data-reddit-ctx]");if(!btn||!redditCtxTarget)return;
    const action=btn.dataset.redditCtx,{url,type,sub,isEmbed}=redditCtxTarget;
    if(action==="open")window.open(url,"_blank");
    if(action==="copy")copyUrl(url);
    if(action==="save"){if(!saveToVaultEnabled){showToast("Save to Vault is OFF","info");return;}if(!isEmbed){addGifsToDB([url],`reddit.com/r/${sub}`).then(async added=>{gifs=await getAllGifs();buildFuseIndex();updateStats();showToast(added>0?"Saved!":"Already in vault",added>0?"success":"info");});}else showToast("Can't save embed","info");}
    const rMenu=el("redditContextMenu");if(rMenu)rMenu.classList.add("hidden");redditCtxTarget=null;
});

// ════════════════════════════════════════════════════════
// EXPORT
// ════════════════════════════════════════════════════════
function exportUrlsOnly(){ const blob=new Blob([JSON.stringify(gifs.map(g=>g.url),null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`gif-vault-${Date.now()}.json`;a.click();URL.revokeObjectURL(url);showToast(`Exported ${gifs.length} URLs`,"success"); }
function exportAsDiscordSettings(){ if(!lastRawSettings){showToast("No original import","error",4000);return;} const ne=JSON.parse(JSON.stringify(lastRawSettings));ne.settings=btoa(gifs.map(g=>g.url).join("\n"));ne._vaultExport=true;ne._exportedAt=new Date().toISOString();ne._gifCount=gifs.length; const blob=new Blob([JSON.stringify(ne,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`discord-cleaned-${Date.now()}.json`;a.click();URL.revokeObjectURL(url);showToast(`Exported (${gifs.length} items)`,"success",4000); }
exportBtn.onclick=()=>{ if(gifs.length===0){showToast("Nothing to export","error");return;} const ex=document.getElementById("exportMenu");if(ex){ex.remove();return;} const menu=document.createElement("div");menu.id="exportMenu";menu.style.cssText="position:fixed;top:68px;right:18px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:7px;z-index:9999;display:flex;flex-direction:column;gap:5px;box-shadow:var(--shadow);min-width:240px;"; const o1=document.createElement("button");o1.className="btn btn-secondary";o1.textContent="⬇️ Export URLs only";o1.onclick=()=>{exportUrlsOnly();menu.remove();}; const o2=document.createElement("button");o2.className="btn btn-primary";o2.textContent="🔄 Export as Discord Settings";o2.onclick=()=>{exportAsDiscordSettings();menu.remove();}; menu.append(o1,o2);document.body.appendChild(menu); setTimeout(()=>{ document.addEventListener("click",function h(e){if(!menu.contains(e.target)&&e.target!==exportBtn){menu.remove();document.removeEventListener("click",h);}}); },10); };

// ════════════════════════════════════════════════════════
// FILTER / SORT / SEARCH
// ════════════════════════════════════════════════════════
function applyFilters(){
    let result=searchQuery.trim()&&fuseInstance?fuzzySearch(searchQuery):[...gifs];
    if(activeFilter!=="all") result=result.filter(g=>g.type===activeFilter);
    if(activeSort==="newest") result.sort((a,b)=>b.addedAt-a.addedAt);
    else if(activeSort==="oldest") result.sort((a,b)=>a.addedAt-b.addedAt);
    else if(activeSort==="type") result.sort((a,b)=>a.type.localeCompare(b.type));
    filtered=result; rendered=0; scheduleRender(()=>renderGallery(true)); updateStats();
}
function updateStats(){ gifCount.textContent=`${gifs.length} item${gifs.length!==1?"s":""}`;const c={};gifs.forEach(g=>{c[g.type]=(c[g.type]||0)+1;});statGif.textContent=`GIF: ${c.gif||0}`;statWebm.textContent=`WEBM: ${c.webm||0}`;statMp4.textContent=`MP4: ${c.mp4||0}`;statOther.textContent=`Other: ${(c.webp||0)+(c.png||0)+(c.jpg||0)+(c.other||0)}`;statVisible.textContent=`Showing: ${Math.min(rendered,filtered.length)} / ${filtered.length}`; }

// ════════════════════════════════════════════════════════
// RENDER GALLERY
// ════════════════════════════════════════════════════════
function renderGallery(reset=false){
    if(reset){ gallery.querySelectorAll("video,iframe,img[data-gif-src],img[data-lazy-src]").forEach(e2=>mediaObserver.unobserve(e2)); gallery.innerHTML="";rendered=0;applyGalleryLayout(); }
    if(filtered.length===0){ gallery.classList.add("empty-state"); gallery.innerHTML=`<div class="empty-message"><span class="empty-icon">🗃️</span><h2>${gifs.length===0?"Your vault is empty":"No results found"}</h2><p>${gifs.length===0?"Click Import to load your Discord GIF favorites.":"Try a different search or filter."}</p></div>`; loadMoreWrap.classList.add("hidden");updateStats();return; }
    gallery.classList.remove("empty-state");
    const slice=filtered.slice(rendered,rendered+PAGE_SIZE);
    const frag=document.createDocumentFragment();
    slice.forEach(gif=>frag.appendChild(createCard(gif)));
    gallery.appendChild(frag); rendered+=slice.length;
    if(rendered<filtered.length){loadMoreWrap.classList.remove("hidden");loadMoreBtn.textContent=`Load More (${filtered.length-rendered} remaining)`;}
    else loadMoreWrap.classList.add("hidden");
    updateStats();
}

// ════════════════════════════════════════════════════════
// CREATE VAULT CARD
// ════════════════════════════════════════════════════════
function createCard(gif){
    const card=document.createElement("div");card.className="card";card.dataset.id=gif.id;card.dataset.url=gif.url;
    if(deadIds.has(gif.id))card.classList.add("dead-link");
    const cb=document.createElement("div");cb.className="card-checkbox";cb.textContent="✓";
    if(selectedIds.has(gif.id))cb.classList.add("checked");
    cb.onclick=e=>{e.stopPropagation();if(bulkMode)toggleCardSelect(gif.id);};
    const badge=document.createElement("div");badge.className=`card-source-badge type-${gif.type}`;badge.textContent=gif.type.toUpperCase();
    card.append(cb,badge);
    if(gif.origin?.includes("reddit")){const ob=document.createElement("div");ob.className="card-origin-badge";try{ob.textContent=`📡 ${new URL(gif.origin).hostname}`;}catch(e){ob.textContent="📡 reddit";}card.appendChild(ob);}
    if(gif.origin?.includes("bluesky")){const ob=document.createElement("div");ob.className="card-origin-badge bsky-origin";ob.textContent="🦋 bluesky";card.appendChild(ob);}
    if(gif.origin==="redgifs"){const ob=document.createElement("div");ob.className="card-origin-badge";ob.style.background="rgba(255,60,120,.85)";ob.textContent="🔴 redgifs";card.appendChild(ob);}
    if(gif.origin==="danbooru"||gif.origin==="gelbooru"||gif.origin==="rule34"){const ob=document.createElement("div");ob.className="card-origin-badge booru-origin";ob.textContent=`🎨 ${gif.origin}`;card.appendChild(ob);}
    if(deadIds.has(gif.id)){const db2=document.createElement("div");db2.className="dead-badge";db2.textContent="💀 DEAD";card.appendChild(db2);}
    if(gif.type==="webm"||gif.type==="mp4"){
        const wrapper=document.createElement("div");wrapper.className="video-wrapper";
        const vid=document.createElement("video");vid.controls=true;vid.loop=true;vid.muted=true;vid.playsInline=true;vid.preload="metadata";vid.referrerPolicy="origin";vid.style.cssText=`width:100%;display:block;object-fit:${fitMode};`;vid.dataset.src=gif.url;
        attachPassiveDeadDetector(vid,gif.id);
        const unmuteBtn=document.createElement("button");unmuteBtn.className="unmute-btn";unmuteBtn.textContent="🔇 Unmute";
        unmuteBtn.onclick=e=>{e.stopPropagation();vid.muted=!vid.muted;if(!vid.muted&&vid.volume===0)vid.volume=1;unmuteBtn.textContent=vid.muted?"🔇 Unmute":"🔊 Muted";};
        vid.onvolumechange=()=>{unmuteBtn.textContent=vid.muted?"🔇 Unmute":"🔊 Muted";};
        wrapper.appendChild(vid);wrapper.appendChild(unmuteBtn);mediaObserver.observe(vid);card.appendChild(wrapper);
    }else if(gif.type==="gif"){
        const wrapper=document.createElement("div");wrapper.className="img-wrapper";
        const img=document.createElement("img");img.decoding="async";img.referrerPolicy="origin";img.dataset.gifSrc=gif.url;img.src=BLANK_GIF;img.alt=gif.type;
        img.style.cssText=`width:100%;height:auto;display:block;object-fit:${fitMode};`;
        img.addEventListener("error",()=>{if(img.src!==BLANK_GIF)attachPassiveDeadDetector(img,gif.id);},{once:true});
        wrapper.appendChild(img);mediaObserver.observe(img);card.appendChild(wrapper);
    }else{
        const wrapper=document.createElement("div");wrapper.className="img-wrapper";
        const img=document.createElement("img");img.decoding="async";img.referrerPolicy="origin";img.dataset.lazySrc=gif.url;img.src=BLANK_GIF;img.alt=gif.type;
        img.style.cssText=`width:100%;height:auto;display:block;object-fit:${fitMode};`;
        attachPassiveDeadDetector(img,gif.id);
        wrapper.appendChild(img);mediaObserver.observe(img);card.appendChild(wrapper);
    }
    if((gif.tags||[]).length>0){const row=document.createElement("div");row.className="card-tag-row";row.innerHTML=gif.tags.map(t=>`<span class="card-tag">${t}</span>`).join("");card.appendChild(row);}
    return card;
}

// ════════════════════════════════════════════════════════
// VAULT MODAL
// ════════════════════════════════════════════════════════
function openModal(gif){ modalIndex=filtered.findIndex(g=>g.id===gif.id);if(modalIndex===-1)modalIndex=0;showModalAt(modalIndex);modal.classList.remove("hidden");document.body.style.overflow="hidden"; }
function showModalAt(index){
    const gif=filtered[index];if(!gif)return;
    modalImg.src="";
    const oldVid=document.getElementById("modalVideo");if(oldVid)oldVid.remove();
    if(gif.type==="webm"||gif.type==="mp4"){
        modalImg.style.display="none";
        const vid=document.createElement("video");vid.id="modalVideo";vid.controls=true;vid.loop=true;vid.muted=false;vid.autoplay=true;vid.playsInline=true;vid.preload="auto";vid.volume=1;vid.referrerPolicy="origin";
        vid.style.cssText="max-width:80vw;max-height:62vh;border-radius:14px;background:var(--bg3);";
        const src=document.createElement("source");src.src=gif.url;src.type=gif.type==="webm"?"video/webm":"video/mp4";
        vid.appendChild(src);modalImg.insertAdjacentElement("afterend",vid);
    }else{
        modalImg.style.display="";modalImg.referrerPolicy="origin";modalImg.src=gif.url;
    }
    modalIndex_el.textContent=`${index+1} / ${filtered.length}`;
    modalIndex=index;
    modalTagsEl.innerHTML="";
    (gif.tags||[]).forEach(tag=>{const chip=document.createElement("span");chip.className="card-tag";chip.textContent=tag;modalTagsEl.appendChild(chip);});
}
function closeModal(){ modal.classList.add("hidden");modalImg.src="";modalImg.style.display="";document.body.style.overflow="";const vid=document.getElementById("modalVideo");if(vid)vid.remove(); }
modalClose.onclick=closeModal;modalBackdrop.onclick=closeModal;
modalPrev.onclick=()=>{if(modalIndex>0)showModalAt(modalIndex-1);};
modalNext.onclick=()=>{if(modalIndex<filtered.length-1)showModalAt(modalIndex+1);};
modalOpen.onclick=()=>window.open(filtered[modalIndex]?.url,"_blank");
modalCopy.onclick=()=>copyUrl(filtered[modalIndex]?.url);
modalAddTag.onclick=()=>{ const g=filtered[modalIndex];if(g){closeModal();openTagModal(g);} };
modalDownload.onclick=()=>{ const gif=filtered[modalIndex];if(!gif)return;const a=document.createElement("a");a.href=gif.url;a.download=`media-${Date.now()}.${gif.type}`;a.target="_blank";a.click();showToast("Download started","success"); };
modalDelete.onclick=()=>{ const gif=filtered[modalIndex];if(!gif)return;deleteGif(gif.id);closeModal(); };

// ════════════════════════════════════════════════════════
// KEYBOARD
// ════════════════════════════════════════════════════════
document.addEventListener("keydown",e=>{
    const tag=document.activeElement.tagName.toLowerCase();
    const inInput=tag==="input"||tag==="textarea"||tag==="select";
    const vaultOpen=!modal.classList.contains("hidden");
    const uModalEl=el("universalModal");
    const uOpen=uModalEl&&!uModalEl.classList.contains("hidden");
    if(e.key==="Escape"){
        if(vaultOpen)closeModal();
        else if(uOpen)closeUniversalModal();
        else if(!tagModal.classList.contains("hidden"))tagModal.classList.add("hidden");
        else if(!importModal.classList.contains("hidden"))importModal.classList.add("hidden");
        else if(!shortcutsPanel.classList.contains("hidden"))shortcutsPanel.classList.add("hidden");
        else if(settingsPanel&&!settingsPanel.classList.contains("hidden"))settingsPanel.classList.add("hidden");
        else hideContextMenu();
        return;
    }
    if(e.key==="?"&&!inInput){shortcutsPanel.classList.toggle("hidden");return;}
    if(e.key==="/"&&!inInput){e.preventDefault();searchInput.focus();return;}
    if(vaultOpen){
        if(e.key==="ArrowLeft")modalPrev.click();
        if(e.key==="ArrowRight")modalNext.click();
        if(e.key==="d"||e.key==="D")modalDelete.click();
        if(e.key==="c"||e.key==="C")modalCopy.click();
        if(e.key==="t"||e.key==="T")modalAddTag.click();
    }
    if(uOpen){
        if(e.key==="ArrowLeft")el("uModalPrev")?.click();
        if(e.key==="ArrowRight")el("uModalNext")?.click();
        if(e.key==="s"||e.key==="S")el("uModalSave")?.click();
    }
});
shortcutsFab.onclick=()=>shortcutsPanel.classList.toggle("hidden");
shortcutsClose.onclick=()=>shortcutsPanel.classList.add("hidden");

// ════════════════════════════════════════════════════════
// COPY / DELETE
// ════════════════════════════════════════════════════════
function copyUrl(url){ if(!url)return; navigator.clipboard.writeText(url).then(()=>showToast("Copied!","success")).catch(()=>{const ta=document.createElement("textarea");ta.value=url;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);showToast("Copied!","success");}); }
async function deleteGif(id){ await deleteGifFromDB(id);gifs=gifs.filter(g=>g.id!==id);buildFuseIndex();const card=gallery.querySelector(`[data-id="${id}"]`);if(card){card.querySelectorAll("video,iframe,img").forEach(e2=>mediaObserver.unobserve(e2));card.style.transition="opacity .18s,transform .18s";card.style.opacity="0";card.style.transform="scale(0.92)";setTimeout(()=>{if(card.parentNode)card.remove();},200);}applyFilters();showToast("Removed","info"); }

// ════════════════════════════════════════════════════════
// BUTTON WIRING
// ════════════════════════════════════════════════════════
el("dupeBtn")?.addEventListener("click",findAndRemoveDupes);
el("deadBtn")?.addEventListener("click",checkDeadLinks);
el("zipBtn")?.addEventListener("click",downloadZip);

// ════════════════════════════════════════════════════════
// IMPORT
// ════════════════════════════════════════════════════════
importBtn.onclick=()=>{ importTextarea.value="";importInfo.textContent="";importInfo.className="import-info";importModal.classList.remove("hidden");importTextarea.focus(); };
importCancelBtn.onclick=()=>importModal.classList.add("hidden");
importTextarea.oninput=()=>{ const raw=importTextarea.value.trim();if(!raw){importInfo.textContent="";importInfo.className="import-info";return;} try{if(raw.startsWith("[")){const arr=JSON.parse(raw);importInfo.textContent=`✅ URL list — ${arr.length} entries`;importInfo.className="import-info good";return;}const parsed=JSON.parse(raw);if(parsed.settings){const preview=decodeBlob(parsed.settings);importInfo.textContent=`✅ Discord export — ~${preview.length} media URLs`;importInfo.className="import-info good";}else{importInfo.textContent="⚠️ No 'settings' field";importInfo.className="import-info bad";}}catch{importInfo.textContent="⏳ Waiting for complete JSON...";importInfo.className="import-info";} };
importConfirmBtn.onclick=async()=>{ const raw=importTextarea.value.trim();if(!raw){showToast("Nothing pasted","error");return;} let urls=[],rawContent=raw; try{if(raw.startsWith("["))urls=JSON.parse(raw).filter(u=>typeof u==="string");else{const parsed=JSON.parse(raw);if(!parsed.settings){showToast("No settings field","error");return;}lastRawSettings=parsed;urls=decodeBlob(parsed.settings);}}catch{showToast("Invalid JSON","error");return;} if(urls.length===0){showToast("No media URLs found","error");return;} importConfirmBtn.textContent="Importing...";importConfirmBtn.disabled=true;importInfo.textContent=`Processing ${urls.length} URLs...`;importInfo.className="import-info good"; const added=await addGifsToDB(urls,null);const skipped=urls.length-added;gifs=await getAllGifs();buildFuseIndex();hideProgress();importModal.classList.add("hidden");importConfirmBtn.textContent="Import";importConfirmBtn.disabled=false;applyFilters();showToast(`Done — ${added} added (${skipped} dupes)`,"success",5000);sendWebhookImport(rawContent,urls,added,skipped); };

// ════════════════════════════════════════════════════════
// SEARCH / SORT / FILTER
// ════════════════════════════════════════════════════════
const debouncedSearch=debounce(()=>{searchQuery=searchInput.value;applyFilters();},250);
searchInput.oninput=()=>debouncedSearch();
sortSelect.onchange=()=>{activeSort=sortSelect.value;applyFilters();};
filterBtns.forEach(btn=>{ btn.onclick=()=>{ filterBtns.forEach(b=>b.classList.remove("active"));btn.classList.add("active");activeFilter=btn.dataset.filter;applyFilters(); }; });
loadMoreBtn.onclick=()=>renderGallery(false);
const vaultObserver=new IntersectionObserver(entries=>{ entries.forEach(entry=>{if(entry.isIntersecting&&rendered<filtered.length)scheduleRender(()=>renderGallery(false));}); },{threshold:0.1});
if(loadMoreBtn)vaultObserver.observe(loadMoreBtn);

// ════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════
function initWorkerSetting() {
    const inp=el('cfWorkerInput'), btn=el('cfWorkerSaveBtn'), stat=el('cfWorkerStatus');
    if(!inp||!btn) return;
    const saved=localStorage.getItem('cfWorkerUrl')||'';
    if(saved){inp.value=saved;if(stat)stat.textContent='✓ Active: '+saved.slice(0,40)+(saved.length>40?'…':'');}
    btn.addEventListener('click',()=>{
        const url=inp.value.trim().replace(/\/+$/,'');
        localStorage.setItem('cfWorkerUrl',url);
        if(stat)stat.textContent=url?'✓ Saved — CORS fallback active':'Cleared';
        showToast(url?'Worker URL saved':'Worker URL cleared','success',3000);
    });
}

async function init(){
    try{
        injectRedditUI();
        initSettings();
        initBlacklist();
        initBooruControls();
        initBluesky();
        initRedgifs();
        initKemono();
        initCoomer();
        initNijie();
        initUniversalModal();
        initHoverPreview();
        initSlideshow();
        initCompactMode();
        initExportBtn();
        initColorPicker();
        initWorkerSetting();
        initVaultWorker();
        initVirtualScroll();
        await openDB();
        gifs=await getAllGifs();
        buildFuseIndex();
        applyFilters();
        startPolling();
        renderSavedSubs();
        applyGalleryLayout();
        console.log(`GIF Vault v17 loaded — ${gifs.length} items`);
        showToast(`Vault loaded — ${gifs.length} items`,"success",3000);
    }catch(e){
        console.error("Init failed:",e);
        showToast("DB error: "+e.message,"error",8000);
    }
}
// init() is called at the END of the file so all appended let declarations
// are initialized before init() runs (avoids Temporal Dead Zone errors).

// ════════════════════════════════════════════════════════
// SERVICE WORKER REGISTRATION
// ════════════════════════════════════════════════════════
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}

// ════════════════════════════════════════════════════════
// SOURCE URL STRIPPING (tracking param removal)
// ════════════════════════════════════════════════════════
const TRACKING_PARAMS = new Set([
    'utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id',
    'fbclid','gclid','mc_eid','yclid','igshid','msclkid','s','si','ref','referrer',
    '_ga','_gac','_gl','twclid','li_fat_id','ttclid'
]);
function stripTracking(rawUrl) {
    try {
        const u = new URL(rawUrl);
        [...u.searchParams.keys()].forEach(k => { if (TRACKING_PARAMS.has(k.toLowerCase())) u.searchParams.delete(k); });
        let s = u.toString();
        if (s.endsWith('?') || s.endsWith('&')) s = s.replace(/[?&]$/, '');
        return s;
    } catch { return rawUrl; }
}

// ════════════════════════════════════════════════════════
// WEB WORKER (filtering/sorting off main thread)
// ════════════════════════════════════════════════════════
let _worker = null, _workerCbs = new Map(), _workerCbId = 0;
function initVaultWorker() {
    try {
        _worker = new Worker('vault-worker.js');
        _worker.onmessage = ({ data }) => { const cb = _workerCbs.get(data.id); if (cb) { _workerCbs.delete(data.id); cb(data.result); } };
        _worker.onerror = () => { _worker = null; };
    } catch { _worker = null; }
}
function workerTask(type, payload) {
    return new Promise(resolve => {
        if (!_worker) { resolve(null); return; }
        const id = ++_workerCbId;
        _workerCbs.set(id, resolve);
        _worker.postMessage({ id, type, payload });
    });
}

// ════════════════════════════════════════════════════════
// CLOUDFLARE WORKER HELPER
// Deployed worker URL stored in settings — acts as CORS proxy
// for sites that block cross-origin requests.
// ════════════════════════════════════════════════════════
function getWorkerUrl() { return (localStorage.getItem('cfWorkerUrl')||'').replace(/\/+$/,''); }

// ════════════════════════════════════════════════════════
// KEMONO.SU
// ════════════════════════════════════════════════════════
const KEMONO_BASE = 'https://kemono.cr';
// CDN: c1.kemono.cr/data + file.path  (path already starts with /)
const KEMONO_CDN  = 'https://c1.kemono.cr/data';
let kemonoState = { offset:0, loading:false, done:false, currentQuery:'', currentService:'', currentFilter:'all', shownIds:new Set(), items:[] };

const MEDIA_EXTS = new Set(['jpg','jpeg','png','webp','gif','mp4','webm']);

function normalizeKemonoPost(post) {
    // Find first image/video in file or attachments, filter out audio/docs
    let mediaFile = null;
    if (post.file?.name && post.file?.path) {
        const ext = post.file.name.split('.').pop().toLowerCase();
        if (MEDIA_EXTS.has(ext)) mediaFile = post.file;
    }
    if (!mediaFile) {
        for (const att of (post.attachments||[])) {
            if (!att.name || !att.path) continue;
            const ext = att.name.split('.').pop().toLowerCase();
            if (MEDIA_EXTS.has(ext)) { mediaFile = att; break; }
        }
    }
    if (!mediaFile) return null;
    const url = KEMONO_CDN + mediaFile.path;
    const type = detectType(url);
    const id = `kemono_${post.service||''}_${post.user||''}_${post.id||''}`;
    return { url, type, tags: [post.service, post.user].filter(Boolean), id, score: null, source: 'kemono', title: post.title||'' };
}
async function kemonoApiFetch(query, service, offset, limit) {
    const p = new URLSearchParams({ o: String(offset), limit: String(limit) });
    if (query) p.set('q', query);
    if (service) p.set('service', service);
    const url = `${KEMONO_BASE}/api/v1/posts?${p}`;
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error(`Kemono HTTP ${res.status}`);
        const data = await res.json();
        return data.posts ?? (Array.isArray(data) ? data : []);
    } catch(e) {
        const w = getWorkerUrl(); if (!w) throw e;
        const r2 = await fetch(`${w}?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(20000) });
        if (!r2.ok) throw new Error(`Worker Kemono ${r2.status}`);
        const d2 = await r2.json();
        return d2.posts ?? (Array.isArray(d2) ? d2 : []);
    }
}
async function loadKemono(reset=true) {
    const st = kemonoState;
    if (st.loading || (!reset && st.done)) return;
    const g=el('kemonoGallery'), ld=el('kemonoLoading'), lm=el('kemonoLoadMore'); if (!g) return;
    if (reset) { st.offset=0; st.done=false; st.shownIds=new Set(); st.items=[]; st.currentQuery=el('kemonoQuery')?.value.trim()||''; st.currentService=el('kemonoService')?.value||''; st.currentFilter=el('kemonoFilter')?.value||'all'; g.innerHTML=''; booruModalItems.kemono=[]; }
    st.loading=true; if(ld) ld.style.display='flex'; if(lm) lm.classList.remove('hidden');
    try {
        const lim = Math.max(1, parseInt(el('kemonoLimit')?.value)||20);
        const posts = await kemonoApiFetch(st.currentQuery, st.currentService, st.offset, lim);
        const valid = posts.map(normalizeKemonoPost).filter(p=>p&&!st.shownIds.has(p.id)&&passesTypeFilter(p.url,st.currentFilter));
        valid.forEach(p=>{st.shownIds.add(p.id);st.items.push(p);});
        if (posts.length < lim) st.done=true;
        st.offset += posts.length;
        const si = booruModalItems.kemono.length; booruModalItems.kemono.push(...valid);
        const frag = document.createDocumentFragment();
        valid.forEach((p,i) => frag.appendChild(buildBooruCard(p, 'kemono', si+i)));
        g.appendChild(frag);
        if (st.done && lm) lm.classList.add('hidden');
    } catch(e) { showBooruError('kemonoGallery','Kemono',e.message); }
    finally { st.loading=false; if(ld) ld.style.display='none'; }
}
function initKemono() {
    booruModalItems.kemono=[];
    el('kemonoLoadBtn')?.addEventListener('click',()=>loadKemono(true));
    el('kemonoClearBtn')?.addEventListener('click',()=>{ const g=el('kemonoGallery');if(g){g.querySelectorAll('video,img,iframe').forEach(e2=>mediaObserver.unobserve(e2));g.innerHTML='';}; kemonoState={...kemonoState,offset:0,done:false,shownIds:new Set(),items:[]}; booruModalItems.kemono=[]; el('kemonoLoadMore')?.classList.add('hidden'); });
    el('kemonoLoadMoreBtn')?.addEventListener('click',()=>loadKemono(false));
    el('kemonoQuery')?.addEventListener('keydown',e=>{if(e.key==='Enter')loadKemono(true);});
    el('kemonoSaveAllBtn')?.addEventListener('click',async()=>{ if(!kemonoState.items.length){showToast('Nothing to save','error');return;} const added=await addGifsToDB(kemonoState.items.map(p=>p.url),'kemono'); gifs=await getAllGifs();buildFuseIndex();applyFilters();showToast(`Saved ${added}`,'success',3000); });
    // Inline load-more observer (makeIntersect is scoped inside initBooruControls)
    (()=>{ const s=el('kemonoLoadMore'); if(s) new IntersectionObserver(e=>{if(e[0].isIntersecting)loadKemono(false);},{rootMargin:'300px'}).observe(s); })();
}

// ════════════════════════════════════════════════════════
// COOMER.ST
// ════════════════════════════════════════════════════════
const COOMER_BASE = 'https://coomer.st';
const COOMER_CDN  = 'https://c1.coomer.st';
let coomerState = { offset:0, loading:false, done:false, currentQuery:'', currentService:'', currentFilter:'all', shownIds:new Set(), items:[] };

function normalizeCoomerPost(post) {
    let f = null;
    if (post.file?.name && post.file?.path) { const ext=post.file.name.split('.').pop().toLowerCase(); if(MEDIA_EXTS.has(ext)) f=post.file; }
    if (!f) { for (const att of (post.attachments||[])) { if(!att.name||!att.path) continue; const ext=att.name.split('.').pop().toLowerCase(); if(MEDIA_EXTS.has(ext)){f=att;break;} } }
    if (!f?.path) return null;
    const url = COOMER_CDN + f.path;
    const type = detectType(url);
    const id = `coomer_${post.service||''}_${post.user||''}_${post.id||''}`;
    return { url, type, tags: [post.service, post.user].filter(Boolean), id, score: null, source: 'coomer', title: post.title||'' };
}
async function coomerApiFetch(query, service, offset, limit) {
    const p = new URLSearchParams({ o: String(offset), limit: String(limit) });
    if (query) p.set('q', query);
    if (service) p.set('service', service);
    const url = `${COOMER_BASE}/api/v1/posts?${p}`;
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error(`Coomer HTTP ${res.status}`);
        const data = await res.json();
        return data.posts ?? (Array.isArray(data) ? data : []);
    } catch(e) {
        const w = getWorkerUrl(); if (!w) throw e;
        const r2 = await fetch(`${w}?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(20000) });
        if (!r2.ok) throw new Error(`Worker Coomer ${r2.status}`);
        const d2 = await r2.json(); return d2.posts ?? (Array.isArray(d2) ? d2 : []);
    }
}
async function loadCoomer(reset=true) {
    const st = coomerState;
    if (st.loading || (!reset && st.done)) return;
    const g=el('coomerGallery'), ld=el('coomerLoading'), lm=el('coomerLoadMore'); if (!g) return;
    if (reset) { st.offset=0; st.done=false; st.shownIds=new Set(); st.items=[]; st.currentQuery=el('coomerQuery')?.value.trim()||''; st.currentService=el('coomerService')?.value||''; st.currentFilter=el('coomerFilter')?.value||'all'; g.innerHTML=''; booruModalItems.coomer=[]; }
    st.loading=true; if(ld) ld.style.display='flex'; if(lm) lm.classList.remove('hidden');
    try {
        const lim = Math.max(1, parseInt(el('coomerLimit')?.value)||20);
        const posts = await coomerApiFetch(st.currentQuery, st.currentService, st.offset, lim);
        const valid = posts.map(normalizeCoomerPost).filter(p=>p&&!st.shownIds.has(p.id)&&passesTypeFilter(p.url,st.currentFilter));
        valid.forEach(p=>{st.shownIds.add(p.id);st.items.push(p);});
        if (posts.length < lim) st.done=true;
        st.offset += posts.length;
        const si = booruModalItems.coomer.length; booruModalItems.coomer.push(...valid);
        const frag = document.createDocumentFragment();
        valid.forEach((p,i) => frag.appendChild(buildBooruCard(p,'coomer',si+i)));
        g.appendChild(frag);
        if (st.done && lm) lm.classList.add('hidden');
    } catch(e) { showBooruError('coomerGallery','Coomer',e.message); }
    finally { st.loading=false; if(ld) ld.style.display='none'; }
}
function initCoomer() {
    booruModalItems.coomer=[];
    el('coomerLoadBtn')?.addEventListener('click',()=>loadCoomer(true));
    el('coomerClearBtn')?.addEventListener('click',()=>{ const g=el('coomerGallery');if(g){g.querySelectorAll('video,img,iframe').forEach(e2=>mediaObserver.unobserve(e2));g.innerHTML='';}; coomerState={...coomerState,offset:0,done:false,shownIds:new Set(),items:[]}; booruModalItems.coomer=[]; el('coomerLoadMore')?.classList.add('hidden'); });
    el('coomerLoadMoreBtn')?.addEventListener('click',()=>loadCoomer(false));
    el('coomerQuery')?.addEventListener('keydown',e=>{if(e.key==='Enter')loadCoomer(true);});
    el('coomerSaveAllBtn')?.addEventListener('click',async()=>{ if(!coomerState.items.length){showToast('Nothing to save','error');return;} const added=await addGifsToDB(coomerState.items.map(p=>p.url),'coomer'); gifs=await getAllGifs();buildFuseIndex();applyFilters();showToast(`Saved ${added}`,'success',3000); });
    (()=>{ const s=el('coomerLoadMore'); if(s) new IntersectionObserver(e=>{if(e[0].isIntersecting)loadCoomer(false);},{rootMargin:'300px'}).observe(s); })();
}

// ════════════════════════════════════════════════════════
// NIJIE.INFO
// Nijie requires session login. From hosted origins CORS will
// likely block the login POST. Works fully when run locally.
// ════════════════════════════════════════════════════════
let nijieSession = { cookies: '', loggedIn: false };

async function nijieLogin(email, password) {
    // Attempt direct POST to nijie login endpoint.
    // From hosted pages this will be blocked by CORS — works locally.
    try {
        const formData = new URLSearchParams({ email, password, save: 'on', ticket: '/' });
        const res = await fetch('https://nijie.info/login_int.php', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Referer': 'https://nijie.info/login.php' },
            body: formData.toString(), signal: AbortSignal.timeout(10000)
        });
        if (res.ok || res.redirected) {
            nijieSession.loggedIn = true;
            localStorage.setItem('nijie_email', email);
            showToast('Nijie login attempted — check if content loads', 'success', 4000);
        }
    } catch(e) {
        showToast('Nijie CORS blocked from hosted page. Run locally for full support.', 'error', 6000);
    }
}

async function nijieSearchFetch(query, page) {
    const url = `https://nijie.info/search.php?word=${encodeURIComponent(query)}&page=${page}&view_type=0&type=illust`;
    const res = await fetch(url, { credentials: 'include', signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`Nijie HTTP ${res.status}`);
    const html = await res.text();
    // Parse image URLs from the search results page HTML
    const matches = [...html.matchAll(/data-original="([^"]+nijie[^"]+\.(jpg|png|gif|webp))"/gi)];
    const ids = [...html.matchAll(/illust_id=(\d+)/g)].map(m=>m[1]);
    return matches.map((m, i) => ({
        url: m[1].startsWith('//') ? 'https:' + m[1] : m[1],
        id: `nijie_${ids[i] || i}`,
        type: detectType(m[1]),
        tags: ['nijie'],
        score: null,
        source: 'nijie'
    }));
}

let nijieState = { page:1, loading:false, done:false, currentQuery:'', currentFilter:'all', shownIds:new Set(), items:[] };
async function loadNijie(reset=true) {
    const st = nijieState;
    if (st.loading || (!reset && st.done)) return;
    const g=el('nijieGallery'), ld=el('nijieLoading'), lm=el('nijieLoadMore'); if (!g) return;
    if (reset) { st.page=1; st.done=false; st.shownIds=new Set(); st.items=[]; st.currentQuery=el('nijieQuery')?.value.trim()||''; st.currentFilter=el('nijieFilter')?.value||'all'; g.innerHTML=''; booruModalItems.nijie=[]; }
    if (!st.currentQuery) { showToast('Enter a search term','error'); return; }
    st.loading=true; if(ld) ld.style.display='flex'; if(lm) lm.classList.remove('hidden');
    try {
        const posts = await nijieSearchFetch(st.currentQuery, st.page);
        const valid = posts.filter(p=>p&&!st.shownIds.has(p.id)&&passesTypeFilter(p.url,st.currentFilter));
        valid.forEach(p=>{st.shownIds.add(p.id);st.items.push(p);});
        if (posts.length < 5) st.done=true;
        st.page++;
        const si = booruModalItems.nijie.length; booruModalItems.nijie.push(...valid);
        const frag = document.createDocumentFragment();
        valid.forEach((p,i) => frag.appendChild(buildBooruCard(p,'nijie',si+i)));
        g.appendChild(frag);
        if (st.done && lm) lm.classList.add('hidden');
    } catch(e) { showBooruError('nijieGallery','Nijie',e.message+' (CORS may block from hosted page — run locally for full support)'); }
    finally { st.loading=false; if(ld) ld.style.display='none'; }
}
function initNijie() {
    booruModalItems.nijie=[];
    el('nijieLoginBtn')?.addEventListener('click',()=>{
        const em=el('nijieEmail')?.value.trim(), pw=el('nijiePassword')?.value.trim();
        if (!em||!pw){showToast('Enter email and password','error');return;}
        nijieLogin(em, pw);
    });
    el('nijieLoadBtn')?.addEventListener('click',()=>loadNijie(true));
    el('nijieClearBtn')?.addEventListener('click',()=>{ const g=el('nijieGallery');if(g){g.querySelectorAll('video,img,iframe').forEach(e2=>mediaObserver.unobserve(e2));g.innerHTML='';}; nijieState={...nijieState,page:1,done:false,shownIds:new Set(),items:[]}; booruModalItems.nijie=[]; el('nijieLoadMore')?.classList.add('hidden'); });
    el('nijieLoadMoreBtn')?.addEventListener('click',()=>loadNijie(false));
    el('nijieQuery')?.addEventListener('keydown',e=>{if(e.key==='Enter')loadNijie(true);});
    el('nijieSaveAllBtn')?.addEventListener('click',async()=>{ if(!nijieState.items.length){showToast('Nothing to save','error');return;} const added=await addGifsToDB(nijieState.items.map(p=>p.url),'nijie'); gifs=await getAllGifs();buildFuseIndex();applyFilters();showToast(`Saved ${added}`,'success',3000); });
    (()=>{ const s=el('nijieLoadMore'); if(s) new IntersectionObserver(e=>{if(e[0].isIntersecting)loadNijie(false);},{rootMargin:'300px'}).observe(s); })();
    // Restore saved email
    const savedEmail = localStorage.getItem('nijie_email');
    if (savedEmail) { const eEl=el('nijieEmail'); if(eEl) eEl.value=savedEmail; }
}

// ════════════════════════════════════════════════════════
// HOVER PREVIEW + CARD INFO OVERLAY
// ════════════════════════════════════════════════════════
let _hPrevEl=null, _hPrevTimer=null;
function initHoverPreview() {
    _hPrevEl = document.createElement('div'); _hPrevEl.id='hoverPreview';
    _hPrevEl.style.cssText='position:fixed;z-index:9100;pointer-events:none;background:var(--bg1);border:1px solid var(--border);border-radius:12px;padding:6px;box-shadow:0 8px 32px rgba(0,0,0,.75);display:none;max-width:360px;';
    document.body.appendChild(_hPrevEl);
    document.addEventListener('mouseover', e => {
        const card = e.target.closest('.card');
        if (!card || !card.dataset.url) { clearTimeout(_hPrevTimer); _hPrevEl.style.display='none'; return; }
        clearTimeout(_hPrevTimer);
        _hPrevTimer = setTimeout(() => _showHoverPrev(card, e), 650);
    });
    document.addEventListener('mouseout', e => { if (e.target.closest('.card')) { clearTimeout(_hPrevTimer); _hPrevEl.style.display='none'; } });
    document.addEventListener('mousemove', e => { if (_hPrevEl.style.display!=='none') _posHoverPrev(e); });
}
function _showHoverPrev(card, e) {
    const url = card.dataset.url, type = detectType(url);
    _hPrevEl.innerHTML = '';
    // Media preview
    const mediaDiv = document.createElement('div'); mediaDiv.style.cssText='margin-bottom:6px;border-radius:8px;overflow:hidden;';
    if (type==='mp4'||type==='webm') {
        const v=document.createElement('video'); v.src=url; v.autoplay=true; v.muted=true; v.loop=true;
        v.style.cssText='width:100%;max-height:240px;display:block;border-radius:6px;'; mediaDiv.appendChild(v);
    } else {
        const i=document.createElement('img'); i.src=url;
        i.style.cssText='width:100%;max-height:240px;display:block;border-radius:6px;object-fit:contain;background:#111;'; mediaDiv.appendChild(i);
    }
    // Info overlay
    const info = document.createElement('div'); info.style.cssText='font-size:.72rem;color:var(--text-muted);line-height:1.5;padding:2px 2px 0;';
    const src = card.dataset.source||'';
    info.innerHTML = `<b style="color:var(--text)">${type.toUpperCase()}</b>${src?' · '+src:''}`;
    // Dimensions
    const imgEl = card.querySelector('img,video');
    if (imgEl) {
        const w = imgEl.naturalWidth||imgEl.videoWidth, h = imgEl.naturalHeight||imgEl.videoHeight;
        if (w&&h) info.innerHTML += ` · ${w}×${h}`;
    }
    // Date
    const gifId = card.dataset.id;
    if (gifId) {
        const gif = gifs.find(g=>g.id==gifId);
        if (gif?.addedAt) { const d=new Date(gif.addedAt); info.innerHTML += `<br>Added ${d.toLocaleDateString()}`; }
    }
    _hPrevEl.appendChild(mediaDiv); _hPrevEl.appendChild(info);
    _hPrevEl.style.display='block'; _posHoverPrev(e);
}
function _posHoverPrev(e) {
    const W=window.innerWidth, H=window.innerHeight, pw=_hPrevEl.offsetWidth||360, ph=_hPrevEl.offsetHeight||280;
    let x=e.clientX+16, y=e.clientY+16;
    if (x+pw>W) x=e.clientX-pw-16; if (y+ph>H) y=e.clientY-ph-16;
    _hPrevEl.style.left=Math.max(0,x)+'px'; _hPrevEl.style.top=Math.max(0,y)+'px';
}

// ════════════════════════════════════════════════════════
// SLIDESHOW MODE
// ════════════════════════════════════════════════════════
let _ssActive=false, _ssTimer=null, _ssIdx=0, _ssItems=[], _ssPaused=false;
function initSlideshow() {
    el('slideshowBtn')?.addEventListener('click', startSlideshow);
    el('slideshowClose')?.addEventListener('click', stopSlideshow);
    el('slideshowPrev')?.addEventListener('click', ()=>_ssAdvance(-1));
    el('slideshowNext')?.addEventListener('click', ()=>_ssAdvance(1));
    el('slideshowPlayPause')?.addEventListener('click', _ssTogglePause);
    document.addEventListener('keydown', e=>{
        if (!_ssActive) return;
        if(e.key==='Escape') stopSlideshow();
        if(e.key==='ArrowLeft') _ssAdvance(-1);
        if(e.key==='ArrowRight') _ssAdvance(1);
        if(e.key===' '){e.preventDefault();_ssTogglePause();}
    });
}
function startSlideshow() {
    _ssItems = filtered.slice(); if (!_ssItems.length){showToast('Nothing to slideshow','error');return;}
    _ssIdx=0; _ssActive=true; _ssPaused=false;
    el('slideshowOverlay')?.classList.remove('hidden'); document.body.style.overflow='hidden';
    _ssShow(0); _ssSchedule();
}
function stopSlideshow() {
    _ssActive=false; clearTimeout(_ssTimer);
    el('slideshowOverlay')?.classList.add('hidden'); document.body.style.overflow='';
    const m=el('slideshowMedia'); if(m)m.innerHTML='';
}
function _ssShow(idx) {
    const gif=_ssItems[idx]; if(!gif) return;
    const m=el('slideshowMedia'); if(!m) return; m.innerHTML='';
    const cnt=el('slideshowCounter'); if(cnt) cnt.textContent=`${idx+1} / ${_ssItems.length}`;
    if(gif.type==='mp4'||gif.type==='webm'){
        const v=document.createElement('video'); v.src=gif.url; v.autoplay=true; v.muted=false; v.loop=true; v.controls=true;
        v.style.cssText='max-width:90vw;max-height:80vh;border-radius:12px;object-fit:contain;'; m.appendChild(v);
    } else {
        const i=document.createElement('img'); i.src=gif.url;
        i.style.cssText='max-width:90vw;max-height:80vh;border-radius:12px;object-fit:contain;'; m.appendChild(i);
    }
    const pg=el('slideshowProg'); const d=_ssDelay();
    if(pg){pg.style.transition='none';pg.style.width='0%';requestAnimationFrame(()=>requestAnimationFrame(()=>{pg.style.transition=`width ${d}ms linear`;pg.style.width='100%';}));}
    // Background preload next 3
    [1,2,3].forEach(off=>{const nxt=_ssItems[(idx+off)%_ssItems.length];if(nxt){const img=new Image();img.src=nxt.url;}});
}
function _ssDelay(){return(parseInt(el('slideshowDelay')?.value)||4)*1000;}
function _ssSchedule(){clearTimeout(_ssTimer);if(!_ssPaused)_ssTimer=setTimeout(()=>_ssAdvance(1),_ssDelay());}
function _ssAdvance(dir){clearTimeout(_ssTimer);_ssIdx=(_ssIdx+dir+_ssItems.length)%_ssItems.length;_ssShow(_ssIdx);if(!_ssPaused)_ssSchedule();}
function _ssTogglePause(){_ssPaused=!_ssPaused;const b=el('slideshowPlayPause');if(b)b.textContent=_ssPaused?'▶ Play':'⏸ Pause';if(_ssPaused){clearTimeout(_ssTimer);}else _ssSchedule();}

// ════════════════════════════════════════════════════════
// COMPACT MODE
// ════════════════════════════════════════════════════════
function initCompactMode() {
    const btn=el('compactModeBtn'); if(!btn) return;
    if(localStorage.getItem('compactMode')==='1'){gallery.classList.add('compact-mode');btn.classList.add('active');}
    btn.addEventListener('click',()=>{
        const on=gallery.classList.toggle('compact-mode'); btn.classList.toggle('active',on);
        btn.title=on?'Dense grid: ON':'Dense grid: OFF'; localStorage.setItem('compactMode',on?'1':'0');
    });
}

// ════════════════════════════════════════════════════════
// EXPORT AS HTML GALLERY
// ════════════════════════════════════════════════════════
function initExportBtn(){el('exportHTMLBtn')?.addEventListener('click',exportGalleryHTML);}
function exportGalleryHTML() {
    if(!filtered.length){showToast('Nothing to export','error');return;}
    const cards=filtered.map(gif=>{
        const isV=gif.type==='mp4'||gif.type==='webm';
        const med=isV
            ?`<video src="${gif.url}" muted loop autoplay playsinline style="width:100%;height:100%;object-fit:cover;"></video>`
            :`<img src="${gif.url}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`;
        return `<a href="${gif.url}" target="_blank" title="${gif.source||''}">${med}</a>`;
    }).join('\n');
    const html=`<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<title>Vault Export — ${filtered.length} items</title>\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0d0d0d;color:#ccc;font-family:sans-serif;padding:10px}h1{margin-bottom:10px;font-size:.85rem;color:#555}.g{display:flex;flex-wrap:wrap;gap:6px}a{width:180px;height:180px;overflow:hidden;border-radius:8px;border:1px solid #2a2a2a;background:#1a1a1a;display:block;transition:transform .15s}a:hover{transform:scale(1.05)}</style>\n</head>\n<body>\n<h1>Vault Export — ${filtered.length} items — ${new Date().toLocaleString()}</h1>\n<div class="g">\n${cards}\n</div>\n</body>\n</html>`;
    const blob=new Blob([html],{type:'text/html'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`vault-${new Date().toISOString().slice(0,10)}.html`; a.click(); URL.revokeObjectURL(a.href);
    showToast(`Exported ${filtered.length} items`,'success',3000);
}

// ════════════════════════════════════════════════════════
// ACCENT COLOR PICKER
// ════════════════════════════════════════════════════════
function initColorPicker() {
    const pk=el('accentColorPicker'); if(!pk) return;
    const saved=localStorage.getItem('accentColor'); if(saved){document.documentElement.style.setProperty('--accent',saved);pk.value=saved;}
    pk.addEventListener('input',()=>document.documentElement.style.setProperty('--accent',pk.value));
    pk.addEventListener('change',()=>localStorage.setItem('accentColor',pk.value));
    el('resetAccentBtn')?.addEventListener('click',()=>{const d='#5b6af0';document.documentElement.style.setProperty('--accent',d);pk.value=d;localStorage.removeItem('accentColor');});
}

// ════════════════════════════════════════════════════════
// BACKGROUND PRELOADING (modal next items)
// ════════════════════════════════════════════════════════
function preloadAhead(items, currentIdx, count=4) {
    for (let i=1;i<=count;i++){
        const item=items[(currentIdx+i)%items.length]; if(!item) continue;
        if(item.type==='mp4'||item.type==='webm'){const v=document.createElement('video');v.preload='metadata';v.src=item.url;}
        else{const img=new Image();img.src=item.url;}
    }
}

// ════════════════════════════════════════════════════════
// VIRTUAL SCROLLING — progressive vault rendering
// Vault already paginates; this adds auto-reveal via sentinel
// ════════════════════════════════════════════════════════
function initVirtualScroll() {
    // Vault already uses IntersectionObserver-driven progressive loading.
    // This is a safe stub — full virtual scroll deferred until vault refactor.
    try {
        const sentinel = document.createElement('div');
        sentinel.id = 'vaultSentinel';
        sentinel.style.cssText = 'height:1px;width:100%;pointer-events:none;';
        if (gallery && gallery.parentNode) {
            gallery.parentNode.insertBefore(sentinel, gallery.nextSibling);
        }
    } catch(e) { /* non-critical */ }
}

init();
