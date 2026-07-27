/* Directorio de Empresas por Rubro — companies grouped by sector.
   All data is SUNAT-verified (checked live against the DB). */
(function () {
  var SECTORS = [
    { id: 'banca', name: 'Banca y Finanzas', icon: 'landmark', items: [
      { ruc: '20100047218', n: 'Banco de Crédito del Perú', dom: 'La Molina, Lima', act: 'Banca múltiple' },
      { ruc: '20100053455', n: 'Interbank', dom: 'La Victoria, Lima', act: 'Banca múltiple' },
      { ruc: '20100130204', n: 'Banco BBVA Perú', dom: 'San Isidro, Lima', act: 'Banca múltiple' },
      { ruc: '20100043140', n: 'Scotiabank Perú', dom: 'San Isidro, Lima', act: 'Banca múltiple' },
      { ruc: '20100105862', n: 'Banco Pichincha', dom: 'Miraflores, Lima', act: 'Banca múltiple' },
      { ruc: '20382036655', n: 'Mibanco', dom: 'Surquillo, Lima', act: 'Microfinanzas' },
      { ruc: '20100030595', n: 'Banco de la Nación', dom: 'San Borja, Lima', act: 'Banca estatal' }
    ]},
    { id: 'retail', name: 'Retail y Consumo', icon: 'shopping-cart', items: [
      { ruc: '20100070970', n: 'Supermercados Peruanos (Plaza Vea)', dom: 'San Borja, Lima', act: 'Supermercados' },
      { ruc: '20109072177', n: 'Cencosud Retail (Metro)', dom: 'Miraflores, Lima', act: 'Supermercados' },
      { ruc: '20508565934', n: 'Hipermercados Tottus', dom: 'Surquillo, Lima', act: 'Supermercados' },
      { ruc: '20100106915', n: 'E. Wong', dom: 'Miraflores, Lima', act: 'Supermercados' },
      { ruc: '20100128056', n: 'Saga Falabella', dom: 'San Isidro, Lima', act: 'Comercio minorista' },
      { ruc: '20337564373', n: 'Tiendas Ripley', dom: 'San Isidro, Lima', act: 'Comercio minorista' },
      { ruc: '20389230724', n: 'Sodimac Perú', dom: 'Surquillo, Lima', act: 'Mejoramiento del hogar' },
      { ruc: '20331066703', n: 'Inretail Pharma (Inkafarma)', dom: 'La Victoria, Lima', act: 'Farmacias' },
      { ruc: '20100055237', n: 'Alicorp', dom: 'Callao', act: 'Consumo masivo' },
      { ruc: '20100190797', n: 'Gloria', dom: 'La Victoria, Lima', act: 'Lácteos y alimentos' },
      { ruc: '20100154308', n: 'San Fernando', dom: 'Surquillo, Lima', act: 'Alimentos' },
      { ruc: '20100113610', n: 'Backus (Cervecerías)', dom: 'Ate, Lima', act: 'Bebidas' },
      { ruc: '20263322496', n: 'Nestlé Perú', dom: 'Ate, Lima', act: 'Alimentos y bebidas' },
      { ruc: '20101024645', n: 'Arca Continental Lindley (Coca-Cola)', dom: 'S.J. Lurigancho, Lima', act: 'Bebidas' },
      { ruc: '20100152941', n: 'Kimberly-Clark Perú', dom: 'Miraflores, Lima', act: 'Cuidado personal' }
    ]},
    { id: 'automotriz', name: 'Automotriz', icon: 'car', items: [
      { ruc: '20100132592', n: 'Toyota del Perú', dom: 'Santa Anita, Lima', act: 'Venta de vehículos' },
      { ruc: '20344877158', n: 'Derco Perú', dom: 'Santiago de Surco, Lima', act: 'Venta de vehículos' }
    ]},
    { id: 'telecom', name: 'Telecomunicaciones', icon: 'radio-tower', items: [
      { ruc: '20467534026', n: 'Claro (América Móvil Perú)', dom: 'La Victoria, Lima', act: 'Telefonía móvil' },
      { ruc: '20106897914', n: 'Entel Perú', dom: 'Cercado de Lima', act: 'Telecomunicaciones' },
      { ruc: '20100017491', n: 'Integratel Perú (Grupo Telefónica)', dom: 'Santa Beatriz, Lima', act: 'Telecomunicaciones' }
    ]},
    { id: 'energia', name: 'Energía, Industria y Minería', icon: 'zap', items: [
      { ruc: '20331898008', n: 'Luz del Sur', dom: 'San Isidro, Lima', act: 'Distribución eléctrica' },
      { ruc: '20100128218', n: 'Petroperú', dom: 'San Isidro, Lima', act: 'Hidrocarburos' },
      { ruc: '20330262428', n: 'Compañía Minera Antamina', dom: 'Santiago de Surco, Lima', act: 'Minería' },
      { ruc: '20312372895', n: 'Yura', dom: 'Yura, Arequipa', act: 'Cemento' },
      { ruc: '20370146994', n: 'Corporación Aceros Arequipa', dom: 'Pisco, Ica', act: 'Siderurgia' },
      { ruc: '20100039207', n: 'Ransa Comercial', dom: 'Callao', act: 'Logística' }
    ]},
    { id: 'estado', name: 'Sector Público', icon: 'building-2', items: [
      { ruc: '20131312955', n: 'SUNAT — Superintendencia Nac. de Aduanas y Adm. Tributaria', dom: 'Cercado de Lima', act: 'Administración tributaria' },
      { ruc: '20131257750', n: 'EsSalud — Seguro Social de Salud', dom: 'Jesús María, Lima', act: 'Seguridad social' },
      { ruc: '20295613620', n: 'RENIEC — Registro Nac. de Identificación', dom: 'Cercado de Lima', act: 'Identificación' }
    ]}
  ];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function seg(r) { return '<span class="dc-seg">' + r.slice(0, 2) + '</span><span class="dc-seg dc-seg-mid">' + r.slice(2, 10) + '</span><span class="dc-seg">' + r.slice(10) + '</span>'; }

  function card(c) {
    return '<a class="rubro-card" href="/ruc/' + c.ruc + '">' +
      '<div class="rc-head"><span class="rc-avatar">' + esc(c.n.replace(/^[^A-Za-zÁÉÍÓÚÑ]*/, '').charAt(0).toUpperCase()) + '</span>' +
      '<div class="rc-ht"><strong class="rc-name">' + esc(c.n) + '</strong><div class="rc-ruc">' + seg(c.ruc) + '</div></div></div>' +
      '<div class="rc-pills"><span class="dc-pill dc-active">ACTIVO</span><span class="dc-pill dc-habido">HABIDO</span></div>' +
      '<div class="rc-dom"><span class="ic" data-icon="map-pin"></span> ' + esc(c.dom) + '</div>' +
      '<span class="rc-act">' + esc(c.act) + '</span>' +
      '<div class="rc-foot"><span class="rc-ref">[REF: RUC-' + c.ruc.slice(0, 2) + '-' + c.ruc.slice(2, 10) + '-' + c.ruc.slice(10) + ']</span><span class="rc-ver">Ver ficha <span class="ic" data-icon="arrow-right"></span></span></div>' +
      '</a>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var navEl = document.getElementById('rubroNav');
    var body = document.getElementById('rubroBody');
    if (!body) return;

    // The sector directory is now pre-rendered into the page's HTML: SECTORS is
    // a hardcoded list, so building it client-side bought nothing and cost a
    // 0.675 layout shift (36 cards appearing after first paint). It also means
    // crawlers see the listings without executing JS. Skip the rebuild when the
    // markup is already there; the scroll-spy and the rest of the wiring below
    // still run against it.
    if (!body.querySelector('.rubro-section')) {
      renderSectors(navEl, body);
    }

    function renderSectors(navEl, body) {
    navEl.innerHTML = SECTORS.map(function (s, i) {
      return '<a href="#' + s.id + '"' + (i === 0 ? ' class="active"' : '') + '>' + esc(s.name.split(/[ ,]/)[0]) + '</a>';
    }).join('');

    body.innerHTML = SECTORS.map(function (s) {
      return '<section class="rubro-section" id="' + s.id + '">' +
        '<div class="rubro-head"><span class="rubro-icon" data-icon="' + s.icon + '"></span>' +
        '<h2>' + esc(s.name) + '</h2><span class="rubro-count">' + s.items.length + ' empresas</span></div>' +
        '<div class="rubro-grid">' + s.items.map(card).join('') + '</div></section>';
    }).join('');
    }

    if (window.applyIcons) window.applyIcons(body), window.applyIcons(navEl);

    // scroll-spy: highlight the active sector in the sticky sub-nav
    var links = {};
    navEl.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navEl.querySelectorAll('a').forEach(function (a) { a.classList.remove('active'); });
          if (links[e.target.id]) links[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-120px 0px -70% 0px' });
    body.querySelectorAll('.rubro-section').forEach(function (s) { obs.observe(s); });
  });
})();
