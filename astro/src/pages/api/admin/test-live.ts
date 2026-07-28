import type { APIRoute } from 'astro';
import { testLiveApi } from '../../../lib/liveScraper.js';
import { requireAuth } from '../../../server/requireAuth.js';
import { apiLimiter } from '../../../server/rateLimit.js';

export const POST: APIRoute = async (context) => {
  const denied = requireAuth(context, context.locals.session);
  if (denied) return denied;
  const limited = apiLimiter(context);
  if (limited) return limited;

  const result = await testLiveApi();
  return Response.json(result);
};
