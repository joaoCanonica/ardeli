// audit-lighthouse: Lighthouse mobile em todas as rotas indexáveis + pesos.
//   - perfil padrão do Lighthouse (Moto G Power, 4G lento simulado, CPU 4×);
//   - home COM abertura (sessão nova) e SEM abertura (--force-prefers-reduced-motion);
//   - "Android básico": home e /agendar em 3G lento (400 kbps, RTT 400 ms, CPU 6×).
// Uso: servidor rodando em BASE (pnpm servir, que imita a Vercel: compressão e cabeçalhos)
//   BASE=http://localhost:4330 pnpm audit-lighthouse [--saida docs/qa/lighthouse.json]
// Orçamento (CLAUDE.md §5): Perf/BP/SEO ≥ 95, A11y 100, LCP < 1,8 s, CLS ≈ 0, JS inicial ≤ 30 KB gzip.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4330';
const args = process.argv.slice(2);
const saida = args.includes('--saida') ? args[args.indexOf('--saida') + 1] : null;
const ROTAS = [
  '/',
  '/convenios/',
  '/atendimentos/',
  '/atendimentos/musculoesqueletica/',
  '/atendimentos/neurologia/',
  '/atendimentos/cardiorrespiratoria/',
  '/atendimentos/oncologia/',
  '/atendimentos/obstetrica/',
  '/atendimentos/queimados/',
  '/primeira-avaliacao/',
  '/quem-cuida/',
  '/a-clinica/',
  '/perguntas-frequentes/',
  '/como-chegar/',
  '/agendar/',
  '/privacidade/',
  '/avaliar/qr/',
];
// "4G" (DevTools Fast 4G): o perfil do CLAUDE.md §5. O padrão do Lighthouse é "4G lento"
// (1,6 Mbps, RTT 150 ms) e continua sendo o critério de reprovação: nada é afrouxado.
const QUATRO_G = {
  rttMs: 60,
  throughputKbps: 9000,
  cpuSlowdownMultiplier: 4,
  requestLatencyMs: 60 * 3.75,
  downloadThroughputKbps: 9000 * 0.9,
  uploadThroughputKbps: 1500 * 0.9,
};
const TRES_G_LENTO = {
  rttMs: 400,
  throughputKbps: 400,
  cpuSlowdownMultiplier: 6,
  requestLatencyMs: 400 * 3.75,
  downloadThroughputKbps: 400 * 0.9,
  uploadThroughputKbps: 400 * 0.9,
};

// O Lighthouse às vezes perde o trace (NO_NAVSTART): até 3 tentativas.
async function medir(rota, opcoes = {}) {
  for (let t = 1; ; t++) {
    try {
      return await medirUmaVez(rota, opcoes);
    } catch (e) {
      if (t >= 3) throw e;
      console.log(`  (nova tentativa em ${rota}: ${e.message.split('\n')[0].slice(0, 80)})`);
    }
  }
}

async function medirUmaVez(rota, { reduzido = false, throttling = null } = {}) {
  const chrome = await chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    chromeFlags: [
      '--headless=new',
      '--no-sandbox',
      ...(reduzido ? ['--force-prefers-reduced-motion'] : []),
    ],
  });
  try {
    const r = await lighthouse(
      `${BASE}${rota}`,
      {
        port: chrome.port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
      throttling
        ? { extends: 'lighthouse:default', settings: { throttling, throttlingMethod: 'simulate' } }
        : undefined,
    );
    const lhr = r.lhr;
    if (lhr.runtimeError) throw new Error(`${rota}: ${lhr.runtimeError.message}`);
    const a = lhr.audits;
    const por = (tipo) =>
      (a['resource-summary']?.details?.items ?? []).find((i) => i.resourceType === tipo)
        ?.transferSize ?? 0;
    const nota = (k) => Math.round((lhr.categories[k]?.score ?? 0) * 100);
    const falhas = Object.values(lhr.categories)
      .flatMap((c) => c.auditRefs)
      .filter((ref) => ref.weight > 0 && a[ref.id]?.score !== null && a[ref.id]?.score < 1)
      .map((ref) => ref.id);
    const seoFalhas = lhr.categories.seo.auditRefs
      .filter((ref) => ref.weight > 0 && a[ref.id]?.score !== null && a[ref.id]?.score < 1)
      .map((ref) => ref.id);
    return {
      rota,
      seoFalhas,
      perf: nota('performance'),
      a11y: nota('accessibility'),
      bp: nota('best-practices'),
      seo: nota('seo'),
      fcp: a['first-contentful-paint'].numericValue,
      lcp: a['largest-contentful-paint'].numericValue,
      tbt: a['total-blocking-time'].numericValue,
      cls: a['cumulative-layout-shift'].numericValue,
      si: a['speed-index'].numericValue,
      pesoTotal: por('total'),
      pesoDoc: por('document'),
      pesoJs: por('script'),
      pesoCss: por('stylesheet'),
      pesoFonte: por('font'),
      pesoImg: por('image'),
      pesoMidia: por('media'),
      requisicoes:
        (a['resource-summary']?.details?.items ?? []).find((i) => i.resourceType === 'total')
          ?.requestCount ?? 0,
      terceiros:
        (a['resource-summary']?.details?.items ?? []).find((i) => i.resourceType === 'third-party')
          ?.requestCount ?? 0,
      falhas: [...new Set(falhas)],
    };
  } finally {
    await chrome.kill();
  }
}

