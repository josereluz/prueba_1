// ===== Visor Comunicacion - version depurada =====
// Prueba WFS: capas base Manzana y Sector desde GeoServer NE, filtradas por ubigeo y dibujadas como vector.
// Se retiro del codigo activo e interno: Edifica, Construccion, Puertas, UCA y Obras complementarias.

const GEO = {
  workspace: "ne",
  wfsBase: "https://geoserver.georeluz.net.pe/geoserver/ne/ows",
  wmsBase: "https://geoserver.georeluz.net.pe/geoserver/ne/wms",
  wfsVersion: "1.0.0",
  wmsVersion: "1.1.0",
  srsName: "EPSG:4326",
  layers: {
    manzana: "manzana",
    sector: "sector"
  },
  fields: {
    cod_mzna: "cod_mzna",
    cod_sector: "cod_sector",
    ubigeo: "ubigeo"
  },
  fieldAliases: {
    ubigeo: ["ubigeo", "cod_ubigeo", "UBIGEO", "COD_UBIGEO", "codubigeo", "codigo_ubigeo"],
    cod_mzna: ["cod_mzna", "cod_manzana", "cod_manzan", "manzana", "mzna", "mz", "COD_MZNA", "COD_MANZANA", "COD_MANZAN"],
    cod_sector: ["cod_sector", "sector", "sec", "COD_SECTOR", "SECTOR"]
  }
};

const DISTRICT_SOURCE = {
  wfsBase: "https://geoserver.georeluz.net.pe/geoserver/ne/ows",
  wfsVersion: "1.0.0",
  typeName: "ne:Distrito",
  srsName: "EPSG:4326",
  fields: {
    ubigeo: ["cod_ubigeo", "ubigeo", "UBIGEO", "codubigeo", "codigo_ubigeo"],
    name: ["nom_dist", "nom_distrito", "distrito", "NOM_DIST", "NOM_DISTRITO", "nombre", "name"],
    lote: ["lote", "LOTE", "Lote", "lot"]
  },
  fallback: [
    { ubigeo: "150101", nombre: "Lima" },
    { ubigeo: "150108", nombre: "Chorrillos" },
    { ubigeo: "150110", nombre: "Comas" },
    { ubigeo: "150111", nombre: "El Agustino" },
    { ubigeo: "150112", nombre: "Independencia" },
    { ubigeo: "150133", nombre: "San Juan de Miraflores" },
    { ubigeo: "150135", nombre: "San Martin de Porres" },
    { ubigeo: "150136", nombre: "San Miguel" },
    { ubigeo: "150142", nombre: "Villa El Salvador" }
  ]
};

const ALL_DISTRICTS_VALUE = "__ALL__";

const LOTE_GROUPS = {
  lote_3ab: {
    label: "Lote 3A – 3B",
    detail: "Comas e Independencia",
    ubigeos: ["150110", "150112"]
  },
  lote_3c: {
    label: "Lote 3C",
    detail: "SMP",
    ubigeos: ["150135"]
  },
  lote_4: {
    label: "Lote 4",
    detail: "San Miguel, El Agustino",
    ubigeos: ["150136", "150111"]
  },
  lote_5: {
    label: "Lote 5",
    detail: "Chorrillos, SJM, VES",
    ubigeos: ["150108", "150133", "150142"]
  },
  lote_6: {
    label: "Lote 6",
    detail: "Lima",
    ubigeos: ["150101"]
  }
};

const POLIGONOS_CIC_SOURCE = {
  wfsBase: "https://geoserver.georeluz.net.pe/geoserver/ne/ows",
  wfsVersion: "1.0.0",
  typeName: "ne:tg_poligono",
  srsName: "EPSG:4326",
  ubigeoFields: ["ubigeo", "cod_ubigeo", "UBIGEO", "COD_UBIGEO"],
  districtFields: ["distrito", "nom_dist", "nom_distrito"],
  poligonoFields: ["codigo_poligono", "cod_poligono", "poligono", "codigo", "cod_cic", "cic", "CODIGO_POLIGONO", "COD_POLIGONO", "POLIGONO", "CIC"],
  hiddenPopupFields: ["id", "fid", "fid_origen", "ubigeo", "cod_ubigeo", "codigo_poligono", "cod_poligono", "poligono"],
  lineColor: "#2563eb",
  fillColor: "#93c5fd"
};

const MANZANA_POLIGONO_SOURCE = {
  wfsBase: "https://geoserver.georeluz.net.pe/geoserver/ne/ows",
  wfsVersion: "1.0.0",
  typeName: "ne:manzana_poligono",
  srsName: "EPSG:4326",
  ubigeoFields: ["ubigeo", "cod_ubigeo", "UBIGEO", "COD_UBIGEO", "codubigeo", "codigo_ubigeo"],
  lineColor: "#111827",
  fillColor: "#111827"
};

const POLIGONO_LOTE_EMPRESA_BY_UBIGEO = {
  "150112": "Lote 3A - EXP",
  "150110": "Lote 3B - EXP",
  "150135": "Lote 3C - INSYS",
  "150136": "Lote 4 - EXP",
  "150111": "Lote 4 - EXP",
  "150108": "Lote 5 - Telespazio",
  "150133": "Lote 5 - Telespazio",
  "150142": "Lote 5 - Telespazio",
  "150101": "Lote 6 - ICL"
};

// Colores por código de polígono, no por distrito.
// Se evita usar tonos muy parecidos a manzana, sector y límite distrital.
const POLIGONO_COLOR_PALETTE = [
  { line: "#e11d48", fill: "#e11d48" }, // rose
  { line: "#2563eb", fill: "#2563eb" }, // azul
  { line: "#7c3aed", fill: "#7c3aed" }, // violeta
  { line: "#ea580c", fill: "#ea580c" }, // naranja fuerte
  { line: "#be185d", fill: "#be185d" }, // magenta oscuro
  { line: "#1d4ed8", fill: "#1d4ed8" }, // azul intenso
  { line: "#dc2626", fill: "#dc2626" }, // rojo
  { line: "#9333ea", fill: "#9333ea" }, // purpura
  { line: "#b45309", fill: "#b45309" }, // marron dorado
  { line: "#0ea5e9", fill: "#0ea5e9" }, // celeste
  { line: "#c026d3", fill: "#c026d3" }, // fucsia violeta
  { line: "#4f46e5", fill: "#4f46e5" }, // indigo
  { line: "#f43f5e", fill: "#f43f5e" }, // coral
  { line: "#a21caf", fill: "#a21caf" }, // morado fucsia
  { line: "#1e40af", fill: "#1e40af" }, // azul profundo
  { line: "#c2410c", fill: "#c2410c" }, // ladrillo
  { line: "#9f1239", fill: "#9f1239" }, // vino
  { line: "#6d28d9", fill: "#6d28d9" }, // violeta oscuro
  { line: "#0284c7", fill: "#0284c7" }, // azul acero
  { line: "#b91c1c", fill: "#b91c1c" }, // rojo oscuro
  { line: "#d946ef", fill: "#d946ef" }, // fucsia brillante
  { line: "#3b82f6", fill: "#3b82f6" }, // azul claro
  { line: "#f97316", fill: "#f97316" }, // naranja
  { line: "#8b5cf6", fill: "#8b5cf6" }  // lila
];

const POLIGONO_COLOR_DEFAULT = { line: POLIGONOS_CIC_SOURCE.lineColor, fill: POLIGONOS_CIC_SOURCE.fillColor };

const POLIGONO_POPUP_ROWS = [
  { label: "Lote / Empresa", editKey: "lote_empresa", keys: ["lote / empresa", "lote_empresa", "lote_emp", "empresa", "lote"] },
  { label: "Entregable / Cod_IGN FI", editKey: "entregable_cod_ign_fi", keys: ["entregable_cod_ign_fi", "entregable / cod_ign fi", "entregable", "ign_fi_cod", "cod_ign_fi", "ign fi cod"] },
  { label: "Unidades Catastrales", editKey: "unidades_catastrales", keys: ["unidades_catastrales", "unidades catastrales", "uucc", "u c", "uc"] },
  { label: "Sector", editKey: "sector", keys: ["sector", "sector_csv", "sector_oficial", "cod_sector"] },
  { label: "Versión", editKey: "version", keys: ["version", "versión", "VERSION", "ver", "vers"] },
  { label: "N° CIC", editKey: "n_cic", keys: ["n° cic", "nº cic", "no cic", "n cic", "nro_cic", "n_cic", "num_cic", "numero_cic", "numero cic", "cic"] },
  { label: "CIC difusión", editKey: "cic_difusion", keys: ["cic difusion", "cic difusión", "cic_difusion", "fecha_difusion", "fecha difusión", "difusion"] },
  { label: "Fotografías difusión", editKey: "fotografias_difusion", keys: ["fotografias difusion", "fotografías difusión", "fotografias_difusion", "fotos_difusion"] },
  { label: "CIC inicio", editKey: "cic_inicio", keys: ["cic inicio", "cic_inicio", "fecha_inicio", "fecha inicio", "inicio"] },
  { label: "Fotografías inicio", editKey: "fotografias_inicio", keys: ["fotografias inicio", "fotografías inicio", "fotografias_inicio", "fotos_inicio"] },
  { label: "CIC cierre", editKey: "cic_cierre", keys: ["cic cierre", "cic_cierre", "fecha_cierre", "fecha cierre", "cierre"] },
  { label: "Fotografías cierre", editKey: "fotografias_cierre", keys: ["fotografias cierre", "fotografías cierre", "fotografias_cierre", "fotos_cierre"] }
];

const DASHBOARD_URL = "https://ignfi365-my.sharepoint.com/:x:/r/personal/jreluz_ignfi_fr/_layouts/15/Doc.aspx?sourcedoc=%7BCF414D46-7205-49C6-BEFD-10CD2A25DCAA%7D&file=Supervision_Comunicacion.xlsx&action=default&mobileredirect=true&wdOrigin=APPHOME-WEB.DIRECT%2CAPPHOME-WEB.FILEBROWSER.RECENT&wdPreviousSession=b7ad2c1d-dc50-4e9f-8f93-141ef9fff039&wdPreviousSessionSrc=AppHomeWeb&ct=1782785703426";

const SIMPLE_LOGIN_USERS = [
  { username: "admin", password: "123456", displayName: "Administrador" },
  { username: "jose", password: "123456", displayName: "Jose" }
];

const SIMPLE_AUTH_STORAGE_KEY = "visor_comunicacion_simple_auth";
const THEME_STORAGE_KEY = "visor_comunicacion_theme_mode";
const POLIGONO_EDIT_STORAGE_KEY = "visor_comunicacion_poligono_ediciones_cic_ignfi_v2_fechas2026_v4_counts";
try {
  ["visor_comunicacion_poligono_ediciones_v1", "visor_comunicacion_poligono_ediciones_v2", "visor_comunicacion_poligono_ediciones_oficial_v1", "visor_comunicacion_poligono_ediciones_cic_ignfi_v2", "visor_comunicacion_poligono_ediciones_cic_ignfi_v2_complementado_v1", "visor_comunicacion_poligono_ediciones_cic_ignfi_v2_fechas2026_v2", "visor_comunicacion_poligono_ediciones_cic_ignfi_v2_fechas2026_v3"].forEach((k) => {
    if (k !== POLIGONO_EDIT_STORAGE_KEY) localStorage.removeItem(k);
  });
} catch (e) {}

function applyNightMode(enabled, persist = true) {
  const on = !!enabled;
  try { document.body.classList.toggle("night-mode", on); } catch (_) {}
  if (persist) {
    try { localStorage.setItem(THEME_STORAGE_KEY, on ? "night" : "day"); } catch (_) {}
  }
  try {
    document.querySelectorAll(".corner-night-btn").forEach((btn) => {
      btn.textContent = on ? "☀" : "☾";
      btn.title = on ? "Modo claro" : "Modo noche";
      btn.setAttribute("aria-label", on ? "Activar modo claro" : "Activar modo noche");
    });
  } catch (_) {}
}

function initNightModePreference() {
  let saved = "day";
  try { saved = localStorage.getItem(THEME_STORAGE_KEY) || "day"; } catch (_) {}
  applyNightMode(saved === "night", false);
}

function toggleNightMode() {
  applyNightMode(!document.body.classList.contains("night-mode"), true);
}

initNightModePreference();


try {
  window.addEventListener("load", () => applyNightMode(document.body.classList.contains("night-mode"), false));
} catch (_) {}


// Contadores visibles para Polígonos Totales, CIC Totales y CIC activos.
let _lastPoligonoCounts = { total: 0, cicTotal: 0, activos: 0 };

function ensurePoligonoCountBadges() {
  const targets = [
    ["layer-poligonos-supervision", "total"],
    ["layer-poligonos-cic-totales", "cicTotal"],
    ["layer-poligonos-activos", "activos"]
  ];
  targets.forEach(([id, key]) => {
    const input = document.getElementById(id);
    const label = input?.closest?.("label");
    if (!label || label.querySelector(`.layer-count-badge[data-count-key="${key}"]`)) return;
    const badge = document.createElement("span");
    badge.className = "layer-count-badge";
    badge.setAttribute("data-count-key", key);
    badge.textContent = "0";
    badge.title = "Cantidad de polígonos en la selección actual";
    label.appendChild(badge);
  });
}

function updatePoligonoCountBadges(counts = {}) {
  ensurePoligonoCountBadges();
  _lastPoligonoCounts = {
    total: Number.isFinite(Number(counts.total)) ? Number(counts.total) : (_lastPoligonoCounts.total || 0),
    cicTotal: Number.isFinite(Number(counts.cicTotal)) ? Number(counts.cicTotal) : (_lastPoligonoCounts.cicTotal || 0),
    activos: Number.isFinite(Number(counts.activos)) ? Number(counts.activos) : (_lastPoligonoCounts.activos || 0)
  };
  document.querySelectorAll(".layer-count-badge").forEach((badge) => {
    const key = badge.getAttribute("data-count-key");
    const val = _lastPoligonoCounts[key];
    badge.textContent = Number.isFinite(Number(val)) ? String(Number(val).toLocaleString("en-US")) : "0";
  });
}

function computePoligonoCountsFromFeatures(features = []) {
  const arr = Array.isArray(features) ? features : [];
  return {
    total: arr.length,
    cicTotal: arr.filter((ft) => isPoligonoCicTotal(ft?.properties || {})).length,
    activos: arr.filter((ft) => isPoligonoCicActivo(ft?.properties || {})).length
  };
}

function clearPoligonoCountBadges() {
  updatePoligonoCountBadges({ total: 0, cicTotal: 0, activos: 0 });
}

const POLIGONO_EDIT_API = {
  enabled: false,
  saveUrl: "", // Futuro endpoint real, por ejemplo: https://tu-dominio/api/poligono-info
  mode: "localStorage" // Cambiar a "api" cuando exista backend.
};

const POLIGONO_EDIT_FIELD_IDS = {
  lote_empresa: "edit-lote-empresa",
  entregable_cod_ign_fi: "edit-entregable-cod-ign-fi",
  unidades_catastrales: "edit-unidades-catastrales",
  sector: "edit-sector",
  version: "edit-version",
  n_cic: "edit-n-cic",
  cic_difusion: "edit-cic-difusion",
  fotografias_difusion: "edit-fotografias-difusion",
  cic_inicio: "edit-cic-inicio",
  fotografias_inicio: "edit-fotografias-inicio",
  cic_cierre: "edit-cic-cierre",
  fotografias_cierre: "edit-fotografias-cierre"
};

const PUNTOS_DISTRITOS_SOURCE = {
  wfsBase: "https://geoserver.georeluz.net.pe/geoserver/ne/ows",
  wfsVersion: "1.0.0",
  // Capa puntual publicada en GeoServer.
  // La tabla actual usa principalmente los campos: id, Tipo, Fotografia y distrito.
  typeName: "ne:punto",
  typeNames: ["ne:punto"],
  srsName: "EPSG:4326",
  ubigeoFields: [],
  tipoFields: ["Tipo", "tipo", "TIPO", "tipo_local", "tipo_punto", "categoria", "clase", "descripcion", "descrip", "observacion", "TIPO_LOCAL"],
  nombreFields: ["Tipo", "tipo", "nombre", "nom_local", "nombre_local", "local", "municipalidad", "local_tecnico", "descripcion", "NOMBRE", "NOM_LOCAL"],
  distritoFields: ["distrito", "Distrito", "DISTRITO", "nom_dist", "nom_distrito", "nombre_distrito", "NOM_DIST"],
  loteEmpresaFields: ["lote_empresa", "lote / empresa", "lote", "empresa", "contratista", "LOTE", "EMPRESA"],
  fotoFields: ["Fotografia", "fotografia", "foto", "fotografias", "url_foto", "foto_url", "imagen", "link", "url", "FOTO", "URL_FOTO"],
  ubicacionFields: ["Ubicacion", "ubicacion", "ubicación", "direccion", "dirección", "Direccion", "DIRECCION", "referencia", "Referencia", "localizacion", "localización"],
  idFields: ["id", "fid", "gid", "codigo", "cod_local", "codigo_local", "CODIGO", "COD_LOCAL"]
};

const PUNTO_FOTO_STORAGE_KEY = "visor_comunicacion_puntos_fotos_v1";

let currentSimpleUser = null;
const _poligonoPropsByCode = new Map();
let _activePoligonoSearch = null;


