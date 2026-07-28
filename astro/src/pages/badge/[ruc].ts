import type { APIRoute } from 'astro';
import { getByRuc } from '../../lib/db.js';
import { renderBadgeHtml, siteOrigin } from '../../lib/renderRucPage.js';
import { apiLimiter } from '../../server/rateLimit.js';

/**
 * Embeddable "Verificado" badge (see /sello-verificado/). This is the one
 * route on the whole site that MUST be embeddable in an <iframe> on a
 * third-party business's own domain - the opposite of every other page,
 * which the global security-headers middleware blocks from framing to
 * prevent clickjacking. Overrides both headers for just this route.
 * Deliberately NO apiGuard() call here - see server.js's original comment.
 */
export const GET: APIRoute = (context) => {
  const limited = apiLimiter(context);
  if (limited) return limited;

  const { params, url } = context;
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
