// ===== Visor Comunicacion - version depurada =====
// Limpieza 2: solo capas base Manzana y Lote.
// Se retiro del codigo activo e interno: Edifica, Construccion, Puertas, UCA y Obras complementarias.

const GEO = {
  workspace: "Supabase_Catastro",
  wfsBase: "https://exp-visorcatastral-josereluz.publicvm.com/geoserver/Supabase_Catastro/ows",
  wfsVersion: "1.0.0",
  srsName: "EPSG:4326",
  layers: {
    manzana: "tg_manzana",
    lote: "tg_lote"
  },
  fields: {
    cod_mzna: "cod_mzna",
    cod_lote: "cod_lote",
    cod_sector: "cod_sector",
    ubigeo: "ubigeo"
  }
};

// ===== Cache (memoria + persistente) para respuestas WFS =====
const CACHE = {
  enabled: true,
  version: "v3-clean-base",
  memoryMax: 25,
  defaultTtlMs: 24 * 60 * 60 * 1000,
  baseTtlMs: 24 * 60 * 60 * 1000,
  queryTtlMs: 24 * 60 * 60 * 1000,
  maxEntries: 60,
  maxLocalBytes: 650000,
  maxRawBytes: 8 * 1024 * 1024,
  dbName: "visor-comunicacion-cache",
  storeName: "http"
};

const _memCache = new Map();
const _inflight = new Map();
let _dbPromise = null;

function _now() { return Date.now(); }

function _fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return ("0000000" + h.toString(16)).slice(-8);
}
function _lsKey(key) { return `vcache:${CACHE.version}:${_fnv1a(key)}`; }

function cacheKey(url) {
  try {
    const u = new URL(url, location.href);
    u.searchParams.delete("_t");
    return `${CACHE.version}|${u.toString()}`;
  } catch (e) {
    return `${CACHE.version}|${url}`;
  }
}

function memCacheGet(key) {
  const it = _memCache.get(key);
  if (!it) return null;
  if (it.exp && it.exp < _now()) {
    _memCache.delete(key);
    return null;
  }
  _memCache.delete(key);
  _memCache.set(key, it);
  return it.value;
}

function memCacheSet(key, value, ttlMs = CACHE.defaultTtlMs) {
  const exp = _now() + Math.max(1, ttlMs);
  _memCache.set(key, { exp, value });
  while (_memCache.size > CACHE.memoryMax) {
    const first = _memCache.keys().next().value;
    _memCache.delete(first);
  }
}

function inflightGet(key) { return _inflight.get(key) || null; }
function inflightSet(key, promise) { _inflight.set(key, promise); }
function inflightDel(key) { _inflight.delete(key); }

function _openDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB no disponible"));
    const req = indexedDB.open(CACHE.dbName, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(CACHE.storeName)) {
        const store = db.createObjectStore(CACHE.storeName, { keyPath: "k" });
        store.createIndex("ts", "ts", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("No se pudo abrir IndexedDB"));
  });
  return _dbPromise;
}

async function _idbGet(key) {
  const db = await _openDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(CACHE.storeName, "readonly");
    const st = tx.objectStore(CACHE.storeName);
    const req = st.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function _idbSet(rec) {
  const db = await _openDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(CACHE.storeName, "readwrite");
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.objectStore(CACHE.storeName).put(rec);
  });
}

async function _idbDelete(key) {
  const db = await _openDB();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(CACHE.storeName, "readwrite");
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.objectStore(CACHE.storeName).delete(key);
  });
}

async function _idbPrune(maxEntries = CACHE.maxEntries) {
  const db = await _openDB();
  const now = _now();
  const items = await new Promise((resolve, reject) => {
    const tx = db.transaction(CACHE.storeName, "readonly");
    const st = tx.objectStore(CACHE.storeName);
    const req = st.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });

  const expired = [];
  const alive = [];
  for (const rec of items) {
    if (!rec || !rec.k) continue;
    if (rec.exp && rec.exp < now) expired.push(rec.k);
    else alive.push(rec);
  }

  alive.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  const old = alive.slice(maxEntries).map((r) => r.k);
  const toDelete = [...new Set([...expired, ...old])];
  await Promise.all(toDelete.map((k) => _idbDelete(k).catch(() => false)));
}

async function cacheGetPersistent(key) {
  const now = _now();

  try {
    const rec = await _idbGet(key);
    if (rec && (!rec.exp || rec.exp >= now) && rec.v) {
      return JSON.parse(rec.v);
    }
    if (rec && rec.exp && rec.exp < now) {
      _idbDelete(key).catch(() => false);
    }
  } catch (e) {}

  try {
    const raw = localStorage.getItem(_lsKey(key));
    if (!raw) return null;
    const rec = JSON.parse(raw);
    if (rec && (!rec.exp || rec.exp >= now) && rec.v) return JSON.parse(rec.v);
    localStorage.removeItem(_lsKey(key));
  } catch (e) {}

  return null;
}

async function cacheSetPersistent(key, rawJson, ttlMs = CACHE.defaultTtlMs) {
  if (typeof rawJson !== "string") return false;
  if (rawJson.length > CACHE.maxRawBytes) return false;

  const rec = { k: key, v: rawJson, ts: _now(), exp: _now() + Math.max(1, ttlMs) };

  try {
    await _idbSet(rec);
    _idbPrune().catch(() => false);
    return true;
  } catch (e) {}

  try {
    const packed = JSON.stringify(rec);
    if (packed.length <= CACHE.maxLocalBytes) {
      localStorage.setItem(_lsKey(key), packed);
      return true;
    }
  } catch (e) {}

  return false;
}

async function cacheClearAll() {
  _memCache.clear();
  _inflight.clear();

  try {
    const db = await _openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(CACHE.storeName, "readwrite");
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.objectStore(CACHE.storeName).clear();
    });
  } catch (e) {}

  try {
    const prefix = `vcache:${CACHE.version}:`;
    Object.keys(localStorage).forEach((k) => { if (k.startsWith(prefix)) localStorage.removeItem(k); });
  } catch (e) {}
}

window.__visorClearCache = cacheClearAll;

const MANZANA_LABEL_MIN_ZOOM = 16;
const LOTE_LABEL_MIN_ZOOM = 19;

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function wfsUrl(typeName, opts = {}) {
  const p = new URLSearchParams({
    service: "WFS",
    version: GEO.wfsVersion,
    request: "GetFeature",
    typeName: `${GEO.workspace}:${typeName}`,
    outputFormat: "application/json",
    srsName: GEO.srsName
  });
  if (opts.maxFeatures) p.set("maxFeatures", String(opts.maxFeatures));
  if (opts.cql) p.set("CQL_FILTER", opts.cql);
  if (opts.bbox) p.set("bbox", `${opts.bbox.join(",")},${GEO.srsName}`);
  if (opts.nocache) p.set("_t", String(Date.now()));
  return `${GEO.wfsBase}?${p.toString()}`;
}

