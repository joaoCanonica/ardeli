// Núcleo puro do agendador: monta o texto exato da mensagem e a URL do destino.
// Sem imports de config/conteúdo, para rodar no navegador com poucos bytes.
// O servidor (montarPedido em ./agenda.ts) e o navegador (src/components/agendar)
// usam ESTAS mesmas funções: a mensagem é idêntica nos dois lados.

export type Forma = 'particular' | 'unimed' | 'aapl' | 'sus' | 'nao-sei';
export type Motivo =
  'dor' | 'pos-operatorio' | 'recuperacao-lesao' | 'neurologico' | 'respiratorio' | 'outro';
export type Periodo = 'manha' | 'tarde' | 'noite' | 'qualquer';
export type Dia = 1 | 2 | 3 | 4 | 5;

export interface Pedido {
  readonly forma: Forma;
  readonly motivo?: Motivo | undefined;
  readonly periodo?: Periodo | undefined;
  readonly dias?: readonly Dia[] | undefined;
}

export const ORIGEM = 'Vim pelo site da Ardeli';

export const ROTULO_FORMA: Record<Forma, string> = {
  particular: 'Particular',
  unimed: 'Unimed',
  aapl: 'AAPL',
  sus: 'SUS',
  'nao-sei': 'Não sei',
};

export const MOTIVOS: readonly {
  id: Motivo;
  rotulo: string;
  texto: string;
  atendimento: string | null;
}[] = [
  {
    id: 'dor',
    rotulo: 'Dor (coluna, ombro, joelho…)',
    texto: 'dor',
    atendimento: 'musculoesqueletica',
  },
  {
    id: 'pos-operatorio',
    rotulo: 'Pós-operatório',
    texto: 'pós-operatório',
    atendimento: 'musculoesqueletica',
  },
  {
    id: 'recuperacao-lesao',
    rotulo: 'Recuperação após lesão',
    texto: 'recuperação após lesão',
    atendimento: 'musculoesqueletica',
  },
  { id: 'neurologico', rotulo: 'Neurológico', texto: 'neurológico', atendimento: 'neurologia' },
  {
    id: 'respiratorio',
    rotulo: 'Respiratório',
    texto: 'respiratório',
    atendimento: 'cardiorrespiratoria',
  },
  { id: 'outro', rotulo: 'Outro', texto: 'outro (explico na conversa)', atendimento: null },
];

export const PERIODOS: Record<Periodo, { rotulo: string; texto: string }> = {
  manha: { rotulo: 'Manhã (8h–12h)', texto: 'de manhã' },
  tarde: { rotulo: 'Tarde (12h–18h)', texto: 'à tarde' },
  noite: { rotulo: 'Noite (18h–20h)', texto: 'à noite' },
  qualquer: { rotulo: 'Qualquer horário', texto: 'em qualquer horário' },
};

export const DIAS: Record<Dia, string> = {
  1: 'segunda',
  2: 'terça',
  3: 'quarta',
  4: 'quinta',
  5: 'sexta',
};

/** O que pode ser oferecido (SUS só se confirmado; motivos só de atendimentos publicados). */
export interface Permitidos {
  readonly formas: readonly Forma[];
  readonly motivos: readonly Motivo[];
}

const juntar = (itens: readonly string[]) =>
  itens.length <= 1 ? (itens[0] ?? '') : `${itens.slice(0, -1).join(', ')} ou ${itens.at(-1)}`;

function textoPreferencia(periodo?: Periodo, dias?: readonly Dia[]): string {
  const unicos = [...new Set(dias ?? [])].sort();
  for (const d of unicos)
    if (!(d in DIAS)) throw new Error(`dia inválido: ${d} (só segunda a sexta)`);
  const textoDias =
    unicos.length === 5 ? 'qualquer dia da semana' : juntar(unicos.map((d) => DIAS[d]));
  if (periodo === 'qualquer') {
    return textoDias ? `Posso em qualquer horário, ${textoDias}.` : 'Posso em qualquer horário.';
  }
  const p = periodo ? PERIODOS[periodo].texto : '';
  if (p && textoDias) return `Prefiro ${p}, ${textoDias}.`;
  if (p) return `Prefiro ${p}.`;
  if (textoDias) return `Prefiro ${textoDias}.`;
  return '';
}

/** Texto exato da mensagem. Lança se a escolha não puder ser oferecida. */
export function textoPedido(pedido: Pedido, permitidos: Permitidos): string {
  if (pedido.forma !== 'nao-sei' && !permitidos.formas.includes(pedido.forma)) {
    throw new Error(`forma "${pedido.forma}" não está confirmada e não pode ser oferecida`);
  }
  const partes = [
    `Olá! ${ORIGEM} e quero agendar uma avaliação.`,
    pedido.forma === 'nao-sei'
      ? 'Ainda não sei se vai ser particular ou por convênio.'
      : `Atendimento: ${ROTULO_FORMA[pedido.forma]}.`,
  ];
  if (pedido.motivo) {
    if (!permitidos.motivos.includes(pedido.motivo)) {
      throw new Error(`motivo "${pedido.motivo}" não é oferecido (atendimento não publicado)`);
    }
    partes.push(`Motivo: ${MOTIVOS.find((m) => m.id === pedido.motivo)?.texto ?? ''}.`);
  }
  const pref = textoPreferencia(pedido.periodo, pedido.dias);
  if (pref) partes.push(pref);
  return partes.join(' ');
}

export type Destino =
  | { readonly tipo: 'whatsapp'; readonly numero: string }
  | { readonly tipo: 'link-externo'; readonly url: string }
  | { readonly tipo: 'api'; readonly endpoint: string };

/** URL para abrir. link-externo NÃO leva o texto (dado de saúde não vai para terceiro). */
export function urlDoDestino(texto: string, destino: Destino): string {
  switch (destino.tipo) {
    case 'whatsapp': {
      const t = texto.includes(ORIGEM) ? texto : `Olá! ${ORIGEM}. ${texto}`.trim();
      return `https://wa.me/${destino.numero}?text=${encodeURIComponent(t)}`;
    }
    case 'link-externo':
      if (!/^https:\/\//.test(destino.url)) throw new Error('link-externo precisa de URL https');
      return destino.url;
    case 'api':
      throw new Error('destino "api" ainda não implementado (fase 2: agenda online)');
  }
}
