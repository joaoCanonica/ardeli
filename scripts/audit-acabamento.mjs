// audit-acabamento: o que o olho pega e o axe não.
//   - verbete: palavra e classe na mesma linha de base (o fio, um ::after, é conferido
//     nas capturas);
//   - órfã: última linha de parágrafo/título com UMA palavra (390 e 1440);
//   - foto: proporção desenhada = proporção do arquivo (sem esticar) ou object-fit cover;
//   - texto cortado: elemento de texto que transborda a própria caixa.
// Uso: BASE=http://localhost:4330 pnpm audit-acabamento
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4330';
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
const falhas = [];
const avisos = [];
let verbetes = 0;
let blocos = 0;
let fotos = 0;
const b = await chromium.launch();

for (const largura of [390, 1440]) {
  for (const rota of ROTAS) {
    const p = await b.newPage({
      viewport: { width: largura, height: 900 },
      reducedMotion: 'reduce',
    });
    await p.goto(`${BASE}${rota}`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    const r = await p.evaluate(() => {
      const out = { verbetes: [], orfas: [], fotos: [], cortados: [], blocos: 0 };
      // Linha de base exata: sonda inline-block de altura 0 (fica na linha de base).
      const base = (el) => {
        const sonda = document.createElement('span');
        sonda.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        el.appendChild(sonda);
        const y = sonda.getBoundingClientRect().top;
        sonda.remove();
        return y;
      };
      for (const v of document.querySelectorAll('.verbete')) {
        const palavra = v.querySelector('.verbete__palavra');
        const classe = v.querySelector('.verbete__classe');
        // O fio é um ::after da cabeça (sem caixa no DOM): conferido nas capturas.
        const fio = null;
        if (!palavra || !classe || !palavra.checkVisibility()) continue;
        const bp = base(palavra);
        const bc = base(classe);
        const fs = parseFloat(getComputedStyle(palavra).fontSize);
        const mesmaLinha =
          Math.abs(classe.getBoundingClientRect().top - palavra.getBoundingClientRect().top) < fs;
        out.verbetes.push({
          id: v.id || palavra.textContent.trim(),
          delta: bp !== null && bc !== null && mesmaLinha ? Math.round((bc - bp) * 10) / 10 : null,
          fio:
            fio && mesmaLinha ? Math.round((fio.getBoundingClientRect().top - bp) * 10) / 10 : null,
          quebrou: !mesmaLinha,
        });
      }
      // Órfã: última linha com uma palavra (só blocos com 4+ palavras).
      for (const el of document.querySelectorAll(
        'main p, main li, main h1, main h2, main h3, main dd, main figcaption',
      )) {
        if (
          !el.checkVisibility() ||
          el.closest('.visualmente-oculto, [aria-hidden="true"], .verbete__classe')
        )
          continue;
        const texto = el.textContent.trim();
        const palavras = texto.split(/\s+/);
        if (palavras.length < 4) continue;
        out.blocos++;
        // Órfã = a última palavra começa uma linha nova sozinha.
        const nos = [];
        const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
          acceptNode: (n) =>
            n.parentElement?.closest('script, style, .visualmente-oculto, [hidden]')
              ? NodeFilter.FILTER_REJECT
              : NodeFilter.FILTER_ACCEPT,
        });
        for (let n = tw.nextNode(); n; n = tw.nextNode()) nos.push(n);
        const palavrasPos = [];
        for (const n of nos)
          for (const m of n.data.matchAll(/\S+/g))
            palavrasPos.push([n, m.index, m.index + m[0].length]);
        if (palavrasPos.length < 4) continue;
        const caixa = ([n, a, z]) => {
          const r = document.createRange();
          r.setStart(n, a);
          r.setEnd(n, z);
          const rs = [...r.getClientRects()];
          return rs[0];
        };
        const ult = caixa(palavrasPos.at(-1));
        const pen = caixa(palavrasPos.at(-2));
        if (ult && pen && ult.top > pen.bottom - 2)
          out.orfas.push(`${el.tagName.toLowerCase()}: “…${texto.slice(-45)}”`);
      }
      for (const img of document.querySelectorAll('main img')) {
        if (!img.checkVisibility() || !img.naturalWidth) continue;
        const r = img.getBoundingClientRect();
        const s = getComputedStyle(img);
        const desenhada = r.width / r.height;
        const arquivo = img.naturalWidth / img.naturalHeight;
        if (
          s.objectFit !== 'cover' &&
          s.objectFit !== 'contain' &&
          Math.abs(desenhada / arquivo - 1) > 0.02
        )
          out.fotos.push(
            `${img.currentSrc.split('/').pop()} esticada (${desenhada.toFixed(2)} vs ${arquivo.toFixed(2)})`,
          );
        else out.fotos.push(null);
      }
      for (const el of document.querySelectorAll('main *')) {
        if (!el.checkVisibility() || el.closest('.visualmente-oculto')) continue;
        const s = getComputedStyle(el);
        if (!/(hidden|clip)/.test(s.overflowX + s.overflowY) || !el.textContent.trim()) continue;
        if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2)
          if (
            !['VIDEO', 'IMG', 'PICTURE', 'DETAILS', 'DIALOG'].includes(el.tagName) &&
            s.position !== 'absolute'
          )
            out.cortados.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
      }
      return out;
    });
    blocos += r.blocos;
    for (const v of r.verbetes) {
      verbetes++;
      if (v.quebrou)
        avisos.push(`verbete ${v.id} em ${rota} @${largura}: classe desceu para a linha de baixo`);
      else if (v.delta !== null && Math.abs(v.delta) > 1)
        falhas.push(
          `verbete ${v.id} em ${rota} @${largura}: classe ${v.delta} px fora da linha de base da palavra`,
        );
    }
    globalThis.__fios ??= [];
    for (const v of r.verbetes) if (v.fio !== null) globalThis.__fios.push({ largura, rota, ...v });
    for (const o of r.orfas) falhas.push(`órfã em ${rota} @${largura}: ${o}`);
    for (const f of r.fotos) {
      fotos++;
      if (f) falhas.push(`foto em ${rota} @${largura}: ${f}`);
    }
    for (const c of r.cortados) falhas.push(`texto cortado em ${rota} @${largura}: ${c}`);
    await p.close();
  }
}

// Fio: mesma distância da linha de base (relativa) em todas as páginas, por largura.
for (const largura of [390, 1440]) {
  const fios = (globalThis.__fios ?? []).filter((f) => f.largura === largura).map((f) => f.fio);
  if (fios.length) {
    const media = fios.reduce((a, x) => a + x, 0) / fios.length;
    const desvio = Math.max(...fios.map((x) => Math.abs(x - media)));
    if (desvio > 4)
      falhas.push(`fio do verbete @${largura}: varia até ${desvio.toFixed(1)} px entre páginas`);
    console.log(
      `fio do verbete @${largura}: ${fios.length} medidas, desvio máx. ${desvio.toFixed(1)} px`,
    );
  }
}
await b.close();
for (const a of avisos) console.log(`  ⚠ ${a}`);
for (const f of falhas) console.log(`  ✖ ${f}`);
console.log(
  `${falhas.length ? '✖' : '✓'} acabamento: ${verbetes} verbetes, ${blocos} blocos de texto, ${fotos} fotos em ${ROTAS.length} rotas × 2 larguras; ${falhas.length} problema(s), ${avisos.length} aviso(s).`,
);
process.exit(falhas.length ? 1 : 0);
