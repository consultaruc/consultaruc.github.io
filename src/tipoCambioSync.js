const { chromium } = require('playwright');
const { upsertTipoCambio } = require('./db');
const { blockHeavyResources } = require('./liveScraper');

const URL_TIPO_CAMBIO = 'https://e-consulta.sunat.gob.pe/cl-at-ittipcam/tcS01Alias';

/**
 * SUNAT's tipo-de-cambio page renders a month calendar widget where every
 * day already has its Compra/Venta values inline (verified 2026-07-23 via
 * Playwright - see .calendar-day / .event markup). This is fetched ONCE A
 * DAY by cron (never per-visitor, unlike the RUC live-scraper) because
 * exchange rate is a single shared daily value, not a per-query lookup -
 * there is no reason to pay SUNAT's WAF/rate-limit cost on every pageview.
 */
async function syncTipoCambio() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--lang=es-PE']
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1366, height: 900 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      locale: 'es-PE'
    });
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(45000);
    await blockHeavyResources(page);

    let lastErr;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await page.goto(URL_TIPO_CAMBIO, { waitUntil: 'domcontentloaded', timeout: 45000 });
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        await page.waitForTimeout(3000);
      }
    }
    if (lastErr) throw lastErr;
    await page.waitForTimeout(1500);

    const bodyText = (await page.textContent('body')) || '';
    if (/Request Rejected/i.test(bodyText)) {
      throw new Error('SUNAT bloqueó la consulta (firewall) al sincronizar tipo de cambio - intente más tarde.');
    }

    await page.waitForSelector('.calendar-day', { timeout: 15000 }).catch(() => {});

    const days = await page.$$eval('.calendar-day', (els) =>
      els
        .map((el) => {
          const m = el.className.match(/_(\d{4})_(\d{1,2})_(\d{1,2})\b/);
          if (!m) return null;
          const [, year, month, day] = m;
          const fecha = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          const events = [...el.querySelectorAll('.event')];
          if (events.length === 0) return null;
          const parseVal = (label) => {
            const ev = events.find((e) => e.textContent.includes(label));
            if (!ev) return null;
            const num = ev.textContent.replace(/[^\d.]/g, '');
            return num ? parseFloat(num) : null;
          };
          return { fecha, compra: parseVal('Compra'), venta: parseVal('Venta') };
        })
        .filter(Boolean)
    );

    if (days.length === 0) {
      console.error('[Tipo Cambio Sync Debug] bodyText snippet:', bodyText.slice(0, 500));
      const calCount = await page.$$eval('.calendar-day', (els) => els.length);
      console.error('[Tipo Cambio Sync Debug] .calendar-day count:', calCount);
      throw new Error('No se encontraron celdas de calendario con tipo de cambio - posible cambio de diseño en SUNAT.');
    }

    for (const d of days) {
      if (d.compra != null && d.venta != null) {
        upsertTipoCambio(d.fecha, d.compra, d.venta);
      }
    }

    console.log(`[Tipo Cambio Sync] ${days.length} días sincronizados. Último: ${days[days.length - 1].fecha}`);
    return { success: true, count: days.length };
  } finally {
    await browser.close().catch(() => {});
  }
}

if (require.main === module) {
  syncTipoCambio()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Tipo Cambio Sync Error]:', err);
      process.exit(1);
    });
}

module.exports = { syncTipoCambio };