async function fetchGeoJSON(url, options = {}) {
  const ttlMs = typeof options.ttlMs === "number" ? options.ttlMs : CACHE.defaultTtlMs;
  const force = !!options.force;
  const signal = options.signal;
  const key = cacheKey(url);

  if (CACHE.enabled && !force) {
    const mem = memCacheGet(key);
    if (mem) return mem;
  }

  if (CACHE.enabled && !force) {
    try {
      const hit = await cacheGetPersistent(key);
      if (hit) {
        memCacheSet(key, hit, ttlMs);
        return hit;
      }
    } catch (e) {}
  }

  if (CACHE.enabled && !force) {
    const inflight = inflightGet(key);
    if (inflight) return inflight;
  }

  const task = (async () => {
    const r = await fetch(url, {
      cache: "no-store",
      signal,
      headers: { Accept: "application/json" }
    });

    const ct = (r.headers.get("content-type") || "").toLowerCase();
    if (!r.ok) throw new Error(`HTTP ${r.status}`);

    const raw = await r.text();
    if (!ct.includes("json")) throw new Error(`No JSON: ${raw.slice(0, 120)}`);

    let gj;
    try {
      gj = JSON.parse(raw);
    } catch (e) {
      throw new Error(`JSON invalido: ${raw.slice(0, 120)}`);
    }
    if (!gj || !Array.isArray(gj.features)) throw new Error("GeoJSON invalido");

    if (CACHE.enabled && !force) {
      try { await cacheSetPersistent(key, raw, ttlMs); } catch (e) {}
      memCacheSet(key, gj, ttlMs);
    }

    return gj;
  })();

  if (CACHE.enabled && !force) inflightSet(key, task);

  try {
    return await task;
  } finally {
    inflightDel(key);
  }
}

const map = L.map("map", {
  center: [-11.979215012270718, -77.06288307210372],
  zoom: 16,
  preferCanvas: true,
  boxZoom: false,
  zoomControl: false
});

const baseOSM = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 22,
  attribution: "&copy; OpenStreetMap contributors"
});

const baseGoogleSat = L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
  maxZoom: 22,
  attribution: "Imagery &copy; Google"
});

const baseCartoLight = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  maxZoom: 22,
  subdomains: "abcd",
  attribution: "&copy; OpenStreetMap contributors, &copy; CARTO"
});

baseCartoLight.addTo(map);

let _basemapDiv = null;
let _legendDiv = null;
let _baseLoaded = false;
let _baseLoading = false;
let _currentUbigeo = null;
let _pendingUbigeo = null;
let _districtBounds = null;
let _baseAbort = null;

function isMobileViewport() {
  try {
    return window.matchMedia ? window.matchMedia("(max-width: 768px)").matches : (window.innerWidth <= 768);
  } catch (e) {
    return window.innerWidth <= 768;
  }
}

function setBasemapCollapsed(collapsed) {
  if (!_basemapDiv) return;
  const btn = _basemapDiv.querySelector(".basemap-toggle");
  _basemapDiv.classList.toggle("collapsed", !!collapsed);
  if (btn) {
    btn.textContent = collapsed ? "\u25b8" : "\u25be";
    btn.title = collapsed ? "Expandir" : "Contraer";
    btn.setAttribute("aria-expanded", String(!collapsed));
  }
}

const BasemapBox = L.Control.extend({
  options: { position: "topright" },
  onAdd: function () {
    const startsCollapsed = isMobileViewport();
    const div = L.DomUtil.create("div", `leaflet-control basemap-box${startsCollapsed ? " collapsed" : ""}`);
    div.innerHTML = `
      <div class="basemap-header">
        <div class="title">Mapa base</div>
        <button type="button" class="basemap-toggle" aria-expanded="${String(!startsCollapsed)}" title="${startsCollapsed ? "Expandir" : "Contraer"}">${startsCollapsed ? "&#9656;" : "&#9662;"}</button>
      </div>
      <div class="basemap-options">
        <label><input type="radio" name="basemap" value="osm"> OSM</label>
        <label><input type="radio" name="basemap" value="light" checked> Mapa claro</label>
        <label><input type="radio" name="basemap" value="sat"> Google satelital</label>
      </div>
    `;
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);

    _basemapDiv = div;
    setBasemapCollapsed(isMobileViewport());

    const btn = div.querySelector(".basemap-toggle");
    if (btn) {
      btn.addEventListener("click", (e) => {
        L.DomEvent.stop(e);
        setBasemapCollapsed(!_basemapDiv.classList.contains("collapsed"));
      });
    }

    return div;
  }
});
const DashboardButton = L.Control.extend({
  options: { position: "topright" },
  onAdd: function () {
    const div = L.DomUtil.create("div", "leaflet-control dashboard-box");
    div.innerHTML = `
      <button type="button" class="dashboard-btn" aria-label="Dashboard" title="Dashboard proximamente">
        <span class="dashboard-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M4 19.5h16" />
            <path d="M7 16V11" />
            <path d="M12 16V7" />
            <path d="M17 16v-4" />
          </svg>
        </span>
        <span class="dashboard-text">Dashboard</span>
      </button>
    `;
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    const btn = div.querySelector(".dashboard-btn");
    btn?.addEventListener("click", (e) => {
      L.DomEvent.stop(e);
    });
    return div;
  }
});
map.addControl(new DashboardButton());
map.addControl(new BasemapBox());

function setLegendCollapsed(collapsed) {
  if (!_legendDiv) return;
  const btn = _legendDiv.querySelector(".legend-toggle");
  _legendDiv.classList.toggle("collapsed", !!collapsed);
  if (btn) {
    btn.textContent = collapsed ? "\u25b8" : "\u25be";
    btn.title = collapsed ? "Expandir" : "Contraer";
    btn.setAttribute("aria-expanded", String(!collapsed));
  }
}

function legendItemSwatch(color, kind = "line") {
  const safe = escapeHtml(color);
  if (kind === "point") return `<span class="lg-swatch lg-point" style="background:${safe};border-color:${safe};"></span>`;
  if (kind === "poly") return `<span class="lg-swatch lg-poly" style="background:${safe};border-color:${safe};"></span>`;
  return `<span class="lg-swatch lg-line" style="border-color:${safe};"></span>`;
}

function updateLegend() {
  if (!_legendDiv) return;
  const body = _legendDiv.querySelector(".legend-body");
  if (!body) return;

  const isOn = (id) => {
    const el = document.getElementById(id);
    return !!(el && el.checked);
  };

  const rows = [];
  if (isOn("layer-base-manzana")) rows.push(`<div class="legend-row">${legendItemSwatch("#ff00ff", "line")}<span>Manzana</span></div>`);
  if (isOn("layer-base-lote")) rows.push(`<div class="legend-row">${legendItemSwatch("#ffd400", "line")}<span>Lote</span></div>`);

  if (!rows.length) {
    body.innerHTML = `<div class="legend-empty">Activa una capa para ver la leyenda.</div>`;
    return;
  }

  body.innerHTML = `
    <div class="legend-section">
      <div class="legend-sec-title">Capa Base</div>
      ${rows.join("")}
    </div>
  `;
}

const LegendBox = L.Control.extend({
  options: { position: "bottomright" },
  onAdd: function () {
    const startsCollapsed = isMobileViewport();
    const div = L.DomUtil.create("div", `leaflet-control legend-box${startsCollapsed ? " collapsed" : ""}`);
    div.innerHTML = `
      <div class="legend-header">
        <div class="title">Leyenda</div>
        <button type="button" class="legend-toggle" aria-expanded="${String(!startsCollapsed)}" title="${startsCollapsed ? "Expandir" : "Contraer"}">${startsCollapsed ? "&#9656;" : "&#9662;"}</button>
      </div>
      <div class="legend-body"></div>
    `;

    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);

    const btn = div.querySelector(".legend-toggle");
    btn?.addEventListener("click", (e) => {
      L.DomEvent.stop(e);
      setLegendCollapsed(!_legendDiv.classList.contains("collapsed"));
    });

    _legendDiv = div;
    setLegendCollapsed(isMobileViewport());
    updateLegend();
    return div;
  }
});
map.addControl(new LegendBox());

