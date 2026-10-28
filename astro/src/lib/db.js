import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

// Anchored on process.cwd() (not import.meta.url/__dirname) - after Vite
// bundles this module into dist/server/chunks/*.mjs, a location relative to
// the file itself no longer points at the repo. PM2's cwd stays the repo
// root (see ecosystem.config.js), so this resolves correctly in production
// with zero config; DATA_DIR lets it be overridden for local/dev use.
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'consulta_ruc.sqlite');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

// node:sqlite's DatabaseSync has no built-in `.transaction()` helper
// (unlike better-sqlite3); provide a minimal drop-in replacement.
db.transaction = (fn) => (items) => {
  db.exec('BEGIN');
  try {
    fn(items);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
};

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA synchronous = NORMAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS ruc (
    ruc TEXT PRIMARY KEY,
    razon_social TEXT NOT NULL,
    estado TEXT,
    condicion TEXT,
    ubigeo TEXT,
    departamento TEXT,
    direccion TEXT,
    tipo_contribuyente TEXT,
    nombre_comercial TEXT,
    fecha_inscripcion TEXT,
    fecha_inicio_actividades TEXT,
    actividad_economica TEXT,
    comercio_exterior TEXT,
    sistema_emision TEXT,
    sistema_contabilidad TEXT,
    comprobantes_pago TEXT,
    sistema_emision_electronica TEXT,
    emisor_electronico_desde TEXT,
    comprobantes_electronicos TEXT,
    ple_desde TEXT,
    padrones TEXT,
    updated_at TEXT
  )
`);

// Older DB files on disk predate these columns (CREATE TABLE IF NOT EXISTS
// only applies to brand-new tables) - add them if missing, ignoring the
// "duplicate column name" error on every run after the first.
for (const col of [
  'sistema_emision_electronica',
  'emisor_electronico_desde',
  'comprobantes_electronicos',
  'ple_desde',
  'padrones'
]) {
  try {
    db.exec(`ALTER TABLE ruc ADD COLUMN ${col} TEXT`);
  } catch {
    // Column already exists from a previous run - fine.
  }
}

db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS ruc_fts USING fts5(
    razon_social,
    content = 'ruc',
    content_rowid = 'rowid'
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS ruc_sucursal (
    ruc TEXT,
    ubigeo TEXT,
    direccion TEXT
  )
`);
db.exec('CREATE INDEX IF NOT EXISTS idx_sucursal_ruc ON ruc_sucursal(ruc)');

// One row per calendar day - populated by tipoCambioSync.js (Playwright,
// run once daily via cron), never fetched live per-visitor. SUNAT's own
// page shows the previous business day's SBS closing rate, so "fecha" here
// is the calendar day shown on SUNAT's page, not necessarily the quote date.
db.exec(`
  CREATE TABLE IF NOT EXISTS tipo_cambio (
    fecha TEXT PRIMARY KEY,
    compra REAL,
    venta REAL,
    updated_at TEXT
  )
`);

// Progressive-enrichment queue. The bulk padrón has no detail fields (tipo
// contribuyente, actividad económica, comprobantes, padrones…) - those only
// exist on SUNAT's live ficha. When a visitor looks up a RUC we only have the
// reduced record for, we queue it here and a background worker fills it in
// slowly, well under SUNAT's rate threshold. Over time the RUCs people
// actually search end up fully cached, with zero live checks at request time.
db.exec(`
  CREATE TABLE IF NOT EXISTS enrich_queue (
    ruc TEXT PRIMARY KEY,
    requested_at TEXT,
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    done INTEGER DEFAULT 0
  )
`);
db.exec('CREATE INDEX IF NOT EXISTS idx_enrich_pending ON enrich_queue(done, attempts, requested_at)');

const MAX_ENRICH_ATTEMPTS = 3;

