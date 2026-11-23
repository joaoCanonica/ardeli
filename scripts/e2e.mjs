// E2E do agendador e do "avaliar" (390 px). Requer o build e o preview rodando
// (pnpm build && pnpm preview, ou o servidor em BASE). Uso: pnpm e2e
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4329';
const INICIO = 'Olá! Vim pelo site da Ardeli e quero agendar uma avaliação.';
const GERAL = `${INICIO} Ainda não sei se vai ser particular ou por convênio.`;
const resultados = [];
const ok = (nome, cond, detalhe = '') => {
  resultados.push({ nome, ok: !!cond, detalhe });
  console.log(`${cond ? '✓' : '✖'} ${nome}${detalhe ? ` — ${detalhe}` : ''}`);
};

const b = await chromium.launch();

async function contexto(opts = {}) {
  const c = await b.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
    ...opts,
  });
  const p = await c.newPage();
  const enviada = { url: null };
  await p.route('https://wa.me/**', (r) => {
    enviada.url = r.request().url();
    return r.fulfill({ status: 200, contentType: 'text/html', body: '<p>WhatsApp (simulado)</p>' });
  });
  return { c, p, enviada };
}
const texto = (url) =>
  url ? decodeURIComponent(new URL(url).searchParams.get('text') ?? '') : null;
const marcar = (p, raiz, nome, valor) =>
  p.locator(`${raiz} input[name="${nome}"][value="${valor}"]`).check();
async function enviar(p, raiz, enviada) {
  await p.locator(`${raiz} button[type="submit"]`).click();
  await p.waitForTimeout(400);
  return texto(enviada.url);
}

// 1. Particular simples
{
  const { c, p, enviada } = await contexto();
  await p.goto(`${BASE}/agendar/`);
  await marcar(p, '[data-agendar-pagina]', 'forma', 'particular');
  const t = await enviar(p, '[data-agendar-pagina]', enviada);
  ok('1. particular simples', t === `${INICIO} Atendimento: Particular.`, t);
  await c.close();
}

// 2. Unimed + pós-operatório (pela URL) + tarde; evento sem texto livre
{
  const { c, p, enviada } = await contexto();
  await p.goto(`${BASE}/agendar/?forma=unimed&motivo=pos-operatorio`);
  const pre = await p
    .locator('[data-agendar-pagina] input[name="forma"][value="unimed"]')
    .isChecked();
  await marcar(p, '[data-agendar-pagina]', 'periodo', 'tarde');
  const previa = await p.locator('[data-agendar-pagina] [data-previa]').textContent();
  const eventos = [];
  await p.exposeFunction('__registrar', (e) => eventos.push(e));
  await p.evaluate(() => {
    const orig = window.__ardeliEventos ?? (window.__ardeliEventos = []);
    const push = orig.push.bind(orig);
    orig.push = (e) => {
      window.__registrar(e);
      return push(e);
    };
  });
  const t = await enviar(p, '[data-agendar-pagina]', enviada);
  const esperado = `${INICIO} Atendimento: Unimed. Motivo: pós-operatório. Prefiro à tarde.`;
  ok(
    '2. Unimed + pós-operatório + tarde (pré-preenchido por ?forma=&motivo=)',
    pre && t === esperado && previa === esperado,
    t,
  );
  const ev = eventos.find((e) => e.nome === 'agendador_enviado');
  ok(
    '2b. evento agendador_enviado só com valores fechados',
    ev &&
      JSON.stringify(ev.props) ===
        JSON.stringify({ forma: 'unimed', motivo: 'pos-operatorio', passo: '3' }),
    JSON.stringify(ev?.props),
  );
  await c.close();
}

// 3. AAPL pela gaveta do cabeçalho, terça e quinta
{
  const { c, p, enviada } = await contexto();
  await p.goto(`${BASE}/`);
  await p.locator('.cab__agendar').click();
  const aberta = await p.locator('[data-gaveta]').evaluate((d) => d.open);
  await marcar(p, '[data-gaveta]', 'forma', 'aapl');
  await p.locator('[data-gaveta] input[name="dia"][value="2"]').check();
  await p.locator('[data-gaveta] input[name="dia"][value="4"]').check();
  const t = await enviar(p, '[data-gaveta]', enviada);
  ok(
    '3. AAPL (gaveta do cabeçalho) + terça e quinta',
    aberta && t === `${INICIO} Atendimento: AAPL. Prefiro terça ou quinta.`,
    t,
  );
  await c.close();
}

