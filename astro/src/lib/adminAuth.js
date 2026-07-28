import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

// Anchored on process.cwd(), not the module's own location - see db.js for
// why (Vite bundling moves this file, but PM2's cwd stays the repo root).
const CREDENTIALS_PATH = process.env.ADMIN_CREDENTIALS_PATH
  || path.join(process.env.DATA_DIR || path.join(process.cwd(), 'data'), 'admin_credentials.json');

/**
 * On first run, generates a random admin username/password, hashes the
 * password, and stores it locally (never printed again after first run -
 * note it down when you see it in the console). On later runs, loads the
 * existing hash. Never store the plaintext password anywhere.
 */
function loadOrCreateCredentials() {
  if (fs.existsSync(CREDENTIALS_PATH)) {
    return JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  }

  const username = 'admin';
  const password = crypto.randomBytes(9).toString('base64url'); // 12-char random password
  const passwordHash = bcrypt.hashSync(password, 10);
  const sessionSecret = crypto.randomBytes(32).toString('hex');

  const creds = { username, passwordHash, sessionSecret };
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(creds, null, 2), 'utf8');

  console.log('====================================================');
  console.log('ADMIN DASHBOARD - primer inicio, credenciales generadas:');
  console.log(`  Usuario:    ${username}`);
  console.log(`  Contraseña: ${password}`);
  console.log('  (guárdala ahora - no se volverá a mostrar; está en');
  console.log('   data/admin_credentials.json como hash si la pierdes)');
  console.log('====================================================');

  return creds;
}

export const credentials = loadOrCreateCredentials();

export function verifyLogin(username, password) {
  if (username !== credentials.username) return false;
  return bcrypt.compareSync(password || '', credentials.passwordHash);
}

// NOTE: the Express-style requireAuth(req,res,next) middleware from the
// original src/adminAuth.js is NOT ported here - it's Express-specific
// (req.session/req.path/res.redirect). Its Astro-native equivalent is built
// in Phase 5 against context.cookies/the new session store.