// ===== Cache (memoria + persistente) para respuestas WFS =====
const CACHE = {
  enabled: true,
  version: "v54-noche-ui-final",
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

const MANZANA_LABEL_MIN_ZOOM = 17;
const SECTOR_LABEL_MIN_ZOOM = 14;

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeFieldKey(key) {
  return String(key || "").trim().toLowerCase();
}

function isMeaningfulPopupValue(v) {
  if (v === undefined || v === null) return false;
  const text = String(v).replace(/\s+/g, " ").trim();
  if (!text) return false;
  return !/^(null|none|nan)$/i.test(text);
}

function _isPhotoUrlField(key) {
  const k = normalizeFieldKey(key).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return k.includes("fotografia") || k.includes("fotografias") || k.includes("fotos");
}

function _extractUrls(text) {
  return String(text || "").match(/https?:\/\/[^\s,;]+/gi) || [];
}

function formatPhotoUrlValue(v) {
  const raw = String(v || "").trim();
  if (!isMeaningfulPopupValue(raw)) return "&mdash;";
  const urls = uniqueList(_extractUrls(raw));
  if (!urls.length) return escapeHtml(raw);
  const links = urls.map((url, idx) => {
    const label = urls.length === 1 ? "Abrir URL" : `Abrir URL ${idx + 1}`;
    return `<a class="popup-url-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  const remainder = raw.replace(/https?:\/\/[^\s,;]+/gi, "").replace(/[\s,;]+/g, " ").trim();
  return `${links.join("<br>")}${remainder ? `<div class="popup-url-note">${escapeHtml(remainder)}</div>` : ""}`;
}

function normalizeCicNumber(value) {
  const raw = String(value === undefined || value === null ? "" : value).trim();
  if (!raw) return "";
  const match = raw.match(/(?:CIC\s*[-–—]?\s*)?(\d{1,3})/i);
  if (!match) return "";
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n <= 0) return "";
  return String(n).padStart(2, "0");
}

function formatCicDisplayValue(value) {
  const num = normalizeCicNumber(value);
  return num ? `CIC - ${escapeHtml(num)}` : "&mdash;";
}

function extractCicEditNumber(value) {
  return normalizeCicNumber(value);
}

function normalizeCicSaveValue(value) {
  const num = normalizeCicNumber(value);
  return num ? `CIC - ${num}` : "";
}

function formatPopupValue(key, v) {
  if (v === undefined || v === null) return "&mdash;";
  const normalizedKey = normalizeFieldKey(key);
  const compactKey = normalizedKey.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  if (compactKey === "ncic" || compactKey === "cic" || compactKey === "nrocic" || compactKey === "numerocic" || compactKey === "numcic") {
    return formatCicDisplayValue(v);
  }
  if (_isPhotoUrlField(key)) return formatPhotoUrlValue(v);
  if (compactKey.includes("unidadescatastrales") || compactKey === "uucc" || compactKey === "uc") {
    const numericValue = typeof v === "number"
      ? v
      : Number(String(v).replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(numericValue)) {
      return escapeHtml(Math.round(numericValue).toLocaleString("en-US"));
    }
  }
  if (compactKey === "sector" || compactKey === "sectorcic") {
    const textSector = String(v || "").replace(/\s+/g, " ").trim();
    if (!isMeaningfulPopupValue(textSector)) return "&mdash;";
    const parts = textSector
      .split(/[;,\/\-\s]+/)
      .map((p) => p.replace(/\D/g, ""))
      .filter(Boolean)
      .map((p) => String(Number(p)).padStart(2, "0"));
    if (parts.length) return escapeHtml(uniqueList(parts).join(", "));
    return escapeHtml(textSector);
  }
  const text = String(v).replace(/\s+/g, " ").trim();
  if (!isMeaningfulPopupValue(text)) return "&mdash;";
  const cleanedText = /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?Z$/i.test(text)
    ? text.slice(0, -1)
    : text;
  return cleanedText ? escapeHtml(cleanedText) : "&mdash;";
}

function buildAttributesPopup(title, props, options = {}) {
  const hiddenKeys = new Set((options.hiddenKeys || []).map((k) => normalizeFieldKey(k)));
  const headerLabel = String(options.headerLabel || "").trim();
  const titleLabel = String(title || "").trim();
  const entries = Object.entries(props || {}).filter(([key, value]) => {
    const normalizedKey = normalizeFieldKey(key);
    if (!normalizedKey || hiddenKeys.has(normalizedKey)) return false;
    return value !== undefined;
  });

  const rows = entries.map(([key, value]) =>
    `<tr><td class="key">${escapeHtml(String(key))}</td><td>${formatPopupValue(key, value)}</td></tr>`
  ).join("");

  return `
    <div class="popup-attrs">
      ${headerLabel ? `<div class="popup-attrs-district">${escapeHtml(headerLabel)}</div>` : ""}
      ${titleLabel ? `<h4>${escapeHtml(titleLabel)}</h4>` : ""}
      <table>${rows || '<tr><td colspan="2">&mdash;</td></tr>'}</table>
    </div>
  `;
}

function wfsUrl(typeName, opts = {}) {
  const p = new URLSearchParams({
    service: "WFS",
    version: GEO.wfsVersion,
    request: "GetFeature",
    typeName: String(typeName).includes(":") ? String(typeName) : `${GEO.workspace}:${typeName}`,
    outputFormat: "application/json",
    srsName: GEO.srsName
  });
  if (opts.maxFeatures) p.set("maxFeatures", String(opts.maxFeatures));
  if (opts.cql) p.set("CQL_FILTER", opts.cql);
  if (opts.bbox) p.set("bbox", `${opts.bbox.join(",")},${GEO.srsName}`);
  if (opts.nocache) p.set("_t", String(Date.now()));
  return `${GEO.wfsBase}?${p.toString()}`;
}

function remoteWfsUrl(baseUrl, version, typeName, srsName, opts = {}) {
  const p = new URLSearchParams({
    service: "WFS",
    version,
    request: "GetFeature",
    typeName,
    outputFormat: "application/json",
    srsName
  });
  if (opts.maxFeatures) p.set("maxFeatures", String(opts.maxFeatures));
  if (opts.cql) p.set("CQL_FILTER", opts.cql);
  if (opts.bbox) p.set("bbox", `${opts.bbox.join(",")},${srsName}`);
  if (opts.nocache) p.set("_t", String(Date.now()));
  return `${baseUrl}?${p.toString()}`;
}

function poligonosCicWfsUrl(opts = {}) {
  return remoteWfsUrl(
    POLIGONOS_CIC_SOURCE.wfsBase,
    POLIGONOS_CIC_SOURCE.wfsVersion,
    POLIGONOS_CIC_SOURCE.typeName,
    POLIGONOS_CIC_SOURCE.srsName,
    opts
  );
}

function manzanaPoligonoWfsUrl(opts = {}) {
  return remoteWfsUrl(
    MANZANA_POLIGONO_SOURCE.wfsBase,
    MANZANA_POLIGONO_SOURCE.wfsVersion,
    MANZANA_POLIGONO_SOURCE.typeName,
    MANZANA_POLIGONO_SOURCE.srsName,
    opts
  );
}


function _featureCollection(features) {
  return { type: "FeatureCollection", features: Array.isArray(features) ? features : [] };
}

async function fetchPoligonosByUbigeos(ubigeos, signal) {
  const keys = uniqueList(ubigeos || []).map(normalizeUbigeoValue).filter(Boolean);
  if (!keys.length) return _featureCollection([]);

  let lastError = null;
  let emptyResponse = null;

  // Carga optimizada: primero se pide a GeoServer solo los polígonos del/los ubigeos activos.
  // Antes se descargaba toda la capa ne:tg_poligono y recién ahí se filtraba en el navegador.
  for (const field of uniqueList(POLIGONOS_CIC_SOURCE.ubigeoFields || [])) {
    const cql = _cqlByFieldMany(field, keys);
    if (!cql) continue;
    try {
      const gj = await fetchGeoJSON(
        poligonosCicWfsUrl({ maxFeatures: 20000, cql }),
        { ttlMs: CACHE.queryTtlMs, signal }
      );
      const features = Array.isArray(gj?.features) ? gj.features : [];
      if (features.length) return _featureCollection(features);
      emptyResponse = gj || emptyResponse;
    } catch (e) {
      lastError = e;
      if (String(e?.name || "").toLowerCase() === "aborterror") throw e;
    }
  }

  // Si GeoServer no reconoce el CQL por tipo/campo, se usa respaldo una sola vez.
  // Este respaldo evita que el visor se quede sin capa, pero solo se ejecuta si falló el filtrado del servidor.
  if (lastError && !emptyResponse) {
    const gj = await fetchGeoJSON(
      poligonosCicWfsUrl({ maxFeatures: 20000 }),
      { ttlMs: CACHE.queryTtlMs, signal }
    );
    const normalized = new Set(keys);
    const districtNames = new Set(keys.map((k) => getActiveDistrictName(k)).filter(Boolean));
    const features = (Array.isArray(gj?.features) ? gj.features : []).filter((ft) => {
      const props = ft?.properties || {};
      const matchesUbigeo = POLIGONOS_CIC_SOURCE.ubigeoFields.some((field) => normalized.has(normalizeUbigeoValue(props?.[field])));
      if (matchesUbigeo) return true;
      return POLIGONOS_CIC_SOURCE.districtFields.some((field) => districtNames.has(normalizeDistrictName(props?.[field])));
    });
    return _featureCollection(features);
  }

  return _featureCollection([]);
}

async function fetchPoligonosByCodes(poligonoTerms, signal) {
  const terms = uniqueList(poligonoTerms || []).map((v) => normalizePoligonoCode(v)).filter(Boolean);
  if (!terms.length) return _featureCollection([]);

  let lastError = null;
  let emptyResponse = null;

  for (const field of uniqueList(POLIGONOS_CIC_SOURCE.poligonoFields || [])) {
    const cql = _cqlByFieldMany(field, terms);
    if (!cql) continue;
    try {
      const gj = await fetchGeoJSON(
        poligonosCicWfsUrl({ maxFeatures: 20000, cql }),
        { ttlMs: CACHE.queryTtlMs, signal }
      );
      const features = Array.isArray(gj?.features) ? gj.features : [];
      if (features.length) return _featureCollection(features.filter((ft) => poligonoCodeMatches(getPoligonoValue(ft?.properties || {}), terms)));
      emptyResponse = gj || emptyResponse;
    } catch (e) {
      lastError = e;
      if (String(e?.name || "").toLowerCase() === "aborterror") throw e;
    }
  }

  if (lastError && !emptyResponse) {
    const gj = await fetchGeoJSON(
      poligonosCicWfsUrl({ maxFeatures: 20000 }),
      { ttlMs: CACHE.queryTtlMs, signal }
    );
    return _featureCollection((Array.isArray(gj?.features) ? gj.features : []).filter((ft) => poligonoCodeMatches(getPoligonoValue(ft?.properties || {}), terms)));
  }

  return _featureCollection([]);
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

function isSatelliteBasemapActive() {
  try { return map && map.hasLayer && map.hasLayer(baseGoogleSat); } catch (_) { return false; }
}

function getDistrictOutlineStyle() {
  const sat = isSatelliteBasemapActive();
  return {
    stroke: true,
    // En Google satelital se mantiene rojo, pero menos agresivo y sin aumentar grosor.
    color: sat ? "#ef4444" : "#1f2937",
    weight: sat ? 2.8 : 2.6,
    opacity: sat ? 0.92 : 0.82,
    lineJoin: "round",
    dashArray: null,
    fill: false,
    fillOpacity: 0
  };
}

function getDistrictHaloStyle() {
  const sat = isSatelliteBasemapActive();
  return {
    stroke: true,
    color: "#ffffff",
    weight: sat ? 4.4 : 4.6,
    opacity: sat ? 0.68 : 0.72,
    lineJoin: "round",
    fill: false,
    fillOpacity: 0
  };
}

function refreshDistrictVisualStyle() {
  try { if (layerDistrictHalo && layerDistrictHalo.setStyle) layerDistrictHalo.setStyle(getDistrictHaloStyle); } catch (_) {}
  try { if (layerDistrictOutline && layerDistrictOutline.setStyle) layerDistrictOutline.setStyle(getDistrictOutlineStyle); } catch (_) {}
  try { document.body.classList.toggle("satellite-basemap", isSatelliteBasemapActive()); } catch (_) {}
  try { updateLegend(); } catch (_) {}
}


let _basemapDiv = null;
let _legendDiv = null;
let _baseLoaded = false;
let _baseLoading = false;
let _currentUbigeo = null;
let _pendingUbigeo = null;
let _districtBounds = null;
let _baseAbort = null;
let _districtModalBound = false;
let _districtRevealTimer = null;
let _poligonosCicAbort = null;
let _activeUbigeos = [];
let _activeSelectionKey = "";
let _activeSelectionLabel = "";
let _activeLoteGroupKey = "";
let _conflictComputedKey = "";

const districtCatalog = new Map();

function districtWfsUrl() {
  const p = new URLSearchParams({
    service: "WFS",
    version: DISTRICT_SOURCE.wfsVersion,
    request: "GetFeature",
    typeName: DISTRICT_SOURCE.typeName,
    outputFormat: "application/json",
    srsName: DISTRICT_SOURCE.srsName,
    maxFeatures: "5000"
  });
  return `${DISTRICT_SOURCE.wfsBase}?${p.toString()}`;
}

function normalizeLookupKey(key) {
  return String(key || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&deg;|&ordm;|°|º/g, "o")
    .replace(/[^a-z0-9]+/g, "");
}

function firstProp(obj, keys) {
  if (!obj || !keys || !keys.length) return "";

  // 1) Coincidencia exacta para no alterar los casos normales.
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }

  // 2) Coincidencia normalizada para campos que vienen de PostGIS/GeoServer
  // con espacios, tildes, guiones, slash o símbolos: "n° cic", "n_cic",
  // "fotografías difusión", "fotografias_difusion", etc.
  const normalizedMap = new Map();
  Object.keys(obj || {}).forEach((actualKey) => {
    const nk = normalizeLookupKey(actualKey);
    if (!nk || normalizedMap.has(nk)) return;
    const v = obj[actualKey];
    if (v !== undefined && v !== null && String(v).trim() !== "") normalizedMap.set(nk, v);
  });

  for (const k of keys) {
    const nk = normalizeLookupKey(k);
    if (nk && normalizedMap.has(nk)) return normalizedMap.get(nk);
  }
  return "";
}

let _baseResolvedFields = null;

function uniqueList(arr) {
  return [...new Set((arr || []).filter(Boolean).map((v) => String(v).trim()).filter(Boolean))];
}

function getBaseLayerTypeName(typeName) {
  const raw = String(typeName || "").trim();
  return raw.includes(":") ? raw : `${GEO.workspace}:${raw}`;
}

function describeFeatureTypeUrl(typeName) {
  const p = new URLSearchParams({
    service: "WFS",
    version: GEO.wfsVersion,
    request: "DescribeFeatureType",
    typeName: getBaseLayerTypeName(typeName)
  });
  return `${GEO.wfsBase}?${p.toString()}`;
}

function pickFieldFromNames(names, aliasKey) {
  const aliases = uniqueList([GEO.fields?.[aliasKey], ...(GEO.fieldAliases?.[aliasKey] || [])]);
  const available = Array.from(names || []);
  for (const alias of aliases) {
    const exact = available.find((name) => name === alias);
    if (exact) return exact;
    const ci = available.find((name) => String(name).toLowerCase() === String(alias).toLowerCase());
    if (ci) return ci;
  }
  return GEO.fields?.[aliasKey] || aliases[0] || aliasKey;
}

async function resolveBaseFieldNames(signal) {
  if (_baseResolvedFields) return _baseResolvedFields;

  const result = { ...GEO.fields };
  const names = new Set();
  const layers = [GEO.layers.manzana, GEO.layers.sector].filter(Boolean);

  for (const layer of layers) {
    try {
      const r = await fetch(describeFeatureTypeUrl(layer), { cache: "no-store", signal });
      if (!r.ok) continue;
      const xml = await r.text();
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      doc.querySelectorAll("element[name], xsd\:element[name], xs\:element[name]").forEach((el) => {
        const name = el.getAttribute("name");
        if (name && !["geom", "the_geom", "geometry"].includes(name.toLowerCase())) names.add(name);
      });
    } catch (e) {
      if (String(e?.name || "").toLowerCase() === "aborterror") throw e;
    }
  }

  result.ubigeo = pickFieldFromNames(names, "ubigeo");
  result.cod_mzna = pickFieldFromNames(names, "cod_mzna");
  result.cod_sector = pickFieldFromNames(names, "cod_sector");
  _baseResolvedFields = result;
  return result;
}

function getBaseField(aliasKey) {
  return (_baseResolvedFields && _baseResolvedFields[aliasKey]) || GEO.fields?.[aliasKey] || aliasKey;
}

function getFeatureValue(props, aliasKey) {
  const keys = uniqueList([getBaseField(aliasKey), GEO.fields?.[aliasKey], ...(GEO.fieldAliases?.[aliasKey] || [])]);
  return firstProp(props || {}, keys);
}

function normalizeDistrictLabel(v) {
  return String(v || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(^.|\s+.)/g, (m) => m.toUpperCase());
}

function normalizeDistrictLot(v) {
  return String(v || "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function seedDistrictFallback() {
  districtCatalog.clear();
  DISTRICT_SOURCE.fallback.forEach((it) => {
    districtCatalog.set(String(it.ubigeo), {
      ubigeo: String(it.ubigeo),
      nombre: normalizeDistrictLabel(it.nombre),
      lote: "",
      bounds: null,
      features: []
    });
  });
}

function buildDistrictBoundsIndex() {
  const next = {};
  districtCatalog.forEach((entry, ubigeo) => {
    if (entry?.bounds && entry.bounds.isValid && entry.bounds.isValid()) next[ubigeo] = entry.bounds;
  });
  _districtBounds = { ...(_districtBounds || {}), ...next };
}

function registerDistrictFeature(ft) {
  const props = ft?.properties || {};
  const ubigeo = String(firstProp(props, DISTRICT_SOURCE.fields.ubigeo) || "").trim();
  const nombre = normalizeDistrictLabel(firstProp(props, DISTRICT_SOURCE.fields.name));
  const lote = normalizeDistrictLot(firstProp(props, DISTRICT_SOURCE.fields.lote));
  if (!ubigeo || !nombre) return false;

  let entry = districtCatalog.get(ubigeo);
  if (!entry) {
    entry = { ubigeo, nombre, lote: lote || "", bounds: null, features: [] };
    districtCatalog.set(ubigeo, entry);
  }

  entry.nombre = entry.nombre || nombre;
  entry.lote = entry.lote || lote;
  entry.features.push(ft);

  try {
    const b = L.geoJSON(ft).getBounds();
    if (b && b.isValid && b.isValid()) entry.bounds = entry.bounds ? entry.bounds.extend(b) : b;
  } catch (e) {}

  return true;
}

function formatDistrictDisplayName(name) {
  const raw = String(name || "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  const acronyms = new Set(["SMP", "SJM", "VES", "CIC"]);
  const lowercaseParticles = new Set(["de", "del"]);
  return raw.toLowerCase().replace(/(^|[\s\-\/])([^\s\-\/]+)/g, (m, sep, word, offset) => {
    const lower = word.toLowerCase();
    const upper = word.toUpperCase();
    if (acronyms.has(upper)) return sep + upper;
    if (offset > 0 && lowercaseParticles.has(lower)) return sep + lower;
    return sep + upper.charAt(0) + word.slice(1);
  });
}

function getSortedDistrictEntries() {
  return [...districtCatalog.values()].sort((a, b) =>
    formatDistrictDisplayName(a?.nombre || "").localeCompare(formatDistrictDisplayName(b?.nombre || ""), "es", { sensitivity: "base" })
  );
}

function getDistrictDisplayName(ubigeo) {
  const key = String(ubigeo || "").trim();
  return formatDistrictDisplayName(districtCatalog.get(key)?.nombre || key);
}

function getDistrictLotValue(ubigeo) {
  const key = String(ubigeo || "").trim();
  if (!key) return "";
  return normalizeDistrictLot(districtCatalog.get(key)?.lote || "");
}

function getLegendDistrictKey() {
  const districtSelect = document.getElementById("search-distrito");
  const v = String(districtSelect?.value || "").trim();
  if (v && v !== ALL_DISTRICTS_VALUE) return v;
  if (_activeUbigeos.length === 1) return _activeUbigeos[0];
  return String(_currentUbigeo || _pendingUbigeo || "").trim();
}

function getActiveUbigeos() {
  if (Array.isArray(_activeUbigeos) && _activeUbigeos.length) return [..._activeUbigeos];
  const key = getLegendDistrictKey();
  return key ? [key] : [];
}

function getAllDistrictUbigeos() {
  return [...districtCatalog.keys()].filter(Boolean).sort();
}

function getSelectionLabelForUbigeos(ubigeos) {
  const keys = uniqueList(ubigeos || []);
  if (!keys.length) return "";
  if (keys.length === 1) return getDistrictDisplayName(keys[0]);
  return `${keys.length} distritos`;
}

function setLoteGroupSelectValue(value) {
  try {
    const sel = document.getElementById("search-lote-grupo");
    if (sel) {
      sel.value = value || "";
      if (typeof syncPrettySelect === "function") syncPrettySelect(sel);
    }
  } catch (e) {}
}

function getLoteGroupLabel(key) {
  const g = LOTE_GROUPS[String(key || "")];
  if (!g) return "";
  return `${g.label} (${g.detail})`;
}

function normalizeDistrictName(v) {
  return String(v || "").replace(/\s+/g, " ").trim().toUpperCase();
}

function getActiveDistrictName(ubigeo) {
  return normalizeDistrictName(getDistrictDisplayName(ubigeo));
}

function normalizeUbigeoValue(v) {
  const text = String(v === undefined || v === null ? "" : v).trim();
  if (!text) return "";
  if (/^\d+$/.test(text)) return String(parseInt(text, 10));
  return text;
}

function syncDistrictUiState(ubigeo) {
  const key = String(ubigeo || "").trim();

  try {
    const select = document.getElementById("search-distrito");
    if (select) {
      select.value = key || "";
      const currentOption = select.options[select.selectedIndex];
      select.title = String(currentOption?.textContent || "").trim();
      if (typeof syncPrettySelect === "function") syncPrettySelect(select);
    }
  } catch (e) {}

  try {
    document.querySelectorAll(".district-btn[data-ubigeo]").forEach((btn) => {
      const active = key !== ALL_DISTRICTS_VALUE && String(btn.getAttribute("data-ubigeo") || "").trim() === key;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      if (active) {
        try {
          btn.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
        } catch (e) {}
      }
    });
  } catch (e) {}
}

function buildDistrictUi() {
  const select = document.getElementById("search-distrito");
  const actions = document.getElementById("district-modal-actions");
  const entries = getSortedDistrictEntries();

  if (select) {
    const current = String(select.value || "").trim();
    select.innerHTML = '<option value="">Seleccionar distrito</option><option value="__ALL__">Todos</option>';
    entries.forEach((entry) => {
      const opt = document.createElement("option");
      opt.value = entry.ubigeo;
      opt.textContent = formatDistrictDisplayName(entry.nombre);
      select.appendChild(opt);
    });
    if (current === ALL_DISTRICTS_VALUE || (current && districtCatalog.has(current))) select.value = current;
  }

  if (actions) {
    actions.innerHTML = "";
    entries.forEach((entry) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "district-btn";
      btn.setAttribute("data-ubigeo", entry.ubigeo);
      btn.setAttribute("data-name", formatDistrictDisplayName(entry.nombre));
      btn.innerHTML = `
        <span class="district-btn-title">${escapeHtml(formatDistrictDisplayName(entry.nombre))}</span>
      `;
      actions.appendChild(btn);
    });
  }

  syncDistrictUiState((select && select.value) || _currentUbigeo || "");
  if (typeof initPrettySelects === "function") initPrettySelects();
}

async function initDistrictCatalog() {
  districtCatalog.clear();
  try {
    const gj = await fetchGeoJSON(districtWfsUrl(), { ttlMs: CACHE.baseTtlMs, force: true });
    const feats = Array.isArray(gj?.features) ? gj.features : [];
    feats.forEach(registerDistrictFeature);
    if (!districtCatalog.size) throw new Error("La capa Distrito no devolvio entidades validas");
  } catch (e) {
    console.warn("No se pudo cargar el catalogo de distritos desde GeoServer. Se usara el fallback.", e);
    seedDistrictFallback();
  }

  buildDistrictBoundsIndex();
  buildDistrictUi();
}

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
      <button type="button" class="mobile-map-actions-toggle" aria-label="Menú de acciones" title="Menú">
        <span></span><span></span><span></span>
      </button>
      <div class="dashboard-action-row">
        <div class="map-auth-wrap">
          <button type="button" id="map-auth-btn" class="map-auth-btn" aria-label="Iniciar sesión" title="Iniciar sesión">
            <span id="map-auth-dot" class="map-auth-dot" aria-hidden="true"></span>
            <span id="map-auth-text">Iniciar sesión</span>
          </button>
          <div id="map-auth-menu" class="map-auth-menu" hidden>
            <button type="button" id="map-auth-logout" class="map-auth-logout">Cerrar sesión</button>
          </div>
        </div>
        <button type="button" class="dashboard-btn" aria-label="Dashboard" title="Abrir Dashboard">
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
      </div>
    `;
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    const menuToggle = div.querySelector(".mobile-map-actions-toggle");
    menuToggle?.addEventListener("click", (e) => {
      L.DomEvent.stop(e);
      div.classList.toggle("mobile-actions-open");
    });
    const dashBtn = div.querySelector(".dashboard-btn");
    dashBtn?.addEventListener("click", (e) => {
      L.DomEvent.stop(e);
      div.classList.remove("mobile-actions-open");
      window.open(DASHBOARD_URL, "_blank", "noopener,noreferrer");
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
  if (kind === "municipalidad") return `<span class="lg-swatch lg-punto-marker lg-punto-municipalidad" aria-hidden="true">${puntoIconSvg("municipalidad")}</span>`;
  if (kind === "centro") return `<span class="lg-swatch lg-punto-marker lg-punto-centro" aria-hidden="true">${puntoIconSvg("centro")}</span>`;
  if (kind === "point") return `<span class="lg-swatch lg-point" style="background:${safe};border-color:${safe};"></span>`;
  if (kind === "district") return `<span class="lg-swatch lg-line" style="border-color:${safe};"></span>`;
  if (kind === "conflict") return `<span class="lg-swatch lg-poly lg-conflict" style="background:rgba(220,38,38,.18);border-color:${safe};"></span>`;
  // Polígonos y capas de área: borde visible y sin fondo para que coincida con el mapa.
  if (kind === "poly") return `<span class="lg-swatch lg-poly" style="background:transparent;border-color:${safe};"></span>`;
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

  const districtRows = [];
  const activeKeys = getActiveUbigeos();
  if (activeKeys.length) {
    const activeDistrictKey = activeKeys.length === 1 ? activeKeys[0] : "";
    const districtLot = activeDistrictKey ? getDistrictLotValue(activeDistrictKey) : "";
    const label = _activeSelectionLabel || (activeDistrictKey ? getDistrictDisplayName(activeDistrictKey) : `${activeKeys.length} distritos`);
    const districtLabel = districtLot
      ? `L&iacute;mite distrital - Lote ${escapeHtml(districtLot)}`
      : `L&iacute;mite distrital - ${escapeHtml(label)}`;
    districtRows.push(`<div class="legend-row">${legendItemSwatch(isSatelliteBasemapActive() ? "#ef4444" : "#1f2937", "district")}<span>${districtLabel}</span></div>`);
  }

  const rows = [...districtRows];
  if (isOn("layer-poligonos-supervision")) {
    rows.push(`<div class="legend-row">${legendItemSwatch("#e11d48", "poly")}<span>Pol&iacute;gonos Totales</span></div>`);
  }
  if (isOn("layer-poligonos-cic-totales")) {
    rows.push(`<div class="legend-row">${legendItemSwatch("#0891b2", "poly")}<span>Pol&iacute;gonos CIC Totales</span></div>`);
  }
  if (isOn("layer-poligonos-activos")) {
    rows.push(`<div class="legend-row">${legendItemSwatch("#ea580c", "poly")}<span>Pol&iacute;gonos CIC activos</span></div>`);
  }
  if (isOn("layer-poligonos-manzana-poligono")) {
    rows.push(`<div class="legend-row">${legendItemSwatch("#e11d48", "line")}<span>Manzana de Pol&iacute;gonos</span></div>`);
  }
  Object.values(window.ACTIVIDAD_CATEGORY_DEFS_UI || {}).forEach((def) => {
    if (isOn(def.checkboxId)) rows.push(`<div class="legend-row">${legendItemSwatch(def.color, "point")}<span>${escapeHtml(def.label)}</span></div>`);
  });
  if (isOn("layer-conflicto-zona")) rows.push(`<div class="legend-row">${legendItemSwatch("#dc2626", "conflict")}<span>Zona en controversia</span></div>`);
  if (isOn("layer-base-municipalidad")) rows.push(`<div class="legend-row">${legendItemSwatch("#0f766e", "municipalidad")}<span>Municipalidad Distrital</span></div>`);
  if (isOn("layer-base-centro-operacion")) rows.push(`<div class="legend-row">${legendItemSwatch("#7c3aed", "centro")}<span>Centro de Operación Distrital</span></div>`);
  if (isOn("layer-base-manzana")) rows.push(`<div class="legend-row">${legendItemSwatch("#ff00ff", "line")}<span>Manzana</span></div>`);
  if (isOn("layer-base-sector")) rows.push(`<div class="legend-row">${legendItemSwatch("#f59e0b", "poly")}<span>Sector</span></div>`);
  try { if (map && map.hasLayer && map.hasLayer(layerKmlKmz) && layerKmlKmz.getLayers().length) rows.push(`<div class="legend-row">${legendItemSwatch("#fb923c", "poly")}<span>KML/KMZ cargado</span></div>`); } catch (_) {}

  if (!rows.length) {
    body.innerHTML = `<div class="legend-empty">Activa una capa para ver la leyenda.</div>`;
    return;
  }

  body.innerHTML = `<div class="legend-section">${rows.join("")}</div>`;
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

const searchPoligono = document.getElementById("search-poligono");
const searchMz = document.getElementById("search-manzana");
const searchLt = document.getElementById("search-lote");
const searchSector = document.getElementById("search-sector");
const searchDistrito = document.getElementById("search-distrito");
const searchLoteGrupo = document.getElementById("search-lote-grupo");
const btnSearch = document.getElementById("btn-search");
const btnClearSearch = document.getElementById("btn-clear-search");
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
      <div class="leaflet-bar corner-night" aria-label="Modo noche">
        <a class="corner-night-btn" href="#" title="Modo noche" role="button" aria-label="Activar modo noche">☾</a>
      </div>
      <div class="leaflet-bar corner-locate" aria-label="Mi ubicacion">
        <a class="corner-locate-btn" href="#" title="Ir a mi ubicacion" role="button" aria-label="Ir a mi ubicacion">&#x1F4CD;</a>
      </div>
      <div class="leaflet-bar corner-panel-toggle" aria-label="Panel lateral">
        <a class="corner-panel-btn" href="#" title="Mostrar panel" role="button" aria-label="Mostrar panel">
          <svg class="panel-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect class="panel-toggle-frame" x="4" y="5" width="16" height="14" rx="2"></rect>
            <path class="panel-toggle-bar" d="M9 5v14"></path>
            <path class="panel-toggle-arrow" d="M14 9l-3 3 3 3"></path>
          </svg>
        </a>
      </div>
    `;

    L.DomEvent.disableClickPropagation(container);

    const zoomIn = container.querySelector(".corner-zoom-in");
    const zoomOut = container.querySelector(".corner-zoom-out");
    const nightBtn = container.querySelector(".corner-night-btn");
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

    nightBtn?.addEventListener("click", (e) => {
      L.DomEvent.stop(e);
      toggleNightMode();
    });
    applyNightMode(document.body.classList.contains("night-mode"), false);

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
      if (!panelCapas) return;
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

    refreshDistrictVisualStyle();
  }
});

function makePane(name, z) {
  const p = map.createPane(name);
  p.style.zIndex = String(z);
  return p;
}
makePane("cicPoligonosPane", 515);
makePane("manzanaPoligonoPane", 525);
makePane("sectorPane", 540);
makePane("manzanaPane", 570);
makePane("districtHaloPane", 590);
makePane("districtPane", 600);
makePane("conflictPane", 610);
makePane("actividadPane", 620);
makePane("puntosDistritoPane", 625);
makePane("baseLabelPane", 630);
makePane("poligonoLabelPane", 640);
makePane("highlightPane", 950);
try { map.getPane("popupPane").style.zIndex = "1200"; } catch (e) {}
try { map.getPane("tooltipPane").style.zIndex = "1190"; } catch (e) {}

const RENDERERS = {
  sector: L.canvas({ pane: "sectorPane", padding: 0.35 }),
  manzana: L.canvas({ pane: "manzanaPane", padding: 0.35 }),
  cicPoligonos: L.svg({ pane: "cicPoligonosPane" }),
  manzanaPoligono: L.svg({ pane: "manzanaPoligonoPane" }),
  conflicto: L.svg({ pane: "conflictPane" }),
  highlight: L.svg({ pane: "highlightPane" })
};

function isLayerChecked(id) {
  const el = document.getElementById(id);
  return !!(el && el.checked);
}

function ensureLayerOrder() {
  try {
    const zi = {
      cicPoligonosPane: "515",
      manzanaPoligonoPane: "525",
      sectorPane: "540",
      manzanaPane: "570",
      districtHaloPane: "590",
      districtPane: "600",
      conflictPane: "610",
      actividadPane: "620",
      puntosDistritoPane: "625",
      baseLabelPane: "630",
      poligonoLabelPane: "640",
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

  if (map.hasLayer(layerConflictoTerritorial)) bringGroupFront(layerConflictoTerritorial);
  if (map.hasLayer(layerPoligonosCic)) bringGroupFront(layerPoligonosCic);
  if (map.hasLayer(layerManzanaPoligono)) bringGroupFront(layerManzanaPoligono);
  if (map.hasLayer(layerDistrictHalo)) bringGroupFront(layerDistrictHalo);
  if (map.hasLayer(layerDistrictOutline)) bringGroupFront(layerDistrictOutline);
}

const BASE_WMS = {
  opacity: 1,
  common: {
    format: "image/png",
    transparent: true,
    version: GEO.wmsVersion || "1.1.0",
    tiled: true,
    uppercase: false,
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 2,
    crossOrigin: true
  }
};

const BASE_STYLE = {
  manzana: {
    stroke: "#ff00ff",
    strokeWidth: 2.2,
    fill: "#ff00ff",
    fillOpacity: 0,
    labelColor: "#ff00ff",
    labelHalo: "#ffff00",
    labelHaloRadius: 2,
    labelClass: "lbl-manzana-map",
    labelFontSize: 16,
    labelWidth: 58,
    labelHeight: 22,
    minZoom: MANZANA_LABEL_MIN_ZOOM
  },
  sector: {
    stroke: "#f59e0b",
    strokeWidth: 2.4,
    fill: "#fbbf24",
    fillOpacity: 0.06,
    labelColor: "#92400e",
    labelHalo: "#ffffff",
    labelHaloRadius: 2,
    labelClass: "lbl-sector-map",
    labelFontSize: 17,
    labelWidth: 70,
    labelHeight: 26,
    minZoom: SECTOR_LABEL_MIN_ZOOM
  }
};

function _xmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function _baseKindFromTypeName(typeName) {
  const t = String(typeName || "").toLowerCase();
  return t.includes("sector") ? "sector" : "manzana";
}

function _buildBaseSld(typeName) {
  const kind = _baseKindFromTypeName(typeName);
  const style = BASE_STYLE[kind] || BASE_STYLE.manzana;
  const layerName = String(typeName || "").includes(":") ? String(typeName) : `${GEO.workspace}:${typeName}`;

  // El SLD evita que GeoServer use la simbologia gris por defecto.
  // Las etiquetas se dibujan aparte con marcadores livianos para que el desplazamiento sea más estable.
  return `<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0"
  xmlns="http://www.opengis.net/sld"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>${_xmlEscape(layerName)}</Name>
    <UserStyle>
      <Title>${_xmlEscape(kind)}</Title>
      <FeatureTypeStyle>
        <Rule>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">${style.fill}</CssParameter>
              <CssParameter name="fill-opacity">${style.fillOpacity}</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">${style.stroke}</CssParameter>
              <CssParameter name="stroke-width">${style.strokeWidth}</CssParameter>
              <CssParameter name="stroke-opacity">1</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>`;
}

let layerSector = L.layerGroup();
let layerManzana = L.layerGroup();
const _baseFeatureIndex = { manzana: [], sector: [] };

function _cqlByField(fieldName, value) {
  const f = String(fieldName || "").trim();
  const u = String(value || "").trim();
  if (!f || !u) return "";
  if (/^\d+$/.test(u)) {
    const n = String(parseInt(u, 10));
    return (n && n !== u) ? `(${f}='${u}' OR ${f}=${n})` : `(${f}='${u}' OR ${f}=${u})`;
  }
  return `${f}='${u.replaceAll("'", "''")}'`;
}

function _cqlByFieldMany(fieldName, values) {
  const f = String(fieldName || "").trim();
  const vals = uniqueList(values || []);
  if (!f || !vals.length) return "";
  const parts = [];
  vals.forEach((raw) => {
    const u = String(raw || "").trim();
    if (!u) return;
    if (/^\d+$/.test(u)) {
      const n = String(parseInt(u, 10));
      parts.push(`${f}='${u}'`);
      parts.push(`${f}=${n}`);
    } else {
      parts.push(`${f}='${u.replaceAll("'", "''")}'`);
    }
  });
  return parts.length ? `(${parts.join(" OR ")})` : "";
}

function getUbigeoFieldCandidates() {
  return uniqueList([getBaseField("ubigeo"), GEO.fields.ubigeo, ...(GEO.fieldAliases?.ubigeo || [])]);
}

function _baseVectorStyle(kind) {
  const st = BASE_STYLE[kind] || BASE_STYLE.manzana;
  return {
    pane: kind === "sector" ? "sectorPane" : "manzanaPane",
    renderer: kind === "sector" ? RENDERERS.sector : RENDERERS.manzana,
    interactive: false,
    bubblingMouseEvents: false,
    style: () => ({
      stroke: true,
      color: st.stroke,
      weight: st.strokeWidth,
      opacity: 1,
      lineJoin: "round",
      lineCap: "round",
      fill: true,
      fillColor: st.fill,
      fillOpacity: st.fillOpacity
    })
  };
}

function makeBaseWfsLayer(typeName, geojson) {
  const kind = _baseKindFromTypeName(typeName);
  return L.geoJSON(geojson || { type: "FeatureCollection", features: [] }, _baseVectorStyle(kind));
}

function replaceBaseWfsLayers(gjSector, gjManzana) {
  const showSector = isLayerChecked("layer-base-sector");
  const showManzana = isLayerChecked("layer-base-manzana");

  try { if (map.hasLayer(layerSector)) map.removeLayer(layerSector); } catch (e) {}
  try { if (map.hasLayer(layerManzana)) map.removeLayer(layerManzana); } catch (e) {}

  layerSector = makeBaseWfsLayer(GEO.layers.sector, gjSector);
  layerManzana = makeBaseWfsLayer(GEO.layers.manzana, gjManzana);

  if (showSector) layerSector.addTo(map);
  if (showManzana) layerManzana.addTo(map);
  syncBaseLabelLayerVisibility();
  ensureLayerOrder();
}

// Compatibilidad: los nombres anteriores quedan anulados en esta versión de prueba WFS.
function makeBaseWmsLayer(typeName, ubigeo) {
  return L.layerGroup([], { pane: _baseKindFromTypeName(typeName) === "sector" ? "sectorPane" : "manzanaPane" });
}

function replaceBaseWmsLayers(ubigeo) {
  syncBaseLayerVisibilityFromUI();
}

function _walkCoords(coords, cb) {
  if (!coords) return;
  if (Array.isArray(coords) && coords.length >= 2 && typeof coords[0] === "number" && typeof coords[1] === "number") {
    cb(coords[0], coords[1]);
    return;
  }
  if (Array.isArray(coords)) coords.forEach((c) => _walkCoords(c, cb));
}

function _ringCentroid(ring) {
  if (!Array.isArray(ring) || ring.length < 3) return null;
  let area2 = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const x0 = Number(ring[j]?.[0]);
    const y0 = Number(ring[j]?.[1]);
    const x1 = Number(ring[i]?.[0]);
    const y1 = Number(ring[i]?.[1]);
    if (![x0, y0, x1, y1].every(Number.isFinite)) continue;
    const a = x0 * y1 - x1 * y0;
    area2 += a;
    cx += (x0 + x1) * a;
    cy += (y0 + y1) * a;
  }
  if (Math.abs(area2) < 1e-15) return null;
  return { lng: cx / (3 * area2), lat: cy / (3 * area2), area: Math.abs(area2) / 2 };
}

function _featureContainsLngLat(ft, lng, lat) {
  const g = ft && ft.geometry;
  if (!g || !g.coordinates || !Number.isFinite(lng) || !Number.isFinite(lat)) return false;
  if (g.type === "Polygon") return _pointInPolygon(lng, lat, g.coordinates);
  if (g.type === "MultiPolygon") return g.coordinates.some((poly) => _pointInPolygon(lng, lat, poly));
  return false;
}

function _featureRawBounds(ft) {
  const g = ft && ft.geometry;
  if (!g || !g.coordinates) return null;
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  _walkCoords(g.coordinates, (lng, lat) => {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  });
  if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;
  return { minLng, minLat, maxLng, maxLat };
}

function _distSqToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) return (px - ax) ** 2 + (py - ay) ** 2;
  let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  const x = ax + t * dx;
  const y = ay + t * dy;
  return (px - x) ** 2 + (py - y) ** 2;
}

function _minDistSqToRing(lng, lat, ring) {
  if (!Array.isArray(ring) || ring.length < 2) return 0;
  let best = Infinity;
  for (let i = 1; i < ring.length; i++) {
    const a = ring[i - 1];
    const b = ring[i];
    if (!a || !b) continue;
    const d = _distSqToSegment(lng, lat, Number(a[0]), Number(a[1]), Number(b[0]), Number(b[1]));
    if (d < best) best = d;
  }
  return Number.isFinite(best) ? best : 0;
}

function _minDistSqToFeatureBoundary(ft, lng, lat) {
  const g = ft && ft.geometry;
  if (!g || !g.coordinates) return 0;
  let best = Infinity;
  const testPoly = (poly) => {
    for (const ring of poly || []) {
      const d = _minDistSqToRing(lng, lat, ring);
      if (d < best) best = d;
    }
  };
  if (g.type === "Polygon") testPoly(g.coordinates);
  if (g.type === "MultiPolygon") (g.coordinates || []).forEach(testPoly);
  return Number.isFinite(best) ? best : 0;
}

function _insideVisualPoint(ft, fallbackCenter) {
  const b = _featureRawBounds(ft);
  if (!b) return fallbackCenter;

  const centerLng = Number(fallbackCenter?.lng ?? ((b.minLng + b.maxLng) / 2));
  const centerLat = Number(fallbackCenter?.lat ?? ((b.minLat + b.maxLat) / 2));

  if (_featureContainsLngLat(ft, centerLng, centerLat)) {
    return L.latLng(centerLat, centerLng);
  }

  let best = null;
  const steps = 11;
  for (let ix = 1; ix < steps; ix++) {
    const lng = b.minLng + ((b.maxLng - b.minLng) * ix) / steps;
    for (let iy = 1; iy < steps; iy++) {
      const lat = b.minLat + ((b.maxLat - b.minLat) * iy) / steps;
      if (!_featureContainsLngLat(ft, lng, lat)) continue;
      const distBoundary = _minDistSqToFeatureBoundary(ft, lng, lat);
      const distCenter = (lng - centerLng) ** 2 + (lat - centerLat) ** 2;
      const score = distBoundary - distCenter * 0.05;
      if (!best || score > best.score) best = { lat, lng, score };
    }
  }

  if (best) return L.latLng(best.lat, best.lng);
  return fallbackCenter;
}

function _featureLabelCenter(ft, fallbackCenter) {
  const g = ft && ft.geometry;
  if (!g || !g.coordinates) return fallbackCenter;

  let best = null;
  if (g.type === "Polygon") {
    best = _ringCentroid(g.coordinates?.[0]);
  } else if (g.type === "MultiPolygon") {
    for (const poly of g.coordinates || []) {
      const c = _ringCentroid(poly?.[0]);
      if (c && (!best || c.area > best.area)) best = c;
    }
  }

  if (best && Number.isFinite(best.lat) && Number.isFinite(best.lng) && _featureContainsLngLat(ft, best.lng, best.lat)) {
    return L.latLng(best.lat, best.lng);
  }

  // Si el centroide cae fuera del poligono por concavidades o huecos,
  // se busca un punto visual interno para que la etiqueta quede dentro.
  return _insideVisualPoint(ft, fallbackCenter);
}

function _featureBoundsAndCenter(ft) {
  const g = ft && ft.geometry;
  if (!g || !g.coordinates) return null;
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  _walkCoords(g.coordinates, (lng, lat) => {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  });
  if (!Number.isFinite(minLng) || !Number.isFinite(minLat) || !Number.isFinite(maxLng) || !Number.isFinite(maxLat)) return null;
  const fallbackCenter = L.latLng((minLat + maxLat) / 2, (minLng + maxLng) / 2);
  return {
    bbox: { minLng, minLat, maxLng, maxLat },
    center: _featureLabelCenter(ft, fallbackCenter),
    bounds: L.latLngBounds([minLat, minLng], [maxLat, maxLng])
  };
}

function _labelTextForFeature(type, props) {
  const key = type === "sector" ? "cod_sector" : "cod_mzna";
  const v = getFeatureValue(props || {}, key);
  return (v === undefined || v === null) ? "" : String(v).trim();
}

function prepareBaseFeatureIndex(type, gj) {
  const feats = Array.isArray(gj?.features) ? gj.features : [];
  _baseFeatureIndex[type] = feats.map((ft) => {
    const info = _featureBoundsAndCenter(ft);
    if (!info) return null;
    return {
      feature: ft,
      bbox: info.bbox,
      center: info.center,
      bounds: info.bounds,
      text: _labelTextForFeature(type, ft?.properties || {})
    };
  }).filter(Boolean);
}

const BaseLabelCanvasLayer = L.Layer.extend({
  initialize: function () {
    this._visibility = { manzana: false, sector: false };
    this._raf = null;
  },
  onAdd: function (mapRef) {
    this._map = mapRef;
    this._canvas = L.DomUtil.create("canvas", "base-label-canvas leaflet-zoom-animated");
    this._canvas.style.pointerEvents = "none";
    const pane = mapRef.getPane("baseLabelPane") || mapRef.getPanes().overlayPane;
    pane.appendChild(this._canvas);
    mapRef.on("moveend zoomend resize viewreset", this._schedule, this);
    this._reset();
  },
  onRemove: function (mapRef) {
    mapRef.off("moveend zoomend resize viewreset", this._schedule, this);
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
    if (this._canvas && this._canvas.parentNode) this._canvas.parentNode.removeChild(this._canvas);
    this._canvas = null;
    this._map = null;
  },
  setVisibility: function (visibility) {
    this._visibility = { ...this._visibility, ...(visibility || {}) };
    this._schedule();
  },
  refresh: function () {
    this._schedule();
  },
  _schedule: function () {
    if (!this._map || !this._canvas) return;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => {
      this._raf = null;
      this._reset();
    });
  },
  _reset: function () {
    if (!this._map || !this._canvas) return;
    const size = this._map.getSize();
    const topLeft = this._map.containerPointToLayerPoint([0, 0]);
    this._canvas.width = Math.max(1, size.x);
    this._canvas.height = Math.max(1, size.y);
    this._canvas.style.width = `${size.x}px`;
    this._canvas.style.height = `${size.y}px`;
    L.DomUtil.setPosition(this._canvas, topLeft);
    this._draw();
  },
  _draw: function () {
    if (!this._map || !this._canvas) return;
    const ctx = this._canvas.getContext("2d");
    const size = this._map.getSize();
    ctx.clearRect(0, 0, size.x, size.y);
    const z = this._map.getZoom();
    if (this._visibility.sector && z >= BASE_STYLE.sector.minZoom) this._drawType(ctx, "sector");
    if (this._visibility.manzana && z >= BASE_STYLE.manzana.minZoom) this._drawType(ctx, "manzana");
  },
  _drawType: function (ctx, type) {
    const style = BASE_STYLE[type];
    const bounds = this._map.getBounds().pad(0.05);
    ctx.save();
    ctx.font = style.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.strokeStyle = style.halo;
    ctx.lineWidth = style.lineWidth;
    ctx.fillStyle = style.color;
    const items = _baseFeatureIndex[type] || [];
    for (const item of items) {
      if (!item.text || !bounds.contains(item.center)) continue;
      const pt = this._map.latLngToContainerPoint(item.center);
      ctx.strokeText(item.text, pt.x, pt.y);
      ctx.fillText(item.text, pt.x, pt.y);
    }
    ctx.restore();
  }
});

const baseLabelLayer = new BaseLabelCanvasLayer(); // conservado solo como compatibilidad interna; ya no se agrega al mapa.
const baseLabelMarkerLayer = L.layerGroup([], { pane: "baseLabelPane" });
let _baseLabelUpdateRaf = null;

function _labelMarkerHtml(text) {
  return `<span>${escapeHtml(String(text || ""))}</span>`;
}

function _labelMarkerForItem(type, item) {
  const style = BASE_STYLE[type] || BASE_STYLE.manzana;
  return L.marker(item.center, {
    pane: "baseLabelPane",
    interactive: false,
    keyboard: false,
    icon: L.divIcon({
      className: `base-map-label ${style.labelClass}`,
      html: _labelMarkerHtml(item.text),
      iconSize: [style.labelWidth, style.labelHeight],
      iconAnchor: [style.labelWidth / 2, style.labelHeight / 2]
    })
  });
}

function _drawVisibleBaseLabels() {
  if (_baseLabelUpdateRaf) {
    cancelAnimationFrame(_baseLabelUpdateRaf);
    _baseLabelUpdateRaf = null;
  }

  if (!_baseLoaded) {
    baseLabelMarkerLayer.clearLayers();
    if (map.hasLayer(baseLabelMarkerLayer)) map.removeLayer(baseLabelMarkerLayer);
    return;
  }

  const z = map.getZoom();
  const bounds = map.getBounds().pad(0.08);
  const markers = [];

  const addType = (type, checkedId, maxLabels) => {
    if (!isLayerChecked(checkedId)) return;
    const style = BASE_STYLE[type] || BASE_STYLE.manzana;
    if (z < style.minZoom) return;
    let count = 0;
    for (const item of (_baseFeatureIndex[type] || [])) {
      if (!item?.text || !item.center || !bounds.contains(item.center)) continue;
      markers.push(_labelMarkerForItem(type, item));
      count += 1;
      if (count >= maxLabels) break;
    }
  };

  // Sector se permite desde más lejos; manzana solo de cerca para evitar saturación.
  addType("sector", "layer-base-sector", 450);
  addType("manzana", "layer-base-manzana", 750);

  baseLabelMarkerLayer.clearLayers();
  markers.forEach((m) => baseLabelMarkerLayer.addLayer(m));

  if (markers.length && !map.hasLayer(baseLabelMarkerLayer)) baseLabelMarkerLayer.addTo(map);
  if (!markers.length && map.hasLayer(baseLabelMarkerLayer)) map.removeLayer(baseLabelMarkerLayer);
}

function syncBaseLabelLayerVisibility() {
  if (map.hasLayer(baseLabelLayer)) map.removeLayer(baseLabelLayer);
  if (_baseLabelUpdateRaf) cancelAnimationFrame(_baseLabelUpdateRaf);
  _baseLabelUpdateRaf = requestAnimationFrame(() => {
    _baseLabelUpdateRaf = null;
    _drawVisibleBaseLabels();
  });
}

async function fetchBaseLayerByUbigeos(typeName, ubigeos, signal) {
  try { await resolveBaseFieldNames(signal); } catch (e) {
    if (String(e?.name || "").toLowerCase() === "aborterror") throw e;
  }

  const keys = uniqueList(ubigeos || []);
  if (!keys.length) return { type: "FeatureCollection", features: [] };

  let lastError = null;
  let emptyResponse = null;

  for (const field of getUbigeoFieldCandidates()) {
    const cql = _cqlByFieldMany(field, keys);
    try {
      const gj = await fetchGeoJSON(wfsUrl(typeName, { maxFeatures: 200000, cql }), { ttlMs: CACHE.baseTtlMs, signal });
      if (gj?.features?.length) {
        if (!_baseResolvedFields) _baseResolvedFields = { ...GEO.fields };
        _baseResolvedFields.ubigeo = field;
        return gj;
      }
      emptyResponse = gj;
    } catch (e) {
      lastError = e;
      if (String(e?.name || "").toLowerCase() === "aborterror") throw e;
    }
  }

  if (emptyResponse) return emptyResponse;
  throw lastError || new Error("No se pudo cargar la capa base por ubigeo.");
}

async function fetchBaseLayerByUbigeo(typeName, ubigeo, signal) {
  return fetchBaseLayerByUbigeos(typeName, [ubigeo], signal);
}

function clearBaseWfsLayers() {
  try { if (map.hasLayer(layerSector)) map.removeLayer(layerSector); } catch (e) {}
  try { if (map.hasLayer(layerManzana)) map.removeLayer(layerManzana); } catch (e) {}
  layerSector = L.layerGroup();
  layerManzana = L.layerGroup();
  _baseFeatureIndex.manzana = [];
  _baseFeatureIndex.sector = [];
  _baseLoaded = false;
  _currentUbigeo = null;
  _pendingUbigeo = null;
  syncBaseLabelLayerVisibility();
}

async function loadBaseForUbigeos(ubigeos, selectionKey) {
  const keys = uniqueList(ubigeos || []);
  const requested = String(selectionKey || keys.join(",") || "").trim();
  if (!keys.length || !requested) return;

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
    if (searchResult) searchResult.textContent = keys.length > 1 ? "Cargando capas del lote..." : "Cargando capas del distrito...";

    _baseFeatureIndex.manzana = [];
    _baseFeatureIndex.sector = [];
    syncBaseLabelLayerVisibility();

    const [gjS, gjM] = await Promise.all([
      fetchBaseLayerByUbigeos(GEO.layers.sector, keys, _baseAbort.signal),
      fetchBaseLayerByUbigeos(GEO.layers.manzana, keys, _baseAbort.signal)
    ]);

    prepareBaseFeatureIndex("sector", gjS);
    prepareBaseFeatureIndex("manzana", gjM);
    replaceBaseWfsLayers(gjS, gjM);

    try { _districtBounds = { ...(_districtBounds || {}), ..._computeDistrictBounds(gjM, getBaseField("ubigeo")) }; } catch (e) {}

    _baseLoaded = true;
    _currentUbigeo = requested;

    updateLegend();
    ensureLayerOrder();
    updateLabelOpacity();
    if (searchResult) searchResult.textContent = "";

    const queued = String(_pendingUbigeo || "").trim();
    if (queued && queued !== requested) {
      _pendingUbigeo = null;
      setTimeout(() => { loadBaseForUbigeos(_activeUbigeos, queued).catch((e) => console.warn(e)); }, 0);
      return;
    }
  } catch (e) {
    console.warn(e);
    if (searchResult) searchResult.textContent = "Aviso: no se pudieron cargar capas base WFS (servidor/CORS).";
  } finally {
    _baseLoading = false;
  }
}

