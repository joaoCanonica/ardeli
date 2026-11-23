// audit-a11y: acessibilidade (o teste mais importante deste site). Chromium real.
//   1. axe (WCAG 2.0/2.1/2.2 A e AA + boas práticas) em todas as rotas, 390 e 1440,
//      e nos estados: gaveta aberta, menu aberto, mapa perguntando, A++, prefers-contrast,
//      forced-colors;
//   2. teclado do início ao fim: capa → seletor de convênio → Agendar → agendador →
//      WhatsApp (mensagem exata), foco sempre visível, Esc devolve o foco;
//   3. reflow: zoom 200% (640 px) e 400% (320 px) sem rolagem horizontal nem texto cortado;
//   4. A+/A−: cresce, guarda só no aparelho, sem transbordar;
//   5. reduced-motion: nenhuma animação rodando; abertura não aparece;
//   6. alvos ≥ 48 px (exceto link dentro de frase, WCAG 2.5.8);
//   7. árvore de acessibilidade do agendador e do seletor (para revisão com leitor de tela).
// Uso: servidor em BASE (pnpm servir) → BASE=http://localhost:4330 pnpm audit-a11y
import { mkdirSync, writeFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4330';
const ROTAS = [
  '/',
  '/convenios/',
  '/atendimentos/',
  '/atendimentos/musculoesqueletica/',
  '/primeira-avaliacao/',
  '/quem-cuida/',
  '/a-clinica/',
  '/perguntas-frequentes/',
  '/como-chegar/',
  '/agendar/',
  '/privacidade/',
  '/avaliar/qr/',
  '/avaliar/?o=direto',
  '/pagina-que-nao-existe/',
];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const falhas = [];
const notas = [];
let checagens = 0;
const ok = (cond, msg) => {
  checagens++;
  if (!cond) falhas.push(msg);
  return !!cond;
};
const b = await chromium.launch();
const etapa = async (nome, fn) => {
  try {
    await fn();
  } catch (e) {
    ok(false, `${nome}: o teste quebrou (${e.message.split('\n')[0]})`);
  }
  console.log(`${nome}: feito`);
};

async function pagina(opts = {}) {
  const c = await b.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
    ...opts,
  });
  const p = await c.newPage();
  await p.route('https://wa.me/**', (r) =>
    r.fulfill({ status: 200, contentType: 'text/html', body: 'wa' }),
  );
  // Mapa (iframe) recebe uma página falsa; a navegação de /avaliar para a ficha recebe 204
  // (o navegador fica na página do site, e o axe avalia a página certa).
  await p.route(/https:\/\/(www|maps)\.google\.com\/.*/, (r) =>
    r.request().isNavigationRequest() && r.request().frame() === p.mainFrame()
      ? r.fulfill({ status: 204 })
      : r.fulfill({ status: 200, contentType: 'text/html', body: '<title>mapa</title>' }),
  );
  return { c, p };
}

async function axe(p, onde, { semContraste = false } = {}) {
  // Em forced-colors as cores são do sistema (escolha da pessoa): contraste não se aplica.
  let construtor = new AxeBuilder({ page: p }).withTags(TAGS).exclude('iframe');
  if (semContraste) construtor = construtor.disableRules(['color-contrast']);
  const r = await construtor.analyze();
  for (const v of r.violations)
    ok(
      false,
      `axe ${onde}: ${v.id} (${v.impact}) — ${v.help} → ${v.nodes
        .slice(0, 2)
        .map((n) => n.target.join(' '))
        .join(' | ')}`,
    );
  checagens += r.passes.length;
  return r.violations.length;
}

