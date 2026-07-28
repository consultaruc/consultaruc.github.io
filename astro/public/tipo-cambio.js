document.addEventListener('DOMContentLoaded', async () => {
  const loader = document.getElementById('rateLoader');
  const content = document.getElementById('rateContent');
  const errorBox = document.getElementById('rateError');

  try {
    const res = await fetch('/api/tipo-cambio');
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || 'No se pudo obtener el tipo de cambio.');
    }

    document.getElementById('valCompra').textContent = json.compra.toFixed(3);
    document.getElementById('valVenta').textContent = json.venta.toFixed(3);
    document.getElementById('fechaActualizacion').textContent = `Tipo de cambio del ${formatFecha(json.fecha)}`;
    var rd = document.getElementById('rateRefDate');
    if (rd) rd.textContent = formatFecha(json.fecha);

    const historyBody = document.getElementById('historyBody');
    historyBody.innerHTML = '';
    (json.historial || []).forEach((row) => {
      const tr = document.createElement('tr');
      // data-label lets the table reflow into labelled cards on mobile
      tr.innerHTML = `<td data-label="Fecha">${formatFecha(row.fecha)}</td>` +
        `<td data-label="Compra">S/ ${row.compra.toFixed(3)}</td>` +
        `<td data-label="Venta">S/ ${row.venta.toFixed(3)}</td>`;
      historyBody.appendChild(tr);
    });

    loader.style.display = 'none';
    content.style.display = 'block';
  } catch (err) {
    loader.style.display = 'none';
    errorBox.textContent = 'No se pudo cargar el tipo de cambio en este momento. Intenta más tarde.';
    errorBox.style.display = 'block';
  }
});

function formatFecha(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}
