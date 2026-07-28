/**
 * PM2 — gestor de proceso en producción (cPanel).
 *
 * Este hosting NO tiene CloudLinux Node Selector ni Passenger disponibles para
 * la cuenta, así que la app corre bajo PM2 y LiteSpeed le pasa el tráfico por
 * proxy desde public_html/.htaccess.
 *
 * Node se instaló a mano en ~/opt/node (symlink a la versión real): la del
 * sistema es la 16 y este proyecto necesita >=22.5 por `node:sqlite`.
 * Además, sólo Node 24+ trae SQLite compilado CON FTS5, que es lo que usa la
 * búsqueda por razón social (ver src/db.js).
 */
module.exports = {
  apps: [
    {
      name: 'consultaruc',
      script: 'src/server.js',
      cwd: '/home/consultarucpe/consultaruc',

      // Una sola instancia a propósito. El estado vive en memoria del proceso
      // (el ring buffer de consultas recientes en server.js, la cuota del
      // scraper en liveScraper.js, el contador cacheado en db.js) y SQLite en
      // modo WAL admite un solo escritor. Con cluster mode cada worker tendría
      // su propia cuota y el límite auto-impuesto frente a SUNAT dejaría de
      // valer.
      instances: 1,
      exec_mode: 'fork',

      env: {
        NODE_ENV: 'production',
        PORT: 31500,
        SITE_URL: 'https://consultaruc-pe.com'
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
