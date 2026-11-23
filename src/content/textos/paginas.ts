// Textos das páginas internas: primeira avaliação, quem cuida, a clínica, como chegar,
// avaliar (QR), privacidade e 404.
import { clinica } from '../../config/clinica.ts';
import { valorDe } from '../../config/tipos.ts';
import { CONFIRME, condicional, f, type Frase, type Meta, type VerbeteTexto } from './tipos.ts';

/** Endereço em uma linha, igual ao da config (NAP). */
const LINHA_ENDERECO = valorDe(clinica.endereco)?.linha ?? '';
const CNPJ = valorDe(clinica.empresa.cnpj) ?? '';

// ---------- /primeira-avaliacao ----------
export const primeiraAvaliacao = {
  meta: {
    titulo: 'Primeira avaliação de fisioterapia · Ardeli, Lages',
    descricao:
      'Como é a primeira avaliação de fisioterapia na Ardeli, no Brusque, em Lages: passo a passo, o que levar e como agendar pela Unimed, AAPL ou particular.',
  } satisfies Meta,
  verbete: {
    palavra: 'avaliação',
    classe: 's.f.',
    acepcoes: [
      f(
        'O primeiro encontro com a fisioterapeuta. Serve para entender o que você sente e montar um plano só seu.',
        'pratica',
      ),
      f('Você não precisa saber o nome do problema. Basta contar o que sente.', 'orientacao'),
    ],
  } satisfies VerbeteTexto,
  passos: [
    {
      titulo: 'Conversa',
      texto: [
        f('Você conta o que sente, desde quando e o que atrapalha no seu dia a dia.', 'pratica'),
        f('Se você já fez cirurgia ou exames, este é o momento de mostrar.', 'orientacao'),
      ],
    },
    {
      titulo: 'Avaliação',
      texto: [
        f(
          'Avaliação funcional: a fisioterapeuta observa como você se move para montar o plano.',
          'pratica',
        ),
        f(
          'Ela pode pedir que você caminhe, levante os braços ou dobre os joelhos. Você só faz o que conseguir.',
          'pratica',
        ),
      ],
    },
    {
      titulo: 'Plano',
      texto: [
        f('Ela explica, com palavras simples, o que encontrou.', 'pratica'),
        f('Juntos, vocês combinam os objetivos e quantas vezes por semana você vem.', 'pratica'),
      ],
    },
    {
      titulo: 'Acompanhamento',
      texto: [
        f('A cada sessão, o plano é revisto. Se algo mudar, a gente ajusta.', 'pratica'),
        f('Qualquer dúvida, pergunte na hora ou pelo WhatsApp.', 'orientacao'),
      ],
    },
  ],
  duracao: {
    titulo: 'Quanto tempo leva',
    texto: [
      condicional(
        'tempo-confirmado',
        'A primeira avaliação leva cerca de [CONFIRMAR] minutos.',
        'joao',
      ),
    ],
    sePendente: f(`Quer saber quanto tempo leva? ${CONFIRME}`, 'orientacao'),
  },
  oQueLevar: {
    titulo: 'O que levar',
    itens: [
      f('Documento com foto.', 'orientacao'),
      f(
        'Carteirinha do convênio (Unimed ou AAPL), se for o seu caso.',
        'orientacao',
        'postUnimed',
        'postAapl',
      ),
      f('Pedido médico, se você tiver.', 'orientacao'),
      f('Exames recentes, se você tiver (raio-X, ressonância, laudos).', 'orientacao'),
      f('A lista dos remédios que você usa.', 'orientacao'),
    ],
    imprimir: 'Imprimir esta lista',
  },
  roupa: {
    titulo: 'Que roupa usar',
    texto: [
      f(
        'Roupa confortável, que deixe você se mexer à vontade, e calçado fechado e firme.',
        'orientacao',
      ),
      f(
        'Se a dor for no joelho ou no ombro, prefira peças que deixem a região livre.',
        'orientacao',
      ),
    ],
  },
  acessibilidade: {
    titulo: 'Acessibilidade',
    // Pendente: entrada sem degrau, banheiro adaptado, estacionamento (clinica.acessibilidade).
    sePendente: f(
      `Precisa de alguma adaptação para chegar ou circular na clínica? ${CONFIRME}`,
      'orientacao',
    ),
  },
} as const;

