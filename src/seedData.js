const { bulkInsert, rebuildFtsIndex } = require('./db');

// Hand-curated demo companies for a fresh install before the full SUNAT dump
// has been ingested (the bulk sync wipes and replaces this data anyway, so
// this only matters for a brief window on first run).
//
// IMPORTANT: every RUC below was independently verified against SUNAT's live
// portal on 2026-07-23 via src/liveScraper.js before being written here.
// The previous version of this file inherited a popular but WRONG "sample
// RUC" list (from the original project plan / an earlier Gemini-generated
// build) that mislabeled real RUCs with the wrong company names:
//   - 20100070970 was labeled "ALICORP S.A.A." - it's actually
//     SUPERMERCADOS PERUANOS S.A. (Plaza Vea/Vivanda's parent company).
//   - 20100132592 was labeled "CERVECERIA BACKUS Y JOHNSTON" - it's
//     actually TOYOTA DEL PERU S.A.
// Do not add a RUC here without confirming it live first - showing a real
// person's/company's data under the wrong name is a correctness and trust
// problem, not a cosmetic one.
const seedCompanies = [
  {
    ruc: '20100070970',
    razon_social: "SUPERMERCADOS PERUANOS SOCIEDAD ANONIMA 'O ' S.P.S.A.",
    estado: 'ACTIVO',
    condicion: 'HABIDO',
    ubigeo: '150140',
    departamento: 'LIMA',
    direccion: 'CAL.MORELLI NRO. 181 INT. P-2 LIMA - LIMA - SAN BORJA',
    tipo_contribuyente: 'SOCIEDAD ANONIMA',
    nombre_comercial: null,
    fecha_inscripcion: '09/10/1992',
    fecha_inicio_actividades: '01/06/1979',
    actividad_economica: [
      'Principal - 4711 - VENTA AL POR MENOR EN COMERCIOS NO ESPECIALIZADOS CON PREDOMINIO DE LA VENTA DE ALIMENTOS, BEBIDAS O TABACO',
      'Secundaria 1 - 4719 - OTRAS ACTIVIDADES DE VENTA AL POR MENOR EN COMERCIOS NO ESPECIALIZADOS',
      'Secundaria 2 - 6810 - ACTIVIDADES INMOBILIARIAS REALIZADAS CON BIENES PROPIOS O ARRENDADOS'
    ],
    comercio_exterior: 'SIN ACTIVIDAD',
    sistema_emision: 'MECANIZADO',
    sistema_contabilidad: 'COMPUTARIZADO',
    comprobantes_pago: [
      'FACTURA',
      'BOLETA DE VENTA',
      'LIQUIDACION DE COMPRA',
      'NOTA DE CREDITO',
      'NOTA DE DEBITO',
      'GUIA DE REMISION - REMITENTE',
      'COMPROBANTE DE RETENCION'
    ]
  },
  {
    ruc: '20100047218',
    razon_social: 'BANCO DE CREDITO DEL PERU',
    estado: 'ACTIVO',
    condicion: 'HABIDO',
    ubigeo: '150114',
    departamento: 'LIMA',
    direccion: 'JR. CENTENARIO NRO. 156 URB. LADERAS DE MELGAREJO LIMA - LIMA - LA MOLINA',
    tipo_contribuyente: 'SOCIEDAD ANONIMA',
    nombre_comercial: 'BANCO DE CREDITO DEL PERU',
    fecha_inscripcion: '09/10/1992',
    fecha_inicio_actividades: '09/04/1889',
    actividad_economica: [
      'Principal - 6419 - OTROS TIPOS DE INTERMEDIACIÓN MONETARIA',
      'Secundaria 1 - 6491 - ARRENDAMIENTO FINANCIERO'
    ],
    comercio_exterior: 'SIN ACTIVIDAD',
    sistema_emision: 'MANUAL',
    sistema_contabilidad: 'COMPUTARIZADO',
    comprobantes_pago: [
      'FACTURA',
      'NOTA DE CREDITO',
      'GUIA DE REMISION - REMITENTE',
      'COMPROBANTE DE RETENCION',
      'DOCUMENTO DE ATRIBUCION',
      'GUIA DE REMISION - TRANSPORTISTA'
    ]
  },
  {
    ruc: '20100132592',
    razon_social: 'TOYOTA DEL PERU S A',
    estado: 'ACTIVO',
    condicion: 'HABIDO',
    ubigeo: null,
    departamento: null,
    direccion: null,
    tipo_contribuyente: null,
    nombre_comercial: null,
    fecha_inscripcion: null,
    fecha_inicio_actividades: null,
    actividad_economica: null,
    comercio_exterior: null,
    sistema_emision: null,
    sistema_contabilidad: null,
    comprobantes_pago: null
  }
];

function seed() {
  console.log('[Seed] Indexing curated demo companies...');
  bulkInsert(seedCompanies);
  rebuildFtsIndex();
  console.log('[Seed] Demo data indexed and searchable.');
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
