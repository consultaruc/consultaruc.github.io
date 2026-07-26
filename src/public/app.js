let currentData = null;
let currentSearchType = 'ruc';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  // Some pages (calculadora, tipo de cambio, verificación múltiple) have their
  // own tool widget and NO shared search bar. Guard everything that touches the
  // search form so app.js doesn't throw there — the sidebar still works below.
  const hasSearch = !!(form && input);
  const clearBtn = document.getElementById('clearBtn');
  const tabs = document.querySelectorAll('.tab-btn');
  const rucSegmented = document.getElementById('rucSegmented');
  const freeInputWrapper = document.getElementById('freeInputWrapper');

  if (input && clearBtn) {
    input.addEventListener('input', () => {
      clearBtn.style.display = input.value.trim() ? 'block' : 'none';
    });
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      input.focus();
    });
  }

  function applySearchType(type) {
    currentSearchType = type;
    const isRuc = type === 'ruc';
    const isBulk = type === 'bulk';
    const bulkShell = document.getElementById('bulkShell');
    const subLinks = document.querySelector('.search-sub-links');
    const liveToggle = document.querySelector('.live-toggle');
    const samplePills = document.querySelector('.sample-pills');
    const submitBtn = document.getElementById('submitBtn');

    // Show the right input for the active mode.
    if (rucSegmented) rucSegmented.style.display = isRuc ? 'flex' : 'none';
    if (freeInputWrapper) freeInputWrapper.style.display = type === 'nombre' ? 'flex' : 'none';
    if (bulkShell) bulkShell.style.display = isBulk ? 'block' : 'none';

    // Bulk mode is local-only and has no single-result extras.
    if (subLinks) subLinks.style.display = isBulk ? 'none' : '';
    if (liveToggle) liveToggle.style.display = isBulk ? 'none' : '';
    if (samplePills) samplePills.style.display = isBulk ? 'none' : '';
    if (submitBtn) {
      submitBtn.innerHTML = (isBulk ? 'Verificar Lista de RUC' : 'Consultar Registros') + ' <span class="tri"></span>';
    }

    if (type === 'nombre') {
      input.placeholder = 'Ingrese Razón Social (Ej: BANCO DE CREDITO DEL PERU)';
      input.maxLength = 100;
    } else {
      input.placeholder = 'Ingrese RUC de 11 dígitos (Ej: 20100047218)';
      input.maxLength = 11;
    }
  }

  if (hasSearch) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        applySearchType(tab.dataset.type);
      });
    });

    // The mockup-exact hero has no tab row, so the page declares its mode via
    // `<form data-search-mode="...">` (e.g. /razon-social/ uses "nombre").
    // Tabs are still honoured if a page happens to render them.
    const initialTab = document.querySelector('.tab-btn.active') || tabs[0];
    applySearchType(initialTab ? initialTab.dataset.type : (form.dataset.searchMode || 'ruc'));

    setupRucSegments(input);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (currentSearchType === 'bulk') {
        await runBulk();
        return;
      }
      const query = input.value.trim();
      if (!query) return;
      await executeSearch(query);
    });

    refreshQuota();
  }

  renderHistory();

  // Right sticky sidebar: mini "Consulta rápida". Reuses the main search flow
  // (fill segments + executeSearch) and scrolls up so the reader sees the
  // full result panel / live-check toggle without leaving the article.
  const aq = document.getElementById('asideQuickForm');
  if (aq) {
    aq.addEventListener('submit', (e) => {
      e.preventDefault();
      const box = document.getElementById('asideQuickInput');
      const v = (box.value || '').replace(/\D/g, '');
      if (v.length !== 11) {
        box.classList.remove('shake');
        void box.offsetWidth; // restart animation
        box.classList.add('shake');
        return;
      }
      if (hasSearch) {
        // On pages with the search bar, run the in-page (SPA) search.
        applySearchType('ruc');
        input.value = v;
        fillRucSegments(v);
        executeSearch(v);
      } else {
        // Tool pages without a search bar: open the full server-rendered result.
        window.location.href = '/ruc/' + encodeURIComponent(v);
      }
    });
  }
  const topBtn = document.getElementById('asideTop');
  if (topBtn) topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Support linking directly to a search result from other pages, e.g.
  // /empresas-populares/ links to /?ruc=20100047218 to auto-run a search.
  if (hasSearch) {
    const params = new URLSearchParams(window.location.search);
    const linkedRuc = params.get('ruc');
    if (linkedRuc) {
      input.value = linkedRuc;
      fillRucSegments(linkedRuc);
      executeSearch(linkedRuc);
    }
  }
});

