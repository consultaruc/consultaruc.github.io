import fs from 'node:fs';
import path from 'node:path';
import { countRecords } from './db.js';
import { isIndexableRuc } from './indexableRucs.js';
import { getProfile, groupSiblings, sectorSiblings, SECTORS } from './rucProfiles.js';
import { DEPT_COORDS, deriveDept, titleCase } from './geo.js';
import { renderNav } from './nav.js';
import * as CRP from './components.js';

export function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * No domain is registered yet, so derive it from the request. Set SITE_URL
 * in the environment once the real domain is live so canonical/sitemap URLs
 * are stable regardless of which host header we're reached on.
 */
export function siteOrigin() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  return 'https://consultaruc-pe.com';
}

// Inlined once at boot so each SSR page ships the map without an extra
// request. Anchored on process.cwd() (Astro's public/ dir), not the module's
// own location - see db.js for why.
const PERU_MAP_PATH = (() => {
  try {
    const svg = fs.readFileSync(path.join(process.cwd(), 'public', 'peru-map.svg'), 'utf8');
    const m = svg.match(/<path d="([\s\S]*?)"/);
    return m ? m[1] : '';
  } catch {
    return '';
  }
})();

/**
 * Colour for a status pill. Only genuinely positive states go green - SUNAT
 * also returns things like "NO APLICABLE", which shouldn't be dressed up as a
 * pass, and "NO HABIDO", which is a warning rather than a hard failure.
 */
export function pillTone(value) {
  const v = (value || '').toUpperCase();
  if (v === 'ACTIVO' || v === 'HABIDO') return 'ok';
  if (v === 'NO HABIDO' || v === 'SUSPENSION TEMPORAL') return 'warn';
  if (v === 'BAJA DE OFICIO' || v.startsWith('BAJA')) return 'bad';
  return 'neutral';
}

