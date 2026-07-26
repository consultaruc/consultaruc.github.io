# ConsultaRUC.pe — Image Prompts para las páginas de herramientas (20 imágenes)

**Cómo usar:** por cada imagen, pega primero el **MASTER DESIGN PROMPT** (está en `prompts-imagenes.md`, define la marca: navy #16233F, orange #F97316/#EA5B0C, verde/ámbar/rojo de estado, Sora / Inter / IBM Plex Mono, mapa del Perú + punto naranja de Lima, bloque de RUC segmentado, etiquetas [REF], marca de agua obligatoria "consultaruc-pe.com" abajo a la derecha con la banderita roja-blanca-roja) y luego el **IMAGE PROMPT** de la imagen. Genera en 16:9 y exporta a WebP (~1200px). Diseños nuevos y más ambiciosos que el set de la home: dashboards, líneas de decisión, medidores duales, escaleras de crecimiento, torres de control, documentos anotados de alta fidelidad.

4 imágenes por página × 5 páginas = **20 imágenes.** Cuando las tengas listas, las coloco dentro de cada artículo igual que hice en la home.

---

## ⚙️ REFUERZO DE CALIDAD (pégalo junto al MASTER en cada imagen)

Este bloque eleva todas las imágenes a acabado premium. Pégalo **después** del MASTER DESIGN PROMPT y **antes** del IMAGE PROMPT específico, en las 20 imágenes.

```
PRODUCTION SPEC (aplica a TODA la imagen):
- Lienzo y grilla: trabaja en 16:9 con un margen exterior cómodo (~6–7%) en los cuatro lados. Alinea todo a una grilla base; nada pegado a los bordes, nada amontonado. Reserva generoso espacio negativo: el diseño debe respirar, con jerarquía clara (título → elemento héroe → elementos secundarios).
- Paleta exacta: navy #16233F, naranja cálido #F97316 / #EA5B0C, blanco y off-white #F4F6FA de fondo. Verde #16A34A, ámbar #D97706 y rojo #DC2626 SOLO como lenguaje de estado/semáforo, nunca como fondos saturados. Azul #2563EB y teal como acentos mínimos en chips.
- Tipografía: títulos en Sora bold (el texto más grande); cuerpo y etiquetas en Inter; TODOS los números, RUC, códigos, tasas y etiquetas [REF] en IBM Plex Mono. Micro-etiquetas en mayúsculas mono ~11px sobre cada valor cuando compares atributos.
- Profundidad y luz: luz suave desde arriba-izquierda. Sombra difusa baja y uniforme en todas las tarjetas blancas (0 8px 20px rgba(16,35,63,0.06)); el elemento héroe con una sombra algo mayor y, si corresponde, un leve halo naranja para anclarlo. Uno o dos "blobs" atmosféricos muy tenues: azul pálido #DBE7F5 (~35%) detrás del héroe y cálido #FDEBD9 (~28%) cerca del punto de Lima.
- Acabado: vectorial nítido, editorial, de alta gama. Íconos de línea de 2px con puntas redondeadas y grosor consistente. Prohibido: fotorrealismo, capturas de pantalla reales, chrome de sistemas operativos, insignias de tiendas de apps, gradientes dentro de las tarjetas, perspectiva 3D, inclinaciones, brillos.
- Contenido: todo el texto en español peruano correcto y específico; nombres de empresa creíbles pero FICTICIOS; ninguna marca real; sin lorem ipsum; nunca inventes métricas, tasas, umbrales tributarios ni cotizaciones reales (usa valores "referenciales" con su etiqueta). Marca de agua obligatoria "consultaruc-pe.com" abajo a la derecha con la banderita del Perú, y una etiqueta [REF: …] en mono a baja opacidad como firma de estilo.
- Objetivo: que la idea central se entienda de un vistazo, sin leer texto de artículo, con una estética consistente con el resto del sitio.
```

---

# 📄 PÁGINA 1 — Ficha RUC (`/ficha-ruc/`)
Keyword: *ficha ruc*. Ángulo: la ficha como documento (qué contiene, descargarla, imprimirla, usarla en trámites).

## 🖼️ FICHA-1 — Anatomía de la ficha RUC (hero, alta fidelidad)
**16:9 · archivo:** `ficha-ruc-01-anatomia.webp`
**Concepto creativo:** un documento «ficha RUC» renderizado en grande, hermoso y realista pero claramente ilustrado, con líneas guía finas que etiquetan cada campo, como la lámina de anatomía de un libro premium.

```
IMAGE PROMPT: Create a high-fidelity editorial "anatomy" illustration titled "Anatomía de una ficha RUC" (bold Sora navy heading, top-left, thin warm-orange underline). Muted slate Inter subtitle: "Cada campo de tu ficha, explicado".

The HERO is a large, elegant mock FICHA RUC document occupying the center-left ~58% of the canvas: an upright white card with a soft paper shadow, a 1px #E2E6EC border, a slim navy header bar reading "FICHA RUC · SUNAT" in white, and inside it a clean two-column layout of real fields in correct Peruvian Spanish, numbers in IBM Plex Mono. Show, from top: a large segmented RUC block [20] [10004721] [8]; "Razón social: EMPRESA EJEMPLO S.A.C."; a row with a green "ACTIVO" pill and a blue "HABIDO" pill; "Tipo de contribuyente: Sociedad Anónima Cerrada"; "Domicilio fiscal: AV. EJEMPLO 123, LIMA – LIMA"; "Actividad económica: 4711 – Venta al por menor"; and a small "Comprobantes: Factura, Boleta" line. Keep the document beautifully typeset, generous spacing, nothing crowded.

Now ANNOTATE it like an anatomy plate: draw thin 1.5px warm-orange leader lines with small end-dots from 5–6 key fields out to small navy callout labels arranged in the right margin (never crossing each other), each label a compact white chip with one short explanation — e.g. from the RUC block: "11 dígitos: tipo + correlativo + verificador"; from the ACTIVO pill: "Estado: puede operar y facturar"; from HABIDO: "Domicilio verificado por SUNAT"; from actividad: "Giro según el código CIIU"; from comprobantes: "Qué documentos puede emitir".

In a lower corner keep the faint Peru map watermark with the orange Lima dot. Palette: navy + orange + white dominate; green/blue only inside the status pills. Titles bold Sora, body Inter, all numbers and the RUC in IBM Plex Mono. Give the document a single realistic soft shadow (0 12px 30px rgba(16,35,63,0.10)) so it lifts off the page; keep the callout chips lighter. Flat, crisp, high-end illustration — no photoreal scan, no glare, no 3D tilt, no real brand names (use believable fictional ones), no lorem ipsum. Add one subtle "[REF: RUC-20-10004721-8]" mono tag at the document's top-left at low opacity. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must instantly read a full ficha RUC and understand what each field means.
```
**ALT:** `Ilustración de anatomía de una ficha RUC que muestra un documento con el RUC segmentado, razón social, estado activo, condición habido, domicilio fiscal, actividad económica y comprobantes, con líneas que etiquetan y explican cada campo.`

## 🖼️ FICHA-2 — Descargar e imprimir la ficha en PDF
**16:9 · archivo:** `ficha-ruc-02-descargar.webp`
**Concepto creativo:** un flujo de 3 pasos en el que la ficha en pantalla «se convierte» en un PDF y en papel, con una laptop estilizada y un documento que sale hacia un ícono de PDF y una impresora.

```
IMAGE PROMPT: Create a clean 3-step flow infographic titled "Descarga tu ficha RUC en PDF" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "De la pantalla al archivo, en segundos y gratis".

Lay a LEFT-TO-RIGHT flow of three stages joined by thick warm-orange arrows. STAGE 1: a stylized flat laptop (navy bezel, subtle shadow) whose screen shows a mini ficha RUC card — a small segmented RUC block [20] [10004721] [8], a green "ACTIVO" pill and a "HABIDO" pill, and a small orange "Imprimir" button highlighted with a soft tap-ripple. STAGE 2: a print dialog card floating, with a highlighted option row reading "Destino: Guardar como PDF" (navy text, orange check), conveying the key trick. STAGE 3: the output — a crisp PDF document icon with a folded corner and a red "PDF" tag, next to a small line-icon printer emitting a sheet, showing both digital and paper results. Small labels under each stage: "1. Abre tu ficha", "2. Imprimir → Guardar como PDF", "3. Archiva o imprime".

Add one small helpful chip in navy/white: "Sin programas · gratis · al instante". Keep a faint Peru map watermark with the orange Lima dot in a corner. Palette navy + orange + white; green only in the status pill, red only in the small PDF tag. Titles bold Sora, labels Inter, RUC digits IBM Plex Mono. Uniform soft shadows on the cards; the laptop slightly more pronounced as the starting hero. Flat vector — no photoreal devices, no real OS chrome, no brand logos, no lorem ipsum. Include a subtle "[REF: RUC-20-…]" mono tag at low opacity. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must instantly grasp "ver ficha → guardar como PDF → archivar o imprimir".
```
**ALT:** `Infografía de 3 pasos para descargar la ficha RUC en PDF: abrir la ficha en una laptop, usar imprimir y elegir "Guardar como PDF", y obtener el archivo PDF o la impresión en papel.`

## 🖼️ FICHA-3 — La ficha RUC en tus trámites (usos)
**16:9 · archivo:** `ficha-ruc-03-tramites.webp`
**Concepto creativo:** una ficha RUC en el centro como «llave», y a su alrededor cuatro escenarios de trámite (banco, licitación del Estado, contrato con proveedor, apertura de cuenta) conectados por líneas, mostrando que la misma ficha abre muchas puertas.

```
IMAGE PROMPT: Create a "one document, many doors" infographic titled "La ficha RUC en tus trámites" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "El documento que te abre puertas en el mundo formal".

Center-left, place a HERO ficha RUC card rendered like a key document: a white card with an orange left spine, a small segmented RUC block [20] [10004721] [8], a green "ACTIVO" pill and a "HABIDO" pill, and the label "FICHA RUC" in mono. From this central document, draw FOUR curved warm-orange connector lines (each ending in a small orange dot) fanning to the right toward four white "trámite" cards, each with a 2px navy line icon, a bold Sora title and one muted Inter line:
- icon: bank/landmark. "Trámites bancarios" — "Abrir cuentas y solicitar crédito empresarial."
- icon: government building with a flag. "Licitaciones del Estado" — "Acreditar tu RUC activo y habido para postular."
- icon: handshake / contract. "Contratos y proveedores" — "Respaldar tu identidad ante grandes compradores."
- icon: file-check. "Altas y registros" — "Darte de alta como proveedor con datos exactos."

Let the four cards sit at staggered radial distances for an organic, editorial feel; add 2–3 faint ambient mono chips ("[REF: RUC-20-…]", a small "HABIDO" pill) at low opacity in the negative space. Keep the faint Peru map watermark with the orange Lima dot lower-left, partly behind the central document for depth. Palette navy + orange + white; green/blue only in the small pills. Titles bold Sora, descriptions Inter, RUC in IBM Plex Mono. Airy composition, generous negative space, soft uniform shadows, one pale-blue background blob behind the fan and one warm blob behind the document. Flat high-end vector — no photoreal, no real brands, no lorem ipsum. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must feel that a single ficha RUC unlocks many formal procedures.
```
**ALT:** `Infografía que muestra la ficha RUC al centro como una llave conectada a cuatro trámites: bancarios, licitaciones del Estado, contratos con proveedores y altas o registros, ilustrando que un mismo documento abre muchas puertas.`

## 🖼️ FICHA-4 — Ficha de persona natural vs persona jurídica
**16:9 · archivo:** `ficha-ruc-04-natural-juridica.webp`
**Concepto creativo:** dos fichas RUC enfrentadas lado a lado (una con RUC 10, otra con RUC 20), con un divisor central, resaltando las diferencias entre persona natural y jurídica.

```
IMAGE PROMPT: Create a side-by-side comparison infographic titled "Ficha RUC: persona natural vs persona jurídica" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Dos tipos de contribuyente, dos fichas distintas".

Split the canvas into two mirrored panels with a slim central navy divider carrying a small circular "VS" chip at mid-height. LEFT panel — "PERSONA NATURAL": a white ficha card with a 3px navy left spine showing a segmented RUC block that begins with 10, e.g. [10] [45678901] [X]; a person line-icon; fields "Titular: NOMBRES Y APELLIDOS", "Tipo: Persona natural con negocio", "Responde con: patrimonio personal"; a small blue chip "Empieza con 10". RIGHT panel — "PERSONA JURÍDICA": a white ficha card with a 3px orange left spine showing a RUC that begins with 20, e.g. [20] [10004721] [8]; a building line-icon; fields "Razón social: EMPRESA S.A.C.", "Tipo: Sociedad constituida", "Responde con: patrimonio de la empresa"; a small orange chip "Empieza con 20". Align equivalent rows across both cards so the eye compares horizontally.

Under both, a full-width takeaway strip in pale navy tint with an orange accent: "El prefijo del RUC te dice, de un vistazo, si tratas con una persona o con una empresa." Keep a faint Peru map watermark with the orange Lima dot in a lower corner. Palette navy + orange + white; blue and green only as tiny accent chips/pills. Titles bold Sora, fields Inter, all RUC digits IBM Plex Mono, strict horizontal row alignment. Uniform soft shadows; one faint pale-blue blob behind the pair. Flat editorial vector — no photoreal, no real names (use fictional), no lorem ipsum. Include a "[REF: RUC-10-…]" and a "[REF: RUC-20-…]" mono tag, one per card, at low opacity. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must instantly distinguish a persona natural (10) from a persona jurídica (20) ficha.
```
**ALT:** `Comparación lado a lado de una ficha RUC de persona natural (empieza con 10) y una de persona jurídica (empieza con 20), mostrando las diferencias de titular, tipo de contribuyente y responsabilidad.`

---

# 🔎 PÁGINA 2 — Búsqueda por Razón Social (`/razon-social/`)
Keyword: *razón social*. Ángulo: encontrar una empresa por su nombre cuando no tienes el RUC.

## 🖼️ RAZON-1 — Del nombre al RUC (hero)
**16:9 · archivo:** `razon-social-01-del-nombre-al-ruc.webp`
**Concepto creativo:** un «viaje» de izquierda a derecha: un letrero/marca de tienda → una barra de búsqueda con un nombre escrito → una tarjeta de resultado con el RUC revelado. La transformación de un nombre conocido en una identidad tributaria.

```
IMAGE PROMPT: Create a left-to-right transformation infographic titled "Del nombre al RUC" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "¿Solo sabes el nombre? Encuentra el RUC en segundos".

Three connected stages joined by bold warm-orange arrows. STAGE 1 — "Lo que conoces": a stylized storefront sign / brand badge showing a fictional commercial name like "SúperAhorro" in a friendly rounded plate, with a small tag "nombre comercial". STAGE 2 — "La búsqueda": a clean search bar (white, rounded, subtle shadow) with the typed text "supermercados…" and an orange search button; a small tab chip labeled "Por Razón Social" is active above it. STAGE 3 — "El resultado": a white result card with an orange left spine revealing the legal identity — a segmented RUC block [20] [10004721] [8], "Razón social: INVERSIONES EJEMPLO S.A.C.", a green "ACTIVO" pill and a "HABIDO" pill, and a small note "nombre comercial ≠ razón social".

The visual story is the reveal: a familiar name on the left becomes a verified legal identity on the right. Add a faint dotted path linking the storefront to the final RUC to reinforce the journey. Keep the faint Peru map watermark with the orange Lima dot in a lower corner. Palette navy + orange + white; green/blue only in the result pills. Titles bold Sora, labels Inter, RUC and any numbers in IBM Plex Mono. Generous spacing, soft uniform shadows, one pale-blue background blob behind stage 3. Flat high-end vector — no photoreal, no real brands (use fictional names), no lorem ipsum. Include a subtle "[REF: RUC-20-…]" mono tag near stage 3. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must grasp: known name → search by razón social → revealed RUC and legal identity.
```
**ALT:** `Infografía que muestra cómo pasar del nombre de una tienda a su RUC: un letrero comercial, una búsqueda por razón social y una tarjeta de resultado que revela la razón social legal y el RUC con estado activo y habido.`

## 🖼️ RAZON-2 — Razón social vs nombre comercial vs marca
**16:9 · archivo:** `razon-social-02-vs-marca.webp`
**Concepto creativo:** tres capas o «etiquetas» apiladas sobre un mismo negocio, mostrando que una empresa tiene una razón social (legal), un nombre comercial (público) y marcas (productos), gestionadas por entidades distintas.

```
IMAGE PROMPT: Create a layered concept infographic titled "Razón social, nombre comercial y marca: no son lo mismo" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Tres identidades de un mismo negocio".

Center the image on a single stylized "business" object (a simple navy building or box icon) with THREE distinct labeled layers/tags attached to it, arranged as stacked ribbons or cards going from formal (bottom) to public (top):
- BOTTOM layer — "RAZÓN SOCIAL" (navy card, 3px orange spine): "El nombre legal ante la SUNAT. Ej: Inversiones Ejemplo S.A.C." with a small tag "tributario".
- MIDDLE layer — "NOMBRE COMERCIAL" (white card): "Con el que te presentas al público. Ej: SúperAhorro." with a tag "comercial".
- TOP layer — "MARCA" (white card): "Signo que protege tu producto ante Indecopi. Ej: logo/nombre de un producto." with a tag "propiedad industrial".

Draw thin connectors from each layer to a small side note clarifying "quién lo gestiona" (SUNAT / la empresa / Indecopi). Add one takeaway strip below: "En una factura va la razón social, no la marca." Keep the faint Peru map watermark with the orange Lima dot in a corner. Palette navy + orange + white; use one restrained accent (teal or blue) only in tiny tags. Titles bold Sora, body Inter, any example names in a clean style, numbers/refs in IBM Plex Mono. Airy, well-spaced, soft shadows, one pale-blue blob for depth. Flat editorial vector — no photoreal, no real brands, no lorem ipsum. Include a "[REF: RUC-20-…]" mono tag at low opacity. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must instantly separate the legal name, the public name and the brand.
```
**ALT:** `Infografía en capas que distingue la razón social (nombre legal ante SUNAT), el nombre comercial (con el que se presenta al público) y la marca (signo protegido ante Indecopi) de un mismo negocio.`

## 🖼️ RAZON-3 — Empresas con nombres parecidos (desambiguación)
**16:9 · archivo:** `razon-social-03-homonimos.webp`
**Concepto creativo:** una búsqueda que arroja varias empresas casi idénticas de nombre, y cómo un «filtro» (domicilio, distrito, actividad) las desambigua hasta señalar la correcta.

```
IMAGE PROMPT: Create a disambiguation infographic titled "Empresas con nombres parecidos" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Cómo elegir la correcta entre varias coincidencias".

On the LEFT, show a search result list card with 4 near-identical rows, each a fictional company sharing a common word — e.g. "TRANSPORTES DEL NORTE S.A.C.", "TRANSPORTES DEL NORTE E.I.R.L.", "TRANSPORTES NORTE ANDINO S.A.C.", "TRANSPORTES DEL NORTE PERÚ S.R.L." — each with a small mono RUC and a tiny distrito label. The list looks intentionally confusing at first glance. In the CENTER, place a stylized "filtro" element: a funnel or a set of filter chips labeled "Domicilio", "Distrito", "Actividad", with a warm-orange highlight. On the RIGHT, the single CORRECT result emerges as a clean white card with an orange left spine, a segmented RUC block [20] [10004721] [8], "Distrito: Trujillo", "Actividad: Transporte de carga", a green "ACTIVO" pill and a "HABIDO" pill, plus a small orange check badge meaning "confirmada".

The narrative: many look-alikes on the left → a filter in the middle → one confirmed match on the right. Add a small caution chip: "Confirma siempre con un dato extra." Keep the faint Peru map watermark with the orange Lima dot in a corner. Palette navy + orange + white; green/blue only in the final pills, a soft amber tint only on the "confusing" list to signal caution. Titles bold Sora, rows Inter, RUC and distrito in IBM Plex Mono. Soft uniform shadows, one pale-blue blob behind the right card. Flat editorial vector — no photoreal, fictional names only, no lorem ipsum. Include a "[REF: RUC-20-…]" mono tag near the right card. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must grasp how to disambiguate homonym companies using an extra data point.
```
**ALT:** `Infografía que muestra varias empresas con nombres casi idénticos en una búsqueda y cómo un filtro por domicilio, distrito y actividad ayuda a identificar la empresa correcta y confirmada.`

## 🖼️ RAZON-4 — Tipos de sociedad (SAC, SA, EIRL, SRL)
**16:9 · archivo:** `razon-social-04-tipos-sociedad.webp`
**Concepto creativo:** cuatro «insignias» o sellos, uno por tipo de sociedad, cada uno con su sigla, una breve descripción y un ícono, para leer la sigla de una razón social como un experto.

```
IMAGE PROMPT: Create a clean four-badge reference infographic titled "Tipos de sociedad en su razón social" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Qué te dice la sigla: S.A.C., S.A., E.I.R.L. y S.R.L.".

Arrange FOUR equal badge-cards in a row (or 2×2 grid), each a white rounded card with a distinct thin colored top bar and a bold mono sigla in a circular chip, plus a short bold Sora title and one muted Inter line:
- "S.A.C." (navy top bar, icon: two-person group). "Sociedad Anónima Cerrada" — "La más común entre pymes; pocos accionistas."
- "S.A." (blue top bar, icon: building with columns). "Sociedad Anónima" — "Para empresas más grandes; muchos accionistas posibles."
- "E.I.R.L." (teal top bar, icon: single person + shield). "Empresa Individual de R.L." — "Un solo titular; separa el patrimonio del negocio."
- "S.R.L." (amber top bar, icon: puzzle/shares). "Sociedad de R.L." — "Capital repartido en participaciones entre socios."

Above or between the badges, show a small example razón social with its sigla highlighted, e.g. "INVERSIONES EJEMPLO [S.A.C.]", to connect the abstract badges to a real name. Keep the color per badge only in the top bar and sigla chip, never overwhelming the navy+orange brand. Add a subtle takeaway: "La sigla revela el tamaño y la estructura del negocio." Faint Peru map watermark with the orange Lima dot in a corner. Titles bold Sora, body Inter, siglas and any RUC in IBM Plex Mono. Strict grid alignment, soft uniform shadows, one pale-blue blob for depth. Flat editorial vector — no photoreal, no real names, no lorem ipsum. Include a "[REF: RUC-20-…]" mono tag at low opacity. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must instantly learn to read the society type from a razón social.
```
**ALT:** `Infografía de cuatro insignias que explican los tipos de sociedad en una razón social: S.A.C., S.A., E.I.R.L. y S.R.L., con su significado, un ícono y un ejemplo.`

---

# 📋 PÁGINA 3 — Verificación masiva de RUC (`/verificar-ruc-multiple/`)
Keyword: *consulta RUC masiva / verificar en lote*. Ángulo: verificar muchos RUC a la vez. (Diseños distintos al pipeline de la home.)

## 🖼️ MASIVA-1 — Torre de control: dashboard de verificación (hero)
**16:9 · archivo:** `masiva-01-dashboard.webp`
**Concepto creativo:** un panel de control («dashboard») que resume la verificación de cientos de RUC: tarjetas de KPI (activos / observados / baja), un gráfico de dona con el semáforo, y una mini tabla. Sensación de centro de mando, más sofisticado que el pipeline.

```
IMAGE PROMPT: Create a sophisticated dashboard infographic titled "Panel de verificación masiva de RUC" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Cientos de RUC, una sola pantalla de control".

Design it like a clean analytics dashboard on a soft off-white canvas. TOP ROW: three KPI stat-cards, each white with a colored left spine and a big mono number: green spine "312 · Activos y habidos", amber spine "26 · Observados", red spine "12 · En baja". LEFT-CENTER: a donut/ring chart split into green (majority), amber and red segments, with a center label "350 RUC" in mono, giving an instant health read. RIGHT: a compact results table card with a navy header ("RUC · RAZÓN SOCIAL · ESTADO") and 5–6 rows, each with a mono RUC, a truncated fictional razón social and a status pill (mostly green "ACTIVO · HABIDO", one amber "NO HABIDO", one red "BAJA"); a small orange "Exportar CSV" chip at the table's top-right. BOTTOM: a thin progress bar reading "Procesados 350 / 350" fully filled in orange.

The whole thing should feel like a calm, premium control tower — aligned to a grid, lots of breathing room, subtle card shadows. Keep the faint Peru map watermark with the orange Lima dot in a lower corner behind the donut. Palette navy + orange + white as the frame; green/amber/red used purposefully as the status language (the emotional core). Titles bold Sora, labels Inter, all numbers/RUC in IBM Plex Mono. Flat, crisp, data-viz clean — no photoreal screenshots, no 3D, no fake OS chrome, fictional company names only, no lorem ipsum. Include a "[REF: LOTE-350]" mono tag at low opacity. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must grasp the health of an entire batch of RUC at a glance.
```
**ALT:** `Dashboard de verificación masiva de RUC con tarjetas de KPI (activos, observados y en baja), un gráfico de dona con el semáforo de estados y una tabla de resultados exportable, resumiendo cientos de RUC en una pantalla.`

## 🖼️ MASIVA-2 — Sube tu lista: CSV / Excel / pegar
**16:9 · archivo:** `masiva-02-subir-lista.webp`
**Concepto creativo:** dos caminos de entrada que convergen en el motor: arrastrar un archivo CSV/Excel, o pegar una lista de texto. Estilo «drag & drop» amigable.

```
IMAGE PROMPT: Create a clean input infographic titled "Sube tu lista de RUC" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Dos formas de empezar: un archivo o una lista pegada".

Show TWO parallel input paths on the left that converge with orange arrows into a single navy "verificar" module on the right. PATH A — a dashed drop-zone card (2px #C5CFDD dashed border) with a spreadsheet/CSV file icon being dropped in, labeled "Arrastra un CSV o Excel", and a small preview of a column of mono RUCs (20100047056 / 20512345678 / 10456789012 / "+197 más"). PATH B — a text-area card with a blinking cursor and a pasted list of mono RUCs, one per line, labeled "O pega tu lista". Both paths flow via orange arrows into a compact navy module labeled in white mono "VERIFICAR" with a small lightning/gear icon and a thin orange progress hint.

Add a small helper chip: "Uno por línea o separados por coma". Keep the faint Peru map watermark with the orange Lima dot in a corner. Palette navy + orange + white; the RUC lists in IBM Plex Mono, titles bold Sora, labels Inter. Friendly, spacious, soft uniform shadows, one pale-blue blob behind the module. Flat vector — no photoreal spreadsheet screenshots, no real brands, no lorem ipsum. Include a "[REF: LOTE-…]" mono tag at low opacity. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must grasp that you can either drop a file or paste a list to start a mass verification.
```
**ALT:** `Infografía que muestra dos formas de subir una lista de RUC para verificación masiva: arrastrar un archivo CSV o Excel, o pegar la lista de RUC como texto, ambas convergiendo en el motor de verificación.`

## 🖼️ MASIVA-3 — Semáforo de resultados y exportación
**16:9 · archivo:** `masiva-03-semaforo.webp`
**Concepto creativo:** una tabla de resultados grande, protagonista, con filas coloreadas por semáforo y un botón de exportar; el foco está en leer las excepciones de un vistazo.

```
IMAGE PROMPT: Create a results-table infographic titled "Lee tus resultados de un vistazo" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Verde sigue, ámbar revisa, rojo detente".

The HERO is a large, clean results TABLE card with an orange left spine and a navy header row: columns "RUC", "RAZÓN SOCIAL", "ESTADO", "CONDICIÓN". Show ~8 rows with mono RUCs and fictional razón sociales; use the traffic-light system with a subtle tinted background on the whole row: most rows tinted very light green with "ACTIVO"/"HABIDO" pills, one row tinted light amber with a "NO HABIDO" pill, one light amber "SUSPENSIÓN", one light red with a "BAJA" pill. This tinting lets the eye jump straight to the exceptions. At the table's top-right, a prominent orange "Exportar CSV" button with a download icon. To the right of the table, a small side panel with three summary chips (green "312 activos", amber "26 observados", red "12 baja") and a one-line tip: "Enfócate en las filas que no son verdes".

Keep the faint Peru map watermark with the orange Lima dot in a lower corner. Palette navy + orange + white as the frame; green/amber/red carry the meaning via pills and gentle row tints (keep tints pale, never saturated). Titles bold Sora, table text Inter, all RUC/numbers IBM Plex Mono. Crisp data-viz look, soft shadow on the table card, one pale-blue blob behind it. Flat vector — no photoreal, fictional names only, no lorem ipsum. Include a "[REF: LOTE-350]" mono tag at low opacity. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must instantly scan the batch and spot the rows that need attention.
```
**ALT:** `Tabla de resultados de una verificación masiva de RUC con filas coloreadas por semáforo —verde activo y habido, ámbar suspensión o no habido, rojo baja— y un botón para exportar a CSV.`

## 🖼️ MASIVA-4 — Monitoreo periódico (calendario/ciclo)
**16:9 · archivo:** `masiva-04-monitoreo.webp`
**Concepto creativo:** un ciclo o calendario que muestra que la verificación no es única sino recurrente: un anillo con etapas (alta → pagos → cierre → repetir) o un calendario con verificaciones marcadas.

```
IMAGE PROMPT: Create a cyclical infographic titled "Monitoreo periódico, no una sola vez" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "La situación de un RUC cambia; revísalo cada cierto tiempo".

Center a circular CYCLE made of four navy nodes connected by curved warm-orange arrows going clockwise, each node a circle with a white line-icon and a short bold Sora label plus one muted line:
- icon: user-plus. "Al dar de alta" — "Verifica antes de incorporar a un proveedor."
- icon: wallet/receipt. "Antes de pagar" — "Reverifica antes de cada tanda de pagos."
- icon: calendar-check. "En el cierre" — "Depura tu cartera al cerrar el periodo."
- icon: refresh/loop. "Y repite" — "Un ciclo continuo mantiene el riesgo bajo control."

In the center of the ring, place a small badge with a shield-check and the mono label "RUC AL DÍA". To one side, add a subtle mini-calendar motif with a few days marked by tiny green/amber dots, reinforcing recurrence. Keep the faint Peru map watermark with the orange Lima dot in a lower corner. Palette navy + orange + white; green/amber only in the tiny calendar dots and any micro-pill. Titles bold Sora, labels Inter, any numbers IBM Plex Mono. Balanced, airy, soft uniform shadows, one pale-blue blob behind the ring. Flat editorial vector — no photoreal, no lorem ipsum. Include a "[REF: LOTE-…]" mono tag at low opacity. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must feel that verification is a recurring cycle, not a one-time act.
```
**ALT:** `Infografía circular que muestra el monitoreo periódico de RUC como un ciclo: verificar al dar de alta, antes de pagar y en el cierre, y repetir, con un badge central de "RUC al día".`

---

# 🧮 PÁGINA 4 — Calculadora de Régimen Tributario (`/calculadora-tributaria/`)
Keyword: *régimen tributario*. Ángulo: elegir entre NRUS, RER, MYPE Tributario y Régimen General.

## 🖼️ REGIMEN-1 — Los 4 regímenes como una escalera (hero)
**16:9 · archivo:** `regimen-01-escalera.webp`
**Concepto creativo:** una escalera ascendente de 4 peldaños, uno por régimen, de menor a mayor complejidad/ingresos, mostrando la progresión NRUS → RER → MYPE → General como el crecimiento de un negocio.

```
IMAGE PROMPT: Create an ascending-staircase infographic titled "Los 4 regímenes tributarios del Perú" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "De lo más simple a lo más completo, según tu negocio".

Draw a clean STAIRCASE of four rising steps from lower-left to upper-right, each step a white card sitting on a navy step, labeled in order of increasing size/complexity, each with a short bold Sora title and one muted Inter line:
- STEP 1 (lowest) — "NRUS" — "Cuota fija mensual · solo boletas · negocios pequeños." small tag "el más simple".
- STEP 2 — "RER" — "Tasa fija sobre ingresos · permite facturar."
- STEP 3 — "RMT" — "Tributa sobre utilidades · para la micro y pequeña empresa."
- STEP 4 (highest) — "Régimen General" — "Sin límite de ingresos · contabilidad completa." small tag "el más completo".

A small stylized figure or arrow climbs the stairs to convey "a medida que creces, subes de régimen". Along the rising direction, add a thin axis hint: "más ingresos · más obligaciones →". Keep the color accents subtle (a gentle gradient of the step tone from light to navy). Faint Peru map watermark with the orange Lima dot in a lower corner. Palette navy + orange + white; one restrained accent (green at the top step as the "growth" reward) allowed. Titles bold Sora, body Inter, any figures IBM Plex Mono. Airy, motivational, soft uniform shadows, one pale-blue blob behind the staircase. Flat editorial vector — no photoreal, no lorem ipsum, do not invent exact tax rates or thresholds (keep descriptions qualitative). Include a small "UIT" reference chip only as a neutral label. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must grasp the four regimes as an ascending path from simple to complete.
```
**ALT:** `Infografía en forma de escalera ascendente con los cuatro regímenes tributarios del Perú —Nuevo RUS, RER, MYPE Tributario y Régimen General— ordenados de más simple a más completo según el crecimiento del negocio.`

## 🖼️ REGIMEN-2 — Cómo elegir tu régimen (árbol de decisión)
**16:9 · archivo:** `regimen-02-arbol-decision.webp`
**Concepto creativo:** un flujo de decisión con preguntas (¿le vendes a empresas? ¿tus gastos son altos?) que ramifica hasta recomendar un régimen. Estilo diagrama de decisión limpio.

```
IMAGE PROMPT: Create a clean decision-tree infographic titled "¿Qué régimen tributario te conviene?" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Tres preguntas que orientan tu elección".

Build a top-to-bottom or left-to-right DECISION FLOW with navy diamond/pill decision nodes and warm-orange branch lines labeled "Sí" / "No", ending in four rounded outcome cards, one per regime. Structure the questions clearly:
- Q1: "¿Le vendes a empresas (necesitas factura)?" — "No" branch leans toward NRUS; "Sí" continues.
- Q2: "¿Tus gastos son altos frente a tus ventas?" — "No" leans to RER; "Sí" continues.
- Q3: "¿Tu facturación es alta o tu actividad lo exige?" — "No" leans to RMT; "Sí" to Régimen General.

Each outcome card is a small white card with an orange left spine and a bold regime name (NRUS / RER / RMT / Régimen General) plus a one-line reason. Keep the branches tidy and non-crossing, with clear "Sí/No" labels in small mono chips. Add a footnote chip: "Orientativo — confírmalo con tu contador." Faint Peru map watermark with the orange Lima dot in a corner. Palette navy + orange + white; keep it diagrammatic and calm. Titles bold Sora, questions/labels Inter, Sí/No chips and any refs IBM Plex Mono. Soft uniform shadows, one pale-blue blob for depth. Flat vector — no photoreal, no invented exact rates, no lorem ipsum. Include a subtle neutral tag. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must be able to trace the questions to a recommended regime.
```
**ALT:** `Árbol de decisión que ayuda a elegir el régimen tributario según tres preguntas —si vendes a empresas, si tus gastos son altos y cuánto facturas— con ramas Sí/No que llevan a NRUS, RER, MYPE Tributario o Régimen General.`

## 🖼️ REGIMEN-3 — Comparativa de los 4 regímenes (matriz)
**16:9 · archivo:** `regimen-03-comparativa.webp`
**Concepto creativo:** una matriz de comparación con los 4 regímenes en columnas y filas de atributos (¿facturas?, ¿tributa sobre?, obligaciones, para quién), alineada para comparar de un vistazo.

```
IMAGE PROMPT: Create a comparison-matrix infographic titled "NRUS vs RER vs MYPE vs General" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Cuatro regímenes, comparados fila por fila".

Arrange FOUR equal vertical columns (one per regime) with a consistent internal structure and STRICTLY ALIGNED rows so the eye compares horizontally. Each column is a white card with its own thin colored top bar and the regime name in bold Sora; below, aligned attribute rows with tiny uppercase mono labels above each value:
- "¿EMITE FACTURA?" — NRUS: No (only boletas) · RER: Sí · RMT: Sí · General: Sí.
- "TRIBUTA SOBRE" — NRUS: cuota fija · RER: ingresos · RMT: utilidad · General: utilidad.
- "OBLIGACIONES" — NRUS: mínimas · RER: moderadas · RMT: intermedias · General: completas.
- "PARA QUIÉN" — NRUS: negocio pequeño al público · RER: pequeño que factura · RMT: micro y pequeña empresa · General: mediana/grande.

Use a small green check / red cross iconography only for the "¿emite factura?" row to make that key difference pop. Keep per-column identity color only in the top bar. Add a full-width takeaway strip: "El régimen ideal depende de a quién vendes y de tus gastos." Faint Peru map watermark with the orange Lima dot in a corner. Palette navy + orange + white; green/red only in the factura row; other accents restrained. Titles bold Sora, labels/values Inter, any qualifiers IBM Plex Mono. Strict grid alignment is essential. Soft uniform shadows, one pale-blue blob for depth. Flat editorial vector — no photoreal, no invented exact rates/thresholds (keep qualitative), no lorem ipsum. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must compare the four regimes attribute by attribute in one glance.
```
**ALT:** `Cuadro comparativo de los cuatro regímenes tributarios —NRUS, RER, MYPE Tributario y General— fila por fila: si emiten factura, sobre qué tributan, sus obligaciones y para quién es cada uno.`

## 🖼️ REGIMEN-4 — Régimen y crecimiento del negocio (línea de crecimiento)
**16:9 · archivo:** `regimen-04-crecimiento.webp`
**Concepto creativo:** una curva de crecimiento ascendente con hitos donde el negocio cambia de régimen a medida que crece; conecta la elección tributaria con la trayectoria del negocio.

```
IMAGE PROMPT: Create a growth-curve infographic titled "Tu régimen crece contigo" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Del primer emprendimiento a la empresa consolidada".

Draw a smooth upward-rising growth CURVE (a soft orange line with a subtle area fill fading to transparent) from lower-left to upper-right, with FOUR milestone markers placed along it where the regime changes. Each marker is a navy dot with a small callout card: "Inicio pequeño → NRUS", "Empiezas a facturar → RER", "Creces como pyme → RMT", "Empresa consolidada → Régimen General". Along the x-axis a subtle label "tamaño del negocio →" and along the y-axis "formalidad / ingresos ↑". At the top-right end, a small orange burst badge "Sin límites" for the General stage.

The story: as the curve climbs, the business moves up through the regimes. Add 2–3 faint ambient business icons (a small shop, a truck, a building) near the relevant milestones at low opacity. Keep the faint Peru map watermark with the orange Lima dot in a lower corner. Palette navy + orange + white; a hint of green near the top as growth reward. Titles bold Sora, labels Inter, any figures IBM Plex Mono. Motivational, airy, soft uniform shadows, one pale-blue blob behind the curve. Flat editorial vector — no photoreal, no invented exact numbers, no lorem ipsum. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must feel that the regime evolves with the growth of the business.
```
**ALT:** `Curva de crecimiento ascendente con hitos que muestran cómo el régimen tributario cambia a medida que el negocio crece: de NRUS al empezar, a RER al facturar, luego MYPE Tributario y finalmente Régimen General.`

---

# 💱 PÁGINA 5 — Tipo de Cambio SUNAT (`/tipo-de-cambio-sunat/`)
Keyword: *tipo de cambio SUNAT*. Ángulo: la referencia oficial para convertir dólares a soles en tus operaciones tributarias.

## 🖼️ TC-1 — SUNAT vs bancario vs paralelo (hero)
**16:9 · archivo:** `tc-01-tres-tipos.webp`
**Concepto creativo:** tres «marcadores» de tipo de cambio uno al lado del otro (oficial SUNAT/SBS, bancario, paralelo), resaltando cuál se usa para lo tributario. Estilo cotización financiera limpio.

```
IMAGE PROMPT: Create a clean financial comparison infographic titled "Tipo de cambio: SUNAT vs banco vs paralelo" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Cuál usar para tus impuestos y cuál para comprar dólares".

Show THREE side-by-side quote cards, each a white card with a distinct thin top bar, a bold label, a stylized "compra / venta" pair of mono numbers (use neutral placeholder values like "3.7X" without implying a real rate), and a small icon:
- "SUNAT / SBS" (navy top bar, icon: government/landmark) — highlighted as the reference with a subtle orange glow and a badge "OFICIAL · para tributos". Small note: "Referencia para convertir a soles en tu contabilidad e impuestos."
- "BANCO" (blue top bar, icon: bank card) — note: "El que te da tu banco para comprar/vender; con margen."
- "PARALELO" (slate/amber top bar, icon: exchange arrows) — note: "Mercado de cambistas; fluctúa libremente."

Make the SUNAT card visually the protagonist (slightly larger, orange-accented) to signal that it is the one used for tax purposes. Add a takeaway strip: "Para tus impuestos, la referencia oficial; para comprar dólares, el del banco." Keep the numbers deliberately generic (mono, with an "referencial" tag) so the image never claims a real live rate. Faint Peru map watermark with the orange Lima dot in a corner. Palette navy + orange + white; blue/amber only in the secondary top bars. Titles bold Sora, notes Inter, all rate numbers IBM Plex Mono with a small "referencial" disclaimer chip. Soft uniform shadows, one pale-blue blob for depth. Flat editorial vector — no photoreal, no real live figures, no lorem ipsum. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must instantly distinguish the official (tax) rate from the bank and parallel rates.
```
**ALT:** `Infografía que compara tres tipos de cambio —el oficial SUNAT/SBS para tributos, el bancario y el paralelo— resaltando que el oficial es la referencia para convertir dólares a soles en impuestos.`

## 🖼️ TC-2 — Compra vs venta (medidor dual)
**16:9 · archivo:** `tc-02-compra-venta.webp`
**Concepto creativo:** un medidor o balanza doble que muestra el tipo de cambio compra (más bajo) y venta (más alto), con una guía de cuándo usar cada uno.

```
IMAGE PROMPT: Create a clean dual-gauge infographic titled "Tipo de cambio: compra y venta" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Dos valores, un criterio para cada operación".

Center on a stylized DUAL DIAL or balanced scale showing two values: on the left a "COMPRA" reading (lower, in a cooler tone) and on the right a "VENTA" reading (higher, in a warmer orange tone), rendered as large mono numbers with a small "referencial" tag so they don't claim a live rate. Between them, show the small "spread" (the margin) as a subtle bracket. Below or beside, two guidance cards:
- "COMPRA" card (cool spine): "Se usa en general para tus gastos / lo que pagas."
- "VENTA" card (orange spine): "Se usa en general para tus ingresos / lo que cobras."
Add a caution chip: "Existen reglas específicas por tributo — confírmalo con tu contador."

Keep the two readings clearly differentiated (compra lower/cooler, venta higher/warmer) so the concept is instant. Faint Peru map watermark with the orange Lima dot in a corner. Palette navy + orange + white; use a cool navy-blue for "compra" and warm orange for "venta" as the only differentiating hues. Titles bold Sora, guidance Inter, all rate numbers IBM Plex Mono with a "referencial" disclaimer. Soft uniform shadows, one pale-blue blob for depth. Flat editorial vector — no photoreal, no real live figures, no lorem ipsum. Include a subtle neutral tag. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must grasp that there are two rates (compra/venta) and roughly when each applies.
```
**ALT:** `Infografía con un medidor dual que muestra el tipo de cambio compra (más bajo) y venta (más alto), con una guía de cuándo se usa cada uno para gastos e ingresos.`

## 🖼️ TC-3 — Factura en dólares → soles (conversión)
**16:9 · archivo:** `tc-03-factura-dolares.webp`
**Concepto creativo:** una factura en dólares que se convierte a soles mediante una fórmula clara (monto USD × tipo de cambio de la fecha correcta = monto S/), resaltando la importancia de la fecha.

```
IMAGE PROMPT: Create a clear conversion infographic titled "Factura en dólares a soles" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Convierte con el valor y la fecha correctos".

Show a horizontal CONVERSION FORMULA as the hero. On the left, a small mock invoice card in USD with a mono "US$ 1,000.00" total and a "FACTURA · USD" tag. Then a big navy "×" sign leading to a rounded chip labeled "Tipo de cambio de la fecha de la operación" with a mono value ("3.7X · referencial") and a small calendar icon emphasizing the date. Then a big navy "=" sign leading to a result card in soles with a mono "S/ 3,7XX.00" and a green check. Under the formula, a strong emphasis callout: a warm-amber note with a warning-triangle icon reading "El error más común: usar la fecha equivocada. Usa el valor del día que manda la norma, no el del registro."

Below, a compact 3-step mini-strip: "1. Monto en USD · 2. Tipo de cambio de la fecha correcta · 3. Resultado en S/". Faint Peru map watermark with the orange Lima dot in a corner. Palette navy + orange + white; green only in the result check, amber only in the caution note. Titles bold Sora, labels Inter, all amounts and the rate in IBM Plex Mono with a "referencial" disclaimer. Soft uniform shadows, one pale-blue blob behind the formula. Flat editorial vector — no photoreal, no real live figures, believable fictional amounts, no lorem ipsum. Include a "[REF: TC-fecha]" mono tag at low opacity. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must grasp: monto USD × tipo de cambio de la fecha correcta = monto en soles, y que la fecha es lo crítico.
```
**ALT:** `Infografía que muestra la fórmula para convertir una factura en dólares a soles: monto en dólares por el tipo de cambio de la fecha correcta igual al monto en soles, con una alerta sobre usar la fecha adecuada.`

## 🖼️ TC-4 — Diferencia de cambio: ganancia y pérdida
**16:9 · archivo:** `tc-04-diferencia-cambio.webp`
**Concepto creativo:** una línea de tiempo entre el momento de originar una cuenta en dólares y el de cobrarla/pagarla, mostrando cómo la variación del tipo de cambio genera ganancia (dólar sube) o pérdida (dólar baja).

```
IMAGE PROMPT: Create an explanatory infographic titled "Diferencia de cambio: ganancia o pérdida" (bold Sora navy, top-left, thin orange underline). Muted slate Inter subtitle: "Cuando el dólar se mueve entre que registras y cobras".

Draw a horizontal TIMELINE with two points: "Origen" (left) — a cuenta por cobrar in USD registered at a rate — and "Cobro/Pago" (right) — the same amount converted at a later rate. Between them, show a small line chart of the exchange rate wiggling. Split the outcome into TWO branches with clear color coding:
- UP branch (green): "El dólar sube → tu cuenta por cobrar vale más soles → ganancia por diferencia de cambio." with a small upward arrow and a green "+".
- DOWN branch (red): "El dólar baja → vale menos soles → pérdida por diferencia de cambio." with a downward arrow and a red "−".

Use two neat cards, one green (ganancia) and one red (pérdida), fed by the timeline, so the cause→effect is instant. Add a takeaway strip: "Por eso conviene registrar cada operación con el tipo de cambio correcto desde el inicio." Faint Peru map watermark with the orange Lima dot in a lower corner. Palette navy + orange + white as the frame; green (ganancia) and red (pérdida) carry the meaning. Titles bold Sora, labels Inter, any amounts/rates IBM Plex Mono with a "referencial" note. Soft uniform shadows, one pale-blue blob for depth. Flat editorial vector — no photoreal, no real live figures, no lorem ipsum. Include a "[REF: TC-…]" mono tag at low opacity. Bottom-right: mandatory "consultaruc-pe.com" wordmark with the tiny Peru flag chip. A viewer must grasp how a rate movement turns into a foreign-exchange gain or loss.
```
**ALT:** `Infografía que explica la diferencia de cambio: una línea de tiempo entre registrar y cobrar una cuenta en dólares, con una rama verde de ganancia cuando el dólar sube y una roja de pérdida cuando baja.`

---

## ✅ Resumen — 20 imágenes (4 por página)

| Página | Imágenes | Archivos |
| ------ | -------- | -------- |
| **Ficha RUC** | Anatomía · Descargar PDF · Trámites · Natural vs jurídica | `ficha-ruc-01…04` |
| **Razón social** | Del nombre al RUC · vs marca · Homónimos · Tipos de sociedad | `razon-social-01…04` |
| **Verificación masiva** | Dashboard · Subir lista · Semáforo · Monitoreo | `masiva-01…04` |
| **Calculadora de régimen** | Escalera · Árbol de decisión · Comparativa · Crecimiento | `regimen-01…04` |
| **Tipo de cambio** | SUNAT vs banco vs paralelo · Compra/venta · Factura en dólares · Diferencia de cambio | `tc-01…04` |

**Flujo:** por cada imagen → MASTER DESIGN PROMPT + IMAGE PROMPT → generar en 16:9 en Nano Banana Pro → exportar a WebP (~1200px) con el nombre sugerido. Cuando las tengas, las coloco dentro de cada artículo, distribuidas entre sus secciones, igual que en la home.