// Wires the 3-box segmented RUC input (tipo/2 - correlativo/8 - verificador/1)
// so it behaves like a single field: auto-advances between boxes as they
// fill, steps back on backspace from an empty box, accepts pasting a full
// 11-digit RUC into any box, and keeps the underlying #searchInput (the
// value executeSearch() actually reads) in sync on every keystroke.
function setupRucSegments(input) {
  const segTipo = document.getElementById('rucSegTipo');
  const segBody = document.getElementById('rucSegBody');
  const segCheck = document.getElementById('rucSegCheck');
  if (!segTipo || !segBody || !segCheck) return;

  function onlyDigits(el) {
    el.value = el.value.replace(/\D/g, '');
  }

  function syncToInput() {
    input.value = segTipo.value + segBody.value + segCheck.value;
  }

  segTipo.addEventListener('input', () => {
    onlyDigits(segTipo);
    syncToInput();
    if (segTipo.value.length >= 2) segBody.focus();
  });
  segBody.addEventListener('input', () => {
    onlyDigits(segBody);
    syncToInput();
    if (segBody.value.length >= 8) segCheck.focus();
  });
  segCheck.addEventListener('input', () => {
    onlyDigits(segCheck);
    syncToInput();
  });

  segBody.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && segBody.value === '') segTipo.focus();
  });
  segCheck.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && segCheck.value === '') segBody.focus();
  });

  [segTipo, segBody, segCheck].forEach((el) => {
    el.addEventListener('paste', (e) => {
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      if (text.length === 11) {
        e.preventDefault();
        fillRucSegments(text);
        syncToInput();
        segCheck.focus();
      }
    });
  });
}

// Used both by pasting a full RUC into a segment box and by fillSearch()/the
// ?ruc= URL param, so the visible boxes always match whatever #searchInput
// actually holds - otherwise editing after a programmatic fill would show
// stale/empty boxes even though a search already ran.
function fillRucSegments(ruc) {
  const segTipo = document.getElementById('rucSegTipo');
  const segBody = document.getElementById('rucSegBody');
  const segCheck = document.getElementById('rucSegCheck');
  if (!segTipo || !segBody || !segCheck) return;
  if (!/^\d{11}$/.test(ruc)) return;
  segTipo.value = ruc.slice(0, 2);
  segBody.value = ruc.slice(2, 10);
  segCheck.value = ruc.slice(10, 11);
}

async function refreshQuota() {
  const note = document.getElementById('liveQuotaNote');
  if (!note) return;
  try {
    const res = await fetch('/api/live-quota');
    const q = await res.json();
    updateQuotaNote(q);
  } catch {
    note.textContent = '';
  }
}

function updateQuotaNote(q) {
  const note = document.getElementById('liveQuotaNote');
  if (!note) return;
  const dot = '<span class="lt-dot"></span> ';
  // The label already names the feature - this only reports availability, with
  // a coloured dot: green = usable now, amber = wait.
  if (q.available) {
    note.className = 'lt-status ok';
    note.innerHTML = dot + 'Disponible ahora';
  } else {
    note.className = 'lt-status off';
    note.innerHTML = dot + `Espera ${q.retryAfterSeconds}s`;
  }
}

