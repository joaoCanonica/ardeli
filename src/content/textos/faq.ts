// /perguntas-frequentes. Pergunta com resposta pendente fica publicado: false (fora do site)
// até a pendência ser resolvida (docs/PENDENCIAS.md).
import { CONFIRME, f, type Meta, type Pergunta, type VerbeteTexto } from './tipos.ts';

export const faq = {
  meta: {
    titulo: 'Perguntas frequentes · Ardeli Fisioterapia, Lages',
    descricao:
      'Dúvidas sobre a Ardeli Fisioterapia, no bairro Brusque, em Lages: atende Unimed? Atende aposentados da AAPL? Como agendar a avaliação? Onde fica?',
  } satisfies Meta,
  verbete: {
    palavra: 'dúvida',
    classe: 's.f.',
    acepcoes: [
      f('Toda pergunta que aparece antes da primeira consulta. É normal ter várias.', 'orientacao'),
      f('Se a sua não estiver aqui, chame no WhatsApp.', 'orientacao'),
    ],
  } satisfies VerbeteTexto,
} as const;

export const grupos: readonly { titulo: string; perguntas: readonly Pergunta[] }[] = [
  {
    titulo: 'Convênios',
    perguntas: [
      {
        id: 'unimed',
        pergunta: 'A Ardeli atende Unimed?',
        resposta: [
          f('Sim. A Ardeli atende pacientes da Unimed.', 'postUnimed'),
          f(`Quais planos e se precisa de guia: ${CONFIRME}`, 'orientacao'),
        ],
        publicado: true,
      },
      {
        id: 'aapl',
        pergunta: 'Atende aposentados da AAPL?',
        resposta: [
          f(
            'Sim. A Ardeli é credenciada pela AAPL, a Associação dos Aposentados e Pensionistas de Lages.',
            'postAapl',
          ),
          f(`Como funciona para o associado: ${CONFIRME}`, 'orientacao'),
        ],
        publicado: true,
      },
      {
        id: 'sus',
        pergunta: 'Atende pelo SUS?',
        resposta: [
          f('Sim. A Ardeli atende pelo SUS.', 'joao2311'),
          f(
            'Na rede pública, a fisioterapia costuma começar com o encaminhamento da Unidade Básica de Saúde (UBS). Chame no WhatsApp: a clínica explica como funciona no seu caso.',
            'orientacao',
            'joao2311',
          ),
        ],
        publicado: true,
      },
      {
        id: 'pedido-medico',
        pergunta: 'Preciso de pedido médico?',
        resposta: [f(CONFIRME, 'orientacao')],
        publicado: false,
        pendencia: 'pedido-medico',
      },
    ],
  },
  {
    titulo: 'Agendamento e primeira avaliação',
    perguntas: [
      {
        id: 'como-agendar',
        pergunta: 'Como eu agendo?',
        resposta: [
          f('Pelo WhatsApp (49) 99928-1721.', 'joao'),
          f(
            'No site, toque em “Agendar avaliação”: escolha o convênio e o período, e a mensagem já vai pronta. É só enviar.',
            'site',
          ),
        ],
        publicado: true,
      },
      {
        id: 'o-que-levar',
        pergunta: 'O que eu levo na primeira avaliação?',
        resposta: [
          f(
            'Documento com foto, a carteirinha do convênio (se for o caso) e, se tiver, o pedido médico, exames recentes e a lista dos remédios que você usa.',
            'orientacao',
          ),
        ],
        publicado: true,
      },
      {
        id: 'duracao-sessao',
        pergunta: 'Quanto tempo dura a sessão?',
        resposta: [f(CONFIRME, 'orientacao')],
        publicado: false,
        pendencia: 'duracao-sessao',
      },
      {
        id: 'horario',
        pergunta: 'Qual é o horário de atendimento?',
        resposta: [
          f('Segunda a sexta, das 8h às 20h. Sábado e domingo, fechado.', 'joao', 'google'),
          f('Nos feriados, a clínica fica fechada.', 'joao2311'),
        ],
        publicado: true,
      },
    ],
  },
  {
    titulo: 'O espaço',
    perguntas: [
      {
        id: 'onde-fica',
        pergunta: 'Onde fica a clínica?',
        resposta: [
          f('Av. Dom Pedro II, 2700, no bairro Brusque, em Lages (SC).', 'google'),
          f('Perto do Colégio Industrial e da Delegacia da Polícia Civil.', 'joao2311'),
        ],
        publicado: true,
      },
      {
        id: 'estacionamento',
        pergunta: 'Tem estacionamento?',
        resposta: [f('Dá para estacionar na rua, em frente à clínica.', 'joao2311')],
        publicado: true,
      },
      {
        id: 'acessivel',
        pergunta: 'O espaço é acessível?',
        resposta: [f(CONFIRME, 'orientacao')],
        publicado: false,
        pendencia: 'acessibilidade',
      },
    ],
  },
];
