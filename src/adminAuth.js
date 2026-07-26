const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const CREDENTIALS_PATH = path.join(__dirname, '../data/admin_credentials.json');

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

const credentials = loadOrCreateCredentials();

function verifyLogin(username, password) {
  if (username !== credentials.username) return false;
  return bcrypt.compareSync(password || '', credentials.passwordHash);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ success: false, error: 'No autorizado.' });
  }
  return res.redirect('/admin/login');
}

module.exports = { credentials, verifyLogin, requireAuth };