async function loadBaseForUbigeo(ubigeo) {
  const requested = String(ubigeo || "").trim();
  if (!requested) return;
  return loadBaseForUbigeos([requested], requested);
}

function _pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / ((yj - yi) || 1e-12) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function _pointInPolygon(lng, lat, polygonCoords) {
  if (!Array.isArray(polygonCoords) || !polygonCoords.length) return false;
  if (!_pointInRing(lng, lat, polygonCoords[0])) return false;
  for (let i = 1; i < polygonCoords.length; i++) {
    if (_pointInRing(lng, lat, polygonCoords[i])) return false;
  }
  return true;
}

function _featureContainsLatLng(item, latlng) {
  if (!item || !latlng) return false;
  const lng = latlng.lng, lat = latlng.lat;
  const b = item.bbox;
  if (lng < b.minLng || lng > b.maxLng || lat < b.minLat || lat > b.maxLat) return false;
  const g = item.feature?.geometry;
  if (!g || !g.coordinates) return false;
  if (g.type === "Polygon") return _pointInPolygon(lng, lat, g.coordinates);
  if (g.type === "MultiPolygon") return g.coordinates.some((poly) => _pointInPolygon(lng, lat, poly));
  return false;
}

function _findBaseFeatureAtLatLng(type, latlng) {
  const items = _baseFeatureIndex[type] || [];
  for (let i = items.length - 1; i >= 0; i--) {
    if (_featureContainsLatLng(items[i], latlng)) return items[i];
  }
  return null;
}

