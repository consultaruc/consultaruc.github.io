import type { APIRoute } from 'astro';
import { siteOrigin } from '../lib/renderRucPage.js';
import { buildLlmsTxt } from '../lib/pageMeta.js';

export const GET: APIRoute = () => {
  return new Response(buildLlmsTxt(siteOrigin()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
