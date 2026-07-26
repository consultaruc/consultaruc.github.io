let lastBulkResults = [];

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('bulkFile');
  const textInput = document.getElementById('bulkText');
  const processBtn = document.getElementById('processBulkBtn');
  const statusEl = document.getElementById('bulkStatus');
  const exportBtn = document.getElementById('exportCsvBtn');

  const fileNameEl = document.getElementById('bulkFileName');
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    if (fileNameEl) fileNameEl.textContent = '✓ ' + file.name;
    const text = await file.text();
    textInput.value = text;
  });

  processBtn.addEventListener('click', async () => {
    const raw = textInput.value || '';
    // Extract every 11-digit run of digits, regardless of whether the
    // source is newline-separated, comma-separated, or a CSV with other
    // columns mixed in.
    const rucs = [...new Set((raw.match(/\d{11}/g) || []))];

    if (rucs.length === 0) {
      statusEl.textContent = 'No se encontraron números de RUC válidos (11 dígitos) en el texto.';
      return;
    }

    statusEl.textContent = `Verificando ${rucs.length} RUC...`;
    processBtn.disabled = true;

    try {
      const res = await fetch('/api/ruc/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rucs })
      });
      const json = await res.json();

      if (!json.success) {
        statusEl.textContent = json.error || 'Error al procesar la verificación.';
        return;
      }

      lastBulkResults = json.results;
      renderBulkResults(json);
      statusEl.textContent = json.truncated
        ? `Se procesaron los primeros ${json.maxPerRequest} RUC (límite por consulta).`
        : `Se procesaron ${json.total} RUC.`;
    } catch (err) {
      statusEl.textContent = 'Error de conexión: ' + err.message;
    } finally {
      processBtn.disabled = false;
    }
  });

  exportBtn.addEventListener('click', () => {
    if (lastBulkResults.length === 0) return;
    const header = 'RUC,Razon Social,Estado,Condicion,Encontrado\n';
    const rows = lastBulkResults
      .map((r) => [r.ruc, r.razonSocial || '', r.estado || '', r.condicion || '', r.found ? 'SI' : 'NO'].map(csvEscape).join(','))
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'verificacion-ruc.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
});

function csvEscape(value) {
  const v = String(value ?? '');
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function renderBulkResults(json) {
  const section = document.getElementById('bulkResultsSection');
  const summary = document.getElementById('bulkSummary');
  const body = document.getElementById('bulkResultsBody');

  const foundCount = json.results.filter((r) => r.found).length;
  summary.textContent = `Resultados: ${foundCount} de ${json.total} encontrados`;

  body.innerHTML = '';
  json.results.forEach((r) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border-color)';

    const estadoBadge = r.estado
      ? `<span class="status-pill ${r.estado === 'ACTIVO' ? 'state-active' : 'state-inactive'}" style="font-size:0.7rem;padding:0.2rem 0.6rem;">${escapeHtml(r.estado)}</span>`
      : '-';
    const condBadge = r.condicion
      ? `<span class="status-pill ${r.condicion === 'HABIDO' ? 'cond-habido' : 'cond-nohabido'}" style="font-size:0.7rem;padding:0.2rem 0.6rem;">${escapeHtml(r.condicion)}</span>`
      : '-';

    tr.innerHTML = `
      <td style="padding:0.6rem; font-family:monospace;">${escapeHtml(r.ruc)}</td>
      <td style="padding:0.6rem;">${r.found ? escapeHtml(r.razonSocial || '-') : '<em style="color:var(--text-muted);">No encontrado</em>'}</td>
      <td style="padding:0.6rem;">${estadoBadge}</td>
      <td style="padding:0.6rem;">${condBadge}</td>
    `;
    body.appendChild(tr);
  });

  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth' });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