const searchMz = document.getElementById("search-manzana");
const searchLt = document.getElementById("search-lote");
const searchSector = document.getElementById("search-sector");
const searchDistrito = document.getElementById("search-distrito");
const btnSearch = document.getElementById("btn-search");
const searchResult = document.getElementById("search-result");

const CornerControl = L.Control.extend({
  options: { position: "topleft" },
  onAdd: function () {
    const container = L.DomUtil.create("div", "leaflet-control corner-control");
    container.innerHTML = `
      <div class="leaflet-bar corner-north" title="Norte" aria-label="Norte">
        <svg class="corner-north-svg" width="28" height="28" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="white" opacity="0.92"/>
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="6"/>
          <path d="M50 12 L62 52 L50 44 L38 52 Z" fill="currentColor"/>
          <path d="M50 88 L38 48 L50 56 L62 48 Z" fill="currentColor" opacity="0.18"/>
          <text x="50" y="78" text-anchor="middle" font-size="26" font-family="system-ui,Segoe UI,Arial" font-weight="800" fill="currentColor">N</text>
        </svg>
      </div>
      <div class="leaflet-bar corner-zoom" aria-label="Zoom">
        <a class="corner-zoom-in" href="#" title="Acercar" role="button" aria-label="Acercar">+</a>
        <a class="corner-zoom-out" href="#" title="Alejar" role="button" aria-label="Alejar">&minus;</a>
      </div>
      <div class="leaflet-bar corner-refresh" aria-label="Actualizar capas">
        <a class="corner-refresh-btn" href="#" title="Actualizar capas" role="button" aria-label="Actualizar capas">&#10227;</a>
      </div>
      <div class="leaflet-bar corner-locate" aria-label="Mi ubicacion">
        <a class="corner-locate-btn" href="#" title="Ir a mi ubicacion" role="button" aria-label="Ir a mi ubicacion">&#x1F4CD;</a>
      </div>
      <div class="leaflet-bar corner-panel-toggle" aria-label="Panel lateral">
        <a class="corner-panel-btn" href="#" title="Mostrar panel" role="button" aria-label="Mostrar panel">&#9776;</a>
      </div>
    `;

    L.DomEvent.disableClickPropagation(container);

    const zoomIn = container.querySelector(".corner-zoom-in");
    const zoomOut = container.querySelector(".corner-zoom-out");
    const refreshBtn = container.querySelector(".corner-refresh-btn");
    const locateBtn = container.querySelector(".corner-locate-btn");
    const panelBtn = container.querySelector(".corner-panel-btn");

    zoomIn?.addEventListener("click", (e) => {
      L.DomEvent.stop(e);
      map.zoomIn();
    });

    zoomOut?.addEventListener("click", (e) => {
      L.DomEvent.stop(e);
      map.zoomOut();
    });

    refreshBtn?.addEventListener("click", async (e) => {
      L.DomEvent.stop(e);
      const ub = (searchDistrito && searchDistrito.value) || _currentUbigeo || "";

      if (_baseLoading) {
        try { if (_baseAbort) _baseAbort.abort(); } catch (_) {}
        try { await cacheClearAll(); } catch (_) {}
        location.reload();
        return;
      }

      try { await cacheClearAll(); } catch (_) {}
      _baseLoaded = false;
      _currentUbigeo = null;

      if (ub) {
        try {
          await loadBaseForUbigeo(ub);
          focusDistrict(ub);
        } catch (_) {
          location.reload();
        }
      } else {
        location.reload();
      }
    });

    let _locMarker = null;
    let _locCircle = null;
    function _clearLoc() {
      if (_locMarker) { map.removeLayer(_locMarker); _locMarker = null; }
      if (_locCircle) { map.removeLayer(_locCircle); _locCircle = null; }
    }

    map.on("locationfound", (ev) => {
      _clearLoc();
      _locCircle = L.circle(ev.latlng, { radius: ev.accuracy, color: "#2563eb", weight: 2, fillColor: "#60a5fa", fillOpacity: 0.15 }).addTo(map);
      _locMarker = L.circleMarker(ev.latlng, { radius: 6, color: "#2563eb", weight: 2, fillColor: "#2563eb", fillOpacity: 1 }).addTo(map);
    });

    map.on("locationerror", () => {
      _clearLoc();
      alert("No se pudo obtener tu ubicacion. Verifica permisos de ubicacion en el navegador.");
    });

    locateBtn?.addEventListener("click", (e) => {
      L.DomEvent.stop(e);
      map.locate({ setView: true, maxZoom: Math.max(map.getZoom(), 18), enableHighAccuracy: true, timeout: 10000 });
    });

    panelBtn?.addEventListener("click", (e) => {
      L.DomEvent.stop(e);
      const band = getViewportBand();
      const isMobile = band === "mobile" || band === "mobile-small";
      if (!isMobile || !panelCapas) return;
      setPanelCollapsed(!panelCapas.classList.contains("collapsed"), { auto: false });
    });

    return container;
  }
});
map.addControl(new CornerControl());

L.control.scale({ position: "bottomleft", imperial: false }).addTo(map);

const MeasureControl = L.Control.extend({
  options: { position: "bottomleft" },
  onAdd: function () {
    const container = L.DomUtil.create("div", "leaflet-control measure-control");
    container.innerHTML = `
      <button class="measure-btn measure-btn-distance" data-mode="distance" title="Medir distancia">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 6L3 6M3 6L3 18M3 18L21 18M21 18L21 6M7 10L7 14M11 10L11 14M15 10L15 14M19 10L19 14"/>
        </svg>
        <span class="measure-text">Medir distancia</span>
      </button>
      <button class="measure-btn measure-btn-area" data-mode="area" title="Medir area">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16v16H4z"/>
          <path d="M8 8h8v8H8z" opacity="0.25"/>
        </svg>
        <span class="measure-text">Medir area</span>
      </button>
    `;
    L.DomEvent.disableClickPropagation(container);
    return container;
  }
});
map.addControl(new MeasureControl());

let measuring = false;
let measureMode = "distance";
let measureLine = null;
let measurePolygon = null;
let measureMarkers = [];
let measurePoints = [];

function formatDistance(meters) {
  if (meters < 1000) return meters.toFixed(2) + " m";
  return (meters / 1000).toFixed(2) + " km";
}

function formatArea(m2) {
  if (m2 < 10000) return m2.toFixed(2) + " m2";
  if (m2 < 1000000) return (m2 / 10000).toFixed(2) + " ha";
  return (m2 / 1000000).toFixed(4) + " km2";
}

