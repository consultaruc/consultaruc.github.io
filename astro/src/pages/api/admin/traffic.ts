import type { APIRoute } from 'astro';
import { getTrafficStats, getSearchStats } from '../../../lib/db.js';
import { requireAuth } from '../../../server/requireAuth.js';

/**
 * Analítica propia para el panel. Separada de /api/admin/health porque health
 * se refresca cada 30 s y esto agrega sobre toda la tabla de visitas: no hace
 * falta pagar ese coste tan seguido, y así el panel puede pedir otra ventana
 * sin recargar el resto.
 */
export const GET: APIRoute = (context) => {
  const denied = requireAuth(context, context.locals.session);
  if (denied) return denied;

  const raw = Number(new URL(context.request.url).searchParams.get('hours'));
  // Se acota a las ventanas que ofrece el panel: un valor arbitrario en la URL
  // podría pedir una agregación enorme sobre la tabla.
  const hours = [24, 168, 720, 2160].includes(raw) ? raw : 720;

  // Las búsquedas viajan con el tráfico porque comparten ventana: el panel
  // pinta ambas cosas al cambiar de rango, y así es una sola petición.
  return Response.json({
    ...getTrafficStats(hours),
    searches: getSearchStats(hours)
  });
};
