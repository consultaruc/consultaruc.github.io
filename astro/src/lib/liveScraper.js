import { chromium } from 'playwright';

const URL_SUNAT = 'https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/jcrS00Alias';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// A real headless browser (not raw HTTP) is required here - SUNAT's portal
// runs Google reCAPTCHA v3 + a WAF that reject scripted HTTP requests, but
// pass a genuine browser context. Verified working 2026-07-23 against RUC
// 20100070970. See memory/project_consultaruc_architecture.md for the
// raw-HTTP attempts that failed before this.
//
// OJO: `playwright` está clavado a 1.45.0 EXACTO en package.json, sin caret,
// y no es arbitrario. Cada versión de Playwright exige un build concreto de
// Chromium (1.45 -> chromium-1124) y en el servidor los navegadores se
// instalaron a mano una vez; el despliegue corre con
// PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 porque bajarlos (~170 MB) no cabe en la
// cuota del hosting compartido. Al migrar a Astro esto subió sin querer a
// 1.62, que busca chromium-1234, y el scraper quedó roto EN SILENCIO: el
// binario no existe, scrapeRucLive() falla y la búsqueda en vivo deja de
// funcionar sin que nada más se queje.
//
// Para subir de versión hay que hacer las dos cosas a la vez: cambiar el pin
// Y correr `npx playwright install chromium` en el servidor, comprobando
// antes que hay cuota de disco. Verificación rápida de que casan:
//   node -e "const{chromium}=require('playwright');console.log(chromium.executablePath())"
//   ls ~/.cache/ms-playwright/

const MAX_CONCURRENT = 2;
let activeCount = 0;
const queue = [];
let sharedBrowser = null;

// Tracked for the admin dashboard's "is the live API working" indicator -
// updated on every scrapeRucLive() call, success or failure.
const health = {
  lastCheckedAt: null,
  lastOutcome: null, // 'ok' | 'not_found' | 'blocked' | 'error'
  lastMessage: null
};

function recordHealth(outcome, message) {
  health.lastCheckedAt = new Date().toISOString();
  health.lastOutcome = outcome;
  health.lastMessage = message || null;
}

export function getHealth() {
  return { ...health };
}

// ==========================================================
// Self-imposed global rate limit for live SUNAT checks.
//
// SUNAT's OWN anti-abuse system starts requiring an unsolvable image
// captcha after ~6 rapid queries in a short window (observed 2026-07-23,
// see liveScraper's "ingrese el código mostrado" handling below). Every
// visitor's live-check request goes out through THIS server's one shared
// IP, so the budget below is global across all users, not per-visitor -
// one abusive visitor could otherwise burn through SUNAT's tolerance and
// get our server's IP blocked for everyone. Kept deliberately below the
// observed ~6 threshold for safety margin.
// ==========================================================
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 4; // max live checks per window, shared by all visitors
const attemptTimestamps = [];

function pruneOldAttempts() {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  while (attemptTimestamps.length > 0 && attemptTimestamps[0] < cutoff) {
    attemptTimestamps.shift();
  }
}

export function getQuotaStatus() {
  pruneOldAttempts();
  const remaining = Math.max(0, RATE_LIMIT_MAX - attemptTimestamps.length);
  const retryAfterMs = attemptTimestamps.length > 0 ? attemptTimestamps[0] + RATE_LIMIT_WINDOW_MS - Date.now() : 0;
  return {
    max: RATE_LIMIT_MAX,
    windowMinutes: RATE_LIMIT_WINDOW_MS / 60000,
    remaining,
    retryAfterSeconds: remaining > 0 ? 0 : Math.max(0, Math.ceil(retryAfterMs / 1000))
  };
}

async function getBrowser() {
  if (sharedBrowser && sharedBrowser.isConnected()) return sharedBrowser;
  sharedBrowser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--lang=es-PE']
  });
  return sharedBrowser;
}

/**
 * Aborts images/fonts/media before they're fetched. Cuts page weight and RAM
 * substantially without changing what we actually read from the page.
 *
 * Deliberately does NOT block stylesheets or scripts:
 *  - CSS drives layout, and firstVisible() relies on Playwright's isVisible(),
 *    which is computed from layout - blocking CSS can silently change which
 *    selectors are considered visible.
 *  - JS is required for SUNAT's reCAPTCHA v3 to execute; blocking it would
 *    likely make us look MORE like a bot, not less.
 */
