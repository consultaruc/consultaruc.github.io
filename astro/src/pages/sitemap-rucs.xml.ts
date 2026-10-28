import type { APIRoute } from 'astro';
import { getSearchedRucsForSitemap, getByRuc } from '../lib/db.js';
import { siteOrigin, escapeHtml } from '../lib/renderRucPage.js';
import { CURATED_RUCS, MIN_SEARCH_DAYS } from '../lib/indexableRucs.js';

/**
 * Sitemap de fichas de RUC — exactamente las que isIndexableRuc() deja
 * indexar, ni una más: el directorio curado y las fichas con demanda sostenida.
 *
 * No es el relleno que se quitó en su día: aquello metía RUC al azar, sin
 * enriquecer, hasta llegar a mil URLs, y eso sí se lee como granja de
 * contenido. Las fichas buscadas salen de `ruc_search` con el mismo umbral que
 * decide el noindex, así que nada de lo que se ofrece aquí lo lleva.
 *
 * Va aparte del sitemap-index que genera @astrojs/sitemap porque aquella lista
 * se compila en el build y ésta cambia con cada búsqueda. Tenerlo separado
 * también da en Search Console un informe de indexación propio para las
 * fichas. robots.txt anuncia los dos; Google admite varias directivas Sitemap.
 *
 * No se prerenderiza, por lo mismo.
 */
export const prerender = false;

// Tope deliberado. Aunque el sitio reciba muchas búsquedas, lo que se ofrece a
// indexar se queda en un tamaño que se puede revisar a mano; el orden es por
// número de búsquedas, así que lo que entra es lo más pedido.
const MAX_SEARCHED_URLS = 300;

export const GET: APIRoute = () => {
  const origin = siteOrigin();
  const entry = (ruc: string, lastTs?: number) =>
    `  <url><loc>${escapeHtml(`${origin}/ruc/${ruc}`)}</loc>` +
    // changefreq/priority se omiten a propósito: Google los ignora, y un
    // lastmod real (la última búsqueda) sí lo usa. Las curadas no tienen
    // fecha propia, y un lastmod inventado es peor que ninguno.
    (lastTs ? `<lastmod>${new Date(Number(lastTs)).toISOString().slice(0, 10)}</lastmod>` : '') +
    '</url>';

  // Sólo las curadas que existen en la base: una URL que da 404 no pinta nada
  // en un sitemap.
  const curated = [...CURATED_RUCS].filter((ruc) => getByRuc(ruc)).map((ruc) => entry(ruc));
  const searched = getSearchedRucsForSitemap(MAX_SEARCHED_URLS, MIN_SEARCH_DAYS)
    .filter((r: { ruc: string }) => !CURATED_RUCS.has(r.ruc))
    .map((r: { ruc: string; lastTs: number }) => entry(r.ruc, r.lastTs));
  const urls = [...curated, ...searched];

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