export function renderBadgeHtml(ruc, record, theme, origin) {
  const ok = !!record;
  const estado = ok ? record.estado || '' : '';
  const condicion = ok ? record.condicion || '' : '';
  const dark = theme === 'dark';

  const accent = !ok ? '#94A3B8' : estado === 'ACTIVO' ? '#16A34A' : '#DC2626';
  const name = ok ? record.razonSocial : 'RUC no registrado';

  const pills = ok
    ? [estado, condicion].filter(Boolean).map((v) => `<span class="pill ${pillTone(v)}">${escapeHtml(v)}</span>`).join('')
    : '<span class="pill neutral">Sin registro</span>';

  const c = dark
    ? { bg: '#111C33', border: 'rgba(255,255,255,0.10)', name: '#F1F5F9', muted: '#93A3BC', ruc: '#CBD5E1', shadow: '0 1px 2px rgba(0,0,0,.4)' }
    : { bg: '#FFFFFF', border: '#E4E9F0', name: '#14213D', muted: '#69778C', ruc: '#334155', shadow: '0 1px 2px rgba(16,33,61,.05), 0 4px 14px -6px rgba(16,33,61,.14)' };

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="robots" content="noindex">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{height:100%}
  body{
    font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
    background:transparent;padding:1px;
  }
  a{
    display:flex;height:100%;width:100%;text-decoration:none;overflow:hidden;
    background:${c.bg};border:1px solid ${c.border};border-radius:12px;
    box-shadow:${c.shadow};transition:box-shadow .18s ease,transform .18s ease;
  }
  a:hover{transform:translateY(-1px);box-shadow:0 3px 6px rgba(16,33,61,.08),0 10px 24px -8px rgba(16,33,61,.22)}
  .accent{width:4px;flex:0 0 4px;background:${accent}}
  .body{flex:1;min-width:0;padding:9px 12px;display:flex;flex-direction:column;justify-content:center;gap:3px}
  .top{display:flex;align-items:center;gap:6px;min-width:0}
  .check{width:14px;height:14px;flex:0 0 14px}
  .name{
    font-size:12.5px;font-weight:700;color:${c.name};letter-spacing:-.2px;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  }
  .mid{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
  .ruc{
    font-family:ui-monospace,'SF Mono','Cascadia Code','IBM Plex Mono',monospace;
    font-size:11px;font-weight:600;color:${c.ruc};letter-spacing:.3px;
  }
  .pill{
    font-size:9px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;
    padding:2px 6px;border-radius:5px;white-space:nowrap;
  }
  .pill.ok{background:rgba(22,163,74,.13);color:#15803D}
  .pill.warn{background:rgba(217,119,6,.14);color:#B45309}
  .pill.bad{background:rgba(220,38,38,.13);color:#B91C1C}
  .pill.neutral{background:rgba(100,116,139,.14);color:${c.muted}}
  .brand{display:flex;align-items:center;gap:4px;font-size:9.5px;color:${c.muted};margin-top:1px}
  .brand b{color:${c.name};font-weight:700}
  .flag{display:flex;width:11px;height:8px;border-radius:1.5px;overflow:hidden;flex:0 0 11px}
  .flag i{flex:1}
</style></head>
<body>
  <a href="${escapeHtml(origin)}/ruc/${encodeURIComponent(ruc)}" target="_blank" rel="noopener" title="Ver ficha RUC completa">
    <span class="accent"></span>
    <span class="body">
      <span class="top">
        <svg class="check" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="${accent}"/>
          <path d="M8 12.4l2.6 2.6L16 9.6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="name">${escapeHtml(name)}</span>
      </span>
      <span class="mid">
        <span class="ruc">${escapeHtml(ruc)}</span>
        ${pills}
      </span>
      <span class="brand">
        <span class="flag"><i style="background:#D91023"></i><i style="background:#fff"></i><i style="background:#D91023"></i></span>
        Verificado por <b>consultaruc-pe.com</b>
      </span>
    </span>
  </a>
</body></html>`;
}

// "12/08/1936", como lo publica SUNAT, a "1936-08-12"; '' si no es una fecha.
function isoDate(dmy) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(dmy || '').trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
}

function yearsSince(dmy) {
  const iso = isoDate(dmy);
  if (!iso) return null;
  const years = Math.floor((Date.now() - Date.parse(iso)) / (365.25 * 86400000));
  return years >= 1 ? years : null;
}

// "Principal - 8430 - ACTIVIDADES DE PLANES…" → "actividades de planes… (CIIU 8430)"
function activityText(raw) {
  const s = String(raw || '').replace(/^Principal\s*-\s*/i, '').trim();
  const m = /^(\d{4})\s*-\s*(.+)$/.exec(s);
  return m ? `${m[2].toLowerCase()} (CIIU ${m[1]})` : s.toLowerCase();
}

function padronFlags(padrones) {
  const txt = (Array.isArray(padrones) ? padrones.join(' | ') : String(padrones || '')).toUpperCase();
  return {
    retencion: txt.includes('AGENTES DE RETENCI'),
    percepcion: txt.includes('AGENTES DE PERCEPCI'),
    buenContribuyente: txt.includes('BUENOS CONTRIBUYENTES')
  };
}

// SUNAT escribe "GUIA" sin tilde y sin decir de qué; en la ficha es la guía de remisión.
const ELECTRONIC_LABELS = { guia: 'guía de remisión', 'guia de remision': 'guía de remisión' };

// "FACTURA (desde 21/10/2017)" → "factura"; "a, b y c".
function electronicKinds(list) {
  const kinds = (Array.isArray(list) ? list : [])
    .map((s) => String(s).replace(/\s*\(.*\)\s*$/, '').trim().toLowerCase())
    .filter(Boolean)
    .map((k) => ELECTRONIC_LABELS[k] || k);
  if (kinds.length < 2) return kinds.join('');
  return `${kinds.slice(0, -1).join(', ')} y ${kinds[kinds.length - 1]}`;
}

/**
 * Lo que los datos de la ficha significan en la práctica, una línea por hecho.
 * La ficha de arriba ya muestra los campos tal cual; repetirlos en prosa (como
 * hacía el resumen anterior, y otra vez en las preguntas) sólo alargaba la
 * página. Aquí cada línea dice algo que el campo solo no dice: qué implica ser
 * agente de retención para quien le vende, cuántos años lleva operando, qué
 * hacer si el estado no es el esperado. Sólo salen las que el registro tiene.
 */
export function buildInsights(record, names) {
  const out = [];
  const estado = (record.estado || '').toUpperCase();
  const condicion = (record.condicion || '').toUpperCase();
  const nom = escapeHtml(names.nom);

  if (estado === 'ACTIVO' && condicion === 'HABIDO') {
    out.push(`<strong>Activo y habido.</strong> ${escapeHtml(names.Nom)} opera con normalidad y la SUNAT pudo verificar su domicilio fiscal: es justo lo que conviene confirmar antes de facturarle, contratarle o pagarle.`);
  } else if (estado && estado !== 'ACTIVO') {
    out.push(`<strong>Estado ${escapeHtml(estado)}.</strong> Este RUC no figura como activo, así que conviene confirmarlo con ${nom} antes de operar. Si eres el titular, revisa <a href="/activar-ruc/">cómo reactivar o regularizar tu RUC</a>.`);
  } else if (condicion && condicion !== 'HABIDO') {
    out.push(`<strong>Condición ${escapeHtml(condicion)}.</strong> La SUNAT no pudo verificar el domicilio fiscal declarado, así que conviene precaución antes de operar. Si eres el titular, revisa <a href="/actualizar-datos-ruc/">cómo actualizar tu domicilio fiscal</a>.`);
  }

  const years = yearsSince(record.fechaInicioActividades);
  if (years) {
    out.push(`<strong>${years} años de actividad.</strong> Inició actividades el ${escapeHtml(record.fechaInicioActividades)}${record.fechaInscripcion ? ` y figura inscrito en el RUC desde el ${escapeHtml(record.fechaInscripcion)}` : ''}.`);
  } else if (record.fechaInscripcion) {
    out.push(`<strong>Inscrito en el RUC</strong> desde el ${escapeHtml(record.fechaInscripcion)}.`);
  }

  if (record.emisorElectronicoDesde) {
    const kinds = electronicKinds(record.comprobantesElectronicos);
    out.push(`<strong>Emisor electrónico</strong> desde el ${escapeHtml(record.emisorElectronicoDesde)}${kinds ? ` (${escapeHtml(kinds)})` : ''}: sus comprobantes electrónicos se pueden validar en la SUNAT con su número de RUC.`);
  }

  const f = padronFlags(record.padrones);
  if (f.retencion) out.push('<strong>Agente de retención del IGV.</strong> Si le vendes, retendrá una parte del importe de tus facturas a cuenta del IGV y te entregará un comprobante de retención.');
  if (f.percepcion) out.push('<strong>Agente de percepción.</strong> Al venderte ciertos bienes cobra un monto adicional a cuenta del IGV, que luego puedes aplicar contra tu propio impuesto.');
  if (f.buenContribuyente) out.push('<strong>Buen contribuyente.</strong> Figura en el padrón de Buenos Contribuyentes de la SUNAT.');

  const anexos = Array.isArray(record.sucursales) ? record.sucursales.length : 0;
  if (anexos > 0) out.push(`<strong>${anexos} ${anexos === 1 ? 'establecimiento anexo' : 'establecimientos anexos'}</strong> registrados además de su domicilio fiscal.`);

  const ce = (record.comercioExterior || '').toUpperCase();
  if (ce && ce !== 'SIN ACTIVIDAD' && ce !== '-') {
    out.push(`<strong>Comercio exterior:</strong> figura como ${escapeHtml(ce.toLowerCase())}. <a href="/comercio-exterior-ruc/">Qué significa este dato en la ficha RUC</a>.`);
  }
  return out;
}

/**
 * Preguntas de la ficha, redactadas como las busca la gente ("¿cuál es el RUC
 * de EsSalud?", "¿emite factura electrónica?"). Alimentan el acordeón visible y
 * el FAQPage. Estado y condición van en una sola respuesta: por separado eran
 * dos preguntas que decían lo mismo que la ficha.
 */
export function buildRucFaq(ruc, record, dept, names, isCurated) {
  const { Nom, nom, deN } = names;
  const razon = record.razonSocial || 'el titular';
  const estado = (record.estado || '').toUpperCase();
  const condicion = (record.condicion || '').toUpperCase();
  const faq = [];

  faq.push(
    isCurated
      ? { q: `¿Cuál es el RUC ${deN}?`, a: `El RUC ${deN} es ${ruc}, registrado ante la SUNAT a nombre de ${razon}.` }
      : { q: `¿A quién pertenece el RUC ${ruc}?`, a: `El RUC ${ruc} pertenece a ${razon}, registrado ante la SUNAT como ${ruc.startsWith('10') ? 'persona natural' : 'persona jurídica'}.` }
  );

  if (estado || condicion) {
    let a;
    if (estado === 'ACTIVO' && condicion === 'HABIDO') {
      a = `Sí. Según la SUNAT, el RUC ${ruc} está ACTIVO y su domicilio fiscal figura como HABIDO.`;
    } else {
      a = `El RUC ${ruc} figura con estado ${estado || 'no disponible'} y condición de domicilio ${condicion || 'no disponible'}.`;
      if (estado && estado !== 'ACTIVO') a += ' No mantiene actividades vigentes en este momento.';
      if (condicion && condicion !== 'HABIDO') a += ' La SUNAT no pudo verificar su domicilio fiscal.';
    }
    faq.push({ q: `¿${Nom} tiene el RUC activo y habido?`, a });
  }

  if (record.domicilioFiscal) {
    faq.push({
      q: `¿Dónde está el domicilio fiscal ${deN}?`,
      a: `${isCurated ? `${Nom} (${razon})` : razon} declara su domicilio fiscal en ${record.domicilioFiscal}${dept ? `, departamento de ${titleCase(dept)}` : ''}.`
    });
  }

  if (Array.isArray(record.actividadEconomica) && record.actividadEconomica.length > 0) {
    faq.push({
      q: `¿A qué se dedica ${nom} según la SUNAT?`,
      a: `Su actividad económica principal declarada es ${activityText(record.actividadEconomica[0])}.`
    });
  }

  if (record.emisorElectronicoDesde) {
    const kinds = electronicKinds(record.comprobantesElectronicos);
    faq.push({
      q: `¿${Nom} emite comprobantes electrónicos?`,
      a: `Sí. Según la SUNAT, es emisor electrónico desde el ${record.emisorElectronicoDesde}${kinds ? ` y emite ${kinds} electrónicas` : ''}.`
    });
  }

  if (padronFlags(record.padrones).retencion) {
    faq.push({
      q: `¿${Nom} es agente de retención del IGV?`,
      a: 'Sí. Figura en el régimen de agentes de retención del IGV: al pagar a sus proveedores retiene una parte del importe a cuenta del IGV y entrega un comprobante de retención.'
    });
  }
  return faq;
}

export function renderRucPage(ruc, record) {
  const razon = record.razonSocial || '';
  const estado = (record.estado || '').toUpperCase();
  const condicion = (record.condicion || '').toUpperCase();
  const origin = siteOrigin();
  const canonical = `${origin}/ruc/${ruc}`;

  // Sólo el directorio curado y las fichas con demanda real se indexan; el
  // resto queda noindex,follow (se sirve igual al visitante y sus enlaces se
  // siguen). El criterio y su porqué viven en indexableRucs.js.
  const isIndexable = isIndexableRuc(ruc, record);

  const profile = getProfile(ruc);
  // Nombre con el que se busca la ficha: "EsSalud", no "SEGURO SOCIAL DE SALUD".
  // Las consultas de Search Console son de marca ("essalud ruc", "ruc banco de
  // la nacion"), y con la razón social en el título rankeaban en el top 5 sin
  // que nadie hiciera clic. Fuera de las curadas no hay marca fiable: se queda
  // la razón social.
  const name = profile ? profile.brand : razon;
  // Con artículo donde el español lo pide: "el RUC del BCP", "de la SUNAT".
  const art = profile && profile.art;
  const nom = art ? `${art} ${name}` : name;
  const names = { nom, Nom: nom.charAt(0).toUpperCase() + nom.slice(1), deN: art === 'el' ? `del ${name}` : art === 'la' ? `de la ${name}` : `de ${name}` };
  const dept = deriveDept(record.departamento, record.domicilioFiscal, record.ubigeo);
  const coords = DEPT_COORDS[dept];

  // El nombre buscado va PRIMERO: quien busca "cencosud ruc" tiene que verlo al
  // principio del resultado. El título anterior empezaba por "[HABIDO] RUC …" y
  // esas consultas convertían al 0,07% pese a rankear en el top 10.
  let title = `${razon} - RUC ${ruc} | Estado SUNAT`;
  if (profile) {
    title = `${name} RUC ${ruc} | ${profile.name !== name ? profile.name : 'Estado SUNAT'}`;
    if (title.length > 65) title = `${name} RUC ${ruc} | Ficha SUNAT`;
  }

  // Muchas razones sociales acaban en "S.A."/"S.A.C.", que junto al punto de la
  // frase daba "… S.A..".
  const razonFrase = razon.replace(/\.+$/, '');
  const estadoTxt = `Estado ${estado || 'no disponible'} y condición ${condicion || 'no disponible'}`;
  let description;
  if (profile) {
    const quien = profile.name !== name ? ` (${profile.name})` : '';
    description = `RUC ${names.deN}${quien}: ${ruc}. ${estadoTxt}${dept ? `, domicilio fiscal en ${titleCase(dept)}` : ''}. Revisa su ficha SUNAT, actividad y comprobantes.`;
    if (description.length > 165) description = `RUC ${names.deN}: ${ruc}. ${estadoTxt}. Revisa su ficha SUNAT, actividad y comprobantes.`;
  } else {
    description =
      `Consulta el RUC ${ruc} de ${razonFrase}. Estado: ${estado || 'no disponible'}, ` +
      `condición de domicilio: ${condicion || 'no disponible'}${record.domicilioFiscal ? `, domicilio fiscal en ${record.domicilioFiscal}` : ''}.`;
  }

  // Un solo @graph con ids enlazados: la página trata SOBRE la organización, y
  // la organización tiene su RUC como identificador. Antes Organization.url
  // apuntaba a esta misma ficha, que no es la web de la empresa.
  const pageId = `${canonical}#webpage`;
  const orgId = `${canonical}#org`;
  const crumbs = profile
    ? [['Inicio', `${origin}/`], ['Directorio de empresas', `${origin}/empresas-populares/`], [name, canonical]]
    : [['Inicio', `${origin}/`], ['Consulta RUC', `${origin}/ficha-ruc/`], [`RUC ${ruc}`, canonical]];

  const faqList = buildRucFaq(ruc, record, dept, names, !!profile);
  const graph = [
    {
      '@type': 'WebPage',
      '@id': pageId,
      url: canonical,
      name: title,
      description,
      inLanguage: 'es-PE',
      isPartOf: { '@type': 'WebSite', '@id': `${origin}/#website`, name: 'Consulta RUC Perú', url: `${origin}/` },
      breadcrumb: { '@id': `${canonical}#breadcrumb` },
      dateModified: record.updatedAt || undefined,
      about: ruc.startsWith('10') ? undefined : { '@id': orgId }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: crumbs.map(([n, item], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item }))
    },
    {
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: faqList.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    }
  ];
  // Las personas naturales (RUC 10) no son una Organization, y publicar su
  // domicilio como datos estructurados no aporta nada a nadie.
  if (!ruc.startsWith('10')) {
    const alt = [profile && profile.brand, record.nombreComercial]
      .filter((x) => x && x !== '-' && x.toUpperCase() !== razon.toUpperCase());
    graph.push({
      '@type': profile ? profile.type : 'Organization',
      '@id': orgId,
      name: profile ? profile.name : razon,
      legalName: razon,
      alternateName: alt.length ? [...new Set(alt)] : undefined,
      description: profile ? profile.about : undefined,
      taxID: ruc,
      identifier: { '@type': 'PropertyValue', propertyID: 'RUC', value: ruc },
      foundingDate: isoDate(record.fechaInicioActividades) || undefined,
      address: record.domicilioFiscal || dept
        ? {
            '@type': 'PostalAddress',
            streetAddress: record.domicilioFiscal || undefined,
            addressRegion: dept ? titleCase(dept) : undefined,
            addressCountry: 'PE'
          }
        : undefined,
      mainEntityOfPage: { '@id': pageId }
    });
  }
  // "</" dentro de un <script> lo cerraría; una razón social no debería
  // traerlo, pero el dato viene de fuera.
  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');

  const insights = buildInsights(record, names);
  const siblings = groupSiblings(ruc);
  const sameSector = sectorSiblings(ruc);
  // La marca como texto del enlace ("SUNAT", "Ministerio Público Arequipa"): es lo que la gente busca.
  const relItem = (s) => `<li><a href="/ruc/${s.ruc}">${escapeHtml(s.brand)}</a> <span class="ruc-rel-num">RUC ${s.ruc}</span></li>`;
  const answer = profile
    ? `El RUC ${art === 'el' ? 'del ' : art === 'la' ? 'de la ' : 'de '}<strong>${escapeHtml(name)}</strong> es <strong>${ruc}</strong>${razon.toUpperCase() !== name.toUpperCase() ? `, registrado a nombre de ${escapeHtml(razon)}` : ''}.`
    : `El RUC <strong>${ruc}</strong> pertenece a <strong>${escapeHtml(razon)}</strong>.`;
  const answerEstado = estado
    ? ` Según la SUNAT, figura como <strong>${escapeHtml(estado)}</strong>${condicion ? ` y <strong>${escapeHtml(condicion)}</strong>` : ''}.`
    : '';
  const ogImage = `${origin}/img/og-home.png`;

  const mapSvg = PERU_MAP_PATH
    ? `<div class="field result-map-cell">
        <span class="field-label">Ubicación Geográfica</span>
        <div class="result-map-wrap"><div class="result-map">
          <svg viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa del Perú">
            <g transform="translate(0,1024) scale(0.1,-0.1)" fill="currentColor"><path d="${PERU_MAP_PATH}"/></g>
            ${coords ? `<circle class="lima-dot" cx="${coords[0]}" cy="${coords[1]}" r="16"/><text class="lima-label" x="${coords[0] + 22}" y="${coords[1] + 12}">${escapeHtml(titleCase(dept))}</text>` : ''}
          </svg>
        </div></div>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  ${isIndexable ? '' : '<meta name="robots" content="noindex,follow">'}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Consulta RUC Perú">
  <meta property="og:locale" content="es_PE">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="stylesheet" href="/style.css?v=688852fa">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body class="light-theme">
  <header class="top-nav">
    <div class="nav-container">
      <a class="logo" href="/">
        <img src="/img/logo.webp" srcset="/img/logo.webp 1x, /img/logo@2x.webp 2x" width="38" height="38" alt="consultaruc-pe.com" class="logo-mark">
        <span class="logo-title"><span class="logo-l1">Consulta</span><span class="logo-l2">RUC Perú</span></span>
      </a>
      <div class="header-stat">
        <div class="header-stat-text"><strong id="statCount">${countRecords().toLocaleString('es-PE')}</strong><span>registros totales</span></div>
        <svg class="header-stat-chart" viewBox="0 0 16 16" aria-hidden="true">
          <rect x="1" y="8" width="3.2" height="7" rx="1" fill="#F87171"/>
          <rect x="6.4" y="4.5" width="3.2" height="10.5" rx="1" fill="#4ADE80"/>
          <rect x="11.8" y="1.5" width="3.2" height="13.5" rx="1" fill="#60A5FA"/>
        </svg>
        <svg class="header-stat-deco" viewBox="0 0 128 36" fill="none" aria-hidden="true">
          <path d="M2 22 H68" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 5" stroke-linecap="round" opacity="0.55"/>
          <circle cx="73" cy="22" r="3.4" fill="#F97316"/>
          <g stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" opacity="0.75">
            <path d="M108 4 L124 12.5 L124 27 L108 35 L92 27 L92 12.5 Z"/>
            <path d="M108 4 L108 19 L92 12.5 M108 19 L124 12.5"/>
          </g>
        </svg>
      </div>
      <button id="menuToggle" class="menu-btn" aria-label="Abrir menú" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg></button>
    </div>
  </header>

${renderNav('ficha-ruc')}

  <nav class="breadcrumb">${crumbs.map(([n, item], i) => (i < crumbs.length - 1 ? `<a href="${escapeHtml(item.slice(origin.length))}">${escapeHtml(n)}</a>` : escapeHtml(n))).join(' › ')}</nav>

  <main class="geo-result" style="margin-top:1.5rem;">
    <div class="print-only print-head">
      <img src="/img/logo.webp" class="print-logo" alt="consultaruc-pe.com">
      <div class="print-head-txt">
        <strong>Consulta RUC Perú</strong>
        <span>Ficha RUC · Datos públicos de la SUNAT</span>
      </div>
      <div class="print-head-url">consultaruc-pe.com</div>
    </div>
    <h1 class="ruc-page-h1">${escapeHtml(name)} <span class="ruc-page-h1-ruc">RUC ${escapeHtml(ruc)}</span></h1>
    <p class="ruc-answer">${answer}${answerEstado}</p>
    ${CRP.resultPanel(record, {
      mapSvg: mapSvg,
      deptName: dept ? titleCase(dept) : '',
      heading: false,
      // La fecha del dato, no la de hoy: "Verificado con SUNAT" con la fecha
      // del día en una ficha de hace meses es una afirmación falsa.
      consultedAt: record.updatedAt ? String(record.updatedAt).slice(0, 10) : undefined
    })}
    <div class="print-only print-foot">
      <span>Ficha generada en <strong>consultaruc-pe.com</strong> · Fuente: datos públicos de la SUNAT · Documento informativo, no oficial.</span>
    </div>

    <section class="ruc-summary">
      ${profile ? `<h2>Acerca ${escapeHtml(names.deN)}</h2>
      <p class="ruc-summary-lead">${escapeHtml(profile.about)}</p>
      ${profile.guide ? `<p class="ruc-guide-link"><a href="${profile.guide.href}">${escapeHtml(profile.guide.label)}</a></p>` : ''}
      ${siblings.length ? `<h3 class="ruc-rel-title">${profile.group === 'Ministerio Público' ? 'RUC de otras sedes del Ministerio Público' : `Otras empresas de ${escapeHtml(profile.group)}`}</h3>
      <ul class="ruc-rel">${siblings.map(relItem).join('')}</ul>` : ''}
      ` : ''}
      ${insights.length ? `<h2${profile ? ' class="ruc-sec-title"' : ''}>Qué significan los datos ${escapeHtml(names.deN)}</h2>
      <ul class="ruc-insights">
        ${insights.map((i) => `<li>${i}</li>`).join('\n        ')}
      </ul>` : ''}

      <h2 class="ruc-faq-title">Preguntas frecuentes sobre el RUC ${escapeHtml(names.deN)}</h2>
      <div class="ruc-faq">
        ${faqList.map((f) => `<div class="ruc-faq-item"><h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p></div>`).join('\n        ')}
      </div>

      ${sameSector.length ? `<h2 class="ruc-sec-title">Más fichas de ${escapeHtml(SECTORS[profile.sector])}</h2>
      <ul class="ruc-rel">${sameSector.map(relItem).join('')}</ul>` : ''}

      <div class="ruc-summary-links">
        <a href="/ficha-ruc/">Consultar otro RUC</a>
        <a href="/verificar-ruc-multiple/">Verificar varios a la vez</a>
        <a href="/razon-social/">Buscar por nombre</a>
        <a href="/empresas-populares/">Directorio de empresas</a>
        <a href="/actualizar-datos-ruc/">Actualizar datos de tu RUC</a>
        <a href="/activar-ruc/">Activar o reactivar un RUC</a>
        <a href="/faq/">Preguntas frecuentes</a>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-main">
      <h2 class="sr-only">Enlaces del pie de página</h2>
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" class="footer-logo">
            <img src="/img/logo.webp" srcset="/img/logo.webp 1x, /img/logo@2x.webp 2x" width="44" height="44" alt="consultaruc-pe.com" class="footer-logo-img">
            <span class="footer-logo-text">Consulta<br><b>RUC Perú</b></span>
          </a>
          <p class="footer-desc">Consulta gratuita de RUC con datos oficiales de la SUNAT: razón social, estado, condición de domicilio y actividad económica de cualquier contribuyente del Perú.</p>
          <div class="footer-stat">
            <span class="footer-stat-ic" data-icon="database"></span>
            <div><strong>${countRecords().toLocaleString('es-PE')}</strong><span>registros indexados</span></div>
          </div>
          <p class="footer-flag"><span class="footer-flag-chip"></span> Hecho en el Perú, para el Perú.</p>
          <div class="footer-social" aria-label="Redes sociales de Consulta RUC Perú">
            <a href="https://x.com/ConsultaRUC9" target="_blank" rel="noopener noreferrer me" aria-label="Consulta RUC Perú en X (Twitter)" title="X (Twitter)"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
            <a href="https://www.linkedin.com/in/consulta-ruc-503b3b424/" target="_blank" rel="noopener noreferrer me" aria-label="Consulta RUC Perú en LinkedIn" title="LinkedIn"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg></a>
            <a href="https://www.youtube.com/channel/UCqy0tTaXJaLxoE91EE8yJfQ" target="_blank" rel="noopener noreferrer me" aria-label="Consulta RUC Perú en YouTube" title="YouTube"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
            <a href="https://medium.com/@consultaruc80" target="_blank" rel="noopener noreferrer me" aria-label="Consulta RUC Perú en Medium" title="Medium"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg></a>
            <a href="https://www.pinterest.com/consultaruc9/_profile/" target="_blank" rel="noopener noreferrer me" aria-label="Consulta RUC Perú en Pinterest" title="Pinterest"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C24 5.367 18.635.001 12.017.001z"/></svg></a>
            <a href="https://linktr.ee/consultaruc" target="_blank" rel="noopener noreferrer me" aria-label="Consulta RUC Perú en Linktree" title="Linktree"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M13.736 5.853l4.005-4.117 2.325 2.38-4.2 4.005h5.908v3.305h-5.937l4.229 4.108-2.325 2.334-5.741-5.769-5.741 5.769-2.325-2.334 4.229-4.108H2.226V8.121h5.909l-4.201-4.005 2.324-2.38 4.005 4.117V0h3.473zM10.263 18.156h3.473v5.844h-3.473z"/></svg></a>
          </div>
        </div>
        <div class="footer-col">
          <h3>Consultas</h3>
          <a href="/">Consulta por RUC</a>
          <a href="/razon-social/">Por razón social</a>
          <a href="/verificar-ruc-multiple/">Búsqueda masiva</a>
          <a href="/ficha-ruc/">Ficha RUC</a>
        </div>
        <div class="footer-col">
          <h3>Herramientas</h3>
          <a href="/calculadora-tributaria/">Calculadora de régimen</a>
          <a href="/tipo-de-cambio-sunat/">Tipo de cambio SUNAT</a>
          <a href="/sello-verificado/">Sello de verificación</a>
          <a href="/comercio-exterior-ruc/">Comercio exterior</a>
          <a href="/consulta-essalud/">Consulta EsSalud</a>
          <a href="/consulta-rnp/">Consulta RNP</a>
        </div>
        <div class="footer-col">
          <h3>Guías y recursos</h3>
          <a href="/#s1">¿Qué es el RUC?</a>
          <a href="/faq/">Preguntas frecuentes</a>
          <a href="/clave-sol/">Clave SOL</a>
          <a href="/recibo-por-honorarios/">Recibo por honorarios</a>
          <a href="/activar-ruc/">Activar o reactivar RUC</a>
          <a href="/actualizar-datos-ruc/">Actualizar datos del RUC</a>
          <a href="/sat-lima-vs-sunat/">SAT vs SUNAT</a>
          <a href="/empresas-populares/">Empresas populares</a>
        </div>
        <div class="footer-col">
          <h3>Institucional</h3>
          <a href="/sobre-nosotros/">Sobre nosotros</a>
          <a href="/contacto/">Contacto</a>
          <a href="/politica-de-privacidad/">Política de privacidad</a>
          <a href="/terminos-y-condiciones/">Términos y condiciones</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-bottom-inner">
        <p class="footer-copy">© 2026 <strong>Consulta RUC Perú</strong> — Buscador de RUC SUNAT Perú. Todos los derechos reservados.</p>
        <p class="footer-disclaimer">Portal informativo independiente basado en datos públicos de la SUNAT. No estamos afiliados oficialmente a la administración tributaria ni la representamos.</p>
      </div>
    </div>
  </footer>

  <script src="/site.js?v=0e55d2a1"></script>
</body>
</html>`;
}

export function renderRucNotFound(ruc) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <title>RUC no encontrado | Consulta RUC Perú</title>
  <meta name="robots" content="noindex,follow">
  <link rel="stylesheet" href="/style.css?v=688852fa">
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="light-theme">
  <main class="content-page" style="text-align:center;padding-top:4rem;">
    <h1>RUC no encontrado</h1>
    <p>El RUC ${escapeHtml(ruc)} no figura en los registros públicos de SUNAT.</p>
    <p><a href="/">Volver al buscador</a></p>
  </main>
  <script src="/site.js?v=0e55d2a1"></script>
</body>
</html>`;
}