export async function blockHeavyResources(page) {
  await page.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (type === 'image' || type === 'font' || type === 'media') return route.abort();
    return route.continue();
  });
}

function acquireSlot() {
  if (activeCount < MAX_CONCURRENT) {
    activeCount += 1;
    return Promise.resolve();
  }
  return new Promise((resolve) => queue.push(resolve));
}

function releaseSlot() {
  activeCount -= 1;
  const next = queue.shift();
  if (next) {
    activeCount += 1;
    next();
  }
}

/**
 * Live-fetches a single RUC directly from SUNAT via a real browser session.
 * Returns null if the RUC genuinely doesn't exist at SUNAT (no fabricated
 * fallback values - if a field isn't found in the page text, it stays null).
 *
 * Throws immediately (no browser launched) if our own shared rate-limit
 * budget is exhausted - see getQuotaStatus() above.
 */
export async function scrapeRucLive(ruc) {
  pruneOldAttempts();
  if (attemptTimestamps.length >= RATE_LIMIT_MAX) {
    const quota = getQuotaStatus();
    recordHealth('rate_limited_self', `Límite propio alcanzado, espera ${quota.retryAfterSeconds}s`);
    throw markRecorded(
      // Kept generic on purpose: this string could end up in front of a
      // visitor, and our own budget size / the reason for it are operational
      // details that shouldn't be advertised.
      new Error(
        `La verificación en tiempo real no está disponible en este momento. Intenta de nuevo en ${quota.retryAfterSeconds}s.`
      )
    );
  }
  attemptTimestamps.push(Date.now());

  await acquireSlot();
  let context;
  try {
    const browser = await getBrowser();
    context = await browser.newContext({
      viewport: { width: 1366, height: 900 },
      userAgent: USER_AGENT,
      locale: 'es-PE'
    });
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(45000);
    page.setDefaultTimeout(20000);
    await blockHeavyResources(page);

    await page.goto(URL_SUNAT, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    const inputSelector = await firstVisible(page, [
      'input[name="search1"]',
      'input[name="nroRuc"]',
      '#txtRuc',
      'input[type="text"][maxlength="11"]'
    ]);
    if (!inputSelector) {
      recordHealth('error', 'Search input field not found - possible SUNAT redesign');
      throw markRecorded(new Error('No se encontró el campo de búsqueda en la página de SUNAT (puede haber cambiado su HTML).'));
    }

    await page.fill(inputSelector, '');
    await page.type(inputSelector, ruc, { delay: 40 });

    const buttonSelector = await firstVisible(page, [
      'button:has-text("Buscar")',
      'input[value="Buscar"]',
      'button[type="submit"]'
    ]);
    if (buttonSelector) {
      await page.click(buttonSelector);
    } else {
      await page.press(inputSelector, 'Enter');
    }

    await page.waitForLoadState('domcontentloaded', { timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const bodyText = (await page.textContent('body')) || '';

    // Note: don't match on the word "captcha" alone - SUNAT's recaptcha3.js
    // script tag is present in body.textContent on every page load (success
    // or not), so a generic keyword match false-positives on every request.
    // "Request Rejected" is the actual WAF block page title we've observed.
    if (/Request Rejected/i.test(bodyText)) {
      recordHealth('blocked', 'WAF firewall rejection');
      throw markRecorded(new Error('SUNAT bloqueó la consulta (firewall) - intente más tarde.'));
    }

    // "Ingrese el código mostrado" is the classic image-captcha prompt that
    // SUNAT starts requiring after several queries in a short time window
    // (rate-limit/anti-abuse, observed 2026-07-23 after ~6 rapid live
    // requests). This is NOT "RUC not found" - the query never actually ran.
    if (/ingrese el c[oó]digo mostrado/i.test(bodyText)) {
      recordHealth('blocked', 'Image captcha required (rate-limited)');
      throw markRecorded(
        new Error(
          'SUNAT está pidiendo un código de seguridad visual tras varias consultas seguidas - esta verificación en vivo no puede resolver captchas, intente de nuevo en unos minutos.'
        )
      );
    }

    // "Resultado de la Búsqueda" is the results-page heading SUNAT shows
    // ONLY when a query actually ran and produced a result panel - it's
    // present whether the RUC is found or not is irrelevant here, what
    // matters is: did SUNAT even attempt to render a result at all?
    const reachedResultsPage = /Resultado de la B[uú]squeda/i.test(bodyText);

    if (!reachedResultsPage) {
      // Still on the plain search-criteria form (no error message, no
      // result heading) - happens both for a genuinely unregistered RUC
      // and for one that fails SUNAT's own check-digit validation. Treat
      // as "not found" rather than a scary error, since from the user's
      // side it's the same outcome.
      recordHealth('not_found', `RUC ${ruc} not found (or invalid format)`);
      return null;
    }

    const hasRucDetail = /N[uú]mero de RUC:/i.test(bodyText) && /Tipo Contribuyente:/i.test(bodyText);
    if (!hasRucDetail) {
      // We DID reach a results page (so the query ran and SUNAT rendered
      // something) but our known field labels don't match anything on it.
      // This is the "SUNAT redesigned their page" scenario specifically -
      // this is what the admin dashboard's health check exists to catch;
      // the *public* API still just reports "not found" for this (per
      // user decision 2026-07-23), it never surfaces this detail to visitors.
      recordHealth('error', 'Unrecognized results page - possible SUNAT redesign');
      throw markRecorded(
        new Error(
          'SUNAT devolvió una página de resultado que esta versión del scraper no reconoce (posible cambio de diseño en su portal) - revisar liveScraper.js, no asumir que el RUC no existe.'
        )
      );
    }

    const parsed = parseRucText(ruc, bodyText);
    recordHealth('ok', `RUC ${ruc} obtenido correctamente`);
    return parsed;
  } catch (err) {
    // Catch-all for anything not already recordHealth()'d above (navigation
    // timeouts, selector-not-found, browser launch failures, etc.) - the
    // explicit throw sites above tag their error with __healthRecorded so
    // this doesn't overwrite a more specific reason with a generic one.
    if (!err.__healthRecorded) {
      recordHealth('error', err.message);
    }
    throw err;
  } finally {
    if (context) await context.close().catch(() => {});
    releaseSlot();
  }
}

function markRecorded(err) {
  err.__healthRecorded = true;
  return err;
}

async function firstVisible(page, selectors) {
  for (const sel of selectors) {
    try {
      const el = await page.$(sel);
      if (el && (await el.isVisible())) return sel;
    } catch {
      // try next selector
    }
  }
  return null;
}

function rawField(text, label, stopLabels) {
  const idx = text.indexOf(label);
  if (idx === -1) return null;
  let end = text.length;
  for (const stop of stopLabels) {
    const stopIdx = text.indexOf(stop, idx + label.length);
    if (stopIdx !== -1 && stopIdx < end) end = stopIdx;
  }
  const value = text.slice(idx + label.length, end).trim();
  return value || null;
}

// Single-line fields: flatten all whitespace/newlines from SUNAT's table
// layout down to single spaces.
function field(text, label, stopLabels) {
  const raw = rawField(text, label, stopLabels);
  if (!raw) return null;
  const flat = raw.replace(/\s+/g, ' ').trim();
  return flat || null;
}

// Multi-item fields (actividad económica, comprobantes de pago): SUNAT
// renders each item on its own line, so split on newlines rather than
// flattening - flattening would glue separate items into one run of text.
function fieldList(text, label, stopLabels) {
  const raw = rawField(text, label, stopLabels);
  if (!raw) return null;
  const items = raw
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

// "Comprobantes Electrónicos:" is rendered by SUNAT as a single comma-joined
// line (e.g. "BOLETA (desde X),FACTURA (desde Y)") rather than one item per
// line like the other multi-item fields, so it needs comma-splitting instead
// of fieldList()'s newline-splitting.
function fieldCommaList(text, label, stopLabels) {
  const raw = rawField(text, label, stopLabels);
  if (!raw) return null;
  const items = raw
    .replace(/\s+/g, ' ')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

const ALL_LABELS = [
  'Tipo Contribuyente:',
  // Personas naturales get an extra "Tipo de Documento: DNI ..." row that
  // sits between Tipo Contribuyente and Nombre Comercial. Without it in this
  // stop-list, tipo_contribuyente bled into the person's DNI + full name
  // (observed live 2026-07-24 on RUC 10452159428). Used purely as a boundary -
  // we deliberately do NOT store the DNI.
  'Tipo de Documento:',
  'Nombre Comercial:',
  'Fecha de Inscripción:',
  'Fecha de Inicio de Actividades:',
  'Estado del Contribuyente:',
  'Condición del Contribuyente:',
  'Domicilio Fiscal:',
  'Sistema Emisión de Comprobante:',
  'Actividad Comercio Exterior:',
  'Sistema Contabilidad:',
  'Actividad(es) Económica(s):',
  'Comprobantes de Pago c/aut. de impresión (F. 806 u 816):',
  'Sistema de Emisión Electrónica:',
  'Emisor electrónico desde:',
  'Comprobantes Electrónicos:',
  'Afiliado al PLE desde:',
  'Padrones:',
  'Fecha consulta:'
];

function parseRucText(ruc, text) {
  const razonSocialMatch = text.match(/N[uú]mero de RUC:\s*\d{11}\s*-\s*(.+?)\s*Tipo Contribuyente:/i);

  return {
    ruc,
    razon_social: razonSocialMatch ? razonSocialMatch[1].trim() : null,
    tipo_contribuyente: field(text, 'Tipo Contribuyente:', ALL_LABELS),
    nombre_comercial: nullIfDash(field(text, 'Nombre Comercial:', ALL_LABELS)),
    fecha_inscripcion: field(text, 'Fecha de Inscripción:', ALL_LABELS),
    fecha_inicio_actividades: field(text, 'Fecha de Inicio de Actividades:', ALL_LABELS),
    estado: field(text, 'Estado del Contribuyente:', ALL_LABELS),
    condicion: field(text, 'Condición del Contribuyente:', ALL_LABELS),
    direccion: field(text, 'Domicilio Fiscal:', ALL_LABELS),
    sistema_emision: field(text, 'Sistema Emisión de Comprobante:', ALL_LABELS),
    comercio_exterior: field(text, 'Actividad Comercio Exterior:', ALL_LABELS),
    sistema_contabilidad: field(text, 'Sistema Contabilidad:', ALL_LABELS),
    actividad_economica: fieldList(text, 'Actividad(es) Económica(s):', ALL_LABELS),
    comprobantes_pago: fieldList(text, 'Comprobantes de Pago c/aut. de impresión (F. 806 u 816):', ALL_LABELS),
    sistema_emision_electronica: fieldList(text, 'Sistema de Emisión Electrónica:', ALL_LABELS),
    emisor_electronico_desde: nullIfDash(field(text, 'Emisor electrónico desde:', ALL_LABELS)),
    comprobantes_electronicos: fieldCommaList(text, 'Comprobantes Electrónicos:', ALL_LABELS),
    ple_desde: nullIfDash(field(text, 'Afiliado al PLE desde:', ALL_LABELS)),
    padrones: fieldList(text, 'Padrones:', ALL_LABELS),
    updated_at: new Date().toISOString()
  };
}

function nullIfDash(value) {
  return !value || value === '-' ? null : value;
}

export async function closeBrowser() {
  if (sharedBrowser) {
    await sharedBrowser.close().catch(() => {});
    sharedBrowser = null;
  }
}

/**
 * Runs a real scrape against a fixed, always-real RUC (SUNAT's own) purely
 * to answer "is the live API working right now" for the dashboard, without
 * needing to wait for organic user traffic to reveal a problem.
 */
const HEALTHCHECK_RUC = '20131312955'; // SUNAT's own RUC - always exists
export async function testLiveApi() {
  try {
    const data = await scrapeRucLive(HEALTHCHECK_RUC);
    if (data) return { ok: true, message: `OK - obtuvo datos de ${data.razon_social}` };
    return { ok: false, message: 'La consulta de prueba no encontró datos (inesperado para este RUC).' };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

process.on('exit', () => {
  if (sharedBrowser) sharedBrowser.close().catch(() => {});
});
