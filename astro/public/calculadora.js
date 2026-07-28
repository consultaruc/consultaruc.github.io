// UIT 2026 = S/ 5,500 (D.S. 301-2025-EF). Simplified orientation tool, not an
// official calculation - the page says so explicitly.
const UIT_2026 = 5500;

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('calcBtn');
  btn.addEventListener('click', calcular);
});

function calcular() {
  const ingreso = parseFloat(document.getElementById('ingresoAnual').value) || 0;
  const gastoInput = document.getElementById('gastoAnual').value;
  const gasto = gastoInput ? parseFloat(gastoInput) || 0 : 0;
  const rentaNeta = Math.max(ingreso - gasto, 0);

  const results = [
    calcularNrus(ingreso),
    calcularRer(ingreso),
    calcularRmt(rentaNeta, ingreso),
    calcularGeneral(rentaNeta)
  ];

  const body = document.getElementById('calcBody');
  body.innerHTML = '';
  results.forEach((r) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding:0.6rem;"><strong>${r.nombre}</strong></td>
      <td style="padding:0.6rem; text-align:center;">${r.aplica ? '✅ Sí' : '❌ No'}</td>
      <td style="padding:0.6rem; text-align:center;">${r.aplica ? 'S/ ' + r.impuesto.toLocaleString('es-PE', { maximumFractionDigits: 0 }) : '-'}</td>
      <td style="padding:0.6rem; text-align:center;">${r.tasa}</td>
    `;
    body.appendChild(tr);
  });

  document.getElementById('calcResults').style.display = 'block';
  document.getElementById('calcResults').scrollIntoView({ behavior: 'smooth' });
}

function calcularNrus(ingresoAnual) {
  const LIMITE = 96000;
  if (ingresoAnual > LIMITE) {
    return { nombre: 'NRUS', aplica: false, impuesto: 0, tasa: 'Cuota fija S/20-50/mes' };
  }
  const promedioMensual = ingresoAnual / 12;
  const cuotaMensual = promedioMensual <= 5000 ? 20 : 50;
  return { nombre: 'NRUS', aplica: true, impuesto: cuotaMensual * 12, tasa: `Cuota fija S/${cuotaMensual}/mes` };
}

function calcularRer(ingresoAnual) {
  const LIMITE = 525000;
  if (ingresoAnual > LIMITE) {
    return { nombre: 'RER', aplica: false, impuesto: 0, tasa: '1.5% mensual' };
  }
  return { nombre: 'RER', aplica: true, impuesto: ingresoAnual * 0.015, tasa: '1.5% de ingresos netos' };
}

function calcularRmt(rentaNeta, ingresoAnual) {
  const LIMITE = 1700 * UIT_2026;
  if (ingresoAnual > LIMITE) {
    return { nombre: 'MYPE Tributario (RMT)', aplica: false, impuesto: 0, tasa: '10% / 29.5%' };
  }
  const tramo1 = 15 * UIT_2026;
  const impuesto = rentaNeta <= tramo1 ? rentaNeta * 0.1 : tramo1 * 0.1 + (rentaNeta - tramo1) * 0.295;
  return { nombre: 'MYPE Tributario (RMT)', aplica: true, impuesto, tasa: '10% hasta 15 UIT + 29.5%' };
}

function calcularGeneral(rentaNeta) {
  return { nombre: 'Régimen General', aplica: true, impuesto: rentaNeta * 0.295, tasa: '29.5% de la renta neta' };
}
