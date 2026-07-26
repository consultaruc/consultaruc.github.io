const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const AdmZip = require('adm-zip');
const { bulkInsert, bulkInsertSucursales, clearAll, rebuildFtsIndex, countRecords } = require('./db');

// Verified live 2026-07-23, see memory/reference_sunat_data_sources.md
const RUC_ZIP_URL = 'http://www2.sunat.gob.pe/padron_reducido_ruc.zip';
const ANEXO_ZIP_URL = 'https://www.sunat.gob.pe/descargaPRR/padron_reducido_local_anexo.zip';

const DOWNLOAD_DIR = path.join(__dirname, '../data/downloads');
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
function buildDireccion({ tipoVia, nombreVia, tipoZona, codigoZona, numero, interior, lote, manzana, km }) {
  const segments = [];
  if (tipoVia || nombreVia) segments.push([tipoVia, nombreVia].filter(Boolean).join(' '));
  if (numero) segments.push(`NRO. ${numero}`);
  if (interior) segments.push(`INT. ${interior}`);
  if (manzana) segments.push(`MZ. ${manzana}`);
  if (lote) segments.push(`LT. ${lote}`);
  if (km) segments.push(`KM. ${km}`);
  if (tipoZona || codigoZona) segments.push([tipoZona, codigoZona].filter(Boolean).join(' '));

  return segments.length > 0 ? segments.join(' ').trim() : null;
}

async function downloadIfMissing(url, destPath, label) {
  if (fs.existsSync(destPath)) {
    console.log(`[Bulk Sync] ${label} already downloaded, skipping fetch.`);
    return;
  }
  console.log(`[Bulk Sync] Downloading ${label} from ${url} ...`);
  const response = await axios({ method: 'get', url, responseType: 'stream', timeout: 120000 });
  const writer = fs.createWriteStream(destPath);
  response.data.pipe(writer);
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
  console.log(`[Bulk Sync] ${label} download complete.`);
}

function extractZip(zipPath, expectedTxtPath) {
  if (fs.existsSync(expectedTxtPath) && fs.statSync(expectedTxtPath).size > 0) {
    return expectedTxtPath;
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

async function ingestRucFile(txtPath) {
  const rl = readline.createInterface({ input: fs.createReadStream(txtPath), crlfDelay: Infinity });

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
      departamento: clean(parts[12]) || null,
      direccion: buildDireccion({
        tipoVia: clean(parts[5]),
        nombreVia: clean(parts[6]),
        codigoZona: clean(parts[7]),
        tipoZona: clean(parts[8]),
        numero: clean(parts[9]),
        interior: clean(parts[10]),
        lote: clean(parts[11]),
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
  const rl = readline.createInterface({ input: fs.createReadStream(txtPath), crlfDelay: Infinity });

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
 * Full daily-refresh sync: downloads both SUNAT dumps (skips download if the
 * zip is already on disk - the caller is responsible for clearing data/downloads
 * before calling this if a fresh re-download is actually wanted), wipes the
 * existing tables, and re-ingests everything from scratch. A full reload each
 * run is simpler and safer than incremental upsert + keeping the FTS index in
 * sync row-by-row across 11M+ records.
 */
async function downloadAndProcessDump() {
  if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

  await downloadIfMissing(RUC_ZIP_URL, RUC_ZIP_PATH, 'Padrón RUC principal');
  await downloadIfMissing(ANEXO_ZIP_URL, ANEXO_ZIP_PATH, 'Local Anexo (sucursales)');

  const rucTxtPath = extractZip(RUC_ZIP_PATH, path.join(DOWNLOAD_DIR, 'padron_reducido_ruc.txt'));
  const anexoTxtPath = extractZip(ANEXO_ZIP_PATH, path.join(DOWNLOAD_DIR, 'padron_reducido_local_anexo.txt'));

  console.log('[Bulk Sync] Clearing existing tables for a fresh full reload...');
  clearAll();

  console.log('[Bulk Sync] Ingesting main RUC padrón...');
  const rucCount = await ingestRucFile(rucTxtPath);
  console.log(`[Bulk Sync] Main padrón done: ${rucCount.toLocaleString()} records.`);

  console.log('[Bulk Sync] Ingesting sucursales (local anexo)...');
  const sucursalCount = await ingestSucursalesFile(anexoTxtPath);
  console.log(`[Bulk Sync] Sucursales done: ${sucursalCount.toLocaleString()} records.`);

  console.log('[Bulk Sync] Rebuilding FTS5 search index...');
  rebuildFtsIndex();

  const finalCount = countRecords();
  console.log(`[Bulk Sync] Success! ${finalCount.toLocaleString()} RUC records indexed and searchable.`);

  return { success: true, rucCount: finalCount, sucursalCount };
}

if (require.main === module) {
  downloadAndProcessDump().catch((err) => {
    console.error('[Bulk Sync Error]:', err);
    process.exit(1);
  });
}

module.exports = { downloadAndProcessDump };
