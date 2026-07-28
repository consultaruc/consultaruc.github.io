import type { APIRoute } from 'astro';
import { downloadAndProcessDump } from '../../lib/bulkDownloader.js';
import { requireAuth } from '../../server/requireAuth.js';

/**
 * Triggers a full re-download + re-ingest of both SUNAT padrón files.
 * Intended to be called from a daily cron job, not on every request.
 * requireAuth: this is an expensive, disruptive operation (wipes and
 * reloads the whole DB) - admin-session only.
 */
export const POST: APIRoute = (context) => {
  const denied = requireAuth(context, context.locals.session);
  if (denied) return denied;

  downloadAndProcessDump().catch((err) => {
    console.error('[Bulk Sync Error]:', err.message);
  });
  return Response.json({ message: 'Sincronización masiva de SUNAT iniciada en segundo plano.' });
};
