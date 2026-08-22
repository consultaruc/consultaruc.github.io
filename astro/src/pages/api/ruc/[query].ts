import type { APIRoute } from 'astro';
import { getByRuc, searchByName, upsertRucRecord, enqueueEnrichment, recordRucSearch } from '../../../lib/db.js';
import { scrapeRucLive, getQuotaStatus } from '../../../lib/liveScraper.js';
import { apiLimiter } from '../../../server/rateLimit.js';
import { apiGuard } from '../../../server/apiGuard.js';

function publicQuota() {
  const q = getQuotaStatus();
  return { available: q.remaining > 0, retryAfterSeconds: q.retryAfterSeconds };
}

/**
 * Desde qué página se lanzó la búsqueda. El Referer sirve porque apiGuard ya
 * lo ha validado como propio antes de llegar aquí, así que no es un dato que
 * pueda venir de cualquier sitio. Sólo se guarda la ruta, nunca la URL entera
 * (podría llevar parámetros) ni nada del visitante.
 */
function originPath(context: { request: Request }) {
  const ref = context.request.headers.get('referer');
  if (!ref) return '/';
  try {
    return new URL(ref).pathname.slice(0, 300);
  } catch {
    return '/';
  }
}

export const GET: APIRoute = async (context) => {
  const limited = apiLimiter(context);
  if (limited) return limited;
  const guarded = apiGuard(context, context.locals.session);
  if (guarded) return guarded;

  const { params, url } = context;
  const query = (params.query || '').trim();
  const wantsLive = url.searchParams.get('live') === 'true';

  if (!query) {
    return Response.json(
      { success: false, error: 'Debe ingresar un número de RUC de 11 dígitos o una razón social.' },
      { status: 400 }
    );
  }

  if (/^\d{11}$/.test(query)) {
    // La página de origen se resuelve una vez; cada salida registra luego si
    // el RUC se encontró o no, que es lo que distingue una búsqueda útil de
    // un RUC inventado.
    const from = originPath(context);

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
        recordRucSearch(query, from, true);
        const record = getByRuc(query);
        return Response.json({ success: true, found: true, source: 'live', data: record, quota });
      }

      // Nothing from the real-time path - fall back to what we already have
      // before giving up. Availability is always returned so the frontend can
      // show whether real-time verification can be used right now.
      const cached = getByRuc(query);
      recordRucSearch(query, from, !!cached);
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
    recordRucSearch(query, from, !!record);
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
