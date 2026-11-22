// Prepara a mídia publicável a partir de media-originais/ e do media.manifest.json.
// Saída em public/media/ (fora do git). Idempotente: cada tarefa tem um hash
// (arquivo de origem + parâmetros + versão do script). Se o hash e os arquivos
// já existem, a tarefa é pulada.
//
//   pnpm media:prepare               # roda o que mudou
//   pnpm media:prepare -- --forcar   # refaz tudo
//   pnpm media:prepare -- --escolher # só mostra o quadro mais nítido de cada janela de still
//
// Regras que este script NUNCA afrouxa:
//   - item com naoUsar=true não gera nada em public/media/;
//   - item ou trecho com contemPessoa=true sem autorizacaoImagem não gera nada;
//     no tour, esses trechos são cortados;
//   - nunca gera largura acima do original nem acima de resolucaoMax;
//   - vídeo sempre sem áudio.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const VERSAO = 1;
const raiz = fileURLToPath(new URL('..', import.meta.url));
const saida = join(raiz, 'public', 'media');
const masters = join(raiz, '.cache', 'media'); // PNG de trabalho: fora de public/
const arquivoCache = join(masters, 'cache.json');
const LARGURAS = [360, 720];

const args = process.argv.slice(2);
const forcar = args.includes('--forcar');
const soEscolher = args.includes('--escolher');

const manifesto = JSON.parse(readFileSync(join(raiz, 'media.manifest.json'), 'utf8'));
const itens = new Map(manifesto.itens.map((i) => [i.id, i]));

// ---------- utilidades ----------

const hashArquivo = new Map();
function hashDe(caminho) {
  if (!hashArquivo.has(caminho)) {
    hashArquivo.set(
      caminho,
      createHash('sha256')
        .update(readFileSync(join(raiz, caminho)))
        .digest('hex'),
    );
  }
  return hashArquivo.get(caminho);
}
const hashTarefa = (...partes) =>
  createHash('sha256')
    .update(JSON.stringify([VERSAO, ...partes]))
    .digest('hex')
    .slice(0, 16);

const cache =
  existsSync(arquivoCache) && !forcar ? JSON.parse(readFileSync(arquivoCache, 'utf8')) : {};
const novoCache = {};
const indice = { gerado: null, imagens: {}, videos: {}, capitulos: null, stills: {} };
let feitas = 0;
let puladas = 0;

/** Roda `fazer` só se o hash mudou ou algum arquivo de saída sumiu. */
async function tarefa(nome, hash, arquivos, fazer) {
  const ok = cache[nome]?.hash === hash && arquivos.every((a) => existsSync(a));
  if (ok) {
    novoCache[nome] = cache[nome];
    puladas++;
    return cache[nome].dados;
  }
  const dados = (await fazer()) ?? null;
  novoCache[nome] = { hash, dados };
  feitas++;
  console.log(`✓ ${nome}`);
  return dados;
}

function ffmpeg(...a) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: ['ignore', 'inherit', 'inherit'] });
}

function publicavel(item) {
  if (!item) return false;
  if (item.naoUsar) return false;
  if (item.contemPessoa && !item.autorizacaoImagem) return false;
  return true;
}