const stmtEnqueueEnrich = db.prepare(
  'INSERT OR IGNORE INTO enrich_queue (ruc, requested_at) VALUES (?, ?)'
);
const stmtNextEnrich = db.prepare(
  `SELECT ruc FROM enrich_queue WHERE done = 0 AND attempts < ${MAX_ENRICH_ATTEMPTS} ORDER BY requested_at LIMIT 1`
);
const stmtEnrichDone = db.prepare('UPDATE enrich_queue SET done = 1, last_error = NULL WHERE ruc = ?');
const stmtEnrichFailed = db.prepare(
  'UPDATE enrich_queue SET attempts = attempts + 1, last_error = ? WHERE ruc = ?'
);
const stmtEnrichStats = db.prepare(`
  SELECT
    SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) AS enriched,
    SUM(CASE WHEN done = 0 AND attempts < ${MAX_ENRICH_ATTEMPTS} THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN done = 0 AND attempts >= ${MAX_ENRICH_ATTEMPTS} THEN 1 ELSE 0 END) AS gaveUp
  FROM enrich_queue
`);

export function enqueueEnrichment(ruc) {
  if (!/^\d{11}$/.test(ruc || '')) return;
  stmtEnqueueEnrich.run(ruc, new Date().toISOString());
}

export function nextEnrichment() {
  const row = stmtNextEnrich.get();
  return row ? row.ruc : null;
}

export function markEnrichmentDone(ruc) {
  stmtEnrichDone.run(ruc);
}

export function markEnrichmentFailed(ruc, error) {
  stmtEnrichFailed.run(String(error || '').slice(0, 300), ruc);
}

export function getEnrichStats() {
  const r = stmtEnrichStats.get() || {};
  return { enriched: r.enriched || 0, pending: r.pending || 0, gaveUp: r.gaveUp || 0 };
}

const stmtUpsertTipoCambio = db.prepare(`
  INSERT INTO tipo_cambio (fecha, compra, venta, updated_at) VALUES (?, ?, ?, ?)
  ON CONFLICT(fecha) DO UPDATE SET compra = excluded.compra, venta = excluded.venta, updated_at = excluded.updated_at
`);
const stmtLatestTipoCambio = db.prepare('SELECT * FROM tipo_cambio ORDER BY fecha DESC LIMIT 1');
const stmtRecentTipoCambio = db.prepare('SELECT * FROM tipo_cambio ORDER BY fecha DESC LIMIT ?');

export function upsertTipoCambio(fecha, compra, venta) {
  stmtUpsertTipoCambio.run(fecha, compra, venta, new Date().toISOString());
}

export function getLatestTipoCambio() {
  const row = stmtLatestTipoCambio.get();
  return row || null;
}

export function getRecentTipoCambio(limit = 30) {
  return stmtRecentTipoCambio.all(limit);
}

const stmtGetByRuc = db.prepare('SELECT * FROM ruc WHERE ruc = ?');
const stmtGetSucursales = db.prepare('SELECT ubigeo, direccion FROM ruc_sucursal WHERE ruc = ?');
const stmtSearchByName = db.prepare(`
  SELECT r.* FROM ruc_fts
  JOIN ruc r ON r.rowid = ruc_fts.rowid
  WHERE ruc_fts MATCH ?
  ORDER BY bm25(ruc_fts)
  LIMIT ?
`);

