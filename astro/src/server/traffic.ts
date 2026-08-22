import type { APIContext } from 'astro';

/**
 * Clasifica una petición para la analítica propia (ver `pageview` en db.js).
 *
 * Todo lo que se extrae aquí es agregable y anónimo: de dónde viene, a qué
 * página y desde qué país. No se toca la IP ni se guarda el user-agent
 * completo - sólo se usa en memoria para decidir si es un bot.
 */

/** Buscadores que mandan tráfico real. El orden importa: la primera que
 *  encaje gana, y algunos hosts contienen varios nombres. */
const SEARCH_ENGINES: Array<[RegExp, string]> = [
  [/(^|\.)google\./i, 'google'],
  [/(^|\.)bing\.com$/i, 'bing'],
  [/(^|\.)duckduckgo\.com$/i, 'duckduckgo'],
  [/(^|\.)search\.yahoo\./i, 'yahoo'],
  [/(^|\.)search\.brave\.com$/i, 'brave'],
  [/(^|\.)ecosia\.org$/i, 'ecosia'],
  [/(^|\.)yandex\./i, 'yandex'],
  [/(^|\.)baidu\.com$/i, 'baidu'],
  [/(^|\.)startpage\.com$/i, 'startpage'],
  [/(^|\.)qwant\.com$/i, 'qwant']
];

/** Redes sociales y mensajería, que en Perú mandan bastante tráfico. */
const SOCIAL: Array<[RegExp, string]> = [
  [/(^|\.)facebook\.com$|(^|\.)fb\./i, 'facebook'],
  [/(^|\.)instagram\.com$/i, 'instagram'],
  [/(^|\.)t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/i, 'twitter'],
  [/(^|\.)whatsapp\.com$|(^|\.)wa\.me$/i, 'whatsapp'],
  [/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/i, 'linkedin'],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/i, 'youtube'],
  [/(^|\.)reddit\.com$/i, 'reddit'],
  [/(^|\.)tiktok\.com$/i, 'tiktok'],
  [/(^|\.)telegram\.|(^|\.)t\.me$/i, 'telegram']
];

/** Rastreadores. Se etiquetan por nombre para poder ver, por ejemplo, si
 *  Googlebot dejó de pasar - que es justo lo que avisó el informe de rastreo
 *  cuando las peticiones cayeron de ~57/día a ~5. */
const BOTS: Array<[RegExp, string]> = [
  [/googlebot|google-inspectiontool|storebot-google/i, 'googlebot'],
  [/bingbot|adidxbot|bingpreview/i, 'bingbot'],
  [/duckduckbot/i, 'duckduckbot'],
  [/yandexbot/i, 'yandexbot'],
  [/baiduspider/i, 'baiduspider'],
  [/applebot/i, 'applebot'],
  [/gptbot|oai-searchbot|chatgpt-user/i, 'gptbot'],
  [/claudebot|claude-web|anthropic-ai/i, 'claudebot'],
  [/perplexitybot/i, 'perplexitybot'],
  [/ccbot/i, 'ccbot'],
  [/meta-externalagent|facebookexternalhit/i, 'meta'],
  [/ahrefsbot/i, 'ahrefsbot'],
  [/semrushbot/i, 'semrushbot'],
  [/mj12bot|dotbot|blexbot|petalbot|dataforseo/i, 'seo-tool'],
  [/uptimerobot|pingdom|statuscake|better\s?uptime/i, 'monitor'],
  // Catch-all al final: cualquier cosa que se anuncie como bot y no encaje
  // arriba, para que no se cuele entre las visitas humanas.
  [/bot\b|crawler|spider|crawl|scrapy|python-requests|curl\/|wget/i, 'otro-bot']
];

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

export interface TrafficInfo {
  path: string;
  source: string;
  referrer: string | null;
  country: string | null;
  bot: boolean;
}

export function classifyRequest(context: APIContext, ownHost: string): TrafficInfo {
  const req = context.request;
  const url = new URL(req.url);
  const ua = req.headers.get('user-agent') || '';

  for (const [re, name] of BOTS) {
    if (re.test(ua)) {
      return { path: url.pathname, source: name, referrer: null, country: null, bot: true };
    }
  }

  // Cloudflare añade el país de origen en cada petición y LiteSpeed la pasa
  // tal cual al hacer proxy. Si algún día se sirviera sin Cloudflare delante,
  // simplemente no habrá país y el resto de la analítica sigue funcionando.
  const country = (req.headers.get('cf-ipcountry') || '').toUpperCase() || null;

  const refHeader = req.headers.get('referer') || '';
  const refHost = hostOf(refHeader);

  let source = 'direct';
  let referrer: string | null = null;

  if (refHost) {
    if (refHost === ownHost || refHost === 'localhost' || refHost.endsWith('.' + ownHost)) {
      // Navegación dentro del propio sitio: no es una entrada nueva.
      source = 'internal';
    } else {
      referrer = refHost;
      source = 'referral';
      for (const [re, name] of SEARCH_ENGINES) if (re.test(refHost)) { source = name; break; }
      if (source === 'referral') {
        for (const [re, name] of SOCIAL) if (re.test(refHost)) { source = name; break; }
      }
    }
  }

  return { path: url.pathname, source, referrer, country, bot: false };
}

/** Sólo interesan las páginas reales: ni assets, ni API, ni el sello
 *  embebido (que se carga dentro de webs de terceros y dispararía el conteo). */
export function isCountablePath(pathname: string, accept: string): boolean {
  if (!accept.includes('text/html')) return false;
  if (pathname.startsWith('/api/')) return false;
  if (pathname.startsWith('/admin')) return false;
  if (pathname.startsWith('/badge')) return false;
  if (pathname.startsWith('/_astro/')) return false;
  if (/\.[a-z0-9]{2,5}$/i.test(pathname)) return false;
  return true;
}