function geodesicArea(latLngs) {
  const d2r = Math.PI / 180;
  const radius = 6378137;
  let area = 0.0;
  const len = latLngs.length;
  if (len < 3) return 0;
  for (let i = 0; i < len; i++) {
    const p1 = latLngs[i];
    const p2 = latLngs[(i + 1) % len];
    area += ((p2.lng - p1.lng) * d2r) * (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
  }
  area = area * radius * radius / 2.0;
  return Math.abs(area);
}

document.addEventListener("click", (e) => {
  const btn = (e.target && (e.target.classList.contains("measure-btn") || e.target.closest(".measure-btn")))
    ? (e.target.classList.contains("measure-btn") ? e.target : e.target.closest(".measure-btn"))
    : null;
  if (!btn) return;

  const mode = btn.getAttribute("data-mode") || "distance";
  if (measuring && measureMode === mode) {
    measuring = false;
  } else {
    measuring = true;
    measureMode = mode;
  }

  const distBtn = document.querySelector(".measure-btn-distance");
  const areaBtn = document.querySelector(".measure-btn-area");

  const setActive = (el, active) => {
    if (!el) return;
    if (active) el.classList.add("is-active");
    else el.classList.remove("is-active");
  };

  setActive(distBtn, measuring && measureMode === "distance");
  setActive(areaBtn, measuring && measureMode === "area");

  if (measuring) {
    map.getContainer().style.cursor = "crosshair";
    try { map.doubleClickZoom.disable(); } catch (_) {}
  } else {
    map.getContainer().style.cursor = "";
    try { map.doubleClickZoom.enable(); } catch (_) {}
    if (measureLine) map.removeLayer(measureLine);
    if (measurePolygon) map.removeLayer(measurePolygon);
    measureMarkers.forEach((m) => map.removeLayer(m));
    measureLine = null;
    measurePolygon = null;
    measureMarkers = [];
    measurePoints = [];
    map.closePopup();
  }
});

map.on("click", function (e) {
  if (!measuring) return;

  if (measureMode === "area") {
    try { map.doubleClickZoom.disable(); } catch (_) {}
  }

  measurePoints.push(e.latlng);

  const marker = L.circleMarker(e.latlng, {
    radius: 5,
    color: "#e74c3c",
    fillColor: "#e74c3c",
    fillOpacity: 1,
    weight: 2
  }).addTo(map);
  measureMarkers.push(marker);

  if (measureMode === "distance") {
    if (measurePoints.length >= 2) {
      if (measureLine) map.removeLayer(measureLine);
      let totalDistance = 0;
      for (let i = 0; i < measurePoints.length - 1; i++) {
        totalDistance += measurePoints[i].distanceTo(measurePoints[i + 1]);
      }

      measureLine = L.polyline(measurePoints, {
        color: "#e74c3c",
        weight: 3,
        dashArray: "10, 10"
      }).addTo(map);

      const lastPoint = measurePoints[measurePoints.length - 1];
      L.popup({ closeButton: true, autoClose: false, closeOnClick: false, className: "measure-popup" })
        .setLatLng(lastPoint)
        .setContent(`<div class="measure-card"><div class="measure-label">Distancia</div><div class="measure-value">${formatDistance(totalDistance)}</div></div>`)
        .openOn(map);
    }
    return;
  }

  if (measureMode === "area") {
    if (measurePoints.length >= 2) {
      if (measureLine) map.removeLayer(measureLine);
      measureLine = L.polyline(measurePoints, {
        color: "#e74c3c",
        weight: 2.5,
        dashArray: "8, 8"
      }).addTo(map);
    }

    if (measurePoints.length >= 3) {
      if (measurePolygon) map.removeLayer(measurePolygon);
      measurePolygon = L.polygon(measurePoints, {
        color: "#e74c3c",
        weight: 2.5,
        dashArray: "8, 8",
        fillColor: "#e74c3c",
        fillOpacity: 0.08
      }).addTo(map);
    }
  }
});

map.on("dblclick", function (e) {
  if (!measuring || measureMode !== "area") return;
  if (e && e.originalEvent) {
    try { L.DomEvent.stop(e.originalEvent); } catch (_) {}
  }
  try { map.doubleClickZoom.disable(); } catch (_) {}
  if (measurePoints.length < 3) return;

  const area = geodesicArea(measurePoints);
  if (measurePolygon) map.removeLayer(measurePolygon);
  measurePolygon = L.polygon(measurePoints, {
    color: "#e74c3c",
    weight: 2.5,
    dashArray: "8, 8",
    fillColor: "#e74c3c",
    fillOpacity: 0.10
  }).addTo(map);

  const lastPoint = measurePoints[measurePoints.length - 1];
  L.popup({ closeButton: true, autoClose: false, closeOnClick: false, className: "measure-popup" })
    .setLatLng(lastPoint)
    .setContent(`<div class="measure-card"><div class="measure-label">Area</div><div class="measure-value">${formatArea(area)}</div></div>`)
    .openOn(map);

  measuring = false;
  document.querySelector(".measure-btn-distance")?.classList.remove("is-active");
  document.querySelector(".measure-btn-area")?.classList.remove("is-active");
  map.getContainer().style.cursor = "";
});

map.on("popupclose", function (e) {
  if (e.popup && e.popup.getElement && e.popup.getElement().classList.contains("measure-popup")) {
    if (measureLine) map.removeLayer(measureLine);
    if (measurePolygon) map.removeLayer(measurePolygon);
    measureMarkers.forEach((m) => map.removeLayer(m));
    measureLine = null;
    measurePolygon = null;
    measureMarkers = [];
    measurePoints = [];
    measuring = false;
    try { map.doubleClickZoom.enable(); } catch (_) {}
    document.querySelector(".measure-btn-distance")?.classList.remove("is-active");
    document.querySelector(".measure-btn-area")?.classList.remove("is-active");
    map.getContainer().style.cursor = "";
  }
});

document.addEventListener("change", (e) => {
  if (e.target && e.target.name === "basemap") {
    const v = e.target.value;
    if (map.hasLayer(baseOSM)) map.removeLayer(baseOSM);
    if (map.hasLayer(baseGoogleSat)) map.removeLayer(baseGoogleSat);
    if (map.hasLayer(baseCartoLight)) map.removeLayer(baseCartoLight);

    if (v === "sat") baseGoogleSat.addTo(map);
    else if (v === "light") baseCartoLight.addTo(map);
    else baseOSM.addTo(map);
  }
});

function makePane(name, z) {
  const p = map.createPane(name);
  p.style.zIndex = String(z);
  return p;
}
makePane("lotePane", 520);
makePane("manzanaPane", 580);
makePane("highlightPane", 620);

const RENDERERS = {
  lote: L.canvas({ pane: "lotePane", padding: 0.5, tolerance: 10 }),
  manzana: L.canvas({ pane: "manzanaPane", padding: 0.5, tolerance: 10 }),
  highlight: L.svg({ pane: "highlightPane" })
};

function ensureLayerOrder() {
  try {
    const zi = {
      lotePane: "520",
      manzanaPane: "580",
      highlightPane: "950"
    };
    Object.keys(zi).forEach((k) => {
      const p = map.getPane(k);
      if (p) p.style.zIndex = zi[k];
    });
  } catch (e) {}

  const bringGroupFront = (g) => {
    try { g?.eachLayer?.((l) => l?.bringToFront?.()); } catch (e) {}
  };

  if (map.hasLayer(layerLote)) bringGroupFront(layerLote);
  if (map.hasLayer(layerManzana)) bringGroupFront(layerManzana);
}

const manzanaTooltips = [];
const loteTooltips = [];

function _cqlUbigeo(ub) {
  const f = GEO.fields.ubigeo;
  const u = String(ub || "").trim();
  if (!u) return "";
  if (/^\d+$/.test(u)) {
    const n = String(parseInt(u, 10));
    return (n && n !== u) ? `(${f}='${u}' OR ${f}=${n})` : `(${f}='${u}' OR ${f}=${u})`;
  }
  return `${f}='${u}'`;
}

async function loadBaseForUbigeo(ubigeo) {
  const requested = String(ubigeo || "").trim();
  if (!requested) return;

  if (_baseLoaded && _currentUbigeo === requested) return;
  if (_baseLoading) {
    _pendingUbigeo = requested;
    return;
  }

  _baseLoading = true;
  _baseLoaded = false;
  _currentUbigeo = null;
  _pendingUbigeo = null;

  try {
    try { if (_baseAbort) _baseAbort.abort(); } catch (e) {}
    _baseAbort = new AbortController();
    if (searchResult) searchResult.textContent = "Cargando capas del distrito...";

    manzanaTooltips.length = 0;
    loteTooltips.length = 0;
    layerLote.clearLayers();
    layerManzana.clearLayers();

    const cql = _cqlUbigeo(requested);
    const [gjL, gjM] = await Promise.all([
      fetchGeoJSON(wfsUrl(GEO.layers.lote, { maxFeatures: 200000, cql }), { ttlMs: CACHE.baseTtlMs, signal: _baseAbort.signal }),
      fetchGeoJSON(wfsUrl(GEO.layers.manzana, { maxFeatures: 200000, cql }), { ttlMs: CACHE.baseTtlMs, signal: _baseAbort.signal })
    ]);

    layerLote.addData(gjL);
    layerManzana.addData(gjM);

    try { _districtBounds = _computeDistrictBounds(gjM, GEO.fields.ubigeo); } catch (e) { _districtBounds = null; }

    _baseLoaded = true;
    _currentUbigeo = requested;

    updateLegend();
    ensureLayerOrder();
    updateLabelOpacity();
    if (searchResult) searchResult.textContent = "";

    const queued = String(_pendingUbigeo || "").trim();
    if (queued && queued !== requested) {
      _pendingUbigeo = null;
      setTimeout(() => { loadBaseForUbigeo(queued).catch((e) => console.warn(e)); }, 0);
      return;
    }

    focusDistrict(requested);
  } catch (e) {
    console.warn(e);
    if (searchResult) searchResult.textContent = "Aviso: no se pudieron cargar capas base (WFS/CORS).";
  } finally {
    _baseLoading = false;
  }
}

const layerLote = L.geoJSON(null, {
  pane: "lotePane",
  interactive: false,
  renderer: RENDERERS.lote,
  style: {
    fill: false,
    color: "#ffd400",
    weight: 2.2,
    fillColor: "#ffd400",
    fillOpacity: 0.0
  },
  onEachFeature: (ft, lyr) => {
    const v = ft?.properties?.[GEO.fields.cod_lote];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      lyr.bindTooltip(String(v), {
        permanent: true,
        direction: "center",
        className: "lbl-lote",
        opacity: 0
      });
      loteTooltips.push(lyr.getTooltip());
    }
  }
});

