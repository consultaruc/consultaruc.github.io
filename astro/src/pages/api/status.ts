import type { APIRoute } from 'astro';
import { countRecords } from '../../lib/db.js';
import { apiLimiter } from '../../server/rateLimit.js';
import { apiGuard } from '../../server/apiGuard.js';

export const GET: APIRoute = (context) => {
  const limited = apiLimiter(context);
  if (limited) return limited;
  const guarded = apiGuard(context, context.locals.session);
  if (guarded) return guarded;

  return Response.json({ totalRucRegistrados: countRecords() });
};
