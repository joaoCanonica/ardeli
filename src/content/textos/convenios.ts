// Página /convenios. Para cada forma de atendimento: quem pode usar, o que levar, como agendar.
// Regra que falta confirmar → "Confirme pelo WhatsApp: a gente explica rapidinho."
// SUS: NADA é afirmado sem confirmação. O texto de "como funciona" fica guardado com
// exige: 'sus-confirmado' e só vai para a página quando convenios.sus.atende estiver confirmado.
import { CONFIRME, f, type Frase, type Meta, type VerbeteTexto } from './tipos.ts';

export interface TextoConvenio {
  readonly id: 'particular' | 'unimed' | 'aapl' | 'sus';
  readonly titulo: string;
  /** Título da seção em /convenios, como a pessoa pergunta (busca real). */
  readonly pergunta?: string;
  readonly resumo: Frase;
  readonly quemPodeUsar: readonly Frase[];
  readonly oQueLevar: readonly Frase[];
  readonly comoAgendar: readonly Frase[];
  readonly botao: string;
  /** Usado só enquanto o atendimento não está confirmado (hoje: SUS). */
  readonly sePendente?: readonly Frase[];
}

export const paginaConvenios = {
  meta: {
    titulo: 'Convênios: Unimed, AAPL, SUS e particular · Ardeli Lages',
    descricao:
      'Fisioterapia em Lages pela Unimed, pela AAPL, pelo SUS ou particular. Veja quem pode usar, o que levar e como agendar na Ardeli, no Brusque.',
  } satisfies Meta,
  verbete: {
    palavra: 'convênio',
    classe: 's.m.',
    acepcoes: [
      f(
        'O jeito como você vai ser atendido na Ardeli: particular, pela Unimed, pela AAPL ou pelo SUS.',
        'joao',
        'joao2311',
        'postUnimed',
        'postAapl',
      ),
      f('Em todos, o primeiro passo é o mesmo: uma avaliação com a fisioterapeuta.', 'pratica'),
    ],
  } satisfies VerbeteTexto,
  introducao: f(
    'Escolha a sua forma de atendimento. Se ficar alguma dúvida, é só chamar no WhatsApp.',
    'orientacao',
  ),
  geral: f(
    'Em qualquer forma de atendimento, leve um documento com foto e, se tiver, exames recentes e o pedido médico.',
    'orientacao',
  ),
} as const;

export const textosConvenios: readonly TextoConvenio[] = [
  {
    id: 'particular',
    titulo: 'Particular',
    resumo: f('Para quem prefere pagar direto à clínica, sem plano de saúde.', 'joao'),
    quemPodeUsar: [f('Qualquer pessoa.', 'joao')],
    oQueLevar: [
      f('Um documento com foto e, se tiver, exames recentes e o pedido médico.', 'orientacao'),
    ],
    comoAgendar: [
      f(
        'Chame no WhatsApp (49) 99928-1721. A mensagem já vai pronta: é só enviar.',
        'joao',
        'site',
      ),
      f('Valores são informados pelo WhatsApp ou na clínica.', 'coffito', 'orientacao'),
    ],
    botao: 'Agendar particular',
  },
  {
    id: 'unimed',
    titulo: 'Unimed Lages',
    pergunta: 'A Ardeli atende Unimed?',
    resumo: f('A Ardeli atende pacientes da Unimed.', 'postUnimed'),
    quemPodeUsar: [
      f('Quem tem plano Unimed.', 'postUnimed'),
      f(`Quais planos e modalidades são aceitos? ${CONFIRME}`, 'orientacao'),
    ],
    oQueLevar: [
      f('A carteirinha da Unimed e um documento com foto.', 'orientacao'),
      f('Se tiver, o pedido médico e exames recentes.', 'orientacao'),
      f(`Alguns planos pedem guia ou pedido médico. ${CONFIRME}`, 'orientacao'),
    ],
    comoAgendar: [
      f('Chame no WhatsApp e diga que é pela Unimed. A mensagem já vai pronta.', 'site'),
    ],
    botao: 'Agendar pela Unimed',
  },
  {
    id: 'aapl',
    titulo: 'AAPL',
    pergunta: 'Fisioterapia para aposentados da AAPL em Lages',
    resumo: f(
      'A Ardeli é credenciada pela AAPL, a Associação dos Aposentados e Pensionistas de Lages.',
      'postAapl',
    ),
    quemPodeUsar: [
      f('Associados da AAPL.', 'postAapl'),
      f(`Como funciona para o associado? ${CONFIRME}`, 'orientacao'),
    ],
    oQueLevar: [
      f('A carteirinha da AAPL e um documento com foto.', 'orientacao'),
      f('Se tiver, o pedido médico e exames recentes.', 'orientacao'),
    ],
    comoAgendar: [f('Chame no WhatsApp e diga que é pela AAPL. A mensagem já vai pronta.', 'site')],
    botao: 'Agendar pela AAPL',
  },
  {
    id: 'sus',
    titulo: 'SUS',
    pergunta: 'A Ardeli atende pelo SUS?',
    resumo: f('Sim. A Ardeli atende pelo SUS.', 'joao2311'),
    // Guardado para o caso de o SUS deixar de ser confirmado (convenios.sus.atende).
    sePendente: [
      f('Consulte a disponibilidade pelo WhatsApp.', 'joao'),
      f('A gente explica a situação do SUS na clínica hoje.', 'orientacao'),
    ],
    quemPodeUsar: [f('Quem é atendido pela rede pública de saúde.', 'joao2311', 'orientacao')],
    oQueLevar: [
      f(
        'O Cartão SUS, um documento com foto e, se tiver, o encaminhamento e exames recentes.',
        'orientacao',
      ),
    ],
    comoAgendar: [
      f(
        'Na rede pública, a fisioterapia costuma começar com o encaminhamento da Unidade Básica de Saúde (UBS). Chame no WhatsApp: a clínica explica como funciona no seu caso.',
        'orientacao',
        'joao2311',
      ),
    ],
    botao: 'Agendar pelo SUS',
  },
];
