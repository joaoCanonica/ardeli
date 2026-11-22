// Capturas de tela por rota: 390 e 1440 px, cada uma em três modos
// (padrão, reduced-motion e zoom 200%). Sobe o `astro preview` sobre o dist/.
//
// Uso:
//   pnpm capturar                      # todas as rotas do dist/
//   pnpm capturar -- / /convenios      # só estas rotas
//   pnpm capturar -- --rotulo antes    # pasta docs/capturas/<data>-antes
//   pnpm capturar -- --escala 2        # deviceScaleFactor (padrão 1)
//   pnpm capturar -- --build           # roda o build antes
//
// Zoom 200% = mesma largura em pixels da imagem, com metade da largura em CSS
// (como o zoom do navegador faz), deviceScaleFactor dobrado.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const dist = join(raiz, 'dist');
const PORTA = Number(process.env.PORTA_CAPTURA ?? 4329);
const LARGURAS = [390, 1440];
const MODOS = ['padrao', 'reduced-motion', 'zoom200'];

const args = process.argv.slice(2).filter((a) => a !== '--');
const opcao = (nome) => {
  const i = args.indexOf(nome);
  if (i === -1) return undefined;
  const valor = args[i + 1];
  args.splice(i, 2);
  return valor;
};
const flag = (nome) => {
  const i = args.indexOf(nome);
  if (i === -1) return false;
  args.splice(i, 1);
  return true;
};

const rotulo = opcao('--rotulo');
const escala = Number(opcao('--escala') ?? 1);
const fazerBuild = flag('--build');

if (fazerBuild || !existsSync(dist)) {
  console.log('→ build');
  const r = spawnSync('pnpm', ['build'], { cwd: raiz, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function rotasDoDist(dir = dist) {
  const rotas = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      if (nome.startsWith('_') || nome === 'media') continue;
      rotas.push(...rotasDoDist(caminho));
    } else if (nome === 'index.html') {
      const rel = relative(dist, dir).split(sep).join('/');
      rotas.push(rel ? `/${rel}/` : '/');
    }
  }
  return rotas.sort();
}

const rotas = args.length ? args : rotasDoDist();
const data = new Date().toISOString().slice(0, 10);
const pasta = join(raiz, 'docs', 'capturas', rotulo ? `${data}-${rotulo}` : data);
mkdirSync(pasta, { recursive: true });

const base = `http://localhost:${PORTA}`;
const servidor = spawn('pnpm', ['exec', 'astro', 'preview', '--port', String(PORTA)], {
  cwd: raiz,
  stdio: ['ignore', 'pipe', 'pipe'],
});

async function esperarServidor(tentativas = 60) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(base);
      if (r.ok || r.status === 404) return;
    } catch {
      /* ainda subindo */
    }
    await new Promise((ok) => setTimeout(ok, 250));
  }
  throw new Error(`preview não respondeu em ${base}`);
}

const nomeArquivo = (rota) =>
  rota === '/' ? 'inicio' : rota.replace(/^\/|\/$/g, '').replace(/\//g, '__');

const avisos = [];
let codigo = 0;

try {
  await esperarServidor();
  const navegador = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  );

  for (const largura of LARGURAS) {
    for (const modo of MODOS) {
      const zoom = modo === 'zoom200';
      const contexto = await navegador.newContext({
        viewport: { width: zoom ? largura / 2 : largura, height: largura < 800 ? 844 : 900 },
        deviceScaleFactor: zoom ? escala * 2 : escala,
        reducedMotion: modo === 'reduced-motion' ? 'reduce' : 'no-preference',
        locale: 'pt-BR',
      });
      const pagina = await contexto.newPage();
      for (const rota of rotas) {
        const resposta = await pagina.goto(base + rota, { waitUntil: 'networkidle' });
        if (!resposta || !resposta.ok()) {
          avisos.push(`${rota}: HTTP ${resposta?.status() ?? '?'}`);
          codigo = 1;
          continue;
        }
        await pagina.evaluate(() => document.fonts.ready);
        const transborda = await pagina.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        );
        if (transborda) avisos.push(`${rota} ${largura} ${modo}: rolagem horizontal`);
        const arquivo = join(pasta, `${nomeArquivo(rota)}-${largura}-${modo}.png`);
        await pagina.screenshot({ path: arquivo, fullPage: true });
        console.log(`✓ ${relative(raiz, arquivo)}`);
      }
      await contexto.close();
    }
  }
  await navegador.close();
} catch (erro) {
  console.error('✖', erro instanceof Error ? erro.message : erro);
  codigo = 1;
} finally {
  servidor.kill();
}

if (avisos.length) {
  console.log('\nAvisos:');
  for (const a of avisos) console.log(`  • ${a}`);
}
process.exit(codigo);
