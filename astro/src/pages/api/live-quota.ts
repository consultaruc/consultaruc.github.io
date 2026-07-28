import type { APIRoute } from 'astro';
import { getQuotaStatus } from '../../lib/liveScraper.js';

// TODO(phase5): wire real apiGuard + rate limiting here.

/**
 * Public availability of real-time verification.
 *
 * Deliberately returns only "can you use it right now, and if not for how
 * long" - NOT our internal budget size or window length. Those are
 * operational details about how we talk to the upstream source and are
 * exposed only on the authenticated admin endpoint.
 */
export const GET: APIRoute = () => {
  const q = getQuotaStatus();
  return Response.json({ available: q.remaining > 0, retryAfterSeconds: q.retryAfterSeconds });
};
