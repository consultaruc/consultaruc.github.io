import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import AdmZip from 'adm-zip';
import {
  bulkInsert,
  bulkInsertSucursales,
  clearAll,
  snapshotEnrichedRows,
  restoreEnrichedRows,
  rebuildFtsIndex,
  countRecords
} from './db.js';

// Verified live 2026-07-23, see memory/reference_sunat_data_sources.md
const RUC_ZIP_URL = 'http://www2.sunat.gob.pe/padron_reducido_ruc.zip';
const ANEXO_ZIP_URL = 'https://www.sunat.gob.pe/descargaPRR/padron_reducido_local_anexo.zip';

// Anchored on the same DATA_DIR convention as db.js (process.cwd(), not the
// module's own location) - see db.js for why.
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DOWNLOAD_DIR = path.join(DATA_DIR, 'downloads');
const RUC_ZIP_PATH = path.join(DOWNLOAD_DIR, 'padron_reducido_ruc.zip');
const ANEXO_ZIP_PATH = path.join(DOWNLOAD_DIR, 'padron_reducido_local_anexo.zip');

const BATCH_SIZE = 10000;

/**
 * Real column layout of padron_reducido_ruc.txt (pipe-separated), verified
 * directly against the downloaded file on 2026-07-23:
 *
 * 0 RUC | 1 NOMBRE O RAZÓN SOCIAL | 2 ESTADO DEL CONTRIBUYENTE |
 * 3 CONDICIÓN DE DOMICILIO | 4 UBIGEO | 5 TIPO DE VÍA | 6 NOMBRE DE VÍA |
 * 7 CÓDIGO DE ZONA | 8 TIPO DE ZONA | 9 NÚMERO | 10 INTERIOR | 11 LOTE |
 * 12 DEPARTAMENTO | 13 MANZANA | 14 KILÓMETRO
 *
 * CAREFUL - column 12 "DEPARTAMENTO" is NOT the Peruvian department
 * (Lima, Cusco…). It is the apartment/flat number of the address: real values
 * are "902", "205", "03", "A", and there are ~4,000 distinct ones where a
 * department column would have 25. Feeding it into ruc.departamento made the
 * ficha show "Departamento: 902", so it goes into the address string instead
 * (as "DPTO. 902") and ruc.departamento is left NULL - geo.js deriveDept()
 * recovers the real department from the address tail, which the padrón writes
 * as "… DEPARTAMENTO - PROVINCIA - DISTRITO".
 */
function clean(value) {
  const v = (value || '').trim();
  return v === '-' || v === '' ? '' : v;
}

/**
 * Builds a display address from named sub-fields (order/positions differ
 * between the main padrón file and the local_anexo file, so each caller maps
 * its own column indices into this shape rather than sharing raw indices).
 * Real SUNAT data omits address detail for most personas naturales (every
 * sub-field is "-") - returns null rather than a fake "direccion registrada"
 * placeholder when there's genuinely nothing.
 */
function buildDireccion({ tipoVia, nombreVia, tipoZona, codigoZona, numero, interior, lote, manzana, km, depto }) {
  const segments = [];
  if (tipoVia || nombreVia) segments.push([tipoVia, nombreVia].filter(Boolean).join(' '));
  if (numero) segments.push(`NRO. ${numero}`);
  if (interior) segments.push(`INT. ${interior}`);
  if (depto) segments.push(`DPTO. ${depto}`);
  if (manzana) segments.push(`MZ. ${manzana}`);
  if (lote) segments.push(`LT. ${lote}`);
  if (km) segments.push(`KM. ${km}`);
  if (tipoZona || codigoZona) segments.push([tipoZona, codigoZona].filter(Boolean).join(' '));

  return segments.length > 0 ? segments.join(' ').trim() : null;
}

/**
 * Downloads the dump only when SUNAT's copy is actually newer than ours.
 *
 * "Skip if the file exists" was the old rule, and on a scheduled re-sync it
 * silently re-ingested yesterday's zip: the run logged "Success!" and the
 * database ended up exactly as stale as before. SUNAT publishes a
 * Last-Modified (they refresh the padrón roughly daily), so compare against it
 * and re-download whenever it moves. If the HEAD request fails we download
 * anyway - wasting bandwidth is much better than serving stale RUC data.
 *
 * Returns true when fresh bytes were fetched, false when ours was already
 * current, so the caller can skip the whole reload.
 */
