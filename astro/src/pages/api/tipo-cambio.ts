import type { APIRoute } from 'astro';
import { getLatestTipoCambio, getRecentTipoCambio } from '../../lib/db.js';

// TODO(phase5): wire real apiGuard + rate limiting here.

/**
 * Tipo de cambio SUNAT - always served from our own daily-synced cache
 * (tipoCambioSync.js, run once a day via cron), never scraped live per
 * request.
 */
export const GET: APIRoute = () => {
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
