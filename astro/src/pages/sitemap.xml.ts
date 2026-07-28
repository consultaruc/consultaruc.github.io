import type { APIRoute } from 'astro';
import { siteOrigin, escapeHtml } from '../lib/renderRucPage.js';
import { STATIC_PAGES, TOOL_SLUGS, GUIDE_SLUGS, PAGE_IMG } from '../lib/pageMeta.js';

/**
 * Deliberately does NOT list individual /ruc/:ruc pages - this was a
 * deliberate decision made and shipped earlier (submitting millions of thin,
 * un-enriched RUC pages is a known way to burn crawl budget and get the
 * domain marked as low quality). Only the 19 static pages go in. Do not
 * reintroduce a RUC loop here.
 */
export const GET: APIRoute = () => {
  const origin = siteOrigin();
  const today = new Date().toISOString().slice(0, 10);

  // Priority/changefreq tiered by page role so crawlers spend budget where it
  // matters: home > tools > guides > legal/info.
  const meta = (p: string) => {
    if (p === '') return { pr: '1.0', cf: 'daily' };
    if (TOOL_SLUGS.has(p)) return { pr: '0.9', cf: 'weekly' };
    if (GUIDE_SLUGS.has(p)) return { pr: '0.8', cf: 'monthly' };
    return { pr: '0.4', cf: 'yearly' };
  };
  const urls = STATIC_PAGES.map((p) => {
    const { pr, cf } = meta(p);
    const loc = escapeHtml(`${origin}/${p}${p ? '/' : ''}`);
    const img = (PAGE_IMG as Record<string, string>)[p]
      ? `\n    <image:image><image:loc>${origin}${(PAGE_IMG as Record<string, string>)[p]}</image:loc></image:image>`
      : '';
    return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority>${img}</url>`;
  });

  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
      urls.join('\n') +
      '\n</urlset>',
    { headers: { 'Content-Type': 'application/xml' } }
  );
};
