// Otimiza os SVG da marca (media-originais/marca) para uso inline em
// src/components/marca/svg/, e gera favicon e apple-touch-icon a partir do símbolo.
// Conservador: mesma precisão do original (1 casa decimal), ids preservados
// (#arco, #figura, #letra-a, #palavra, #descritor), viewBox preservado.
// Confere cada arquivo rasterizando original e otimizado (diferença máxima de pixel).
//
//   node scripts/otimizar-marca.mjs

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { optimize } from 'svgo';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const origem = join(raiz, 'media-originais/marca');
const destino = join(raiz, 'src/components/marca/svg');
mkdirSync(destino, { recursive: true });

const config = {
  multipass: true,
  floatPrecision: 1,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: false, // ids nomeados são API da marca
          convertPathData: { floatPrecision: 1, transformPrecision: 4, makeArcs: false },
          convertShapeToPath: false,
          mergePaths: false, // mantém #arco, #figura etc. separados
          collapseGroups: false,
          removeUnknownsAndDefaults: { keepRoleAttr: true, keepAriaAttrs: true },
        },
      },
    },
    'removeXMLNS',
    { name: 'removeAttrs', params: { attrs: ['xmlns:c2pa'] } },
  ],
};

async function diferenca(a, b) {
  const r = async (svg) =>
    sharp(Buffer.from(svg), { density: 300 })
      .resize({ width: 1200 })
      .flatten({ background: '#808080' })
      .raw()
      .toBuffer();
  const [x, y] = await Promise.all([r(a), r(b)]);
  let max = 0;
  let soma = 0;
  for (let i = 0; i < x.length; i++) {
    const d = Math.abs(x[i] - y[i]);
    soma += d;
    if (d > max) max = d;
  }
  return { max, media: soma / x.length };
}

let antes = 0;
let depois = 0;
for (const arq of readdirSync(origem)
  .filter((f) => f.endsWith('.svg'))
  .sort()) {
  const bruto = readFileSync(join(origem, arq), 'utf8');
  const { data } = optimize(bruto, config);
  // Para inline: sem <title> próprio (o componente põe o rótulo acessível).
  const limpo = data
    .replace(/<title[^>]*>.*?<\/title>/s, '')
    .replace(/ aria-labelledby="t"/, '')
    .replace(/ role="img"/, '');
  const comNs = limpo.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  const d = await diferenca(bruto, comNs);
  writeFileSync(join(destino, arq), limpo);
  antes += bruto.length;
  depois += limpo.length;
  console.log(
    `${arq.padEnd(32)} ${(bruto.length / 1024).toFixed(1).padStart(6)} KB → ${(limpo.length / 1024).toFixed(1).padStart(6)} KB · dif. pixel máx ${d.max}, média ${d.media.toFixed(3)}`,
  );
  if (d.media > 0.5) throw new Error(`${arq}: otimização mudou o desenho (média ${d.media})`);
}
console.log(`total ${(antes / 1024).toFixed(0)} KB → ${(depois / 1024).toFixed(0)} KB`);

// Favicon (SVG) e apple-touch-icon (PNG 180, fundo Linho com respiro).
const simbolo = readFileSync(join(destino, 'ardeli-simbolo.svg'), 'utf8').replace(
  '<svg ',
  '<svg xmlns="http://www.w3.org/2000/svg" ',
);
writeFileSync(join(raiz, 'public/favicon.svg'), simbolo);
const marca = await sharp(Buffer.from(simbolo), { density: 600 })
  .resize({ width: 132, height: 132, fit: 'contain', background: '#F8F6F100' })
  .png()
  .toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: '#F8F6F1' } })
  .composite([{ input: marca, gravity: 'center' }])
  .png()
  .toFile(join(raiz, 'public/apple-touch-icon.png'));
const ico = await sharp(Buffer.from(simbolo), { density: 600 })
  .resize({ width: 32, height: 32, fit: 'contain', background: '#F8F6F100' })
  .png()
  .toBuffer();
writeFileSync(join(raiz, 'public/favicon-32.png'), ico);
console.log('✓ public/favicon.svg, public/favicon-32.png, public/apple-touch-icon.png');
