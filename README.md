# Consulta RUC Perú

> Portal gratuito para consultar el **RUC** de cualquier empresa o persona en el Perú, con datos del padrón oficial de la **SUNAT**: estado, condición de domicilio, razón social, actividad económica y comprobantes autorizados.

**Producción:** https://consultaruc-pe.com · **Stack:** Node.js + Express + `node:sqlite` (FTS5) · **Idioma:** español (es-PE)

---

## ✨ Características

- **Consulta por RUC** (11 dígitos), **por razón social / nombre** (búsqueda FTS) y **verificación masiva** (lista o CSV, hasta 200 RUC).
- **18.3M+ registros** indexados desde el padrón reducido de la SUNAT (`node:sqlite` + FTS5).
- **Verificación en tiempo real** (opt-in): scraper headless con Playwright y límite de cuota auto-impuesto para no abusar de la fuente.
- **Ficha RUC** completa server-side en `/ruc/:ruc` (SEO-indexable) con impresión limpia (solo los datos + la URL del sitio).
- **Herramientas:** calculadora de régimen tributario, tipo de cambio SUNAT (compra/venta + historial), sello de verificación embebible (`<iframe>`), directorio de empresas con **consultas recientes** en vivo.
- **Guías/artículos** SEO largos (Clave SOL, Recibo por Honorarios, SAT vs SUNAT, Comercio Exterior, EsSalud, RNP, etc.) con plantilla de 3 columnas (TOC + contenido + sidebar), barra de progreso de lectura y lightbox de imágenes.
- **SEO técnico completo:** canonical, Open Graph + Twitter Cards, JSON-LD (Article / WebApplication / FAQPage / BreadcrumbList / Organization), sitemap con extensión de imágenes, `robots.txt`, `llms.txt` y `ai.txt` dinámicos.
- **Diseño responsive**, favicon/logo de marca (sello institucional), tema claro/oscuro-aware.
- **Seguridad:** helmet (CSP), rate-limiting, y un *anti-reuse gate* (Origin/Referer + token de sesión) para que terceros no incrusten ni raspen la API interna.

---

## 🚀 Puesta en marcha

Requisitos: **Node.js ≥ 22.5** (por `node:sqlite`).

```bash
npm install                 # instala dependencias (express, sharp, playwright, …)
cp .env.example .env        # ajusta variables si hace falta (todas opcionales)
npm start                   # arranca en http://localhost:3000
```

La base de datos SQLite vive en `data/consulta_ruc.sqlite`. Si está vacía, la app
siembra unas empresas de ejemplo (`src/seedData.js`) para funcionar de inmediato.

### Cargar el padrón completo de la SUNAT

```bash
npm run download-bulk       # descarga y procesa el padrón reducido de RUC
npm run sync-tipo-cambio    # sincroniza el tipo de cambio oficial
```

Los enlaces de descarga verificados están documentados en la memoria del proyecto.

---

## 🔧 Variables de entorno (todas opcionales)

| Variable            | Default                        | Descripción                                              |
|---------------------|--------------------------------|----------------------------------------------------------|
| `PORT`              | `3000`                         | Puerto del servidor.                                     |
| `NODE_ENV`          | —                              | `production` activa cookies seguras (HTTPS).             |
| `SITE_URL`          | `https://consultaruc-pe.com`   | Origen canónico para URLs, sitemap, OG y print.          |
| `SITEMAP_MAX_RUCS`  | `1000`                         | Cuántas fichas RUC enriquecidas entran al sitemap.       |

Ver `.env.example`.

---

## 📁 Estructura del proyecto

```
consulta RUC/
├── src/
│   ├── server.js            # Express app: rutas, SSR de /ruc/:ruc, sitemap, robots, llms/ai.txt, API
│   ├── db.js                # node:sqlite + FTS5 (búsqueda, count cacheado, upsert, enriquecimiento)
│   ├── liveScraper.js       # verificación en vivo (Playwright) + cuota
│   ├── enrichmentWorker.js  # completa fichas "delgadas" en segundo plano
│   ├── bulkDownloader.js    # descarga/procesa el padrón de la SUNAT
│   ├── tipoCambioSync.js    # sincroniza el tipo de cambio oficial
│   ├── adminAuth.js         # auth del panel admin (bcrypt, credenciales por entorno)
│   ├── geo.js               # departamento/ubigeo + coordenadas para el mapa
│   ├── nav.js               # navegación server-side
│   ├── seedData.js          # empresas de ejemplo (arranque sin dump)
│   ├── adminPublic/         # UI del panel admin (login, dashboard)
│   └── public/              # sitio estático servido (HTML + CSS + JS de front)
│       ├── index.html, ficha-ruc/, razon-social/, … (páginas)
│       ├── components.js    # componente UMD compartido (searchBar, resultPanel)
│       ├── site.js          # icons, tema, TOC scroll-spy, lightbox, drawer móvil, print
│       ├── app.js           # lógica de búsqueda (páginas con buscador)
│       ├── style.css        # sistema de diseño completo
│       └── img/             # imágenes OPTIMIZADAS (webp) + favicons + logo
├── assets/source-images/    # imágenes FUENTE (raw) — las optimizadas viven en src/public/img
├── data/                    # SQLite + credenciales admin (gitignored)
├── docs/                    # documentación y prompts de imágenes/logo (docs/prompts/)
├── .env.example
├── package.json
└── README.md
```

Detalle técnico completo en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 🔐 Seguridad y datos

- Los datos provienen de **fuentes públicas de la SUNAT**. Este es un portal
  **informativo independiente**, no afiliado a la SUNAT.
- La API interna (`/api/*`) está protegida con rate-limit + Origin/Referer
  allowlist + token de sesión (evita incrustación/scraping por terceros).
- Nunca se comitea: `node_modules/`, la base SQLite, credenciales admin ni `.env`.

---

## 📄 Licencia

Ver [`LICENSE`](LICENSE) — © 2026 Consulta RUC Perú (consultaruc-pe.com), todos los derechos reservados.