async function downloadIfStale(url, destPath, label) {
  let remoteModified = null;
  try {
    const head = await axios({ method: 'head', url, timeout: 30000 });
    const lm = head.headers['last-modified'];
    if (lm) remoteModified = new Date(lm);
  } catch (err) {
    console.warn(`[Bulk Sync] ${label}: no se pudo consultar Last-Modified (${err.message}); se descargará igual.`);
  }

  if (fs.existsSync(destPath) && remoteModified && !isNaN(remoteModified)) {
    const localModified = fs.statSync(destPath).mtime;
    if (localModified >= remoteModified) {
      console.log(
        `[Bulk Sync] ${label} ya está al día ` +
          `(local ${localModified.toISOString()} >= SUNAT ${remoteModified.toISOString()}), no se descarga.`
      );
      return false;
    }
    console.log(`[Bulk Sync] ${label}: SUNAT publicó una versión más reciente (${remoteModified.toISOString()}).`);
  }

  console.log(`[Bulk Sync] Downloading ${label} from ${url} ...`);
  // Write to a temp file and rename only on success: a download killed halfway
  // through would otherwise leave a truncated zip that looks complete enough to
  // extract, and the next run would happily ingest a partial padrón.
  const tmpPath = `${destPath}.part`;
  const response = await axios({ method: 'get', url, responseType: 'stream', timeout: 120000 });
  const writer = fs.createWriteStream(tmpPath);
  response.data.pipe(writer);
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
    response.data.on('error', reject);
  });
  fs.renameSync(tmpPath, destPath);
  // Stamp the local file with SUNAT's own timestamp so the comparison above
  // stays meaningful across runs.
  if (remoteModified && !isNaN(remoteModified)) {
    fs.utimesSync(destPath, remoteModified, remoteModified);
  }
  console.log(`[Bulk Sync] ${label} download complete.`);
  return true;
}

function extractZip(zipPath, expectedTxtPath) {
  // Reuse the extracted .txt only if it is at least as new as the zip it came
  // from. Checking "exists and non-empty" alone meant a freshly downloaded zip
  // was never unpacked while yesterday's .txt sat next to it - the sync then
  // re-ingested the old text and reported success.
  if (fs.existsSync(expectedTxtPath) && fs.statSync(expectedTxtPath).size > 0) {
    if (fs.statSync(expectedTxtPath).mtime >= fs.statSync(zipPath).mtime) {
      return expectedTxtPath;
    }
    console.log(`[Bulk Sync] ${path.basename(expectedTxtPath)} es más antiguo que el zip; se vuelve a extraer.`);
  }
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(path.dirname(zipPath), true);
  if (fs.existsSync(expectedTxtPath) && fs.statSync(expectedTxtPath).size > 0) {
    return expectedTxtPath;
  }

  const dir = path.dirname(zipPath);
  const txtFile = fs.readdirSync(dir).find((f) => f.endsWith('.txt') && fs.statSync(path.join(dir, f)).size > 0);
  if (!txtFile) throw new Error(`No non-empty .txt file found after extracting ${zipPath}`);
  return path.join(dir, txtFile);
}

/**
 * SUNAT publica el padrón en Latin-1, no en UTF-8. Sin declararlo, Node
 * decodifica cada byte acentuado como inválido y lo sustituye por U+FFFD de
 * forma permanente: "INTEGRATEL PERÚ S.A.A." quedaba almacenado como
 * "INTEGRATEL PER� S.A.A." y así salía en el título, en la ficha y en la
 * API. Peor aún, el token corrupto tampoco casa en el índice FTS, así que
 * buscar por el nombre correcto no encontraba a esas empresas.
 *
 * 'latin1' basta y no necesita dependencias: para el rango acentuado del
 * español (0xC0-0xFF) es idéntico a Windows-1252.
 */
const PADRON_ENCODING = 'latin1';

async function ingestRucFile(txtPath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(txtPath, { encoding: PADRON_ENCODING }),
    crlfDelay: Infinity
  });

  let batch = [];
  let total = 0;
  let isFirstLine = true;

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue; // header row
    }
    if (!line) continue;

    const parts = line.split('|');
    const ruc = clean(parts[0]);
    if (ruc.length !== 11 || !/^\d{11}$/.test(ruc)) continue;

    const razonSocial = clean(parts[1]);
    if (!razonSocial) continue;

    batch.push({
      ruc,
      razon_social: razonSocial,
      estado: clean(parts[2]) || null,
      condicion: clean(parts[3]) || null,
      ubigeo: clean(parts[4]) || null,
      // Left NULL on purpose - see the column-layout note above. geo.js
      // derives the real department from the address.
      departamento: null,
      direccion: buildDireccion({
        tipoVia: clean(parts[5]),
        nombreVia: clean(parts[6]),
        codigoZona: clean(parts[7]),
        tipoZona: clean(parts[8]),
        numero: clean(parts[9]),
        interior: clean(parts[10]),
        lote: clean(parts[11]),
        depto: clean(parts[12]),
        manzana: clean(parts[13]),
        km: clean(parts[14])
      })
    });

    if (batch.length >= BATCH_SIZE) {
      bulkInsert(batch);
      total += batch.length;
      if (total % 500000 < BATCH_SIZE) {
        console.log(`[Bulk Sync] Ingested ${total.toLocaleString()} RUC records...`);
      }
      batch = [];
    }
  }

  if (batch.length > 0) {
    bulkInsert(batch);
    total += batch.length;
  }

  return total;
}

/**
 * Real column layout of padron_reducido_local_anexo.txt, verified directly
 * against the downloaded file on 2026-07-23 (different order than the main
 * padrón file - do not assume they match):
 *
 * 0 RUC | 1 UBIGEO | 2 TIPO DE VÍA | 3 NOMBRE DE VÍA | 4 CÓDIGO DE ZONA |
 * 5 TIPO DE ZONA | 6 NÚMERO | 7 KILÓMETRO | 8 INTERIOR | 9 LOTE |
 * 10 DEPARTAMENTO | 11 MANZANA
 */
