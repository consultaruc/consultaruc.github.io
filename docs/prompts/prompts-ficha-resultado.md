# ConsultaRUC.pe — 3 prompts de diseño para la página de RESULTADO / FICHA de un RUC (`/ruc/:ruc`)

Cada bloque es un **prompt de diseño de página web completa** (mockup UI) para rediseñar la ficha que aparece al consultar un RUC. Pégalo en tu generador de diseño (Nano Banana Pro / mockup AI). Los 3 comparten la MISMA marca; cambian el concepto de layout. Elige el que más te guste y lo construyo (recuerda: este componente es el mismo que se muestra en el buscador de la home y en la página /ruc/, así que el diseño elegido se aplica en ambos lugares).

## 🎨 SPEC DE MARCA (respétala en los 3)
Estética **cartográfica / govtech** peruana, limpia y de confianza, tipo registro oficial pero moderno. Paleta: navy #16233F (header, texto fuerte, sellos), naranja cálido #F97316 / #EA5B0C (acentos, lomo/spine, CTAs), off-white #F4F6FA de fondo, blanco en tarjetas; verde #16A34A (ACTIVO / HABIDO), ámbar #D97706 (SUSPENSIÓN / NO HABIDO), rojo #DC2626 (BAJA) SOLO como semáforo de estado. Tipografía: **Sora** bold para títulos, **Inter** para etiquetas y texto, **IBM Plex Mono** para TODO número, RUC, fechas y etiqueta [REF]. Motivos: **RUC segmentado** en tres bloques `[20] [38203665] [5]`; etiqueta mono `[REF: RUC-20-38203665-5]`; **silueta tenue del mapa del Perú** con punto naranja en Lima como "Ubicación geográfica"; tarjetas con **lomo (spine) naranja de 3–4px** a la izquierda; header navy de 66px con logo "Consulta RUC Perú" y contador "18 290 659 registros"; marca de agua/pie "consultaruc-pe.com" con banderita roja-blanca-roja. Datos de ejemplo reales y creíbles (usa MIBANCO — BANCO DE LA MICROEMPRESA S.A., RUC 20382036655, ACTIVO, HABIDO, domicilio Surquillo–Lima, actividad "6419 — Otros tipos de intermediación monetaria"). Nada fotorrealista, mucho espacio en blanco, alineado a grilla.

---

## 🖼️ DISEÑO A — "Documento Oficial / Cédula Tributaria"
**Concepto:** la ficha se ve como un documento/certificado oficial emitido, con banda de encabezado, sello de estado y campos organizados como en un acta registral. Transmite autoridad y confianza.

```
DESIGN PROMPT: Design a full desktop web page mockup of a RUC result page styled as an OFFICIAL TAX CERTIFICATE / "cédula tributaria". Navy #16233F fixed header (66px) with the "Consulta RUC Perú" wordmark, a monospace "18 290 659 registros" counter and grouped nav (Inicio · Consultas · Herramientas · Guías · Directorio · Acerca de). Breadcrumb "Inicio › Consulta RUC › RUC 20382036655".

The centerpiece is a large white DOCUMENT card (max-width ~1000px, centered, 4px orange left spine, soft premium shadow, subtle rounded corners) that reads like an official record. At the very top of the card, a slim NAVY HEADER BAND spanning the card width containing, in white: a small institutional emblem/monogram (a stylized document + magnifier, NOT a real logo), the label "FICHA RUC · REGISTRO ÚNICO DE CONTRIBUYENTES" in Sora, and on the right a "[REF: RUC-20-38203665-5]" mono tag. Just under the band, the big razón social "MIBANCO — BANCO DE LA MICROEMPRESA S.A." in bold Sora, and beneath it the segmented RUC as three large mono tiles [20] [38203665] [5] with tiny captions "Tipo · Correlativo · Verificador".

On the top-right of the card, a prominent circular or rounded STATUS SEAL/STAMP (like an official stamp): a navy ring with "ACTIVO" in green mono inside and "HABIDO · 2026" beneath, slightly rotated for a stamped feel, with a green check. 

Below, organize the data as labelled REGISTRY ROWS grouped into titled sections separated by thin orange-labelled dividers: "IDENTIFICACIÓN" (Razón social, Nombre comercial, Tipo de contribuyente), "UBICACIÓN" (Domicilio fiscal, Ubigeo, plus a small faint Peru map with the orange Lima dot at the right), "ACTIVIDAD Y REGISTRO" (Actividad económica 6419, Fecha de inscripción 15/01/1998, Sistema de emisión), "COMPROBANTES" (Boleta, Factura, Guía de remisión as chips). Each field: an uppercase muted mono label above a clean value on a very light bordered box. A faint "consultaruc-pe.com" watermark diagonally across the card at very low opacity, like a security background.

Card footer: a thin strip with "Documento generado desde datos públicos de SUNAT" and small action buttons "Imprimir" and "Descargar PDF". Bottom of page: the navy multi-column footer. Palette navy + orange + white; status colors only in the seal/pills. Sora / Inter / IBM Plex Mono. High-trust, formal-but-modern, airy. Light theme.
```

---

## 🖼️ DISEÑO B — "Panel de Datos" (dashboard de dos columnas)
**Concepto:** un dashboard moderno tipo app: barra lateral izquierda con la identidad + estado + mapa, y área principal derecha con los datos en tarjetas/tiles agrupadas por categoría. Escaneable y limpio.