const layerManzana = L.geoJSON(null, {
  pane: "manzanaPane",
  interactive: false,
  renderer: RENDERERS.manzana,
  style: {
    fill: false,
    color: "#ff00ff",
    weight: 2.2,
    fillColor: "#ff00ff",
    fillOpacity: 0.0
  },
  onEachFeature: (ft, lyr) => {
    const v = ft?.properties?.[GEO.fields.cod_mzna];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      lyr.bindTooltip(String(v), {
        permanent: true,
        direction: "center",
        className: "lbl-manzana",
        opacity: 0.9
      });
      manzanaTooltips.push(lyr.getTooltip());
    }
  }
});

ensureLayerOrder();

function syncBaseLayerVisibilityFromUI() {
  try {
    const cbLote = document.getElementById("layer-base-lote");
    const cbManzana = document.getElementById("layer-base-manzana");

    if (cbLote && cbLote.checked) {
      if (!map.hasLayer(layerLote)) layerLote.addTo(map);
    } else if (map.hasLayer(layerLote)) {
      map.removeLayer(layerLote);
    }

    if (cbManzana && cbManzana.checked) {
      if (!map.hasLayer(layerManzana)) layerManzana.addTo(map);
    } else if (map.hasLayer(layerManzana)) {
      map.removeLayer(layerManzana);
    }

    updateLegend();
    ensureLayerOrder();
  } catch (e) {
    console.warn(e);
  }
}

function updateLabelOpacity() {
  const z = map.getZoom();
  const mzOp = (z >= MANZANA_LABEL_MIN_ZOOM) ? 1 : 0;
  manzanaTooltips.forEach((t) => t && t.setOpacity(mzOp));
  const lotOp = (z >= LOTE_LABEL_MIN_ZOOM) ? 1 : 0;
  loteTooltips.forEach((t) => t && t.setOpacity(lotOp));
}
map.on("zoomend", updateLabelOpacity);
updateLabelOpacity();

let flashLayer = null;
let flashTimer = null;

function clearFlash() {
  if (flashTimer) { clearTimeout(flashTimer); flashTimer = null; }
  if (flashLayer) { try { map.removeLayer(flashLayer); } catch (e) {} flashLayer = null; }
}

function flashGeoJSON(gj, opts = {}) {
  if (!gj || !Array.isArray(gj.features) || gj.features.length === 0) return;
  clearFlash();

  const duration = Number.isFinite(opts.duration) ? opts.duration : 3000;
  const lineColor = opts.color || "#ffd400";
  const style = opts.style || { color: lineColor, weight: 6, fillColor: lineColor, fillOpacity: 0.14, opacity: 1 };
  const pt = opts.pointStyle || { radius: 8, color: lineColor, weight: 3, fillColor: lineColor, fillOpacity: 0.9 };

  flashLayer = L.geoJSON(gj, {
    pane: "highlightPane",
    renderer: RENDERERS.highlight,
    interactive: false,
    style: () => style,
    pointToLayer: (_, latlng) => L.circleMarker(latlng, pt)
  }).addTo(map);

  flashTimer = setTimeout(() => {
    if (flashLayer) {
      try { map.removeLayer(flashLayer); } catch (e) {}
      flashLayer = null;
    }
    flashTimer = null;
  }, duration);
}