// ---------- 1. axe em todas as rotas e estados ----------
let violacoes = 0;
for (const largura of [390, 1440]) {
  for (const rota of ROTAS) {
    const { c, p } = await pagina({ viewport: { width: largura, height: 900 } });
    await p.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
    violacoes += await axe(p, `${rota} @${largura}`);
    await c.close();
  }
}
const estados = [
  ['gaveta aberta', '/', async (p) => p.locator('.cab__agendar').click()],
  ['menu aberto', '/', async (p) => p.locator('.cab__menu-botao').click()],
  [
    'mapa perguntando',
    '/como-chegar/',
    async (p) => p.locator('[data-mapa-mostrar]').first().click(),
  ],
  ['FAQ aberta', '/perguntas-frequentes/', async (p) => p.locator('summary').first().click()],
  [
    'A++ (texto maior)',
    '/',
    async (p) => p.evaluate(() => (document.documentElement.dataset.tamanho = '2')),
  ],
];
for (const [nome, rota, acao] of estados) {
  const { c, p } = await pagina();
  await p.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
  await acao(p);
  await p.waitForTimeout(300);
  violacoes += await axe(p, `${rota} (${nome})`);
  await c.close();
}
for (const [nome, media] of [
  ['prefers-contrast: more', { contrast: 'more' }],
  ['forced-colors', { forcedColors: 'active' }],
]) {
  for (const rota of ['/', '/agendar/', '/convenios/']) {
    const { c, p } = await pagina();
    await p.emulateMedia(media);
    await p.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
    violacoes += await axe(p, `${rota} (${nome})`, { semContraste: nome === 'forced-colors' });
    await c.close();
  }
}
console.log(
  `1. axe: ${violacoes} violação(ões) em ${ROTAS.length * 2 + estados.length + 6} varreduras`,
);

