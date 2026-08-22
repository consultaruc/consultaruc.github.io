import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { verifyLogin } from '../../lib/adminAuth.js';
import { loginLimiter } from '../../server/rateLimit.js';
import { regenerateSession, saveSession } from '../../server/session.js';

// Deliberately outside public/ (see astro/src/adminAssets/ - the plan's
// Phase 9 deploy step must rsync this directory alongside dist/, since it's
// read from disk at request time, not bundled by Vite as an ES module).
const ADMIN_ASSETS_DIR = process.env.ADMIN_ASSETS_DIR || path.join(process.cwd(), 'src', 'adminAssets');

export const GET: APIRoute = () => {
  const html = fs.readFileSync(path.join(ADMIN_ASSETS_DIR, 'login.html'), 'utf8');
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};

export const POST: APIRoute = async (context) => {
  const blocked = loginLimiter.check(context);
  if (blocked) return blocked;

  const body = await context.request.json().catch(() => ({}));
  const { username, password } = body || {};

  if (verifyLogin(username, password)) {
    // New session id on every successful login - defends against session
    // fixation, same as the original's req.session.regenerate().
    const session = regenerateSession(context, context.locals.session);
    session.data.isAdmin = true;
    // regenerateSession() already persisted the pre-flag session; save again
    // now that isAdmin is set.
    saveSession(context, session);
    return Response.json({ success: true });
  }

  loginLimiter.recordFailure(context);
  return Response.json({ success: false, error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
};
