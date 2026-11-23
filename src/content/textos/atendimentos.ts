// Páginas /atendimentos e /atendimentos/<id>. Só atendimentos publicados (dados/atendimentos.ts).
// Sem promessa de resultado (COFFITO Art. 15, III): fala-se de avaliação, plano e acompanhamento.
// Sem "especialista" (Art. 30 e 48, I): são "atendimentos".
import { CONFIRME, f, type Frase, type Meta, type Pergunta, type VerbeteTexto } from './tipos.ts';

export interface TextoAtendimento {
  readonly id: 'musculoesqueletica';
  readonly meta: Meta;
  readonly verbete: VerbeteTexto;
  readonly oQueE: readonly Frase[];
  readonly paraQuem: readonly Frase[];
  readonly comoE: readonly Frase[];
  readonly perguntas: readonly Pergunta[];
}

export const paginaAtendimentos = {
  meta: {
    titulo: 'Atendimentos de fisioterapia em Lages · Ardeli',
    descricao:
      'Fisioterapia no bairro Brusque, em Lages: dor na coluna e nas articulações, pós-operatório e recuperação após lesão. Particular, Unimed e AAPL.',
  } satisfies Meta,
  verbete: {
    palavra: 'atendimento',
    classe: 's.m.',
    acepcoes: [
      f('O cuidado que você recebe na Ardeli, sempre a partir de uma avaliação.', 'pratica'),
      f('Aqui estão os atendimentos que a clínica oferece hoje.', 'vitrine', 'cnes'),
    ],
  } satisfies VerbeteTexto,
  outros: f(`Não achou o que procura? ${CONFIRME}`, 'orientacao'),
} as const;

export const textosAtendimentos: readonly TextoAtendimento[] = [
  {
    id: 'musculoesqueletica',
    meta: {
      titulo: 'Fisioterapia para dor e pós-operatório em Lages',
      descricao:
        'Fisioterapia para dor na coluna e nas articulações, pós-operatório e recuperação após lesão, no bairro Brusque, em Lages. Unimed, AAPL e particular.',
    },
    verbete: {
      palavra: 'recuperação',
      classe: 's.f.',
      acepcoes: [
        f(
          'Voltar a fazer, com segurança, o que a dor ou a lesão tirou do seu dia a dia.',
          'vitrine',
          'orientacao',
        ),
        f(
          'Na Ardeli: avaliação, plano de exercícios e acompanhamento depois de cirurgia, lesão ou dor na coluna e nas articulações.',
          'pratica',
          'vitrine',
        ),
      ],
    },
    oQueE: [
      f(
        'É o cuidado com os músculos, os ossos e as articulações (as “juntas”, como joelho, ombro e quadril).',
        'orientacao',
        'cnes',
      ),
      f(
        'Na vitrine da clínica, aparece como recuperação funcional: movimento, independência e qualidade de vida.',
        'vitrine',
      ),
    ],
    paraQuem: [
      f('Quem sente dor na coluna, no ombro, no joelho ou em outras articulações.', 'orientacao'),
      f(
        'Quem passou por uma cirurgia e está no pós-operatório, que é o período de recuperação depois da cirurgia.',
        'orientacao',
      ),
      f(
        'Quem se machucou, em casa, no trabalho ou no esporte, e quer voltar às atividades.',
        'orientacao',
      ),
    ],
    comoE: [
      f(
        'Tudo começa com uma avaliação: a fisioterapeuta conversa com você e observa como você se move.',
        'pratica',
      ),
      f(
        'Depois, ela monta um plano com exercícios e, quando indicado, outros recursos.',
        'pratica',
      ),
      f(
        'Um desses recursos é a eletroterapia: um aparelho que usa pequenas correntes elétricas na pele. A clínica tem o equipamento.',
        'orientacao',
        'tour',
      ),
      f(
        'Os exercícios acontecem no ginásio da clínica, com espaldar (uma escada de madeira presa à parede), bolas, faixas elásticas, halteres, esteira e bicicletas.',
        'tour',
      ),
      f('A cada sessão, o plano é revisto com você.', 'pratica'),
    ],
    perguntas: [
      {
        id: 'quanto-tempo-tratamento',
        pergunta: 'Quanto tempo dura o tratamento?',
        resposta: [
          f(
            'Depende do que a avaliação mostrar e de como você responde aos exercícios.',
            'pratica',
          ),
          f('A fisioterapeuta explica o plano e revisa com você ao longo das sessões.', 'pratica'),
        ],
        publicado: true,
      },
      {
        id: 'convenio',
        pergunta: 'Posso fazer pela Unimed ou pela AAPL?',
        resposta: [
          f('Sim. A Ardeli atende particular, Unimed e AAPL.', 'joao', 'postUnimed', 'postAapl'),
          f(
            'Para saber o que o seu plano pede, confirme pelo WhatsApp: a gente explica rapidinho.',
            'orientacao',
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
      {
        id: 'o-que-vestir',
        pergunta: 'Que roupa eu uso?',
        resposta: [
          f(
            'Roupa confortável, que deixe você se mexer à vontade. Se a dor for no joelho ou no ombro, prefira peças que deixem a região livre.',
            'orientacao',
          ),
        ],
        publicado: true,
      },
    ],
  },
];
