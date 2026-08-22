import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { requireAuth } from '../../server/requireAuth.js';

const ADMIN_ASSETS_DIR = process.env.ADMIN_ASSETS_DIR || path.join(process.cwd(), 'src', 'adminAssets');

export const GET: APIRoute = (context) => {
  const denied = requireAuth(context, context.locals.session);
  if (denied) return denied;

  const html = fs.readFileSync(path.join(ADMIN_ASSETS_DIR, 'dashboard.html'), 'utf8');
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
