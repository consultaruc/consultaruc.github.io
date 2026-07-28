import type { APIRoute } from 'astro';
import { siteOrigin } from '../lib/renderRucPage.js';

/**
 * Served dynamically rather than as a static file because the Sitemap
 * directive must be an absolute URL. Disallows stay deliberately broad -
 * robots.txt is world-readable, so naming individual internal endpoints in
 * it would just hand a recon list to anyone who looks.
 */
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
      `Sitemap: ${o}/sitemap.xml\n` +
      `# ${o}/llms.txt · ${o}/ai.txt\n`,
    { headers: { 'Content-Type': 'text/plain' } }
  );
};