```
DESIGN PROMPT: Design a full desktop web page mockup of a RUC result page styled as a modern DATA DASHBOARD in the site's govtech look. Navy #16233F fixed header (wordmark + "18 290 659 registros" mono counter + grouped nav) and breadcrumb "Inicio › Consulta RUC › RUC 20382036655".

Two-column layout on an off-white canvas. LEFT SIDEBAR (~320px, sticky): a white card with a 3px orange left spine acting as the identity panel — a letter-avatar tile "M", the razón social "MIBANCO — Banco de la Microempresa S.A." in bold Sora, the segmented RUC [20] [38203665] [5] in mono, then two big STATUS TILES stacked: a green tile "ACTIVO" with a check icon and a green tile "HABIDO" with a shield icon (each a soft-tinted rounded tile with the state word in bold and a one-line caption). Below, a small stylized Peru map with the orange Lima dot labelled "Ubicación: Lima", and a "[REF: RUC-20-38203665-5]" mono tag. At the bottom of the sidebar, orange/navy buttons "Imprimir", "Verificar otro".

RIGHT MAIN AREA: a grid of DATA CARDS grouped under small orange section headers. "Identificación" → cards for Nombre comercial, Tipo de contribuyente, Fecha de inscripción (15/01/1998). "Ubicación" → a wide card with the full Domicilio fiscal (Av. República de Panamá 4575, Surquillo, Lima) + Ubigeo. "Actividad económica" → a card with "6419 — Otros tipos de intermediación monetaria" and any secondary activities as chips. "Comprobantes y emisión" → cards with Sistema de emisión (Computarizado), Emisor electrónico desde (25/06/2018), and Comprobantes autorizados/electrónicos as pill chips (Factura, Boleta, Guía de remisión). Each data card: white, 1px border, subtle shadow, an uppercase mono micro-label and a clean value; numbers/dates in IBM Plex Mono.

Optionally a thin top KPI strip above the two columns with 3 mini-stats: "Estado: Activo", "Condición: Habido", "Antigüedad: 28 años". Faint Peru map watermark in a corner. Bottom: navy multi-column footer. Palette navy + orange + white; green/amber/red only in status tiles/pills. Sora / Inter / IBM Plex Mono. Clean, app-like, spacious, high-trust. Light theme default (also show it looks elegant).
```

---

## 🖼️ DISEÑO C — "Perfil de Empresa" (hero + tabs / secciones)
**Concepto:** una página de perfil de empresa premium: un hero con el nombre, avatar, estado y datos clave; debajo, el detalle organizado en secciones/pestañas. Editorial y moderno, como un perfil de negocio verificado.

```
DESIGN PROMPT: Design a full desktop web page mockup of a RUC result page styled as a premium VERIFIED COMPANY PROFILE. Navy #16233F fixed header (wordmark + "18 290 659 registros" mono counter + grouped nav) and breadcrumb "Inicio › Consulta RUC › RUC 20382036655".

HERO SECTION: a wide banner card with a subtle navy-to-white gradient and a very faint Peru map on the right. On the left, a large rounded logo-avatar tile "M" (neutral, not a real brand) beside the razón social "MIBANCO — BANCO DE LA MICROEMPRESA S.A." in big bold Sora, with the nombre comercial "MIBANCO" in muted Inter beneath. Under the name, a row of chips/badges: a green "ACTIVO" pill, a green "HABIDO" pill, a navy "Persona Jurídica" chip, and a "Lima" chip with a map-pin. To the right of the hero, the segmented RUC [20] [38203665] [5] shown large in mono with the "[REF: RUC-20-38203665-5]" tag and a "Verificado con SUNAT" badge with a check. A primary orange button "Imprimir ficha" and a ghost button "Verificar otro RUC".

Below the hero, a slim STICKY TAB/ANCHOR BAR: "Resumen · Ubicación · Actividad · Comprobantes". Then the content as clean sections (each with a small orange section title and a card grid):
- "Datos generales": Tipo de contribuyente (Sociedad Anónima), Fecha de inscripción (15/01/1998), Inicio de actividades (14/02/1998).
- "Ubicación": full domicilio fiscal (Av. República de Panamá 4575, Surquillo, Lima), Ubigeo, and a small Peru map with the orange Lima dot.
- "Actividad económica": "6419 — Otros tipos de intermediación monetaria" as a highlighted card + secondary activities as chips.
- "Comprobantes y sistemas": Sistema de emisión (Computarizado), Emisor electrónico desde (25/06/2018), Afiliado al PLE, and Comprobantes autorizados/electrónicos as pill chips.

Each card: white, subtle border, uppercase mono micro-label + clean value; all numbers/dates in IBM Plex Mono. Faint "consultaruc-pe.com" wordmark and Peru flag at the bottom. Bottom: navy multi-column footer. Palette navy + orange + white; status colors only in the badges/pills. Sora / Inter / IBM Plex Mono. Editorial, premium, trustworthy, spacious. Light theme.
```

---

## ✅ Resumen de los 3 diseños
| # | Concepto | Layout | Vibe |
| - | -------- | ------ | ---- |
| A | **Documento Oficial** | Certificado con banda navy, sello de estado, secciones registrales, marca de agua | Autoridad / oficial |
| B | **Panel de Datos** | Sidebar (identidad + estado + mapa) + main con tarjetas por categoría | Dashboard / app |
| C | **Perfil de Empresa** | Hero (avatar + badges + RUC) + tabs/secciones | Perfil premium verificado |

**Cómo seguir:** genera los 3 mockups, dime cuál (o qué mezcla) te gusta más, y construyo esa ficha real — con datos verificados contra SUNAT, responsive, y aplicada tanto en `/ruc/:ruc` como en el resultado del buscador de la home.
