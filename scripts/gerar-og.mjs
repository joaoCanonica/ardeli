// Gera public/og/ardeli-1200x630.jpg: still real da fachada (sem upscaling), logo
// horizontal, "Fisioterapia no Brusque, Lages/SC" e as linhas do Art. 48.
// Uso: pnpm og (requer pnpm media:prepare antes). Regerar quando mudar o CREFITO.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { ARQUIVOS_OG, entradaOg, hashOg, raiz } from './lib/og.mjs';

const e = entradaOg();
const b64 = (arq) => readFileSync(arq).toString('base64');
const logo = readFileSync(ARQUIVOS_OG.logo, 'utf8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@font-face{font-family:Serifa;src:url(data:font/woff2;base64,${b64(ARQUIVOS_OG.serifa)}) format('woff2');font-weight:400 600}
@font-face{font-family:Sans;src:url(data:font/woff2;base64,${b64(ARQUIVOS_OG.sans)}) format('woff2');font-weight:400 700}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;display:grid;grid-template-columns:504px 1fr;background:#F8F6F1;color:#123048;font-family:Sans}
.foto{width:504px;height:630px;object-fit:cover;display:block}
.lado{display:flex;flex-direction:column;justify-content:space-between;padding:56px 60px 44px}
.logo svg{width:330px;height:auto;display:block}
h1{font-family:Serifa;font-weight:500;font-size:70px;line-height:1.02;letter-spacing:-.01em;margin-top:44px}
.formas{margin-top:22px;font-size:27px;font-weight:700;color:#123048}
.horario{margin-top:6px;font-size:24px;color:#434D58}
.art48{border-top:2px solid #7B8261;padding-top:14px;font-size:17px;line-height:1.45;color:#434D58}
</style></head><body>
<img class="foto" src="data:image/webp;base64,${b64(ARQUIVOS_OG.foto)}" alt="">
<div class="lado">
  <div>
    <div class="logo">${logo}</div>
    <h1>${esc(e.titulo)}</h1>
    <p class="formas">${esc(e.formas)}</p>
    <p class="horario">${esc(e.horario)}</p>
  </div>
  <div class="art48">${[...e.profissionais, e.empresa].map((l) => `<div>${esc(l)}</div>`).join('')}</div>
</div></body></html>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.setContent(html, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
const png = await p.screenshot({ type: 'png' });
await b.close();

const saida = join(raiz, 'public', e.saida);
mkdirSync(dirname(saida), { recursive: true });
await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toFile(saida);
writeFileSync(
  saida.replace(/\.jpg$/, '.json'),
  `${JSON.stringify({ hash: hashOg(), entrada: e }, null, 2)}\n`,
);
console.log(`✓ ${e.saida} (1200×630) · hash ${hashOg()}`);
