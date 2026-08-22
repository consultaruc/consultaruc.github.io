import type { APIRoute } from 'astro';
import { getSearchedRucsForSitemap } from '../lib/db.js';
import { siteOrigin, escapeHtml } from '../lib/renderRucPage.js';

/**
 * Sitemap de fichas de RUC — sólo las que alguien buscó de verdad.
 *
 * No es el relleno que se quitó en su día: aquello metía RUC al azar, sin
 * enriquecer, hasta llegar a mil URLs, y eso sí se lee como granja de
 * contenido. Aquí la lista sale de `ruc_search`, así que cada URL responde a
 * una búsqueda real, y además se exige que la ficha tenga domicilio fiscal
 * (el mismo umbral con el que renderRucPage.js decide no poner noindex): una
 * ficha sin datos propios no entra aunque la hayan buscado.
 *
 * Va aparte del sitemap-index que genera @astrojs/sitemap porque aquella lista
 * se compila en el build y ésta cambia con cada búsqueda. robots.txt anuncia
 * los dos; Google admite varias directivas Sitemap.
 *
 * No se prerenderiza, por lo mismo.
 */
export const prerender = false;

// Tope deliberado. Aunque el sitio reciba muchas búsquedas, lo que se ofrece a
// indexar se queda en un tamaño que se puede revisar a mano; el orden es por
// número de búsquedas, así que lo que entra es lo más pedido.
const MAX_URLS = 500;

export const GET: APIRoute = () => {
  const origin = siteOrigin();
  const rows = getSearchedRucsForSitemap(MAX_URLS);

  const urls = rows.map((r: { ruc: string; lastTs: number }) => {
    const loc = escapeHtml(`${origin}/ruc/${r.ruc}`);
    const lastmod = new Date(Number(r.lastTs)).toISOString().slice(0, 10);
    // changefreq/priority se omiten a propósito: Google los ignora, y un
    // lastmod real (la última búsqueda) sí lo usa.
    return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
  });

  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.join('\n') +
      (urls.length ? '\n' : '') +
      '</urlset>',
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        // Se recalcula con cada búsqueda, pero no hace falta que el crawler lo
        // pida fresco cada vez.
        'Cache-Control': 'public, max-age=3600'
      }
    }
  );
};