const stmtInsertRuc = db.prepare(`
  INSERT INTO ruc (
    ruc, razon_social, estado, condicion, ubigeo, departamento, direccion,
    tipo_contribuyente, nombre_comercial, fecha_inscripcion, fecha_inicio_actividades,
    actividad_economica, comercio_exterior, sistema_emision, sistema_contabilidad,
    comprobantes_pago, sistema_emision_electronica, emisor_electronico_desde,
    comprobantes_electronicos, ple_desde, padrones, updated_at
  ) VALUES (
    @ruc, @razon_social, @estado, @condicion, @ubigeo, @departamento, @direccion,
    @tipo_contribuyente, @nombre_comercial, @fecha_inscripcion, @fecha_inicio_actividades,
    @actividad_economica, @comercio_exterior, @sistema_emision, @sistema_contabilidad,
    @comprobantes_pago, @sistema_emision_electronica, @emisor_electronico_desde,
    @comprobantes_electronicos, @ple_desde, @padrones, @updated_at
  )
  ON CONFLICT(ruc) DO UPDATE SET
    razon_social = excluded.razon_social,
    estado = excluded.estado,
    condicion = excluded.condicion,
    -- COALESCE like the detail fields below: ubigeo/departamento only ever
    -- come from the bulk padrón - SUNAT's live ficha doesn't publish them. A
    -- live check (or the enrichment worker) would otherwise overwrite a real
    -- ubigeo with NULL, and the ficha's "Ubicación" tab would lose the ubigeo
    -- and the map marker for exactly the records people look at most.
    ubigeo = COALESCE(excluded.ubigeo, ruc.ubigeo),
    departamento = COALESCE(excluded.departamento, ruc.departamento),
    direccion = excluded.direccion,
    tipo_contribuyente = COALESCE(excluded.tipo_contribuyente, ruc.tipo_contribuyente),
    nombre_comercial = COALESCE(excluded.nombre_comercial, ruc.nombre_comercial),
    fecha_inscripcion = COALESCE(excluded.fecha_inscripcion, ruc.fecha_inscripcion),
    fecha_inicio_actividades = COALESCE(excluded.fecha_inicio_actividades, ruc.fecha_inicio_actividades),
    actividad_economica = COALESCE(excluded.actividad_economica, ruc.actividad_economica),
    comercio_exterior = COALESCE(excluded.comercio_exterior, ruc.comercio_exterior),
    sistema_emision = COALESCE(excluded.sistema_emision, ruc.sistema_emision),
    sistema_contabilidad = COALESCE(excluded.sistema_contabilidad, ruc.sistema_contabilidad),
    comprobantes_pago = COALESCE(excluded.comprobantes_pago, ruc.comprobantes_pago),
    sistema_emision_electronica = COALESCE(excluded.sistema_emision_electronica, ruc.sistema_emision_electronica),
    emisor_electronico_desde = COALESCE(excluded.emisor_electronico_desde, ruc.emisor_electronico_desde),
    comprobantes_electronicos = COALESCE(excluded.comprobantes_electronicos, ruc.comprobantes_electronicos),
    ple_desde = COALESCE(excluded.ple_desde, ruc.ple_desde),
    padrones = COALESCE(excluded.padrones, ruc.padrones),
    updated_at = excluded.updated_at
`);

const stmtInsertSucursal = db.prepare(
  'INSERT INTO ruc_sucursal (ruc, ubigeo, direccion) VALUES (?, ?, ?)'
);

// Some rows (e.g. bulk-padrón imports, or legacy seed data written before
// this field became an array) may still have actividad_economica as a plain
// semicolon-joined string - JSON.parse would throw on that, so fall back to
// treating it as a single-item list rather than crashing the lookup.
function parseListField(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return [value];
  }
}

function rowToApiShape(row) {
  if (!row) return null;
  return {
    ruc: row.ruc,
    razonSocial: row.razon_social,
    estado: row.estado,
    condicion: row.condicion,
    ubigeo: row.ubigeo,
    departamento: row.departamento,
    domicilioFiscal: row.direccion,
    tipoContribuyente: row.tipo_contribuyente,
    nombreComercial: row.nombre_comercial,
    fechaInscripcion: row.fecha_inscripcion,
    fechaInicioActividades: row.fecha_inicio_actividades,
    actividadEconomica: parseListField(row.actividad_economica),
    comercioExterior: row.comercio_exterior,
    sistemaEmision: row.sistema_emision,
    sistemaContabilidad: row.sistema_contabilidad,
    comprobantesPago: row.comprobantes_pago ? JSON.parse(row.comprobantes_pago) : [],
    sistemaEmisionElectronica: parseListField(row.sistema_emision_electronica),
    emisorElectronicoDesde: row.emisor_electronico_desde,
    comprobantesElectronicos: parseListField(row.comprobantes_electronicos),
    pleDesde: row.ple_desde,
    padrones: parseListField(row.padrones),
    updatedAt: row.updated_at
  };
}

export function getByRuc(ruc) {
  const row = stmtGetByRuc.get(ruc);
  if (!row) return null;
  const data = rowToApiShape(row);
  data.sucursales = stmtGetSucursales.all(ruc);
  return data;
}