// 4. SUS (confirmado em 23/11/2026): pré-preenchido por ?forma=sus e enviado.
//    (Enquanto não confirmado, o SUS não era oferecido; a regra continua coberta em tests/agenda.test.ts.)
{
  const { c, p, enviada } = await contexto();
  await p.goto(`${BASE}/agendar/?forma=sus`);
  const marcado = await p
    .locator('[data-agendar-pagina] input[name="forma"][value="sus"]')
    .isChecked();
  const t = await enviar(p, '[data-agendar-pagina]', enviada);
  ok('4. SUS pré-preenchido por ?forma=sus', marcado && t === `${INICIO} Atendimento: SUS.`, t);
  await c.close();
}

// 5. Sem motivo
{
  const { c, p, enviada } = await contexto();
  await p.goto(`${BASE}/agendar/?forma=unimed`);
  await marcar(p, '[data-agendar-pagina]', 'periodo', 'manha');
  const t = await enviar(p, '[data-agendar-pagina]', enviada);
  ok('5. sem motivo (Unimed, manhã)', t === `${INICIO} Atendimento: Unimed. Prefiro de manhã.`, t);
  await c.close();
}

// 6. Sem JS: formulário nativo cai na mensagem geral; botões são links diretos
{
  const { c, p, enviada } = await contexto({ javaScriptEnabled: false });
  await p.goto(`${BASE}/agendar/`);
  await p.locator('[data-agendar-pagina] input[name="forma"][value="particular"]').check();
  await p.locator('[data-agendar-pagina] button[type="submit"]').click();
  await p.waitForTimeout(500);
  const t = texto(enviada.url);
  await p.goto(`${BASE}/`);
  const href = await p.locator('.cab__agendar').getAttribute('href');
  ok('6. sem JS: formulário e botões caem no link geral', t === GERAL && texto(href) === GERAL, t);
  await c.close();
}

// 7. Aberto de /convenios#unimed
{
  const { c, p, enviada } = await contexto();
  await p.goto(`${BASE}/convenios/#unimed`);
  await p.locator('#unimed a[data-agendar]').click();
  const marcado = await p.locator('[data-gaveta] input[name="forma"][value="unimed"]').isChecked();
  const t = await enviar(p, '[data-gaveta]', enviada);
  ok(
    '7. aberto de /convenios#unimed (Unimed já marcado)',
    marcado && t === `${INICIO} Atendimento: Unimed.`,
    t,
  );
  await c.close();
}

// 8. Aberto de /atendimentos/musculoesqueletica
{
  const { c, p, enviada } = await contexto();
  await p.goto(`${BASE}/atendimentos/musculoesqueletica/`);
  await p.locator('main a[data-agendar]').first().click();
  await marcar(p, '[data-gaveta]', 'forma', 'particular');
  await marcar(p, '[data-gaveta]', 'motivo', 'recuperacao-lesao');
  const t = await enviar(p, '[data-gaveta]', enviada);
  ok(
    '8. aberto de /atendimentos/musculoesqueletica',
    t === `${INICIO} Atendimento: Particular. Motivo: recuperação após lesão.`,
    t,
  );
  await c.close();
}

// /avaliar redireciona e registra a origem
{
  const { c, p } = await contexto();
  let destino = null;
  await p.route(/https:\/\/(maps|www)\.google\.com\/.*/, (r) => {
    destino = r.request().url();
    return r.fulfill({ status: 200, contentType: 'text/html', body: '<p>Google (simulado)</p>' });
  });
  const eventos = [];
  await p.exposeFunction('__registrar', (e) => eventos.push(e));
  await p.addInitScript(() => {
    const lista = [];
    lista.push = (e) => {
      window.__registrar(e);
      return Array.prototype.push.call(lista, e);
    };
    window.__ardeliEventos = lista;
  });
  // Refresh de 0 s: a página sai logo; as metas são lidas do HTML da resposta.
  const html = await (await p.request.get(`${BASE}/avaliar/?o=qr`)).text();
  await p.goto(`${BASE}/avaliar/?o=qr`);
  const refresh = html.match(/http-equiv="refresh" content="([^"]*)"/)?.[1] ?? null;
  const robots = html.match(/name="robots" content="([^"]*)"/)?.[1] ?? null;
  await p.waitForTimeout(800);
  ok(
    '/avaliar redireciona (meta refresh + JS), noindex, origem "qr" registrada',
    /^https:\/\/(maps|www)\.google\.com\//.test(destino ?? '') &&
      /url=https/.test(refresh ?? '') &&
      /noindex/.test(robots ?? '') &&
      eventos.some((e) => e.nome === 'clique_avaliar' && e.props.origem === 'qr'),
    destino ?? 'não redirecionou',
  );
  await c.close();
}

