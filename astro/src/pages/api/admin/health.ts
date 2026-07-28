import type { APIRoute } from 'astro';
import { countRecords, getLastSyncTime, getEnrichStats } from '../../../lib/db.js';
import { getHealth, getQuotaStatus } from '../../../lib/liveScraper.js';
import { requireAuth } from '../../../server/requireAuth.js';

export const GET: APIRoute = (context) => {
  const denied = requireAuth(context, context.locals.session);
  if (denied) return denied;

  return Response.json({
    liveApi: getHealth(),
    quota: getQuotaStatus(),
    dbCount: countRecords(),
    lastSyncAt: getLastSyncTime(),
    enrichment: getEnrichStats()
  });
};