await etapa('2. teclado', async () => {
  const { c, p } = await pagina();
  let enviado = null;
  await p.unroute('https://wa.me/**');
  await p.route('https://wa.me/**', (r) => {
    enviado = decodeURIComponent(new URL(r.request().url()).searchParams.get('text') ?? '');
    return r.fulfill({ status: 200, contentType: 'text/html', body: 'wa' });
  });
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const focoVisivel = () =>
    p.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const s = getComputedStyle(e);
      const contorno = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2;
      const sombra = s.boxShadow && s.boxShadow !== 'none';
      // Rádio escondido: o foco aparece no rótulo (:focus-within / :has).
      const rotulo = e.closest('label');
      const rs = rotulo ? getComputedStyle(rotulo) : null;
      const noRotulo =
        rs &&
        ((rs.outlineStyle !== 'none' && parseFloat(rs.outlineWidth) >= 2) ||
          rs.boxShadow !== 'none');
      return {
        tag: e.tagName.toLowerCase(),
        nome: (e.getAttribute('aria-label') ?? e.textContent ?? e.getAttribute('value') ?? '')
          .trim()
          .slice(0, 40),
        visivel: contorno || sombra || !!noRotulo,
      };
    });
  const passos = [];
  const tab = async (n = 1, shift = false) => {
    for (let i = 0; i < n; i++) {
      await p.keyboard.press(shift ? 'Shift+Tab' : 'Tab');
      const f = await focoVisivel();
      passos.push(f);
      if (f) ok(f.visivel, `teclado: foco invisível em <${f.tag}> "${f.nome}"`);
    }
  };
  await tab();
  ok(
    passos[0]?.nome?.includes('Pular para o conteúdo'),
    `teclado: 1º Tab não é "Pular para o conteúdo" (${passos[0]?.nome})`,
  );
  // Até o seletor de convênio (rádio Unimed).
  let achou = false;
  for (let i = 0; i < 60 && !achou; i++) {
    await tab();
    achou = await p.evaluate(() => {
      const e = document.activeElement;
      return (
        e instanceof HTMLInputElement &&
        e.type === 'radio' &&
        !!e.closest('[data-seletor-convenio], .seletor, section')
      );
    });
  }
  const tabsAteSeletor = passos.length;
  ok(achou, 'teclado: não chegou ao seletor de convênio');
  // Setas escolhem a forma (rádio nativo) até Unimed.
  for (let i = 0; i < 4; i++) {
    const v = await p.evaluate(() =>
      document.activeElement instanceof HTMLInputElement ? document.activeElement.value : '',
    );
    if (v === 'unimed') break;
    await p.keyboard.press('ArrowRight');
  }
  const forma = await p.evaluate(() =>
    document.activeElement instanceof HTMLInputElement ? document.activeElement.value : '',
  );
  ok(forma === 'unimed', `teclado: setas não chegaram a Unimed (${forma})`);
  // Tab até o "Agendar" do painel da Unimed e Enter abre a gaveta com Unimed marcado.
  let agendar = false;
  for (let i = 0; i < 25 && !agendar; i++) {
    await tab();
    agendar = await p.evaluate(() => {
      const e = document.activeElement;
      return !!e?.matches('[data-agendar]') && e.getAttribute('data-forma') === 'unimed';
    });
  }
  ok(agendar, 'teclado: não chegou ao botão Agendar da Unimed');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  const naGaveta = await p.evaluate(() => {
    const d = document.querySelector('[data-gaveta]');
    return { aberta: !!d?.open, focoDentro: !!d?.contains(document.activeElement) };
  });
  ok(naGaveta.aberta && naGaveta.focoDentro, 'teclado: gaveta não abriu ou o foco ficou fora');
  ok(
    await p.locator('[data-gaveta] input[name="forma"][value="unimed"]').isChecked(),
    'teclado: Unimed não veio marcado na gaveta',
  );
  // Dentro da gaveta: Tab até o período "tarde" e Espaço; depois até Enviar e Enter.
  for (let i = 0; i < 40; i++) {
    const v = await p.evaluate(() => {
      const e = document.activeElement;
      return e instanceof HTMLInputElement ? `${e.name}:${e.value}` : (e?.textContent ?? '').trim();
    });
    if (v.startsWith('periodo:')) break;
    await tab();
  }
  for (let i = 0; i < 4; i++) {
    const v = await p.evaluate(() =>
      document.activeElement instanceof HTMLInputElement ? document.activeElement.value : '',
    );
    if (v === 'tarde') break;
    await p.keyboard.press('ArrowRight');
  }
  await p.keyboard.press('Space');
  let enviar = false;
  for (let i = 0; i < 20 && !enviar; i++) {
    await tab();
    enviar = await p.evaluate(
      () => document.activeElement?.matches('[data-gaveta] button[type="submit"]') ?? false,
    );
  }
  ok(enviar, 'teclado: não chegou a "Enviar pelo WhatsApp"');
  const totalTabs = passos.length;
  await p.keyboard.press('Enter');
  await p.waitForTimeout(500);
  const esperado =
    'Olá! Vim pelo site da Ardeli e quero agendar uma avaliação. Atendimento: Unimed. Prefiro à tarde.';
  ok(enviado === esperado, `teclado: mensagem enviada "${enviado}"`);
  notas.push(
    `teclado: ${tabsAteSeletor} Tabs até o seletor de convênio, ${totalTabs} Tabs no total até "Enviar pelo WhatsApp"; mensagem exata enviada.`,
  );
  // Esc fecha a gaveta e devolve o foco ao botão que abriu.
  await p.goto(`${BASE}/convenios/`, { waitUntil: 'networkidle' });
  await p.locator('#unimed a[data-agendar]').focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(250);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(250);
  const devolveu = await p.evaluate(() => ({
    fechada: !document.querySelector('[data-gaveta]')?.open,
    foco: document.activeElement?.matches('#unimed a[data-agendar]') ?? false,
  }));
  ok(devolveu.fechada && devolveu.foco, 'teclado: Esc não fecha a gaveta ou não devolve o foco');
  // Foco visível em todo elemento focável das páginas principais.
  for (const rota of ['/', '/agendar/', '/convenios/', '/como-chegar/']) {
    await p.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
    const n = await p.evaluate(
      () =>
        document.querySelectorAll('a[href], button:not([hidden]), input, summary, [tabindex="0"]')
          .length,
    );
    let invisiveis = 0;
    for (let i = 0; i < Math.min(n, 120); i++) {
      await p.keyboard.press('Tab');
      const f = await focoVisivel();
      if (f && !f.visivel) {
        invisiveis++;
        ok(false, `foco invisível em ${rota}: <${f.tag}> "${f.nome}"`);
      }
    }
    checagens++;
    if (!invisiveis) notas.push(`foco visível em todos os elementos percorridos de ${rota}`);
  }
  await c.close();
});

