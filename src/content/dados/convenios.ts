// Formas de atendimento. Marcas de terceiros: só o nome em texto, nunca logo.
// SUS: NÃO afirmar atendimento enquanto não houver confirmação (CLAUDE.md §10).
import { bloqueante, confirmado, opcional } from '../../config/tipos.ts';
import type { Convenio } from '../schemas.ts';

const FONTE = 'João (WAXLO) + posts da clínica no Instagram, 22/11/2026';
const CONFIRME = 'Confirme pelo WhatsApp: a gente explica rapidinho.';

export const convenios: Convenio[] = [
  {
    id: 'particular',
    ordem: 1,
    nome: 'Particular',
    nomeCompleto: 'Particular',
    atende: confirmado(true, FONTE),
    regras: opcional(null),
    textoSePendente: CONFIRME,
  },
  {
    id: 'unimed',
    ordem: 2,
    nome: 'Unimed',
    nomeCompleto: 'Unimed Lages',
    atende: confirmado(true, `${FONTE} (arte "Agora atendemos Unimed!")`),
    regras: opcional(null), // planos aceitos, pedido médico, guia
    textoSePendente: CONFIRME,
  },
  {
    id: 'aapl',
    ordem: 3,
    nome: 'AAPL',
    nomeCompleto: 'AAPL (Associação dos Aposentados e Pensionistas de Lages)',
    atende: confirmado(true, `${FONTE} (arte "Nova parceria!": "credenciada com a AAPL")`),
    regras: opcional(null), // como funciona para o associado
    textoSePendente: CONFIRME,
  },
  {
    id: 'sus',
    ordem: 4,
    nome: 'SUS',
    nomeCompleto: 'SUS (Sistema Único de Saúde)',
    atende: bloqueante('SUS: contrato vigente e caminho de acesso', {
      fallback: 'Consulte a disponibilidade pelo WhatsApp',
    }),
    regras: opcional(null), // encaminhamento da UBS, regulação municipal
    textoSePendente: 'Consulte a disponibilidade pelo WhatsApp.',
  },
];

/** Regras pendentes por convênio, para docs/PENDENCIAS.md. */
export const regrasPendentes: Record<Convenio['id'], string> = {
  particular: 'como funciona o agendamento particular',
  unimed: 'planos aceitos, pedido médico, guia',
  aapl: 'como funciona para o associado da AAPL',
  sus: 'encaminhamento da UBS ou regulação municipal',
};