async function doSearch() {
  clearFlash();

  const clean = (v) => (v === undefined || v === null) ? "" : String(v).trim();
  const strip0 = (s) => {
    const t = clean(s);
    if (!t) return "";
    const u = t.replace(/^0+/, "");
    return u === "" ? "0" : u;
  };
  const eqCode = (a, b) => {
    const A = clean(a), B = clean(b);
    if (!A || !B) return false;
    return (A === B) || (strip0(A) === strip0(B));
  };
  const pad = (v, n) => {
    const s = clean(v);
    if (!s) return "";
    return (/^\d+$/.test(s) && n) ? s.padStart(n, "0") : s;
  };

  const ubigeo = clean(searchDistrito?.value);
  const sector = pad(searchSector?.value, 2);
  const mz = pad(searchMz?.value, 3);
  const lt = pad(searchLt?.value, 3);

  if (!ubigeo && !sector && !mz) {
    if (searchResult) searchResult.textContent = "Aviso: selecciona Distrito o ingresa Sector o Manzana.";
    return;
  }
  if (lt && !mz) {
    if (searchResult) searchResult.textContent = "Aviso: para buscar un lote, ingresa tambien la Manzana.";
    return;
  }

  try {
    if (searchResult) searchResult.textContent = "Buscando...";

    const hasBaseMz = layerManzana && layerManzana.getLayers && layerManzana.getLayers().length > 0;
    const hasBaseLt = layerLote && layerLote.getLayers && layerLote.getLayers().length > 0;

    if (lt) {
      if (!hasBaseLt) {
        if (searchResult) searchResult.textContent = "Cargando capa Lote... intenta de nuevo en unos segundos.";
        return;
      }
      const matches = [];
      layerLote.eachLayer((lyr) => {
        const p = lyr?.feature?.properties || {};
        if (eqCode(p[GEO.fields.cod_mzna], mz) && eqCode(p[GEO.fields.cod_lote], lt)) {
          matches.push(lyr.feature);
        }
      });

      if (!matches.length) {
        if (searchResult) searchResult.textContent = "No se encontro el lote.";
        return;
      }

      const gj = { type: "FeatureCollection", features: matches };
      flashGeoJSON(gj, { color: "#ffd400", duration: 3000 });

      try {
        const b = flashLayer ? flashLayer.getBounds() : L.geoJSON(gj).getBounds();
        if (b && b.isValid()) map.fitBounds(b, { padding: [30, 30] });
      } catch (e) {}

      if (searchResult) searchResult.textContent = `Lote ${lt} (Mz ${mz}) encontrado`;
      return;
    }

    if (!hasBaseMz) {
      if (searchResult) searchResult.textContent = "Cargando capa Manzana... intenta de nuevo en unos segundos.";
      return;
    }

    const matches = [];
    layerManzana.eachLayer((lyr) => {
      const p = lyr?.feature?.properties || {};
      if (mz && !eqCode(p[GEO.fields.cod_mzna], mz)) return;
      if (sector && !eqCode(p[GEO.fields.cod_sector], sector)) return;
      if (ubigeo && !eqCode(p[GEO.fields.ubigeo], ubigeo)) return;
      matches.push(lyr.feature);
    });

    if (!matches.length) {
      if (mz && !sector && !ubigeo) {
        if (searchResult) searchResult.textContent = "No se encontro la manzana.";
      } else {
        if (searchResult) searchResult.textContent = "No se encontraron resultados con esos filtros.";
      }
      return;
    }

    const gj = { type: "FeatureCollection", features: matches };
    flashGeoJSON(gj, { color: "#ffd400", duration: 3000 });

    try {
      const b = flashLayer ? flashLayer.getBounds() : L.geoJSON(gj).getBounds();
      if (b && b.isValid()) map.fitBounds(b, { padding: [30, 30] });
    } catch (e) {}

    const n = matches.length;
    const distritoName = ubigeo === "150112" ? "Independencia" : (ubigeo === "150110" ? "Comas" : ubigeo);
    if (mz && !sector && !ubigeo) {
      if (searchResult) searchResult.textContent = `Manzana ${mz} encontrada`;
      return;
    }
    const tags = [];
    if (ubigeo) tags.push(`Distrito ${distritoName}`);
    if (sector) tags.push(`Sector ${sector}`);
    if (mz) tags.push(`Mz ${mz}`);
    if (searchResult) searchResult.textContent = `${n} manzana(s) encontrada(s) - ${tags.join(" | ")}`;
  } catch (err) {
    console.error(err);
    if (searchResult) searchResult.textContent = "Error al buscar. Revisa la consola.";
  }
}

btnSearch?.addEventListener("click", doSearch);
searchMz?.addEventListener("keypress", (e) => { if (e.key === "Enter") doSearch(); });
searchLt?.addEventListener("keypress", (e) => { if (e.key === "Enter") doSearch(); });

