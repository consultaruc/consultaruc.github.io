/**
 * Approximate department centroids in peru-map.svg's 0-1024 viewBox,
 * calibrated visually against the rendered map. Used ONLY to place the
 * decorative location marker - this is not a precise geocode.
 *
 * NOTE: public/app.js carries its own copy for the client-side result card
 * (browser JS can't require() this). If you adjust coordinates here, adjust
 * them there too.
 */
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

/**
 * First two digits of the ubigeo ARE the department code, so a record with a
 * ubigeo can always be placed even when its address is just a street
 * ("AV. MATERIALES NRO. 2828" - no department name anywhere in it, which is
 * common in the reduced padrón).
 */
const DEPT_BY_UBIGEO = {
  '01': 'AMAZONAS', '02': 'ANCASH', '03': 'APURIMAC', '04': 'AREQUIPA',
  '05': 'AYACUCHO', '06': 'CAJAMARCA', '07': 'CALLAO', '08': 'CUSCO',
  '09': 'HUANCAVELICA', '10': 'HUANUCO', '11': 'ICA', '12': 'JUNIN',
  '13': 'LA LIBERTAD', '14': 'LAMBAYEQUE', '15': 'LIMA', '16': 'LORETO',
  '17': 'MADRE DE DIOS', '18': 'MOQUEGUA', '19': 'PASCO', '20': 'PIURA',
  '21': 'PUNO', '22': 'SAN MARTIN', '23': 'TACNA', '24': 'TUMBES',
  '25': 'UCAYALI'
};

/**
 * The reduced padrón often leaves `departamento` empty, but the domicilio
 * fiscal usually ends with "... DEPARTAMENTO - PROVINCIA - DISTRITO".
 *
 * Order matters: the address is tried before the ubigeo because it carries the
 * department SUNAT actually printed on the ficha. Longest name first so
 * "LA LIBERTAD" wins over a stray "LIMA" elsewhere in the string. The ubigeo
 * is the fallback for addresses with no department name in them at all.
 */
function deriveDept(departamento, address, ubigeo) {
  if (departamento) return departamento.toUpperCase().trim();

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

function titleCase(s) {
  return String(s || '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

module.exports = { DEPT_COORDS, deriveDept, titleCase };
