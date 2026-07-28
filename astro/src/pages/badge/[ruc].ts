import type { APIRoute } from 'astro';
import { getByRuc } from '../../lib/db.js';
import { renderBadgeHtml, siteOrigin } from '../../lib/renderRucPage.js';

// TODO(phase5): wire real apiLimiter here (deliberately NO apiGuard - this
// route must stay embeddable cross-origin, see server.js's original comment).

/**
 * Embeddable "Verificado" badge (see /sello-verificado/). This is the one
 * route on the whole site that MUST be embeddable in an <iframe> on a
 * third-party business's own domain - the opposite of every other page,
 * which the global security-headers middleware (Phase 5) blocks from
 * framing to prevent clickjacking. Overrides both headers for just this route.
 */
export const GET: APIRoute = ({ params, url }) => {
  const ruc = (params.ruc || '').trim();
  const record = /^\d{11}$/.test(ruc) ? getByRuc(ruc) : null;
  const theme = url.searchParams.get('theme') === 'dark' ? 'dark' : 'light';

  return new Response(renderBadgeHtml(ruc, record, theme, siteOrigin()), {
    headers: {
      'Content-Type': 'text/html',
      'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors *;",
      'Cross-Origin-Resource-Policy': 'cross-origin'
      // Deliberately no X-Frame-Header set at all here (equivalent to the
      // original's res.removeHeader('X-Frame-Options')) - Phase 5's security
      // middleware must not add X-Frame-Options/frame-ancestors back for
      // this specific route.
    }
  });
};