// /avaliar/qr imprime: 2 páginas, A6 e A5
{
  const c = await b.newContext();
  const p = await c.newPage();
  await p.goto(`${BASE}/avaliar/qr/`);
  await p.emulateMedia({ media: 'print' });
  const pasta = mkdtempSync(join(tmpdir(), 'ardeli-qr-'));
  const pdf = join(pasta, 'qr.pdf');
  // Chromium headless usa o papel padrão do printToPDF na 1ª página mesmo com @page
  // (testado com HTML mínimo). Papel padrão = A6 (o mesmo do @page sem nome); a 2ª folha
  // só sai em A5 se o @page a5 do CSS for respeitado. As medidas das folhas vêm do DOM.
  await p.pdf({
    path: pdf,
    preferCSSPageSize: true,
    printBackground: true,
    width: '105mm',
    height: '148mm',
  });
  const medidas = await p.$$eval('.folha', (fs) =>
    fs.map((f) => `${Math.round(f.offsetWidth)}x${Math.round(f.offsetHeight)}`),
  );
  // 105×148 mm = 397×559 px; 148×210 mm = 559×794 px (96 dpi).
  ok(
    '/avaliar/qr: folhas medem A6 e A5 no modo impressão',
    JSON.stringify(medidas) === JSON.stringify(['397x559', '559x794']),
    medidas.join(', '),
  );
  const info = execFileSync('pdfinfo', ['-f', '1', '-l', '9', pdf], { encoding: 'utf8' });
  const tamanhos = [...info.matchAll(/Page\s+\d+ size:\s+([\d.]+) x ([\d.]+)/g)].map(
    (m) => `${Math.round(m[1])}x${Math.round(m[2])}`,
  );
  // A6 = 298 x 420 pt; A5 = 420 x 595 pt.
  ok(
    '/avaliar/qr imprime A6 e A5, uma folha cada',
    JSON.stringify(tamanhos) === JSON.stringify(['298x420', '420x595']),
    tamanhos.join(', '),
  );
  const temQr = await p.locator('.folha__qr svg').count();
  ok('/avaliar/qr tem o QR em SVG (gerado no build) nas duas folhas', temQr === 2);
  await c.close();
}

// Nenhum request de terceiro antes do clique
{
  const rotas = [
    '/',
    '/convenios/',
    '/a-clinica/',
    '/como-chegar/',
    '/agendar/',
    '/avaliar/qr/',
    '/primeira-avaliacao/',
  ];
  const terceiros = [];
  const cookies = [];
  for (const r of rotas) {
    const c = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await c.newPage();
    p.on('request', (q) => {
      const u = q.url();
      if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:'))
        terceiros.push(`${r} → ${u}`);
    });
    await p.goto(`${BASE}${r}`, { waitUntil: 'networkidle' });
    await p.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((ok) => setTimeout(ok, 30));
      }
    });
    await p.waitForTimeout(500);
    if (r === '/como-chegar/') {
      // "Mostrar o mapa" só pergunta; "Recusar" não carrega nada.
      await p.locator('[data-mapa-mostrar]').click();
      await p.locator('[data-mapa-recusar]').click();
      await p.waitForTimeout(500);
    }
    for (const k of await c.cookies()) cookies.push(`${r} → ${k.name} (${k.domain})`);
    await c.close();
  }
  ok(
    'nenhum request de terceiro antes do clique (nem com "Recusar" no mapa)',
    terceiros.length === 0,
    terceiros.slice(0, 3).join(' | '),
  );
  ok(
    'nenhum cookie gravado (LGPD), com o mapa recusado',
    cookies.length === 0,
    cookies.slice(0, 3).join(' | '),
  );
}

// O mapa só carrega com "Aceitar"
{
  const c = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await c.newPage();
  await p.route('https://www.google.com/**', (r) =>
    r.fulfill({ status: 200, contentType: 'text/html', body: 'mapa' }),
  );
  const pedidos = [];
  p.on('request', (q) => pedidos.push(q.url()));
  await p.goto(`${BASE}/como-chegar/`);
  await p.locator('[data-mapa-mostrar]').click();
  const antes = pedidos.filter((u) => u.includes('google.com')).length;
  const pesos = await p.$$eval('[data-mapa-consentimento] button', (bs) =>
    bs.map((x) => {
      const s = getComputedStyle(x);
      return `${s.backgroundColor}|${s.color}|${s.borderWidth}|${s.fontWeight}|${s.fontSize}`;
    }),
  );
  await p.locator('[data-mapa-aceitar]').click();
  await p.waitForTimeout(500);
  const depois = pedidos.filter((u) => u.includes('google.com')).length;
  ok(
    'mapa: Aceitar e Recusar com o mesmo peso; Google só depois de "Aceitar"',
    antes === 0 && depois > 0 && pesos[0] === pesos[1],
    pesos.join(' vs '),
  );
  await c.close();
}

await b.close();
const falhas = resultados.filter((r) => !r.ok);
console.log(`\n${resultados.length - falhas.length}/${resultados.length} verificações passaram.`);
process.exit(falhas.length ? 1 : 0);
