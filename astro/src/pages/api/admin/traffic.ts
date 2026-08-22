import type { APIRoute } from 'astro';
import { getTrafficStats } from '../../../lib/db.js';
import { requireAuth } from '../../../server/requireAuth.js';

/**
 * Analítica propia para el panel. Separada de /api/admin/health porque health
 * se refresca cada 30 s y esto agrega sobre toda la tabla de visitas: no hace
 * falta pagar ese coste tan seguido, y así el panel puede pedir un rango
 * distinto (7/30/90 días) sin recargar lo demás.
 */
export const GET: APIRoute = (context) => {
  const denied = requireAuth(context, context.locals.session);
  if (denied) return denied;

  const raw = Number(new URL(context.request.url).searchParams.get('days'));
  // Se acota a los rangos que ofrece el panel: un `days` arbitrario en la URL
  // podría pedir una agregación enorme sobre la tabla.
  const days = [7, 30, 90].includes(raw) ? raw : 30;

  return Response.json(getTrafficStats(days));
};
