# ConsultaRUC.pe — 5 prompts de diseño para la página "Directorio de Empresas"

Cada bloque es un **prompt de diseño de página web completa** (mockup UI, no infografía) para rediseñar `/empresas-populares/` — el "Directorio de Empresas Populares del Perú". Pégalo en tu generador de diseño (Nano Banana Pro / mockup AI) para obtener una propuesta visual. Los 5 comparten la MISMA marca; cambian el concepto de layout. Elige el que más te guste y lo construyo.

## 🎨 SPEC DE MARCA (incluida en cada prompt, respétala siempre)
Estética **cartográfica / govtech** peruana, limpia y de confianza. Paleta: navy #16233F (header, texto fuerte), naranja cálido #F97316 / #EA5B0C (acentos, spines, CTAs), off-white #F4F6FA de fondo, blanco en tarjetas; verde #16A34A / ámbar #D97706 / rojo #DC2626 SOLO como semáforo de estado (ACTIVO/SUSPENSIÓN/BAJA · HABIDO/NO HABIDO). Tipografía: **Sora** bold para títulos, **Inter** para texto, **IBM Plex Mono** para todo número, RUC y etiqueta [REF]. Motivos de marca: silueta tenue del **mapa del Perú** con un punto naranja en **Lima**; **RUC segmentado** en tres bloques [20] [10004721] [8]; **tarjetas catastrales blancas con lomo (spine) naranja de 3px**; etiquetas mono "[REF: RUC-…]"; header navy de 66px con el logo "Consulta RUC Perú" y el contador "18 290 659 registros"; marca de agua/pie "consultaruc-pe.com" con la banderita roja-blanca-roja. Nada fotorrealista, nada de gradientes chillones, mucho espacio en blanco, alineado a grilla, sensación de registro oficial pero moderno.

---

## 🖼️ DISEÑO 1 — "Mapa de Empresas" (cartográfico interactivo)
```
DESIGN PROMPT: Design a full desktop web page mockup for a Peruvian company directory titled "Directorio de Empresas del Perú", in a clean cartographic / govtech style. Fixed navy #16233F top header (66px) with the "Consulta RUC Perú" wordmark on the left, a monospace "18 290 659 registros" counter, and a grouped nav (Inicio · Consultas · Herramientas · Guías · Directorio · Acerca de). Below, a breadcrumb "Inicio › Directorio".

The hero of the page is a SPLIT LAYOUT: on the left ~55%, a large elegant stylized MAP OF PERU (soft navy-to-transparent silhouette on off-white) with small orange location pins scattered over the departments where companies are registered, a glowing orange dot on Lima, and a couple of pins gently highlighted. On the right ~45%, a scrollable LIST PANEL of company cards. Each company card is a white cadastral card with a 3px orange left spine, soft shadow, containing: the razón social in bold Sora (e.g. "BANCO DE CRÉDITO DEL PERÚ"), a segmented RUC block [20] [10004721] [8] in IBM Plex Mono, a green "ACTIVO" pill and a blue "HABIDO" pill, the domicilio ("La Molina, Lima") with a tiny map-pin icon, and a small "[REF: RUC-20-…]" mono tag. Hovering a card should visually connect to its pin on the map (show one card "active" with an orange outline and its matching pin enlarged with a connector line).

Above the list, a slim filter bar with chips: "Todos · Lima · Provincias · Banca · Retail · Estado" and a small search input "Buscar empresa…". Include 6–8 sample believable companies (BCP, Toyota del Perú, Supermercados Peruanos, SUNAT, etc.). A subtle footer note: "Solo empresas verificadas directamente contra SUNAT." Bottom: the multi-column navy footer with "consultaruc-pe.com" and the Peru flag.

Style: airy, editorial, high-trust; navy + orange + white dominate; status colors only in pills. Sora headings, Inter body, IBM Plex Mono for every RUC/number. The page must feel like an official yet modern registry you can explore on a map. Provide light theme (default).
```

---