function openDistrictModal() {
  const modal = document.getElementById("district-modal");
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeDistrictModal() {
  const modal = document.getElementById("district-modal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function focusDistrict(ubigeo) {
  if (!ubigeo) return;

  try {
    const b = _districtBounds && _districtBounds[ubigeo];
    if (b && b.isValid && b.isValid()) {
      map.fitBounds(b, { padding: [30, 30] });
      return;
    }
  } catch (e) {}

  try {
    const b = L.latLngBounds([]);
    layerManzana.eachLayer((lyr) => {
      const p = lyr?.feature?.properties || {};
      if (String(p?.[GEO.fields.ubigeo] ?? "").trim() === String(ubigeo).trim()) {
        const bb = lyr.getBounds && lyr.getBounds();
        if (bb && bb.isValid && bb.isValid()) b.extend(bb);
      }
    });
    if (b && b.isValid && b.isValid()) map.fitBounds(b, { padding: [30, 30] });
  } catch (e) {}
}

async function setDistrict(ubigeo) {
  const ub = String(ubigeo || "").trim();
  if (!ub) return;
  if (searchDistrito) searchDistrito.value = ub;

  if (_baseLoaded && _currentUbigeo === ub) {
    focusDistrict(ub);
    return;
  }

  _pendingUbigeo = ub;
  await loadBaseForUbigeo(ub);
}

function bindDistrictModal() {
  const modal = document.getElementById("district-modal");
  if (!modal) return;
  modal.querySelectorAll(".district-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const ub = btn.getAttribute("data-ubigeo");
      closeDistrictModal();
      try { await setDistrict(ub); } catch (e) { console.warn(e); }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindDistrictModal();
  openDistrictModal();
  syncBaseLayerVisibilityFromUI();
  setAllSidebarGroupsCollapsed();
  syncBuscadorAccordion();

  if (searchDistrito) {
    searchDistrito.addEventListener("change", () => {
      const ub = String(searchDistrito.value || "").trim();
      if (ub) setDistrict(ub).catch((e) => console.warn(e));
    });
  }
});

function _computeDistrictBounds(gj, ubigeoField) {
  const out = {};
  const acc = {};

  const extend = (u, lng, lat) => {
    if (!isFinite(lng) || !isFinite(lat)) return;
    if (!acc[u]) acc[u] = { minLng: lng, minLat: lat, maxLng: lng, maxLat: lat };
    const b = acc[u];
    if (lng < b.minLng) b.minLng = lng;
    if (lat < b.minLat) b.minLat = lat;
    if (lng > b.maxLng) b.maxLng = lng;
    if (lat > b.maxLat) b.maxLat = lat;
  };

  const walk = (u, coords) => {
    if (!coords) return;
    if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === "number" && typeof coords[1] === "number") {
      extend(u, coords[0], coords[1]);
      return;
    }
    if (Array.isArray(coords)) coords.forEach((c) => walk(u, c));
  };

  const feats = (gj && gj.features) ? gj.features : [];
  feats.forEach((ft) => {
    const u = String(ft?.properties?.[ubigeoField] ?? "").trim();
    if (!u) return;
    const g = ft && ft.geometry;
    if (!g) return;
    walk(u, g.coordinates);
  });

  Object.keys(acc).forEach((u) => {
    const b = acc[u];
    out[u] = L.latLngBounds([b.minLat, b.minLng], [b.maxLat, b.maxLng]);
  });
  return out;
}

const panelCapas = document.getElementById("panelCapas");
const toggleBtn = document.getElementById("toggleBtn");
const mobilePanelOverlay = document.getElementById("mobilePanelOverlay");
const FORCE_FULL_SIDEBAR = false;
let _lastViewportBand = null;
let _panelOffsetRaf = null;
let _panelFollowRaf = null;
let _lastLeftOffset = null;
const PANEL_TRANSITION_MS = 280;
const PANEL_FOLLOW_EXTRA_MS = 90;

function getHorizontalOverlapPx(foregroundRect, backgroundRect) {
  if (!foregroundRect || !backgroundRect) return 0;
  const left = Math.max(foregroundRect.left, backgroundRect.left);
  const right = Math.min(foregroundRect.right, backgroundRect.right);
  return Math.max(0, right - left);
}

function updateMapLeftControlOffsets() {
  try {
    if (_panelOffsetRaf) {
      cancelAnimationFrame(_panelOffsetRaf);
      _panelOffsetRaf = null;
    }

    _panelOffsetRaf = requestAnimationFrame(() => {
      const mapEl = document.getElementById("map");
      if (!mapEl) return;

      const leftControlGroups = mapEl.querySelectorAll(
        ".leaflet-top.leaflet-left, .leaflet-bottom.leaflet-left"
      );
      const scaleControls = mapEl.querySelectorAll(".leaflet-control-scale");
      const mapRect = mapEl.getBoundingClientRect();
      const band = getViewportBand();
      const isMobile = band === "mobile" || band === "mobile-small";
      const isCollapsed = !!(panelCapas && panelCapas.classList.contains("collapsed"));
      const baseGap = 10;
      let overlapPx = 0;

      if (panelCapas) {
        overlapPx = Math.max(overlapPx, getHorizontalOverlapPx(panelCapas.getBoundingClientRect(), mapRect));
      }

      if (isCollapsed && toggleBtn) {
        overlapPx = Math.max(overlapPx, getHorizontalOverlapPx(toggleBtn.getBoundingClientRect(), mapRect));
      }
      let leftOffset = Math.max(baseGap, overlapPx + baseGap);
      if (isMobile) {
        // En movil mantenemos una posicion fija para evitar el deslizamiento lateral
        // de los controles al abrir/cerrar el panel.
        leftOffset = baseGap;
      }
      const isTransitioning = document.body.classList.contains("panel-transitioning");
      if (_lastLeftOffset !== null) {
        const delta = leftOffset - _lastLeftOffset;
        if (isTransitioning) {
          leftOffset = _lastLeftOffset + (delta * 0.42);
        } else if (Math.abs(delta) < 0.75) {
          leftOffset = _lastLeftOffset;
        }
      }
      leftOffset = Math.round(leftOffset * 100) / 100;
      _lastLeftOffset = leftOffset;

      leftControlGroups.forEach((el) => {
        el.style.setProperty("left", `${leftOffset}px`, "important");
      });
      scaleControls.forEach((el) => {
        el.style.setProperty("margin-left", `${leftOffset}px`, "important");
      });
    });
  } catch (e) {}
}

function stopPanelOffsetTracking() {
  if (_panelFollowRaf) {
    cancelAnimationFrame(_panelFollowRaf);
    _panelFollowRaf = null;
  }
}

function startPanelOffsetTracking(maxMs = PANEL_TRANSITION_MS + PANEL_FOLLOW_EXTRA_MS) {
  stopPanelOffsetTracking();
  const t0 = (window.performance && performance.now) ? performance.now() : Date.now();

  const tick = () => {
    updateMapLeftControlOffsets();
    const now = (window.performance && performance.now) ? performance.now() : Date.now();
    const elapsed = now - t0;
    const active = document.body.classList.contains("panel-transitioning");
    if (active && elapsed < maxMs) {
      _panelFollowRaf = requestAnimationFrame(tick);
      return;
    }
    _panelFollowRaf = null;
  };

  _panelFollowRaf = requestAnimationFrame(tick);
}

function getViewportBand() {
  const w = window.innerWidth || document.documentElement.clientWidth || 0;
  if (w <= 575.98) return "mobile-small";
  if (w <= 767.98) return "mobile";
  if (w <= 1199.98) return "narrow";
  return "wide";
}

function updatePanelButtons() {
  try {
    const band = getViewportBand();
    const isMobile = band === "mobile" || band === "mobile-small";
    const isCollapsed = !!(panelCapas && panelCapas.classList.contains("collapsed"));
    if (toggleBtn) {
      toggleBtn.textContent = isMobile ? (isCollapsed ? "\u2630" : "\u2715") : (isCollapsed ? "\u25c0" : "\u25b6");
      toggleBtn.setAttribute("aria-label", isCollapsed ? "Mostrar panel" : "Ocultar panel");
      toggleBtn.title = isCollapsed ? "Mostrar panel" : "Ocultar panel";
    }
    const cornerPanelBtn = document.querySelector(".corner-panel-btn");
    if (cornerPanelBtn) {
      cornerPanelBtn.textContent = isCollapsed ? "\u2630" : "\u2715";
      cornerPanelBtn.setAttribute("aria-label", isCollapsed ? "Mostrar panel" : "Ocultar panel");
      cornerPanelBtn.title = isCollapsed ? "Mostrar panel" : "Ocultar panel";
    }
  } catch (e) {}
}


function syncMobilePanelChrome() {
  try {
    const band = getViewportBand();
    const isMobile = band === "mobile" || band === "mobile-small";
    const isCollapsed = !!(panelCapas && panelCapas.classList.contains("collapsed"));
    if (mobilePanelOverlay) {
      mobilePanelOverlay.setAttribute("aria-hidden", String(!(isMobile && !isCollapsed)));
    }
  } catch (e) {}
}

function syncPanelResponsiveState(options = {}) {
  try {
    const band = getViewportBand();
    const isMobile = band === "mobile" || band === "mobile-small";
    const isNarrow = isMobile || band === "narrow";
    const isCollapsed = !!(panelCapas && panelCapas.classList.contains("collapsed"));

    document.body.classList.toggle("panel-mobile-open", isMobile && !isCollapsed);
    document.body.classList.toggle("panel-mobile-collapsed", isMobile && isCollapsed);
    document.body.classList.toggle("panel-narrow-open", isNarrow && !isCollapsed);
    document.body.classList.toggle("panel-narrow-collapsed", isNarrow && isCollapsed);
    document.body.classList.toggle("panel-collapsed", isCollapsed);
    document.body.classList.toggle("panel-open", !isCollapsed);
    updatePanelButtons();
    syncMobilePanelChrome();
    if (!options.skipOffsets) updateMapLeftControlOffsets();
  } catch (e) {}
}

let _panelTransitionTimer = null;

function setPanelCollapsed(collapsed, options = {}) {
  if (!panelCapas) return;
  const isAuto = !!options.auto;
  panelCapas.classList.toggle("collapsed", !!collapsed);
  panelCapas.dataset.autoCollapsed = isAuto && collapsed ? "1" : "0";
  document.body.classList.add("panel-transitioning");
  syncPanelResponsiveState({ skipOffsets: true });
  startPanelOffsetTracking(PANEL_TRANSITION_MS + PANEL_FOLLOW_EXTRA_MS);

  requestAnimationFrame(() => {
    try { map.invalidateSize(); } catch (e) {}
  });

  if (_panelTransitionTimer) clearTimeout(_panelTransitionTimer);
  _panelTransitionTimer = setTimeout(() => {
    document.body.classList.remove("panel-transitioning");
    stopPanelOffsetTracking();
    try { map.invalidateSize(); } catch (e) {}
    updateMapLeftControlOffsets();
  }, PANEL_TRANSITION_MS);
}

if (toggleBtn && panelCapas) {
  toggleBtn.addEventListener("click", () => {
    if (FORCE_FULL_SIDEBAR) return;
    setPanelCollapsed(!panelCapas.classList.contains("collapsed"), { auto: false });
  });

  panelCapas.addEventListener("transitionend", (ev) => {
    if (!ev || ev.propertyName !== "transform") return;
    document.body.classList.remove("panel-transitioning");
    stopPanelOffsetTracking();
    updateMapLeftControlOffsets();
    try { map.invalidateSize(); } catch (e) {}
  });
}

if (mobilePanelOverlay && panelCapas) {
  mobilePanelOverlay.addEventListener("click", () => {
    if (FORCE_FULL_SIDEBAR) return;
    const band = getViewportBand();
    const isMobile = band === "mobile" || band === "mobile-small";
    if (isMobile && !panelCapas.classList.contains("collapsed")) {
      setPanelCollapsed(true, { auto: false });
    }
  });
}

window.addEventListener("keydown", (ev) => {
  if (ev.key !== "Escape") return;
  if (FORCE_FULL_SIDEBAR) return;
  const band = getViewportBand();
  const isMobile = band === "mobile" || band === "mobile-small";
  if (isMobile && panelCapas && !panelCapas.classList.contains("collapsed")) {
    setPanelCollapsed(true, { auto: false });
  }
});


(function () {
  try {
    const applyResponsiveChrome = (forceInitial = false) => {
      const band = getViewportBand();
      const isMobile = band === "mobile" || band === "mobile-small";
      const wasMobile = _lastViewportBand === "mobile" || _lastViewportBand === "mobile-small";
      const autoCollapsed = panelCapas?.dataset?.autoCollapsed === "1";

      if (forceInitial || _lastViewportBand === null) {
        if (panelCapas) {
          setPanelCollapsed(false, { auto: false });
        }
        setBasemapCollapsed(!!isMobile);
        setLegendCollapsed(!!isMobile);
        _lastViewportBand = band;
        syncPanelResponsiveState();
        return;
      }

      if (isMobile && !wasMobile) {
        setPanelCollapsed(false, { auto: false });
        setBasemapCollapsed(true);
        setLegendCollapsed(true);
      } else if (!isMobile && wasMobile) {
        if (autoCollapsed) setPanelCollapsed(false, { auto: false });
        setBasemapCollapsed(false);
        setLegendCollapsed(false);
      }

      _lastViewportBand = band;
      syncPanelResponsiveState();
    };

    applyResponsiveChrome(true);

    let t = null;
    let raf = null;
    const bump = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        updateMapLeftControlOffsets();
      });
      clearTimeout(t);
      t = setTimeout(() => {
        applyResponsiveChrome(false);
        try { map.invalidateSize(); } catch (e) {}
        updateMapLeftControlOffsets();
      }, 180);
    };
    window.addEventListener("orientationchange", bump);
    window.addEventListener("resize", bump);
  } catch (e) {}
})();

