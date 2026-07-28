#!/usr/bin/env node
/**
 * Minifica los CSS/JS de astro/public/ EN SITIO.
 *
 * Por qué hace falta un paso propio: Astro no procesa nada de public/, lo
 * copia tal cual a dist/client/. Así que style.css (133 KB) y los scripts
 * llegaban al navegador con todos sus comentarios y sangrado. Brotli ya se
 * come buena parte, pero no todo: minificar antes reduce además el trabajo de
 * parseo del navegador, que Brotli no toca.
 *
 * ORDEN EN EL PIPELINE (importa):
 *   1. este script          -> minifica astro/public/*.{css,js}
 *   2. stamp-assets-astro.js -> hashea ESOS bytes ya minificados y estampa ?v=
 *   3. astro build
 * Al revés, el ?v=<hash> no correspondería a lo que se sirve y la caché
 * quedaría envenenada tras cada despliegue.
 *
 * Trabaja en sitio sobre el checkout de CI (que es limpio y desechable); no
 * commitea nada. En local es igual de seguro, pero deja los ficheros
 * minificados: es un `git checkout -- astro/public` para revertir.
 *
 * NO toca astro/src/lib/components.js (la copia que usa el SSR). Sólo se
 * minifica la copia de public/, que es la que descarga el navegador.
 */
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const ASTRO_ROOT = path.join(__dirname, '..', 'astro');
const PUBLIC_DIR = path.join(ASTRO_ROOT, 'public');

// esbuild vive en astro/node_modules (viene con Astro/Vite). Se resuelve desde
// allí y no desde la raíz, que tiene su propio node_modules del Express viejo.
const astroRequire = createRequire(path.join(ASTRO_ROOT, 'package.json'));
const esbuild = astroRequire('esbuild');

function human(n) {
  return `${(n / 1024).toFixed(1)} KB`;
}

async function minifyFile(file) {
  const ext = path.extname(file).slice(1); // 'css' | 'js'
  const before = fs.readFileSync(file, 'utf8');

  const result = await esbuild.transform(before, {
    loader: ext,
    minify: true,
    // Los scripts se cargan con <script is:inline src> clásico (no módulos) y
    // tocan globals compartidos (window.CRP). 'iife' envolvería el código en
    // una función y rompería justo eso, así que no se cambia el formato: sólo
    // se minifica.
    legalComments: 'none',
    // Safari 12+/Chrome 60+ cubre de sobra el tráfico real y evita que
    // esbuild transpile a algo más verboso de lo necesario.
    target: ext === 'js' ? ['es2018'] : undefined
  });

  fs.writeFileSync(file, result.code);
  return { before: Buffer.byteLength(before), after: Buffer.byteLength(result.code) };
}

async function main() {
  const targets = fs
    .readdirSync(PUBLIC_DIR)
    .filter((n) => n.endsWith('.css') || n.endsWith('.js'))
    .map((n) => path.join(PUBLIC_DIR, n));

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of targets) {
    const { before, after } = await minifyFile(file);
    totalBefore += before;
    totalAfter += after;
    const saved = before - after;
    console.log(
      `  ${path.basename(file).padEnd(20)} ${human(before).padStart(9)} -> ${human(after).padStart(9)}` +
        `  (-${((saved / before) * 100).toFixed(0)}%)`
    );
  }

  console.log(
    `[minify-public-assets] ${targets.length} ficheros: ` +
      `${human(totalBefore)} -> ${human(totalAfter)} (-${human(totalBefore - totalAfter)})`
  );
}

main().catch((err) => {
  console.error('[minify-public-assets] falló:', err.message);
  process.exit(1);
});