// Manzana y Sector quedan como capas base WFS sin popup.
// Se mantiene el popup únicamente para capas operativas como Polígono.

function getPoligonoUbigeo(props) {
  return String(firstProp(props || {}, POLIGONOS_CIC_SOURCE.ubigeoFields || []) || "").trim();
}


function inferPoligonoLoteEmpresa(props) {
  const ub = normalizeUbigeoValue(getPoligonoUbigeo(props));
  return POLIGONO_LOTE_EMPRESA_BY_UBIGEO[ub] || "";
}

function getPoligonoCicInfoData(code) {
  const data = window.POLIGONO_CIC_INFO || {};
  const raw = String(code || "").trim();
  if (!raw) return {};
  return data[raw] || data[normalizePoligonoCode(raw)] || {};
}

function normalizePopupDateToInput(value) {
  const date = parseDateOnlyValue(value);
  if (!date) return String(value || "").trim();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isPoligonoDateEditKey(editKey) {
  return ["cic_difusion", "cic_inicio", "cic_cierre"].includes(String(editKey || ""));
}

function getStoredAuthUser() {
  try {
    const raw = localStorage.getItem(SIMPLE_AUTH_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (!data || !data.username) return null;
    const user = SIMPLE_LOGIN_USERS.find((u) => u.username === data.username);
    return user ? { username: user.username, displayName: user.displayName } : null;
  } catch (e) { return null; }
}

function setStoredAuthUser(user) {
  try {
    if (!user) localStorage.removeItem(SIMPLE_AUTH_STORAGE_KEY);
    else localStorage.setItem(SIMPLE_AUTH_STORAGE_KEY, JSON.stringify({ username: user.username }));
  } catch (e) {}
}

function isSimpleLoggedIn() {
  return !!(currentSimpleUser && currentSimpleUser.username);
}

function syncAuthUi() {
  const logged = isSimpleLoggedIn();

  // Compatibilidad con versiones anteriores del panel lateral, si existieran.
  const loginBtn = document.getElementById("btn-login");
  const userBox = document.getElementById("auth-user-box");
  const userName = document.getElementById("auth-user-name");
  if (loginBtn) loginBtn.hidden = logged;
  if (userBox) userBox.hidden = !logged;
  if (userName && logged) userName.textContent = currentSimpleUser.displayName || currentSimpleUser.username;

  // Nuevo login junto al botón Dashboard.
  const mapAuthBtn = document.getElementById("map-auth-btn");
  const mapAuthText = document.getElementById("map-auth-text");
  const mapAuthMenu = document.getElementById("map-auth-menu");
  if (mapAuthBtn) {
    mapAuthBtn.classList.toggle("is-logged", logged);
    mapAuthBtn.setAttribute("title", logged ? "Usuario conectado" : "Iniciar sesión");
    mapAuthBtn.setAttribute("aria-label", logged ? "Usuario conectado" : "Iniciar sesión");
  }
  if (mapAuthText) mapAuthText.textContent = logged ? (currentSimpleUser.displayName || currentSimpleUser.username) : "Iniciar sesión";
  if (mapAuthMenu && !logged) mapAuthMenu.hidden = true;
}

function openLoginModal() {
  const modal = document.getElementById("login-modal");
  const userInput = document.getElementById("login-usuario");
  const passInput = document.getElementById("login-clave");
  const err = document.getElementById("login-error");
  if (!modal) return;
  if (err) err.textContent = "";
  if (passInput) passInput.value = "";
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => { try { (userInput || passInput)?.focus(); } catch (e) {} }, 30);
}

function closeLoginModal() {
  const modal = document.getElementById("login-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function submitSimpleLogin() {
  const userInput = document.getElementById("login-usuario");
  const passInput = document.getElementById("login-clave");
  const err = document.getElementById("login-error");
  const username = String(userInput?.value || "").trim();
  const password = String(passInput?.value || "").trim();
  const user = SIMPLE_LOGIN_USERS.find((u) => u.username === username && u.password === password);
  if (!user) {
    if (err) err.textContent = "Usuario o contraseña incorrectos.";
    return;
  }
  currentSimpleUser = { username: user.username, displayName: user.displayName };
  setStoredAuthUser(currentSimpleUser);
  const mapAuthMenu = document.getElementById("map-auth-menu");
  if (mapAuthMenu) mapAuthMenu.hidden = true;
  syncAuthUi();
  refreshOpenPoligonoPopup();
  closeLoginModal();
}

function logoutSimpleUser() {
  currentSimpleUser = null;
  setStoredAuthUser(null);
  const mapAuthMenu = document.getElementById("map-auth-menu");
  if (mapAuthMenu) mapAuthMenu.hidden = true;
  syncAuthUi();
  refreshOpenPoligonoPopup();
}

function toggleMapAuthMenu() {
  const menu = document.getElementById("map-auth-menu");
  if (!menu) return;
  if (!isSimpleLoggedIn()) {
    menu.hidden = true;
    openLoginModal();
    return;
  }
  menu.hidden = !menu.hidden;
}

function toggleLoginPasswordVisibility() {
  const input = document.getElementById("login-clave");
  const btn = document.getElementById("btn-toggle-password");
  if (!input) return;
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  if (btn) {
    btn.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
    btn.setAttribute("title", show ? "Ocultar contraseña" : "Mostrar contraseña");
    btn.classList.toggle("is-visible", show);
  }
}

function addDaysInclusive(dateValue, totalDays) {
  const raw = String(dateValue || "").trim();
  if (!raw) return "";
  const parts = raw.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return "";
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() + Math.max(0, Number(totalDays || 0) - 1));
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function syncCicCierreFromInicio() {
  const inicio = document.getElementById("edit-cic-inicio");
  const cierre = document.getElementById("edit-cic-cierre");
  if (!inicio || !cierre) return;
  const calculated = addDaysInclusive(inicio.value, 10);
  if (calculated) cierre.value = calculated;
}

function loadPoligonoEdits() {
  try {
    const raw = localStorage.getItem(POLIGONO_EDIT_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data && typeof data === "object" ? data : {};
  } catch (e) { return {}; }
}

function savePoligonoEdits(edits) {
  try { localStorage.setItem(POLIGONO_EDIT_STORAGE_KEY, JSON.stringify(edits || {})); }
  catch (e) { throw new Error("No se pudo guardar localmente."); }
}

function getPoligonoEditData(code) {
  const edits = loadPoligonoEdits();
  return edits[String(code || "").trim()] || {};
}

function setPoligonoEditData(code, data) {
  const key = String(code || "").trim();
  if (!key) throw new Error("Código de polígono vacío.");
  const edits = loadPoligonoEdits();
  edits[key] = {
    ...(edits[key] || {}),
    ...data,
    codigo_poligono: key,
    actualizado_por: currentSimpleUser?.username || "",
    actualizado_en: new Date().toISOString()
  };
  savePoligonoEdits(edits);
  return edits[key];
}

function getPopupValueForRow(props, row, editData) {
  const edited = editData && row.editKey ? editData[row.editKey] : undefined;
  if (isMeaningfulPopupValue(edited)) return edited;

  const code = getPoligonoValue(props || {});
  const cicInfo = row.editKey ? getPoligonoCicInfoData(code) : {};
  const fromCsv = cicInfo ? cicInfo[row.editKey] : undefined;
  if (isMeaningfulPopupValue(fromCsv)) return fromCsv;

  let value = firstProp(props || {}, row.keys || []);
  if (!isMeaningfulPopupValue(value) && row.label === "Lote / Empresa") value = inferPoligonoLoteEmpresa(props);
  return value;
}

function getPoligonoInitialEditValue(props, row, editData) {
  const value = String(getPopupValueForRow(props, row, editData) || "").replace(/^—$/, "");
  if (row.editKey === "n_cic") return extractCicEditNumber(value);
  return isPoligonoDateEditKey(row.editKey) ? normalizePopupDateToInput(value) : value;
}

function parseDateOnlyValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  let y, m, d;
  let match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    y = Number(match[1]);
    m = Number(match[2]);
    d = Number(match[3]);
  } else {
    match = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2}|\d{4})$/);
    if (match) {
      d = Number(match[1]);
      m = Number(match[2]);
      y = Number(match[3]);
      if (y < 100) y += 2000;
    }
  }

  if (![y, m, d].every(Number.isFinite)) return null;
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function todayDateOnly() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getPoligonoRowByEditKey(editKey) {
  return POLIGONO_POPUP_ROWS.find((row) => row.editKey === editKey) || null;
}

function getPoligonoMergedRowValue(props, editKey) {
  const row = getPoligonoRowByEditKey(editKey);
  if (!row) return "";
  const code = getPoligonoValue(props || {});
  const editData = getPoligonoEditData(code);
  return getPopupValueForRow(props || {}, row, editData);
}

function isPoligonoCicActivo(props) {
  const inicio = parseDateOnlyValue(getPoligonoMergedRowValue(props, "cic_inicio"));
  const cierre = parseDateOnlyValue(getPoligonoMergedRowValue(props, "cic_cierre"));
  if (!inicio || !cierre) return false;
  const today = todayDateOnly();
  return today >= inicio && today <= cierre;
}

function isPoligonoCicTotal(props) {
  const value = getPoligonoMergedRowValue(props || {}, "n_cic");
  return !!normalizeCicNumber(value);
}

function isPoligonoCicTotalesModeEnabled() {
  const checkbox = document.getElementById("layer-poligonos-cic-totales");
  return !!(checkbox && checkbox.checked);
}

function isPoligonoActivosModeEnabled() {
  const checkbox = document.getElementById("layer-poligonos-activos");
  return !!(checkbox && checkbox.checked);
}

function getPoligonoVisibleMode() {
  if (isPoligonoActivosModeEnabled()) return "activos";
  if (isPoligonoCicTotalesModeEnabled()) return "cic_totales";
  if (isLayerChecked("layer-poligonos-supervision")) return "totales";
  return "none";
}

function setPoligonoVisibleMode(mode) {
  const total = document.getElementById("layer-poligonos-supervision");
  const cicTotal = document.getElementById("layer-poligonos-cic-totales");
  const active = document.getElementById("layer-poligonos-activos");
  if (total) total.checked = mode === "totales";
  if (cicTotal) cicTotal.checked = mode === "cic_totales";
  if (active) active.checked = mode === "activos";
}

function refreshOpenPoligonoPopup() {
  try {
    if (_activePoligonoPopup && map.hasLayer(_activePoligonoPopup)) {
      const code = _lastPoligonoPopupCode;
      const props = _activePoligonoPopupProps || _poligonoPropsByCode.get(code) || {};
      _activePoligonoPopup.setContent(buildPoligonoPopup(props));
      return;
    }
  } catch (e) {}

  // Compatibilidad con versiones antiguas que usaban bindPopup sobre cada geometría.
  try {
    layerPoligonosCic.eachLayer((lyr) => {
      const popup = lyr.getPopup && lyr.getPopup();
      if (!popup || !popup.isOpen()) return;
      const props = lyr.feature?.properties || {};
      popup.setContent(buildPoligonoPopup(props));
    });
  } catch (e) {}
}