async function ingestSucursalesFile(txtPath) {
  // Mismo Latin-1 que el padrón principal - aquí son las direcciones de los
  // anexos las que llevan acentos.
  const rl = readline.createInterface({
    input: fs.createReadStream(txtPath, { encoding: PADRON_ENCODING }),
    crlfDelay: Infinity
  });

  let batch = [];
  let total = 0;
  let isFirstLine = true;

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }
    if (!line) continue;

    const parts = line.split('|');
    const ruc = clean(parts[0]);
    if (ruc.length !== 11 || !/^\d{11}$/.test(ruc)) continue;

    const direccion = buildDireccion({
      tipoVia: clean(parts[2]),
      nombreVia: clean(parts[3]),
      codigoZona: clean(parts[4]),
      tipoZona: clean(parts[5]),
      numero: clean(parts[6]),
      km: clean(parts[7]),
      interior: clean(parts[8]),
      lote: clean(parts[9]),
      manzana: clean(parts[11])
    });
    if (!direccion) continue;

    batch.push({ ruc, ubigeo: clean(parts[1]) || null, direccion });

    if (batch.length >= BATCH_SIZE) {
      bulkInsertSucursales(batch);
      total += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) {
    bulkInsertSucursales(batch);
    total += batch.length;
  }

  return total;
}

/**
 * Refresh sync, safe to run daily from cron.
 *
 * Re-downloads each dump only when SUNAT's Last-Modified is newer than our
 * copy, and if NEITHER file moved it returns early without touching the
 * database - re-ingesting an unchanged padrón costs ~40 minutes of CPU and
 * leaves the data byte-identical.
 *
 * Pass { force: true } to reload regardless (useful after changing how rows
 * are parsed, e.g. a column-mapping fix).
 */
export async function downloadAndProcessDump(options = {}) {
  const force = !!options.force;
  if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

  const rucFresh = await downloadIfStale(RUC_ZIP_URL, RUC_ZIP_PATH, 'Padrón RUC principal');
  const anexoFresh = await downloadIfStale(ANEXO_ZIP_URL, ANEXO_ZIP_PATH, 'Local Anexo (sucursales)');

  if (!rucFresh && !anexoFresh && !force) {
    const current = countRecords();
    console.log(
      `[Bulk Sync] Sin cambios en SUNAT: la base ya está al día ` +
        `(${current.toLocaleString()} registros). No se recarga.`
    );
    return { success: true, skipped: true, rucCount: current, sucursalCount: 0 };
  }

  const rucTxtPath = extractZip(RUC_ZIP_PATH, path.join(DOWNLOAD_DIR, 'padron_reducido_ruc.txt'));
  const anexoTxtPath = extractZip(ANEXO_ZIP_PATH, path.join(DOWNLOAD_DIR, 'padron_reducido_local_anexo.txt'));

  // clearAll() wipes the detail fields the live scraper spent its rate-limited
  // budget collecting (tipo contribuyente, actividad económica, comprobantes…),
  // which the padrón does not contain and cannot restore. Snapshot them first
  // and write them back after the reload, so a routine refresh doesn't undo
  // weeks of progressive enrichment.
  console.log('[Bulk Sync] Preservando fichas enriquecidas antes de recargar...');
  const enriched = snapshotEnrichedRows();
  console.log(`[Bulk Sync] ${enriched.length.toLocaleString()} fichas enriquecidas guardadas.`);

  console.log('[Bulk Sync] Clearing existing tables for a fresh full reload...');
  clearAll();

  console.log('[Bulk Sync] Ingesting main RUC padrón...');
  const rucCount = await ingestRucFile(rucTxtPath);
  console.log(`[Bulk Sync] Main padrón done: ${rucCount.toLocaleString()} records.`);

  console.log('[Bulk Sync] Ingesting sucursales (local anexo)...');
  const sucursalCount = await ingestSucursalesFile(anexoTxtPath);
  console.log(`[Bulk Sync] Sucursales done: ${sucursalCount.toLocaleString()} records.`);

  if (enriched.length > 0) {
    console.log('[Bulk Sync] Restaurando fichas enriquecidas...');
    const restored = restoreEnrichedRows(enriched);
    console.log(`[Bulk Sync] ${restored.toLocaleString()} fichas enriquecidas restauradas.`);
  }

  console.log('[Bulk Sync] Rebuilding FTS5 search index...');
  rebuildFtsIndex();

  const finalCount = countRecords();
  console.log(`[Bulk Sync] Success! ${finalCount.toLocaleString()} RUC records indexed and searchable.`);

  return { success: true, rucCount: finalCount, sucursalCount };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // `npm run download-bulk -- --force` reloads even when SUNAT hasn't
  // republished (after changing how rows are parsed, for instance).
  const force = process.argv.includes('--force');
  downloadAndProcessDump({ force }).catch((err) => {
    console.error('[Bulk Sync Error]:', err);
    process.exit(1);
  });
}
