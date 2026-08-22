import type { APIRoute } from 'astro';
import { getByRuc, enqueueEnrichment } from '../../lib/db.js';
import { renderRucPage, renderRucNotFound } from '../../lib/renderRucPage.js';
import { apiLimiter } from '../../server/rateLimit.js';

export const GET: APIRoute = (context) => {
  const limited = apiLimiter(context);
  if (limited) return limited;

  const ruc = (context.params.ruc || '').trim();
  if (!/^\d{11}$/.test(ruc)) {
    return new Response(renderRucNotFound(ruc), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  const record = getByRuc(ruc);
  if (!record) {
    return new Response(renderRucNotFound(ruc), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  // Organic traffic doubles as the enrichment signal: if someone lands on a
  // thin page, queue it so the next visitor (and Googlebot) gets the full one.
  if (!record.tipoContribuyente) enqueueEnrichment(ruc);

  return new Response(renderRucPage(ruc, record), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
