import type { APIRoute } from 'astro';
import { siteOrigin } from '../lib/renderRucPage.js';
import { buildLlmsTxt } from '../lib/pageMeta.js';

// Prerenderizado por lo mismo que robots.txt: el contenido no depende de la
// petición, así que se genera en el build y se sirve como estático.
export const prerender = true;

export const GET: APIRoute = () => {
  return new Response(buildLlmsTxt(siteOrigin()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
