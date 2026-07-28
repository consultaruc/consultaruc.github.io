/**
 * PM2 — gestor de proceso en producción (cPanel).
 *
 * Este hosting NO tiene CloudLinux Node Selector ni Passenger disponibles para
 * la cuenta, así que la app corre bajo PM2 y LiteSpeed le pasa el tráfico por
 * proxy desde public_html/.htaccess (proxy genérico a 127.0.0.1:PORT - no
 * necesitó cambios al migrar de Express a Astro, ver deploy/public_html.htaccess).
 *
 * Node se instaló a mano en ~/opt/node (symlink a la versión real): la del
 * sistema es la 16 y este proyecto necesita >=22.5 por `node:sqlite`.
 * Además, sólo Node 24+ trae SQLite compilado CON FTS5, que es lo que usa la
 * búsqueda por razón social (ver astro/src/lib/db.js).
 *
 * La app en sí vive en astro/ (Astro SSR, adapter @astrojs/node en modo
 * standalone) - cwd se queda en la raíz del repo a propósito, no en astro/,
 * para que astro/src/lib/db.js (ancla sus rutas en process.cwd()) siga
 * encontrando el data/ ya existente en la raíz sin tocarlo ni perder el
 * SQLite de 18M+ registros ni las credenciales de admin.
 */
module.exports = {
  apps: [
    {
      name: 'consultaruc',
      script: 'astro/dist/server/entry.mjs',
      cwd: '/home/consultarucpe/consultaruc',

      // Una sola instancia a propósito. El estado vive en memoria del proceso
      // (el Map de sesiones y el limitador de tasa en astro/src/server/,
      // la cuota del scraper en liveScraper.js, el contador cacheado en
      // db.js) y SQLite en modo WAL admite un solo escritor. Con cluster
      // mode cada worker tendría su propia cuota y el límite auto-impuesto
      // frente a SUNAT dejaría de valer.
      instances: 1,
      exec_mode: 'fork',

      env: {
        NODE_ENV: 'production',
        PORT: 31500,
        // OBLIGATORIO. Sin HOST, el adapter standalone de @astrojs/node
        // escucha en "localhost", que en este servidor resuelve a ::1 (IPv6)
        // y deja el puerto SIN nadie escuchando en IPv4. LiteSpeed hace proxy
        // a 127.0.0.1:31500 (ver deploy/public_html.htaccess), así que el
        // sitio devolvía 503 con el proceso "online" y sin un solo error en
        // los logs. El Express de antes no lo necesitaba porque
        // `app.listen(PORT)` escucha en 0.0.0.0 por defecto.
        HOST: '127.0.0.1',
        SITE_URL: 'https://consultaruc-pe.com',
        // astro/src/pages/admin/{login,dashboard}.ts leen estos HTML desde
        // disco en cada request (no son módulos ES que Vite empaquete) -
        // viven fuera de astro/public/ a propósito, para que no puedan
        // servirse sin autenticación.
        ADMIN_ASSETS_DIR: '/home/consultarucpe/consultaruc/astro/src/adminAssets'
      },

      // Reinicio automático si el proceso muere.
      autorestart: true,
      // Si se cae en bucle, esperar en vez de reintentar sin pausa.
      exp_backoff_restart_delay: 200,
      max_restarts: 10,
      // Corta un proceso que se coma la RAM (el ingestor del padrón es pesado).
      max_memory_restart: '900M',

      // No vigilar archivos: el despliegue reinicia explícitamente, y un
      // watcher sobre data/ se dispararía con cada escritura del worker de
      // enriquecimiento.
      watch: false,

      error_file: '/home/consultarucpe/logs/consultaruc-error.log',
      out_file: '/home/consultarucpe/logs/consultaruc-out.log',
      merge_logs: true,
      time: true,

      // Da margen al arranque: el primer boot abre la base SQLite y, si está
      // vacía, la siembra antes de escuchar.
      kill_timeout: 10000,
      listen_timeout: 30000
    }
  ]
};