// ---------- /quem-cuida ----------
export const quemCuida = {
  meta: {
    titulo: 'Quem cuida: fisioterapeutas da Ardeli em Lages',
    descricao:
      'Quem cuida de você na Ardeli Fisioterapia, no Brusque, em Lages: Andriele da Silva, que atende na cidade desde 2018, e Nicole de Abreu Batista.',
  } satisfies Meta,
  verbete: {
    palavra: 'acolhimento',
    classe: 's.m.',
    acepcoes: [
      f('Receber com calma, ouvir com atenção e explicar cada passo.', 'reel', 'orientacao'),
      f('É o que você encontra com quem cuida de você na Ardeli.', 'reel'),
    ],
  } satisfies VerbeteTexto,
  // Os fatos de cada profissional ficam em src/content/dados/profissionais.ts (resumo com fonte).
  crefitoExplicado: f(
    'CREFITO-10 é o conselho que registra os fisioterapeutas de Santa Catarina. O número de inscrição aparece em toda divulgação, como pede o Código de Ética.',
    'coffito',
  ),
  empresa: f('A clínica também é registrada no CREFITO-10, com o número RE005047.', 'crefito'),
  studioAr: f(
    'Antes da Ardeli, a Andriele abriu o Studio Ar Pilates e Fisioterapia, em Lages, em janeiro de 2018.',
    'studioAr',
  ),
  topClass: f(
    'Desde 2024, ela também forma instrutores de Pilates no curso Top Class.',
    'topClass',
  ),
  crefitoPendente: 'CREFITO-10: número em confirmação',
} as const;

// ---------- /a-clinica ----------
export const aClinica = {
  meta: {
    titulo: 'Conheça a clínica de fisioterapia no Brusque · Ardeli',
    descricao:
      'Veja por dentro a Ardeli Fisioterapia, no bairro Brusque, em Lages: recepção, ginásio de reabilitação, sala de esteira e bikes e dois consultórios.',
  } satisfies Meta,
  verbete: {
    palavra: 'espaço',
    classe: 's.m.',
    acepcoes: [
      f('Um lugar pensado para você se movimentar com segurança.', 'tour', 'orientacao'),
      f('Recepção, ginásio, sala de esteira e bikes e dois consultórios.', 'tour'),
    ],
  } satisfies VerbeteTexto,
  video: {
    rotulo: 'Ver o tour em vídeo',
    aviso: f('Vídeo sem som, com capítulos. Pode pausar a qualquer momento.', 'tour', 'site'),
  },
  // Um parágrafo curto por capítulo do tour (ids = media.manifest.json → tour.capitulos).
  capitulos: {
    fachada: f(
      'A fachada branca com o letreiro da Ardeli, no número 2700 da Av. Dom Pedro II.',
      'tour',
      'google',
    ),
    vitrine: f(
      'Na vitrine, as quatro palavras da clínica: fisioterapia, recuperação funcional, bem-estar e atendimento acessível.',
      'tour',
      'vitrine',
    ),
    entrada: f(
      'Na porta de vidro, a frase “Cuidar do seu corpo é investir na sua qualidade de vida”. No chão, o tapete com o nome da clínica.',
      'tour',
      'porta',
    ),
    cardio: f('A sala de esteira e bikes, com a parede vermelha e o relógio.', 'tour'),
    ginasio: f(
      'O ginásio de reabilitação: teto com treliça de madeira, espaldar, tablado, bolas, faixas elásticas e halteres.',
      'tour',
    ),
    corredor: f(
      'O corredor de piso de taco, com o bebedouro e o jardim vertical ao fundo.',
      'tour',
    ),
    'consultorio-1': f(
      'O consultório 1, com maca, aparelho de eletroterapia e o quadro “fisioterapia, s.f.” na parede.',
      'tour',
    ),
    portas: f('O corredor dos consultórios, com as portas identificadas.', 'tour'),
    'consultorio-2': f(
      'O consultório 2, com maca, janela e quadros de anatomia na parede.',
      'tour',
    ),
    recepcao: f('A recepção, com a divisória de vidro e a vista para a avenida.', 'tour'),
    'ginasio-final': f(
      'De volta ao ginásio, amplo e claro, com janelas grandes para a avenida.',
      'tour',
    ),
  } satisfies Record<string, Frase>,
  quadro: {
    titulo: 'De onde vem o “verbete”',
    texto: [
      f(
        'Na parede do consultório 1 há um quadro com a palavra “fisioterapia” escrita como num dicionário: a palavra, a classe (s.f., substantivo feminino) e dois significados numerados.',
        'tour',
        'quadro',
      ),
      f(
        'Este site usa o mesmo jeito de escrever. Cada parte abre com uma palavra e o que ela quer dizer aqui.',
        'prompt',
      ),
    ],
  },
} as const;

