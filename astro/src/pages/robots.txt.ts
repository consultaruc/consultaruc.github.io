import type { APIRoute } from 'astro';
import { siteOrigin } from '../lib/renderRucPage.js';

/**
 * Se prerenderiza: el contenido no depende de la petición, así que se genera
 * una vez en el build y el adapter lo sirve como fichero estático, sin pasar
 * por SSR ni por el middleware en cada visita.
 *
 * Sigue sin ser un fichero suelto en public/ porque la directiva Sitemap
 * necesita URL absoluta, y esa sale de un solo sitio (`site` en
 * astro.config.mjs, vía siteOrigin()).
 *
 * Los Disallow se quedan deliberadamente amplios: robots.txt lo lee cualquiera,
 * y enumerar endpoints internos ahí sería regalar un mapa de reconocimiento.
 */
export const prerender = true;

export const GET: APIRoute = () => {
  const o = siteOrigin();
  return new Response(
    'User-agent: *\n' +
      'Allow: /\n' +
      'Disallow: /admin/\n' +
      'Disallow: /api/\n' +
      'Disallow: /badge/\n' +
      'Disallow: /*?print=1\n\n' +
      '# AI/LLM crawlers welcome (with attribution) — see the policy files\n' +
      `Sitemap: ${o}/sitemap-index.xml\n` +
      `# ${o}/llms.txt · ${o}/ai.txt\n`,
    { headers: { 'Content-Type': 'text/plain' } }
  );
};
