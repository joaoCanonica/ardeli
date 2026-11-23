// Serve dist/ como a Vercel serviria: cabeçalhos e rewrites do vercel.json, barra final,
// 404.html, brotli/gzip. Para medir (Lighthouse) e testar CSP/cabeçalhos localmente.
// Uso: pnpm servir [--porta 4330] [--host-preview]  (--host-preview simula *.vercel.app)
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { createBrotliCompress, createGzip } from 'node:zlib';
import { raiz } from './lib/og.mjs';

const args = process.argv.slice(2);
const porta = Number(args.includes('--porta') ? args[args.indexOf('--porta') + 1] : 4330);
const hostPreview = args.includes('--host-preview');
const dist = join(raiz, 'dist');
const config = JSON.parse(readFileSync(join(raiz, 'vercel.json'), 'utf8'));

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.vtt': 'text/vtt; charset=utf-8',
  '.ico': 'image/x-icon',
};
const COMPRIMIVEL = /^(text\/|application\/(json|xml|javascript)|image\/svg)/;

// "source" da Vercel (path-to-regexp simplificado: só os padrões usados no vercel.json).
const paraRegex = (src) => new RegExp(`^${src.replace(/\(\.\*\)/g, '(.*)')}$`);
const hostRegex = (v) => new RegExp(`^${v.replace(/\(\?<\w+>/g, '(')}$`);

function cabecalhosPara(caminho, host) {
  const h = {};
  for (const regra of config.headers ?? []) {
    if (!paraRegex(regra.source).test(caminho)) continue;
    if (regra.has?.some((c) => c.type === 'host' && !hostRegex(c.value).test(host))) continue;
    for (const { key, value } of regra.headers) h[key] = value;
  }
  return h;
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://x');
  let caminho = decodeURIComponent(url.pathname);
  const host = hostPreview ? 'ardeli-preview.vercel.app' : (req.headers.host ?? 'localhost');
  if ((config.rewrites ?? []).some((r) => r.source === caminho)) {
    res.writeHead(204).end(); // /api/event: não sai para o Plausible no teste local
    return;
  }
  let arquivo = normalize(join(dist, caminho));
  if (!arquivo.startsWith(dist)) return res.writeHead(403).end();
  if (existsSync(arquivo) && statSync(arquivo).isDirectory()) {
    if (config.trailingSlash && !caminho.endsWith('/')) {
      res.writeHead(308, { Location: `${caminho}/${url.search}` }).end();
      return;
    }
    arquivo = join(arquivo, 'index.html');
  }
  let status = 200;
  if (!existsSync(arquivo)) {
    status = 404;
    arquivo = join(dist, '404.html');
    caminho = '/404.html';
  }
  const tipo = TIPOS[extname(arquivo)] ?? 'application/octet-stream';
  const cab = { 'Content-Type': tipo, ...cabecalhosPara(caminho, host) };
  if (!cab['Cache-Control']) cab['Cache-Control'] = 'public, max-age=0, must-revalidate'; // padrão da Vercel para HTML
  const aceita = String(req.headers['accept-encoding'] ?? '');
  let corpo = createReadStream(arquivo);
  if (COMPRIMIVEL.test(tipo) && /\bbr\b/.test(aceita)) {
    cab['Content-Encoding'] = 'br';
    corpo = corpo.pipe(createBrotliCompress());
  } else if (COMPRIMIVEL.test(tipo) && /gzip/.test(aceita)) {
    cab['Content-Encoding'] = 'gzip';
    corpo = corpo.pipe(createGzip());
  } else cab['Content-Length'] = statSync(arquivo).size;
  cab.Vary = 'Accept-Encoding';
  res.writeHead(status, cab);
  if (req.method === 'HEAD') return res.end();
  corpo.pipe(res);
}).listen(porta, () =>
  console.log(`dist/ em http://localhost:${porta}${hostPreview ? ' (host de preview)' : ''}`),
);
