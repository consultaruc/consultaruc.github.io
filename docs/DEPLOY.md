# Despliegue — cPanel + GitHub Actions

CI/CD: cada push a `main` sincroniza el código al servidor por SSH, instala
dependencias allí y reinicia la app con PM2. Workflow:
[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

## Por qué NO es un despliegue estático

Subir sólo `src/public/` deja un folleto, no el producto. Se generan en el
servidor y no existen como archivos:

- `/ruc/:ruc` — la ficha de cada RUC (millones de URLs, SSR desde SQLite).
- `/api/*` — buscador, verificación masiva, tipo de cambio, contador del header.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/ai.txt` — dinámicos.
- `/badge/:ruc` — el sello embebible.
- El panel admin, el worker de enriquecimiento y el scraper en vivo.

## Cómo quedó montado el servidor

Lo que hay en producción **no** es lo que se planeó al principio: la cuenta no
tiene CloudLinux Node Selector ni Passenger, así que *Setup Node.js App* no era
una opción y hubo que montarlo a mano.

```
Navegador
  → LiteSpeed (:443, dominio)
    → public_html/.htaccess  ── proxy [P] ──▶ 127.0.0.1:31500
                                                └── PM2 → node src/server.js
                                                      └── ~/consultaruc/data/*.sqlite
```

| Pieza | Dónde | Nota |
|---|---|---|
| Código | `/home/consultarucpe/consultaruc` | **Fuera de `public_html`** a propósito: dentro, `data/admin_credentials.json` y `src/db.js` quedarían accesibles desde internet. |
| Node | `~/opt/node` → `node-v24.4.1-linux-x64` | El del sistema es la **16**, insuficiente. Ver aviso sobre FTS5 más abajo. |
| Proceso | PM2 (`ecosystem.config.js`) | Una sola instancia, `fork`. Reinicio automático. |
| Arranque | `crontab @reboot pm2 resurrect` | No hay systemd para la cuenta. |
| Proxy | `public_html/.htaccess` | Copia previa guardada en `.htaccess.bak`. |
| Base de datos | `~/consultaruc/data/` | Nunca se toca en el despliegue. |
| Logs | `~/logs/consultaruc-*.log` | También `pm2 logs consultaruc`. |

### Node 24, y por qué la versión importa más de lo normal

Dos requisitos distintos, y el segundo es fácil pasarlo por alto:

1. **≥ 22.5** — antes no existe `node:sqlite` y la app no arranca. Falla ruidoso.
2. **≥ 24** — los binarios oficiales de 22 y 23 traen SQLite **sin FTS5**
   (verificado en este servidor: 22.14 y 23.11 fallan, 24.4.1 funciona). FTS5
   es lo que usa la búsqueda por razón social ([db.js](../src/db.js)).

El segundo falla **en silencio**: `searchByName` captura el error y devuelve
`[]`, así que el buscador diría "sin resultados" en lugar de dar un error. Por
eso el workflow comprueba FTS5 explícitamente y aborta el despliegue si falta.

Para actualizar Node: descargar la versión nueva en `~/opt`, comprobar FTS5, y
repuntar el symlink `~/opt/node`.

### El proxy y la cabecera Host

LiteSpeed reescribe `Host` a `127.0.0.1:31500` al hacer proxy. `apiGuard`
([server.js](../src/server.js)) compara `Referer` contra el host de la petición
para bloquear el uso de la API desde otros sitios — con el `Host` reescrito la
comparación nunca cuadraba y **la API devolvía 403 al propio buscador**.

Solución en dos partes:

- `.htaccess` manda `X-Forwarded-Host: consultaruc-pe.com`.
- `requestHost()` en `server.js` prefiere esa cabecera, luego el host de
  `SITE_URL`, y sólo al final `Host`.

Sigue sin poder falsificarse desde un navegador: quien ponga esa cabecera a
mano tendría que falsificar también `Origin`/`Referer`, y el JS de una página
no puede. El workflow verifica **las dos** direcciones en cada despliegue: que
el sitio propio pase y que un origen ajeno siga siendo rechazado.

## Secrets del repositorio

*Settings → Secrets and variables → Actions*:

| Secret | Valor |
|---|---|
| `CPANEL_HOST` | `89.248.161.162` |
| `CPANEL_USER` | `consultarucpe` |
| `CPANEL_SSH_PORT` | `22` |
| `CPANEL_DEPLOY_PATH` | `/home/consultarucpe/consultaruc` |
| `CPANEL_SSH_KEY` | Contenido de `~/.ssh/consultaruc_deploy` (clave privada) |

La clave pública ya está autorizada en cPanel → *SSH Access*.

> `CPANEL_DEPLOY_PATH` **no** debe ser `public_html`. Ver la tabla de arriba.

## Datos: carga inicial y actualización

El pipeline **no** toca los datos: son varios GB y tardan. La primera carga se
hace una vez por SSH:

```bash
export PATH=$HOME/opt/node/bin:$PATH
cd ~/consultaruc
npm run download-bulk        # descarga e ingesta ~18M registros (~40 min)
npm run sync-tipo-cambio     # tipo de cambio oficial
```

Hasta entonces la app funciona con las empresas de ejemplo de
[seedData.js](../src/seedData.js).

### Mantenerse al día (ya automatizado)

El padrón **cambia**: SUNAT lo republica a diario (~07:39 UTC) y sin refrescarlo
la base envejece — estados que pasaron a BAJA, RUC nuevos que no aparecen,
domicilios viejos. Hay cron para las dos fuentes:

| Cron (UTC) | Qué hace | Log |
|---|---|---|
| `0 9 * * *` | `download-bulk` — refresca el padrón | `~/logs/bulk-sync.log` |
| `30 13 * * *` | `sync-tipo-cambio` | `~/logs/tipo-cambio.log` |
| `@reboot` | `pm2 resurrect` | `~/logs/pm2-boot.log` |

`download-bulk` es seguro de correr a diario:

- **Compara `Last-Modified`** con nuestra copia y sólo descarga si SUNAT
  publicó algo más nuevo. Si nada cambió, termina en segundos sin tocar la base.
  (Antes la regla era "salta si el archivo existe", que en un cron re-ingería
  el zip de ayer y reportaba `Success!` con datos igual de viejos.)
- **Conserva las fichas enriquecidas.** El reload hace `clearAll()`, que
  borraría los campos que sólo existen en la ficha en vivo (tipo de
  contribuyente, actividad económica, comprobantes…). Se guardan antes y se
  restauran después: el scraper está limitado a unas pocas consultas cada 10
  minutos a propósito, así que ese trabajo no se puede rehacer a voluntad.
- Descarga a `.part` y renombra al terminar, para que una descarga cortada no
  deje un zip truncado que la siguiente corrida ingiera como si estuviera bien.

Para forzar una recarga aunque SUNAT no haya republicado (por ejemplo tras
cambiar cómo se parsean las columnas):

```bash
npm run download-bulk -- --force
```

Mientras corre la recarga la búsqueda devuelve vacío (la tabla se vacía antes
de rellenarla), de ahí que el cron esté a las 4am hora de Perú.

## Qué NO se sincroniza

`rsync` corre con `--delete`, así que lo excluido sobrevive intacto:

| Excluido | Motivo |
|---|---|
| `data/` | **La base SQLite y las credenciales admin.** Copia única, pesa GB, y el worker de enriquecimiento la escribe en caliente. Un `--delete` que la incluyera la borraría. |
| `node_modules/` | Se instala en el servidor; `sharp` es binario nativo. |
| `.env` | El entorno se define en `ecosystem.config.js`. |
| `tmp/`, `assets/`, `docs/`, `.github/` | No hacen falta en producción. |

## Playwright y el scraper en vivo

El workflow exporta `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`: Chromium (~500 MB)
suele exceder la cuota de un shared host. La app arranca igual y el scraper
falla de forma controlada ([liveScraper.js](../src/liveScraper.js)); queda
inactiva la verificación en vivo y el worker de enriquecimiento.

Para habilitarlo, si el hosting lo permite:

```bash
cd ~/consultaruc && npx playwright install chromium
```

En muchos shared hosts Chromium headless no arranca por falta de librerías del
sistema. El resto del sitio funciona igual con los datos del padrón.

## Operación

```bash
export PATH=$HOME/opt/node/bin:$PATH

pm2 list                        # estado
pm2 logs consultaruc            # logs en vivo
pm2 logs consultaruc --err      # sólo errores
pm2 restart consultaruc         # reinicio manual
pm2 monit                       # CPU / memoria
```

### Si falla el despliegue

1. `pm2 logs consultaruc --err --lines 50` — el error real suele estar ahí.
2. `node --version` con el PATH de arriba: debe ser ≥ 24.
3. Que `CPANEL_DEPLOY_PATH` coincida con `cwd` en `ecosystem.config.js`.
4. `curl -I http://127.0.0.1:31500/` desde el servidor: si responde ahí pero no
   por el dominio, el problema está en `.htaccess`, no en la app.

Para volver atrás: `git revert <commit> && git push`. La base de datos no se
toca en ningún momento.

## Pendiente

- **Sesiones en memoria.** `express-session` usa MemoryStore, que avisa en
  producción. Con una sola instancia PM2 funciona, pero las sesiones (y los
  tokens de `apiGuard`) se pierden en cada reinicio y la memoria crece. Si
  llega a molestar, conviene un store persistente.