## 🖼️ DISEÑO 2 — "Por Rubro" (directorio agrupado por sector)
```
DESIGN PROMPT: Design a full desktop web page mockup titled "Directorio de Empresas por Rubro" for a Peruvian RUC directory, in a clean govtech / cadastral style with a navy #16233F fixed header (Consulta RUC Perú wordmark + "18 290 659 registros" mono counter + grouped nav) and an "Inicio › Directorio" breadcrumb.

Below a compact hero (bold Sora navy title, an orange underline accent, a one-line subtitle "Las empresas más consultadas del Perú, organizadas por sector"), lay the directory as SECTOR SECTIONS stacked vertically. Each sector is introduced by a section header: a small 2px navy line icon in an orange-tinted rounded chip + the sector name in bold Sora (e.g. "Banca y Finanzas", "Retail y Consumo", "Automotriz", "Sector Público") + a small mono count chip ("12 empresas"). Under each header, a responsive grid of rich company cards.

Each company card is a white cadastral card (16px radius, 1px #DDE3EC border, 3px orange left spine, soft shadow) containing: a small square logo-placeholder tile (neutral, not a real brand), the razón social in bold Sora, a segmented RUC [20] [10004721] [8] in IBM Plex Mono, a row with a green "ACTIVO" pill + a blue "HABIDO" pill, the domicilio with a map-pin icon, the actividad económica ("Banca múltiple") as a small tag, and a subtle "Ver ficha →" link in orange. Include one faint "[REF: RUC-20-…]" mono tag per card at low opacity.

Add a sticky slim sub-nav of sector anchors at the top of the directory ("Banca · Retail · Automotriz · Estado · Telecom") that scrolls to each section. Show 3 sectors with 3–4 believable sample companies each. End with a full-width navy strip: "¿No encuentras una empresa? Usa el buscador principal" with an orange button. Bottom: the multi-column navy footer + "consultaruc-pe.com" + Peru flag.

Style: organized, scannable, high-trust; navy + orange + white base; status colors only in pills; Sora / Inter / IBM Plex Mono. Faint Peru map watermark in a corner of the hero. Airy grid, generous spacing. Light theme.
```

---

## 🖼️ DISEÑO 3 — "Top Consultadas" (ranking / leaderboard de datos)
```
DESIGN PROMPT: Design a full desktop web page mockup titled "Top Empresas Más Consultadas del Perú", styled as a clean DATA LEADERBOARD in the site's govtech aesthetic. Navy #16233F fixed header (Consulta RUC Perú wordmark + "18 290 659 registros" mono counter + grouped nav) and an "Inicio › Directorio" breadcrumb.

Hero: a bold Sora navy title with an orange underline, subtitle "Las empresas que más consultan los peruanos, actualizado en vivo". Beneath, a slim row of 3 KPI stat-cards (white, orange left spine): "18.3M RUC en la base", "+2 300 consultas hoy", "100% datos SUNAT" — numbers in IBM Plex Mono.

The core is a RANKING LIST: a vertical list of numbered rows, each row a white cadastral card with a 3px orange left spine and, from left to right: a large rank badge (navy circle with a white mono number 1–10; the top 3 badges tinted gold/silver/bronze but subtly, within the brand), the razón social in bold Sora, a segmented RUC [20] [10004721] [8] in IBM Plex Mono, a green "ACTIVO" + blue "HABIDO" pill, the domicilio with a map-pin icon, and on the right a small "consultas" bar: a mini horizontal orange progress bar with a mono figure ("14 210 veces") showing relative popularity. Rows alternate very subtly and highlight on hover with an orange left glow.

Above the list, filter chips ("Hoy · Semana · Mes · Todas") and a "Buscar empresa…" input. Show 8–10 believable ranked companies (BCP, Supermercados Peruanos, Toyota del Perú, SUNAT, etc.). A faint Peru map watermark with the orange Lima dot sits behind the KPI row. Bottom: navy multi-column footer + "consultaruc-pe.com" + Peru flag.

Style: sleek, data-dashboard-meets-registry; navy + orange + white; status colors only in pills; the popularity bars are the only extra orange. Sora / Inter / IBM Plex Mono. High-trust, modern, airy. Light theme default, but make it look premium.
```

---

