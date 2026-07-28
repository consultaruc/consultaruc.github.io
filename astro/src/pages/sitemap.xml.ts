import type { APIRoute } from 'astro';
import { siteOrigin } from '../lib/renderRucPage.js';

/**
 * El sitemap ya no se escribe a mano aquí: lo genera @astrojs/sitemap en el
 * build, como `sitemap-index.xml` + `sitemap-0.xml` (ver astro.config.mjs,
 * donde viven la lista blanca de páginas y los tiers de priority/changefreq).
 *
 * Esta ruta se queda como redirección permanente porque /sitemap.xml es la URL
 * que ya está dada de alta en Google Search Console y la que apuntaba el
 * robots.txt anterior: Google sigue las redirecciones de sitemaps, así que
 * borrarla sin más habría dejado esa alta apuntando a un 404.
 *
 * Sigue SIN listar fichas /ruc/:ruc - esa decisión ahora vive en el `filter`
 * de astro.config.mjs. No reintroducir un bucle de RUC en ninguno de los dos.
 */
export const GET: APIRoute = () => {
  return new Response(null, {
    status: 301,
    headers: { Location: `${siteOrigin()}/sitemap-index.xml` }
  });
};
