// Teste SIMULADO de uma pessoa com mais de 60 anos (não substitui o teste real, que é do João).
// Perfil: Android simples (Moto G4, 360 px), 3G, letra aumentada (A++), toques lentos.
// Tarefas (docs/QA.md §4): descobrir se atende Unimed · agendar terça à tarde pela Unimed ·
// achar o endereço e o botão de ligar. Mede toques, rolagens, tempo e anota atritos.
// Uso: BASE=http://localhost:4330 node scripts/teste-60-simulado.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { chromium, devices } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4330';
const PASTA = 'docs/qa/teste-60';
mkdirSync(PASTA, { recursive: true });
// Tempo humano estimado por ação (pessoa 60+, leitura cuidadosa): ler a tela antes de tocar.
const LER_TELA_S = 4;
const TOCAR_S = 1.5;
const ROLAR_S = 2;

const b = await chromium.launch();
const c = await b.newContext({ ...devices['Moto G4'], reducedMotion: 'no-preference' });
const p = await c.newPage();
const cdp = await c.newCDPSession(p);
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 300,
  downloadThroughput: (750 * 1024) / 8,
  uploadThroughput: (250 * 1024) / 8,
  connectionType: 'cellular3g',
});
let mensagem = null;
await p.route('https://wa.me/**', (r) => {
  mensagem = decodeURIComponent(new URL(r.request().url()).searchParams.get('text') ?? '');
  return r.fulfill({ status: 200, contentType: 'text/html', body: '<p>WhatsApp</p>' });
});

const registro = [];
let n = 0;
async function foto(rotulo) {
  n++;
  const arq = `${PASTA}/${String(n).padStart(2, '0')}-${rotulo}.jpg`;
  const png = await p.screenshot();
  await sharp(png).resize({ width: 360 }).jpeg({ quality: 70, mozjpeg: true }).toFile(arq);
  return arq;
}
const visivel = (loc) =>
  loc.evaluate((e) => {
    const r = e.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= innerHeight && r.width > 0;
  });
async function tarefa(nome, passos) {
  const t = { nome, toques: 0, rolagens: 0, atritos: [], fotos: [], ok: false, tempoMaquina: 0 };
  const inicio = Date.now();
  try {
    await passos(t);
    t.ok = true;
  } catch (e) {
    t.atritos.push(`não concluiu: ${e.message.split('\n')[0]}`);
  }
  t.tempoMaquina = (Date.now() - inicio) / 1000;
  t.tempoHumano = t.toques * (TOCAR_S + LER_TELA_S) + t.rolagens * ROLAR_S + LER_TELA_S;
  registro.push(t);
}
// Toca num alvo; se ele não está na tela, rola até ele (conta a rolagem) e mede o alvo.
async function tocar(t, loc, rotulo) {
  if (!(await visivel(loc))) {
    t.rolagens++;
    await loc.scrollIntoViewIfNeeded();
  }
  const box = await loc.boundingBox();
  if (box && (box.height < 48 || box.width < 48))
    t.atritos.push(`"${rotulo}" com alvo de ${Math.round(box.width)}×${Math.round(box.height)} px`);
  await loc.click();
  t.toques++;
  await p.waitForTimeout(300);
}

// Carregamento em 3G.
const t0 = Date.now();
await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
const primeiraPintura = await p.evaluate(
  () => performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0,
);
await p.waitForLoadState('load');
const carregou = (Date.now() - t0) / 1000;
const ambiente = await p.evaluate(() => ({
  classes: document.documentElement.className,
  fonte: getComputedStyle(document.body).fontFamily.split(',')[0],
}));

// Letra maior (A++), como uma pessoa que enxerga pior faria (no menu).
await tarefa('Aumentar a letra (A+ duas vezes)', async (t) => {
  await tocar(t, p.locator('.cab__menu-botao'), 'Menu');
  const mais = p.locator('[aria-labelledby="tamanho-menu-rotulo"] [data-passo="1"]');
  await tocar(t, mais, 'A+');
  await tocar(t, mais, 'A+');
  await tocar(t, p.locator('.cab__menu-botao'), 'Fechar menu');
  const fs = await p.evaluate(() => getComputedStyle(document.body).fontSize);
  t.atritos.push(`(info) texto do corpo ficou em ${fs}`);
  t.fotos.push(await foto('letra-maior'));
});

