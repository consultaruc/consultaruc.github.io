/**
 * Single source of truth for the header menu.
 *
 * Every public page is reachable from here - 19 in total - grouped so the bar
 * itself stays short (6 items) instead of turning into a wall of links.
 * Used both by the SSR /ruc/:ruc route and by the build script that stamps the
 * nav into the static HTML pages, so the two can't drift apart.
 */
const NAV = [
  { label: 'Inicio', href: '/', pages: ['index'] },
  {
    label: 'Consultas',
    children: [
      { label: 'Búsqueda Individual', href: '/ficha-ruc/', page: 'ficha-ruc' },
      { label: 'Por Razón Social', href: '/razon-social/', page: 'razon-social' },
      { label: 'Búsqueda Masiva (CSV)', href: '/verificar-ruc-multiple/', page: 'verificar-ruc-multiple' }
    ]
  },
  {
    label: 'Herramientas',
    children: [
      { label: 'Tipo de Cambio SUNAT', href: '/tipo-de-cambio-sunat/', page: 'tipo-de-cambio-sunat' },
      { label: 'Calculadora Tributaria', href: '/calculadora-tributaria/', page: 'calculadora-tributaria' },
      { label: 'Sello Verificado', href: '/sello-verificado/', page: 'sello-verificado' }
    ]
  },
  {
    label: 'Guías',
    children: [
      { label: 'Preguntas Frecuentes', href: '/faq/', page: 'faq' },
      { label: 'Clave SOL', href: '/clave-sol/', page: 'clave-sol' },
      { label: 'Recibo por Honorarios', href: '/recibo-por-honorarios/', page: 'recibo-por-honorarios' },
      { label: 'SAT Lima vs SUNAT', href: '/sat-lima-vs-sunat/', page: 'sat-lima-vs-sunat' },
      { label: 'Comercio Exterior', href: '/comercio-exterior-ruc/', page: 'comercio-exterior-ruc' },
      { label: 'Consulta EsSalud', href: '/consulta-essalud/', page: 'consulta-essalud' },
      { label: 'Consulta RNP', href: '/consulta-rnp/', page: 'consulta-rnp' }
    ]
  },
  { label: 'Directorio', href: '/empresas-populares/', pages: ['empresas-populares'] },
  {
    label: 'Acerca de',
    children: [
      { label: 'Sobre Nosotros', href: '/sobre-nosotros/', page: 'sobre-nosotros' },
      { label: 'Contacto', href: '/contacto/', page: 'contacto' },
      { label: 'Política de Privacidad', href: '/politica-de-privacidad/', page: 'politica-de-privacidad' },
      { label: 'Términos y Condiciones', href: '/terminos-y-condiciones/', page: 'terminos-y-condiciones' }
    ]
  }
];

/**
 * @param activePage directory name of the current page ('faq', 'index', …),
 *                   or 'ficha-ruc' for the SSR /ruc/:ruc detail pages.
 */
function renderNav(activePage) {
  const items = NAV.map((item) => {
    if (item.children) {
      const isActive = item.children.some((c) => c.page === activePage);
      const links = item.children
        .map(
          (c) =>
            `          <a href="${c.href}"${c.page === activePage ? ' class="active"' : ''}>${c.label}</a>`
        )
        .join('\n');
      return `        <div class="nav-group">
          <button type="button" class="tab-nav-link nav-trigger${isActive ? ' active' : ''}" aria-haspopup="true">${item.label}<span class="caret"></span></button>
          <div class="nav-menu">
${links}
          </div>
        </div>`;
    }
    const isActive = (item.pages || []).includes(activePage);
    return `        <a href="${item.href}" class="tab-nav-link${isActive ? ' active' : ''}">${item.label}</a>`;
  }).join('\n');

  return `  <nav class="tab-nav">
    <div class="tab-nav-container">
${items}
    </div>
  </nav>`;
}

module.exports = { NAV, renderNav };
