# Contributing

Repositorio privado de ConsultaRUC.pe. Notas para trabajar en el código.

## Requisitos

- **Node.js ≥ 22.5** (la app usa `node:sqlite`, experimental antes de esa versión).
- `npm install` instala también `sharp` (imágenes) y `playwright` (scraper en vivo).

## Flujo de desarrollo

```bash
npm start          # http://localhost:3000
```

- **Front estático:** `src/public/` (HTML por página + `style.css` + `app.js`/`site.js`/`components.js`). Se sirve tal cual; no hay build.
- **SSR:** solo `/ruc/:ruc` (ficha) y `/badge/:ruc` se renderizan en `src/server.js`.
- Tras editar `src/server.js` u otro módulo del back, **reinicia el servidor**. Los cambios en `src/public/**` (CSS/JS/HTML) se sirven en caliente (basta refrescar).

## Convenciones

- **Nombre de marca** en textos = `Consulta RUC Perú`. **Dominio/URL** = `consultaruc-pe.com`. No mezclar (un nombre no es una URL).
- Componentes de front compartidos viven en `src/public/components.js` (UMD) — cambiarlos afecta al buscador de todas las páginas y, si se usan en SSR, requiere reiniciar.
- SEO por página: el bloque `<!--SEO-->` (canonical + OG + JSON-LD) se genera con el script de inyección; edita `<title>`/`<meta description>` en la página y regénéralo.
- No comitear binarios pesados: las imágenes optimizadas (`src/public/img/*.webp`) sí; las fuentes raw (`assets/source-images/**/*.jpeg`) están gitignoradas.

## Antes de subir cambios

- Verifica que el servidor arranca sin errores (`node --check src/server.js`).
- Revisa que no haya errores de consola en las páginas afectadas.
- No expongas credenciales, secretos ni la base SQLite.
