import type { APIRoute } from 'astro';
import { destroySession } from '../../server/session.js';

export const GET: APIRoute = (context) => {
  destroySession(context, context.locals.session);
  return context.redirect('/admin/login');
};
