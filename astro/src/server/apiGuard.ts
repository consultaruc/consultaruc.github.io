import type { APIContext } from 'astro';
import type { Session } from './session.js';

// --- Anti-reuse gate for the public data API ---------------------------------
// Ported verbatim (same logic, same header names) from server.js's
// hostOf/requestHost/apiGuard - see that file's original comments for the
// full rationale. The API is meant to be called ONLY by this site's own
// frontend, never by a third party embedding it or scraping it from a server.

function hostOf(u: string | null): string | null {
  if (!u) return null;
  try {
    return new URL(u).host;
  } catch {
    return null;
  }
}

/**
 * The host this request was ADDRESSED to by the visitor's browser.
 *
 * In production the app sits behind LiteSpeed on cPanel, which reverse-proxies
 * to 127.0.0.1:PORT - so `Host` arrives as "127.0.0.1:<port>" while Origin and
 * Referer still carry the real domain. X-Forwarded-Host is set by the proxy in
 * public_html/.htaccess; falling back to SITE_URL's host covers a proxy that
 * forwards nothing, and only then do we trust the raw Host header.
 */
export function requestHost(context: APIContext): string | null {
  const fwd = context.request.headers.get('x-forwarded-host');
  if (fwd) return fwd.split(',')[0].trim();
  if (process.env.SITE_URL) {
    const h = hostOf(process.env.SITE_URL);
    if (h) return h;
  }
  return context.request.headers.get('host');
}

/**
 * Returns a 403 Response when the caller fails all three checks, or null to
 * let the request proceed.
 */
export function apiGuard(context: APIContext, session: Session): Response | null {
  const self = requestHost(context);
  const origin = context.request.headers.get('origin');
  const referer = context.request.headers.get('referer');
  const token = context.request.headers.get('x-api-token');
  const originOk = origin ? hostOf(origin) === self : false;
  const refererOk = referer ? hostOf(referer) === self : false;
  const tokenOk = !!(token && session.data.apiToken && token === session.data.apiToken);
  if (originOk || refererOk || tokenOk) return null;
  return Response.json({ success: false, error: 'Origen no autorizado.' }, { status: 403 });
}
