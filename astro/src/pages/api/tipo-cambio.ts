import type { APIRoute } from 'astro';
import { getLatestTipoCambio, getRecentTipoCambio } from '../../lib/db.js';
import { apiLimiter } from '../../server/rateLimit.js';
import { apiGuard } from '../../server/apiGuard.js';

/**
 * Tipo de cambio SUNAT - always served from our own daily-synced cache
 * (tipoCambioSync.js, run once a day via cron), never scraped live per
 * request.
 */
export const GET: APIRoute = (context) => {
  const limited = apiLimiter(context);
  if (limited) return limited;
  const guarded = apiGuard(context, context.locals.session);
  if (guarded) return guarded;

  const latest = getLatestTipoCambio();
  if (!latest) {
    return Response.json(
      { success: false, error: 'El tipo de cambio aún no ha sido sincronizado. Intenta más tarde.' },
      { status: 503 }
    );
  }
  const historial = getRecentTipoCambio(30);
  return Response.json({ success: true, fecha: latest.fecha, compra: latest.compra, venta: latest.venta, historial });
};
