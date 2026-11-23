// Home medida com throttling REAL do Chromium (não simulado), para o caminho adaptativo
// (navigator.connection lento → fonte do sistema) aparecer nos números. Mediana de 3.
// Uso: node scripts/medir-rede.mjs antes=http://localhost:4331 depois=http://localhost:4330
import { chromium } from 'playwright';
const perfis = {
  '3G lento': {
    latency: 400,
    downloadThroughput: (400 * 1024) / 8,
    uploadThroughput: (400 * 1024) / 8,
    connectionType: 'cellular3g',
    cpu: 4,
  },
  '4G': {
    latency: 60,
    downloadThroughput: (9000 * 1024) / 8,
    uploadThroughput: (1500 * 1024) / 8,
    connectionType: 'cellular4g',
    cpu: 4,
  },
};
const b = await chromium.launch();
// Pares rótulo=URL na linha de comando (padrão: o servidor local de pnpm servir).
const alvos = process.argv.slice(2).map((a) => a.split('='));
if (!alvos.length) alvos.push(['atual', 'http://localhost:4330']);
for (const [rotulo, base] of alvos) {
  for (const [nome, pf] of Object.entries(perfis)) {
    const res = [];
    for (let i = 0; i < 3; i++) {
      const c = await b.newContext({
        viewport: { width: 412, height: 823 },
        deviceScaleFactor: 2.6,
        isMobile: true,
        hasTouch: true,
      });
      const p = await c.newPage();
      const cdp = await c.newCDPSession(p);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', { offline: false, ...pf });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: pf.cpu });
      let bytes = 0;
      cdp.on('Network.loadingFinished', (e) => (bytes += e.encodedDataLength));
      await p.addInitScript(() => {
        window.__m = { lcp: 0, cls: 0 };
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) window.__m.lcp = e.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await p.goto(base + '/', { waitUntil: 'load', timeout: 180000 });
      await p.waitForTimeout(2500);
      const m = await p.evaluate(() => ({
        ...window.__m,
        fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0,
        load: performance.getEntriesByType('navigation')[0].loadEventEnd,
      }));
      res.push({ ...m, bytes });
      await c.close();
    }
    const med = (k) => res.map((r) => r[k]).sort((a, b) => a - b)[1];
    console.log(
      `${rotulo.padEnd(7)} ${nome.padEnd(9)} FCP ${(med('fcp') / 1000).toFixed(2)} s · LCP ${(med('lcp') / 1000).toFixed(2)} s · load ${(med('load') / 1000).toFixed(2)} s · CLS ${med('cls').toFixed(3)} · ${Math.round(med('bytes') / 1024)} KB`,
    );
  }
}
await b.close();
