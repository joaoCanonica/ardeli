// Pares de cor por uso e o nível exigido (WCAG 2.2). Lê os valores de tokens.css.
// Usado por scripts/audit-contraste.mjs e pela página /_estilo.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type Nivel = 'AAA' | 'AAA-grande' | 'AA' | 'AA-grande' | 'UI';
export const MINIMO: Record<Nivel, number> = {
  AAA: 7,
  'AAA-grande': 4.5,
  AA: 4.5,
  'AA-grande': 3,
  UI: 3,
};

export function tokens(): Record<string, string> {
  // Lido a partir da raiz do projeto (no build, import.meta.url aponta para o chunk gerado).
  const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8');
  const raiz = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
  const t: Record<string, string> = {};
  for (const m of raiz.matchAll(/--cor-([\w-]+):\s*(#[0-9a-f]{6})/gi)) {
    if (m[1] && m[2]) t[m[1]] = m[2].toLowerCase();
  }
  return t;
}

const canal = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
export function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}
export function luminancia(hex: string): number {
  const [r, g, b] = rgb(hex).map(canal) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contraste(a: string, b: string): number {
  const x = luminancia(a);
  const y = luminancia(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
/** Cor `frente` com opacidade `alfa` sobre `fundo` (mistura em sRGB, como o navegador). */
export function sobrepor(frente: string, alfa: number, fundo: string): string {
  const f = rgb(frente);
  const b = rgb(fundo);
  return `#${f
    .map((c, i) =>
      Math.round(c * alfa + (b[i] ?? 0) * (1 - alfa))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

export interface Par {
  uso: string;
  texto: string; // nome do token ou #hex
  fundo: string;
  nivel: Nivel;
}

/** Pares em uso no site. Todos precisam passar. */
export const paresObrigatorios: readonly Par[] = [
  { uso: 'Texto principal', texto: 'ardosia', fundo: 'linho', nivel: 'AAA' },
  { uso: 'Texto principal em cartão', texto: 'ardosia', fundo: 'papel', nivel: 'AAA' },
  { uso: 'Títulos e texto forte', texto: 'marinho', fundo: 'linho', nivel: 'AAA' },
  { uso: 'Títulos em cartão', texto: 'marinho', fundo: 'papel', nivel: 'AAA' },
  { uso: 'Texto sobre fundo escuro', texto: 'linho', fundo: 'marinho', nivel: 'AAA' },
  { uso: 'Link', texto: 'salvia-escura', fundo: 'linho', nivel: 'AA' },
  { uso: 'Link em cartão', texto: 'salvia-escura', fundo: 'papel', nivel: 'AA' },
  { uso: 'Numeral da acepção', texto: 'salvia-escura', fundo: 'linho', nivel: 'AA' },
  { uso: 'Link (hover)', texto: 'marinho', fundo: 'linho', nivel: 'AA' },
  { uso: 'Botão primário', texto: 'linho', fundo: 'marinho', nivel: 'AA' },
  { uso: 'Botão primário (hover)', texto: 'linho', fundo: 'marinho-profundo', nivel: 'AA' },
  { uso: 'Botão secundário', texto: 'marinho', fundo: 'linho', nivel: 'AA' },
  { uso: 'Botão secundário (hover)', texto: 'marinho', fundo: 'papel', nivel: 'AA' },
  { uso: 'Botão sobre escuro', texto: 'marinho', fundo: 'linho', nivel: 'AA' },
  { uso: 'Borda do botão/controle (1.4.11)', texto: 'marinho', fundo: 'linho', nivel: 'UI' },
  { uso: 'Anel de foco sobre claro (2.4.13)', texto: 'marinho', fundo: 'linho', nivel: 'UI' },
  { uso: 'Anel de foco sobre escuro', texto: 'linho', fundo: 'marinho', nivel: 'UI' },
  { uso: 'Controle desativado (borda tracejada)', texto: 'ardosia', fundo: 'linho', nivel: 'UI' },
];

/** Pares proibidos: listados para provar que reprovam (e ficam vetados no CSS). */
export const paresProibidos: readonly (Par & { motivo: string })[] = [
  {
    uso: 'Sálvia em texto pequeno',
    texto: 'salvia',
    fundo: 'linho',
    nivel: 'AA',
    motivo: 'CLAUDE.md §6: Sálvia não é cor de texto pequeno sobre claro',
  },
  {
    uso: 'Sálvia em texto pequeno (cartão)',
    texto: 'salvia',
    fundo: 'papel',
    nivel: 'AA',
    motivo: 'idem',
  },
  {
    uso: 'Sálvia sobre Marinho',
    texto: 'salvia',
    fundo: 'marinho',
    nivel: 'AA',
    motivo: 'reprova em texto',
  },
  {
    uso: 'Madeira como texto',
    texto: 'madeira',
    fundo: 'linho',
    nivel: 'AA',
    motivo: 'Madeira só como cor de ambiente',
  },
  {
    uso: 'Tijolo como texto',
    texto: 'tijolo',
    fundo: 'linho',
    nivel: 'AAA',
    motivo: 'Tijolo só como cor de ambiente (mesmo passando AA, é vetado por regra)',
  },
];

export interface Resultado extends Par {
  razao: number;
  passa: boolean;
  hexTexto: string;
  hexFundo: string;
}

export function avaliar(par: Par, t = tokens()): Resultado {
  const hexTexto = par.texto.startsWith('#') ? par.texto : t[par.texto];
  const hexFundo = par.fundo.startsWith('#') ? par.fundo : t[par.fundo];
  if (!hexTexto || !hexFundo) throw new Error(`token ausente: ${par.texto} / ${par.fundo}`);
  const razao = contraste(hexTexto, hexFundo);
  return { ...par, hexTexto, hexFundo, razao, passa: razao >= MINIMO[par.nivel] };
}

/** Capa: texto Linho sobre foto com véu Marinho 70%, no pior caso (pixel branco da foto). */
/** Opacidade do véu, lida de --veu em tokens.css (rgb(18 48 72 / 0.82)). */
export function alfaDoVeu(): number {
  const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8');
  const m = css.match(/--veu:\s*rgb\([^/]+\/\s*([\d.]+)\)/);
  if (!m?.[1]) throw new Error('--veu ausente em tokens.css');
  return Number(m[1]);
}

export function avaliarVeu(alfa = alfaDoVeu(), t = tokens()): Resultado {
  const marinho = t.marinho ?? '#123048';
  const pior = sobrepor(marinho, alfa, '#ffffff');
  return avaliar(
    {
      uso: `Capa: Linho sobre véu Marinho ${Math.round(alfa * 100)}% (pior caso: foto branca)`,
      texto: 'linho',
      fundo: pior,
      nivel: 'AAA',
    },
    t,
  );
}