export function searchByName(query, limit = 20) {
  const clean = query.trim().replace(/["*]/g, '');
  if (!clean) return [];
  const ftsQuery = clean
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => `"${term}"*`)
    .join(' ');

  if (!ftsQuery) return [];

  try {
    const rows = stmtSearchByName.all(ftsQuery, limit);
    return rows.map(rowToApiShape);
  } catch {
    return [];
  }
}

function toJsonOrNull(value) {
  return value ? JSON.stringify(value) : null;
}

let _recordCount = null;
const stmtRucExists = db.prepare('SELECT 1 FROM ruc WHERE ruc = ? LIMIT 1');

export function upsertRucRecord(data) {
  if (!data || !data.ruc) return;
  // Keep the cached record count accurate without ever re-scanning: a fast
  // primary-key existence check tells us if this upsert adds a new row.
  const isNewRow = _recordCount !== null && !stmtRucExists.get(data.ruc);
  stmtInsertRuc.run({
    ruc: data.ruc,
    razon_social: data.razonSocial || data.razon_social,
    estado: data.estado || null,
    condicion: data.condicion || null,
    ubigeo: data.ubigeo || null,
    departamento: data.departamento || null,
    direccion: data.direccion || data.domicilioFiscal || data.domicilio_fiscal || null,
    tipo_contribuyente: data.tipoContribuyente || data.tipo_contribuyente || null,
    nombre_comercial: data.nombreComercial || data.nombre_comercial || null,
    fecha_inscripcion: data.fechaInscripcion || data.fecha_inscripcion || null,
    fecha_inicio_actividades: data.fechaInicioActividades || data.fecha_inicio_actividades || null,
    actividad_economica: toJsonOrNull(data.actividadEconomica || data.actividad_economica),
    comercio_exterior: data.comercioExterior || data.comercio_exterior || null,
    sistema_emision: data.sistemaEmision || data.sistema_emision || null,
    sistema_contabilidad: data.sistemaContabilidad || data.sistema_contabilidad || null,
    comprobantes_pago: toJsonOrNull(data.comprobantesPago || data.comprobantes_pago),
    sistema_emision_electronica: toJsonOrNull(data.sistemaEmisionElectronica || data.sistema_emision_electronica),
    emisor_electronico_desde: data.emisorElectronicoDesde || data.emisor_electronico_desde || null,
    comprobantes_electronicos: toJsonOrNull(data.comprobantesElectronicos || data.comprobantes_electronicos),
    ple_desde: data.pleDesde || data.ple_desde || null,
    padrones: toJsonOrNull(data.padrones),
    updated_at: new Date().toISOString()
  });
  if (isNewRow) _recordCount++;
}

/**
 * Bulk insert used by the ingester. Wraps the whole batch in one transaction
 * (caller is expected to chunk `rows` into reasonably sized batches, e.g. 10k).
 */
export function bulkInsert(rows) {
  const insertMany = db.transaction((items) => {
    for (const r of items) {
      stmtInsertRuc.run({
        ruc: r.ruc,
        razon_social: r.razon_social,
        estado: r.estado || null,
        condicion: r.condicion || null,
        ubigeo: r.ubigeo || null,
        departamento: r.departamento || null,
        direccion: r.direccion || null,
        tipo_contribuyente: r.tipo_contribuyente || null,
        nombre_comercial: r.nombre_comercial || null,
        fecha_inscripcion: r.fecha_inscripcion || null,
        fecha_inicio_actividades: r.fecha_inicio_actividades || null,
        actividad_economica: toJsonOrNull(r.actividad_economica),
        comercio_exterior: r.comercio_exterior || null,
        sistema_emision: r.sistema_emision || null,
        sistema_contabilidad: r.sistema_contabilidad || null,
        comprobantes_pago: toJsonOrNull(r.comprobantes_pago),
        sistema_emision_electronica: toJsonOrNull(r.sistema_emision_electronica),
        emisor_electronico_desde: r.emisor_electronico_desde || null,
        comprobantes_electronicos: toJsonOrNull(r.comprobantes_electronicos),
        ple_desde: r.ple_desde || null,
        padrones: toJsonOrNull(r.padrones),
        updated_at: r.updated_at || new Date().toISOString()
      });
    }
  });
  insertMany(rows);
}

export function bulkInsertSucursales(rows) {
  const insertMany = db.transaction((items) => {
    for (const r of items) {
      stmtInsertSucursal.run(r.ruc, r.ubigeo || null, r.direccion || null);
    }
  });
  insertMany(rows);
}

export function clearAll() {
  db.exec('DELETE FROM ruc');
  db.exec('DELETE FROM ruc_sucursal');
  _recordCount = null; // force a recount; the cached total is now wrong
}

// Detail fields that ONLY ever come from SUNAT's live ficha - the reduced
// padrón has none of them. tipo_contribuyente is the marker for "this row was
// enriched".
const ENRICHED_COLS = [
  'tipo_contribuyente', 'nombre_comercial', 'fecha_inscripcion',
  'fecha_inicio_actividades', 'actividad_economica', 'comercio_exterior',
  'sistema_emision', 'sistema_contabilidad', 'comprobantes_pago',
  'sistema_emision_electronica', 'emisor_electronico_desde',
  'comprobantes_electronicos', 'ple_desde', 'padrones'
];

/**
 * Rows the live scraper has filled in, so a bulk reload can put them back.
 *
 * Collecting these costs one indexed scan; losing them costs weeks - the
 * scraper is capped at a handful of live checks per 10 minutes on purpose, so
 * re-enriching a few thousand fichas is not something you can just redo.
 */
export function snapshotEnrichedRows() {
  return db
    .prepare(`SELECT ruc, ${ENRICHED_COLS.join(', ')} FROM ruc WHERE tipo_contribuyente IS NOT NULL`)
    .all();
}

/**
 * Writes a snapshot back after the reload. Only touches rows that still exist
 * in the fresh padrón: a RUC that SUNAT dropped should stay gone, not be
 * resurrected by our cache.
 */
export function restoreEnrichedRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  const setClause = ENRICHED_COLS.map((c) => `${c} = ?`).join(', ');
  const stmt = db.prepare(`UPDATE ruc SET ${setClause} WHERE ruc = ?`);
  let restored = 0;
  const run = db.transaction((items) => {
    for (const r of items) {
      const info = stmt.run(...ENRICHED_COLS.map((c) => r[c] ?? null), r.ruc);
      if (info.changes > 0) restored++;
    }
  });
  run(rows);
  return restored;
}

