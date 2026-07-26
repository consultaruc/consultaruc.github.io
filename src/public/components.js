/**
 * Shared UI components — ONE definition, used by both the Node server (SSR
 * /ruc/:ruc pages) and the browser (live search results).
 *
 * To drop either component onto a new page you only ever write one line:
 *
 *   <div data-component="search-bar"></div>
 *   <div data-component="result-panel"></div>
 *
 * site.js mounts anything with [data-component] automatically, so there is no
 * markup to copy around and no second copy to keep in sync.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CRP = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const MAGNIFIER =
    '<svg class="sb-icon" viewBox="0 0 34 22" fill="none" aria-hidden="true">' +
    '<path d="M1 6h9M1 11h6M1 16h9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".45"/>' +
    '<circle cx="21" cy="10" r="6.4" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M26 15l5.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  /* ---------------- search bar ---------------- */

  function searchBar(opts) {
    const o = opts || {};
    const mode = o.mode === 'nombre' ? 'nombre' : o.mode === 'bulk' ? 'bulk' : 'ruc';
    const cta = esc(o.cta || 'Consultar Registros');
    const showTabs = o.tabs !== false && o.tabs !== 'false';
    const tab = (t, label) => `<button type="button" class="tab-btn${mode === t ? ' active' : ''}" data-type="${t}">${label}</button>`;
    const tabsHtml = showTabs
      ? `<div class="search-tabs">
    ${tab('ruc', 'Por RUC')}
    ${tab('nombre', 'Por Razón Social')}
    ${tab('bulk', 'Búsqueda Masiva')}
  </div>`
      : '';
    return `<form id="searchForm" data-search-mode="${mode}">
  ${tabsHtml}
  <div class="sb-shell" id="rucSegmented">
    <input type="text" class="sb-seg sb-tipo" id="rucSegTipo" maxlength="2" inputmode="numeric" pattern="[0-9]*" placeholder="20" aria-label="Tipo de contribuyente">
    <input type="text" class="sb-seg sb-body" id="rucSegBody" maxlength="8" inputmode="numeric" pattern="[0-9]*" placeholder="54893106" aria-label="Correlativo">
    <input type="text" class="sb-seg sb-check" id="rucSegCheck" maxlength="1" inputmode="numeric" pattern="[0-9]*" placeholder="1" aria-label="Dígito verificador">
    <button type="submit" class="sb-go" title="Buscar">${MAGNIFIER}</button>
  </div>
  <div class="input-wrapper free-shell" id="freeInputWrapper" style="display:none;">
    <span class="search-icon"><span class="ic" data-icon="search"></span></span>
    <input type="text" id="searchInput" placeholder="Ingrese Razón Social (Ej: BANCO DE CREDITO DEL PERU)" autocomplete="off" maxlength="100">
    <button type="button" id="clearBtn" class="clear-btn" style="display:none;">✕</button>
  </div>
  <div class="bulk-shell" id="bulkShell" style="display:none;">
    <textarea id="bulkText" rows="4" placeholder="Pega los RUC aquí (uno por línea o separados por coma)&#10;20100070970&#10;20100047218"></textarea>
    <label class="bulk-drop bulk-drop-row" for="bulkFile">
      <span class="bulk-drop-ic" data-icon="upload"></span>
      <span class="bulk-drop-txt"><strong class="bulk-drop-title">Sube un archivo CSV o TXT</strong><span class="bulk-drop-sub">arrastra o haz clic aquí</span></span>
      <span class="bulk-drop-file" id="bulkFileName"></span>
      <input type="file" id="bulkFile" accept=".csv,.txt" class="bulk-file-input">
    </label>
    <p class="bulk-hint">Hasta 200 RUC por consulta. Resultados al instante.</p>
  </div>
  <div class="search-sub-links">
    <a href="/razon-social/">Buscar por Nombre/Razón Social</a>
    <span class="sep">|</span>
    <a href="/verificar-ruc-multiple/">Búsqueda Masiva (CSV/Excel)</a>
  </div>
  <button type="submit" class="btn-consultar" id="submitBtn">${cta} <span class="tri"></span></button>
  <div class="live-toggle">
    <label class="lt-switch">
      <input type="checkbox" id="liveCheckbox">
      <span class="lt-track"><span class="lt-thumb"></span></span>
      <span class="lt-label"><span class="ic" data-icon="globe"></span> Verificación en tiempo real</span>
    </label>
    <span class="lt-status" id="liveQuotaNote"><span class="lt-dot"></span> Comprobando…</span>
  </div>
  <p class="lt-hint"><span class="ic" data-icon="zap"></span> Actívala para traer los <strong>datos completos</strong> del RUC, verificados en vivo con la SUNAT.</p>
  <div class="sample-pills">
    <span class="sample-label">Prueba rápida:</span>
    <button type="button" class="pill-btn" onclick="fillSearch('20100070970')">20100070970</button>
    <button type="button" class="pill-btn" onclick="fillSearch('20100047218')">20100047218</button>
    <button type="button" class="pill-btn" onclick="fillSearch('20100132592')">20100132592</button>
  </div>
</form>`;
  }

  /* ---------------- result panel ---------------- */

  const TIPO_LABEL = { '10': 'Persona Natural', '15': 'Persona Natural / Sucesión', '17': 'Persona Natural no domiciliada', '20': 'Persona Jurídica' };

  function dotClass(v, good) {
    return (v || '').toUpperCase() === good ? 'ok' : 'bad';
  }

  function fieldHtml(label, value, opts) {
    const o = opts || {};
    if (!value && !o.always) return '';
    const cls = 'rp-val' + (o.mono ? ' mono' : '') + (o.dot ? ' dot ' + o.dot : '');
    const ref = o.ref ? ` <span class="ref-tag">[REF: ${esc(o.ref)}]</span>` : '';
    return `<div class="rp-field"><span class="rp-label">${esc(label)}${ref}</span><div class="${cls}">${esc(value || '—')}</div></div>`;
  }

  function listHtml(label, items) {
    if (!Array.isArray(items) || !items.length) return '';
    return `<div class="rp-field"><span class="rp-label">${esc(label)}</span>` +
      `<div class="rp-val rp-stack">${items.map((i) => `<span>${esc(i)}</span>`).join('')}</div></div>`;
  }

  function tagsHtml(label, items) {
    if (!Array.isArray(items) || !items.length) return '';
    return `<div class="rp-field"><span class="rp-label">${esc(label)}</span>` +
      `<div class="rp-tags">${items.map((i) => `<span class="rp-tag">${esc(i)}</span>`).join('')}</div></div>`;
  }

  /**
   * @param data   record in the API shape
   * @param opts   { mapSvg, mapPoint:{x,y,name}, heading:boolean }
   */
  function resultPanel(data, opts) {
    const o = opts || {};
    const ruc = String(data.ruc || '');
    const seg = /^\d{11}$/.test(ruc) ? [ruc.slice(0, 2), ruc.slice(2, 10), ruc.slice(10)] : ['--', '--------', '-'];
    const estado = (data.estado || '').toUpperCase();
    const condicion = (data.condicion || '').toUpperCase();
    const fecha = o.consultedAt || new Date().toISOString().slice(0, 10);
    const acts = data.actividadEconomica || data.actividad_economica || [];

    const razon = data.razonSocial || data.razon_social || '';
    const comercial = data.nombreComercial || data.nombre_comercial || '';
    const avatar = ((razon.replace(/^[^A-Za-zÁÉÍÓÚÑ]*/, '')[0]) || 'R').toUpperCase();
    const tipoLabel = TIPO_LABEL[seg[0]] || '';
    const dept = o.deptName || data.departamento || '';
    const estadoTone = estado === 'ACTIVO' ? 'ok' : (estado === 'BAJA' ? 'bad' : (estado ? 'warn' : ''));
    const condTone = condicion === 'HABIDO' ? 'ok' : (condicion ? 'warn' : '');
    const map = o.mapSvg ? `<div class="rp-ubi-map">${o.mapSvg}</div>` : '';

    return `<div class="rp rp-profile">
  ${o.heading === false ? '' : `<h2 class="rp-title">Resultado de Búsqueda: RUC <span>${esc(ruc)}</span></h2>`}

  <div class="rp-hero">
    <div class="rp-hero-map" aria-hidden="true"></div>
    <div class="rp-hero-main">
      <span class="rp-avatar">${esc(avatar)}</span>
      <div class="rp-hero-id">
        <span class="rp-hero-eyebrow">Razón social</span>
        ${o.heading === false ? '<h2' : '<h3'} class="rp-hero-name">${esc(razon || '—')}${o.heading === false ? '</h2>' : '</h3>'}
        ${comercial ? `<span class="rp-hero-comercial">Nombre comercial: <b>${esc(comercial)}</b></span>` : ''}
        <div class="rp-hero-badges">
          ${estado ? `<span class="rp-badge ${estadoTone}"><span class="rp-badge-dot"></span>${esc(estado)}</span>` : ''}
          ${condicion ? `<span class="rp-badge ${condTone}"><span class="rp-badge-dot"></span>${esc(condicion)}</span>` : ''}
          ${tipoLabel ? `<span class="rp-badge navy">${esc(tipoLabel)}</span>` : ''}
          ${dept ? `<span class="rp-badge loc"><span class="ic" data-icon="map-pin"></span>${esc(dept)}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="rp-hero-side">
      <div class="rp-hero-side-top">
        <span class="ref-tag">[REF: RUC-${seg[0]}-${seg[1]}-${seg[2]}]</span>
        <div class="rp-segments"><span class="rp-seg">${seg[0]}</span><span class="rp-seg mid">${seg[1]}</span><span class="rp-seg">${seg[2]}</span></div>
        <span class="rp-verified"><span class="ic" data-icon="badge-check"></span> Verificado con SUNAT · <b>${esc(fecha)}</b></span>
      </div>
      <div class="rp-hero-actions">
        <button type="button" class="rp-btn rp-btn-primary" data-action="print"><span class="ic" data-icon="printer"></span> Imprimir ficha</button>
        <a class="rp-btn rp-btn-ghost" href="/ficha-ruc/">Verificar otro RUC</a>
      </div>
    </div>
  </div>

  <div class="rp-tabs" role="tablist">
    <button type="button" role="tab" aria-selected="true" class="rp-tab active" data-tab="general">Resumen</button>
    <button type="button" role="tab" aria-selected="false" class="rp-tab" data-tab="ubicacion">Ubicación</button>
    <button type="button" role="tab" aria-selected="false" class="rp-tab" data-tab="actividad">Actividad</button>
    <button type="button" role="tab" aria-selected="false" class="rp-tab" data-tab="comprobantes">Comprobantes</button>
  </div>

  <div class="rp-panels">
    <div class="rp-panel active" data-panel="general">
      <h4 class="rp-section-title">Datos generales</h4>
      <div class="rp-cards">
        ${fieldHtml('Tipo de Contribuyente', data.tipoContribuyente || data.tipo_contribuyente, { always: true })}
        ${fieldHtml('Fecha de Inscripción', data.fechaInscripcion || data.fecha_inscripcion, { mono: true })}
        ${fieldHtml('Inicio de Actividades', data.fechaInicioActividades || data.fecha_inicio_actividades, { mono: true })}
        ${fieldHtml('Comercio Exterior', data.comercioExterior || data.comercio_exterior)}
      </div>
    </div>

    <div class="rp-panel" data-panel="ubicacion">
      <h4 class="rp-section-title">Ubicación</h4>
      <div class="rp-cards rp-cards-ubi">
        <div class="rp-ubi-fields">
          ${fieldHtml('Domicilio Fiscal', data.domicilioFiscal || data.domicilio_fiscal, { always: true })}
          <div class="rp-ubi-row">
            ${fieldHtml('Departamento', dept, { always: true })}
            ${fieldHtml('Ubigeo', data.ubigeo, { mono: true })}
          </div>
        </div>
        ${map}
      </div>
    </div>

    <div class="rp-panel" data-panel="actividad">
      <h4 class="rp-section-title">Actividad económica</h4>
      <div class="rp-cards">
        ${acts.length ? `<div class="rp-field rp-field-wide"><span class="rp-label">Actividad Económica Principal</span><div class="rp-val rp-val-hl">${esc(acts[0])}</div></div>` : ''}
        ${fieldHtml('Sistema de Emisión de Comprobantes', data.sistemaEmision || data.sistema_emision)}
      </div>
      ${acts.length > 1 ? `<div style="margin-top:.9rem">${tagsHtml('Otras Actividades Económicas', acts.slice(1))}</div>` : ''}
    </div>

    <div class="rp-panel" data-panel="comprobantes">
      <h4 class="rp-section-title">Comprobantes y sistemas de emisión</h4>
      <div class="rp-cards">
        ${fieldHtml('Emisor Electrónico Desde', data.emisorElectronicoDesde || data.emisor_electronico_desde, { mono: true })}
        ${fieldHtml('Afiliado al PLE Desde', data.pleDesde || data.ple_desde, { mono: true })}
        ${tagsHtml('Comprobantes de Pago Autorizados', data.comprobantesPago || data.comprobantes_pago)}
        ${tagsHtml('Comprobantes Electrónicos', data.comprobantesElectronicos || data.comprobantes_electronicos)}
        ${listHtml('Sistema de Emisión Electrónica', data.sistemaEmisionElectronica || data.sistema_emision_electronica)}
        ${listHtml('Padrones', data.padrones)}
      </div>
    </div>
  </div>
</div>`;
  }

  return { searchBar, resultPanel, esc };
});
