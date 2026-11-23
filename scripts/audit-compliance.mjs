// Varre o HTML publicado (dist/) atrás do que o COFFITO e o CLAUDE.md proíbem.
// Rode depois do build. Falha (código 1) em qualquer modo para conteúdo proibido;
// CREFITO ausente no rodapé falha em produção e é aviso no preview.
//
//   pnpm build && pnpm audit-compliance
//   ARDELI_MODO=producao pnpm audit-compliance

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encontrarTermosVetados, normalizar } from '../src/config/termos.ts';
import { modoAtual } from '../src/config/travas.ts';
import { convenios } from '../src/content/dados/convenios.ts';
import { profissionais } from '../src/content/dados/profissionais.ts';
import { colherFrases, colherRotulos } from '../src/content/textos/index.ts';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const dist = resolve(raiz, process.env.ARDELI_DIST ?? 'dist');
const modo = modoAtual();

if (!existsSync(dist)) {
  console.error('✖ dist/ não existe: rode pnpm build antes.');
  process.exit(1);
}

const paginas = [];
(function listar(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) listar(p);
    else if (n.endsWith('.html')) paginas.push(p);
  }
})(dist);

const indiceMidia = existsSync(join(raiz, 'public/media/media-index.json'))
  ? JSON.parse(readFileSync(join(raiz, 'public/media/media-index.json'), 'utf8'))
  : { imagens: {}, videos: {} };
const midiaPublicada = new Set(['/media/media-index.json', '/media/video/tour-capitulos.vtt']);
for (const img of Object.values(indiceMidia.imagens)) {
  for (const v of img.variantes) {
    midiaPublicada.add(v.avif);
    midiaPublicada.add(v.webp);
  }
}
for (const v of Object.values(indiceMidia.videos)) {
  midiaPublicada.add(v.mp4);
  midiaPublicada.add(v.webm);
}

const titulos = profissionais.flatMap((p) => p.titulosReconhecidos.map((t) => t.titulo));
const sus = convenios.find((c) => c.id === 'sus');
const susConfirmado = sus?.atende.estado === 'confirmado';

