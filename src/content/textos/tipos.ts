// Tipos dos textos. Cada Frase carrega as fontes; o que falta confirmar vira Pendencia.
import type { FonteId } from './fontes.ts';

export interface Frase {
  readonly texto: string;
  readonly fontes: readonly FonteId[];
  /** Só pode ir para a página quando a condição estiver confirmada (ex.: SUS). */
  readonly exige?: 'sus-confirmado' | 'tempo-confirmado';
}

/** Frase com fonte(s). */
export const f = (texto: string, ...fontes: [FonteId, ...FonteId[]]): Frase => ({ texto, fontes });

/** Frase que só aparece com confirmação (fica guardada, não publica). */
export const condicional = (
  exige: NonNullable<Frase['exige']>,
  texto: string,
  ...fontes: [FonteId, ...FonteId[]]
): Frase => ({ texto, fontes, exige });

export interface VerbeteTexto {
  readonly palavra: string;
  readonly classe: 's.f.' | 's.m.' | 'v.t.d.' | 'v.i.' | 'adj.';
  readonly acepcoes: readonly Frase[];
}

export interface Pergunta {
  readonly id: string;
  readonly pergunta: string;
  readonly resposta: readonly Frase[];
  /** false = fica fora do site até a pendência ser resolvida. */
  readonly publicado: boolean;
  readonly pendencia?: string;
}

export interface Meta {
  /** ≤ 60 caracteres. */
  readonly titulo: string;
  /** ≤ 155 caracteres. */
  readonly descricao: string;
}

export const CONFIRME = 'Confirme pelo WhatsApp: a gente explica rapidinho.';

/** Texto das frases (para componentes que recebem string[]). */
export const textos = (frases: readonly Frase[]): string[] => frases.map((x) => x.texto);
