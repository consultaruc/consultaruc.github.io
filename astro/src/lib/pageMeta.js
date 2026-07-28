/**
 * Static-page metadata for sitemap.xml/llms.txt/ai.txt/robots.txt.
 *
 * The original Express app read each page's <title>/<meta description>
 * straight off the on-disk HTML file at request time (src/server.js's
 * getPageMeta()), so llms.txt could never drift from the live pages. Astro
 * pages are compiled from .astro sources, not read as flat HTML at runtime,
 * so this is now a maintained snapshot instead - Phase 7 builds each page's
 * <head> from the SAME title/description values below, so the two can't
 * drift from each other even if they can (in principle) drift from a page
 * that's edited without updating this file. Title values already have the
 * " | Consulta RUC Perú"-style branding suffix stripped, matching what
 * getPageMeta()'s regex used to do.
 */
export const SITE_NAME = 'Consulta RUC Perú';

export const PAGE_META = [
  { slug: '', title: 'Consulta RUC Gratis - SUNAT Perú', desc: 'Consulta el RUC de empresas y personas en Perú, gratis y al instante: razón social, estado (activo/habido), domicilio fiscal y actividad. Datos SUNAT.' },
  { slug: 'ficha-ruc', title: 'Ficha RUC Perú - Consulta y Descarga Gratis', desc: 'Consulta y descarga la ficha RUC de cualquier empresa o persona en Perú: razón social, estado, condición de domicilio y actividad económica.' },
  { slug: 'razon-social', title: 'Buscar Empresa por Razón Social en Perú', desc: 'Busca el RUC de cualquier empresa peruana escribiendo su razón social o nombre comercial. Resultados instantáneos desde el Padrón de SUNAT.' },
  { slug: 'verificar-ruc-multiple', title: 'Verificación Múltiple de RUC (Excel/CSV)', desc: 'Verifica el estado de múltiples RUC a la vez subiendo un archivo CSV o pegando una lista. Ideal para contadores y gestorías que validan proveedores.' },
  { slug: 'sello-verificado', title: 'Sello Verificado para tu Web', desc: 'Agrega un sello de verificación RUC en tu propia página web y demuestra a tus clientes que tu empresa está activa y habida ante SUNAT.' },
  { slug: 'tipo-de-cambio-sunat', title: 'Tipo de Cambio SUNAT Hoy: Compra y Venta del Dólar', desc: 'Tipo de cambio oficial SUNAT de hoy: precio de compra y venta del dólar. Historial de los últimos días, actualizado automáticamente todos los días hábiles.' },
  { slug: 'calculadora-tributaria', title: 'Calculadora de Régimen Tributario 2026: NRUS, RER, MYPE', desc: 'Compara NRUS, RER, Régimen MYPE Tributario y Régimen General según tus ingresos anuales. Calculadora orientativa 2026 con la UIT vigente de S/ 5,500.' },
  { slug: 'empresas-populares', title: 'Directorio de Empresas Populares en Perú - Consulta RUC', desc: 'Directorio de las empresas más consultadas en Perú: BCP, Toyota del Perú, Supermercados Peruanos y más. Consulta su RUC, estado y domicilio fiscal.' },
  { slug: 'faq', title: 'Preguntas Frecuentes sobre Consulta RUC Perú', desc: 'Resolvemos las dudas más comunes sobre cómo consultar el RUC en Perú: qué significa activo y habido, cómo buscar por DNI, y más.' },
  { slug: 'clave-sol', title: '¿Qué es la Clave SOL de SUNAT? Guía 2026', desc: 'Guía sobre qué es la Clave SOL de SUNAT, para qué sirve, cómo obtenerla y qué hacer si la olvidaste. Toda la información en un solo lugar.' },
  { slug: 'recibo-por-honorarios', title: 'Recibo por Honorarios Electrónico (RHE) - Guía 2026', desc: 'Qué es el Recibo por Honorarios Electrónico (RHE) de SUNAT, quién debe emitirlo y cómo funciona la retención del impuesto a la renta de cuarta categoría.' },
  { slug: 'sat-lima-vs-sunat', title: 'SAT Lima vs. SUNAT: ¿Cuál es la diferencia?', desc: 'SAT de Lima y SUNAT son entidades diferentes. Descubre cuál te corresponde según tu trámite: impuesto predial, papeletas municipales, o RUC e impuestos nacionales.' },
  { slug: 'comercio-exterior-ruc', title: 'Comercio Exterior en el RUC: Qué Significa en SUNAT', desc: "Qué significa 'Actividad Comercio Exterior' en la ficha RUC de SUNAT, cómo saber si una empresa importa o exporta y cómo habilitar esta actividad." },
  { slug: 'consulta-essalud', title: 'Consulta EsSalud: Acreditación y Derechohabientes 2026', desc: 'Cómo consultar tu acreditación de EsSalud y la de tus derechohabientes con DNI, a través de la plataforma oficial VIVA EsSalud. Guía paso a paso 2026.' },
  { slug: 'consulta-rnp', title: '¿Qué es el RNP? Registro Nacional de Proveedores 2026', desc: 'Qué es el RNP (Registro Nacional de Proveedores) de OSCE, para qué sirve, quién debe inscribirse y cómo consultar a un proveedor del Estado.' },
  { slug: 'sobre-nosotros', title: 'Acerca de Consulta RUC Perú', desc: 'Consulta RUC Perú es un portal independiente que ofrece búsqueda gratuita del padrón de RUC de SUNAT. Conoce quiénes somos y cómo funciona el servicio.' },
  { slug: 'contacto', title: 'Contacto - Consulta RUC Perú', desc: 'Contáctanos si tienes preguntas, comentarios o encontraste un error en Consulta RUC Perú.' },
  { slug: 'politica-de-privacidad', title: 'Política de Privacidad - Consulta RUC Perú', desc: 'Política de privacidad de Consulta RUC Perú: qué datos recopilamos, cómo los usamos y tus derechos como usuario.' },
  { slug: 'terminos-y-condiciones', title: 'Términos y Condiciones - Consulta RUC Perú', desc: 'Términos y condiciones de uso de Consulta RUC Perú, el buscador gratuito de RUC basado en datos abiertos de SUNAT.' }
];

