import type { APIRoute } from 'astro';
import { siteOrigin } from '../lib/renderRucPage.js';
import { buildAiTxt } from '../lib/pageMeta.js';

export const GET: APIRoute = () => {
  return new Response(buildAiTxt(siteOrigin()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
