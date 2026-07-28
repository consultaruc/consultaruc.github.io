#!/usr/bin/env node
/**
 * Astro-app equivalent of stamp-assets.js (which stamps the old Express
 * app's src/public/*.html + src/server.js - kept as-is for rollback).
 *
 * Same mechanism, same reasoning (see the original file's header comment):
 * stamps every CSS/JS reference with a hash of that file's contents so a
 * long Cache-Control doesn't leave visitors on stale assets after a deploy.
 * Runs in CI before `astro build` (the built output embeds whatever ?v=
 * is in the .astro/.js source at build time) - see .github/workflows/deploy.yml.
 * Idempotent, safe to run locally.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ASTRO_ROOT = path.join(__dirname, '..', 'astro');
const PUBLIC_DIR = path.join(ASTRO_ROOT, 'public');

const ASSETS = [
  'style.css', 'site.js', 'app.js', 'components.js',
  'directorio.js', 'bulk.js', 'sello.js', 'calculadora.js', 'tipo-cambio.js'
];

function hashOf(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
}

function findAstroFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findAstroFiles(p));
    else if (entry.name.endsWith('.astro')) out.push(p);
  }
  return out;
}

function main() {
  const versions = {};
  for (const name of ASSETS) {
    const p = path.join(PUBLIC_DIR, name);
    if (fs.existsSync(p)) versions[name] = hashOf(p);
  }

  let changed = 0;
  const stamp = (text) => {
    for (const [name, v] of Object.entries(versions)) {
      // Matches href="/style.css" and src="/app.js", with or without an
      // existing ?v=..., so re-running replaces rather than appends.
      const re = new RegExp(
        '((?:href|src)=")/' + name.replace(/[.]/g, '\\.') + '(?:\\?v=[0-9a-f]+)?(")',
        'g'
      );
      text = text.replace(re, `$1/${name}?v=${v}$2`);
    }
    return text;
  };

  const targets = [
    ...findAstroFiles(path.join(ASTRO_ROOT, 'src', 'pages')),
    path.join(ASTRO_ROOT, 'src', 'layouts', 'BaseLayout.astro'),
    // renderRucPage.js hardcodes the same ?v=... strings for the SSR
    // /ruc/:ruc and not-found pages, same as server.js did in the old app.
    path.join(ASTRO_ROOT, 'src', 'lib', 'renderRucPage.js')
  ];

  for (const file of targets) {
    if (!fs.existsSync(file)) continue;
    const before = fs.readFileSync(file, 'utf8');
    const after = stamp(before);
    if (after !== before) {
      fs.writeFileSync(file, after);
      changed++;
    }
  }

  console.log(`[stamp-assets-astro] ${changed} file(s) updated`);
  for (const [name, v] of Object.entries(versions)) console.log(`  ${name} -> ?v=${v}`);
}

main();