const entidades = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ldquo: '“',
  rdquo: '”',
};
function texto(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (m, e) => {
      if (e[0] === '#')
        return String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
      return entidades[e] ?? m;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

const falhas = [];
const avisos = [];
const falha = (pagina, msg) => falhas.push(`${pagina}: ${msg}`);
const avisa = (pagina, msg) => avisos.push(`${pagina}: ${msg}`);

// 0. Textos de src/content (antes de virarem página): mesmas regras.
const citacaoComNomeTexto =
  /["“”«][^"“”«»]{12,400}["”»]\s*[—–-]\s*(?:\p{Lu}[\p{Ll}.]+)(?:\s+\p{Lu}[\p{Ll}.]*){0,3}/u;
let frasesConteudo = 0;
const mencoesSus = [];
const todasFrases = colherFrases();
for (const fr of todasFrases) {
  frasesConteudo++;
  const onde = `conteúdo:${fr.onde}`;
  for (const o of encontrarTermosVetados(fr.texto, titulos)) {
    falha(onde, `termo vetado "${o.termo}" (${o.motivo}) → "…${o.trecho}…"`);
  }
  if (citacaoComNomeTexto.test(fr.texto))
    falha(onde, 'citação seguida de nome (padrão de depoimento)');
  if (!susConfirmado && fr.publicavel && /\bSUS\b/.test(fr.texto)) mencoesSus.push(fr);
}
// SUS sem confirmação: frase publicável que cita o SUS só passa se o mesmo bloco
// (mesmo item) tiver "Consulte a disponibilidade" — igual à regra do HTML.
const bloco = (onde) => onde.split('.').slice(0, -2).join('.');
for (const fr of mencoesSus) {
  const vizinhas = todasFrases.filter((x) => x.publicavel && bloco(x.onde) === bloco(fr.onde));
  if (!vizinhas.some((x) => /consulte a disponibilidade/i.test(x.texto))) {
    falha(
      `conteúdo:${fr.onde}`,
      `SUS mencionado sem "Consulte a disponibilidade" no mesmo bloco → "${fr.texto}"`,
    );
  }
}
for (const r of colherRotulos()) {
  for (const o of encontrarTermosVetados(r.texto, titulos)) {
    falha(`conteúdo:${r.onde}`, `termo vetado "${o.termo}" → "${r.texto}"`);
  }
}

for (const arquivo of paginas) {
  const rota =
    '/' +
    relative(dist, arquivo)
      .replace(/index\.html$/, '')
      .replace(/\\/g, '/');
  const html = readFileSync(arquivo, 'utf8');
  const t = texto(html);
  const tn = normalizar(t);

  // 1. Termos vetados (inclui o texto de atributos alt/title/aria-label e meta description).
  const atributos = [...html.matchAll(/\b(?:alt|title|aria-label|content)="([^"]*)"/gi)].map(
    (m) => m[1],
  );
  for (const o of encontrarTermosVetados(`${t} ${atributos.join(' ')}`, titulos)) {
    falha(rota, `termo vetado "${o.termo}" (${o.motivo}) → "…${o.trecho}…"`);
  }

  // 2. Depoimento / avaliação de paciente (Art. 10, V).
  if (/<blockquote\b/i.test(html)) falha(rota, '<blockquote> (padrão de depoimento)');
  if (
    /"@type"\s*:\s*"(Review|AggregateRating)"|"(review|aggregateRating|reviewRating)"\s*:/i.test(
      html,
    )
  ) {
    falha(rota, 'JSON-LD de avaliação (Review/AggregateRating)');
  }
  if (/[★⭐]/u.test(t)) falha(rota, 'estrelas de avaliação');
  const citacaoComNome =
    /["“”«][^"“”«»]{12,400}["”»]\s*[—–-]\s*(?:\p{Lu}[\p{Ll}.]+)(?:\s+\p{Lu}[\p{Ll}.]*){0,3}/gu;
  for (const m of t.matchAll(citacaoComNome)) {
    falha(rota, `citação seguida de nome (padrão de depoimento) → "${m[0].slice(0, 90)}…"`);
  }

  // 3. SUS sem confirmação: toda menção precisa vir com "consulte a disponibilidade" e nada afirmativo.
  if (!susConfirmado) {
    const afirma =
      /(atend\w*|aceit\w*|credenciad\w*|conveniad\w*)\s+(?:(?:pelo|o|ao|com o|no)\s+)?sus\b|\bsus\s*(?:\(|:)?\s*(?:atendemos|aceito|aceitamos)/gi;
    for (const m of tn.matchAll(afirma))
      falha(rota, `afirma atendimento SUS sem confirmação → "${m[0]}"`);
    for (const m of tn.matchAll(/\bsus\b/g)) {
      const janela = tn.slice(Math.max(0, m.index - 300), m.index + 300);
      if (!janela.includes('consulte a disponibilidade')) {
        falha(
          rota,
          `menção ao SUS sem "Consulte a disponibilidade" por perto → "…${tn.slice(Math.max(0, m.index - 50), m.index + 50)}…"`,
        );
      }
    }
  }

  // 4. Rodapé com nome, "Fisioterapeuta" e CREFITO-10 de cada profissional (Art. 48).
  const rodape = html.match(/<footer\b[\s\S]*?<\/footer>/i);
  const relatar = modo === 'producao' ? falha : avisa;
  if (!rodape) {
    relatar(rota, 'sem <footer> (CREFITO no rodapé, Art. 48)');
  } else {
    const r = texto(rodape[0]);
    for (const p of profissionais) {
      const numero = p.crefito.estado === 'confirmado' ? p.crefito.valor : null;
      if (!numero) {
        relatar(rota, `rodapé: CREFITO-10 de ${p.nome} pendente`);
        continue;
      }
      if (
        !r.includes(p.nome) ||
        !r.includes('Fisioterapeuta') ||
        !new RegExp(`CREFITO-10 (nº )?${numero.replace(/[-]/g, '\\-')}`).test(r)
      ) {
        relatar(rota, `rodapé sem "${p.nome} · Fisioterapeuta · CREFITO-10 ${numero}"`);
      }
    }
  }

  // 5. Preview sempre fora do índice.
  if (modo === 'preview' && !/<meta[^>]+name="robots"[^>]+noindex/i.test(html)) {
    falha(rota, 'preview sem <meta name="robots" content="noindex">');
  }

  // 6. Toda mídia referenciada saiu do media:prepare (nada naoUsar ou com pessoa).
  for (const m of html.matchAll(/(?:src|srcset|poster|href)="([^"]*\/media\/[^"]*)"/gi)) {
    for (const url of m[1].split(',').map((s) => s.trim().split(/\s+/)[0])) {
      if (url.startsWith('/media/') && !midiaPublicada.has(url)) {
        falha(rota, `mídia fora do media-index (possível naoUsar ou original): ${url}`);
      }
    }
  }
}

console.log(
  `audit-compliance — modo: ${modo} · ${paginas.length} página(s) · ${frasesConteudo} frases de src/content\n`,
);
for (const a of avisos) console.log(`  ! ${a}`);
for (const f of falhas) console.log(`  ✖ ${f}`);
if (falhas.length) {
  console.error(`\n✖ ${falhas.length} problema(s) de conformidade.`);
  process.exit(1);
}
console.log(
  `\n✓ sem termo vetado, depoimento, SUS afirmado ou mídia fora do índice${avisos.length ? ` (${avisos.length} aviso(s))` : ''}.`,
);