export const STATIC_PAGES = PAGE_META.map((m) => m.slug);

export const TOOL_SLUGS = new Set(['ficha-ruc', 'razon-social', 'verificar-ruc-multiple', 'calculadora-tributaria', 'tipo-de-cambio-sunat', 'empresas-populares', 'sello-verificado']);
export const GUIDE_SLUGS = new Set(['clave-sol', 'recibo-por-honorarios', 'sat-lima-vs-sunat', 'comercio-exterior-ruc', 'consulta-essalud', 'consulta-rnp', 'faq']);

// One representative image per page for the image-sitemap extension (helps
// image SEO). Content pages use their hero; home uses the branded OG card.
export const PAGE_IMG = {
  '': '/img/og-home.png',
  'ficha-ruc': '/img/ficha-ruc-01-anatomia.webp',
  'razon-social': '/img/razon-social-01-del-nombre-al-ruc.webp',
  'clave-sol': '/img/clave-sol-1-llave.webp',
  'recibo-por-honorarios': '/img/recibo-1-documento.webp',
  'comercio-exterior-ruc': '/img/comercio-1-hero.webp',
  'consulta-essalud': '/img/essalud-1-hero.webp',
  'consulta-rnp': '/img/rnp-1-hero.webp',
  'sat-lima-vs-sunat': '/img/sat-1-hero.webp',
  'calculadora-tributaria': '/img/regimen-01-escalera.webp',
  'tipo-de-cambio-sunat': '/img/tc-01-tres-tipos.webp',
  'verificar-ruc-multiple': '/img/masiva-01-dashboard.webp',
  'sello-verificado': '/img/consulta-ruc-15-seguridad.webp',
  'faq': '/img/consulta-ruc-16-que-es.webp',
  'empresas-populares': '/img/consulta-ruc-01-pasos.webp'
};

export function buildLlmsTxt(origin) {
  const url = (s) => `${origin}/${s}${s ? '/' : ''}`;
  const section = (heading, pick) => {
    const items = PAGE_META.filter((m) => pick(m.slug)).map((m) => `- [${m.title}](${url(m.slug)})${m.desc ? ': ' + m.desc : ''}`);
    return items.length ? `## ${heading}\n${items.join('\n')}\n` : '';
  };
  const home = PAGE_META.find((m) => m.slug === '');
  return [
    `# ${SITE_NAME}`,
    '',
    `> ${(home && home.desc) || 'Consulta gratuita del RUC de cualquier empresa o persona registrada en la SUNAT (Perú): estado, condición de domicilio, razón social, actividad económica y más.'}`,
    '',
    'Portal informativo y de consulta pública sobre el RUC peruano. La información proviene de fuentes públicas de la SUNAT. Este sitio no está afiliado oficialmente a la SUNAT.',
    '',
    section('Herramientas de consulta', (s) => s === '' || TOOL_SLUGS.has(s)),
    section('Guías y recursos', (s) => GUIDE_SLUGS.has(s)),
    section('Información del sitio', (s) => s !== '' && !TOOL_SLUGS.has(s) && !GUIDE_SLUGS.has(s)),
    '## Notas para agentes y LLMs',
    `- La consulta individual de un RUC se sirve en ${origin}/ruc/{RUC} (11 dígitos).`,
    '- Todo el contenido está en español de Perú (es-PE) y el uso de la moneda es el sol (PEN).',
    `- El scraping masivo y el uso de la API interna por terceros no están permitidos; ver ${origin}/ai.txt.`,
    ''
  ].filter((x) => x !== false).join('\n');
}

export function buildAiTxt(origin) {
  return [
    `# ai.txt — Política de uso para agentes e IA · ${SITE_NAME}`,
    `# ${origin}`,
    '',
    'User-Agent: *',
    'Allow: /',
    'Allow: /ruc/',
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    '# El contenido editorial (guías y artículos) puede citarse siempre con atribución y enlace a la URL de origen.',
    '# Los datos de RUC provienen de fuentes públicas de la SUNAT; verifica siempre en la fuente oficial.',
    '# No se permite el scraping masivo del sitio ni el uso de la API interna por terceros.',
    'Content-Usage: attribution-required',
    `Sitemap: ${origin}/sitemap.xml`,
    `Contact: ${origin}/contacto/`,
    ''
  ].join('\n');
}
