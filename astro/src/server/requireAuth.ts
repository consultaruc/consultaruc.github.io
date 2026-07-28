import type { APIContext } from 'astro';
import type { Session } from './session.js';

/**
 * Astro-native port of adminAuth.js's Express requireAuth(req,res,next)
 * middleware. Since Astro has no per-route middleware chaining, each admin
 * route calls this explicitly as its first line: a non-null return means
 * "stop, send this Response back", null means "authorized, continue".
 */
export function requireAuth(context: APIContext, session: Session): Response | null {
  if (session.data.isAdmin) return null;
  if (new URL(context.request.url).pathname.startsWith('/api/')) {
    return Response.json({ success: false, error: 'No autorizado.' }, { status: 401 });
  }
  return context.redirect('/admin/login');
}
