// Lê o índice gerado por scripts/prepare-media.mjs (public/media/media-index.json).
// Só o que está no índice pode ir para a página: nada naoUsar nem com pessoa.
import { existsSync, readFileSync } from 'node:fs';

export interface Variante {
  largura: number;
  altura: number;
  avif: string;
  webp: string;
}
export interface ImagemIndice {
  origem: string;
  variantes: Variante[];
  lqip: string;
}
export interface VideoIndice {
  largura: number;
  altura: number;
  duracao: number;
  mp4: string;
  webm: string;
  mudo: boolean;
  loop?: boolean;
}
interface Indice {
  imagens: Record<string, ImagemIndice>;
  videos: Record<string, VideoIndice>;
  capitulos: string | null;
}

let cache: Indice | null = null;
// Raiz do projeto (no build, import.meta.url aponta para o chunk gerado).
const raiz = `${process.cwd()}/`;

export function indiceMidia(): Indice {
  if (cache) return cache;
  const arq = `${raiz}public/media/media-index.json`;
  if (!existsSync(arq))
    throw new Error('public/media/media-index.json ausente: rode pnpm media:prepare');
  cache = JSON.parse(readFileSync(arq, 'utf8')) as Indice;
  return cache;
}

export function imagem(id: string): ImagemIndice {
  const img = indiceMidia().imagens[id];
  if (!img)
    throw new Error(`imagem "${id}" não está no media-index (naoUsar, com pessoa ou inexistente)`);
  return img;
}

export function video(id: string): VideoIndice {
  const v = indiceMidia().videos[id];
  if (!v) throw new Error(`vídeo "${id}" não está no media-index`);
  return v;
}

export interface CapituloVtt {
  inicio: number;
  fim: number;
  titulo: string;
}

/** Capítulos do tour, lidos do WebVTT gerado. */
export function capitulosDoTour(): CapituloVtt[] {
  const vtt = readFileSync(`${raiz}public/media/video/tour-capitulos.vtt`, 'utf8');
  const seg = (t: string) => {
    const [h = '0', m = '0', s = '0'] = t.split(':');
    return Number(h) * 3600 + Number(m) * 60 + Number(s);
  };
  const caps: CapituloVtt[] = [];
  for (const bloco of vtt.split(/\n\n+/)) {
    const m = bloco.match(/([\d:.]+)\s*-->\s*([\d:.]+)\n(.+)/);
    if (m?.[1] && m[2] && m[3])
      caps.push({ inicio: seg(m[1]), fim: seg(m[2]), titulo: m[3].trim() });
  }
  return caps;
}

/** Capítulos do tour com o id do pôster (ordem do manifesto, sem os capítulos "fora"). */
export function capitulosComPoster(): (CapituloVtt & { id: string; posterId: string })[] {
  const manifesto = JSON.parse(readFileSync(`${raiz}media.manifest.json`, 'utf8')) as {
    tour: { capitulos: { id: string; fora?: boolean }[] };
  };
  const ids = manifesto.tour.capitulos.filter((c) => !c.fora).map((c) => c.id);
  return capitulosDoTour().map((c, i) => {
    const id = ids[i] ?? `capitulo-${i + 1}`;
    return { ...c, id, posterId: `poster-${id}` };
  });
}
