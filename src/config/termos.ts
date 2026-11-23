// Termos vetados no HTML publicado (CLAUDE.md §3 e §8). A lista só cresce:
// tirar termo daqui exige ordem expressa do João.

export interface TermoVetado {
  readonly termo: string;
  readonly motivo: string;
}

const RESULTADO = 'COFFITO Art. 15, III: promessa de resultado';
const SUPERLATIVO = 'COFFITO Art. 9, VI e 47: divulgação com exatidão e sem autopromoção';
const PRECO = 'COFFITO Art. 40, I: preço, promoção ou gratuidade';
const GENERICO = 'CLAUDE.md §8: clichê de clínica genérica';

export const termosVetados: readonly TermoVetado[] = [
  { termo: 'cura', motivo: RESULTADO },
  { termo: 'curar', motivo: RESULTADO },
  { termo: 'garantido', motivo: RESULTADO },
  { termo: 'garantia de resultado', motivo: RESULTADO },
  { termo: '100%', motivo: RESULTADO },
  { termo: 'acaba com a dor', motivo: RESULTADO },
  { termo: 'sem dor', motivo: RESULTADO },
  { termo: 'milagre', motivo: RESULTADO },
  { termo: 'o melhor', motivo: SUPERLATIVO },
  { termo: 'a melhor', motivo: SUPERLATIVO },
  { termo: 'melhor clínica', motivo: SUPERLATIVO },
  { termo: 'número 1', motivo: SUPERLATIVO },
  {
    termo: 'especialista',
    motivo: 'COFFITO Art. 30 e 48, I: só junto de título reconhecido pelo COFFITO e confirmado',
  },
  { termo: 'grátis', motivo: PRECO },
  { termo: 'gratuito', motivo: PRECO },
  { termo: 'promoção', motivo: PRECO },
  { termo: 'desconto', motivo: PRECO },
  { termo: 'avaliação grátis', motivo: PRECO },
  { termo: 'sua saúde em boas mãos', motivo: GENERICO },
  { termo: 'excelência em fisioterapia', motivo: GENERICO },
  { termo: 'tratamento de ponta', motivo: GENERICO },
  { termo: 'antes e depois', motivo: 'COFFITO Art. 15, V: imagem ou dado de paciente' },
  { termo: 'depoimento', motivo: 'COFFITO Art. 10, V: depoimento de paciente' },
];

/** Minúsculas, sem acento, espaços normalizados. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function regexDoTermo(termo: string): RegExp {
  const t = normalizar(termo).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Limite de palavra por letras/dígitos ("procura" não casa com "cura"; "100%" casa sozinho).
  // Plural também conta ("depoimentos", "descontos", "promoções").
  const plural = t.endsWith('cao') ? `${t}|${t.slice(0, -3)}coes` : `${t}(?:s|es)?`;
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${plural})(?![\\p{L}\\p{N}])`, 'gu');
}

export interface Ocorrencia {
  readonly termo: string;
  readonly motivo: string;
  readonly trecho: string;
}

/**
 * Procura termos vetados num texto (já sem HTML).
 * `titulosConfirmados`: "especialista em <título>" é permitido para esses títulos.
 */
export function encontrarTermosVetados(
  texto: string,
  titulosConfirmados: readonly string[] = [],
): Ocorrencia[] {
  const alvo = normalizar(texto);
  const permitidos = titulosConfirmados.map((t) => `especialista em ${normalizar(t)}`);
  const achados: Ocorrencia[] = [];
  for (const { termo, motivo } of termosVetados) {
    for (const m of alvo.matchAll(regexDoTermo(termo))) {
      const i = m.index;
      if (termo === 'especialista' && permitidos.some((p) => alvo.startsWith(p, i))) continue;
      achados.push({
        termo,
        motivo,
        trecho: alvo.slice(Math.max(0, i - 40), i + termo.length + 40).trim(),
      });
    }
  }
  return achados;
}
