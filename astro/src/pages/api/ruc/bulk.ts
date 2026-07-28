import type { APIRoute } from 'astro';
import { getByRuc } from '../../../lib/db.js';
import { apiLimiter } from '../../../server/rateLimit.js';
import { apiGuard } from '../../../server/apiGuard.js';

/**
 * Bulk RUC verification (for accountants/gestores checking many vendors at
 * once). Deliberately queries ONLY the local database, never the live
 * scraper - a 200-RUC batch would instantly exhaust the shared live-check
 * quota (4 per 10 min) and likely trip SUNAT's own rate limiter.
 */
const MAX_BULK_RUCS = 200;

export const POST: APIRoute = async (context) => {
  const limited = apiLimiter(context);
  if (limited) return limited;
  const guarded = apiGuard(context, context.locals.session);
  if (guarded) return guarded;

  const { request } = context;
  const body = await request.json().catch(() => ({}));
  const input = Array.isArray(body?.rucs) ? body.rucs : [];

  const cleaned = [...new Set(input.map((r: unknown) => String(r).trim()))]
    .filter((r): r is string => /^\d{11}$/.test(r))
    .slice(0, MAX_BULK_RUCS);

  if (cleaned.length === 0) {
    return Response.json(
      { success: false, error: 'No se encontraron números de RUC válidos (11 dígitos) en la lista.' },
      { status: 400 }
    );
  }

  const results = cleaned.map((ruc) => {
    const record = getByRuc(ruc);
    return record
      ? { ruc, found: true, razonSocial: record.razonSocial, estado: record.estado, condicion: record.condicion }
      : { ruc, found: false, razonSocial: null, estado: null, condicion: null };
  });

  return Response.json({
    success: true,
    total: results.length,
    truncated: input.length > MAX_BULK_RUCS,
    maxPerRequest: MAX_BULK_RUCS,
    results
  });
};
