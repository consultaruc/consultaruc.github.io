import { countSearchDays } from './db.js';
import { RUC_PROFILES } from './rucProfiles.js';

/**
 * Qué fichas /ruc/:ruc se dejan indexar. Es la única fuente de verdad: la usan
 * renderRucPage.js (noindex sí/no) y sitemap-rucs.xml (qué se ofrece a Google),
 * así que una ficha nunca puede estar en el sitemap y a la vez llevar noindex.
 *
 * Antes bastaba con tener domicilio fiscal, y el padrón lo trae para casi todos
 * los ~18 millones de RUC: en la práctica, todo era indexable. Los datos de
 * Search Console (3 meses hasta oct-2026) dicen que 35 de las 36 empresas del
 * directorio curado se llevan ~10.900 de las ~11.050 impresiones de fichas; el
 * resto de RUC sumó unas pocas impresiones y ningún clic, y las 67 fichas que
 * el sitemap ofrecía sin ser curadas quedaron "Descubiertas, sin indexar" sin
 * que Google llegara a rastrearlas. Millones de páginas de plantilla que no
 * aportan nada son justo lo que Google trata como contenido a escala, así que
 * ahora se indexa por lista, no por defecto.
 */

// Las fichas curadas: el directorio de /empresas-populares/ y las sedes que se
// buscan por separado. La lista vive en rucProfiles.js junto con su texto.
export const CURATED_RUCS = new Set(Object.keys(RUC_PROFILES));

// Fuera de la lista, una ficha se gana el índice con demanda sostenida: buscada
// en el sitio en al menos tantos días distintos (ruc_search guarda 90 días). Un
// solo pico - un bot, alguien probando - no basta.
export const MIN_SEARCH_DAYS = 3;

export function isIndexableRuc(ruc, record) {
  if (CURATED_RUCS.has(ruc)) return true;
  // Además de la demanda, la ficha tiene que estar enriquecida (tipo de
  // contribuyente, actividad, comprobantes): con sólo los datos del padrón es
  // la misma plantilla con otro nombre.
  if (!record || !record.tipoContribuyente || !record.domicilioFiscal) return false;
  return countSearchDays(ruc) >= MIN_SEARCH_DAYS;
}
