import type { APIRoute } from 'astro';
import { getByRuc, searchByName, upsertRucRecord, enqueueEnrichment } from '../../../lib/db.js';
import { scrapeRucLive, getQuotaStatus } from '../../../lib/liveScraper.js';

// TODO(phase5): wire real apiGuard + rate limiting here (currently unguarded
// - do not deploy this route to production before Phase 5 lands).

function publicQuota() {
  const q = getQuotaStatus();
  return { available: q.remaining > 0, retryAfterSeconds: q.retryAfterSeconds };
}

export const GET: APIRoute = async ({ params, url }) => {
  const query = (params.query || '').trim();
  const wantsLive = url.searchParams.get('live') === 'true';

  if (!query) {
    return Response.json(
      { success: false, error: 'Debe ingresar un número de RUC de 11 dígitos o una razón social.' },
      { status: 400 }
    );
  }

  if (/^\d{11}$/.test(query)) {
    if (wantsLive) {
      let liveData = null;
      try {
        liveData = await scrapeRucLive(query);
      } catch (err: any) {
        console.error(`[Live Scraper Error] RUC ${query}:`, err.message);
      }

      const quota = publicQuota();

      if (liveData) {
        upsertRucRecord(liveData);
        const record = getByRuc(query);
        return Response.json({ success: true, found: true, source: 'live', data: record, quota });
      }

      // Nothing from the real-time path - fall back to what we already have
      // before giving up. Availability is always returned so the frontend can
      // show whether real-time verification can be used right now.
      const cached = getByRuc(query);
      if (cached) {
        return Response.json({ success: true, found: true, source: 'index', data: cached, quota });
      }

      return Response.json(
        {
          success: false,
          found: false,
          ruc: query,
          error: 'El RUC ingresado no se encuentra en el Padrón de la SUNAT.',
          quota
        },
        { status: 404 }
      );
    }

    const record = getByRuc(query);
    if (!record) {
      return Response.json(
        {
          success: false,
          found: false,
          ruc: query,
          error: 'El RUC ingresado no se encuentra en el Padrón de la SUNAT.'
        },
        { status: 404 }
      );
    }
    // Detail fields missing - queue it so the next visitor gets the full
    // record instantly (see enrichmentWorker.js).
    if (!record.tipoContribuyente) enqueueEnrichment(query);
    return Response.json({ success: true, found: true, source: 'index', data: record });
  }

  const results = searchByName(query, 25);
  if (results.length === 0) {
    return Response.json(
      { success: false, found: false, query, error: 'No se encontraron empresas coincidentes con ese nombre.' },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    found: true,
    source: 'index',
    query,
    total: results.length,
    data: results
  });
};
