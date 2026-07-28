// Astro-native replacement for helmet(). Ports both the customized CSP
// directives AND helmet's own defaults (which the original app got for free
// from helmet() without listing them explicitly) - both halves matter for
// parity, not just the parts server.js customized.

const CSP =
  "default-src 'self'; " +
  // Existing pages use inline <script>/<style> blocks - a stricter
  // nonce-based CSP is a further hardening step, but 'unsafe-inline' here
  // still blocks any externally-injected/foreign-origin script.
  // Cloudflare Web Analytics beacon is allow-listed explicitly.
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; " +
  // Async font links use onload="this.media='all'" to swap a non-blocking
  // print stylesheet to all - needs inline event-handler attributes allowed.
  "script-src-attr 'unsafe-inline'; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com data:; " +
  "img-src 'self' data:; " +
  "connect-src 'self' https://cloudflareinsights.com; " +
  "object-src 'none'; " +
  "frame-ancestors 'none'";

export function applySecurityHeaders(headers: Headers) {
  headers.set('Content-Security-Policy', CSP);
  // helmet() defaults (not customized in the original config, but applied by
  // every helmet() call unless a sub-middleware is explicitly disabled):
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.set('Origin-Agent-Cluster', '?1');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-DNS-Prefetch-Control', 'off');
  headers.set('X-Download-Options', 'noopen');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  headers.set('X-XSS-Protection', '0');
  // hidePoweredBy: Astro/Node don't add X-Powered-By by default, but delete
  // it defensively in case an adapter/middleware upstream ever adds one.
  headers.delete('X-Powered-By');
}
