import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const raiz = new URL('..', import.meta.url).pathname;

interface Trecho {
  id: string;
  in: number;
  out: number;
  contemPessoa?: boolean;
  autorizacaoImagem?: string | null;
}
interface Item {
  id: string;
  arquivo: string;
  tipo: string;
  ambiente: string | null;
  uso: string;
  trechos: Trecho[];
  resolucaoMax: number | null;
  naoUsar: boolean;
  contemPessoa: boolean;
  problemas: string[];
  autorizacaoImagem?: string | null;
}
interface Manifesto {
  itens: Item[];
  tour: {
    fonte: string;
    capitulos: { id: string; in: number; out: number; poster?: number; fora?: boolean }[];
    loops: { id: string; in: number; out: number; maxBytes: number }[];
    stills: { id: string; janela: [number, number]; t?: number }[];
  };
}

const manifesto = JSON.parse(readFileSync(join(raiz, 'media.manifest.json'), 'utf8')) as Manifesto;
const porId = new Map(manifesto.itens.map((i) => [i.id, i]));
const tour = porId.get(manifesto.tour.fonte);
if (!tour) throw new Error('tour ausente do manifesto');
const comPessoa = tour.trechos.filter((t) => t.contemPessoa && !t.autorizacaoImagem);
const tocaPessoa = (a: number, b: number) => comPessoa.some((c) => c.in < b && c.out > a);

describe('manifesto de mídia', () => {
  it('todo item tem os campos obrigatórios e o arquivo existe', () => {
    const campos = [
      'id',
      'arquivo',
      'tipo',
      'ambiente',
      'uso',
      'trechos',
      'resolucaoMax',
      'naoUsar',
      'contemPessoa',
      'problemas',
    ];
    for (const item of manifesto.itens) {
      for (const c of campos) expect(item, `${item.id}.${c}`).toHaveProperty(c);
      expect(existsSync(join(raiz, item.arquivo)), item.arquivo).toBe(true);
    }
    expect(new Set(manifesto.itens.map((i) => i.id)).size).toBe(manifesto.itens.length);
  });

  it('todo arquivo de media-originais/ está no manifesto', () => {
    const listar = (d: string): string[] =>
      readdirSync(join(raiz, d)).flatMap((n) => {
        const p = `${d}/${n}`;
        return statSync(join(raiz, p)).isDirectory() ? listar(p) : [p];
      });
    const noManifesto = new Set(manifesto.itens.map((i) => i.arquivo));
    for (const f of listar('media-originais')) expect(noManifesto.has(f), f).toBe(true);
  });

  it('capturas de tela ficam em no máximo 360 px', () => {
    for (const i of manifesto.itens.filter((x) => x.tipo === 'captura'))
      expect(i.resolucaoMax).toBe(360);
  });

  it('artes com texto, logos de terceiros e logos raster são naoUsar', () => {
    for (const id of [
      'arte-dia-do-fisioterapeuta',
      'arte-parceria-aapl',
      'arte-unimed',
      'logo-jpeg',
      'captura-logo-horizontal',
    ]) {
      expect(porId.get(id)?.naoUsar, id).toBe(true);
    }
  });

  it('nenhum loop, pôster ou still cai num trecho com pessoa', () => {
    for (const l of manifesto.tour.loops) expect(tocaPessoa(l.in, l.out), l.id).toBe(false);
    for (const c of manifesto.tour.capitulos) {
      if (c.poster !== undefined)
        expect(tocaPessoa(c.poster - 0.05, c.poster + 0.05), c.id).toBe(false);
    }
    for (const s of manifesto.tour.stills) {
      expect(s.t, `${s.id}.t`).toBeDefined();
      expect(tocaPessoa((s.t ?? 0) - 0.05, (s.t ?? 0) + 0.05), s.id).toBe(false);
    }
  });

  it('loops ficam dentro do teto de 1 MB', () => {
    for (const l of manifesto.tour.loops) expect(l.maxBytes).toBeLessThanOrEqual(1_000_000);
  });
});

const indiceArquivo = join(raiz, 'public/media/media-index.json');
describe.runIf(existsSync(indiceArquivo))('public/media (gerado)', () => {
  const indice = JSON.parse(readFileSync(indiceArquivo, 'utf8')) as {
    imagens: Record<string, { origem: string }>;
    videos: Record<string, { mp4: string; webm: string; loop?: boolean; mudo: boolean }>;
  };

  it('nada naoUsar ou com pessoa sem autorização é publicado', () => {
    for (const [id, img] of Object.entries(indice.imagens)) {
      const origem = porId.get(img.origem);
      expect(origem, id).toBeDefined();
      expect(origem?.naoUsar, id).toBe(false);
    }
    const proibidos = manifesto.itens.filter((i) => i.naoUsar).map((i) => i.id);
    const publicados = readdirSync(join(raiz, 'public/media'), { recursive: true }).map(String);
    for (const p of publicados) for (const id of proibidos) expect(p.includes(id), p).toBe(false);
  });

  it('loops publicados têm até 1 MB e todo vídeo é mudo', () => {
    for (const [id, v] of Object.entries(indice.videos)) {
      expect(v.mudo, id).toBe(true);
      if (v.loop) {
        for (const f of [v.mp4, v.webm])
          expect(statSync(join(raiz, 'public', f)).size, f).toBeLessThanOrEqual(1_000_000);
      }
    }
  });
});