const fmt = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = (s % 60).toFixed(3).padStart(6, '0');
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${seg}`;
};

// ---------- imagens responsivas ----------

async function responsiva(id, origem, origemId, resolucaoMax, hashBase) {
  const meta = await sharp(origem).metadata();
  const teto = Math.min(meta.width, resolucaoMax ?? Infinity);
  let larguras = LARGURAS.filter((l) => l <= teto);
  if (larguras.length === 0) larguras = [teto]; // original menor que 360: só o tamanho real
  const arquivos = larguras.flatMap((l) => [
    join(saida, `img/${id}-${l}.avif`),
    join(saida, `img/${id}-${l}.webp`),
  ]);
  const dados = await tarefa(`img:${id}`, hashTarefa(hashBase, larguras), arquivos, async () => {
    mkdirSync(join(saida, 'img'), { recursive: true });
    const variantes = [];
    for (const l of larguras) {
      const base = sharp(origem).resize({ width: l, withoutEnlargement: true });
      const avif = await base
        .clone()
        .avif({ quality: 55, effort: 6 })
        .toFile(join(saida, `img/${id}-${l}.avif`));
      await base
        .clone()
        .webp({ quality: 78, effort: 6 })
        .toFile(join(saida, `img/${id}-${l}.webp`));
      variantes.push({ largura: avif.width, altura: avif.height });
    }
    const lqip = await sharp(origem).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
    return { variantes, lqip: `data:image/webp;base64,${lqip.toString('base64')}` };
  });
  indice.imagens[id] = {
    origem: origemId,
    variantes: dados.variantes.map((v) => ({
      ...v,
      avif: `/media/img/${id}-${v.largura}.avif`,
      webp: `/media/img/${id}-${v.largura}.webp`,
    })),
    lqip: dados.lqip,
  };
}

// ---------- tour ----------

const tour = manifesto.tour;
const fonte = itens.get(tour.fonte);
const video = join(raiz, fonte.arquivo);
const cortes = fonte.trechos.filter((t) => t.contemPessoa && !t.autorizacaoImagem);

/** Intervalos [in, out] de um capítulo sem os trechos com pessoa. */
function semPessoa(a, b) {
  let partes = [[a, b]];
  for (const c of cortes) {
    partes = partes.flatMap(([x, y]) => {
      if (c.out <= x || c.in >= y) return [[x, y]];
      const r = [];
      if (c.in > x) r.push([x, c.in]);
      if (c.out < y) r.push([c.out, y]);
      return r;
    });
  }
  return partes.filter(([x, y]) => y - x >= 0.2);
}

function tocaPessoa(a, b) {
  return cortes.some((c) => c.in < b && c.out > a);
}

const capitulos = tour.capitulos.filter((c) => !c.fora);
const segmentos = [];
const vtt = ['WEBVTT', ''];
let t = 0;
for (const c of capitulos) {
  const partes = semPessoa(c.in, c.out);
  const inicio = t;
  for (const [x, y] of partes) {
    segmentos.push([x, y]);
    t += y - x;
  }
  vtt.push(`${fmt(inicio)} --> ${fmt(t)}`, c.titulo, '');
}

// Quadro mais nítido de uma janela (variância do laplaciano), pulando trechos com pessoa.
async function maisNitido(a, b) {
  const tmp = mkdtempSync(join(tmpdir(), 'ardeli-nitidez-'));
  try {
    ffmpeg(
      '-ss',
      String(a),
      '-i',
      video,
      '-t',
      String(b - a),
      '-vf',
      'scale=360:-1,format=gray',
      join(tmp, '%04d.png'),
    );
    let melhor = { t: a, nota: -1 };
    const quadros = readdirSync(tmp).sort();
    for (const [i, q] of quadros.entries()) {
      const tq = Math.round((a + i / 30) * 1000) / 1000;
      if (tocaPessoa(tq - 0.05, tq + 0.05)) continue;
      const { channels } = await sharp(join(tmp, q))
        .convolve({ width: 3, height: 3, kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0], offset: 128 })
        .stats();
      const nota = channels[0].stdev;
      if (nota > melhor.nota) melhor = { t: tq, nota };
    }
    return melhor;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

if (soEscolher) {
  for (const s of tour.stills) {
    const m = await maisNitido(...s.janela);
    console.log(
      `${s.id.padEnd(24)} janela ${s.janela.join('–')} s → t=${m.t} (nitidez ${m.nota.toFixed(1)})${s.t !== undefined && s.t !== m.t ? `  [manifesto: ${s.t}]` : ''}`,
    );
  }
  process.exit(0);
}

mkdirSync(saida, { recursive: true });
const hv = hashDe(fonte.arquivo);

// O original tem pessoa só nos trechos marcados (conferido quadro a quadro e gravado como
// pessoaApenasNosTrechos); os derivados cortam esses trechos.
if (publicavel(fonte) || (!fonte.naoUsar && fonte.pessoaApenasNosTrechos === true)) {
  mkdirSync(join(saida, 'video'), { recursive: true });

  const filtroTour = (w, h) => {
    const partes = segmentos.map(
      ([x, y], i) => `[0:v]trim=start=${x}:end=${y},setpts=PTS-STARTPTS[s${i}]`,
    );
    const concat = `${segmentos.map((_, i) => `[s${i}]`).join('')}concat=n=${segmentos.length}:v=1:a=0[c]`;
    return `${partes.join(';')};${concat};[c]scale=${w}:${h}:flags=lanczos,format=yuv420p[v]`;
  };

  for (const { largura, altura } of tour.saidas) {
    const nome = `tour-${largura}p`;
    const alta = largura >= 720;
    const hash = hashTarefa(hv, segmentos, largura, altura);
    await tarefa(
      `video:${nome}`,
      hash,
      [join(saida, `video/${nome}.mp4`), join(saida, `video/${nome}.webm`)],
      () => {
        const f = filtroTour(largura, altura);
        ffmpeg(
          '-i',
          video,
          '-filter_complex',
          f,
          '-map',
          '[v]',
          '-an',
          '-c:v',
          'libx264',
          '-preset',
          'slow',
          '-crf',
          alta ? '26' : '27',
          '-maxrate',
          alta ? '1100k' : '700k',
          '-bufsize',
          alta ? '2200k' : '1400k',
          '-profile:v',
          'high',
          '-movflags',
          '+faststart',
          join(saida, `video/${nome}.mp4`),
        );
        ffmpeg(
          '-i',
          video,
          '-filter_complex',
          f,
          '-map',
          '[v]',
          '-an',
          '-c:v',
          'libvpx-vp9',
          '-crf',
          alta ? '36' : '38',
          '-b:v',
          alta ? '900k' : '550k',
          '-row-mt',
          '1',
          '-deadline',
          'good',
          '-cpu-used',
          '3',
          join(saida, `video/${nome}.webm`),
        );
      },
    );
    indice.videos[nome] = {
      largura,
      altura,
      duracao: Math.round(t * 100) / 100,
      mp4: `/media/video/${nome}.mp4`,
      webm: `/media/video/${nome}.webm`,
      capitulos: '/media/video/tour-capitulos.vtt',
      mudo: true,
    };
  }
  writeFileSync(join(saida, 'video/tour-capitulos.vtt'), vtt.join('\n'));
  indice.capitulos = '/media/video/tour-capitulos.vtt';

  // Loops mudos com teto de bytes: sobe o CRF até caber.
  for (const l of tour.loops) {
    if (tocaPessoa(l.in, l.out)) throw new Error(`${l.id}: o trecho ${l.in}–${l.out} tem pessoa`);
    const hash = hashTarefa(hv, l);
    const dados = await tarefa(
      `video:${l.id}`,
      hash,
      [join(saida, `video/${l.id}.mp4`), join(saida, `video/${l.id}.webm`)],
      () => {
        const r = {};
        for (const [ext, codec, crf0] of [
          [
            'mp4',
            ['-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-movflags', '+faststart'],
            26,
          ],
          [
            'webm',
            [
              '-c:v',
              'libvpx-vp9',
              '-b:v',
              '0',
              '-row-mt',
              '1',
              '-deadline',
              'good',
              '-cpu-used',
              '2',
            ],
            36,
          ],
        ]) {
          const destino = join(saida, `video/${l.id}.${ext}`);
          for (let crf = crf0; ; crf += 2) {
            ffmpeg(
              '-ss',
              String(l.in),
              '-i',
              video,
              '-t',
              String(l.out - l.in),
              '-an',
              '-vf',
              'scale=720:1280:flags=lanczos,format=yuv420p',
              ...codec,
              '-crf',
              String(crf),
              destino,
            );
            const bytes = statSync(destino).size;
            if (bytes <= l.maxBytes) {
              r[ext] = { bytes, crf };
              break;
            }
            if (crf > 50) throw new Error(`${l.id}.${ext}: não coube em ${l.maxBytes} bytes`);
          }
        }
        return r;
      },
    );
    indice.videos[l.id] = {
      largura: 720,
      altura: 1280,
      duracao: l.out - l.in,
      mp4: `/media/video/${l.id}.mp4`,
      webm: `/media/video/${l.id}.webm`,
      bytes: { mp4: dados.mp4.bytes, webm: dados.webm.bytes },
      mudo: true,
      loop: true,
    };
  }

  // Pôsteres (1 por capítulo) e stills.
  mkdirSync(masters, { recursive: true });

  for (const c of capitulos) {
    if (tocaPessoa(c.poster - 0.05, c.poster + 0.05))
      throw new Error(`pôster ${c.id}: ${c.poster}s tem pessoa`);
    const id = `poster-${c.id}`;
    const png = join(masters, `${id}.png`);
    const hash = hashTarefa(hv, c.poster);
    await tarefa(`quadro:${id}`, hash, [png], () => {
      ffmpeg('-ss', String(c.poster), '-i', video, '-frames:v', '1', png);
    });
    await responsiva(id, png, 'tour', 720, hash);
  }

  const cor = tour.correcaoStills;
  for (const s of tour.stills) {
    if (s.t === undefined) {
      console.warn(`! still ${s.id}: sem "t" no manifesto. Rode --escolher e grave o tempo.`);
      continue;
    }
    if (tocaPessoa(s.t - 0.05, s.t + 0.05)) throw new Error(`still ${s.id}: ${s.t}s tem pessoa`);
    const png = join(masters, `still-${s.id}.png`);
    const hash = hashTarefa(hv, s.t, cor);
    const ganhos = await tarefa(`quadro:still-${s.id}`, hash, [png], async () => {
      const tmp = join(masters, `bruto-${s.id}.png`);
      ffmpeg('-ss', String(s.t), '-i', video, '-frames:v', '1', tmp);
      // Balanço de branco medido só nos pixels quase neutros (paredes brancas e cinza),
      // parcial e limitado. Não usa a imagem toda: a parede vermelha e a madeira
      // puxariam a correção para o azul e falsificariam a cor real do espaço.
      const { data, info } = await sharp(tmp)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const soma = [0, 0, 0];
      let n = 0;
      const { forca, limite, saturacaoMax, luzMin, luzMax } = cor.balancoDeBranco;
      for (let i = 0; i < data.length; i += info.channels) {
        const r = data[i],
          gg = data[i + 1],
          b = data[i + 2];
        const mx = Math.max(r, gg, b);
        const mn = Math.min(r, gg, b);
        const luz = (r + gg + b) / 3;
        if (mx - mn <= saturacaoMax && luz >= luzMin && luz <= luzMax) {
          soma[0] += r;
          soma[1] += gg;
          soma[2] += b;
          n++;
        }
      }
      const amostra = n / (info.width * info.height);
      let g = [1, 1, 1];
      if (amostra >= 0.02) {
        const medias = soma.map((x) => x / n);
        const cinza = (medias[0] + medias[1] + medias[2]) / 3;
        g = medias.map((m) => {
          const bruto = 1 + (cinza / m - 1) * forca;
          return Math.round(Math.min(1 + limite, Math.max(1 - limite, bruto)) * 1000) / 1000;
        });
      }
      ffmpeg(
        '-i',
        tmp,
        '-vf',
        `colorchannelmixer=rr=${g[0]}:gg=${g[1]}:bb=${g[2]},curves=all='${cor.curva}'`,
        png,
      );
      rmSync(tmp);
      return { ganhos: g, amostraNeutra: Math.round(amostra * 1000) / 1000 };
    });
    indice.stills[s.id] = {
      t: s.t,
      ganhosRGB: ganhos.ganhos,
      amostraNeutra: ganhos.amostraNeutra,
      curva: cor.curva,
    };

    const master = png;
    const meta = await sharp(master).metadata();
    const recortes = {
      '9x16': { x: 0, y: 0, w: meta.width, h: meta.height },
      ...(s.recortes ?? {}),
    };
    for (const [nome, r] of Object.entries(recortes)) {
      const box = {
        left: Math.round(r.x ?? 0),
        top: Math.round(r.y ?? 0),
        width: Math.round(r.w ?? meta.width),
        height: Math.round(
          r.h ??
            (nome === '4x5'
              ? meta.width * 1.25
              : nome === '16x9'
                ? (meta.width * 9) / 16
                : meta.height),
        ),
      };
      if (box.top + box.height > meta.height || box.left + box.width > meta.width) {
        throw new Error(`still ${s.id} ${nome}: recorte sai do quadro`);
      }
      const id = `still-${s.id}-${nome}`;
      const recorte = join(masters, `${id}.png`);
      const hr = hashTarefa(hash, box);
      await tarefa(`recorte:${id}`, hr, [recorte], async () => {
        await sharp(master).extract(box).png().toFile(recorte);
      });
      await responsiva(id, recorte, 'tour', 720, hr);
    }
  }
} else {
  console.warn('! tour não publicável (contemPessoa sem autorização fora dos trechos marcados)');
}

// ---------- imagens soltas (capturas) ----------

for (const item of manifesto.itens) {
  if (!['captura', 'foto'].includes(item.tipo)) continue;
  if (!publicavel(item)) continue;
  await responsiva(
    item.id,
    join(raiz, item.arquivo),
    item.id,
    item.resolucaoMax,
    hashDe(item.arquivo),
  );
}

// ---------- limpeza e índice ----------

// Remove o que não pertence a nenhuma tarefa atual (ex.: item virou naoUsar).
const esperados = new Set(['media-index.json', 'video/tour-capitulos.vtt']);
for (const [nome] of Object.entries(novoCache)) {
  if (nome.startsWith('img:')) {
    const id = nome.slice(4);
    for (const v of indice.imagens[id]?.variantes ?? []) {
      esperados.add(v.avif.replace('/media/', ''));
      esperados.add(v.webp.replace('/media/', ''));
    }
  }
}
for (const v of Object.values(indice.videos)) {
  esperados.add(v.mp4.replace('/media/', ''));
  esperados.add(v.webm.replace('/media/', ''));
}
function varrer(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    const rel = relative(saida, p).split('\\').join('/');
    if (statSync(p).isDirectory()) varrer(p);
    else if (!esperados.has(rel)) {
      rmSync(p);
      console.log(`− removido ${rel}`);
    }
  }
}
varrer(saida);

writeFileSync(arquivoCache, JSON.stringify(novoCache, null, 2));
indice.gerado = { versao: VERSAO, manifesto: hashTarefa(manifesto) };
const indiceTexto = JSON.stringify(indice, null, 2);
const destinoIndice = join(saida, 'media-index.json');
if (!existsSync(destinoIndice) || readFileSync(destinoIndice, 'utf8') !== indiceTexto) {
  writeFileSync(destinoIndice, indiceTexto);
}
console.log(`media:prepare — ${feitas} feitas, ${puladas} já prontas.`);
