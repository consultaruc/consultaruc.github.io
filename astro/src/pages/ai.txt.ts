import type { APIRoute } from 'astro';
import { siteOrigin } from '../lib/renderRucPage.js';
import { buildAiTxt } from '../lib/pageMeta.js';

// Prerenderizado por lo mismo que robots.txt: contenido fijo, generado en el
// build y servido como estático.
export const prerender = true;

export const GET: APIRoute = () => {
  return new Response(buildAiTxt(siteOrigin()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
