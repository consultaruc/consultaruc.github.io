# Arquitectura — Consulta RUC Perú (consultaruc-pe.com)

Documento técnico del funcionamiento interno del portal.

## Visión general

Node.js + Express monolítico. Sirve un **sitio estático** (`src/public/`) para
las páginas de marketing/guías y hace **SSR puntual** solo para la ficha
(`/ruc/:ruc`) y el badge embebible (`/badge/:ruc`). Los datos viven en un
**SQLite local** (`node:sqlite`, sin dependencias nativas) con **FTS5** para la
búsqueda por nombre.

```
Navegador ──▶ Express (src/server.js)
                 ├── estático  ──▶ src/public/**            (páginas, css, js, img)
                 ├── SSR       ──▶ /ruc/:ruc, /badge/:ruc   (ficha + badge)
                 ├── API       ──▶ /api/ruc, /api/recent, /api/tipo-cambio, …
                 └── SEO        ──▶ /sitemap.xml, /robots.txt, /llms.txt, /ai.txt
                       │
                       ▼
                 db.js (node:sqlite + FTS5)  ◀── bulkDownloader.js (padrón SUNAT)
                       ▲                       ◀── enrichmentWorker.js (fichas thin)
                       └── liveScraper.js (Playwright, opt-in + cuota)
```

## Módulos del back (`src/`)

| Módulo | Responsabilidad |
|---|---|
| `server.js` | App Express: middleware (helmet/CSP, rate-limit, sesión, **anti-reuse gate**, token de página), rutas estáticas, SSR de la ficha, API, sitemap/robots/llms/ai, footer/nav server-side. |
| `db.js` | Acceso a `node:sqlite`. `searchByRuc`, `searchByName` (FTS5), `countRecords()` **cacheado** (COUNT(*) sobre 18M filas bloquea el event loop → se cachea), `upsertRucRecord`, cola de enriquecimiento, `getSitemapRucs`. |
| `liveScraper.js` | Verificación en vivo con Playwright headless. Cuota auto-impuesta (pocas consultas por ventana) para no gatillar el rate-limit de la fuente. |
| `enrichmentWorker.js` | Worker en segundo plano que completa fichas "delgadas" (sin todos los campos) de a poco; el tráfico orgánico actúa como señal de qué enriquecer. |
| `bulkDownloader.js` | Descarga y procesa el padrón reducido de RUC (ZIP → SQLite). |
| `tipoCambioSync.js` | Sincroniza el tipo de cambio oficial (compra/venta + historial). |
| `adminAuth.js` | Login del panel admin (bcrypt; credenciales generadas por entorno en `data/admin_credentials.json`). |
| `geo.js` | Deriva departamento/ubigeo del domicilio y da coordenadas para el mapa del Perú. |
| `nav.js` | Render de la navegación superior (server-side, reutilizada en SSR). |
| `seedData.js` | Empresas de ejemplo para arrancar sin el dump completo. |

## Front (`src/public/`)

- **`components.js`** — componente UMD compartido. `searchBar(opts)` (tabs
  Por RUC / Razón Social / Masiva; `opts.tabs=false` bloquea a un solo modo) y
  `resultPanel(record)` ("Perfil de Empresa" con hero + tabs Resumen/Ubicación/
  Actividad/Comprobantes). Se usa tanto client-side (`app.js`) como en SSR
  (`require('./public/components.js')`) → **cambiarlo requiere reiniciar el SSR**.
- **`site.js`** — carga en TODAS las páginas: iconos (Lucide inline), tema,
  TOC scroll-spy + barra de progreso de lectura, **lightbox** de imágenes,
  **drawer** de menú móvil (hamburguesa), fetch-wrapper que añade el token
  `x-api-token`, byline (reading-time + copiar enlace), routing de impresión.
- **`app.js`** — solo en páginas con buscador (home, ficha-ruc, razon-social):
  ejecuta la búsqueda, historial local, verificación en vivo.
- **`directorio.js`**, **`bulk.js`**, **`sello.js`**, **`calculadora.js`**,
  **`tipo-cambio.js`** — lógica de páginas concretas.
- **`style.css`** — sistema de diseño completo (navy #16233F + naranja #F97316,
  Sora/Inter/IBM Plex Mono, tarjetas catastrales, semáforo de estados,
  responsive edge-to-edge en móvil, print CSS).

## Rutas clave

- `GET /ruc/:ruc` — **SSR** de la ficha (indexable). Cabecera/pie de impresión
  y CSS de print → al imprimir sale **solo** la data + `consultaruc-pe.com`.
  Con `?print=1` auto-abre el diálogo de impresión.
- `GET /api/ruc/:query` — búsqueda por RUC o nombre (JSON). Protegida por el
  *anti-reuse gate*. `?live=true` intenta verificación en vivo.
- `POST /api/ruc/bulk` — verificación masiva (solo DB local, tope 200).
- `GET /api/recent` — últimas fichas consultadas (ring buffer en memoria).
- `GET /api/tipo-cambio` — tipo de cambio + historial.
- `GET /badge/:ruc` — badge "Verificado" embebible (única ruta con `frame-ancestors *`).
- `GET /sitemap.xml` — páginas (prioridad por rol) + fichas enriquecidas +
  extensión `image:image`. `robots.txt`, `llms.txt`, `ai.txt` **dinámicos**.

## Seguridad

- **Anti-reuse gate** (`apiGuard`): un `/api/*` de datos solo pasa si Origin o
  Referer es el propio host, **o** trae el token de sesión (`x-api-token` ==
  `req.session.apiToken`, espejado en cookie legible `ctok`). Bloquea la
  incrustación cross-origin y sube el listón al scraping de terceros. No se
  toca `/badge` (debe ser embebible) ni el SSR `/ruc/:ruc` (debe ser rastreable).
- **helmet** con CSP (bloquea scripts foráneos), `x-powered-by` off,
  `frame-ancestors 'none'` (salvo `/badge`).
- **Rate-limit** 60/min por IP en la API; 5/15min en el login admin.

## SEO

- Por página: bloque `<!--SEO-->` con canonical, Open Graph (+ `og:image`
  dedicada en la home: `/img/og-home.png` 1200×630) y **JSON-LD** por tipo
  (Article / WebApplication / CollectionPage / FAQPage + BreadcrumbList +
  Organization). La ficha SSR añade FAQPage con Q&A derivadas del propio RUC.
- Nombre de marca = "Consulta RUC Perú"; dominio/URL = consultaruc-pe.com.
