// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { STATIC_PAGES, TOOL_SLUGS, GUIDE_SLUGS, PAGE_IMG } from './src/lib/pageMeta.js';

const SITE = 'https://consultaruc-pe.com';

// Las 19 páginas estáticas, como URL absoluta y con la barra final que sirve
// el sitio. Es la lista blanca del sitemap: lo que no esté aquí, no entra.
const PUBLIC_URLS = new Map(
  STATIC_PAGES.map((slug) => [`${SITE}/${slug}${slug ? '/' : ''}`, slug])
);

// Prioridad y frecuencia por tipo de página, para que el crawler gaste
// presupuesto donde importa: home > herramientas > guías > legal/info.
function tier(slug) {
  if (slug === '') return { priority: 1.0, changefreq: 'daily' };
  if (TOOL_SLUGS.has(slug)) return { priority: 0.9, changefreq: 'weekly' };
  if (GUIDE_SLUGS.has(slug)) return { priority: 0.8, changefreq: 'monthly' };
  return { priority: 0.4, changefreq: 'yearly' };
}

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'server',
  adapter: node({ mode: 'standalone' }),

  integrations: [
    sitemap({
      // Lista blanca, no lista negra. Con `output: 'server'` el generador ve
      // todas las rutas del build, incluidas /api/*, /admin/*, /badge/[ruc] y
      // /ruc/[ruc]; excluir "lo que no queremos" a mano obligaría a acordarse
      // de actualizar esto cada vez que se añade un endpoint. Al revés no: una
      // ruta nueva no aparece en el sitemap hasta que se la añade
      // explícitamente a pageMeta.js.
      //
      // En particular esto mantiene FUERA las fichas /ruc/:ruc, que es una
      // decisión tomada y desplegada a propósito: publicar millones de páginas
      // finas quema presupuesto de rastreo y marca el dominio como de baja
      // calidad. No reintroducir un bucle de RUC aquí.
      filter: (page) => PUBLIC_URLS.has(page),

      serialize: (item) => {
        const slug = PUBLIC_URLS.get(item.url);
        if (slug === undefined) return item;

        const { priority, changefreq } = tier(slug);
        item.priority = priority;
        item.changefreq = /** @type {any} */ (changefreq);

        // Sitemap de imágenes: el paquete `sitemap` que hay debajo entiende
        // `img`, así que se conserva lo que ya publicaba el sitemap escrito a
        // mano en vez de perderlo al pasar a la integración oficial.
        const img = /** @type {Record<string, string>} */ (PAGE_IMG)[slug];
        if (img) item.img = [{ url: `${SITE}${img}` }];

        return item;
      }
    })
  ],

  vite: {
    ssr: {
      external: ['node:sqlite', 'playwright', 'bcryptjs', 'adm-zip', 'sharp']
    }
  }
});