await tarefa('Descobrir se atende Unimed', async (t) => {
  await p.evaluate(() => scrollTo(0, 0));
  t.fotos.push(await foto('capa'));
  // Sem rolar: "Unimed" aparece na primeira tela?
  const naTela = await p.evaluate(() =>
    [...document.querySelectorAll('main *')].some((e) => {
      if (!/Unimed/.test(e.textContent ?? '') || e.children.length) return false;
      const r = e.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight && r.width > 0;
    }),
  );
  if (!naTela) {
    t.rolagens++;
    t.atritos.push('"Unimed" não aparece na primeira tela com letra aumentada');
  }
});

await tarefa('Agendar terça à tarde pela Unimed', async (t) => {
  await p.evaluate(() => scrollTo(0, 0));
  await tocar(t, p.locator('.cab__agendar'), 'Agendar');
  const g = p.locator('[data-gaveta]');
  t.fotos.push(await foto('gaveta-aberta'));
  await tocar(t, g.locator('label:has(input[name="forma"][value="unimed"])'), 'Unimed');
  await tocar(t, g.locator('label:has(input[name="periodo"][value="tarde"])'), 'Tarde');
  await tocar(t, g.locator('label:has(input[name="dia"][value="2"])'), 'Terça');
  t.fotos.push(await foto('escolhas-feitas'));
  await tocar(t, g.locator('button[type="submit"]'), 'Enviar pelo WhatsApp');
  await p.waitForTimeout(800);
  if (!mensagem) throw new Error('o WhatsApp não abriu');
  t.atritos.push(`(info) mensagem: “${mensagem}”`);
});

await tarefa('Achar o endereço e o botão de ligar', async (t) => {
  await p.goto(`${BASE}/`, { waitUntil: 'load' });
  const end = p.locator('.fatos a[href*="maps"]').first();
  if (!(await visivel(end))) t.rolagens++;
  await end.scrollIntoViewIfNeeded();
  const ligar = p.locator('.fatos a[href^="tel:"]').first();
  if (!(await visivel(ligar))) t.rolagens++;
  await ligar.scrollIntoViewIfNeeded();
  const box = await ligar.boundingBox();
  if (box && box.height < 48) t.atritos.push(`"Ligar" com ${Math.round(box.height)} px de altura`);
  t.fotos.push(await foto('endereco-e-ligar'));
});

await b.close();

const md = [
  '# Teste SIMULADO com perfil 60+',
  '',
  `Gerado por \`scripts/teste-60-simulado.mjs\` em ${new Date().toISOString().slice(0, 10)}. **É uma simulação** (robô com o perfil abaixo); o teste com uma pessoa real fica com o João (docs/QA.md §4).`,
  '',
  '**Perfil:** celular Android simples (Moto G4, tela de 360 px), rede 3G (750 kbps, 300 ms), letra aumentada (A++), uma ação por vez.',
  `**Tempo humano estimado:** ${LER_TELA_S} s para ler cada tela + ${TOCAR_S} s por toque + ${ROLAR_S} s por rolagem (estimativa conservadora para 60+).`,
  '',
  `Carregamento da home em 3G: primeira pintura em ${(primeiraPintura / 1000).toFixed(1)} s, página completa em ${carregou.toFixed(1)} s. Classes do aparelho: \`${ambiente.classes || '—'}\`; fonte usada: ${ambiente.fonte}.`,
  '',
  '| Tarefa | Concluiu? | Toques | Rolagens | Tempo humano estimado | Atritos |',
  '|---|---|---|---|---|---|',
  ...registro.map(
    (t) =>
      `| ${t.nome} | ${t.ok ? 'sim' : '**não**'} | ${t.toques} | ${t.rolagens} | ~${Math.round(t.tempoHumano)} s | ${t.atritos.filter((a) => !a.startsWith('(info)')).join('; ') || 'nenhum'} |`,
  ),
  '',
  ...registro.flatMap((t) =>
    t.atritos.filter((a) => a.startsWith('(info)')).map((a) => `- ${t.nome}: ${a.slice(7)}`),
  ),
  '',
  '## Capturas',
  '',
  ...registro.flatMap((t) => t.fotos.map((f) => `- ${t.nome}: \`${f}\``)),
  '',
].join('\n');
writeFileSync('docs/qa/TESTE_60_SIMULADO.md', md);
console.log(md);
