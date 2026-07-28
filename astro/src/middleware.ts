import { defineMiddleware } from 'astro:middleware';
import crypto from 'node:crypto';
import { getSession, saveSession } from './server/session.js';
import { applySecurityHeaders } from './server/securityHeaders.js';

// --- Process-lifecycle boot (equivalent of server.js's bottom section) -----
// Astro's standalone-adapter entry is generated, not hand-written, so there's
// no single obvious "app.js" file to put one-time startup code in. Astro
// guarantees this middleware module is imported exactly once per server
// process (not per-request), making it the natural place for the same
// boot-once side effects server.js had at the bottom of the file: seed the DB
// if empty, start the enrichment worker, and register shutdown hooks that
// close the shared Playwright browser cleanly.
let booted = false;
async function bootOnce() {
  if (booted) return;
  booted = true;

  const { countRecords } = await import('./lib/db.js');
  const { seed } = await import('./lib/seedData.js');
  if (countRecords() === 0) seed();

  const enrichmentWorker = await import('./lib/enrichmentWorker.js');
  enrichmentWorker.start();

  const { closeBrowser } = await import('./lib/liveScraper.js');
  const shutdown = async () => {
    enrichmentWorker.stop();
    await closeBrowser();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export const onRequest = defineMiddleware(async (context, next) => {
  await bootOnce();

  const session = getSession(context);
  context.locals.session = session;

  // Hand every real page load a per-session token, mirrored into a readable
  // (non-httpOnly), same-site cookie so the frontend JS can echo it back.
  // Only issued for HTML navigations, never for API/badge requests - same
  // condition as the original server.js middleware.
  const accept = context.request.headers.get('accept') || '';
  const pathname = new URL(context.request.url).pathname;
  const wantsHtml = context.request.method === 'GET' && accept.includes('text/html');
  const isBadge = pathname.startsWith('/badge');
  if (wantsHtml && !pathname.startsWith('/api') && !isBadge) {
    if (!session.data.apiToken) {
      session.data.apiToken = crypto.randomBytes(24).toString('hex');
    }
    saveSession(context, session);
    context.cookies.set('ctok', session.data.apiToken, {
      httpOnly: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60,
      path: '/'
    });
  }

  const response = await next();

  // The badge route sets its own permissive CSP/frame headers (it's the one
  // deliberate exception - see src/pages/badge/[ruc].ts) - don't clobber them.
  if (!isBadge) {
    applySecurityHeaders(response.headers);
  }

  return response;
});