// ---------- /como-chegar ----------
export const comoChegar = {
  meta: {
    titulo: 'Como chegar à Ardeli Fisioterapia · Brusque, Lages',
    descricao: `Ardeli Fisioterapia: ${LINHA_ENDERECO}. Segunda a sexta, das 8h às 20h. Rotas pelo Google Maps, Waze e Apple Mapas.`,
  } satisfies Meta,
  verbete: {
    palavra: 'endereço',
    classe: 's.m.',
    acepcoes: [
      f('Av. Dom Pedro II, 2700, no bairro Brusque, em Lages (SC). CEP 88503-062.', 'google'),
      f('Segunda a sexta, das 8h às 20h. Sábado e domingo, fechado.', 'joao', 'google'),
    ],
  } satisfies VerbeteTexto,
  rotas: { google: 'Abrir no Google Maps', waze: 'Abrir no Waze', apple: 'Abrir no Apple Mapas' },
  pontoDeReferencia: {
    sePendente: f(`Precisa de um ponto de referência? ${CONFIRME}`, 'orientacao'),
  },
  estacionamento: {
    sePendente: f(`Vai de carro e quer saber onde estacionar? ${CONFIRME}`, 'orientacao'),
  },
  acessibilidade: {
    sePendente: f(`Precisa de alguma adaptação para entrar na clínica? ${CONFIRME}`, 'orientacao'),
  },
  plusCode: f('Código do Google (plus code): 5MFF+VP Lages, SC.', 'google'),
} as const;

// ---------- /avaliar e /avaliar/qr ----------
export const avaliar = {
  meta: {
    titulo: 'Avalie a Ardeli Fisioterapia no Google',
    descricao:
      'Foi atendido na Ardeli Fisioterapia, no Brusque, em Lages? Conte como foi no Google. Sua opinião ajuda outras pessoas a encontrarem cuidado perto de casa.',
  } satisfies Meta,
  qr: {
    titulo: 'Conte como foi o seu atendimento',
    frase: f('Sua opinião ajuda outras pessoas a encontrarem cuidado perto de casa.', 'prompt'),
    instrucao: f(
      'Aponte a câmera do celular para o código e toque no link que aparecer.',
      'orientacao',
    ),
    rodape: f(`Ardeli Fisioterapia · ${LINHA_ENDERECO}`, 'google'),
  },
  redirecionando: f('Abrindo a página da Ardeli no Google…', 'site'),
  seNaoAbrir: 'Se não abrir sozinho, toque aqui',
} as const;

