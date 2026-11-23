// Formas de atendimento. Marcas de terceiros: só o nome em texto, nunca logo.
// SUS: NÃO afirmar atendimento enquanto não houver confirmação (CLAUDE.md §10).
import { confirmado, opcional } from '../../config/tipos.ts';
import type { Convenio } from '../schemas.ts';

const FONTE = 'João (WAXLO) + posts da clínica no Instagram, 22/11/2026';
const CONFIRME = 'Confirme pelo WhatsApp: a gente explica rapidinho.';
const FONTE_2311 =
  'João (WAXLO), 23/11/2026: atende SUS; as regras de cada convênio são explicadas pelo WhatsApp (as mesmas de todas as clínicas)';

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
    regras: confirmado('o que cada plano pede é explicado pelo WhatsApp', FONTE_2311),
    textoSePendente: CONFIRME,
  },
  {
    id: 'aapl',
    ordem: 3,
    nome: 'AAPL',
    nomeCompleto: 'AAPL (Associação dos Aposentados e Pensionistas de Lages)',
    atende: confirmado(true, `${FONTE} (arte "Nova parceria!": "credenciada com a AAPL")`),
    regras: confirmado('como funciona para o associado é explicado pelo WhatsApp', FONTE_2311),
    textoSePendente: CONFIRME,
  },
  {
    id: 'sus',
    ordem: 4,
    nome: 'SUS',
    nomeCompleto: 'SUS (Sistema Único de Saúde)',
    atende: confirmado(true, FONTE_2311),
    regras: confirmado('caminho de acesso explicado pelo WhatsApp', FONTE_2311),
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
