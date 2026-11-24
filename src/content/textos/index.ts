// Índice dos textos do site + coleta de todas as frases (para testes e audit-compliance).
import { agendador } from './agendador.ts';
import { textosAtendimentos, paginaAtendimentos } from './atendimentos.ts';
import { paginaConvenios, textosConvenios } from './convenios.ts';
import { faq, grupos } from './faq.ts';
import * as home from './home.ts';
import { alts, botoes, metaHome, rodape } from './microtextos.ts';
import {
  aClinica,
  avaliar,
  comoChegar,
  naoEncontrada,
  primeiraAvaliacao,
  privacidade,
  quemCuida,
} from './paginas.ts';
import { aberturas } from './respostas.ts';
import type { Frase, Meta } from './tipos.ts';

export * from './tipos.ts';
export { FONTES, type FonteId } from './fontes.ts';

export const textosDoSite = {
  home,
  convenios: { pagina: paginaConvenios, itens: textosConvenios },
  atendimentos: { pagina: paginaAtendimentos, itens: textosAtendimentos },
  primeiraAvaliacao,
  quemCuida,
  aClinica,
  faq: { ...faq, grupos },
  comoChegar,
  avaliar,
  privacidade,
  naoEncontrada,
  microtextos: { botoes, alts, rodape: rodape() },
  metaHome,
  agendador,
  aberturas,
};

export interface FraseColhida extends Frase {
  /** Caminho no objeto, ex.: "convenios.itens.1.oQueLevar.0". */
  readonly onde: string;
  /** false quando a frase está numa pergunta não publicada. */
  readonly publicavel: boolean;
}

function ehFrase(x: unknown): x is Frase {
  return (
    typeof x === 'object' &&
    x !== null &&
    'texto' in x &&
    'fontes' in x &&
    Array.isArray((x as Frase).fontes)
  );
}

/** Todas as frases com fonte, onde quer que estejam. */
export function colherFrases(
  obj: unknown = textosDoSite,
  onde = '',
  publicavel = true,
): FraseColhida[] {
  if (ehFrase(obj)) return [{ ...obj, onde, publicavel: publicavel && !obj.exige }];
  if (typeof obj !== 'object' || obj === null) return [];
  const aindaPublicavel =
    publicavel && !('publicado' in obj && (obj as { publicado: unknown }).publicado === false);
  return Object.entries(obj).flatMap(([k, v]) =>
    colherFrases(v, onde ? `${onde}.${k}` : k, aindaPublicavel),
  );
}

/** Todo texto solto (rótulos, títulos, botões): strings que não estão dentro de uma Frase. */
export function colherRotulos(
  obj: unknown = textosDoSite,
  onde = '',
): { texto: string; onde: string }[] {
  if (typeof obj === 'string') return [{ texto: obj, onde }];
  if (ehFrase(obj) || typeof obj !== 'object' || obj === null) return [];
  return Object.entries(obj).flatMap(([k, v]) => colherRotulos(v, onde ? `${onde}.${k}` : k));
}

/** Todas as metas (title/description) do site. */
export function metas(): Record<string, Meta> {
  return {
    home: metaHome,
    convenios: paginaConvenios.meta,
    atendimentos: paginaAtendimentos.meta,
    ...Object.fromEntries(textosAtendimentos.map((a) => [`atendimentos/${a.id}`, a.meta])),
    'primeira-avaliacao': primeiraAvaliacao.meta,
    'quem-cuida': quemCuida.meta,
    'a-clinica': aClinica.meta,
    'perguntas-frequentes': faq.meta,
    'como-chegar': comoChegar.meta,
    avaliar: avaliar.meta,
    privacidade: privacidade.meta,
    '404': naoEncontrada.meta,
    agendar: agendador.meta,
  };
}

/** Pendências de texto (o que fica fora ou genérico até o João confirmar). */
export const pendenciasTextos = [
  {
    id: 'pedido-medico',
    campo: 'Precisa de pedido médico? (por convênio)',
    efeito: 'Pergunta fora do FAQ e da página de atendimento',
  },
  {
    id: 'rotina-avaliacao',
    campo:
      'Validar com a Andriele o passo a passo (conversa, avaliação, plano, acompanhamento) e "o que levar"',
    efeito: 'Publicado como rotina comum da fisioterapia (fonte "pratica"/"orientacao")',
  },
  {
    id: 'carteirinha',
    campo: 'Confirmar que Unimed e AAPL pedem carteirinha',
    efeito: 'Publicado como orientação ("leve a carteirinha")',
  },
  {
    id: 'instagram-studio-ar',
    campo: 'Pode linkar o Instagram do Studio Ar?',
    efeito: 'Fato "atende em Lages desde 2018, no Studio Ar" sem link',
  },
] as const;
