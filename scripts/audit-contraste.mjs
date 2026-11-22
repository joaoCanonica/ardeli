// Contraste dos tokens por uso (WCAG 2.2) + varredura do CSS atrás de usos vetados.
// Texto principal: AAA (7:1). Links e botões: AA (4,5:1). Bordas e foco: 3:1.
// Falha se: um par obrigatório reprova; um par "proibido" é usado no CSS;
// Tijolo/Madeira aparecem fora do fio de ambiente.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MINIMO,
  avaliar,
  avaliarVeu,
  paresObrigatorios,
  paresProibidos,
  tokens,
} from '../src/styles/contraste.ts';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const t = tokens();
const linha = (r) =>
  `  ${r.passa ? '✓' : '✖'} ${r.razao.toFixed(2).padStart(5)}:1 (mín. ${MINIMO[r.nivel]}:1, ${r.nivel.padEnd(10)}) ${r.uso} — ${r.texto} ${r.hexTexto} sobre ${r.fundo} ${r.hexFundo}`;

let falhas = 0;
console.log('audit-contraste\n\nPARES EM USO');
for (const p of [...paresObrigatorios.map((p) => avaliar(p, t)), avaliarVeu(undefined, t)]) {
  console.log(linha(p));
  if (!p.passa) falhas++;
}

console.log('\nPARES PROIBIDOS (reprovados ou vetados por regra)');
for (const p of paresProibidos) {
  const r = avaliar(p, t);
  console.log(`${linha(r).replace(r.passa ? '✓' : '✖', '⊘')}  → ${p.motivo}`);
}

// Varredura do CSS (arquivos .css e <style> de .astro).
// Sálvia em `color` só passa com o comentário `/* sálvia: grafismo */` na linha
// (ex.: símbolo SVG em currentColor), nunca em texto.
const vetos = [
  { re: /(?<![\w-])color:\s*var\(--cor-salvia\)/g, msg: 'Sálvia como cor de texto' },
  {
    re: /(?<![\w-])color:\s*var\(--cor-(tijolo|madeira)\)/g,
    msg: 'Tijolo/Madeira como cor de texto',
  },
  {
    re: /background(-color)?:\s*var\(--cor-(tijolo|madeira)\)/g,
    msg: 'Tijolo/Madeira chapado (fundo)',
  },
  { re: /(fill|stroke):\s*var\(--cor-(tijolo|madeira)\)/g, msg: 'Tijolo/Madeira em ícone' },
  { re: /(linear|radial|conic)-gradient\(/g, msg: 'gradiente (CLAUDE.md §8)' },
];
const arquivos = [];
(function listar(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) listar(p);
    else if (/\.(css|astro)$/.test(n)) arquivos.push(p);
  }
})(join(raiz, 'src'));
const usos = [];
for (const a of arquivos) {
  const txt = readFileSync(a, 'utf8');
  for (const { re, msg } of vetos) {
    for (const m of txt.matchAll(re)) {
      const ln = txt.slice(0, m.index).split('\n').length;
      // Exceção explícita: Sálvia pintando grafismo SVG (currentColor), marcada na linha.
      if (msg.startsWith('Sálvia') && (txt.split('\n')[ln - 1] ?? '').includes('sálvia: grafismo'))
        continue;
      usos.push(`${relative(raiz, a)}:${ln} ${msg} → ${m[0]}`);
    }
  }
}
console.log(`\nCSS (${arquivos.length} arquivos)`);
if (usos.length) for (const u of usos) console.log(`  ✖ ${u}`);
else console.log('  ✓ nenhum uso vetado (Sálvia em texto, Tijolo/Madeira chapados, gradiente)');

falhas += usos.length;
if (falhas) {
  console.error(`\n✖ ${falhas} problema(s) de contraste/uso de cor.`);
  process.exit(1);
}
console.log('\n✓ contraste verde.');
