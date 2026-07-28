import type { APIRoute } from 'astro';

// Astro-native equivalent of server.js's final catch-all
// (`app.use((req,res) => res.status(404).json(...))`). Missed during the
// initial migration - the original app returns this exact JSON shape for
// ANY unmatched route (not just /api/*), which Astro's own default 404 page
// does not replicate on its own.
export const GET: APIRoute = () => {
  return Response.json({ success: false, error: 'No encontrado.' }, { status: 404 });
};

export const ALL: APIRoute = () => {
  return Response.json({ success: false, error: 'No encontrado.' }, { status: 404 });
};
