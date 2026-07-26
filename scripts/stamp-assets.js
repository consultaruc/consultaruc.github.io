#!/usr/bin/env node
/**
 * Stamps every CSS/JS reference with a hash of that file's contents
 * (`/style.css?v=79df9545`).
 *
 * Why: style.css and app.js keep their filenames across deploys, so the moment
 * they are served with a long Cache-Control the edge and the browser keep
 * handing out the old copy - a CSS fix took 24h to reach anyone. A URL that
 * changes with the content sidesteps that entirely: the cache stays long AND
 * a deploy invalidates instantly.
 *
 * Runs in CI before rsync (see .github/workflows/deploy.yml) and is
 * idempotent, so running it locally is harmless.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PUBLIC_DIR = path.join(__dirname, '..', 'src', 'public');
const SERVER_JS = path.join(__dirname, '..', 'src', 'server.js');

const ASSETS = [
  'style.css', 'site.js', 'app.js', 'components.js',
  'directorio.js', 'bulk.js', 'sello.js', 'calculadora.js', 'tipo-cambio.js'
];

function hashOf(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
}

function htmlFiles() {
  const out = [path.join(PUBLIC_DIR, 'index.html')];
  for (const entry of fs.readdirSync(PUBLIC_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const p = path.join(PUBLIC_DIR, entry.name, 'index.html');
    if (fs.existsSync(p)) out.push(p);
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

  for (const file of htmlFiles()) {
    const before = fs.readFileSync(file, 'utf8');
    const after = stamp(before);
    if (after !== before) {
      fs.writeFileSync(file, after);
      changed++;
    }
  }

  // server.js renders the <head> for /ruc/:ruc itself.
  const before = fs.readFileSync(SERVER_JS, 'utf8');
  const after = stamp(before);
  if (after !== before) {
    fs.writeFileSync(SERVER_JS, after);
    changed++;
  }

  console.log(`[stamp-assets] ${changed} file(s) updated`);
  for (const [name, v] of Object.entries(versions)) console.log(`  ${name} -> ?v=${v}`);
}

main();
