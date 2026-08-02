/**
 * Gráfico de evolución del tipo de cambio.
 *
 * Las cifras, la variación y la tabla del histórico las pinta el servidor
 * (ver src/pages/tipo-de-cambio-sunat/index.astro): antes todo eso se pedía
 * por fetch al montar, lo que dejaba la tarjeta en display:none y obligaba a
 * reservar su alto a mano para no empujar el artículo. Aquí sólo queda lo que
 * de verdad necesita el navegador: dibujar el SVG y responder al puntero.
 *
 * La serie se lee del <script type="application/json"> que emite la propia
 * página, no de /api/tipo-cambio, para que el gráfico y la tabla no puedan
 * mostrar datos distintos.
 */
document.addEventListener('DOMContentLoaded', () => {
  const raw = document.getElementById('rateSeries');
  const svg = document.getElementById('rateChart');
  if (!raw || !svg) return;

  let serie;
  try {
    // Llega del más reciente al más antiguo; el eje X va al revés.
    serie = JSON.parse(raw.textContent).reverse();
  } catch (err) {
    return;
  }
  if (serie.length < 2) return;

  const readout = document.getElementById('rateReadout');
  const figure = svg.closest('.rate-chart');

  const W = 700, H = 210, PAD = 12;
  const valores = serie.flatMap((r) => [r[1], r[2]]);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  // Sin margen, una serie casi plana (lo normal aquí) se pegaría a los bordes
  // y parecería mucho más volátil de lo que es.
  const margen = (max - min) * 0.22 || 0.01;
  const lo = min - margen;
  const hi = max + margen;

  const X = (i) => PAD + (i / (serie.length - 1)) * (W - PAD * 2);
  const Y = (v) => H - PAD - ((v - lo) / (hi - lo)) * (H - PAD * 2);

  const linea = (k) =>
    serie.map((r, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(r[k]).toFixed(1)}`).join(' ');

  const lc = linea(1);
  const lv = linea(2);
  const area = `${lv} L${X(serie.length - 1).toFixed(1)} ${H - PAD} L${X(0).toFixed(1)} ${H - PAD} Z`;

  let grid = '';
  for (let g = 0; g <= 3; g++) {
    const gy = (PAD + (g / 3) * (H - PAD * 2)).toFixed(1);
    grid += `<line class="rate-chart-grid" x1="${PAD}" y1="${gy}" x2="${W - PAD}" y2="${gy}"></line>`;
  }

  svg.innerHTML =
    grid +
    `<path class="rate-chart-area" d="${area}"></path>` +
    `<path class="rate-chart-line-v" d="${lv}"></path>` +
    `<path class="rate-chart-line-c" d="${lc}"></path>` +
    `<line class="rate-chart-cursor" x1="0" y1="${PAD}" x2="0" y2="${H - PAD}"></line>` +
    '<circle class="rate-chart-dot-c" r="3.5"></circle>' +
    '<circle class="rate-chart-dot-v" r="3.5"></circle>';

  const cursor = svg.querySelector('.rate-chart-cursor');
  const dotC = svg.querySelector('.rate-chart-dot-c');
  const dotV = svg.querySelector('.rate-chart-dot-v');

  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const fechaCorta = (iso) => {
    const [, m, d] = iso.split('-');
    return `${parseInt(d, 10)} ${MESES[parseInt(m, 10) - 1]}`;
  };

  const escribir = (r) => {
    if (!readout) return;
    readout.innerHTML =
      `<span class="ro-d">${fechaCorta(r[0])}</span>` +
      `<span class="ro-c">C ${r[1].toFixed(3)}</span>` +
      `<span class="ro-v">V ${r[2].toFixed(3)}</span>`;
  };

  const mostrar = (i) => {
    const r = serie[i];
    cursor.setAttribute('x1', X(i));
    cursor.setAttribute('x2', X(i));
    dotC.setAttribute('cx', X(i));
    dotC.setAttribute('cy', Y(r[1]));
    dotV.setAttribute('cx', X(i));
    dotV.setAttribute('cy', Y(r[2]));
    if (figure) figure.classList.add('is-hover');
    escribir(r);
  };

  const reiniciar = () => {
    if (figure) figure.classList.remove('is-hover');
    escribir(serie[serie.length - 1]);
  };

  const indiceEn = (clientX) => {
    const caja = svg.getBoundingClientRect();
    const px = ((clientX - caja.left) / caja.width) * W;
    const i = Math.round(((px - PAD) / (W - PAD * 2)) * (serie.length - 1));
    return Math.max(0, Math.min(serie.length - 1, i));
  };

  svg.addEventListener('mousemove', (ev) => mostrar(indiceEn(ev.clientX)));
  svg.addEventListener('mouseleave', reiniciar);
  svg.addEventListener('touchstart', (ev) => mostrar(indiceEn(ev.touches[0].clientX)), { passive: true });
  svg.addEventListener('touchmove', (ev) => mostrar(indiceEn(ev.touches[0].clientX)), { passive: true });
  svg.addEventListener('touchend', reiniciar);

  reiniciar();
});