## 🖼️ DISEÑO 4 — "Registro Oficial" (hero destacado + tabla de datos filtrable)
```
DESIGN PROMPT: Design a full desktop web page mockup titled "Directorio de RUC — Registro de Empresas", styled like a modern official registry with a FEATURED COMPANY + a clean FILTERABLE DATA TABLE, in the site's cartographic govtech look. Navy #16233F fixed header (wordmark + "18 290 659 registros" mono counter + grouped nav) and "Inicio › Directorio" breadcrumb.

Top: a FEATURED / "empresa destacada" panel — a wide white cadastral card with a 3px orange left spine, containing a large segmented RUC [20] [10004721] [8] in IBM Plex Mono, the razón social in big bold Sora, a green "ACTIVO · 2026" pill and a blue "HABIDO" pill, the full domicilio, the actividad económica, and a "[REF: RUC-20-…]" tag — beside it a small stylized Peru map with the department highlighted and the orange Lima dot. It should look like an official ficha lifted straight from the site.

Below, a FILTER BAR (filter chips "Región ▾ · Sector ▾ · Estado ▾" + a "Buscar razón social o RUC…" input with a magnifier) and then a clean DATA TABLE of companies: a navy header row with columns "RUC · RAZÓN SOCIAL · ESTADO · CONDICIÓN · UBIGEO", then ~10 rows, each with a mono RUC, the razón social, a green "ACTIVO"/amber pill, a blue "HABIDO"/amber pill, and the ubigeo; rows separated by 1px hairlines, subtle zebra tint, hover highlight, and a small orange "Ver ficha →" on the right of each row. A sticky table header. A pagination footer ("1 2 3 … Ver más").

Show believable sample data (BCP, Toyota del Perú, Supermercados Peruanos, SUNAT, Alicorp, etc.). Bottom: navy multi-column footer + "consultaruc-pe.com" + Peru flag. Style: precise, tabular, high-trust, like a real registry but beautifully designed; navy + orange + white; status colors only in pills; Sora / Inter / IBM Plex Mono. Airy, aligned to grid. Light theme.
```

---

## 🖼️ DISEÑO 5 — "Fichas en Vivo" (mosaico de tarjetas tipo ficha oficial)
```
DESIGN PROMPT: Design a full desktop web page mockup titled "Directorio de Empresas — Fichas en Vivo", where each company is shown as a premium mini-FICHA (official-record card) in a masonry/grid, in the site's cartographic govtech style. Navy #16233F fixed header (wordmark + "18 290 659 registros" mono counter + grouped nav) and "Inicio › Directorio" breadcrumb.

Compact hero: bold Sora navy title with orange underline, subtitle "Cada empresa, como su ficha oficial — verificada contra SUNAT", and a slim search + filter bar ("Buscar empresa…", chips "Lima · Provincias · Activo · Habido"). A faint Peru map watermark with the orange Lima dot behind the hero.

The body is a responsive GRID of richly designed FICHA CARDS (3 per row on desktop). Each card is a white cadastral card (16px radius, 1px border, 3px orange left spine, soft shadow) laid out like a real ficha: at the top a small "[REF: RUC-20-…]" mono tag and, to the right, a green "ACTIVO" pill; the segmented RUC [20] [10004721] [8] shown large in IBM Plex Mono as the visual anchor; below it the razón social in bold Sora and the nombre comercial in muted Inter; then a compact two-line data block — "Domicilio: La Molina, Lima" with a map-pin icon and "Actividad: Banca múltiple" with a briefcase icon; a blue "HABIDO" pill; and a footer row with a subtle orange "Ver ficha completa →" link. On hover, the card lifts with a soft shadow and the orange spine brightens.

Show 6–9 believable companies (BCP, Toyota del Perú, Supermercados Peruanos, SUNAT, Luz del Sur, Alicorp…). A "Cargar más empresas" ghost button at the bottom. Bottom: navy multi-column footer + "consultaruc-pe.com" + Peru flag. Style: each card must read like an authentic official record yet feel modern and premium; navy + orange + white; status colors only in pills; Sora / Inter / IBM Plex Mono; generous spacing, aligned grid, airy. Light theme default; also hint how it looks elegant.
```

---

## ✅ Resumen de los 5 diseños
| # | Concepto | Layout | Vibe |
| - | -------- | ------ | ---- |
| 1 | **Mapa de Empresas** | Split mapa Perú + lista con pines conectados | Cartográfico interactivo |
| 2 | **Por Rubro** | Secciones por sector con grid de tarjetas | Organizado y escaneable |
| 3 | **Top Consultadas** | Ranking/leaderboard con barras de popularidad | Data-dashboard |
| 4 | **Registro Oficial** | Empresa destacada + tabla de datos filtrable | Registro preciso/tabular |
| 5 | **Fichas en Vivo** | Mosaico de tarjetas tipo ficha oficial | Cada empresa como su ficha |

**Cómo seguir:** genera los 5 mockups, dime cuál (o qué mezcla) te gusta más, y construyo esa página real con datos verificados contra SUNAT.
