import { scrapeRucLive, getQuotaStatus, getHealth } from './liveScraper.js';
import {
  nextEnrichment,
  markEnrichmentDone,
  markEnrichmentFailed,
  upsertRucRecord,
  getEnrichStats
} from './db.js';

/**
 * Progressive enrichment worker.
 *
 * The bulk padrón ("padrón reducido") has no detail fields - tipo de
 * contribuyente, actividad económica, comprobantes, padrones, sistema de
 * emisión electrónica all only exist on SUNAT's live ficha. Rather than making
 * every visitor pay for a live check, we queue the RUCs people actually search
 * (see server.js) and fill them in here, slowly, in the background. Once a RUC
 * is enriched it is served instantly and completely from SQLite forever after.
 *
 * SAFETY - this is deliberately conservative, because our whole live-check
 * budget runs through one shared server IP:
 *  - Runs at most once every INTERVAL_MS (minutes, not seconds). SUNAT starts
 *    demanding an image captcha after roughly 6 rapid queries, so a "1 every
 *    few seconds" cadence would trip it almost immediately.
 *  - Shares the SAME rate-limit budget as user-initiated live checks
 *    (scrapeRucLive enforces it), and refuses to run unless there is spare
 *    quota above MIN_QUOTA_HEADROOM, so real visitors always get first claim.
 *  - Backs off entirely while SUNAT is blocking us.
 */
const INTERVAL_MS = 3 * 60 * 1000; // one RUC every 3 minutes, at most
const MIN_QUOTA_HEADROOM = 2; // always leave this many live checks for real users

let timer = null;
let running = false;

export async function tick() {
  if (running) return; // never overlap
  running = true;
  try {
    const quota = getQuotaStatus();
    if (quota.remaining <= MIN_QUOTA_HEADROOM) return;

    // If SUNAT just blocked or captcha'd us, stay off entirely this round.
    const health = getHealth();
    if (health.lastOutcome === 'blocked' || health.lastOutcome === 'rate_limited_self') return;

    const ruc = nextEnrichment();
    if (!ruc) return;

    try {
      const data = await scrapeRucLive(ruc);
      if (data) {
        upsertRucRecord(data);
        markEnrichmentDone(ruc);
        console.log(`[Enrich] ${ruc} enriquecido (${data.razon_social || 'sin nombre'})`);
      } else {
        // Genuinely not found at SUNAT - don't retry forever.
        markEnrichmentFailed(ruc, 'no encontrado en SUNAT');
      }
    } catch (err) {
      markEnrichmentFailed(ruc, err.message);
      console.warn(`[Enrich] ${ruc} falló: ${err.message}`);
    }
  } catch (err) {
    console.warn('[Enrich] tick error:', err.message);
  } finally {
    running = false;
  }
}

export function start() {
  if (timer) return;
  timer = setInterval(tick, INTERVAL_MS);
  if (timer.unref) timer.unref(); // never hold the process open
  const stats = getEnrichStats();
  console.log(
    `[Enrich] Worker activo: 1 RUC cada ${INTERVAL_MS / 60000} min ` +
      `(deja ${MIN_QUOTA_HEADROOM} consultas libres para visitantes). ` +
      `Pendientes: ${stats.pending}, enriquecidos: ${stats.enriched}`
  );
}

export function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}