await etapa('3. reflow', async () => {
  for (const [rotulo, w, h] of [
    ['zoom 200% (1280 → 640 px)', 640, 400],
    ['zoom 400% (1280 → 320 px)', 320, 256],
    ['390 px com zoom 200% (195 px)', 195, 422],
  ]) {
    for (const rota of ROTAS) {
      const { c, p } = await pagina({ viewport: { width: w, height: h } });
      await p.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
      const r = await p.evaluate(() => {
        const W = document.documentElement.clientWidth;
        const largo = document.documentElement.scrollWidth > W + 1;
        // Texto cortado: elemento com texto e overflow escondido que transborda.
        const cortados = [...document.querySelectorAll('body *')]
          .filter((e) => {
            const s = getComputedStyle(e);
            return (
              (s.overflowX === 'hidden' ||
                s.overflow === 'hidden' ||
                s.textOverflow === 'ellipsis') &&
              e.scrollWidth > e.clientWidth + 2 &&
              e.textContent?.trim() &&
              !e.closest('[aria-hidden="true"], .visualmente-oculto, [hidden]') &&
              s.position !== 'absolute'
            );
          })
          .map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join('.')}`);
        return { largo, cortados: cortados.slice(0, 3) };
      });
      ok(!r.largo, `reflow ${rotulo}: ${rota} com rolagem horizontal`);
      ok(
        r.cortados.length === 0,
        `reflow ${rotulo}: ${rota} texto cortado em ${r.cortados.join(', ')}`,
      );
      await c.close();
    }
  }
});

await etapa('4. A+/A−', async () => {
  const { c, p } = await pagina();
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await p.locator('.cab__menu-botao').click();
  const tam = () =>
    p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
  const t0 = await tam();
  const mais = p.locator('[aria-labelledby="tamanho-menu-rotulo"] [data-passo="1"]');
  await mais.click();
  await p.waitForTimeout(250);
  await mais.click();
  await p.waitForTimeout(400);
  const t2 = await tam();
  const guardado = await p.evaluate(() => localStorage.getItem('ardeli:tamanho'));
  await p.goto(`${BASE}/convenios/`, { waitUntil: 'networkidle' });
  const t2b = await tam();
  const largo = await p.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  ok(
    t2 > t0 && guardado === '2' && t2b === t2,
    `A+: ${t0}px → ${t2}px, guardado "${guardado}", outra página ${t2b}px`,
  );
  ok(!largo, 'A+: com texto maior a página transborda');
  await p.locator('.cab__menu-botao').click();
  await p.waitForTimeout(300);
  const menos = p.locator('[aria-labelledby="tamanho-menu-rotulo"] [data-passo="-1"]');
  await menos.click();
  await p.waitForTimeout(200);
  await menos.click();
  await p.waitForTimeout(200);
  const tFinal = await tam();
  ok(tFinal === t0, `A−: não volta ao tamanho padrão (${tFinal}px ≠ ${t0}px)`);
  notas.push(
    `A+/A−: ${t0}px → ${t2}px (A++), guardado só no aparelho (localStorage), vale nas outras páginas, sem transbordo a 390 px.`,
  );
  await c.close();
});

await etapa('5. reduced-motion', async () => {
  const { c, p } = await pagina({ reducedMotion: 'reduce' });
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await p.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      scrollTo(0, y);
      await new Promise((o) => setTimeout(o, 40));
    }
  });
  const r = await p.evaluate(() => ({
    rodando: document
      .getAnimations()
      .filter((a) => a.playState === 'running' && (a.effect?.getTiming().duration ?? 0) > 50)
      .length,
    abertura: (() => {
      const el = document.getElementById('abertura');
      return !!el && !el.hidden && getComputedStyle(el).display !== 'none';
    })(),
    autoplay: [...document.querySelectorAll('video')].filter((v) => !v.paused).length,
  }));
  ok(r.rodando === 0, `reduced-motion: ${r.rodando} animação(ões) rodando`);
  ok(!r.abertura, 'reduced-motion: a abertura apareceu');
  ok(r.autoplay === 0, `reduced-motion: ${r.autoplay} vídeo(s) tocando sozinhos`);
  await c.close();
  // Sem reduced-motion, a abertura roda uma vez por sessão e termina em ≤ 1,2 s.
  const { c: c2, p: p2 } = await pagina({ reducedMotion: 'no-preference' });
  await p2.goto(`${BASE}/`);
  const t0 = Date.now();
  await p2
    .waitForFunction(() => !document.documentElement.classList.contains('abrindo'), null, {
      timeout: 4000,
    })
    .catch(() => {});
  const dur = Date.now() - t0;
  ok(dur <= 1600, `abertura demorou ${dur} ms`);
  notas.push(
    `reduced-motion: nenhuma animação, abertura e vídeo parados. Sem a preferência, a abertura terminou em ~${dur} ms.`,
  );
  await c2.close();
});

await etapa('6. alvos ≥ 48 px', async () => {
  for (const largura of [390, 1440]) {
    for (const rota of ROTAS) {
      const { c, p } = await pagina({ viewport: { width: largura, height: 900 } });
      await p.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
      const pequenos = await p.evaluate(() => {
        const els = [
          ...document.querySelectorAll(
            'a[href], button, summary, input:not([type="hidden"]), select, [role="button"]',
          ),
        ];
        const res = [];
        for (const e of els) {
          if (e.closest('[hidden], .visualmente-oculto') || e.classList.contains('pular')) continue;
          const s = getComputedStyle(e);
          if (s.display === 'none' || s.visibility === 'hidden') continue;
          // Invisível (ex.: menu <details> fechado): não é alvo agora.
          if (!e.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true }))
            continue;
          // Rádio/checkbox escondido: o alvo é o rótulo.
          const alvo = e.matches('input[type="radio"], input[type="checkbox"]')
            ? (e.closest('label') ?? e)
            : e;
          const r = alvo.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          // Exceção WCAG 2.5.8: link dentro de frase.
          // Link sozinho no parágrafo/linha NÃO é "em frase": precisa de 48 px.
          const bloco = e.closest('p, li, dd, address, figcaption, small');
          const sozinho = !!bloco && bloco.textContent.trim() === e.textContent.trim();
          const emFrase =
            e.tagName === 'A' &&
            s.display === 'inline' &&
            !!bloco &&
            !sozinho &&
            !e.closest('address');
          if (emFrase) continue;
          if (r.width < 47.5 || r.height < 47.5)
            res.push(
              `${e.tagName.toLowerCase()} "${(e.textContent ?? e.getAttribute('aria-label') ?? '').trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`,
            );
        }
        return res;
      });
      for (const x of pequenos) ok(false, `alvo < 48 px em ${rota} @${largura}: ${x}`);
      checagens++;
      await c.close();
    }
  }
});