async function executeSearch(query) {
  const loader = document.getElementById('loader');
  const resultContainer = document.getElementById('resultContainer');
  const notFoundCard = document.getElementById('notFoundCard');

  loader.style.display = 'block';
  resultContainer.style.display = 'none';
  if (notFoundCard) notFoundCard.style.display = 'none';

  const liveCheckbox = document.getElementById('liveCheckbox');
  const wantsLive = liveCheckbox && liveCheckbox.checked;

  try {
    const url = `/api/ruc/${encodeURIComponent(query)}${wantsLive ? '?live=true' : ''}`;
    const res = await fetch(url);
    const json = await res.json();

    loader.style.display = 'none';

    if (json.quota) updateQuotaNote(json.quota);

    if (res.ok && json.success && json.data) {
      if (Array.isArray(json.data)) {
        if (json.data.length > 0) {
          renderResult(json.data[0], json.source);
        } else {
          showNotFound(query, 'No se encontraron empresas con esa razón social.');
        }
      } else {
        renderResult(json.data, json.source);
      }
    } else {
      showNotFound(query, json.error || 'El RUC ingresado no existe en el Padrón de la SUNAT.');
    }
  } catch (err) {
    loader.style.display = 'none';
    alert('Error al conectar con el servidor: ' + err.message);
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// SUNAT tipo de contribuyente by RUC prefix (first 2 digits).
const TIPO_MAP = {
  '10': 'Persona Natural',
  '15': 'Persona Natural / Sucesión',
  '17': 'Persona Natural no domiciliada',
  '20': 'Persona Jurídica'
};

// Approximate department centroids in the peru-map.svg viewBox (0-1024),
// calibrated visually against the rendered map. Used ONLY to place the
// decorative "Ubicación Geográfica" marker - it is not a precise geocode.
const DEPT_COORDS = {
  'TUMBES': [150, 175], 'PIURA': [175, 240], 'LAMBAYEQUE': [225, 300],
  'CAJAMARCA': [270, 310], 'AMAZONAS': [340, 255], 'LORETO': [500, 175],
  'SAN MARTIN': [400, 320], 'LA LIBERTAD': [300, 385], 'ANCASH': [320, 470],
  'HUANUCO': [395, 435], 'UCAYALI': [520, 405], 'PASCO': [400, 495],
  'JUNIN': [425, 545], 'LIMA': [350, 600], 'CALLAO': [335, 605],
  'HUANCAVELICA': [400, 610], 'ICA': [390, 685], 'AYACUCHO': [440, 645],
  'APURIMAC': [475, 675], 'CUSCO': [525, 620], 'MADRE DE DIOS': [620, 530],
  'AREQUIPA': [470, 755], 'PUNO': [590, 715], 'MOQUEGUA': [510, 820],
  'TACNA': [545, 875]
};

function titleCase(s) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// Mirror of deriveDept() in src/geo.js — browser JS can't require() it.
// Keep the two in sync.
const DEPT_BY_UBIGEO = {
  '01': 'AMAZONAS', '02': 'ANCASH', '03': 'APURIMAC', '04': 'AREQUIPA',
  '05': 'AYACUCHO', '06': 'CAJAMARCA', '07': 'CALLAO', '08': 'CUSCO',
  '09': 'HUANCAVELICA', '10': 'HUANUCO', '11': 'ICA', '12': 'JUNIN',
  '13': 'LA LIBERTAD', '14': 'LAMBAYEQUE', '15': 'LIMA', '16': 'LORETO',
  '17': 'MADRE DE DIOS', '18': 'MOQUEGUA', '19': 'PASCO', '20': 'PIURA',
  '21': 'PUNO', '22': 'SAN MARTIN', '23': 'TACNA', '24': 'TUMBES',
  '25': 'UCAYALI'
};

// When `departamento` isn't set, read it off the address tail
// ("... DEPARTAMENTO - PROVINCIA - DISTRITO"). Longest name first so
// "LA LIBERTAD" wins over a stray "LIMA". Addresses that are just a street
// ("AV. MATERIALES NRO. 2828") carry no department at all, so the ubigeo's
// first two digits — which are the department code — are the last resort.
function deriveDept(departamento, address, ubigeo) {
  if (departamento) return departamento;
  const up = (address || '').toUpperCase();
  if (up) {
    const keys = Object.keys(DEPT_COORDS).sort((a, b) => b.length - a.length);
    for (const k of keys) {
      if (up.includes(k)) return k;
    }
  }
  const code = String(ubigeo || '').trim().slice(0, 2);
  return DEPT_BY_UBIGEO[code] || '';
}

function setMapMarker(departamento) {
  const dot = document.getElementById('mapDot');
  const label = document.getElementById('mapLabel');
  if (!dot || !label) return;
  const key = (departamento || '').toUpperCase().trim();
  const coords = DEPT_COORDS[key];
  if (coords) {
    dot.setAttribute('cx', coords[0]);
    dot.setAttribute('cy', coords[1]);
    dot.style.display = '';
    label.setAttribute('x', coords[0] + 22);
    label.setAttribute('y', coords[1] + 12);
    label.textContent = titleCase(key);
  } else {
    dot.style.display = 'none';
    label.textContent = '';
  }
}

/**
 * Renders a result using the shared component (components.js) - the exact same
 * function the server uses to render /ruc/:ruc pages, so the two can never
 * drift apart visually.
 */
async function renderResult(data, source) {
  currentData = data;
  const container = document.getElementById("resultMount") || document.getElementById("resultContainer");
  const section = document.getElementById("resultContainer");
  const notFound = document.getElementById("notFoundCard");
  if (notFound) notFound.style.display = "none";

  const addr = data.domicilioFiscal || data.domicilio_fiscal || "";
  const dept = deriveDept(data.departamento, addr, data.ubigeo);
  const coords = DEPT_COORDS[dept];

  const pathD = await window.getPeruPath();
  const mapSvg = window.buildPeruMap(
    pathD,
    coords ? { x: coords[0], y: coords[1], name: titleCase(dept) } : null
  );

  const badge =
    source === "live"
      ? `<span class="source-badge source-badge-live">${window.icon ? window.icon("globe") : ""} Verificado en tiempo real</span>`
      : `<span class="source-badge">${window.icon ? window.icon("zap") : ""} Datos oficiales SUNAT</span>`;

  const mapsLink = addr
    ? `<a class="map-btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr + " Peru")}">Ver Mapa</a>`
    : "";

  container.innerHTML = window.CRP.resultPanel(data, { mapSvg: mapSvg, deptName: dept ? titleCase(dept) : "" });

  // Route the "Imprimir ficha" button to the clean, print-ready /ruc/ page so
  // printing never captures the surrounding page (search bar, article, etc.).
  const _pb = container.querySelector('[data-action="print"]');
  if (_pb && data.ruc) _pb.setAttribute("data-print-ruc", data.ruc);

  // The action strip lives INSIDE the white result card (append into .rp),
  // not as a loose bar on the page background beneath it.
  const rp = container.querySelector(".rp");
  if (rp) {
    rp.insertAdjacentHTML(
      "beforeend",
      `<div class="rp-actions">${badge}<span class="rp-actions-spacer"></span>${mapsLink}</div>`
    );
  }

  if (window.applyIcons) window.applyIcons(container);
  section.style.display = "block";
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  saveHistory(data.ruc, data.razonSocial || data.razon_social);
}


// Renders each string in `items` as its own line inside the container - used
// for longer free-text fields (actividad económica, sistema de emisión
// electrónica, padrones) where cramming everything into one <strong> or
// squeezing into small tag-pills reads badly.
function renderLineList(containerId, items, emptyText) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  if (Array.isArray(items) && items.length > 0) {
    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'line-item';
      div.textContent = item;
      el.appendChild(div);
    });
  } else {
    el.textContent = emptyText || '-';
  }
}

