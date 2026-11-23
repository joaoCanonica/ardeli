// Lógica do agendador (fase 1). Monta a mensagem no aparelho e abre o destino.
// LGPD: nada é guardado, enviado a servidor nem registrado. O motivo é opcional
// e genérico (sem detalhe clínico). O texto vem do núcleo puro (./agenda-nucleo.ts),
// o mesmo que roda no navegador.
import { destinoAgenda, type Destino } from '../config/agenda.ts';
import { atendimentos as todosAtendimentos } from '../content/dados/atendimentos.ts';
import { convenios as todosConvenios } from '../content/dados/convenios.ts';
import type { Atendimento, Convenio } from '../content/schemas.ts';
import {
  DIAS,
  MOTIVOS,
  PERIODOS,
  ROTULO_FORMA,
  textoPedido,
  urlDoDestino,
  type Destino as DestinoNucleo,
  type Dia,
  type Forma,
  type Motivo,
  type Pedido,
  type Periodo,
  type Permitidos,
} from './agenda-nucleo.ts';
import { numeroWhatsApp } from './whatsapp.ts';

export type { Dia, Forma, Motivo, Pedido, Periodo };

interface Contexto {
  readonly convenios: readonly Convenio[];
  readonly atendimentos: readonly Atendimento[];
}
const contextoPadrao: Contexto = { convenios: todosConvenios, atendimentos: todosAtendimentos };

export interface Opcao<T extends string> {
  readonly id: T;
  readonly rotulo: string;
}

/** Formas de atendimento: só os convênios confirmados (SUS só se confirmado) + "Não sei". */
export function opcoesForma(ctx: Contexto = contextoPadrao): Opcao<Forma>[] {
  const confirmados = [...ctx.convenios]
    .sort((a, b) => a.ordem - b.ordem)
    .filter((c) => c.atende.estado === 'confirmado')
    .map((c) => ({ id: c.id, rotulo: ROTULO_FORMA[c.id] }));
  return [...confirmados, { id: 'nao-sei', rotulo: ROTULO_FORMA['nao-sei'] }];
}

/** Motivos: só os ligados a atendimentos publicados + "Outro". */
export function opcoesMotivo(ctx: Contexto = contextoPadrao): Opcao<Motivo>[] {
  const publicados = new Set<string>(ctx.atendimentos.filter((a) => a.publicado).map((a) => a.id));
  return MOTIVOS.filter((m) => m.atendimento === null || publicados.has(m.atendimento)).map(
    ({ id, rotulo }) => ({
      id,
      rotulo,
    }),
  );
}

export function opcoesPeriodo(): Opcao<Periodo>[] {
  return (Object.keys(PERIODOS) as Periodo[]).map((id) => ({ id, rotulo: PERIODOS[id].rotulo }));
}

export function opcoesDia(): Opcao<`${Dia}`>[] {
  return ([1, 2, 3, 4, 5] as const).map((d) => ({
    id: `${d}`,
    rotulo: DIAS[d].charAt(0).toUpperCase() + DIAS[d].slice(1),
  }));
}

/** O que o agendador pode oferecer agora (vai para o navegador em data-*). */
export function permitidos(ctx: Contexto = contextoPadrao): Permitidos {
  return {
    formas: opcoesForma(ctx)
      .map((o) => o.id)
      .filter((f) => f !== 'nao-sei'),
    motivos: opcoesMotivo(ctx).map((o) => o.id),
  };
}

/** Texto exato da mensagem. Lança se a escolha não for oferecida (ex.: SUS não confirmado). */
export function montarPedido(pedido: Pedido, ctx: Contexto = contextoPadrao): string {
  if (pedido.forma !== 'nao-sei' && !ctx.convenios.some((c) => c.id === pedido.forma)) {
    throw new Error(`forma de atendimento desconhecida: ${pedido.forma}`);
  }
  return textoPedido(pedido, permitidos(ctx));
}

/** Destino da config com o número do WhatsApp resolvido (para o navegador). */
export function destinoResolvido(destino: Destino = destinoAgenda): DestinoNucleo {
  switch (destino.tipo) {
    case 'whatsapp':
      return { tipo: 'whatsapp', numero: numeroWhatsApp() };
    case 'link-externo':
      return { tipo: 'link-externo', url: destino.url };
    case 'api':
      return { tipo: 'api', endpoint: destino.endpoint };
  }
}

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
  return { acao: 'abrir', url: urlDoDestino(texto, destinoResolvido(destino)) };
}
