import type { APIContext } from 'astro';

// In-memory sliding-window rate limiter - Astro's Web-standard Request model
// has no direct express-rate-limit equivalent, so this is new code, but the
// shape mirrors a pattern the codebase already uses once for real (see
// liveScraper.js's own self-imposed SUNAT rate limit).
//
// Behind cPanel's reverse proxy, context.clientAddress is always 127.0.0.1
// (the proxy's loopback socket), not the visitor's IP - the same reason the
// original app needed `app.set('trust proxy', 1)`. X-Forwarded-Host is set by
// deploy/public_html.htaccess; the visitor IP arrives as X-Forwarded-For.
function clientIp(context: APIContext): string {
  const fwd = context.request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return context.clientAddress || 'unknown';
}

interface Bucket {
  hits: number[];
}

function prune(bucket: Bucket, cutoff: number) {
  bucket.hits = bucket.hits.filter((t) => t > cutoff);
}

function getBucket(buckets: Map<string, Bucket>, key: string): Bucket {
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  return bucket;
}

/**
 * Standard limiter: every call both checks AND counts as a hit, matching
 * express-rate-limit's default (no skipSuccessfulRequests) - used for the
 * public API routes (apiLimiter, 60/min in the original).
 */
function makeLimiter(windowMs: number, max: number, message: string) {
  const buckets = new Map<string, Bucket>();
  return function check(context: APIContext): Response | null {
    const key = clientIp(context);
    const bucket = getBucket(buckets, key);
    prune(bucket, Date.now() - windowMs);
    if (bucket.hits.length >= max) {
      return Response.json({ success: false, error: message }, { status: 429 });
    }
    bucket.hits.push(Date.now());
    return null;
  };
}

/**
 * skipSuccessfulRequests limiter: checking never itself counts as a hit -
 * the caller must explicitly call recordFailure() after a failed attempt.
 * Matches the original loginLimiter (5 failed attempts / 15 min).
 */
function makeFailureLimiter(windowMs: number, max: number, message: string) {
  const buckets = new Map<string, Bucket>();
  return {
    check(context: APIContext): Response | null {
      const bucket = getBucket(buckets, clientIp(context));
      prune(bucket, Date.now() - windowMs);
      if (bucket.hits.length >= max) {
        return Response.json({ success: false, error: message }, { status: 429 });
      }
      return null;
    },
    recordFailure(context: APIContext) {
      const bucket = getBucket(buckets, clientIp(context));
      bucket.hits.push(Date.now());
    }
  };
}

export const apiLimiter = makeLimiter(60 * 1000, 60, 'Demasiadas solicitudes. Intente de nuevo en un minuto.');
export const loginLimiter = makeFailureLimiter(
  15 * 60 * 1000,
  5,
  'Demasiados intentos. Intente de nuevo en 15 minutos.'
);
