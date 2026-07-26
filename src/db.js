const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '../data');
const DB_PATH = path.join(DATA_DIR, 'consulta_ruc.sqlite');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

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

function enqueueEnrichment(ruc) {
  if (!/^\d{11}$/.test(ruc || '')) return;
  stmtEnqueueEnrich.run(ruc, new Date().toISOString());
}

function nextEnrichment() {
  const row = stmtNextEnrich.get();
  return row ? row.ruc : null;
}

function markEnrichmentDone(ruc) {
  stmtEnrichDone.run(ruc);
}

function markEnrichmentFailed(ruc, error) {
  stmtEnrichFailed.run(String(error || '').slice(0, 300), ruc);
}

// Only RUCs that carry the full ficha (tipo_contribuyente only ever comes from
// the detailed source, never from the reduced padrón) are worth putting in the
// sitemap - thin pages would drag the domain's quality signal down.
//
// PARTIAL index: without it this query full-scans all 18M rows and sorts them,
// which measured at ~16s per sitemap request. Enriched rows are a tiny subset,
// so indexing only those keeps the index small and the query near-instant.
// Built once (costs one scan), then persisted in the DB file.
db.exec(
  'CREATE INDEX IF NOT EXISTS idx_ruc_enriched ON ruc(updated_at DESC) WHERE tipo_contribuyente IS NOT NULL'
);

const stmtEnrichedRucs = db.prepare(
  'SELECT ruc FROM ruc WHERE tipo_contribuyente IS NOT NULL ORDER BY updated_at DESC LIMIT ?'
);

function getEnrichedRucs(limit = 45000) {
  return stmtEnrichedRucs.all(limit).map((r) => r.ruc);
}

// Fallback pool for the sitemap once the enriched set is exhausted: active
// contributors that at least have a real domicilio fiscal, so the page carries
// enough of its own data to stand on.
//
// Deliberately NO ORDER BY - about 5% of rows match, so SQLite can stop as
// soon as it has `limit` of them. Adding a sort would force it to rank all
// 18M rows first (the same trap that made the sitemap take 16s).
// Partial index over just this ~880k-row subset. Without it the scan starts at
// the 10… (persona natural) rows, which almost never carry an address, so
// SQLite walks millions of non-matching rows before it finds enough - measured
// at 13s. With it the lookup is immediate.
db.exec(
  "CREATE INDEX IF NOT EXISTS idx_ruc_sitemap ON ruc(ruc) " +
    "WHERE estado = 'ACTIVO' AND direccion IS NOT NULL AND tipo_contribuyente IS NULL"
);

const stmtSitemapFallback = db.prepare(
  "SELECT ruc FROM ruc WHERE estado = 'ACTIVO' AND direccion IS NOT NULL AND tipo_contribuyente IS NULL LIMIT ?"
);

/**
 * URLs to actively submit in the sitemap, best-first.
 *
 * The cap is the pacing lever: a brand-new domain that submits millions of
 * URLs looks like a content farm and burns crawl budget it hasn't earned yet.
 * Start small, raise it as indexing proves healthy. Pages outside this list
 * are still indexable - they're just left for Google to find naturally.
 */
function getSitemapRucs(limit) {
  const enriched = getEnrichedRucs(limit);
  if (enriched.length >= limit) return enriched;
  const rest = stmtSitemapFallback.all(limit - enriched.length).map((r) => r.ruc);
  return enriched.concat(rest);
}

function getEnrichStats() {
  const r = stmtEnrichStats.get() || {};
  return { enriched: r.enriched || 0, pending: r.pending || 0, gaveUp: r.gaveUp || 0 };
}

const stmtUpsertTipoCambio = db.prepare(`
  INSERT INTO tipo_cambio (fecha, compra, venta, updated_at) VALUES (?, ?, ?, ?)
  ON CONFLICT(fecha) DO UPDATE SET compra = excluded.compra, venta = excluded.venta, updated_at = excluded.updated_at
`);
const stmtLatestTipoCambio = db.prepare('SELECT * FROM tipo_cambio ORDER BY fecha DESC LIMIT 1');
const stmtRecentTipoCambio = db.prepare('SELECT * FROM tipo_cambio ORDER BY fecha DESC LIMIT ?');

function upsertTipoCambio(fecha, compra, venta) {
  stmtUpsertTipoCambio.run(fecha, compra, venta, new Date().toISOString());
}

function getLatestTipoCambio() {
  const row = stmtLatestTipoCambio.get();
  return row || null;
}

function getRecentTipoCambio(limit = 30) {
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
    ubigeo = excluded.ubigeo,
    departamento = excluded.departamento,
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

function getByRuc(ruc) {
  const row = stmtGetByRuc.get(ruc);
  if (!row) return null;
  const data = rowToApiShape(row);
  data.sucursales = stmtGetSucursales.all(ruc);
  return data;
}

function searchByName(query, limit = 20) {
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
  } catch (err) {
    return [];
  }
}

function toJsonOrNull(value) {
  return value ? JSON.stringify(value) : null;
}

function upsertRucRecord(data) {
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
function bulkInsert(rows) {
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

function bulkInsertSucursales(rows) {
  const insertMany = db.transaction((items) => {
    for (const r of items) {
      stmtInsertSucursal.run(r.ruc, r.ubigeo || null, r.direccion || null);
    }
  });
  insertMany(rows);
}

function clearAll() {
  db.exec('DELETE FROM ruc');
  db.exec('DELETE FROM ruc_sucursal');
}

function rebuildFtsIndex() {
  db.exec("INSERT INTO ruc_fts(ruc_fts) VALUES('rebuild')");
}

// COUNT(*) over 18M rows is a ~1s full scan, and node:sqlite is synchronous —
// running it on every /api/stats (fired by site.js on every page load) froze
// the whole server for a second at a time. The total is effectively static
// (a bulk dump; runtime only adds the rare live-scraped RUC), so we compute it
// once and keep it in memory, bumping by 1 only when a genuinely new row lands.
let _recordCount = null;
const stmtRucExists = db.prepare('SELECT 1 FROM ruc WHERE ruc = ? LIMIT 1');
function countRecords() {
  if (_recordCount === null) {
    _recordCount = db.prepare('SELECT COUNT(*) AS c FROM ruc').get().c;
  }
  return _recordCount;
}

// Proxy for "last full sync" - the DB file's own mtime, since bulkDownloader
// does a full clearAll()+reload on every run (see bulkDownloader.js).
function getLastSyncTime() {
  try {
    return fs.statSync(DB_PATH).mtime.toISOString();
  } catch {
    return null;
  }
}

module.exports = {
  db,
  getByRuc,
  searchByName,
  upsertRucRecord,
  bulkInsert,
  bulkInsertSucursales,
  clearAll,
  rebuildFtsIndex,
  countRecords,
  getLastSyncTime,
  upsertTipoCambio,
  getLatestTipoCambio,
  getRecentTipoCambio,
  enqueueEnrichment,
  nextEnrichment,
  markEnrichmentDone,
  markEnrichmentFailed,
  getEnrichStats,
  getEnrichedRucs,
  getSitemapRucs
};
