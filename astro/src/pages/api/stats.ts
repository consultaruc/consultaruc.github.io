import type { APIRoute } from 'astro';
import { countRecords } from '../../lib/db.js';

// TODO(phase5): wire real apiGuard + rate limiting here.

// Public: total indexed RUC record count, shown as the header stat counter
// site-wide (site.js fetches this on every page load).
export const GET: APIRoute = () => {
  return Response.json({ success: true, count: countRecords() });
};
