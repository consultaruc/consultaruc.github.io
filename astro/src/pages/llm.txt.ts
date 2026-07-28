import type { APIRoute } from 'astro';
import { siteOrigin } from '../lib/renderRucPage.js';
import { buildLlmsTxt } from '../lib/pageMeta.js';

// Same content as /llms.txt (llmstxt.org convention) - the original Express
// app served both paths from one handler; Astro needs one file per route, so
// this just re-exports the same builder.
export const prerender = true;

export const GET: APIRoute = () => {
  return new Response(buildLlmsTxt(siteOrigin()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
