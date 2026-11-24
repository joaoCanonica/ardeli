// Páginas /atendimentos e /atendimentos/<id>. Só atendimentos publicados (dados/atendimentos.ts).
// Sem promessa de resultado (COFFITO Art. 15, III): fala-se de avaliação, plano e acompanhamento.
// Sem "especialista" (Art. 30 e 48, I): são "atendimentos".
import { CONFIRME, f, type Frase, type Meta, type Pergunta, type VerbeteTexto } from './tipos.ts';

export interface PassoAtendimento {
  readonly titulo: string;
  readonly texto: Frase;
  /** Foto real do lugar onde o passo acontece (still do tour). */
  readonly foto?: { readonly id: string; readonly legenda: string };
}

export interface TextoAtendimento {
  readonly id:
    | 'musculoesqueletica'
    | 'neurologia'
    | 'cardiorrespiratoria'
    | 'oncologia'
    | 'obstetrica'
    | 'queimados';
  /** Foto real do espaço que acompanha a página (still do tour). */
  readonly foto: {
    readonly id: string;
    readonly legenda: string;
    readonly tom: 'salvia' | 'madeira' | 'tijolo';
  };
  readonly meta: Meta;
  readonly verbete: VerbeteTexto;
  readonly oQueE: readonly Frase[];
  readonly paraQuem: readonly Frase[];
  /** Como é o atendimento NA ARDELI, em passos, com a foto do lugar onde acontece. */
  readonly comoE: readonly PassoAtendimento[];
  readonly perguntas: readonly Pergunta[];
}