function renderTagList(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  (items || []).forEach((item) => {
    const span = document.createElement('span');
    span.className = 'tag-pill';
    span.textContent = item;
    el.appendChild(span);
  });
}

// Several SUNAT fields (sistema de emisión electrónica, comprobantes
// electrónicos, padrones) are only present for a subset of RUCs (mostly
// active businesses with electronic invoicing set up) - hide the whole grid
// row rather than showing an empty "-" line when a RUC genuinely has none.
function toggleRow(rowId, containerId, items, mode) {
  const row = document.getElementById(rowId);
  if (!row) return;
  if (Array.isArray(items) && items.length > 0) {
    if (mode === 'tag') renderTagList(containerId, items);
    else renderLineList(containerId, items);
    row.style.display = '';
  } else {
    row.style.display = 'none';
  }
}

function showNotFound(query, msg) {
  const resultContainer = document.getElementById('resultContainer');
  resultContainer.style.display = 'none';

  let notFoundCard = document.getElementById('notFoundCard');
  if (!notFoundCard) {
    notFoundCard = document.createElement('div');
    notFoundCard.id = 'notFoundCard';
    notFoundCard.className = 'not-found-card';
    resultContainer.parentNode.insertBefore(notFoundCard, resultContainer.nextSibling);
  }

  notFoundCard.innerHTML = `
    <div class="not-found-inner">
      <span class="not-found-icon">${window.icon ? window.icon('triangle-alert') : ''}</span>
      <h3>RUC No Encontrado</h3>
      <p>El RUC <strong>${escapeHtml(query)}</strong> no figura en los registros públicos de SUNAT.</p>
      <span class="not-found-msg">${escapeHtml(msg)}</span>
    </div>
  `;
  notFoundCard.style.display = 'block';
  notFoundCard.scrollIntoView({ behavior: 'smooth' });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fillSearch(val) {
  const input = document.getElementById('searchInput');
  input.value = val;
  fillRucSegments(val);
  executeSearch(val);
}

// Recent-searches sidebar widget - purely client-side (localStorage), never
// sent to the server. Capped at HISTORY_MAX so it stays a quick-glance list,
// not a full log.
const HISTORY_KEY = 'crp_history';
const HISTORY_MAX = 5;

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(ruc, razonSocial) {
  if (!ruc) return;
  let hist = readHistory().filter((h) => h.ruc !== ruc);
  hist.unshift({ ruc, razonSocial: razonSocial || '', ts: Date.now() });
  hist = hist.slice(0, HISTORY_MAX);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  renderHistory();
}

function renderHistory() {
  const hist = readHistory();
  // Two render targets share the same data: the result-time sidebar
  // (#historyList) and the persistent right sticky sidebar (#artHistoryList).
  paintHistory(document.getElementById('historyList'), hist, 'sidebar-history-item', 'sidebar-empty');
  paintHistory(document.getElementById('artHistoryList'), hist, 'aside-hist', 'aside-empty');
}

function paintHistory(container, hist, itemClass, emptyClass) {
  if (!container) return;
  if (hist.length === 0) {
    container.innerHTML = `<p class="${emptyClass}">Tus búsquedas recientes aparecerán aquí.</p>`;
    return;
  }
  container.innerHTML = '';
  hist.forEach((h) => {
    // Real anchors to the clean /ruc/ path rather than JS-only buttons, so the
    // same links are crawlable and open a full server-rendered page.
    const a = document.createElement('a');
    a.className = itemClass;
    a.href = `/ruc/${encodeURIComponent(h.ruc)}`;
    a.innerHTML = `<strong>${escapeHtml(h.ruc)}</strong><span>${escapeHtml(h.razonSocial)}</span>`;
    container.appendChild(a);
  });
}

function copyText(id) {
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text);
  alert('¡Copiado al portapapeles!');
}

