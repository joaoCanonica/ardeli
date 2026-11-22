// Gera as folhas de contato dos stills (docs/dados/folha-de-contato-*.jpg)
// a partir dos PNG de trabalho em .cache/media/. Rode depois de `pnpm media:prepare`.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const cacheDir = join(raiz, '.cache', 'media');
const manifesto = JSON.parse(readFileSync(join(raiz, 'media.manifest.json'), 'utf8'));
const indice = JSON.parse(readFileSync(join(raiz, 'public/media/media-index.json'), 'utf8'));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const rotulo = (w, h, esq, dir = '') =>
  Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/>` +
      `<text x="4" y="${h - 7}" font-family="sans-serif" font-size="13" fill="#123048">${esc(esq)}</text>` +
      `<text x="${w - 4}" y="${h - 7}" font-family="sans-serif" font-size="13" fill="#434D58" text-anchor="end">${esc(dir)}</text></svg>`,
  );

async function cartao(arquivo, altura, esq, dir) {
  const img = await sharp(arquivo).resize({ height: altura }).toBuffer({ resolveWithObject: true });
  const w = img.info.width;
  return sharp({ create: { width: w, height: altura + 22, channels: 3, background: '#fff' } })
    .composite([
      { input: img.data, left: 0, top: 0 },
      { input: rotulo(w, 22, esq, dir), left: 0, top: altura },
    ])
    .png()
    .toBuffer({ resolveWithObject: true });
}

async function folha(cartoes, largura, destino) {
  const m = 8;
  let x = m;
  let y = m;
  let alturaLinha = 0;
  const comp = [];
  for (const c of cartoes) {
    if (x + c.info.width > largura - m) {
      x = m;
      y += alturaLinha + m;
      alturaLinha = 0;
    }
    comp.push({ input: c.data, left: x, top: y });
    x += c.info.width + m;
    alturaLinha = Math.max(alturaLinha, c.info.height);
  }
  await sharp({
    create: { width: largura, height: y + alturaLinha + m, channels: 3, background: '#fff' },
  })
    .composite(comp)
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(join(raiz, destino));
  console.log(`✓ ${destino}`);
}

const inteiros = [];
const recortes = [];
for (const s of manifesto.tour.stills) {
  const base = join(cacheDir, `still-${s.id}-9x16.png`);
  if (!existsSync(base)) throw new Error(`falta ${base}: rode pnpm media:prepare`);
  inteiros.push(await cartao(base, 420, s.id, `${indice.stills[s.id].t} s`));
  for (const nome of Object.keys(s.recortes ?? {})) {
    recortes.push(
      await cartao(
        join(cacheDir, `still-${s.id}-${nome}.png`),
        200,
        `${s.id} · ${nome.replace('x', '×')}`,
      ),
    );
  }
}
await folha(inteiros, 1500, 'docs/dados/folha-de-contato-stills.jpg');
await folha(recortes, 1500, 'docs/dados/folha-de-contato-recortes.jpg');