function openPoligonoEditModal(code) {
  if (!isSimpleLoggedIn()) {
    openLoginModal();
    return;
  }
  const key = String(code || "").trim();
  if (!key) return;
  const props = _poligonoPropsByCode.get(key) || {};
  const editData = getPoligonoEditData(key);
  const modal = document.getElementById("poligono-edit-modal");
  const codeInput = document.getElementById("edit-codigo-poligono");
  const codeLabel = document.getElementById("edit-poligono-code");
  const msg = document.getElementById("poligono-edit-msg");
  if (!modal) return;
  if (codeInput) codeInput.value = key;
  if (codeLabel) codeLabel.textContent = key;
  if (msg) {
    msg.textContent = "";
    msg.classList.remove("ok");
  }
  POLIGONO_POPUP_ROWS.forEach((row) => {
    if (!row.editKey) return;
    const el = document.getElementById(POLIGONO_EDIT_FIELD_IDS[row.editKey]);
    if (el) el.value = getPoligonoInitialEditValue(props, row, editData);
  });
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closePoligonoEditModal() {
  const modal = document.getElementById("poligono-edit-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

async function persistPoligonoEdit(code, payload) {
  if (POLIGONO_EDIT_API.enabled && POLIGONO_EDIT_API.mode === "api" && POLIGONO_EDIT_API.saveUrl) {
    const response = await fetch(POLIGONO_EDIT_API.saveUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Error API ${response.status}`);
    return payload;
  }
  return setPoligonoEditData(code, payload);
}

async function submitPoligonoEditForm(ev) {
  if (ev) ev.preventDefault();
  const code = String(document.getElementById("edit-codigo-poligono")?.value || "").trim();
  const msg = document.getElementById("poligono-edit-msg");
  if (!code) {
    if (msg) msg.textContent = "No se encontró el código de polígono.";
    return;
  }
  const props = _poligonoPropsByCode.get(code) || {};
  const payload = {
    codigo_poligono: code,
    ubigeo: getPoligonoUbigeo(props),
    actualizado_por: currentSimpleUser?.username || "",
    actualizado_en: new Date().toISOString()
  };
  Object.entries(POLIGONO_EDIT_FIELD_IDS).forEach(([key, id]) => {
    const raw = String(document.getElementById(id)?.value || "").trim();
    payload[key] = key === "n_cic" ? normalizeCicSaveValue(raw) : raw;
  });
  try {
    await persistPoligonoEdit(code, payload);
    if (msg) {
      msg.textContent = "Guardado correctamente.";
      msg.classList.add("ok");
    }
    refreshOpenPoligonoPopup();
    if (isPoligonoActivosModeEnabled() || isPoligonoCicTotalesModeEnabled()) {
      try { await syncPoligonosCicLayerForUbigeos(getActiveUbigeos()); } catch (_) {}
    }
    setTimeout(closePoligonoEditModal, 350);
  } catch (e) {
    if (msg) {
      msg.textContent = e?.message || "No se pudo guardar.";
      msg.classList.remove("ok");
    }
  }
}

function bindSimpleAuthAndEditor() {
  currentSimpleUser = getStoredAuthUser();
  syncAuthUi();

  document.getElementById("btn-login")?.addEventListener("click", openLoginModal);
  document.getElementById("btn-logout")?.addEventListener("click", logoutSimpleUser);
  document.getElementById("map-auth-btn")?.addEventListener("click", (ev) => {
    try { L.DomEvent.stop(ev); } catch (e) {}
    toggleMapAuthMenu();
  });
  document.getElementById("map-auth-logout")?.addEventListener("click", (ev) => {
    try { L.DomEvent.stop(ev); } catch (e) {}
    logoutSimpleUser();
  });
  document.getElementById("btn-login-close")?.addEventListener("click", closeLoginModal);
  document.getElementById("btn-login-cancel")?.addEventListener("click", closeLoginModal);
  document.getElementById("btn-login-submit")?.addEventListener("click", submitSimpleLogin);
  document.getElementById("btn-toggle-password")?.addEventListener("click", toggleLoginPasswordVisibility);
  document.getElementById("edit-cic-inicio")?.addEventListener("change", syncCicCierreFromInicio);
  document.getElementById("edit-n-cic")?.addEventListener("input", (ev) => {
    ev.target.value = String(ev.target.value || "").replace(/\D/g, "").slice(0, 3);
  });
  document.getElementById("login-clave")?.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") submitSimpleLogin();
  });
  document.getElementById("login-usuario")?.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") submitSimpleLogin();
  });

  document.getElementById("btn-poligono-edit-close")?.addEventListener("click", closePoligonoEditModal);
  document.getElementById("btn-poligono-edit-cancel")?.addEventListener("click", closePoligonoEditModal);
  document.getElementById("poligono-edit-form")?.addEventListener("submit", submitPoligonoEditForm);

  document.addEventListener("click", (ev) => {
    const authMenu = document.getElementById("map-auth-menu");
    const authWrap = ev.target?.closest?.(".map-auth-wrap");
    if (authMenu && !authWrap) authMenu.hidden = true;

    const editBtn = ev.target?.closest?.(".popup-edit-btn[data-codigo-poligono]");
    if (editBtn) {
      try { L.DomEvent.stop(ev); } catch (e) {}
      openPoligonoEditModal(editBtn.getAttribute("data-codigo-poligono"));
      return;
    }
    const loginModal = document.getElementById("login-modal");
    if (loginModal && ev.target === loginModal) closeLoginModal();
    const editModal = document.getElementById("poligono-edit-modal");
    if (editModal && ev.target === editModal) closePoligonoEditModal();
  });
}

function getPoligonoUbigeoValue(props) {
  const p = props || {};
  const value = firstProp(p, POLIGONOS_CIC_SOURCE.ubigeoFields || []);
  return normalizeUbigeoValue(value);
}

function getStableColorIndex(value, length) {
  const text = String(value || "");
  if (!text || !length) return 0;
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % length;
}

function getPoligonoStyleColors(props) {
  const code = normalizePoligonoCode(getPoligonoValue(props));
  if (!code) return POLIGONO_COLOR_DEFAULT;
  return POLIGONO_COLOR_PALETTE[getStableColorIndex(code, POLIGONO_COLOR_PALETTE.length)] || POLIGONO_COLOR_DEFAULT;
}

function getPoligonoDistrictLabelFromProps(props) {
  const key = getPoligonoUbigeoValue(props);
  return key ? getDistrictDisplayName(key) : "";
}

function buildPoligonoPopup(props) {
  const title = getPoligonoValue(props) || "Polígono";
  const editData = getPoligonoEditData(title);
  const hasCicInfo = isPoligonoCicTotal(props);
  const rowsSource = hasCicInfo
    ? POLIGONO_POPUP_ROWS
    : POLIGONO_POPUP_ROWS.filter((row) => row.editKey === "lote_empresa");
  const rows = rowsSource.map((row) => {
    const value = getPopupValueForRow(props, row, editData);
    return `<tr><td class="key">${escapeHtml(row.label)}</td><td>${formatPopupValue(row.label, value)}</td></tr>`;
  }).join("");
  const reviewMessage = hasCicInfo
    ? ""
    : `<div class="popup-review-notice">Se encuentra aún en etapa de revisión por la UE003 y/o IGN FI.</div>`;
  const editButton = isSimpleLoggedIn()
    ? `<button type="button" class="popup-edit-btn" data-codigo-poligono="${escapeHtml(title)}">Editar información</button>`
    : "";
  const editedMeta = isMeaningfulPopupValue(editData.actualizado_por) || isMeaningfulPopupValue(editData.actualizado_en)
    ? `<div class="popup-edit-meta">Última edición: ${escapeHtml(editData.actualizado_por || "-")} ${escapeHtml(editData.actualizado_en ? new Date(editData.actualizado_en).toLocaleString("es-PE") : "")}</div>`
    : "";

  return `
    <div class="popup-attrs popup-poligono ${hasCicInfo ? "" : "popup-poligono-review"}">
      <h4>${escapeHtml(title)}</h4>
      <table>${rows || '<tr><td colspan="2">&mdash;</td></tr>'}</table>
      ${reviewMessage}
      ${editButton ? `<div class="popup-poligono-actions">${editButton}</div>` : ""}
      ${editedMeta}
    </div>
  `;
}

function getVisiblePoligonoFeaturesByCode(code) {
  const target = normalizePoligonoCode(code);
  const features = [];
  if (!target) return features;
  try {
    layerPoligonosCic.eachLayer((lyr) => {
      const ft = lyr.feature;
      const value = getPoligonoValue(ft?.properties || {});
      if (normalizePoligonoCode(value) === target) features.push(ft);
    });
  } catch (e) {}
  return features;
}

function flashPoligonoGroupByCode(code) {
  const features = getVisiblePoligonoFeaturesByCode(code);
  if (!features.length) return;
  flashGeoJSON(
    { type: "FeatureCollection", features },
    {
      duration: 2600,
      color: "#facc15",
      style: {
        color: "#facc15",
        weight: 6,
        opacity: 1,
        fillColor: "#fef08a",
        fillOpacity: 0.22
      }
    }
  );
}

const poligonoLabelMarkerLayer = L.layerGroup([], { pane: "poligonoLabelPane" });
let _poligonoLabelUpdateRaf = null;

function isPoligonoLabelEnabled() {
  return isLayerChecked("layer-poligonos-labels") && map.hasLayer(layerPoligonosCic);
}

function _poligonoLabelMarkerForFeature(ft) {
  const props = ft?.properties || {};
  const code = getPoligonoValue(props);
  if (!code) return null;
  const info = _featureBoundsAndCenter(ft);
  if (!info || !info.center) return null;
  return L.marker(info.center, {
    pane: "poligonoLabelPane",
    interactive: false,
    keyboard: false,
    icon: L.divIcon({
      className: "poligono-map-label",
      html: `<span>${escapeHtml(code)}</span>`,
      iconSize: [96, 24],
      iconAnchor: [48, 12]
    })
  });
}

function _drawVisiblePoligonoLabels() {
  if (_poligonoLabelUpdateRaf) {
    cancelAnimationFrame(_poligonoLabelUpdateRaf);
    _poligonoLabelUpdateRaf = null;
  }

  if (!isPoligonoLabelEnabled()) {
    poligonoLabelMarkerLayer.clearLayers();
    if (map.hasLayer(poligonoLabelMarkerLayer)) map.removeLayer(poligonoLabelMarkerLayer);
    return;
  }

  const bounds = map.getBounds().pad(0.08);
  const markers = [];
  let count = 0;
  try {
    layerPoligonosCic.eachLayer((lyr) => {
      if (count >= 900) return;
      const ft = lyr.feature;
      const info = _featureBoundsAndCenter(ft);
      if (!info || !info.center || !bounds.contains(info.center)) return;
      const m = _poligonoLabelMarkerForFeature(ft);
      if (!m) return;
      markers.push(m);
      count += 1;
    });
  } catch (e) {}

  poligonoLabelMarkerLayer.clearLayers();
  markers.forEach((m) => poligonoLabelMarkerLayer.addLayer(m));
  if (markers.length && !map.hasLayer(poligonoLabelMarkerLayer)) poligonoLabelMarkerLayer.addTo(map);
  if (!markers.length && map.hasLayer(poligonoLabelMarkerLayer)) map.removeLayer(poligonoLabelMarkerLayer);
}

function syncPoligonoLabels() {
  if (_poligonoLabelUpdateRaf) cancelAnimationFrame(_poligonoLabelUpdateRaf);
  _poligonoLabelUpdateRaf = requestAnimationFrame(() => {
    _poligonoLabelUpdateRaf = null;
    _drawVisiblePoligonoLabels();
  });
}

function togglePoligonoLabelsFromPopup() {
  const checkbox = document.getElementById("layer-poligonos-labels");
  if (!checkbox) return;
  checkbox.checked = !checkbox.checked;
  syncPoligonoLabels();
  refreshOpenPoligonoPopup();
}

let _activePoligonoPopup = null;
let _activePoligonoPopupProps = null;
let _lastPoligonoPopupCode = "";

function closeActivePoligonoPopup() {
  try {
    if (_activePoligonoPopup) map.removeLayer(_activePoligonoPopup);
  } catch (_) {}
  _activePoligonoPopup = null;
  _activePoligonoPopupProps = null;
  _lastPoligonoPopupCode = "";
}

function openPoligonoPopupAt(props, latlng) {
  const cleanProps = props || {};
  const code = getPoligonoValue(cleanProps);
  if (!code) return;

  const where = latlng || map.getCenter();
  _lastPoligonoPopupCode = normalizePoligonoCode(code);
  _activePoligonoPopupProps = cleanProps;

  if (isMobileViewport() && panelCapas && !panelCapas.classList.contains("collapsed")) {
    try { setPanelCollapsed(true, { auto: true }); } catch (_) {}
  }

  closeActivePoligonoPopup();
  _activePoligonoPopup = L.popup({
    maxWidth: 340,
    className: "popup-poligono-wrapper",
    closeButton: true,
    closeOnClick: false,
    autoClose: true,
    autoPan: true,
    keepInView: true
  })
    .setLatLng(where)
    .setContent(buildPoligonoPopup(cleanProps))
    .openOn(map);

  flashPoligonoGroupByCode(code);
}

function featureContainsClickPoint(feature, latlng) {
  if (!feature || !feature.geometry || !latlng || !window.turf?.booleanPointInPolygon) return false;
  const point = {
    type: "Feature",
    properties: {},
    geometry: { type: "Point", coordinates: [latlng.lng, latlng.lat] }
  };
  try {
    return turf.booleanPointInPolygon(point, feature, { ignoreBoundary: false });
  } catch (_) {
    return false;
  }
}

function safeFeatureArea(feature) {
  try {
    if (window.turf?.area) {
      const area = turf.area(feature);
      if (Number.isFinite(area) && area > 0) return area;
    }
  } catch (_) {}
  try {
    const info = _featureBoundsAndCenter(feature);
    if (info && info.bounds) {
      const sw = info.bounds.getSouthWest();
      const ne = info.bounds.getNorthEast();
      return Math.max(0.000001, Math.abs((ne.lng - sw.lng) * (ne.lat - sw.lat)));
    }
  } catch (_) {}
  return Number.POSITIVE_INFINITY;
}

function findBestPoligonoAtLatLng(latlng) {
  if (!latlng || !map.hasLayer(layerPoligonosCic)) return null;

  const candidates = [];
  try {
    layerPoligonosCic.eachLayer((lyr) => {
      const ft = lyr.feature;
      if (!ft || !ft.geometry) return;

      // Filtro barato: si el click ni siquiera cae en el bounds de la geometría, se descarta.
      try {
        if (lyr.getBounds && !lyr.getBounds().pad(0.000001).contains(latlng)) return;
      } catch (_) {}

      if (!featureContainsClickPoint(ft, latlng)) return;

      candidates.push({
        layer: lyr,
        feature: ft,
        area: safeFeatureArea(ft),
        code: normalizePoligonoCode(getPoligonoValue(ft.properties || ""))
      });
    });
  } catch (_) {}

  if (!candidates.length) return null;

  // Si existen polígonos superpuestos, se elige el de menor área.
  // Eso evita que un polígono grande o transparente capture el click de otro más específico.
  candidates.sort((a, b) => {
    if (a.area !== b.area) return a.area - b.area;
    return String(a.code).localeCompare(String(b.code));
  });
  return candidates[0];
}

function shouldIgnorePoligonoMapClick(ev) {
  if (!ev || !ev.originalEvent) return false;
  const target = ev.originalEvent.target;
  if (!target || !target.closest) return false;
  return !!target.closest(
    ".leaflet-control, .leaflet-popup, .leaflet-marker-icon, .side-panel, .select-menu, .login-modal, .poligono-edit-modal, .punto-photo-modal, button, input, textarea, select, a"
  );
}


function getManzanaPoligonoStyleColors(props) {
  // La manzana de polígono hereda el mismo color del código de polígono al que pertenece.
  return getPoligonoStyleColors(props || {});
}

const layerManzanaPoligono = L.geoJSON(null, {
  pane: "manzanaPoligonoPane",
  renderer: RENDERERS.manzanaPoligono,
  interactive: false,
  bubblingMouseEvents: false,
  style: (ft) => {
    const c = getManzanaPoligonoStyleColors(ft?.properties || {});
    return {
      stroke: true,
      color: c.line,
      weight: 1.7,
      opacity: 0.95,
      lineJoin: "round",
      lineCap: "round",
      fill: true,
      fillColor: c.fill,
      fillOpacity: 0.018
    };
  }
});
let _manzanaPoligonoAbort = null;
const manzanaPoligonoLabelMarkerLayer = L.layerGroup([], { pane: "poligonoLabelPane" });
let _manzanaPoligonoLabelUpdateRaf = null;

function getManzanaPoligonoLabelValue(props) {
  return firstProp(props || {}, [
    ...(GEO.fieldAliases?.cod_mzna || []),
    "cod_mzna", "cod_manzana", "cod_manzan", "manzana", "mzna", "mz",
    "COD_MZNA", "COD_MANZANA", "COD_MANZAN", "MANZANA"
  ]);
}

function _manzanaPoligonoLabelMarkerForFeature(ft) {
  const props = ft?.properties || {};
  const text = getManzanaPoligonoLabelValue(props);
  if (!text) return null;
  const info = _featureBoundsAndCenter(ft);
  if (!info || !info.center) return null;
  const c = getManzanaPoligonoStyleColors(props);
  return L.marker(info.center, {
    pane: "poligonoLabelPane",
    interactive: false,
    keyboard: false,
    icon: L.divIcon({
      className: "manzana-poligono-map-label",
      html: `<span style="color:${escapeHtml(c.line)}">${escapeHtml(text)}</span>`,
      iconSize: [72, 22],
      iconAnchor: [36, 11]
    })
  });
}

function syncManzanaPoligonoLabels() {
  if (_manzanaPoligonoLabelUpdateRaf) cancelAnimationFrame(_manzanaPoligonoLabelUpdateRaf);
  _manzanaPoligonoLabelUpdateRaf = requestAnimationFrame(() => {
    _manzanaPoligonoLabelUpdateRaf = null;
    manzanaPoligonoLabelMarkerLayer.clearLayers();
    if (!map.hasLayer(layerManzanaPoligono) || map.getZoom() < MANZANA_LABEL_MIN_ZOOM) {
      if (map.hasLayer(manzanaPoligonoLabelMarkerLayer)) map.removeLayer(manzanaPoligonoLabelMarkerLayer);
      return;
    }
    const bounds = map.getBounds().pad(0.08);
    let count = 0;
    try {
      layerManzanaPoligono.eachLayer((lyr) => {
        if (count >= 850) return;
        const ft = lyr.feature;
        const info = _featureBoundsAndCenter(ft);
        if (!info || !info.center || !bounds.contains(info.center)) return;
        const marker = _manzanaPoligonoLabelMarkerForFeature(ft);
        if (!marker) return;
        manzanaPoligonoLabelMarkerLayer.addLayer(marker);
        count += 1;
      });
    } catch (e) {}
    if (count && !map.hasLayer(manzanaPoligonoLabelMarkerLayer)) manzanaPoligonoLabelMarkerLayer.addTo(map);
    if (!count && map.hasLayer(manzanaPoligonoLabelMarkerLayer)) map.removeLayer(manzanaPoligonoLabelMarkerLayer);
  });
}

function clearManzanaPoligonoLabels() {
  manzanaPoligonoLabelMarkerLayer.clearLayers();
  if (map.hasLayer(manzanaPoligonoLabelMarkerLayer)) map.removeLayer(manzanaPoligonoLabelMarkerLayer);
}

async function fetchManzanaPoligonoByUbigeos(ubigeos, signal) {
  const keys = uniqueList(ubigeos || []).map(normalizeUbigeoValue).filter(Boolean);
  if (!keys.length) return { type: "FeatureCollection", features: [] };
  let lastError = null;
  let emptyResponse = null;
  for (const field of uniqueList(MANZANA_POLIGONO_SOURCE.ubigeoFields || [])) {
    const cql = _cqlByFieldMany(field, keys);
    if (!cql) continue;
    try {
      const gj = await fetchGeoJSON(manzanaPoligonoWfsUrl({ maxFeatures: 200000, cql }), { ttlMs: CACHE.queryTtlMs, signal });
      const features = Array.isArray(gj?.features) ? gj.features : [];
      if (features.length) return { type: "FeatureCollection", features };
      emptyResponse = gj || emptyResponse;
    } catch (e) {
      lastError = e;
      if (String(e?.name || "").toLowerCase() === "aborterror") throw e;
    }
  }
  if (lastError && !emptyResponse) {
    const gj = await fetchGeoJSON(manzanaPoligonoWfsUrl({ maxFeatures: 200000 }), { ttlMs: CACHE.queryTtlMs, signal });
    const set = new Set(keys);
    const features = (Array.isArray(gj?.features) ? gj.features : []).filter((ft) => {
      const props = ft?.properties || {};
      return MANZANA_POLIGONO_SOURCE.ubigeoFields.some((field) => set.has(normalizeUbigeoValue(props?.[field])));
    });
    return { type: "FeatureCollection", features };
  }
  return { type: "FeatureCollection", features: [] };
}

async function syncManzanaPoligonoLayer(ubigeos) {
  const checked = isLayerChecked("layer-poligonos-manzana-poligono");
  if (!checked) {
    layerManzanaPoligono.clearLayers();
    if (map.hasLayer(layerManzanaPoligono)) map.removeLayer(layerManzanaPoligono);
    clearManzanaPoligonoLabels();
    updateLegend();
    ensureLayerOrder();
    return;
  }
  const keys = uniqueList(ubigeos || getActiveUbigeos()).map(normalizeUbigeoValue).filter(Boolean);
  if (!keys.length) return;
  try { if (_manzanaPoligonoAbort) _manzanaPoligonoAbort.abort(); } catch (_) {}
  _manzanaPoligonoAbort = new AbortController();
  try {
    const gj = await fetchManzanaPoligonoByUbigeos(keys, _manzanaPoligonoAbort.signal);
    layerManzanaPoligono.clearLayers();
    layerManzanaPoligono.addData(gj);
    if (!map.hasLayer(layerManzanaPoligono)) layerManzanaPoligono.addTo(map);
    syncManzanaPoligonoLabels();
    updateLegend();
    ensureLayerOrder();
  } catch (e) {
    if (String(e?.name || "").toLowerCase() !== "aborterror") console.warn("No se pudo cargar manzana_poligono", e);
  }
}

const layerPoligonosCic = L.geoJSON(null, {
  pane: "cicPoligonosPane",
  renderer: RENDERERS.cicPoligonos,
  // La interacción se resuelve con un único map.click + Turf.
  // Esto elimina popups cruzados cuando hay polígonos superpuestos o rellenos transparentes.
  interactive: false,
  bubblingMouseEvents: false,
  style: (ft) => {
    const c = getPoligonoStyleColors(ft?.properties || {});
    const activeOnly = isPoligonoActivosModeEnabled();
    const cicTotalOnly = isPoligonoCicTotalesModeEnabled();
    return {
      fill: true,
      color: activeOnly ? "#f97316" : c.line,
      weight: activeOnly ? 3.0 : (cicTotalOnly ? 2.8 : 2.2),
      opacity: 0.98,
      dashArray: "7 4",
      fillColor: activeOnly ? "#f97316" : c.fill,
      fillOpacity: activeOnly ? 0.07 : (cicTotalOnly ? 0.065 : 0.04),
      interactive: false
    };
  },
  onEachFeature: (ft, lyr) => {
    const props = ft?.properties || {};
    const code = getPoligonoValue(props);
    if (code) _poligonoPropsByCode.set(String(code), props);
  }
});

map.on("click", (ev) => {
  if (measuring) return;
  if (!map.hasLayer(layerPoligonosCic)) return;
  if (shouldIgnorePoligonoMapClick(ev)) return;

  const hit = findBestPoligonoAtLatLng(ev.latlng);
  if (!hit || !hit.feature) {
    closeActivePoligonoPopup();
    return;
  }

  const props = hit.feature.properties || {};
  openPoligonoPopupAt(props, ev.latlng);
});


const layerDistrictHalo = L.geoJSON(null, {
  pane: "districtHaloPane",
  interactive: false,
  style: getDistrictHaloStyle
}).addTo(map);

const layerDistrictOutline = L.geoJSON(null, {
  pane: "districtPane",
  interactive: false,
  style: getDistrictOutlineStyle
}).addTo(map);

const layerConflictoTerritorial = L.geoJSON(null, {
  pane: "conflictPane",
  renderer: RENDERERS.conflicto,
  interactive: false,
  bubblingMouseEvents: false,
  style: () => ({
    stroke: true,
    color: "#dc2626",
    weight: 2.2,
    opacity: 0.95,
    fill: true,
    fillColor: "#ef4444",
    fillOpacity: 0.28,
    dashArray: "6,4"
  })
});

function _districtFeaturesForUbigeos(ubigeos) {
  const keys = uniqueList(ubigeos || []);
  const includeAll = !keys.length || keys.includes(ALL_DISTRICTS_VALUE);
  const out = [];
  districtCatalog.forEach((entry, ubigeo) => {
    if (!includeAll && !keys.includes(String(ubigeo))) return;
    const arr = Array.isArray(entry?.features) ? entry.features : [];
    arr.forEach((ft) => out.push({ ubigeo: String(ubigeo), nombre: entry?.nombre || String(ubigeo), feature: ft }));
  });
  return out;
}

function _featureBboxArray(ft) {
  try {
    if (window.turf && turf.bbox) return turf.bbox(ft);
  } catch (e) {}
  const b = _featureRawBounds(ft);
  return b ? [b.minLng, b.minLat, b.maxLng, b.maxLat] : null;
}

function _bboxIntersects(a, b) {
  if (!a || !b) return false;
  return !(a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]);
}

function computeConflictFeatures(ubigeos) {
  if (!window.turf || !turf.intersect || !turf.area) {
    console.warn("Turf no esta disponible. No se puede calcular intersecciones de distritos.");
    return [];
  }

  const activeKeys = uniqueList(ubigeos || getActiveUbigeos());
  const includeAll = !activeKeys.length || activeKeys.includes(ALL_DISTRICTS_VALUE);
  const rows = _districtFeaturesForUbigeos(includeAll ? [] : getAllDistrictUbigeos());
  const activeSet = new Set(activeKeys);
  const out = [];

  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i];
      const b = rows[j];
      if (!a || !b || a.ubigeo === b.ubigeo) continue;
      if (!includeAll && !(activeSet.has(a.ubigeo) || activeSet.has(b.ubigeo))) continue;

      const bboxA = _featureBboxArray(a.feature);
      const bboxB = _featureBboxArray(b.feature);
      if (!_bboxIntersects(bboxA, bboxB)) continue;

      try {
        const inter = turf.intersect(a.feature, b.feature);
        if (!inter) continue;
        const area = turf.area(inter);
        if (!Number.isFinite(area) || area < 1) continue;
        inter.properties = {
          distrito_a: a.nombre,
          distrito_b: b.nombre,
          ubigeo_a: a.ubigeo,
          ubigeo_b: b.ubigeo,
          area_m2: Math.round(area * 100) / 100
        };
        out.push(inter);
      } catch (e) {
        // Geometrias invalidas o no soportadas se omiten para no romper el visor.
      }
    }
  }
  return out;
}

function syncConflictoTerritorialLayer() {
  const checkbox = document.getElementById("layer-conflicto-zona");
  const enabled = !!(checkbox && checkbox.checked);
  layerConflictoTerritorial.clearLayers();
  if (!enabled) {
    if (map.hasLayer(layerConflictoTerritorial)) map.removeLayer(layerConflictoTerritorial);
    updateLegend();
    return;
  }

  const keys = getActiveUbigeos();
  const cacheKey = `${keys.join(",") || "todos"}|${districtCatalog.size}`;
  const features = computeConflictFeatures(keys);
  _conflictComputedKey = cacheKey;

  if (features.length) {
    layerConflictoTerritorial.addData({ type: "FeatureCollection", features });
    if (!map.hasLayer(layerConflictoTerritorial)) layerConflictoTerritorial.addTo(map);
  } else if (map.hasLayer(layerConflictoTerritorial)) {
    map.removeLayer(layerConflictoTerritorial);
  }
  updateLegend();
  ensureLayerOrder();
}

function renderDistrictOutlineForUbigeos(ubigeos) {
  const keys = uniqueList(ubigeos || []);
  layerDistrictHalo.clearLayers();
  layerDistrictOutline.clearLayers();
  if (!keys.length) return;

  const feats = [];
  keys.forEach((key) => {
    const entry = districtCatalog.get(String(key).trim());
    const arr = Array.isArray(entry?.features) ? entry.features : [];
    arr.forEach((ft) => feats.push(ft));
  });
  if (!feats.length) return;

  const gj = { type: "FeatureCollection", features: feats };
  layerDistrictHalo.addData(gj);
  layerDistrictOutline.addData(gj);
  refreshDistrictVisualStyle();
  ensureLayerOrder();
}

function renderDistrictOutline(ubigeo) {
  const key = String(ubigeo || "").trim();
  renderDistrictOutlineForUbigeos(key ? [key] : []);
}

async function syncPoligonosCicLayerForUbigeos(ubigeos) {
  const mode = getPoligonoVisibleMode();
  const activeOnly = mode === "activos";
  const cicTotalOnly = mode === "cic_totales";
  const enabled = mode !== "none";
  const keys = uniqueList(ubigeos || getActiveUbigeos());

  // Siempre se consulta el universo del distrito/lote activo para actualizar los contadores,
  // aunque las capas de polígono estén apagadas. La visualización se controla aparte.
  layerPoligonosCic.clearLayers();
  if (map.hasLayer(layerPoligonosCic)) map.removeLayer(layerPoligonosCic);
  syncPoligonoLabels();

  if (!keys.length) {
    clearPoligonoCountBadges();
    updateLegend();
    return;
  }

  try { if (_poligonosCicAbort) _poligonosCicAbort.abort(); } catch (e) {}
  _poligonosCicAbort = new AbortController();

  try {
    if (enabled && searchResult) {
      searchResult.textContent = activeOnly
        ? "Cargando polígonos CIC activos..."
        : (cicTotalOnly ? "Cargando polígonos CIC totales..." : "Cargando polígonos totales...");
    }

    const gj = await fetchPoligonosByUbigeos(keys, _poligonosCicAbort.signal);
    const allFeaturesForCounts = Array.isArray(gj?.features) ? gj.features : [];
    updatePoligonoCountBadges(computePoligonoCountsFromFeatures(allFeaturesForCounts));

    if (!enabled) {
      updateLegend();
      return;
    }

    const features = allFeaturesForCounts.filter((ft) => {
      const props = ft?.properties || {};
      if (activeOnly) return isPoligonoCicActivo(props);
      if (cicTotalOnly) return isPoligonoCicTotal(props);
      return true;
    });

    if (features.length) {
      layerPoligonosCic.addData({ type: "FeatureCollection", features });
      if (!map.hasLayer(layerPoligonosCic)) layerPoligonosCic.addTo(map);
      ensureLayerOrder();
      syncPoligonoLabels();
      if (searchResult) searchResult.textContent = "";
    } else {
      syncPoligonoLabels();
      if (searchResult) searchResult.textContent = "No hay polígonos para la selección actual.";
    }
  } catch (e) {
    if (String(e?.name || "").toLowerCase() !== "aborterror") console.warn(e);
  } finally {
    updateLegend();
  }
}

async function syncPoligonosCicLayer(ubigeo) {
  const key = String(ubigeo || "").trim();
  return syncPoligonosCicLayerForUbigeos(key ? [key] : getActiveUbigeos());
}


ensureLayerOrder();

function syncBaseLayerVisibilityFromUI() {
  try {
    if (isLayerChecked("layer-base-sector")) {
      if (!map.hasLayer(layerSector)) layerSector.addTo(map);
    } else if (map.hasLayer(layerSector)) {
      map.removeLayer(layerSector);
    }

    if (isLayerChecked("layer-base-manzana")) {
      if (!map.hasLayer(layerManzana)) layerManzana.addTo(map);
    } else if (map.hasLayer(layerManzana)) {
      map.removeLayer(layerManzana);
    }

    syncBaseLabelLayerVisibility();
    updateLegend();
    ensureLayerOrder();
  } catch (e) {
    console.warn(e);
  }
}

function updateLabelOpacity() {
  syncBaseLabelLayerVisibility();
}
map.on("zoomend moveend resize", () => { updateLabelOpacity(); syncPoligonoLabels(); syncManzanaPoligonoLabels(); });
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



function getPoligonoValue(props) {
  return String(firstProp(props || {}, POLIGONOS_CIC_SOURCE.poligonoFields || []) || "").trim();
}

function parsePoligonoSearchTerms(text) {
  return uniqueList(
    String(text || "")
      .split(/[;,\n]+/)
      .map((v) => v.replace(/\s+/g, "").trim())
      .filter(Boolean)
  );
}

function normalizePoligonoCode(value) {
  const raw = String(value === undefined || value === null ? "" : value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .trim()
    .toUpperCase();
  if (!raw) return "";
  if (/^\d+$/.test(raw)) return raw.replace(/^0+/, "") || "0";
  return raw;
}

function poligonoCodeMatches(value, terms) {
  const code = normalizePoligonoCode(value);
  if (!code) return false;
  return (terms || []).some((term) => normalizePoligonoCode(term) === code);
}

function getPoligonoFeatureUbigeo(ft) {
  return getPoligonoUbigeoValue(ft?.properties || {});
}

function getPoligonoFeaturesDistrictSummary(features) {
  const keys = uniqueList((features || []).map(getPoligonoFeatureUbigeo).filter(Boolean));
  if (!keys.length) return "otro distrito";
  if (keys.length === 1) return getDistrictDisplayName(keys[0]);
  return keys.map((k) => getDistrictDisplayName(k)).join(", ");
}

function showOnlyPoligonoFeatures(features, opts = {}) {
  const arr = Array.isArray(features) ? features : [];
  updatePoligonoCountBadges(computePoligonoCountsFromFeatures(arr));
  layerPoligonosCic.clearLayers();

  setPoligonoVisibleMode("totales");

  if (!arr.length) {
    if (map.hasLayer(layerPoligonosCic)) map.removeLayer(layerPoligonosCic);
    syncPoligonoLabels();
    updateLegend();
    return;
  }

  const gj = { type: "FeatureCollection", features: arr };
  layerPoligonosCic.addData(gj);
  if (!map.hasLayer(layerPoligonosCic)) layerPoligonosCic.addTo(map);
  ensureLayerOrder();
  syncPoligonoLabels();
  updateLegend();

  if (opts.fit !== false) {
    try {
      const b = layerPoligonosCic.getBounds();
      if (b && b.isValid()) map.fitBounds(b, { padding: [36, 36] });
    } catch (e) {}
  }
}

function clearActivePoligonoSearch() {
  _activePoligonoSearch = null;
}

function _textMatchesSearch(value, query) {
  const a = normalizeDistrictName(value).replace(/^0+/, "");
  const b = normalizeDistrictName(query).replace(/^0+/, "");
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

async function searchPoligonoWfs(poligonoText, activeKeys) {
  const terms = parsePoligonoSearchTerms(poligonoText);
  const keys = uniqueList(activeKeys || []);
  const normalizedKeys = new Set(keys.map(normalizeUbigeoValue).filter(Boolean));
  const districtNames = new Set(keys.map((k) => getActiveDistrictName(k)).filter(Boolean));

  if (!terms.length) {
    if (searchResult) searchResult.textContent = "Ingresa uno o varios codigos de poligono.";
    return;
  }

  const gj = await fetchPoligonosByCodes(terms);
  const allFeatures = Array.isArray(gj?.features) ? gj.features : [];

  if (!allFeatures.length) {
    layerPoligonosCic.clearLayers();
    syncPoligonoLabels();
    if (searchResult) searchResult.textContent = "No se encontro el poligono.";
    return;
  }

  const selectedFeatures = allFeatures.filter((ft) => {
    if (!keys.length) return true;
    const props = ft?.properties || {};
    const matchesUbigeo = POLIGONOS_CIC_SOURCE.ubigeoFields.some((field) => normalizedKeys.has(normalizeUbigeoValue(props?.[field])));
    if (matchesUbigeo) return true;
    return POLIGONOS_CIC_SOURCE.districtFields.some((field) => districtNames.has(normalizeDistrictName(props?.[field])));
  });

  let features = selectedFeatures;
  if (keys.length && selectedFeatures.length !== allFeatures.length) {
    const outsideFeatures = allFeatures.filter((ft) => !selectedFeatures.includes(ft));
    const districtSummary = getPoligonoFeaturesDistrictSummary(outsideFeatures.length ? outsideFeatures : allFeatures);
    const codesLabel = terms.join(", ");
    const ok = window.confirm(`El poligono ${codesLabel} pertenece a ${districtSummary}. ¿Deseas ir a ese distrito y mostrar el poligono indicado?`);

    if (ok) {
      const targetUbigeos = uniqueList(allFeatures.map(getPoligonoFeatureUbigeo).filter(Boolean));
      if (targetUbigeos.length === 1) {
        await setDistrict(targetUbigeos[0]);
      } else if (targetUbigeos.length > 1) {
        await setDistrictsSelection(targetUbigeos, "poligono_busqueda", `${targetUbigeos.length} distritos`, {
          districtSelectValue: ALL_DISTRICTS_VALUE,
          skipBase: false
        });
      }
      features = allFeatures;
    } else if (!features.length) {
      if (searchResult) searchResult.textContent = `El poligono pertenece a ${districtSummary}. No se cambio de distrito.`;
      return;
    }
  }

  _activePoligonoSearch = {
    terms,
    features,
    ubigeos: uniqueList(features.map(getPoligonoFeatureUbigeo).filter(Boolean))
  };

  showOnlyPoligonoFeatures(features, { fit: true });

  const foundCodes = uniqueList(features.map((ft) => getPoligonoValue(ft?.properties || {})).filter(Boolean));
  const foundSet = new Set(foundCodes.map(normalizePoligonoCode));
  const missing = terms.filter((term) => !foundSet.has(normalizePoligonoCode(term)));
  const districts = getPoligonoFeaturesDistrictSummary(features);
  const tags = [];
  if (foundCodes.length) tags.push(`Poligono ${foundCodes.join(", ")}`);
  if (districts) tags.push(districts);
  let msg = `${features.length} poligono(s) mostrado(s)${tags.length ? " - " + tags.join(" | ") : ""}`;
  if (missing.length) msg += `. No encontrados: ${missing.join(", ")}`;
  if (searchResult) searchResult.textContent = msg;
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

  const selectedDistrict = clean(searchDistrito?.value);
  const activeKeys = getActiveUbigeos();
  const poligono = clean(searchPoligono?.value);
  const sector = pad(searchSector?.value, 2);
  const mz = pad(searchMz?.value, 3);
  const lt = pad(searchLt?.value, 3);

  // No ejecutar búsqueda si el usuario no escribió ningún criterio.
  // El distrito/lote solo define el ámbito; no debe disparar una búsqueda vacía.
  if (!poligono && !sector && !mz && !lt) {
    if (searchResult) searchResult.textContent = "Ingresa un dato para buscar: Polígono, Sector, Manzana o Lote.";
    return;
  }
  if (!poligono && !activeKeys.length) {
    if (searchResult) searchResult.textContent = "Aviso: selecciona Distrito/Lote o ingresa Polígono.";
    return;
  }
  if (lt && !mz) {
    if (searchResult) searchResult.textContent = "Aviso: para buscar un lote, ingresa tambien la Manzana.";
    return;
  }

  try {
    if (searchResult) searchResult.textContent = "Buscando...";

    if (poligono) {
      await searchPoligonoWfs(poligono, activeKeys);
      return;
    }

    clearActivePoligonoSearch();

    const hasBaseMz = Array.isArray(_baseFeatureIndex.manzana) && _baseFeatureIndex.manzana.length > 0;

    if (lt) {
      if (searchResult) searchResult.textContent = "La capa base de Lote fue reemplazada por Sector. Para ubicar predios, usa Poligono, Distrito/Lote, Sector y/o Manzana.";
      return;
    }

    if (!hasBaseMz) {
      const msg = selectedDistrict === ALL_DISTRICTS_VALUE
        ? "Selecciona un distrito o un lote para cargar datos de Manzana y Sector."
        : "Cargando datos de Manzana... intenta de nuevo en unos segundos.";
      if (searchResult) searchResult.textContent = msg;
      return;
    }

    const matches = [];
    (_baseFeatureIndex.manzana || []).forEach((item) => {
      const p = item?.feature?.properties || {};
      if (mz && !eqCode(getFeatureValue(p, "cod_mzna"), mz)) return;
      if (sector && !eqCode(getFeatureValue(p, "cod_sector"), sector)) return;
      if (activeKeys.length && !activeKeys.some((ub) => eqCode(getFeatureValue(p, "ubigeo"), ub))) return;
      matches.push(item.feature);
    });

    if (!matches.length) {
      if (mz && !sector && !activeKeys.length) {
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
    if (mz && !sector && !activeKeys.length) {
      if (searchResult) searchResult.textContent = `Manzana ${mz} encontrada`;
      return;
    }
    const tags = [];
    if (_activeSelectionLabel) tags.push(_activeSelectionLabel);
    if (sector) tags.push(`Sector ${sector}`);
    if (mz) tags.push(`Mz ${mz}`);
    if (searchResult) searchResult.textContent = `${n} manzana(s) encontrada(s)${tags.length ? " - " + tags.join(" | ") : ""}`;
  } catch (err) {
    console.error(err);
    if (searchResult) searchResult.textContent = "Error al buscar. Revisa la consola.";
  }
}

function clearSearchAndRestoreLayers() {
  clearFlash();
  clearActivePoligonoSearch();
  if (searchPoligono) searchPoligono.value = "";
  if (searchSector) searchSector.value = "";
  if (searchMz) searchMz.value = "";
  if (searchLt) searchLt.value = "";
  if (searchResult) searchResult.textContent = "";

  const shouldReloadPoligonos = getPoligonoVisibleMode() !== "none";
  if (shouldReloadPoligonos) {
    syncPoligonosCicLayerForUbigeos(getActiveUbigeos()).catch((e) => console.warn(e));
  } else {
    layerPoligonosCic.clearLayers();
    if (map.hasLayer(layerPoligonosCic)) map.removeLayer(layerPoligonosCic);
    syncPoligonoLabels();
    updateLegend();
  }
}

btnSearch?.addEventListener("click", doSearch);
btnClearSearch?.addEventListener("click", clearSearchAndRestoreLayers);
searchPoligono?.addEventListener("keypress", (e) => { if (e.key === "Enter") doSearch(); });
searchSector?.addEventListener("keypress", (e) => { if (e.key === "Enter") doSearch(); });
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

function revealDistrictOnMobile(ubigeo) {
  const key = String(ubigeo || "").trim();
  if (!key || !isMobileViewport() || !panelCapas || panelCapas.classList.contains("collapsed")) return;

  if (_districtRevealTimer) {
    clearTimeout(_districtRevealTimer);
    _districtRevealTimer = null;
  }

  setPanelCollapsed(true, { auto: false });
  _districtRevealTimer = window.setTimeout(() => {
    try { map.invalidateSize(); } catch (e) {}
    focusDistrict(key);
    _districtRevealTimer = null;
  }, Math.max(PANEL_TRANSITION_MS + 40, 180));
}

function focusDistrictBounds(bounds) {
  if (!bounds || !bounds.isValid || !bounds.isValid()) return false;

  try {
    if (typeof map.flyToBounds === "function") {
      map.flyToBounds(bounds, {
        padding: [34, 34],
        duration: 0.65,
        easeLinearity: 0.25,
        noMoveStart: true
      });
      return true;
    }
  } catch (e) {}

  try {
    map.fitBounds(bounds, { padding: [34, 34], animate: true });
    return true;
  } catch (e) {}

  return false;
}

function focusDistrict(ubigeo) {
  if (!ubigeo) return;

  try {
    const outlineBounds = layerDistrictOutline && layerDistrictOutline.getBounds ? layerDistrictOutline.getBounds() : null;
    if (outlineBounds && outlineBounds.isValid && outlineBounds.isValid()) {
      if (focusDistrictBounds(outlineBounds)) return;
    }
  } catch (e) {}

  try {
    const entry = districtCatalog.get(String(ubigeo).trim());
    const directBounds = entry?.bounds;
    if (directBounds && directBounds.isValid && directBounds.isValid()) {
      if (focusDistrictBounds(directBounds)) return;
    }
  } catch (e) {}

  try {
    const b = _districtBounds && _districtBounds[ubigeo];
    if (b && b.isValid && b.isValid()) {
      if (focusDistrictBounds(b)) return;
    }
  } catch (e) {}

  try {
    const b = L.latLngBounds([]);
    (_baseFeatureIndex.manzana || []).forEach((item) => {
      const p = item?.feature?.properties || {};
      if (String(getFeatureValue(p, "ubigeo") ?? "").trim() === String(ubigeo).trim()) {
        if (item.bounds && item.bounds.isValid && item.bounds.isValid()) b.extend(item.bounds);
      }
    });
    if (b && b.isValid && b.isValid()) focusDistrictBounds(b);
  } catch (e) {}
}

function focusDistricts(ubigeos) {
  const keys = uniqueList(ubigeos || []);
  if (!keys.length) return;
  if (keys.length === 1) {
    focusDistrict(keys[0]);
    return;
  }

  try {
    const bounds = L.latLngBounds([]);
    keys.forEach((key) => {
      const entry = districtCatalog.get(String(key).trim());
      if (entry?.bounds && entry.bounds.isValid && entry.bounds.isValid()) bounds.extend(entry.bounds);
    });
    if (bounds && bounds.isValid && bounds.isValid()) {
      focusDistrictBounds(bounds);
      return;
    }
  } catch (e) {}
}

async function setDistrict(ubigeo) {
  const ub = String(ubigeo || "").trim();
  if (!ub) return;
  const shouldRevealOnMobile = isMobileViewport() && !!panelCapas && !panelCapas.classList.contains("collapsed");
  setLoteGroupSelectValue("");
  _activeLoteGroupKey = "";
  _activeUbigeos = [ub];
  _activeSelectionKey = ub;
  _activeSelectionLabel = getDistrictDisplayName(ub);
  syncDistrictUiState(ub);

  renderDistrictOutline(ub);
  focusDistrict(ub);
  updateLegend();
  const cicPromise = syncPoligonosCicLayerForUbigeos([ub]);

  if (_baseLoaded && _currentUbigeo === ub) {
    await cicPromise;
    syncConflictoTerritorialLayer();
    syncActividadesLayer();
    syncPuntosDistritoLayers();
    syncManzanaPoligonoLayer([ub]);
    updateActividadCountsInPanel();
    if (shouldRevealOnMobile) revealDistrictOnMobile(ub);
    return;
  }

  _pendingUbigeo = ub;
  await Promise.all([loadBaseForUbigeo(ub), cicPromise]);
  syncConflictoTerritorialLayer();
  syncActividadesLayer();
  syncPuntosDistritoLayers();
  syncManzanaPoligonoLayer([ub]);
  updateActividadCountsInPanel();
  if (shouldRevealOnMobile) revealDistrictOnMobile(ub);
}

async function setDistrictsSelection(ubigeos, selectionKey, selectionLabel, options = {}) {
  const keys = uniqueList(ubigeos || []);
  if (!keys.length) return;

  const shouldRevealOnMobile = isMobileViewport() && !!panelCapas && !panelCapas.classList.contains("collapsed");
  _activeUbigeos = keys;
  _activeSelectionKey = selectionKey || keys.join(",");
  _activeSelectionLabel = selectionLabel || getSelectionLabelForUbigeos(keys);

  syncDistrictUiState(options.districtSelectValue || ALL_DISTRICTS_VALUE);
  renderDistrictOutlineForUbigeos(keys);
  focusDistricts(keys);
  updateLegend();

  const cicPromise = syncPoligonosCicLayerForUbigeos(keys);
  const loadPromise = options.skipBase ? Promise.resolve(clearBaseWfsLayers()) : loadBaseForUbigeos(keys, _activeSelectionKey);
  await Promise.all([loadPromise, cicPromise]);
  syncConflictoTerritorialLayer();
  syncActividadesLayer();
  syncPuntosDistritoLayers();
  syncManzanaPoligonoLayer(keys);
  updateActividadCountsInPanel();

  if (shouldRevealOnMobile && keys.length === 1) revealDistrictOnMobile(keys[0]);
}

async function setAllDistricts() {
  setLoteGroupSelectValue("");
  _activeLoteGroupKey = "";
  const keys = getAllDistrictUbigeos();
  await setDistrictsSelection(keys, ALL_DISTRICTS_VALUE, "Todos", {
    districtSelectValue: ALL_DISTRICTS_VALUE,
    skipBase: false
  });
  if (searchResult) searchResult.textContent = "";
}

async function setLoteGroup(groupKey) {
  const key = String(groupKey || "").trim();
  const group = LOTE_GROUPS[key];
  if (!group) return;
  _activeLoteGroupKey = key;
  await setDistrictsSelection(group.ubigeos, key, getLoteGroupLabel(key), {
    districtSelectValue: ALL_DISTRICTS_VALUE,
    skipBase: false
  });
}

function bindDistrictModal() {
  if (_districtModalBound) return;
  const modal = document.getElementById("district-modal");
  if (!modal) return;

  modal.addEventListener("click", async (ev) => {
    const btn = ev.target.closest(".district-btn[data-ubigeo]");
    if (!btn || btn.disabled) return;
    const ub = btn.getAttribute("data-ubigeo");
    closeDistrictModal();
    try { await setDistrict(ub); } catch (e) { console.warn(e); }
  });

  _districtModalBound = true;
}

function _selectText(select) {
  if (!select) return "";
  const opt = select.options && select.options[select.selectedIndex];
  return String(opt?.textContent || "Seleccionar").trim();
}

function closePrettySelects(except) {
  document.querySelectorAll(".pretty-select.open").forEach((el) => {
    if (except && el === except) return;
    el.classList.remove("open");
    const btn = el.querySelector(".pretty-select-btn");
    if (btn) btn.setAttribute("aria-expanded", "false");
    el.closest(".district-section")?.classList.remove("pretty-select-parent-open");
  });
}


function positionPrettySelectDropdown(wrap) {
  if (!wrap) return;
  const btn = wrap.querySelector(".pretty-select-btn");
  const list = wrap.querySelector(".pretty-select-list");
  if (!btn || !list) return;
  const rect = btn.getBoundingClientRect();
  const gap = 8;
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  const minMargin = 8;
  const width = Math.max(rect.width, 180);
  let left = rect.left;
  if (left + width > vw - minMargin) left = Math.max(minMargin, vw - width - minMargin);
  let top = rect.bottom + gap;
  const availableBelow = vh - top - minMargin;
  const availableAbove = rect.top - minMargin - gap;
  const desiredHeight = Math.min(280, Math.max(160, list.scrollHeight || 220));
  if (availableBelow < 150 && availableAbove > availableBelow) {
    top = Math.max(minMargin, rect.top - gap - Math.min(desiredHeight, availableAbove));
  }
  list.style.setProperty("--pretty-left", `${Math.round(left)}px`);
  list.style.setProperty("--pretty-top", `${Math.round(top)}px`);
  list.style.setProperty("--pretty-width", `${Math.round(width)}px`);
}

function positionOpenPrettySelects() {
  document.querySelectorAll(".pretty-select.open").forEach(positionPrettySelectDropdown);
}

function syncPrettySelect(select) {
  if (!select) return;
  const wrap = select.parentElement?.querySelector(`.pretty-select[data-source-id="${select.id}"]`);
  if (!wrap) return;
  const btnText = wrap.querySelector(".pretty-select-current");
  if (btnText) btnText.textContent = _selectText(select);
  wrap.querySelectorAll(".pretty-option").forEach((opt) => {
    const active = String(opt.getAttribute("data-value") || "") === String(select.value || "");
    opt.classList.toggle("is-selected", active);
    opt.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function rebuildPrettySelect(select) {
  if (!select || !select.id) return;
  const wrap = select.parentElement?.querySelector(`.pretty-select[data-source-id="${select.id}"]`);
  if (!wrap) return;
  const list = wrap.querySelector(".pretty-select-list");
  if (!list) return;
  list.innerHTML = "";
  Array.from(select.options || []).forEach((option) => {
    const optionValue = String(option.value || "");
    if (optionValue === "") return;
    const item = document.createElement("button");
    item.type = "button";
    item.className = "pretty-option";
    item.setAttribute("role", "option");
    item.setAttribute("data-value", optionValue);
    item.textContent = String(option.textContent || "").trim();
    item.title = item.textContent;
    item.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      select.value = optionValue;
      syncPrettySelect(select);
      closePrettySelects();
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    list.appendChild(item);
  });
  syncPrettySelect(select);
}

function initPrettySelect(select) {
  if (!select || select.dataset.prettySelectReady === "1") {
    if (select) rebuildPrettySelect(select);
    return;
  }
  select.dataset.prettySelectReady = "1";
  select.classList.add("pretty-select-source");

  const wrap = document.createElement("div");
  wrap.className = "pretty-select";
  wrap.setAttribute("data-source-id", select.id);
  wrap.innerHTML = `
    <button type="button" class="pretty-select-btn" aria-haspopup="listbox" aria-expanded="false">
      <span class="pretty-select-current"></span>
      <span class="pretty-select-caret" aria-hidden="true"></span>
    </button>
    <div class="pretty-select-list" role="listbox"></div>
  `;
  select.insertAdjacentElement("afterend", wrap);

  const btn = wrap.querySelector(".pretty-select-btn");
  btn?.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const willOpen = !wrap.classList.contains("open");
    closePrettySelects(wrap);
    wrap.classList.toggle("open", willOpen);
    wrap.closest(".district-section")?.classList.toggle("pretty-select-parent-open", willOpen);
    btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    if (willOpen) {
      requestAnimationFrame(() => positionPrettySelectDropdown(wrap));
    }
  });

  select.addEventListener("change", () => syncPrettySelect(select));
  rebuildPrettySelect(select);
}

function initPrettySelects() {
  initPrettySelect(document.getElementById("search-distrito"));
  initPrettySelect(document.getElementById("search-lote-grupo"));
}

document.addEventListener("click", (ev) => {
  if (!ev.target?.closest?.(".pretty-select")) closePrettySelects();
  if (!ev.target?.closest?.(".dashboard-box")) {
    document.querySelectorAll(".dashboard-box.mobile-actions-open").forEach((el) => el.classList.remove("mobile-actions-open"));
  }
});

window.addEventListener("resize", positionOpenPrettySelects);
window.addEventListener("scroll", positionOpenPrettySelects, true);

document.querySelector(".panel-capas")?.addEventListener("scroll", () => closePrettySelects(), { passive: true });

document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") closePrettySelects();
});

document.addEventListener("DOMContentLoaded", async () => {
  await initDistrictCatalog();
  initPrettySelects();
  preloadPuntosDistritos();
  bindDistrictModal();
  openDistrictModal();
  syncBaseLayerVisibilityFromUI();
  setAllSidebarGroupsCollapsed();
  syncBuscadorAccordion();
  bindSimpleAuthAndEditor();
  bindPuntoPhotoEditor();
  bindKmlKmzUpload();

  if (searchDistrito) {
    searchDistrito.addEventListener("change", () => {
      const ub = String(searchDistrito.value || "").trim();
      clearActivePoligonoSearch();
      if (searchPoligono) searchPoligono.value = "";
      if (ub === ALL_DISTRICTS_VALUE) {
        setAllDistricts().catch((e) => console.warn(e));
      } else if (ub) {
        setDistrict(ub).catch((e) => console.warn(e));
      }
    });
  }

  if (searchLoteGrupo) {
    searchLoteGrupo.addEventListener("change", () => {
      clearActivePoligonoSearch();
      if (searchPoligono) searchPoligono.value = "";
      const key = String(searchLoteGrupo.value || "").trim();
      if (key) setLoteGroup(key).catch((e) => console.warn(e));
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
      const band = getViewportBand();
      const isMobile = band === "mobile" || band === "mobile-small";
      const isCollapsed = !!(panelCapas && panelCapas.classList.contains("collapsed"));
      const baseGap = 10;

      // El mapa ya empieza a la derecha del panel mediante CSS (#map { left: var(--panel-width) }).
      // Si aquí se suma otra vez el ancho del panel, la columna de zoom se va al centro.
      // Por eso el control siempre queda a 10 px del borde real del mapa.
      let leftOffset = baseGap;

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
  // Se mantiene la función por compatibilidad, pero sin animación continua
  // para evitar que los controles de zoom parezcan rebotar.
  stopPanelOffsetTracking();
  updateMapLeftControlOffsets();
}

function getViewportBand() {
  const w = window.innerWidth || document.documentElement.clientWidth || 0;
  if (w <= 575.98) return "mobile-small";
  if (w <= 767.98) return "mobile";
  if (w <= 1199.98) return "narrow";
  return "wide";
}

function panelToggleIconHtml(collapsed) {
  const arrow = collapsed ? "M10 9l3 3-3 3" : "M14 9l-3 3 3 3";
  return `
    <svg class="panel-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect class="panel-toggle-frame" x="4" y="5" width="16" height="14" rx="2"></rect>
      <path class="panel-toggle-bar" d="M9 5v14"></path>
      <path class="panel-toggle-arrow" d="${arrow}"></path>
    </svg>`;
}

function updatePanelButtons() {
  try {
    const isCollapsed = !!(panelCapas && panelCapas.classList.contains("collapsed"));
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-label", isCollapsed ? "Mostrar panel" : "Ocultar panel");
      toggleBtn.title = isCollapsed ? "Mostrar panel" : "Ocultar panel";
    }
    const cornerPanelBtn = document.querySelector(".corner-panel-btn");
    if (cornerPanelBtn) {
      cornerPanelBtn.innerHTML = panelToggleIconHtml(isCollapsed);
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
  updateMapLeftControlOffsets();

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
  closeLoginModal();
  closePoligonoEditModal();
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


// ===== Actividades de supervisión comunicación: prueba desde CSV convertido a JS =====
const ACTIVIDAD_CATEGORY_DEFS = {
  charla: {
    checkboxId: "layer-act-charla",
    label: "Charla de Sensibilización",
    color: "#dc2626",
    match: (r) => _actividadText(r).includes("charla")
  },
  afiches: {
    checkboxId: "layer-act-afiches",
    label: "Pegado de Afiches",
    color: "#2563eb",
    match: (r) => _actividadText(r).includes("afiche")
  },
  roll: {
    checkboxId: "layer-act-roll",
    label: "Roll Screen, Pendones, Roll Up",
    color: "#7c3aed",
    match: (r) => {
      const t = _actividadText(r);
      return t.includes("roll") || t.includes("pendon") || t.includes("pendones") || t.includes("roll up");
    }
  },
  banderolas: {
    checkboxId: "layer-act-banderolas",
    label: "Banderolas, Banner, Pasacalles",
    color: "#ea580c",
    match: (r) => {
      const t = _actividadText(r);
      return t.includes("banderola") || t.includes("banner") || t.includes("pasacalle") || t.includes("supervision banner");
    }
  },
  perifoneo: {
    checkboxId: "layer-act-perifoneo",
    label: "Perifoneo",
    color: "#0891b2",
    match: (r) => _actividadText(r).includes("perifoneo")
  },
  volanteo: {
    checkboxId: "layer-act-volanteo",
    label: "Volanteo",
    color: "#16a34a",
    match: (r) => _actividadText(r).includes("volanteo")
  }
};
window.ACTIVIDAD_CATEGORY_DEFS_UI = ACTIVIDAD_CATEGORY_DEFS;

const actividadesLayer = L.layerGroup([], { pane: "actividadPane" });

function _actividadRecords() {
  return Array.isArray(window.ACTIVIDADES_COMUNICACION) ? window.ACTIVIDADES_COMUNICACION : [];
}

function _normalizeSearchText(v) {
  return String(v || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_\-\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function _actividadText(r) {
  return _normalizeSearchText([
    r?.tipo,
    r?.descripcion,
    r?.observacion,
    r?.forma_envio,
    r?.responsable_ign_fi
  ].filter(Boolean).join(" "));
}

function _parseActividadSectores(value) {
  const raw = String(value || "").trim();
  if (!raw) return [];
  return uniqueList((raw.match(/\d+/g) || []).map((n) => String(parseInt(n, 10)).padStart(2, "0")));
}

function _actividadUbigeoByDistritoName(name) {
  const needle = _normalizeSearchText(name);
  if (!needle) return "";
  let found = "";
  districtCatalog.forEach((entry, ub) => {
    if (found) return;
    if (_normalizeSearchText(entry?.nombre) === needle) found = String(ub);
  });
  if (found) return found;
  const alias = {
    "lima": "150101",
    "chorrillos": "150108",
    "comas": "150110",
    "el agustino": "150111",
    "independencia": "150112",
    "san juan de miraflores": "150133",
    "sjm": "150133",
    "san martin de porres": "150135",
    "smp": "150135",
    "san miguel": "150136",
    "villa el salvador": "150142",
    "ves": "150142"
  };
  return alias[needle] || "";
}

function _actividadMatchesActiveSelection(r) {
  const active = getActiveUbigeos();
  if (!active.length || active.includes(ALL_DISTRICTS_VALUE)) return true;
  const ub = _actividadUbigeoByDistritoName(r?.distrito);
  return !ub || active.includes(ub);
}

function _actividadSelectedCategories() {
  return Object.entries(ACTIVIDAD_CATEGORY_DEFS)
    .filter(([, def]) => isLayerChecked(def.checkboxId))
    .map(([key]) => key);
}

function _actividadCategoriesForRecord(r) {
  return Object.entries(ACTIVIDAD_CATEGORY_DEFS)
    .filter(([, def]) => {
      try { return def.match(r); } catch (e) { return false; }
    })
    .map(([key]) => key);
}

function _sectorCenterForActividad(ubigeo, sectorCode) {
  const targetUb = String(ubigeo || "").trim();
  const targetSector = String(sectorCode || "").replace(/\D/g, "").padStart(2, "0");
  if (!targetUb || !targetSector) return null;
  const items = _baseFeatureIndex.sector || [];
  for (const item of items) {
    const props = item?.feature?.properties || {};
    const ub = String(getFeatureValue(props, "ubigeo") || "").trim();
    const sec = String(getFeatureValue(props, "cod_sector") || "").replace(/\D/g, "").padStart(2, "0");
    if (ub === targetUb && sec === targetSector && item?.center) return item.center;
  }
  return null;
}

function _districtCenterByUbigeo(ubigeo) {
  const entry = districtCatalog.get(String(ubigeo || "").trim());
  if (entry?.bounds && entry.bounds.isValid && entry.bounds.isValid()) return entry.bounds.getCenter();
  return null;
}

function _actividadFormatDate(fecha) {
  return escapeHtml(String(fecha || "").trim() || "-");
}

function _actividadPopupHtml(group) {
  const title = `${escapeHtml(group.label)} (${group.records.length})`;
  const rows = group.records.slice(0, 20).map((r) => `
    <tr>
      <td>${_actividadFormatDate(r.fecha)}</td>
      <td>${escapeHtml(String(r.hora || "-"))}</td>
      <td>${escapeHtml(String(r.distrito || "-"))}</td>
      <td>${escapeHtml(String(r.sector || "-"))}</td>
      <td>${escapeHtml(String(r.descripcion || r.tipo || "-"))}</td>
    </tr>
  `).join("");
  const more = group.records.length > 20 ? `<div class="actividad-popup-more">+ ${group.records.length - 20} registros adicionales</div>` : "";
  return `
    <div class="actividad-popup">
      <h4>${title}</h4>
      <div class="actividad-popup-sub">${escapeHtml(group.distrito || "")}${group.sector ? ` · Sector ${escapeHtml(group.sector)}` : ""}</div>
      <table>
        <thead><tr><th>Fecha</th><th>Hora</th><th>Distrito</th><th>Sector</th><th>Detalle</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${more}
    </div>
  `;
}

function _actividadMarker(center, group) {
  const color = ACTIVIDAD_CATEGORY_DEFS[group.category]?.color || "#0f766e";
  return L.marker(center, {
    pane: "actividadPane",
    icon: L.divIcon({
      className: "actividad-marker",
      html: `<span style="--actividad-color:${escapeHtml(color)}">${group.records.length}</span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    })
  }).bindPopup(() => _actividadPopupHtml(group), { maxWidth: 520, className: "actividad-popup-wrapper" });
}

function syncActividadesLayer() {
  try {
    actividadesLayer.clearLayers();
    const selected = _actividadSelectedCategories();
    if (!selected.length) {
      if (map.hasLayer(actividadesLayer)) map.removeLayer(actividadesLayer);
      return;
    }

    const selectedSet = new Set(selected);
    const groups = new Map();

    _actividadRecords().forEach((r) => {
      if (!_actividadMatchesActiveSelection(r)) return;
      const cats = _actividadCategoriesForRecord(r).filter((c) => selectedSet.has(c));
      if (!cats.length) return;
      const ub = _actividadUbigeoByDistritoName(r?.distrito);
      const sectores = _parseActividadSectores(r?.sector);
      cats.forEach((cat) => {
        const sectorTargets = sectores.length ? sectores : [""];
        sectorTargets.forEach((sec) => {
          const key = `${cat}|${ub}|${sec || "__DISTRITO__"}`;
          if (!groups.has(key)) {
            groups.set(key, {
              category: cat,
              label: ACTIVIDAD_CATEGORY_DEFS[cat]?.label || cat,
              ubigeo: ub,
              distrito: r?.distrito || getDistrictDisplayName(ub),
              sector: sec,
              records: []
            });
          }
          groups.get(key).records.push(r);
        });
      });
    });

    groups.forEach((group) => {
      const center = group.sector
        ? (_sectorCenterForActividad(group.ubigeo, group.sector) || _districtCenterByUbigeo(group.ubigeo))
        : _districtCenterByUbigeo(group.ubigeo);
      if (!center) return;
      actividadesLayer.addLayer(_actividadMarker(center, group));
    });

    if (actividadesLayer.getLayers().length) {
      if (!map.hasLayer(actividadesLayer)) actividadesLayer.addTo(map);
    } else if (map.hasLayer(actividadesLayer)) {
      map.removeLayer(actividadesLayer);
    }

    ensureLayerOrder();
    updateLegend();
  } catch (e) {
    console.warn(e);
  }
}

function updateActividadCountsInPanel() {
  try {
    const active = getActiveUbigeos();
    Object.entries(ACTIVIDAD_CATEGORY_DEFS).forEach(([cat, def]) => {
      const el = document.getElementById(def.checkboxId);
      const label = el?.closest("label")?.querySelector("span");
      if (!label) return;
      const total = _actividadRecords().filter((r) => {
        if (active.length && !active.includes(ALL_DISTRICTS_VALUE) && !_actividadMatchesActiveSelection(r)) return false;
        return _actividadCategoriesForRecord(r).includes(cat);
      }).length;
      label.textContent = `${def.label}${total ? ` (${total})` : ""}`;
    });
  } catch (e) {}
}

function bindActividadToggles() {
  Object.values(ACTIVIDAD_CATEGORY_DEFS).forEach((def) => {
    bindToggle(def.checkboxId, async () => {
      syncActividadesLayer();
      updateActividadCountsInPanel();
    }, async () => {
      syncActividadesLayer();
      updateActividadCountsInPanel();
    });
  });
}



function puntosDistritosTypeNames() {
  return uniqueList([
    ...(PUNTOS_DISTRITOS_SOURCE.typeNames || []),
    PUNTOS_DISTRITOS_SOURCE.typeName
  ]);
}

function puntosDistritosWfsUrl(opts = {}) {
  const typeName = opts.typeName || PUNTOS_DISTRITOS_SOURCE.typeName;
  const cleanOpts = { ...opts };
  delete cleanOpts.typeName;
  return remoteWfsUrl(
    PUNTOS_DISTRITOS_SOURCE.wfsBase,
    PUNTOS_DISTRITOS_SOURCE.wfsVersion,
    typeName,
    PUNTOS_DISTRITOS_SOURCE.srsName,
    cleanOpts
  );
}

function normalizePuntoText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_\-\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPuntoUbigeo(props) {
  return normalizeUbigeoValue(firstProp(props || {}, PUNTOS_DISTRITOS_SOURCE.ubigeoFields));
}

function getPuntoDistrito(props) {
  return firstProp(props || {}, PUNTOS_DISTRITOS_SOURCE.distritoFields) || getDistrictDisplayName(getPuntoUbigeo(props));
}

function getUbigeoByDistrictName(name) {
  const target = normalizeDistrictName(name);
  if (!target) return "";
  for (const [ub, item] of districtCatalog.entries()) {
    if (normalizeDistrictName(item?.nombre || "") === target) return String(ub || "").trim();
  }
  // Respaldos por si el catálogo aún no terminó de cargar.
  const fallback = {
    "LIMA": "150101",
    "CERCADO DE LIMA": "150101",
    "CHORRILLOS": "150108",
    "COMAS": "150110",
    "EL AGUSTINO": "150111",
    "INDEPENDENCIA": "150112",
    "SAN JUAN DE MIRAFLORES": "150133",
    "SAN MARTIN DE PORRES": "150135",
    "SAN MARTÍN DE PORRES": "150135",
    "SAN MIGUEL": "150136",
    "VILLA EL SALVADOR": "150142"
  };
  return fallback[target] || "";
}

function getPuntoNombre(props, kind = "") {
  const explicit = firstProp(props || {}, PUNTOS_DISTRITOS_SOURCE.nombreFields);
  if (isMeaningfulPopupValue(explicit)) return String(explicit).trim();
  const distrito = getPuntoDistrito(props);
  if (kind === "municipalidad") return distrito ? `Municipalidad Distrital de ${distrito}` : "Municipalidad Distrital";
  if (kind === "centro") return distrito ? `Local técnico - ${distrito}` : "Local técnico";
  return "Punto";
}

function getPuntoLoteEmpresa(props) {
  const value = firstProp(props || {}, PUNTOS_DISTRITOS_SOURCE.loteEmpresaFields);
  if (isMeaningfulPopupValue(value)) return value;
  const ub = getPuntoUbigeo(props) || getUbigeoByDistrictName(getPuntoDistrito(props));
  return POLIGONO_LOTE_EMPRESA_BY_UBIGEO[ub] || "";
}

function getPuntoFotoFromProps(props) {
  return firstProp(props || {}, PUNTOS_DISTRITOS_SOURCE.fotoFields);
}

function getPuntoUbicacionFromProps(props) {
  return firstProp(props || {}, PUNTOS_DISTRITOS_SOURCE.ubicacionFields);
}

function getPuntoStoredInfo(key) {
  const stored = getStoredPuntoPhotos()[key];
  return stored && typeof stored === "object" ? stored : {};
}

function getPuntoUbicacionValue(key, props) {
  const stored = getPuntoStoredInfo(key);
  if (isMeaningfulPopupValue(stored.ubicacion)) return String(stored.ubicacion).trim();
  const attr = getPuntoUbicacionFromProps(props || {});
  return isMeaningfulPopupValue(attr) ? String(attr).trim() : "";
}

function getPuntoKind(props) {
  const p = props || {};
  const typeText = normalizePuntoText(PUNTOS_DISTRITOS_SOURCE.tipoFields.map((k) => p[k]).filter(Boolean).join(" "));
  const nameText = normalizePuntoText(PUNTOS_DISTRITOS_SOURCE.nombreFields.map((k) => p[k]).filter(Boolean).join(" "));
  const allText = `${typeText} ${nameText}`.trim();

  const isCentro = /(local tecnico|local tecnico|centro de operacion|centro operacion|operacion distrital|local tecnico|tecnico)/.test(allText);
  const isMunicipalidad = /(municipalidad|municipal|muni)/.test(allText);

  if (isCentro) return "centro";
  if (isMunicipalidad) return "municipalidad";
  return "";
}

function getPuntoLatLng(feature) {
  const g = feature?.geometry;
  if (!g || !g.coordinates) return null;
  if (g.type === "Point" && Array.isArray(g.coordinates)) {
    const [lng, lat] = g.coordinates.map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return L.latLng(lat, lng);
  }
  if (g.type === "MultiPoint" && Array.isArray(g.coordinates?.[0])) {
    const [lng, lat] = g.coordinates[0].map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return L.latLng(lat, lng);
  }
  try {
    const info = _featureBoundsAndCenter(feature);
    if (info?.center) return info.center;
  } catch (_) {}
  return null;
}

function getPuntoKey(feature, kind) {
  const props = feature?.properties || {};
  const explicit = firstProp(props, PUNTOS_DISTRITOS_SOURCE.idFields);
  const ub = getPuntoUbigeo(props);
  const nombre = getPuntoNombre(props, kind);
  const ll = getPuntoLatLng(feature);
  const base = explicit || `${ub}|${nombre}|${ll ? `${ll.lat.toFixed(7)},${ll.lng.toFixed(7)}` : ""}`;
  return `${kind}:${String(base).trim()}`;
}

function getStoredPuntoPhotos() {
  try {
    const raw = localStorage.getItem(PUNTO_FOTO_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data && typeof data === "object" ? data : {};
  } catch (_) {
    return {};
  }
}

function setStoredPuntoPhoto(key, payload) {
  const data = getStoredPuntoPhotos();
  const hasPhoto = payload && isMeaningfulPopupValue(payload.value);
  const hasUbicacion = payload && isMeaningfulPopupValue(payload.ubicacion);
  if (!payload || (!hasPhoto && !hasUbicacion)) delete data[key];
  else data[key] = payload;
  localStorage.setItem(PUNTO_FOTO_STORAGE_KEY, JSON.stringify(data));
}

function normalizePuntoPhotoList(input) {
  if (!input) return [];
  const raw = Array.isArray(input) ? input : [input];
  const out = [];
  raw.forEach((item) => {
    if (!item) return;
    if (typeof item === "string") {
      const parts = item.split(/[\n,]+/).map((v) => v.trim()).filter(Boolean);
      parts.forEach((v) => out.push({ value: v, type: /^data:image\//i.test(v) ? "file" : "url" }));
      return;
    }
    if (typeof item === "object" && isMeaningfulPopupValue(item.value)) out.push(item);
  });
  const seen = new Set();
  return out.filter((item) => {
    const value = String(item.value || "").trim();
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function getPuntoPhotoValue(key, props) {
  const stored = getPuntoStoredInfo(key);
  const storedPhotos = normalizePuntoPhotoList(stored?.photos || stored?.value);
  if (storedPhotos.length) return { ...stored, photos: storedPhotos };
  const propPhoto = getPuntoFotoFromProps(props || {});
  const propPhotos = normalizePuntoPhotoList(propPhoto);
  if (propPhotos.length) return { photos: propPhotos, type: "url", source: "atributo" };
  return null;
}

function buildPuntoPhotoHtml(photo) {
  const photos = normalizePuntoPhotoList(photo?.photos || photo?.value);
  if (!photos.length) return `<div class="punto-photo-empty">Sin foto registrada</div>`;
  const items = photos.map((item, idx) => {
    const value = String(item.value || "").trim();
    const isDataImage = /^data:image\//i.test(value);
    const isUrl = /^https?:\/\//i.test(value);
    const couldBeImageUrl = isDataImage || (isUrl && /\.(jpg|jpeg|png|webp|gif)(\?|#|$)/i.test(value));
    const img = couldBeImageUrl ? `<img src="${escapeHtml(value)}" alt="Foto ${idx + 1}" loading="lazy">` : `<span class="punto-photo-link-card">Foto ${idx + 1}</span>`;
    return isUrl
      ? `<a href="${escapeHtml(value)}" target="_blank" rel="noopener noreferrer" title="Abrir foto ${idx + 1}">${img}</a>`
      : `<span>${img}</span>`;
  }).join("");
  return `<div class="punto-popup-photo"><div class="punto-popup-gallery">${items}</div></div>`;
}

function buildPuntoPopup(feature, kind) {
  const props = feature?.properties || {};
  const key = getPuntoKey(feature, kind);
  const distrito = getPuntoDistrito(props) || "-";
  const tipo = firstProp(props, PUNTOS_DISTRITOS_SOURCE.tipoFields);
  const nombre = getPuntoNombre(props, kind);
  const titulo = isMeaningfulPopupValue(tipo) ? String(tipo).trim() : nombre;
  const ubicacion = getPuntoUbicacionValue(key, props) || "-";
  const photo = getPuntoPhotoValue(key, props);
  const photoHtml = buildPuntoPhotoHtml(photo);
  const editButton = isSimpleLoggedIn()
    ? `<button type="button" class="punto-photo-btn" data-punto-key="${escapeHtml(key)}" data-punto-kind="${escapeHtml(kind)}">Agregar / editar información</button>`
    : "";

  const rows = kind === "municipalidad"
    ? `
      <tr><td class="key">Distrito</td><td>${escapeHtml(distrito)}</td></tr>
      <tr><td class="key">Ubicación</td><td>${escapeHtml(ubicacion)}</td></tr>
    `
    : `
      <tr><td class="key">Distrito</td><td>${escapeHtml(distrito)}</td></tr>
      <tr><td class="key">Ubicación</td><td>${escapeHtml(ubicacion)}</td></tr>
      <tr><td class="key">Lote / Empresa</td><td>${escapeHtml(getPuntoLoteEmpresa(props) || "-")}</td></tr>
    `;

  return `
    <div class="popup-attrs punto-distrito-popup ${kind === "municipalidad" ? "popup-municipalidad" : "popup-centro"}">
      <h4>${escapeHtml(titulo)}</h4>
      <table>${rows}</table>
      ${photoHtml}
      <div class="punto-popup-actions">${editButton}</div>
    </div>
  `;
}

function puntoIconSvg(kind) {
  if (kind === "municipalidad") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.7 3.2 7.4v1.9h17.6V7.4L12 2.7Zm-5.9 8.1v6.6H4.6v2.3h14.8v-2.3h-1.5v-6.6h-2.2v6.6h-2.5v-6.6h-2.4v6.6H8.3v-6.6H6.1Zm5.9-5.2 3.6 1.9H8.4L12 5.6Z"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.8a7.1 7.1 0 0 0-7.1 7.1c0 5.3 7.1 11.3 7.1 11.3s7.1-6 7.1-11.3A7.1 7.1 0 0 0 12 2.8Zm0 3.8 4 2.3v4.7l-4 2.3-4-2.3V8.9l4-2.3Zm0 2.2-2.1 1.2v2.4l2.1 1.2 2.1-1.2V10L12 8.8Z"/></svg>`;
}

function puntoIcon(kind) {
  const isMunicipalidad = kind === "municipalidad";
  return L.divIcon({
    className: `punto-distrito-marker ${isMunicipalidad ? "punto-municipalidad" : "punto-centro"}`,
    html: `<span class="punto-badge"><b>${puntoIconSvg(kind)}</b></span>`,
    iconSize: [32, 36],
    iconAnchor: [16, 34],
    popupAnchor: [0, -32]
  });
}

function createPuntoMarker(feature, kind) {
  const ll = getPuntoLatLng(feature);
  if (!ll) return null;
  const marker = L.marker(ll, {
    pane: "puntosDistritoPane",
    icon: puntoIcon(kind),
    keyboard: false,
    riseOnHover: true,
    zIndexOffset: 350
  });
  marker._puntoFeature = feature;
  marker._puntoKind = kind;
  marker.bindPopup(() => buildPuntoPopup(feature, kind), { maxWidth: 360, className: "punto-distrito-popup-wrapper" });
  return marker;
}

const layerPuntosMunicipalidad = L.layerGroup([], { pane: "puntosDistritoPane" });
const layerPuntosCentroOperacion = L.layerGroup([], { pane: "puntosDistritoPane" });
let _puntosDistritosAbort = null;
let _lastPuntosDistritoFeatures = [];

let _puntosDistritosAllPromise = null;
let _puntosDistritosAllFeatures = null;

async function fetchAllPuntosDistritos(signal) {
  if (Array.isArray(_puntosDistritosAllFeatures)) return _puntosDistritosAllFeatures;
  if (_puntosDistritosAllPromise) return _puntosDistritosAllPromise;

  const typeName = PUNTOS_DISTRITOS_SOURCE.typeName || "ne:punto";
  _puntosDistritosAllPromise = fetchGeoJSON(
    puntosDistritosWfsUrl({ typeName, maxFeatures: 300 }),
    { ttlMs: CACHE.baseTtlMs, signal }
  ).then((gj) => {
    const features = Array.isArray(gj?.features) ? gj.features : [];
    _puntosDistritosAllFeatures = features;
    return features;
  }).catch((err) => {
    _puntosDistritosAllPromise = null;
    throw err;
  });

  return _puntosDistritosAllPromise;
}

function preloadPuntosDistritos() {
  // Son pocos puntos; precargar evita la espera cuando el usuario activa Municipalidad o Centro de Operación.
  fetchAllPuntosDistritos().catch((e) => console.warn("Precarga de puntos no disponible", e));
}

async function fetchPuntosDistritosByUbigeos(ubigeos, signal) {
  const keys = uniqueList(ubigeos || []).map(normalizeUbigeoValue).filter(Boolean);
  const allRequested = !keys.length || keys.includes(ALL_DISTRICTS_VALUE);
  const features = await fetchAllPuntosDistritos(signal);
  if (allRequested) return features;

  const keySet = new Set(keys);
  const nameSet = new Set(keys.map((ub) => normalizeDistrictName(getDistrictDisplayName(ub))).filter(Boolean));

  return (features || []).filter((ft) => {
    const props = ft?.properties || {};
    const ub = getPuntoUbigeo(props) || getUbigeoByDistrictName(getPuntoDistrito(props));
    const distName = normalizeDistrictName(getPuntoDistrito(props));
    return (ub && keySet.has(ub)) || (distName && nameSet.has(distName));
  });
}

function clearPuntosDistritoLayers() {
  layerPuntosMunicipalidad.clearLayers();
  layerPuntosCentroOperacion.clearLayers();
  if (map.hasLayer(layerPuntosMunicipalidad)) map.removeLayer(layerPuntosMunicipalidad);
  if (map.hasLayer(layerPuntosCentroOperacion)) map.removeLayer(layerPuntosCentroOperacion);
}

function drawPuntosDistritoFeatures(features) {
  layerPuntosMunicipalidad.clearLayers();
  layerPuntosCentroOperacion.clearLayers();
  (features || []).forEach((ft) => {
    const kind = getPuntoKind(ft?.properties || {});
    if (!kind) return;
    const marker = createPuntoMarker(ft, kind);
    if (!marker) return;
    if (kind === "municipalidad") layerPuntosMunicipalidad.addLayer(marker);
    if (kind === "centro") layerPuntosCentroOperacion.addLayer(marker);
  });
  if (isLayerChecked("layer-base-municipalidad") && layerPuntosMunicipalidad.getLayers().length) layerPuntosMunicipalidad.addTo(map);
  if (isLayerChecked("layer-base-centro-operacion") && layerPuntosCentroOperacion.getLayers().length) layerPuntosCentroOperacion.addTo(map);
}

async function syncPuntosDistritoLayers() {
  const needsMunicipalidad = isLayerChecked("layer-base-municipalidad");
  const needsCentro = isLayerChecked("layer-base-centro-operacion");
  if (!needsMunicipalidad && !needsCentro) {
    clearPuntosDistritoLayers();
    updateLegend();
    return;
  }
  if (_puntosDistritosAbort) _puntosDistritosAbort.abort();
  _puntosDistritosAbort = new AbortController();
  try {
    const features = await fetchPuntosDistritosByUbigeos(getActiveUbigeos(), _puntosDistritosAbort.signal);
    _lastPuntosDistritoFeatures = features;
    drawPuntosDistritoFeatures(features);
    updateLegend();
    ensureLayerOrder();
  } catch (e) {
    if (String(e?.name || "").toLowerCase() !== "aborterror") console.warn("No se pudo cargar Puntos_distritos", e);
  }
}

function refreshOpenPuntoPopup() {
  try {
    [layerPuntosMunicipalidad, layerPuntosCentroOperacion].forEach((group) => {
      group.eachLayer((marker) => {
        const popup = marker.getPopup && marker.getPopup();
        if (popup && popup.isOpen && popup.isOpen()) popup.setContent(buildPuntoPopup(marker._puntoFeature, marker._puntoKind));
      });
    });
  } catch (_) {}
}

function openPuntoPhotoModal(key, kind) {
  if (!isSimpleLoggedIn()) {
    openLoginModal();
    return;
  }
  const modal = document.getElementById("punto-photo-modal");
  if (!modal) return;
  const stored = getPuntoStoredInfo(key);
  const keyInput = document.getElementById("punto-photo-key");
  const ubicacionInput = document.getElementById("punto-ubicacion");
  const urlInput = document.getElementById("punto-photo-url");
  const fileInput = document.getElementById("punto-photo-file");
  const subtitle = document.getElementById("punto-photo-subtitle");
  const msg = document.getElementById("punto-photo-msg");
  if (keyInput) keyInput.value = key || "";
  if (ubicacionInput) ubicacionInput.value = stored?.ubicacion || "";
  const storedUrls = normalizePuntoPhotoList(stored?.photos || stored?.value).filter((p) => /^https?:\/\//i.test(String(p.value || ""))).map((p) => p.value);
  if (urlInput) urlInput.value = storedUrls.join("\n");
  if (fileInput) fileInput.value = "";
  if (subtitle) subtitle.textContent = kind === "municipalidad" ? "Municipalidad Distrital" : "Centro de Operación Distrital";
  if (msg) {
    msg.textContent = "";
    msg.classList.remove("ok");
  }
  updatePuntoPhotoPreview(stored?.photos || stored?.value || "");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closePuntoPhotoModal() {
  const modal = document.getElementById("punto-photo-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function updatePuntoPhotoPreview(value) {
  const preview = document.getElementById("punto-photo-preview");
  if (!preview) return;
  const photos = normalizePuntoPhotoList(value);
  if (!photos.length) {
    preview.innerHTML = "";
    return;
  }
  preview.innerHTML = buildPuntoPhotoHtml({ photos });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function readFilesAsPhotoItems(fileList) {
  const files = Array.from(fileList || []).filter(Boolean);
  const out = [];
  for (const file of files) {
    const value = await readFileAsDataUrl(file);
    out.push({ value, type: "file", name: file.name || "foto" });
  }
  return out;
}

function parsePhotoUrlItems(text) {
  return normalizePuntoPhotoList(String(text || "").split(/[\n]+/).map((v) => v.trim()).filter(Boolean).map((value) => ({ value, type: "url" })));
}

async function submitPuntoPhotoForm(ev) {
  if (ev) ev.preventDefault();
  const key = String(document.getElementById("punto-photo-key")?.value || "").trim();
  const ubicacion = String(document.getElementById("punto-ubicacion")?.value || "").trim();
  const urlText = String(document.getElementById("punto-photo-url")?.value || "").trim();
  const files = document.getElementById("punto-photo-file")?.files || [];
  const msg = document.getElementById("punto-photo-msg");
  if (!key) {
    if (msg) msg.textContent = "No se encontró el punto.";
    return;
  }
  try {
    const previous = getPuntoStoredInfo(key);
    const existing = normalizePuntoPhotoList(previous?.photos || previous?.value);
    const urlPhotos = parsePhotoUrlItems(urlText);
    const filePhotos = await readFilesAsPhotoItems(files);
    const newPhotos = [...urlPhotos, ...filePhotos];
    const photos = newPhotos.length ? newPhotos : existing;
    if (!ubicacion && !photos.length) {
      if (msg) msg.textContent = "Ingresa una ubicación o una foto.";
      return;
    }
    const payload = { ...previous, photos, value: photos[0]?.value || "", type: photos[0]?.type || "", ubicacion, actualizado_por: currentSimpleUser?.username || "", actualizado_en: new Date().toISOString() };
    setStoredPuntoPhoto(key, payload);
    if (msg) {
      msg.textContent = "Información guardada.";
      msg.classList.add("ok");
    }
    refreshOpenPuntoPopup();
    setTimeout(closePuntoPhotoModal, 350);
  } catch (e) {
    if (msg) {
      msg.textContent = e?.message || "No se pudo guardar la foto.";
      msg.classList.remove("ok");
    }
  }
}

function clearPuntoPhoto() {
  const key = String(document.getElementById("punto-photo-key")?.value || "").trim();
  if (!key) return;
  const current = getPuntoStoredInfo(key);
  const ubicacion = String(document.getElementById("punto-ubicacion")?.value || current.ubicacion || "").trim();
  setStoredPuntoPhoto(key, ubicacion ? { ubicacion, actualizado_por: currentSimpleUser?.username || "", actualizado_en: new Date().toISOString() } : null);
  const urlInput = document.getElementById("punto-photo-url");
  const fileInput = document.getElementById("punto-photo-file");
  if (urlInput) urlInput.value = "";
  if (fileInput) fileInput.value = "";
  updatePuntoPhotoPreview("");
  refreshOpenPuntoPopup();
  const msg = document.getElementById("punto-photo-msg");
  if (msg) {
    msg.textContent = "Foto retirada.";
    msg.classList.add("ok");
  }
}

function bindPuntoPhotoEditor() {
  document.getElementById("btn-punto-photo-close")?.addEventListener("click", closePuntoPhotoModal);
  document.getElementById("btn-punto-photo-cancel")?.addEventListener("click", closePuntoPhotoModal);
  document.getElementById("btn-punto-photo-clear")?.addEventListener("click", clearPuntoPhoto);
  document.getElementById("punto-photo-form")?.addEventListener("submit", submitPuntoPhotoForm);
  document.getElementById("punto-photo-url")?.addEventListener("input", (ev) => updatePuntoPhotoPreview(parsePhotoUrlItems(ev.target.value)));
  document.getElementById("punto-photo-file")?.addEventListener("change", async (ev) => {
    const files = ev.target?.files;
    if (!files || !files.length) return;
    try { updatePuntoPhotoPreview(await readFilesAsPhotoItems(files)); } catch (_) {}
  });
  document.addEventListener("click", (ev) => {
    const btn = ev.target?.closest?.(".punto-photo-btn[data-punto-key]");
    if (btn) {
      try { L.DomEvent.stop(ev); } catch (_) {}
      openPuntoPhotoModal(btn.getAttribute("data-punto-key"), btn.getAttribute("data-punto-kind"));
      return;
    }
    const modal = document.getElementById("punto-photo-modal");
    if (modal && ev.target === modal) closePuntoPhotoModal();
  });
}


// ==============================
// CARGA TEMPORAL KML / KMZ
// ==============================
let layerKmlKmz = L.geoJSON(null, {
  pane: "poligonoPane",
  style: () => ({ color: "#fb923c", weight: 3, opacity: 1, fillColor: "#fb923c", fillOpacity: 0.12, lineJoin: "round", lineCap: "round" }),
  pointToLayer: (feature, latlng) => L.circleMarker(latlng, { radius: 6, color: "#fb923c", weight: 2, fillColor: "#fb923c", fillOpacity: 0.85 }),
  onEachFeature: (feature, layer) => {
    const p = feature?.properties || {};
    const name = p.name || p.Name || p.NOMBRE || "Elemento KML/KMZ";
    const desc = p.description || p.Description || p.DESCRIPCION || "";
    layer.bindPopup(`<div class="popup-attrs"><h4>${escapeHtml(String(name))}</h4>${desc ? `<div style="max-width:280px;max-height:140px;overflow:auto;">${desc}</div>` : ""}</div>`);
  }
});

function setKmlMessage(text, ok = false) {
  const msg = document.getElementById("kml-upload-msg");
  if (!msg) return;
  msg.textContent = text || "";
  msg.classList.toggle("ok", !!ok);
}

function clearKmlKmzLayer() {
  try { layerKmlKmz.clearLayers(); } catch (_) {}
  try { if (map.hasLayer(layerKmlKmz)) map.removeLayer(layerKmlKmz); } catch (_) {}
  const input = document.getElementById("kml-file-input");
  if (input) input.value = "";
  setKmlMessage("");
  updateLegend();
}

async function fileToText(file) {
  return await file.text();
}

async function extractKmlTextFromKmz(file) {
  if (!window.JSZip) throw new Error("No se pudo cargar JSZip para leer KMZ.");
  const zip = await window.JSZip.loadAsync(file);
  const names = Object.keys(zip.files || {}).filter((n) => /\.kml$/i.test(n));
  if (!names.length) throw new Error("El KMZ no contiene archivo KML.");
  const main = names.find((n) => /(^|\/)doc\.kml$/i.test(n)) || names[0];
  return await zip.files[main].async("string");
}

async function loadKmlKmzFile(file) {
  if (!file) return;
  setKmlMessage("Cargando KML/KMZ...");
  try {
    const name = String(file.name || "").toLowerCase();
    const kmlText = name.endsWith(".kmz") ? await extractKmlTextFromKmz(file) : await fileToText(file);
    const dom = new DOMParser().parseFromString(kmlText, "text/xml");
    if (dom.querySelector("parsererror")) throw new Error("El archivo KML no es válido.");
    if (!window.toGeoJSON || !window.toGeoJSON.kml) throw new Error("No se pudo cargar toGeoJSON para convertir el KML.");
    const gj = window.toGeoJSON.kml(dom);
    const features = Array.isArray(gj?.features) ? gj.features : [];
    layerKmlKmz.clearLayers();
    layerKmlKmz.addData(gj);
    if (!map.hasLayer(layerKmlKmz)) layerKmlKmz.addTo(map);
    try {
      const b = layerKmlKmz.getBounds();
      if (b && b.isValid()) map.fitBounds(b.pad(0.12));
    } catch (_) {}
    setKmlMessage(`${features.length} elemento(s) cargado(s) temporalmente.`, true);
    updateLegend();
    ensureLayerOrder();
  } catch (e) {
    console.warn(e);
    setKmlMessage(e?.message || "No se pudo cargar el KML/KMZ.");
  }
}

function bindKmlKmzUpload() {
  const input = document.getElementById("kml-file-input");
  const clearBtn = document.getElementById("btn-kml-clear");
  const dropZone = document.getElementById("kml-drop-zone");

  input?.addEventListener("change", (ev) => {
    const file = ev.target?.files?.[0];
    if (file) loadKmlKmzFile(file);
  });

  clearBtn?.addEventListener("click", clearKmlKmzLayer);

  if (dropZone) {
    const stop = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    };

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (ev) => {
        stop(ev);
        dropZone.classList.add("drag-over");
      });
    });

    ["dragleave", "dragend"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (ev) => {
        stop(ev);
        dropZone.classList.remove("drag-over");
      });
    });

    dropZone.addEventListener("drop", (ev) => {
      stop(ev);
      dropZone.classList.remove("drag-over");
      const file = ev.dataTransfer?.files?.[0];
      if (!file) return;
      const name = String(file.name || "").toLowerCase();
      if (!name.endsWith(".kml") && !name.endsWith(".kmz")) {
        setKmlMessage("Solo se permite cargar KML o KMZ.");
        return;
      }
      loadKmlKmzFile(file);
    });

    dropZone.addEventListener("click", (ev) => {
      if (ev.target && ev.target.id === "kml-file-input") return;
      input?.click();
    });
  }
}

function refreshPoligonoMode(mode) {
  setPoligonoVisibleMode(mode);
  _activePoligonoSearch = null;
  const keys = getActiveUbigeos();
  return syncPoligonosCicLayerForUbigeos(keys).then(() => {
    syncPoligonoLabels();
    updateLegend();
    ensureLayerOrder();
  });
}

bindToggle(
  "layer-poligonos-supervision",
  async () => { await refreshPoligonoMode("totales"); },
  async () => {
    if (getPoligonoVisibleMode() === "none") {
      layerPoligonosCic.clearLayers();
      if (map.hasLayer(layerPoligonosCic)) map.removeLayer(layerPoligonosCic);
      syncPoligonoLabels();
      updateLegend();
      ensureLayerOrder();
    }
  }
);

bindToggle(
  "layer-poligonos-cic-totales",
  async () => { await refreshPoligonoMode("cic_totales"); },
  async () => {
    if (getPoligonoVisibleMode() === "none") {
      layerPoligonosCic.clearLayers();
      if (map.hasLayer(layerPoligonosCic)) map.removeLayer(layerPoligonosCic);
      syncPoligonoLabels();
      updateLegend();
      ensureLayerOrder();
    }
  }
);

bindToggle(
  "layer-poligonos-activos",
  async () => { await refreshPoligonoMode("activos"); },
  async () => {
    if (getPoligonoVisibleMode() === "none") {
      layerPoligonosCic.clearLayers();
      if (map.hasLayer(layerPoligonosCic)) map.removeLayer(layerPoligonosCic);
      syncPoligonoLabels();
      updateLegend();
      ensureLayerOrder();
    }
  }
);

bindToggle(
  "layer-poligonos-manzana-poligono",
  async () => { await syncManzanaPoligonoLayer(getActiveUbigeos()); updateLegend(); ensureLayerOrder(); },
  async () => { layerManzanaPoligono.clearLayers(); if (map.hasLayer(layerManzanaPoligono)) map.removeLayer(layerManzanaPoligono); clearManzanaPoligonoLabels(); updateLegend(); ensureLayerOrder(); }
);

bindToggle(
  "layer-poligonos-labels",
  async () => {
    if (getPoligonoVisibleMode() === "none") {
      setPoligonoVisibleMode("totales");
      const keys = getActiveUbigeos();
      if (_activePoligonoSearch && Array.isArray(_activePoligonoSearch.features) && _activePoligonoSearch.features.length) {
        showOnlyPoligonoFeatures(_activePoligonoSearch.features, { fit: false });
      } else if (keys.length) {
        await syncPoligonosCicLayerForUbigeos(keys);
      }
    }
    syncPoligonoLabels();
    refreshOpenPoligonoPopup();
    ensureLayerOrder();
  },
  async () => {
    syncPoligonoLabels();
    refreshOpenPoligonoPopup();
  }
);

bindToggle(
  "layer-conflicto-zona",
  async () => { syncConflictoTerritorialLayer(); },
  async () => {
    layerConflictoTerritorial.clearLayers();
    if (map.hasLayer(layerConflictoTerritorial)) map.removeLayer(layerConflictoTerritorial);
    updateLegend();
    ensureLayerOrder();
  }
);

bindToggle(
  "layer-base-municipalidad",
  async () => { await syncPuntosDistritoLayers(); updateLegend(); ensureLayerOrder(); },
  async () => { if (map.hasLayer(layerPuntosMunicipalidad)) map.removeLayer(layerPuntosMunicipalidad); updateLegend(); ensureLayerOrder(); }
);

bindToggle(
  "layer-base-centro-operacion",
  async () => { await syncPuntosDistritoLayers(); updateLegend(); ensureLayerOrder(); },
  async () => { if (map.hasLayer(layerPuntosCentroOperacion)) map.removeLayer(layerPuntosCentroOperacion); updateLegend(); ensureLayerOrder(); }
);

bindToggle(
  "layer-base-manzana",
  async () => { if (!map.hasLayer(layerManzana)) layerManzana.addTo(map); syncBaseLabelLayerVisibility(); updateLegend(); ensureLayerOrder(); },
  async () => { if (map.hasLayer(layerManzana)) map.removeLayer(layerManzana); syncBaseLabelLayerVisibility(); updateLegend(); ensureLayerOrder(); }
);

bindToggle(
  "layer-base-sector",
  async () => { if (!map.hasLayer(layerSector)) layerSector.addTo(map); syncBaseLabelLayerVisibility(); updateLegend(); ensureLayerOrder(); },
  async () => { if (map.hasLayer(layerSector)) map.removeLayer(layerSector); syncBaseLabelLayerVisibility(); updateLegend(); ensureLayerOrder(); }
);

bindActividadToggles();
ensurePoligonoCountBadges();
updatePoligonoCountBadges(_lastPoligonoCounts);
updateActividadCountsInPanel();
updateLegend();
