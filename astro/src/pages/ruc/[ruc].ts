import type { APIRoute } from 'astro';
import { getByRuc, enqueueEnrichment } from '../../lib/db.js';
import { renderRucPage, renderRucNotFound } from '../../lib/renderRucPage.js';

// TODO(phase5): wire real apiLimiter here.

export const GET: APIRoute = ({ params }) => {
  const ruc = (params.ruc || '').trim();
  if (!/^\d{11}$/.test(ruc)) {
    return new Response(renderRucNotFound(ruc), { status: 404, headers: { 'Content-Type': 'text/html' } });
  }

  const record = getByRuc(ruc);
  if (!record) {
    return new Response(renderRucNotFound(ruc), { status: 404, headers: { 'Content-Type': 'text/html' } });
  }

  // Organic traffic doubles as the enrichment signal: if someone lands on a
  // thin page, queue it so the next visitor (and Googlebot) gets the full one.
  if (!record.tipoContribuyente) enqueueEnrichment(ruc);

  return new Response(renderRucPage(ruc, record), { headers: { 'Content-Type': 'text/html' } });
};