export const paginaAtendimentos = {
  meta: {
    titulo: 'Atendimentos de fisioterapia em Lages · Ardeli',
    descricao:
      'Fisioterapia no Brusque, em Lages: ortopedia e dor, neurologia, respiração, oncologia, gestação e pós-parto e queimaduras. Particular, Unimed, AAPL e SUS.',
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

/** Pergunta comum a todos os atendimentos. */
const perguntaConvenio: Pergunta = {
  id: 'convenio',
  pergunta: 'Posso fazer pelo convênio ou pelo SUS?',
  resposta: [
    f('Sim. A Ardeli atende particular, Unimed, AAPL e SUS.', 'joao', 'joao2311'),
    f(
      'Para saber o que o seu convênio pede, confirme pelo WhatsApp: a gente explica rapidinho.',
      'orientacao',
    ),
  ],
  publicado: true,
};

export const textosAtendimentos: readonly TextoAtendimento[] = [
  {
    id: 'musculoesqueletica',
    foto: { id: 'still-espaldar-4x5', legenda: 'Ginásio de reabilitação', tom: 'tijolo' },
    meta: {
      titulo: 'Fisioterapia para dor e pós-operatório em Lages',
      descricao:
        'Fisioterapia para dor na coluna e nas articulações, pós-operatório e recuperação após lesão, no Brusque, em Lages. Unimed, AAPL, SUS e particular.',
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
      {
        titulo: 'Conversa e avaliação',
        texto: f(
          'Na primeira consulta, a fisioterapeuta recebe você num dos dois consultórios da clínica, com calma. Ela ouve o que você sente e observa como você se movimenta.',
          'tour',
          'reel',
          'pratica',
        ),
        foto: { id: 'still-consultorio-1-4x5', legenda: 'Consultório 1' },
      },
      {
        titulo: 'Plano',
        texto: f(
          'Ela explica o que encontrou e combina com você os objetivos e a frequência das sessões.',
          'pratica',
        ),
      },
      {
        titulo: 'Exercícios no ginásio',
        texto: f(
          'Os exercícios são no ginásio de reabilitação, com espaldar (uma escada de madeira presa à parede), tablado, bolas, faixas elásticas e halteres. Quando indicado, entra a eletroterapia: um aparelho que usa pequenas correntes elétricas na pele.',
          'tour',
          'orientacao',
        ),
        foto: { id: 'still-ginasio-trelica-4x5', legenda: 'Ginásio de reabilitação' },
      },
      {
        titulo: 'Acompanhamento',
        texto: f(
          'A cada sessão, o plano é revisto com você. As sessões são de segunda a sexta, das 8h às 20h.',
          'pratica',
          'joao',
        ),
      },
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
        pergunta: 'Posso fazer pelo convênio ou pelo SUS?',
        resposta: [
          f(
            'Sim. A Ardeli atende particular, Unimed, AAPL e SUS.',
            'joao',
            'joao2311',
            'postUnimed',
            'postAapl',
          ),
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
  {
    id: 'neurologia',
    foto: {
      id: 'still-ginasio-amplo-4x5',
      legenda: 'Ginásio, vista para a avenida',
      tom: 'tijolo',
    },
    meta: {
      titulo: 'Fisioterapia neurológica em Lages: AVC e Parkinson · Ardeli',
      descricao:
        'Fisioterapia depois de AVC e em condições que afetam os nervos e o movimento, no Brusque, em Lages. Particular, Unimed, AAPL e SUS.',
    },
    verbete: {
      palavra: 'equilíbrio',
      classe: 's.m.',
      acepcoes: [
        f('Ficar de pé, andar e se virar com mais firmeza e segurança.', 'orientacao'),
        f(
          'Na Ardeli: avaliação, exercícios de movimento, força e equilíbrio, e acompanhamento.',
          'pratica',
          'cnes',
          'joao2311',
        ),
      ],
    },
    oQueE: [
      f(
        'É a fisioterapia para quem teve o sistema nervoso afetado: o cérebro, a medula ou os nervos que comandam o movimento.',
        'orientacao',
        'cnes',
      ),
      f(
        'O foco é o dia a dia: levantar da cadeira, andar, subir um degrau, usar as mãos.',
        'orientacao',
      ),
    ],
    paraQuem: [
      f('Quem teve AVC (derrame) e quer recuperar movimentos.', 'orientacao'),
      f(
        'Quem tem doença de Parkinson ou outra condição que afeta o equilíbrio e a coordenação.',
        'orientacao',
      ),
      f('Quem sente fraqueza, formigamento ou falta de firmeza ao andar.', 'orientacao'),
    ],
    comoE: [
      {
        titulo: 'Conversa e avaliação',
        texto: f(
          'Na primeira consulta, a fisioterapeuta recebe você num dos dois consultórios da clínica, com calma. Ela ouve o que você sente e observa como você se movimenta.',
          'tour',
          'reel',
          'pratica',
        ),
        foto: { id: 'still-consultorio-1-4x5', legenda: 'Consultório 1' },
      },
      {
        titulo: 'Plano',
        texto: f(
          'Ela explica o que encontrou e combina com você os objetivos e a frequência das sessões.',
          'pratica',
        ),
      },
      {
        titulo: 'Exercícios no ginásio',
        texto: f(
          'No ginásio, o tablado e o espaldar (uma escada de madeira presa à parede) ajudam a treinar levantar, andar e se equilibrar com apoio. Bolas e faixas completam os exercícios, no ritmo de cada pessoa. Um familiar pode acompanhar.',
          'tour',
          'pratica',
        ),
        foto: { id: 'still-ginasio-trelica-4x5', legenda: 'Ginásio de reabilitação' },
      },
      {
        titulo: 'Acompanhamento',
        texto: f(
          'A cada sessão, o plano é revisto com você. As sessões são de segunda a sexta, das 8h às 20h.',
          'pratica',
          'joao',
        ),
      },
    ],
    perguntas: [perguntaConvenio],
  },
  {
    id: 'cardiorrespiratoria',
    foto: { id: 'still-cardio-4x5', legenda: 'Sala de esteira e bikes', tom: 'tijolo' },
    meta: {
      titulo: 'Fisioterapia respiratória e cardíaca em Lages · Ardeli',
      descricao:
        'Fisioterapia para respirar melhor e ganhar fôlego: doenças do pulmão e do coração, no Brusque, em Lages. Particular, Unimed, AAPL e SUS.',
    },
    verbete: {
      palavra: 'fôlego',
      classe: 's.m.',
      acepcoes: [
        f(
          'A reserva de ar que deixa você andar, subir escada e conversar sem cansar tanto.',
          'orientacao',
        ),
        f(
          'Na Ardeli: avaliação, exercícios de respiração e de condicionamento, e acompanhamento.',
          'pratica',
          'cnes',
          'joao2311',
        ),
      ],
    },
    oQueE: [
      f(
        'É a fisioterapia que cuida da respiração e do condicionamento do corpo, em quem tem problemas no pulmão ou no coração.',
        'orientacao',
        'cnes',
      ),
      f(
        'Condicionamento é a capacidade de fazer esforço, como caminhar ou subir escada, com menos cansaço.',
        'orientacao',
      ),
    ],
    paraQuem: [
      f(
        'Quem tem doença respiratória, como asma, bronquite crônica ou enfisema, e sente falta de ar.',
        'orientacao',
      ),
      f(
        'Quem tem problema no coração e recebeu orientação médica para fazer exercício com acompanhamento.',
        'orientacao',
      ),
      f('Quem ficou com cansaço ou pouco fôlego depois de uma internação.', 'orientacao'),
    ],
    comoE: [
      {
        titulo: 'Conversa e avaliação',
        texto: f(
          'Na primeira consulta, a fisioterapeuta recebe você num dos dois consultórios da clínica, com calma. Ela ouve o que você sente e observa como você se movimenta.',
          'tour',
          'reel',
          'pratica',
        ),
        foto: { id: 'still-consultorio-1-4x5', legenda: 'Consultório 1' },
      },
      {
        titulo: 'Plano',
        texto: f(
          'Ela explica o que encontrou e combina com você os objetivos e a frequência das sessões.',
          'pratica',
        ),
      },
      {
        titulo: 'Fôlego na sala de esteira e bikes',
        texto: f(
          'O condicionamento é feito na sala com esteira e bicicletas, aos poucos e sempre acompanhado. Os exercícios de respiração podem ser no ginásio ou no consultório.',
          'tour',
          'pratica',
        ),
        foto: { id: 'still-cardio-4x5', legenda: 'Sala de esteira e bikes' },
      },
      {
        titulo: 'Acompanhamento',
        texto: f(
          'A cada sessão, o plano é revisto com você. As sessões são de segunda a sexta, das 8h às 20h.',
          'pratica',
          'joao',
        ),
      },
    ],
    perguntas: [perguntaConvenio],
  },
  {
    id: 'oncologia',
    foto: { id: 'still-consultorio-1-4x5', legenda: 'Consultório 1', tom: 'madeira' },
    meta: {
      titulo: 'Fisioterapia durante e depois do câncer em Lages · Ardeli',
      descricao:
        'Fisioterapia durante e depois do tratamento do câncer, no bairro Brusque, em Lages: movimento, força e cansaço. Particular, Unimed, AAPL e SUS.',
    },
    verbete: {
      palavra: 'cuidado',
      classe: 's.m.',
      acepcoes: [
        f('Atenção ao corpo em cada fase do tratamento, no tempo de cada pessoa.', 'orientacao'),
        f(
          'Na Ardeli: avaliação, exercícios e orientações durante e depois do tratamento do câncer.',
          'pratica',
          'cnes',
          'joao2311',
        ),
      ],
    },
    oQueE: [
      f(
        'É a fisioterapia para quem está em tratamento de câncer ou já terminou e quer cuidar do movimento e da disposição.',
        'orientacao',
        'cnes',
      ),
      f(
        'Ela acompanha efeitos comuns do tratamento, como cansaço, perda de força e dificuldade de movimentar um braço depois de uma cirurgia.',
        'orientacao',
      ),
    ],
    paraQuem: [
      f(
        'Quem está fazendo tratamento de câncer e foi orientado a fazer fisioterapia.',
        'orientacao',
      ),
      f('Quem terminou o tratamento e quer voltar às atividades do dia a dia.', 'orientacao'),
      f('Quem fez cirurgia por causa de um câncer, como a de mama.', 'orientacao'),
    ],
    comoE: [
      {
        titulo: 'Conversa e avaliação',
        texto: f(
          'Na primeira consulta, a fisioterapeuta recebe você num dos dois consultórios da clínica, com calma. Ela ouve o que você sente e observa como você se movimenta.',
          'tour',
          'reel',
          'pratica',
        ),
        foto: { id: 'still-consultorio-1-4x5', legenda: 'Consultório 1' },
      },
      {
        titulo: 'Plano',
        texto: f(
          'Ela explica o que encontrou e combina com você os objetivos e a frequência das sessões.',
          'pratica',
        ),
      },
      {
        titulo: 'Sessões no seu ritmo',
        texto: f(
          'As sessões podem ser no consultório, com mais privacidade, ou no ginásio, com exercícios leves e adaptados ao momento do tratamento, respeitando as orientações do seu médico.',
          'tour',
          'pratica',
        ),
        foto: { id: 'still-consultorio-2-4x5', legenda: 'Consultório 2' },
      },
      {
        titulo: 'Acompanhamento',
        texto: f(
          'A cada sessão, o plano é revisto com você. As sessões são de segunda a sexta, das 8h às 20h.',
          'pratica',
          'joao',
        ),
      },
    ],
    perguntas: [perguntaConvenio],
  },
  {
    id: 'obstetrica',
    foto: { id: 'still-consultorio-2-4x5', legenda: 'Consultório 2', tom: 'madeira' },
    meta: {
      titulo: 'Fisioterapia na gestação e no pós-parto em Lages · Ardeli',
      descricao:
        'Fisioterapia na gravidez e depois do parto, no bairro Brusque, em Lages: dores, postura e retorno às atividades. Particular, Unimed, AAPL e SUS.',
    },
    verbete: {
      palavra: 'gestação',
      classe: 's.f.',
      acepcoes: [
        f('O tempo da gravidez, em que o corpo muda a cada semana.', 'orientacao'),
        f(
          'Na Ardeli: avaliação, exercícios e orientações na gravidez e depois do parto.',
          'pratica',
          'cnes',
          'joao2311',
        ),
      ],
    },
    oQueE: [
      f(
        'É a fisioterapia que acompanha a mulher na gravidez e depois do parto.',
        'orientacao',
        'cnes',
      ),
      f(
        'Ela ajuda com as dores e os desconfortos dessa fase e com a volta às atividades depois que o bebê nasce.',
        'orientacao',
      ),
    ],
    paraQuem: [
      f('Gestantes com dor nas costas, nas pernas ou no quadril.', 'orientacao'),
      f('Mulheres no pós-parto que querem voltar às atividades com segurança.', 'orientacao'),
    ],
    comoE: [
      {
        titulo: 'Conversa e avaliação',
        texto: f(
          'Na primeira consulta, a fisioterapeuta recebe você num dos dois consultórios da clínica, com calma. Ela ouve o que você sente e observa como você se movimenta.',
          'tour',
          'reel',
          'pratica',
        ),
        foto: { id: 'still-consultorio-1-4x5', legenda: 'Consultório 1' },
      },
      {
        titulo: 'Plano',
        texto: f(
          'Ela explica o que encontrou e combina com você os objetivos e a frequência das sessões.',
          'pratica',
        ),
      },
      {
        titulo: 'Exercícios para cada fase',
        texto: f(
          'No consultório, com privacidade, ou no ginásio, com bolas e tablado, os exercícios mudam conforme a fase da gravidez ou do pós-parto, respeitando as orientações do seu médico.',
          'tour',
          'pratica',
        ),
        foto: { id: 'still-ginasio-amplo-4x5', legenda: 'Ginásio de reabilitação' },
      },
      {
        titulo: 'Acompanhamento',
        texto: f(
          'A cada sessão, o plano é revisto com você. As sessões são de segunda a sexta, das 8h às 20h.',
          'pratica',
          'joao',
        ),
      },
    ],
    perguntas: [perguntaConvenio],
  },
  {
    id: 'queimados',
    foto: { id: 'still-ginasio-trelica-4x5', legenda: 'Ginásio de reabilitação', tom: 'tijolo' },
    meta: {
      titulo: 'Fisioterapia depois de queimaduras em Lages · Ardeli',
      descricao:
        'Fisioterapia para recuperar o movimento depois de uma queimadura, no bairro Brusque, em Lages. Particular, Unimed, AAPL e SUS.',
    },
    verbete: {
      palavra: 'pele',
      classe: 's.f.',
      acepcoes: [
        f(
          'Quando cicatriza depois de uma queimadura, ela pode repuxar e deixar o movimento mais difícil.',
          'orientacao',
        ),
        f(
          'Na Ardeli: avaliação, exercícios para movimentar a região e acompanhamento.',
          'pratica',
          'cnes',
          'joao2311',
        ),
      ],
    },
    oQueE: [
      f(
        'É a fisioterapia para quem teve uma queimadura e ficou com dificuldade de mexer a região atingida.',
        'orientacao',
        'cnes',
      ),
      f(
        'O cuidado é com o movimento das articulações perto da cicatriz, a força e as tarefas do dia a dia.',
        'orientacao',
      ),
    ],
    paraQuem: [
      f('Quem teve queimadura e foi orientado a fazer fisioterapia.', 'orientacao'),
      f(
        'Quem sente a pele repuxar ou tem dificuldade de dobrar ou esticar uma parte do corpo depois da queimadura.',
        'orientacao',
      ),
    ],
    comoE: [
      {
        titulo: 'Conversa e avaliação',
        texto: f(
          'Na primeira consulta, a fisioterapeuta recebe você num dos dois consultórios da clínica, com calma. Ela ouve o que você sente e observa como você se movimenta.',
          'tour',
          'reel',
          'pratica',
        ),
        foto: { id: 'still-consultorio-1-4x5', legenda: 'Consultório 1' },
      },
      {
        titulo: 'Plano',
        texto: f(
          'Ela explica o que encontrou e combina com você os objetivos e a frequência das sessões.',
          'pratica',
        ),
      },
      {
        titulo: 'Movimento no ginásio',
        texto: f(
          'No ginásio, com faixas, bolas e espaldar, os exercícios devolvem movimento à região aos poucos, no limite que a pele e a cicatriz permitem, respeitando as orientações do seu médico.',
          'tour',
          'pratica',
        ),
        foto: { id: 'still-ginasio-trelica-4x5', legenda: 'Ginásio de reabilitação' },
      },
      {
        titulo: 'Acompanhamento',
        texto: f(
          'A cada sessão, o plano é revisto com você. As sessões são de segunda a sexta, das 8h às 20h.',
          'pratica',
          'joao',
        ),
      },
    ],
    perguntas: [perguntaConvenio],
  },
];