const kb = (b) => `${(b / 1024).toFixed(1)} KB`;
const s = (ms) => `${(ms / 1000).toFixed(2)} s`;
const linhas = [];
const resultados = { base: BASE, data: new Date().toISOString(), rotas: [], extras: [] };

console.log(
  'rota                               perf a11y  bp seo   FCP     LCP    TBT  CLS    peso (transf.)  JS   req',
);
for (const rota of ROTAS) {
  const m = await medir(rota);
  resultados.rotas.push(m);
  const l = `${rota.padEnd(34)} ${String(m.perf).padStart(4)} ${String(m.a11y).padStart(4)} ${String(m.bp).padStart(3)} ${String(m.seo).padStart(3)}  ${s(m.fcp)} ${s(m.lcp)} ${String(Math.round(m.tbt)).padStart(4)}ms ${m.cls.toFixed(3)}  ${kb(m.pesoTotal).padStart(9)} ${kb(m.pesoJs).padStart(8)} ${String(m.requisicoes).padStart(3)}${m.falhas.length ? `  ✖ ${m.falhas.join(', ')}` : ''}`;
  linhas.push(l);
  console.log(l);
}

console.log('\nLCP em 4G (9 Mbps, RTT 60 ms, CPU 4×) — perfil do CLAUDE.md:');
for (const rota of ROTAS) {
  const m = await medir(rota, { throttling: QUATRO_G });
  resultados.extras.push({ rotulo: `4G ${rota}`, ...m });
  console.log(
    `  ${rota.padEnd(34)} perf ${m.perf} · FCP ${s(m.fcp)} · LCP ${s(m.lcp)} · CLS ${m.cls.toFixed(3)}`,
  );
}

console.log('\nHome: com e sem abertura; Android básico em 3G lento');
for (const [rotulo, rota, opcoes] of [
  ['home COM abertura (sessão nova)', '/', {}],
  ['home SEM abertura (reduced-motion)', '/', { reduzido: true }],
  ['home · 3G lento, CPU 6×', '/', { throttling: TRES_G_LENTO }],
  ['/agendar · 3G lento, CPU 6×', '/agendar/', { throttling: TRES_G_LENTO }],
]) {
  const m = await medir(rota, opcoes);
  resultados.extras.push({ rotulo, ...m });
  console.log(
    `${rotulo.padEnd(38)} perf ${m.perf} · FCP ${s(m.fcp)} · LCP ${s(m.lcp)} · TBT ${Math.round(m.tbt)} ms · CLS ${m.cls.toFixed(3)} · ${kb(m.pesoTotal)}`,
  );
}

if (saida) {
  mkdirSync(dirname(saida), { recursive: true });
  writeFileSync(saida, `${JSON.stringify(resultados, null, 2)}\n`);
  console.log(`\n→ ${saida}`);
}

// Orçamento: falha se algum número sair do combinado.
const fora = resultados.rotas.flatMap((m) => [
  ...(m.perf < 95 ? [`${m.rota}: Perf ${m.perf}`] : []),
  ...(m.a11y < 100 ? [`${m.rota}: A11y ${m.a11y}`] : []),
  ...(m.bp < 95 ? [`${m.rota}: BP ${m.bp}`] : []),
  ...(m.seo < 95 && !m.seoFalhas.every((f) => f === 'is-crawlable')
    ? [`${m.rota}: SEO ${m.seo} (${m.seoFalhas.join(', ')})`]
    : []),
  ...(m.lcp >= 1800 ? [`${m.rota}: LCP ${s(m.lcp)}`] : []),
  ...(m.cls > 0.02 ? [`${m.rota}: CLS ${m.cls.toFixed(3)}`] : []),
  ...(m.terceiros > 0 ? [`${m.rota}: ${m.terceiros} requisição(ões) de terceiros`] : []),
]);
if (fora.length) {
  console.log(`\n✖ fora do orçamento:\n  ${fora.join('\n  ')}`);
  process.exit(1);
}
console.log(
  '\n✓ todas as rotas dentro do orçamento (SEO do preview só perde o "is-crawlable" do noindex).',
);