// ---------- /privacidade ----------
export const privacidade = {
  meta: {
    titulo: 'Privacidade · Ardeli Fisioterapia',
    descricao:
      'Como o site da Ardeli Fisioterapia, em Lages, trata seus dados: sem cadastro e sem guardar nada sobre sua saúde. A mensagem sai do seu celular.',
  } satisfies Meta,
  verbete: {
    palavra: 'privacidade',
    classe: 's.f.',
    acepcoes: [
      f('O direito de decidir quem sabe o quê sobre você.', 'lgpd', 'orientacao'),
      f(
        'Neste site, o que você conta sobre a sua saúde fica com você até você decidir enviar.',
        'site',
      ),
    ],
  } satisfies VerbeteTexto,
  secoes: [
    {
      titulo: 'Dado de saúde é sensível',
      texto: [
        f(
          'A lei brasileira (LGPD) chama de “dado sensível” tudo o que fala da sua saúde, como uma dor ou uma cirurgia. Ele pede cuidado redobrado.',
          'lgpd',
        ),
        f(
          'Por isso, este site não tem formulário, não pede cadastro e não guarda nada sobre a sua saúde.',
          'site',
        ),
      ],
    },
    {
      titulo: 'Como funciona o agendamento',
      texto: [
        f(
          'Quando você escolhe o convênio, o motivo e o dia de sua preferência, o site só monta uma mensagem no seu próprio celular.',
          'site',
        ),
        f(
          'A mensagem só sai quando você toca em enviar no WhatsApp. Antes disso, nada é enviado. O motivo é opcional e genérico, como “dor” ou “pós-operatório”.',
          'site',
        ),
        f(
          'Depois de enviada, a mensagem chega à clínica pelo WhatsApp, que é um serviço de outra empresa (Meta), com as regras de privacidade dela.',
          'site',
        ),
      ],
    },
    {
      titulo: 'O que fica no seu aparelho',
      texto: [
        f(
          'O tamanho de letra que você escolher (A− / A+) fica guardado só no seu aparelho, para a próxima visita.',
          'site',
        ),
        f(
          'A abertura animada do site aparece uma vez por visita; essa marcação some quando você fecha o navegador.',
          'site',
        ),
        f('O site não usa cookies de propaganda nem rastreamento.', 'site'),
        f(
          'Para melhorar o site, contamos cliques e opções escolhidas (como o convênio ou o tipo de motivo), sem cookie e sem saber quem escolheu. O que você escreve nunca é contado.',
          'site',
        ),
      ],
    },
    {
      titulo: 'Mapa e vídeo',
      texto: [
        f(
          'O mapa do Google só carrega se você tocar em “Mostrar o mapa” e aceitar. Antes disso, nada é enviado ao Google.',
          'site',
        ),
        f('O vídeo da clínica fica no próprio site, sem som.', 'site', 'tour'),
      ],
    },
    {
      titulo: 'Seus direitos',
      texto: [
        f(
          'Você pode pedir para saber, corrigir ou apagar os dados que a clínica tem sobre você, como as mensagens de WhatsApp.',
          'lgpd',
        ),
        f('Para isso, fale com a clínica pelo WhatsApp (49) 99928-1721 ou na recepção.', 'joao'),
      ],
    },
    {
      titulo: 'Quem é responsável',
      texto: [
        f(
          `Ardeli Fisioterapia (60.246.544 Andriele da Silva, CNPJ ${CNPJ}), ${LINHA_ENDERECO.replace(' – SC, ', ' – SC,\u00a0')}.`,
          'cnes',
          'crefito',
          'google',
        ),
      ],
    },
  ],
  atualizado: 'Atualizada em novembro de 2026.',
} as const;

// ---------- 404 ----------
export const naoEncontrada = {
  meta: {
    titulo: 'Página não encontrada · Ardeli Fisioterapia',
    descricao:
      'Esta página não existe no site da Ardeli Fisioterapia, em Lages. Veja os convênios, os atendimentos ou fale pelo WhatsApp.',
  } satisfies Meta,
  verbete: {
    palavra: 'desvio',
    classe: 's.m.',
    acepcoes: [
      f(
        'Esta página não existe. Talvez o endereço tenha mudado ou tenha um erro de digitação.',
        'site',
      ),
      f('Escolha um caminho abaixo ou fale com a clínica pelo WhatsApp.', 'orientacao'),
    ],
  } satisfies VerbeteTexto,
  inicio: 'Voltar para o início',
} as const;