export function rebuildFtsIndex() {
  db.exec("INSERT INTO ruc_fts(ruc_fts) VALUES('rebuild')");
}

// COUNT(*) over 18M rows is a ~1s full scan, and node:sqlite is synchronous —
// running it on every /api/stats (fired by site.js on every page load) froze
// the whole server for a second at a time. The total is effectively static
// (a bulk dump; runtime only adds the rare live-scraped RUC), so we compute it
// once and keep it in memory, bumping by 1 only when a genuinely new row lands.
export function countRecords() {
  if (_recordCount === null) {
    _recordCount = db.prepare('SELECT COUNT(*) AS c FROM ruc').get().c;
  }
  return _recordCount;
}

// Proxy for "last full sync" - the DB file's own mtime, since bulkDownloader
// does a full clearAll()+reload on every run (see bulkDownloader.js).
export function getLastSyncTime() {
  try {
    return fs.statSync(DB_PATH).mtime.toISOString();
  } catch {
    return null;
  }
}

/* ── Analítica propia de visitas ────────────────────────────────────────────
 * El sitio no tenía forma de saber de dónde llega la gente. Search Console
 * cubre Google y nada más; esto cubre TODO lo que llega al servidor -
 * Google, Bing, DuckDuckGo, enlaces de terceros y tráfico directo- y además
 * por página y por país, que es lo que hace falta para decidir dónde invertir.
 *
 * Se guarda lo mínimo para agregar: día, ruta, fuente, host del referente,
 * país y si era un bot. NADA que identifique a una persona: ni IP, ni cookie,
 * ni user-agent completo, ni la URL entera del referente (sólo su host). Así
 * no hay datos personales que custodiar ni aviso de cookies que dar.
 */
