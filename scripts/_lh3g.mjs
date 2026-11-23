import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
const T = {
  rttMs: 400,
  throughputKbps: 400,
  cpuSlowdownMultiplier: 6,
  requestLatencyMs: 1500,
  downloadThroughputKbps: 360,
  uploadThroughputKbps: 360,
};
const ch = await chromeLauncher.launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox'],
});
const r = await lighthouse(
  'http://localhost:4330/',
  { port: ch.port, output: 'json', logLevel: 'error', onlyCategories: ['performance'] },
  { extends: 'lighthouse:default', settings: { throttling: T, throttlingMethod: 'simulate' } },
);
const a = r.lhr.audits;
console.log(
  process.argv[2],
  'perf',
  Math.round(r.lhr.categories.performance.score * 100),
  'FCP',
  a['first-contentful-paint'].displayValue,
  'LCP',
  a['largest-contentful-paint'].displayValue,
  'CLS',
  a['cumulative-layout-shift'].displayValue,
  'bytes',
  Math.round(a['total-byte-weight'].numericValue / 1024) + 'KB',
);
await ch.kill();
