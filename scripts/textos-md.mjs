// Gera docs/TEXTOS.md: todos os textos do site, com a fonte de cada frase, para revisão.
//   node scripts/textos-md.mjs
import { writeFileSync } from 'node:fs';
import { colherFrases, colherRotulos, FONTES, metas } from '../src/content/textos/index.ts';

const frases = colherFrases();
const grupos = new Map();
for (const fr of frases) {
  const topo = fr.onde.split('.').slice(0, 2).join(' › ');
  if (!grupos.has(topo)) grupos.set(topo, []);
  grupos.get(topo).push(fr);
}

let md = '# Textos do site — para revisão\n\n';
md += `Gerado por \`node scripts/textos-md.mjs\` a partir de \`src/content/textos\`. ${frases.length} frases, ${colherRotulos().length} rótulos.\n\n`;
md +=
  '- **[guardado]** = escrito, mas fora do site até a confirmação (ex.: SUS, duração da sessão) ou numa pergunta não publicada.\n';
md += '- Fontes entre colchetes; a lista completa está no fim.\n\n';
md +=
  '## Metas (title e description)\n\n| Página | Title (≤ 60) | Description (≤ 155) |\n|---|---|---|\n';
for (const [p, m] of Object.entries(metas()))
  md += `| ${p} | ${m.titulo} (${m.titulo.length}) | ${m.descricao} (${m.descricao.length}) |\n`;
for (const [g, lista] of grupos) {
  md += `\n## ${g}\n\n`;
  for (const fr of lista) {
    md += `- ${fr.publicavel ? '' : '**[guardado]** '}${fr.texto} <sub>[${fr.fontes.join(', ')}] · \`${fr.onde}\`</sub>\n`;
  }
}
md += '\n## Fontes\n\n';
for (const [id, d] of Object.entries(FONTES)) md += `- **${id}**: ${d}\n`;
writeFileSync(new URL('../docs/TEXTOS.md', import.meta.url), md);
console.log(`✓ docs/TEXTOS.md (${frases.length} frases)`);