window.addEventListener("load", () => {
  setTimeout(() => { updateMapLeftControlOffsets(); }, 60);
  setTimeout(() => { updateMapLeftControlOffsets(); }, 260);
});

try {
  map.whenReady(() => {
    updateMapLeftControlOffsets();
    setTimeout(() => { updateMapLeftControlOffsets(); }, 120);
  });
} catch (e) {}



function syncBuscadorAccordion() {
  const body = document.getElementById("grupo-buscador");
  if (!body) return;

  if (FORCE_FULL_SIDEBAR && body.classList.contains("closed")) {
    body.classList.remove("closed");
  }
  const isOpen = FORCE_FULL_SIDEBAR ? true : !body.classList.contains("closed");
  const group = body.closest(".buscador-grupo");
  if (group) {
    group.classList.toggle("is-open", isOpen);
    group.classList.toggle("is-closed", !isOpen);
    // Fallback defensivo: mantener visible el bloque del buscador en todos los breakpoints.
    group.style.setProperty("display", "block", "important");
    group.style.setProperty("visibility", "visible", "important");
    group.style.setProperty("opacity", "1", "important");

    const header = group.querySelector(".grupo-header");
    if (header) {
      header.style.setProperty("display", "flex", "important");
      header.style.setProperty("visibility", "visible", "important");
      header.style.setProperty("opacity", "1", "important");
      const arrow = header.querySelector(".arrow");
      if (arrow && FORCE_FULL_SIDEBAR) arrow.textContent = "\u25BE";
    }
  }

  body.style.setProperty("display", isOpen ? "block" : "none", "important");
  body.style.setProperty("height", isOpen ? "auto" : "0", "important");
  body.style.setProperty("max-height", isOpen ? "none" : "0", "important");
  body.style.setProperty("overflow", isOpen ? "visible" : "hidden", "important");
  body.style.setProperty("opacity", isOpen ? "1" : "0", "important");
  body.style.setProperty("visibility", isOpen ? "visible" : "hidden", "important");
  body.style.setProperty("padding-top", isOpen ? "12px" : "0", "important");
  body.style.setProperty("padding-bottom", isOpen ? "14px" : "0", "important");
  body.style.setProperty("margin", "0", "important");
  body.style.setProperty("border", isOpen ? "0" : "0", "important");

  const section = body.querySelector(".buscador-section");
  if (section) {
    section.style.setProperty("display", isOpen ? "block" : "none", "important");
    section.style.setProperty("height", isOpen ? "auto" : "0", "important");
    section.style.setProperty("max-height", isOpen ? "none" : "0", "important");
    section.style.setProperty("overflow", isOpen ? "visible" : "hidden", "important");
    section.style.setProperty("opacity", isOpen ? "1" : "0", "important");
    section.style.setProperty("visibility", isOpen ? "visible" : "hidden", "important");
  }

  body.querySelectorAll("label, input, select, button, .search-result").forEach((el) => {
    el.style.setProperty("display", isOpen ? "block" : "none", "important");
    el.style.setProperty("opacity", isOpen ? "1" : "0", "important");
    el.style.setProperty("visibility", isOpen ? "visible" : "hidden", "important");
  });
}

function setAllSidebarGroupsCollapsed() {
  document.querySelectorAll(".panel-capas .grupo-header").forEach((hdr) => {
    const targetId = hdr.getAttribute("data-target");
    if (!targetId) return;
    const body = document.getElementById(targetId);
    if (!body) return;
    body.classList.add("closed");
    const arrow = hdr.querySelector(".arrow");
    if (arrow) arrow.textContent = "\u25B8";
  });
}

document.querySelectorAll(".grupo-header").forEach((hdr) => {
  hdr.addEventListener("click", (ev) => {
    if (ev && ev.target && ev.target.closest && ev.target.closest("input, label")) return;
    const targetId = hdr.getAttribute("data-target");
    if (!targetId) return;

    const body = document.getElementById(targetId);
    if (!body) return;

    if (FORCE_FULL_SIDEBAR) {
      body.classList.remove("closed");
      const arrowFixed = hdr.querySelector(".arrow");
      if (arrowFixed) arrowFixed.textContent = "\u25BE";
      if (targetId === "grupo-buscador") setTimeout(syncBuscadorAccordion, 0);
      return;
    }

    body.classList.toggle("closed");
    const arrow = hdr.querySelector(".arrow");
    if (arrow) arrow.textContent = body.classList.contains("closed") ? "\u25B8" : "\u25BE";
    if (targetId === "grupo-buscador") setTimeout(syncBuscadorAccordion, 0);
  });
});

setAllSidebarGroupsCollapsed();
syncBuscadorAccordion();

function bindToggle(id, onEnable, onDisable) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("change", async () => {
    try {
      if (el.checked) await onEnable();
      else await onDisable();
    } catch (e) {
      console.warn(e);
      el.checked = false;
    }
  });
}

bindToggle(
  "layer-base-manzana",
  async () => { if (!map.hasLayer(layerManzana)) layerManzana.addTo(map); updateLegend(); ensureLayerOrder(); },
  async () => { if (map.hasLayer(layerManzana)) map.removeLayer(layerManzana); updateLegend(); ensureLayerOrder(); }
);

bindToggle(
  "layer-base-lote",
  async () => { if (!map.hasLayer(layerLote)) layerLote.addTo(map); updateLegend(); ensureLayerOrder(); },
  async () => { if (map.hasLayer(layerLote)) map.removeLayer(layerLote); updateLegend(); ensureLayerOrder(); }
);

updateLegend();
