// Lógica do agendador (fase 1). Monta a mensagem no aparelho e abre o destino.
// LGPD: nada é guardado, enviado a servidor nem registrado. O motivo é opcional
// e genérico (sem detalhe clínico).

import { destinoAgenda, type Destino } from '../config/agenda.ts';
import { atendimentos as todosAtendimentos } from '../content/dados/atendimentos.ts';
import { convenios as todosConvenios } from '../content/dados/convenios.ts';
import type { Atendimento, Convenio } from '../content/schemas.ts';
import { linkWhatsApp, ORIGEM } from './whatsapp.ts';

export type Forma = 'particular' | 'unimed' | 'aapl' | 'sus' | 'nao-sei';
export type Motivo =
  'dor' | 'pos-operatorio' | 'recuperacao-lesao' | 'neurologico' | 'respiratorio' | 'outro';
export type Periodo = 'manha' | 'tarde' | 'noite' | 'qualquer';
export type Dia = 1 | 2 | 3 | 4 | 5;

export interface Pedido {
  readonly forma: Forma;
  readonly motivo?: Motivo;
  readonly periodo?: Periodo;
  readonly dias?: readonly Dia[];
}

interface Contexto {
  readonly convenios: readonly Convenio[];
  readonly atendimentos: readonly Atendimento[];
}
const contextoPadrao: Contexto = { convenios: todosConvenios, atendimentos: todosAtendimentos };

export interface Opcao<T extends string> {
  readonly id: T;
  readonly rotulo: string;
}

// ---------- opções de cada passo ----------

const ROTULO_FORMA: Record<Forma, string> = {
  particular: 'Particular',
  unimed: 'Unimed',
  aapl: 'AAPL',
  sus: 'SUS',
  'nao-sei': 'Não sei',
};

/** Formas de atendimento: só os convênios confirmados (SUS só se confirmado) + "Não sei". */
export function opcoesForma(ctx: Contexto = contextoPadrao): Opcao<Forma>[] {
  const confirmados = [...ctx.convenios]
    .sort((a, b) => a.ordem - b.ordem)
    .filter((c) => c.atende.estado === 'confirmado')
    .map((c) => ({ id: c.id, rotulo: ROTULO_FORMA[c.id] }));
  return [...confirmados, { id: 'nao-sei', rotulo: ROTULO_FORMA['nao-sei'] }];
}

const MOTIVOS: readonly {
  id: Motivo;
  rotulo: string;
  texto: string;
  atendimento: Atendimento['id'] | null;
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

/** Motivos: só os ligados a atendimentos publicados + "Outro". */
export function opcoesMotivo(ctx: Contexto = contextoPadrao): Opcao<Motivo>[] {
  const publicados = new Set(ctx.atendimentos.filter((a) => a.publicado).map((a) => a.id));
  return MOTIVOS.filter((m) => m.atendimento === null || publicados.has(m.atendimento)).map(
    ({ id, rotulo }) => ({ id, rotulo }),
  );
}

const PERIODOS: Record<Periodo, { rotulo: string; texto: string }> = {
  manha: { rotulo: 'Manhã (8h–12h)', texto: 'de manhã' },
  tarde: { rotulo: 'Tarde (12h–18h)', texto: 'à tarde' },
  noite: { rotulo: 'Noite (18h–20h)', texto: 'à noite' },
  qualquer: { rotulo: 'Qualquer horário', texto: 'em qualquer horário' },
};

export function opcoesPeriodo(): Opcao<Periodo>[] {
  return (Object.keys(PERIODOS) as Periodo[]).map((id) => ({ id, rotulo: PERIODOS[id].rotulo }));
}

const DIAS: Record<Dia, string> = {
  1: 'segunda',
  2: 'terça',
  3: 'quarta',
  4: 'quinta',
  5: 'sexta',
};

export function opcoesDia(): Opcao<`${Dia}`>[] {
  return ([1, 2, 3, 4, 5] as const).map((d) => ({
    id: `${d}`,
    rotulo: DIAS[d].charAt(0).toUpperCase() + DIAS[d].slice(1),
  }));
}

// ---------- mensagem ----------

const juntar = (itens: readonly string[]) =>
  itens.length <= 1 ? (itens[0] ?? '') : `${itens.slice(0, -1).join(', ')} ou ${itens.at(-1)}`;

function textoForma(forma: Forma, ctx: Contexto): string {
  if (forma === 'nao-sei') return 'Ainda não sei se vai ser particular ou por convênio.';
  const c = ctx.convenios.find((x) => x.id === forma);
  if (!c) throw new Error(`forma de atendimento desconhecida: ${forma}`);
  if (c.atende.estado !== 'confirmado') {
    throw new Error(`forma "${forma}" não está confirmada e não pode ser oferecida`);
  }
  return `Atendimento: ${ROTULO_FORMA[forma]}.`;
}

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

/** Texto exato da mensagem. Lança se a escolha não for oferecida (ex.: SUS não confirmado). */
export function montarPedido(pedido: Pedido, ctx: Contexto = contextoPadrao): string {
  const partes = [`Olá! ${ORIGEM} e quero agendar uma avaliação.`, textoForma(pedido.forma, ctx)];
  if (pedido.motivo) {
    if (!opcoesMotivo(ctx).some((m) => m.id === pedido.motivo)) {
      throw new Error(`motivo "${pedido.motivo}" não é oferecido (atendimento não publicado)`);
    }
    const m = MOTIVOS.find((x) => x.id === pedido.motivo);
    partes.push(`Motivo: ${m?.texto ?? ''}.`);
  }
  const pref = textoPreferencia(pedido.periodo, pedido.dias);
  if (pref) partes.push(pref);
  return partes.join(' ');
}

// ---------- destino (adaptador) ----------

export type AcaoDestino =
  | { readonly acao: 'abrir'; readonly url: string }
  | {
      readonly acao: 'enviar';
      readonly endpoint: string;
      readonly corpo: { readonly texto: string };
    };

/**
 * Para onde vai o pedido. whatsapp: abre o wa.me com o texto.
 * link-externo: abre a agenda online SEM levar o texto (não vaza dado de saúde na URL de terceiro).
 * api: stub; ainda não configurado.
 */
export function destinoDoPedido(texto: string, destino: Destino = destinoAgenda): AcaoDestino {
  switch (destino.tipo) {
    case 'whatsapp':
      return { acao: 'abrir', url: linkWhatsApp(texto) };
    case 'link-externo':
      if (!/^https:\/\//.test(destino.url)) throw new Error('link-externo precisa de URL https');
      return { acao: 'abrir', url: destino.url };
    case 'api':
      throw new Error('destino "api" ainda não implementado (fase 2: agenda online)');
  }
}
