/**
 * Fichas curadas: las empresas y entidades del directorio (/empresas-populares/)
 * más las sedes que la gente busca por separado. Son las únicas fichas /ruc/
 * que se indexan siempre (ver indexableRucs.js), y por eso son las únicas que
 * llevan texto escrito a mano.
 *
 * - brand: el nombre con el que la gente busca ("essalud ruc", "ruc bcp"). Va
 *   primero en el <title> y en el <h1>; la razón social de SUNAT sigue en la
 *   ficha y en el schema como legalName.
 * - art: 'el' / 'la' si la marca se usa con artículo ("el RUC del BCP", "de la
 *   SUNAT"); sin él, la marca va sola ("el RUC de Interbank").
 * - name: nombre completo legible, el mismo de la tarjeta del directorio.
 * - about: una o dos frases con hechos estables (qué es, a qué grupo
 *   pertenece). Nada que caduque: ni cifras, ni rankings, ni años.
 * - sector: la sección del directorio; da los enlaces "del mismo sector".
 * - group: entidades hermanas; se enlazan entre sí en su ficha.
 * - guide: { href, label } de una guía propia del sitio sobre esa entidad.
 * - directory: false para las sedes que no tienen tarjeta en el directorio.
 *
 * Si se añade una empresa al directorio, su perfil va aquí también.
 */

export const SECTORS = {
  banca: 'Banca y Finanzas',
  retail: 'Retail y Consumo',
  automotriz: 'Automotriz',
  telecom: 'Telecomunicaciones',
  energia: 'Energía, Industria y Minería',
  estado: 'Sector Público'
};

const CORP = 'Corporation';
const GOV = 'GovernmentOrganization';

