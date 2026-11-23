// Valida o JSON-LD das páginas indexáveis no validator.schema.org (online).
// Envia SÓ os blocos JSON-LD (dado público do site), numa requisição só (o serviço
// limita a frequência). Sem domínio, os caminhos relativos viram
// https://dominio-pendente.invalid/... só para a validação (o site não muda).
// Uso: pnpm build && pnpm validar-schema
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { dominio } from '../src/lib/seo/site.ts';
import { raiz } from './lib/og.mjs';

const dist = join(raiz, 'dist');
const base = dominio() ?? 'https://dominio-pendente.invalid';
const paginas = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return n.startsWith('_') || n === 'avaliar' ? [] : paginas(p);
    return n === 'index.html' ? [p] : [];
  });

const blocos = paginas(dist).map((arq) => {
  const json = readFileSync(arq, 'utf8').match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
  const rota = `/${relative(dist, arq).replace(/index\.html$/, '')}`;
  return { rota, json: (json ?? '').replace(/"\/(?!\/)/g, `"${base}/`) };
});
const html = `<!doctype html><html><head>${blocos
  .map((b) => `<script type="application/ld+json">${b.json}</script>`)
  .join('\n')}</head></html>`;

let resposta = '';
for (let tentativa = 1; tentativa <= 3; tentativa++) {
  resposta = execFileSync(
    'curl',
    [
      '-sS',
      '-m',
      '90',
      '-X',
      'POST',
      'https://validator.schema.org/validate',
      '--data-urlencode',
      'html@-',
    ],
    { input: html, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
  );
  if (resposta.startsWith(")]}'")) break;
  console.log(`(tentativa ${tentativa}: o serviço pediu para esperar; nova tentativa em 60 s)`);
  await new Promise((ok) => setTimeout(ok, 60_000));
}
if (!resposta.startsWith(")]}'")) {
  console.error('✖ validator.schema.org não respondeu (limite de frequência). Tente mais tarde.');
  process.exit(2);
}
const json = JSON.parse(resposta.replace(/^\)\]\}'\n/, ''));
const problemas = [];
const andar = (x, onde) => {
  if (Array.isArray(x)) return x.forEach((i) => andar(i, onde));
  if (!x || typeof x !== 'object') return;
  for (const e of x.errors ?? [])
    problemas.push({
      grave: !!e.isSevere,
      msg: `${e.errorType} ${(e.args ?? []).join(' ')}`,
      onde,
    });
  for (const [k, v] of Object.entries(x)) if (k !== 'errors') andar(v, x.typeGroup ?? onde);
};
andar(json.tripleGroups ?? [], '');
const grupos = (json.tripleGroups ?? []).flatMap((g) => g.nodes ?? []).map((n) => n.typeGroup);
const contagem = grupos.reduce((m, t) => m.set(t, (m.get(t) ?? 0) + 1), new Map());
console.log(`Páginas: ${blocos.map((b) => b.rota).join(' ')}`);
console.log(`Objetos: ${[...contagem].map(([t, n]) => `${t} ×${n}`).join(' · ')}`);
for (const p of problemas) console.log(`  ${p.grave ? '✖ ERRO' : '⚠ aviso'} ${p.msg} (${p.onde})`);
const erros = problemas.filter((p) => p.grave).length;
console.log(
  `${erros ? '✖' : '✓'} validator.schema.org: ${erros} erro(s), ${problemas.length - erros} aviso(s) em ${json.numObjects ?? grupos.length} objetos.`,
);
process.exit(erros ? 1 : 0);