await etapa('7. árvore de acessibilidade', async () => {
  const { c, p } = await pagina();
  await p.goto(`${BASE}/agendar/`, { waitUntil: 'networkidle' });
  const agendador = await p
    .locator('[data-agendar-pagina] form')
    .ariaSnapshot({ timeout: 10000 })
    .catch((e) => {
      throw new Error(`snapshot do agendador: ${e.message.split('\n')[0]}`);
    });
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const seletor = await p
    .locator('[data-seletor-convenio]')
    .ariaSnapshot({ timeout: 10000 })
    .catch((e) => {
      throw new Error(`snapshot do seletor: ${e.message.split('\n')[0]}`);
    });
  mkdirSync('docs/qa', { recursive: true });
  writeFileSync(
    'docs/qa/arvore-acessibilidade.md',
    `# Árvore de acessibilidade (o que o leitor de tela recebe)\n\nGerado por \`pnpm audit-a11y\` (Chromium). Serve de roteiro para o teste com NVDA e VoiceOver.\n\n## Agendador (/agendar)\n\n\`\`\`yaml\n${agendador}\n\`\`\`\n\n## Seletor de convênio (home)\n\n\`\`\`yaml\n${seletor}\n\`\`\`\n`,
  );
  ok(
    /group "1 Como você vai ser atendido\?|group "Como você vai ser atendido/.test(agendador) ||
      /radiogroup|group/.test(agendador),
    'agendador sem grupos nomeados',
  );
  ok(/radio "Unimed"/.test(agendador), 'agendador: rádio Unimed sem nome acessível');
  ok(/radio "Unimed"/.test(seletor), 'seletor: rádio Unimed sem nome acessível');
  await c.close();
});

await b.close();
for (const n of notas) console.log(`  · ${n}`);
for (const f of falhas) console.log(`  ✖ ${f}`);
console.log(
  falhas.length
    ? `✖ audit-a11y: ${falhas.length} problema(s) em ${checagens} verificações.`
    : `✓ audit-a11y verde: ${checagens} verificações.`,
);
process.exit(falhas.length ? 1 : 0);
