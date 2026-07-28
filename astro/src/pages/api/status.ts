import type { APIRoute } from 'astro';
import { countRecords } from '../../lib/db.js';

// TODO(phase5): wire real apiGuard + rate limiting here.

export const GET: APIRoute = () => {
  return Response.json({ totalRucRegistrados: countRecords() });
};