function downloadJSON() {
  if (!currentData) return;
  const jsonStr = JSON.stringify(currentData, null, 2);
  navigator.clipboard.writeText(jsonStr);
  alert('¡JSON de la respuesta copiado al portapapeles!');
}

// ---- Bulk verification (homepage "Búsqueda Masiva" tab) -------------------
// Local-DB only (POST /api/ruc/bulk), never the live scraper. Mirrors the
// dedicated /verificar-ruc-multiple/ page, integrated into the shared widget.
let bulkLastRows = null;

async function runBulk() {
  const results = document.getElementById('bulkResults');
  const textEl = document.getElementById('bulkText');
  const fileEl = document.getElementById('bulkFile');
  if (!results) return;

  let raw = textEl ? textEl.value : '';
  if (fileEl && fileEl.files && fileEl.files[0]) {
    try { raw += '\n' + (await fileEl.files[0].text()); } catch { /* ignore */ }
  }

  const rucs = Array.from(new Set(raw.match(/\d{11}/g) || []));
  if (rucs.length === 0) {
    results.style.display = 'block';
    results.innerHTML = '<div class="bulk-msg">No se encontraron números de RUC válidos (11 dígitos) en la lista.</div>';
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  results.style.display = 'block';
  results.innerHTML = '<div class="bulk-msg">Verificando ' + rucs.length + ' RUC…</div>';

  try {
    const res = await fetch('/api/ruc/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rucs })
    });
    const json = await res.json();
    if (!json.success) {
      results.innerHTML = '<div class="bulk-msg">' + escapeHtml(json.error || 'No se pudo procesar la lista.') + '</div>';
      return;
    }
    bulkLastRows = json.results;
    renderBulkTable(json);
  } catch (err) {
    results.innerHTML = '<div class="bulk-msg">Error de conexión: ' + escapeHtml(err.message) + '</div>';
  }
}