db.exec(`
  CREATE TABLE IF NOT EXISTS pageview (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    day TEXT NOT NULL,
    path TEXT NOT NULL,
    source TEXT NOT NULL,
    referrer TEXT,
    country TEXT,
    bot INTEGER NOT NULL DEFAULT 0
  )
`);
// El panel filtra siempre por instante (ts) y separa bots, así que ese es el
// índice que sirve igual al rango de 24 h que al de 90 días. El de day se
// mantiene porque es el que usa la purga, que sí borra por fecha.
db.exec('CREATE INDEX IF NOT EXISTS idx_pageview_ts ON pageview(ts, bot)');
db.exec('CREATE INDEX IF NOT EXISTS idx_pageview_day ON pageview(day)');

const stmtInsertView = db.prepare(
  'INSERT INTO pageview (ts, day, path, source, referrer, country, bot) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
const stmtPruneViews = db.prepare('DELETE FROM pageview WHERE day < ?');

export function recordPageview({ path, source, referrer, country, bot }) {
  const now = new Date();
  try {
    stmtInsertView.run(
      now.getTime(),
      now.toISOString().slice(0, 10),
      String(path || '/').slice(0, 300),
      String(source || 'direct').slice(0, 40),
      referrer ? String(referrer).slice(0, 120) : null,
      country ? String(country).slice(0, 4) : null,
      bot ? 1 : 0
    );
  } catch {
    // Una visita perdida no vale romper la petición del visitante.
  }
}

/** Se llama desde el worker: mantiene la tabla acotada sin un cron aparte. */
export function pruneOldPageviews(keepDays = 90) {
  const cutoff = new Date(Date.now() - keepDays * 86400000).toISOString().slice(0, 10);
  try {
    return stmtPruneViews.run(cutoff).changes || 0;
  } catch {
    return 0;
  }
}

// Todo se filtra por instante y no por fecha: así el mismo juego de consultas
// sirve para «últimas 24 h» y para «90 días», sin un camino aparte para cada
// uno. El tamaño del cubo se interpola en el SQL - es una constante nuestra,
// nunca entrada del usuario - para que SQLite pueda reutilizar el plan.
const BUCKET = { hour: 3600000, day: 86400000 };

const bucketQuery = (size) => db.prepare(`
  SELECT (ts / ${size}) AS bucket,
         SUM(CASE WHEN bot = 0 THEN 1 ELSE 0 END) AS humans,
         SUM(CASE WHEN bot = 1 THEN 1 ELSE 0 END) AS bots
  FROM pageview WHERE ts >= ? GROUP BY bucket ORDER BY bucket
`);
const stmtViewsByHour = bucketQuery(BUCKET.hour);
const stmtViewsByDay = bucketQuery(BUCKET.day);

const stmtViewsBySource = db.prepare(`
  SELECT source, COUNT(*) AS n FROM pageview
  WHERE ts >= ? AND bot = 0 GROUP BY source ORDER BY n DESC
`);
const stmtViewsByPath = db.prepare(`
  SELECT path, COUNT(*) AS n FROM pageview
  WHERE ts >= ? AND bot = 0 GROUP BY path ORDER BY n DESC LIMIT ?
`);
const stmtViewsByCountry = db.prepare(`
  SELECT country, COUNT(*) AS n FROM pageview
  WHERE ts >= ? AND bot = 0 AND country IS NOT NULL GROUP BY country ORDER BY n DESC LIMIT ?
`);
const stmtViewsByReferrer = db.prepare(`
  SELECT referrer, COUNT(*) AS n FROM pageview
  WHERE ts >= ? AND bot = 0 AND referrer IS NOT NULL GROUP BY referrer ORDER BY n DESC LIMIT ?
`);
const stmtBotsByAgent = db.prepare(`
  SELECT source, COUNT(*) AS n FROM pageview
  WHERE ts >= ? AND bot = 1 GROUP BY source ORDER BY n DESC LIMIT ?
`);
const stmtViewTotals = db.prepare(`
  SELECT SUM(CASE WHEN bot = 0 THEN 1 ELSE 0 END) AS humans,
         SUM(CASE WHEN bot = 1 THEN 1 ELSE 0 END) AS bots
  FROM pageview WHERE ts >= ?
`);

/**
 * @param hours ventana a mirar. Hasta 48 h la serie se agrupa por hora: en un
 *   solo día, tres o cuatro barras diarias no dicen nada. Por encima, por día.
 * Los cubos salen como instante de inicio en ms para que el panel los etiquete
 * en la zona del navegador, en vez de fijar una zona horaria en el servidor.
 */
export function getTrafficStats(hours = 720, limit = 12) {
  const byHour = hours <= 48;
  const size = byHour ? BUCKET.hour : BUCKET.day;
  // Alineado al inicio del cubo, para que el primero no salga recortado.
  const sinceTs = Math.floor((Date.now() - hours * BUCKET.hour) / size) * size;
  const totals = stmtViewTotals.get(sinceTs) || {};
  const rows = (byHour ? stmtViewsByHour : stmtViewsByDay).all(sinceTs);
  return {
    hours,
    bucket: byHour ? 'hour' : 'day',
    bucketMs: size,
    sinceTs,
    totals: { humans: totals.humans || 0, bots: totals.bots || 0 },
    series: rows.map((r) => ({ t: Number(r.bucket) * size, humans: r.humans, bots: r.bots })),
    bySource: stmtViewsBySource.all(sinceTs),
    byPath: stmtViewsByPath.all(sinceTs, limit),
    byCountry: stmtViewsByCountry.all(sinceTs, limit),
    byReferrer: stmtViewsByReferrer.all(sinceTs, limit),
    byBot: stmtBotsByAgent.all(sinceTs, limit)
  };
}

// ─── Búsquedas de RUC ──────────────────────────────────────────────────────
// Distinto de pageview: aquí no interesa la visita sino QUÉ RUC se buscó y
// DESDE QUÉ página, que es lo que permite (a) enseñarlo en el panel y (b)
// decidir qué fichas merecen entrar al sitemap. Sin IP ni nada del visitante:
// sólo el RUC, la página de origen y el instante.
db.exec(`
  CREATE TABLE IF NOT EXISTS ruc_search (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    day TEXT NOT NULL,
    ruc TEXT NOT NULL,
    from_path TEXT NOT NULL,
    found INTEGER NOT NULL DEFAULT 1
  )
`);
db.exec('CREATE INDEX IF NOT EXISTS idx_ruc_search_ts ON ruc_search(ts)');
db.exec('CREATE INDEX IF NOT EXISTS idx_ruc_search_ruc ON ruc_search(ruc)');
db.exec('CREATE INDEX IF NOT EXISTS idx_ruc_search_day ON ruc_search(day)');

const stmtInsertSearch = db.prepare(
  'INSERT INTO ruc_search (ts, day, ruc, from_path, found) VALUES (?, ?, ?, ?, ?)'
);

export function recordRucSearch(ruc, fromPath, found) {
  if (!/^\d{11}$/.test(ruc || '')) return;
  const now = new Date();
  try {
    stmtInsertSearch.run(
      now.getTime(),
      now.toISOString().slice(0, 10),
      ruc,
      String(fromPath || '/').slice(0, 300),
      found ? 1 : 0
    );
  } catch {
    // Igual que recordPageview: la analítica nunca debe tumbar una búsqueda.
  }
}

// Los RUC más buscados, con el nombre ya resuelto para no tener que pedirlo
// ficha por ficha desde el panel.
const stmtTopSearched = db.prepare(`
  SELECT s.ruc, COUNT(*) AS n, MAX(s.ts) AS lastTs, r.razon_social AS razonSocial
  FROM ruc_search s LEFT JOIN ruc r ON r.ruc = s.ruc
  WHERE s.ts >= ? GROUP BY s.ruc ORDER BY n DESC, lastTs DESC LIMIT ?
`);

// Desde qué páginas se busca. Responde a "¿la gente busca desde la home o
// desde las guías?", que es lo que dice dónde poner el buscador.
const stmtSearchByPath = db.prepare(`
  SELECT from_path AS path, COUNT(*) AS n FROM ruc_search
  WHERE ts >= ? GROUP BY from_path ORDER BY n DESC LIMIT ?
`);

const stmtSearchTotals = db.prepare(`
  SELECT COUNT(*) AS total,
         COUNT(DISTINCT ruc) AS distinctRucs,
         SUM(CASE WHEN found = 0 THEN 1 ELSE 0 END) AS notFound
  FROM ruc_search WHERE ts >= ?
`);

export function getSearchStats(hours = 720, limit = 12) {
  const sinceTs = Date.now() - hours * 3600000;
  const t = stmtSearchTotals.get(sinceTs) || {};
  return {
    totals: {
      total: t.total || 0,
      distinctRucs: t.distinctRucs || 0,
      notFound: t.notFound || 0
    },
    topRucs: stmtTopSearched.all(sinceTs, limit),
    byPath: stmtSearchByPath.all(sinceTs, limit)
  };
}

// En cuántos días distintos se buscó un RUC. Es la señal de demanda con la que
// indexableRucs.js decide si una ficha fuera del directorio curado se indexa.
const stmtSearchDays = db.prepare(
  'SELECT COUNT(DISTINCT day) AS days FROM ruc_search WHERE ruc = ? AND found = 1'
);

export function countSearchDays(ruc) {
  return stmtSearchDays.get(ruc)?.days || 0;
}

// Las fichas buscadas que entran al sitemap. Deliberadamente NO es "todos los
// RUC": mismo criterio que isIndexableRuc() en indexableRucs.js (ficha
// enriquecida, con domicilio, y buscada en varios días distintos), para que
// nada de lo que se ofrece a Google lleve noindex.
const stmtSitemapRucs = db.prepare(`
  SELECT s.ruc, MAX(s.ts) AS lastTs, COUNT(*) AS n
  FROM ruc_search s JOIN ruc r ON r.ruc = s.ruc
  WHERE s.found = 1
    AND (r.direccion IS NOT NULL AND r.direccion != '')
    AND r.tipo_contribuyente IS NOT NULL
  GROUP BY s.ruc
  HAVING COUNT(DISTINCT s.day) >= ?
  ORDER BY n DESC, lastTs DESC
  LIMIT ?
`);

export function getSearchedRucsForSitemap(limit, minDays) {
  return stmtSitemapRucs.all(minDays, limit);
}

// Lo mismo, pero con la ficha entera, para poder pintar tarjetas en el
// directorio sin una segunda consulta por empresa. Mismo filtro de calidad que
// el sitemap: si no tiene domicilio, no se enseña - una tarjeta con la mitad
// de los campos vacíos queda peor que no ponerla.
const stmtMostSearchedFull = db.prepare(`
  SELECT r.ruc, r.razon_social AS razonSocial, r.estado, r.condicion,
         r.direccion AS domicilioFiscal, r.actividad_economica AS actividadEconomica,
         COUNT(*) AS searches
  FROM ruc_search s JOIN ruc r ON r.ruc = s.ruc
  WHERE s.ts >= ? AND s.found = 1
    AND (r.direccion IS NOT NULL AND r.direccion != '')
  GROUP BY s.ruc
  ORDER BY searches DESC, MAX(s.ts) DESC
  LIMIT ?
`);

export function getMostSearchedCompanies(hours = 720, limit = 12) {
  return stmtMostSearchedFull.all(Date.now() - hours * 3600000, limit);
}

// Se purga con la misma política que pageview.
const stmtPruneSearch = db.prepare('DELETE FROM ruc_search WHERE day < ?');
export function pruneRucSearches(keepDays = 90) {
  const cutoff = new Date(Date.now() - keepDays * 86400000).toISOString().slice(0, 10);
  try {
    return stmtPruneSearch.run(cutoff).changes;
  } catch {
    return 0;
  }
}
