import type { APIRoute } from 'astro';
import { countRecords } from '../../lib/db.js';
import { apiLimiter } from '../../server/rateLimit.js';
import { apiGuard } from '../../server/apiGuard.js';

// Public: total indexed RUC record count, shown as the header stat counter
// site-wide (site.js fetches this on every page load).
export const GET: APIRoute = (context) => {
  const limited = apiLimiter(context);
  if (limited) return limited;
  const guarded = apiGuard(context, context.locals.session);
  if (guarded) return guarded;

  return Response.json({ success: true, count: countRecords() });
};