function renderBulkTable(json) {
  const results = document.getElementById('bulkResults');
  const rows = json.results || [];
  const found = rows.filter((r) => r.found).length;

  const body = rows.map((r) => {
    const est = (r.estado || '').toUpperCase();
    const cond = (r.condicion || '').toUpperCase();
    const estCls = est === 'ACTIVO' ? 'ok' : est ? 'bad' : 'muted';
    const condCls = cond === 'HABIDO' ? 'ok' : cond ? 'bad' : 'muted';
    return `<tr>
      <td class="mono"><a href="/ruc/${escapeHtml(r.ruc)}">${escapeHtml(r.ruc)}</a></td>
      <td>${r.found ? escapeHtml(r.razonSocial || '') : '<span class="bulk-na">No encontrado</span>'}</td>
      <td>${est ? `<span class="bulk-pill ${estCls}">${escapeHtml(est)}</span>` : '—'}</td>
      <td>${cond ? `<span class="bulk-pill ${condCls}">${escapeHtml(cond)}</span>` : '—'}</td>
    </tr>`;
  }).join('');

  results.innerHTML = `
    <div class="bulk-head">
      <strong>${found} de ${rows.length} encontrados</strong>
      ${json.truncated ? `<span class="bulk-trunc">Se procesaron los primeros ${json.maxPerRequest} RUC.</span>` : ''}
      <button type="button" class="action-btn secondary" onclick="exportBulkCsv()">Exportar CSV</button>
    </div>
    <div class="bulk-table-wrap">
      <table class="bulk-table">
        <thead><tr><th>RUC</th><th>Razón Social</th><th>Estado</th><th>Condición</th></tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function exportBulkCsv() {
  if (!bulkLastRows) return;
  const header = 'RUC,Razon Social,Estado,Condicion\n';
  const csv = header + bulkLastRows.map((r) =>
    [r.ruc, `"${(r.razonSocial || '').replace(/"/g, '""')}"`, r.estado || '', r.condicion || ''].join(',')
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'consulta-ruc-lote.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