export const RUC_PROFILES = {
  // ── Banca y Finanzas ──────────────────────────────────────────────────────
  '20100047218': { art: 'el', brand: 'BCP', name: 'Banco de Crédito del Perú', sector: 'banca', type: CORP, group: 'Credicorp',
    about: 'El Banco de Crédito del Perú (BCP) es uno de los principales bancos del país y forma parte del grupo financiero Credicorp.' },
  '20100053455': { brand: 'Interbank', name: 'Banco Internacional del Perú', sector: 'banca', type: CORP, group: 'Intercorp',
    about: 'Interbank es la marca del Banco Internacional del Perú, uno de los principales bancos del país, que forma parte del grupo Intercorp.' },
  '20100130204': { brand: 'BBVA Perú', name: 'Banco BBVA Perú', sector: 'banca', type: CORP,
    about: 'BBVA Perú es la filial peruana del grupo financiero español BBVA y uno de los principales bancos del país.' },
  '20100043140': { brand: 'Scotiabank Perú', name: 'Scotiabank Perú', sector: 'banca', type: CORP,
    about: 'Scotiabank Perú es la filial en el país del banco canadiense Scotiabank.' },
  '20100105862': { art: 'el', brand: 'Banco Pichincha', name: 'Banco Pichincha', sector: 'banca', type: CORP,
    about: 'Banco Pichincha opera en el Perú como parte del grupo financiero ecuatoriano del mismo nombre.' },
  '20382036655': { brand: 'Mibanco', name: 'Mibanco', sector: 'banca', type: CORP, group: 'Credicorp',
    about: 'Mibanco es un banco especializado en créditos para la micro y pequeña empresa, y forma parte del grupo Credicorp.' },
  '20100030595': { art: 'el', brand: 'Banco de la Nación', name: 'Banco de la Nación', sector: 'banca', type: GOV,
    about: 'El Banco de la Nación es el banco del Estado peruano: actúa como agente financiero del Estado y atiende pagos y cobros del sector público.' },

  // ── Retail y Consumo ──────────────────────────────────────────────────────
  '20100070970': { brand: 'Plaza Vea', name: 'Supermercados Peruanos', sector: 'retail', type: CORP, group: 'Intercorp',
    about: 'Supermercados Peruanos es la empresa que opera los supermercados Plaza Vea y Vivanda, y forma parte de InRetail, del grupo Intercorp.' },
  '20109072177': { brand: 'Cencosud', name: 'Cencosud Retail Perú (Metro)', sector: 'retail', type: CORP, group: 'Cencosud',
    about: 'Cencosud Retail Perú es la empresa del grupo chileno Cencosud que opera los supermercados Metro en el país.' },
  '20508565934': { brand: 'Tottus', name: 'Hipermercados Tottus', sector: 'retail', type: CORP, group: 'Falabella',
    about: 'Hipermercados Tottus opera la cadena de supermercados Tottus y forma parte del grupo Falabella.' },
  '20100106915': { brand: 'Wong', name: 'E. Wong', sector: 'retail', type: CORP, group: 'Cencosud',
    about: 'E. Wong opera los supermercados Wong y forma parte del grupo chileno Cencosud.' },
  '20100128056': { brand: 'Saga Falabella', name: 'Saga Falabella', sector: 'retail', type: CORP, group: 'Falabella',
    about: 'Saga Falabella opera las tiendas por departamento Falabella en el Perú y pertenece al grupo chileno Falabella.' },
  '20337564373': { brand: 'Ripley', name: 'Tiendas Ripley', sector: 'retail', type: CORP,
    about: 'Es la empresa que opera las tiendas por departamento Ripley en el Perú, parte del grupo chileno Ripley.' },
  '20389230724': { brand: 'Sodimac', name: 'Sodimac Perú', sector: 'retail', type: CORP, group: 'Falabella',
    about: 'Sodimac Perú opera las tiendas de mejoramiento del hogar Sodimac y forma parte del grupo Falabella.' },
  '20331066703': { brand: 'Inkafarma', name: 'InRetail Pharma (Inkafarma)', sector: 'retail', type: CORP, group: 'Intercorp',
    about: 'InRetail Pharma es la empresa que opera la cadena de boticas Inkafarma y forma parte de InRetail, del grupo Intercorp.' },
  '20100055237': { brand: 'Alicorp', name: 'Alicorp', sector: 'retail', type: CORP, group: 'Grupo Romero',
    about: 'Alicorp es una de las principales empresas de consumo masivo del Perú y forma parte del Grupo Romero.' },
  '20100190797': { brand: 'Gloria', name: 'Gloria', sector: 'retail', type: CORP, group: 'Grupo Gloria',
    about: 'Gloria es una de las principales empresas lácteas del Perú y la empresa insignia del Grupo Gloria.' },
  '20100154308': { brand: 'San Fernando', name: 'San Fernando', sector: 'retail', type: CORP,
    about: 'San Fernando es una empresa peruana productora de carne de pollo, pavo y cerdo, y de alimentos procesados.' },
  '20100113610': { brand: 'Backus', name: 'Unión de Cervecerías Peruanas Backus y Johnston', sector: 'retail', type: CORP,
    about: 'Backus es una cervecera peruana que forma parte del grupo cervecero AB InBev.' },
  '20263322496': { brand: 'Nestlé Perú', name: 'Nestlé Perú', sector: 'retail', type: CORP,
    about: 'Nestlé Perú es la filial peruana de la multinacional suiza de alimentos Nestlé.' },
  '20101024645': { brand: 'Arca Continental Lindley', name: 'Arca Continental Lindley (Coca-Cola)', sector: 'retail', type: CORP,
    about: 'Arca Continental Lindley es la embotelladora de Coca-Cola e Inca Kola en el Perú y forma parte del grupo mexicano Arca Continental.' },
  '20100152941': { brand: 'Kimberly-Clark Perú', name: 'Kimberly-Clark Perú', sector: 'retail', type: CORP,
    about: 'Kimberly-Clark Perú es la filial peruana de Kimberly-Clark, fabricante de productos de higiene y cuidado personal.' },

  // ── Automotriz ────────────────────────────────────────────────────────────
  '20100132592': { brand: 'Toyota del Perú', name: 'Toyota del Perú', sector: 'automotriz', type: CORP,
    about: 'Toyota del Perú es la empresa que distribuye los vehículos Toyota en el país.' },
  '20344877158': { brand: 'Derco Perú', name: 'Derco Perú', sector: 'automotriz', type: CORP,
    about: 'Derco Perú es una distribuidora automotriz de origen chileno que comercializa varias marcas de vehículos en el país.' },

  // ── Telecomunicaciones ────────────────────────────────────────────────────
  '20467534026': { brand: 'Claro', name: 'América Móvil Perú (Claro)', sector: 'telecom', type: CORP,
    about: 'América Móvil Perú opera la marca Claro en el país y pertenece al grupo mexicano América Móvil.' },
  '20106897914': { brand: 'Entel Perú', name: 'Entel Perú', sector: 'telecom', type: CORP,
    about: 'Entel Perú es la filial peruana del grupo chileno de telecomunicaciones Entel.' },
  '20100017491': { brand: 'Integratel', name: 'Integratel Perú (ex Telefónica del Perú)', sector: 'telecom', type: CORP,
    about: 'Integratel Perú es la razón social que adoptó la antigua Telefónica del Perú.' },

  // ── Energía, Industria y Minería ──────────────────────────────────────────
  '20331898008': { brand: 'Luz del Sur', name: 'Luz del Sur', sector: 'energia', type: CORP,
    about: 'Luz del Sur es la empresa de distribución eléctrica que atiende la zona sur de Lima.' },
  '20100128218': { brand: 'Petroperú', name: 'Petróleos del Perú', sector: 'energia', type: CORP,
    about: 'Petroperú es la empresa petrolera del Estado peruano.' },
  '20330262428': { brand: 'Antamina', name: 'Compañía Minera Antamina', sector: 'energia', type: CORP,
    about: 'Compañía Minera Antamina opera una mina de cobre y zinc en la región Áncash.' },
  '20312372895': { brand: 'Yura', name: 'Yura', sector: 'energia', type: CORP, group: 'Grupo Gloria',
    about: 'Yura es una empresa cementera con sede en Arequipa que forma parte del Grupo Gloria.' },
  '20370146994': { brand: 'Aceros Arequipa', name: 'Corporación Aceros Arequipa', sector: 'energia', type: CORP,
    about: 'Corporación Aceros Arequipa es una de las principales empresas siderúrgicas del Perú.' },
  '20100039207': { brand: 'Ransa', name: 'Ransa Comercial', sector: 'energia', type: CORP, group: 'Grupo Romero',
    about: 'Ransa es un operador logístico que forma parte del Grupo Romero.' },

  // ── Sector Público ────────────────────────────────────────────────────────
  '20131312955': { art: 'la', brand: 'SUNAT', name: 'Superintendencia Nacional de Aduanas y de Administración Tributaria', sector: 'estado', type: GOV, guide: { href: '/sat-lima-vs-sunat/', label: 'SAT de Lima vs. SUNAT: qué trámite corresponde a cada una' },
    about: 'La SUNAT es la entidad del Estado que administra los tributos internos y las aduanas del Perú, y la que asigna el número de RUC.' },
  '20131257750': { brand: 'EsSalud', name: 'Seguro Social de Salud', sector: 'estado', type: GOV, guide: { href: '/consulta-essalud/', label: 'Cómo consultar tu afiliación a EsSalud y la de tus derechohabientes' },
    about: 'EsSalud es el seguro social de salud del Perú: da cobertura a los trabajadores formales y a sus derechohabientes.' },
  '20295613620': { art: 'el', brand: 'RENIEC', name: 'Registro Nacional de Identificación y Estado Civil', sector: 'estado', type: GOV,
    about: 'El RENIEC es la entidad que emite el DNI y administra el registro de identificación y estado civil de los peruanos.' },
  '20131370301': { art: 'el', brand: 'Ministerio Público', name: 'Ministerio Público – Fiscalía de la Nación', sector: 'estado', type: GOV, group: 'Ministerio Público',
    about: 'El Ministerio Público – Fiscalía de la Nación es el organismo autónomo que conduce la investigación del delito y defiende la legalidad. Este RUC corresponde a su Gerencia General; varias gerencias administrativas regionales tienen RUC propio.' },
  '20456318429': { art: 'el', brand: 'Ministerio Público Arequipa', name: 'Ministerio Público – Gerencia Administrativa de Arequipa', sector: 'estado', type: GOV, group: 'Ministerio Público', directory: false,
    about: 'Es la unidad administrativa del Ministerio Público en Arequipa, con RUC propio, distinto del de la Gerencia General en Lima.' },
  '20491232057': { art: 'el', brand: 'Ministerio Público Cusco', name: 'Ministerio Público – Gerencia Administrativa del Cusco', sector: 'estado', type: GOV, group: 'Ministerio Público', directory: false,
    about: 'Es la unidad administrativa del Ministerio Público en Cusco, con RUC propio, distinto del de la Gerencia General en Lima.' },
  '20539961919': { art: 'el', brand: 'Ministerio Público La Libertad', name: 'Ministerio Público – Gerencia Administrativa de La Libertad', sector: 'estado', type: GOV, group: 'Ministerio Público', directory: false,
    about: 'Es la unidad administrativa del Ministerio Público en La Libertad, con RUC propio, distinto del de la Gerencia General en Lima.' },
  '20530099645': { art: 'el', brand: 'Ministerio Público Piura', name: 'Ministerio Público – Gerencia Administrativa de Piura', sector: 'estado', type: GOV, group: 'Ministerio Público', directory: false,
    about: 'Es la unidad administrativa del Ministerio Público en Piura, con RUC propio, distinto del de la Gerencia General en Lima.' },
  '20131380951': { art: 'la', brand: 'Municipalidad de Lima', name: 'Municipalidad Metropolitana de Lima', sector: 'estado', type: GOV,
    about: 'La Municipalidad Metropolitana de Lima (MML) es el gobierno local de la provincia de Lima.' },
  '20336951527': { art: 'el', brand: 'MIMP', name: 'Ministerio de la Mujer y Poblaciones Vulnerables', sector: 'estado', type: GOV,
    about: 'El MIMP es el ministerio a cargo de las políticas de igualdad de género y de protección de las poblaciones vulnerables.' },
  '20504743307': { art: 'el', brand: 'Ministerio de Vivienda', name: 'Ministerio de Vivienda, Construcción y Saneamiento', sector: 'estado', type: GOV,
    about: 'El Ministerio de Vivienda, Construcción y Saneamiento dirige las políticas nacionales de vivienda, urbanismo, construcción y saneamiento.' },
  '20484004421': { art: 'el', brand: 'Gobierno Regional Piura', name: 'Gobierno Regional Piura', sector: 'estado', type: GOV,
    about: 'El Gobierno Regional Piura es el gobierno de la región Piura.' },
  '20154477374': { art: 'la', brand: 'Municipalidad de Piura', name: 'Municipalidad Provincial de Piura', sector: 'estado', type: GOV,
    about: 'La Municipalidad Provincial de Piura es el gobierno local de la provincia de Piura.' },
  '20131378620': { art: 'la', brand: 'Municipalidad de Ate', name: 'Municipalidad Distrital de Ate', sector: 'estado', type: GOV,
    about: 'La Municipalidad Distrital de Ate es el gobierno local del distrito de Ate, en Lima.' },
  '20154491873': { art: 'la', brand: 'Municipalidad de Ilo', name: 'Municipalidad Provincial de Ilo', sector: 'estado', type: GOV,
    about: 'La Municipalidad Provincial de Ilo es el gobierno local de la provincia de Ilo, en Moquegua.' },
  '20145496170': { art: 'la', brand: 'UNA Puno', name: 'Universidad Nacional del Altiplano', sector: 'estado', type: 'CollegeOrUniversity',
    about: 'La Universidad Nacional del Altiplano (UNA Puno) es una universidad pública con sede en la ciudad de Puno.' }
};

export function getProfile(ruc) {
  return RUC_PROFILES[ruc] || null;
}

/** Otras fichas del mismo grupo (BCP ↔ Mibanco, sedes del Ministerio Público…). */
export function groupSiblings(ruc) {
  const p = RUC_PROFILES[ruc];
  if (!p || !p.group) return [];
  return Object.entries(RUC_PROFILES)
    .filter(([r, q]) => r !== ruc && q.group === p.group)
    .map(([r, q]) => ({ ruc: r, ...q }));
}

/** Otras tarjetas del mismo sector del directorio, sin repetir las del grupo. */
export function sectorSiblings(ruc, limit = 6) {
  const p = RUC_PROFILES[ruc];
  if (!p) return [];
  return Object.entries(RUC_PROFILES)
    .filter(([r, q]) => r !== ruc && q.sector === p.sector && q.directory !== false && (!p.group || q.group !== p.group))
    .slice(0, limit)
    .map(([r, q]) => ({ ruc: r, ...q }));
}
