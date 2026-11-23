// Home, na ordem do Prompt 6A. Um verbete por seção.
// Voz: calma, clara, próxima; frases curtas; "você"; termo técnico explicado na 1ª vez.
import { CONFIRME, f, type VerbeteTexto } from './tipos.ts';

// ---------- capa ----------
export const H1_CAPA = 'Fisioterapia no Brusque, em Lages';
export const capa = {
  h1: f(H1_CAPA, 'google'),
  verbete: {
    palavra: 'cuidar',
    classe: 'v.t.d.',
    acepcoes: [
      f('Acompanhar a recuperação do seu movimento, da avaliação ao dia a dia.', 'prompt', 'bio'),
      f(
        'Fisioterapia no bairro Brusque, em Lages: particular, Unimed e AAPL.',
        'prompt',
        'google',
        'postUnimed',
        'postAapl',
      ),
    ],
  } satisfies VerbeteTexto,
} as const;

// ---------- avaliação (como funciona a primeira consulta) ----------
export const avaliacao = {
  verbete: {
    palavra: 'avaliação',
    classe: 's.f.',
    acepcoes: [
      f(
        'O primeiro encontro com a fisioterapeuta. Serve para entender o que você sente e montar um plano só seu.',
        'pratica',
      ),
    ],
  } satisfies VerbeteTexto,
  passos: [
    {
      titulo: 'Conversa',
      texto: f(
        'Você conta o que sente, desde quando e o que gostaria de voltar a fazer.',
        'pratica',
      ),
    },
    {
      titulo: 'Avaliação',
      texto: f(
        'Avaliação funcional: a fisioterapeuta observa como você se move para montar o plano. Você só faz o que conseguir.',
        'pratica',
      ),
    },
    {
      titulo: 'Plano',
      texto: f(
        'Ela explica o que encontrou e combina com você os objetivos e a frequência das sessões.',
        'pratica',
      ),
    },
    {
      titulo: 'Acompanhamento',
      texto: f(
        'A cada sessão, o plano é revisto. Se algo mudar, a gente ajusta junto com você.',
        'pratica',
      ),
    },
  ],
  chamada: f(
    'Quer saber como é por dentro? Veja o passo a passo da primeira avaliação.',
    'orientacao',
  ),
} as const;

// ---------- convênio (como você pode ser atendido) ----------
export const convenio = {
  verbete: {
    palavra: 'convênio',
    classe: 's.m.',
    acepcoes: [
      f(
        'O jeito como você vai ser atendido: particular, Unimed ou AAPL.',
        'joao',
        'postUnimed',
        'postAapl',
      ),
      f('Escolha a sua opção e veja o que levar. A mensagem para agendar já vem pronta.', 'site'),
    ],
  } satisfies VerbeteTexto,
  pergunta: 'Como você vai ser atendido?',
  semJs: f('Veja abaixo as formas de atendimento e o que levar em cada uma.', 'site'),
  pendente: f(CONFIRME, 'orientacao'),
} as const;

// ---------- movimento (atendimentos publicados) ----------
export const movimento = {
  verbete: {
    palavra: 'movimento',
    classe: 's.m.',
    acepcoes: [
      f(
        'Tudo o que o corpo faz para levar você aonde quer ir: levantar, caminhar, alcançar, abraçar.',
        'orientacao',
      ),
      f('Na Ardeli, é o centro do cuidado, em todas as fases da vida.', 'bio'),
    ],
  } satisfies VerbeteTexto,
  chamada: f('Veja os atendimentos', 'orientacao'),
} as const;

// ---------- a clínica (o tour) ----------
export const clinica = {
  verbete: {
    palavra: 'fisioterapia',
    classe: 's.f.',
    acepcoes: [
      f(
        'Área da saúde que previne, avalia e trata distúrbios do movimento e da função do corpo.',
        'quadro',
      ),
      f(
        'Utiliza exercícios, recursos físicos e técnicas terapêuticas para promover reabilitação, alívio da dor e qualidade de vida.',
        'quadro',
      ),
    ],
  } satisfies VerbeteTexto,
  origem: f(
    'Esta definição está num quadro na parede do consultório 1. Foi dela que nasceu o jeito deste site.',
    'tour',
    'quadro',
  ),
  chamada: f('Ver o tour em vídeo', 'tour'),
  aviso: f('Vídeo sem som, com capítulos.', 'tour'),
} as const;

// ---------- acolhimento (quem cuida) ----------
export const acolhimento = {
  verbete: {
    palavra: 'acolhimento',
    classe: 's.m.',
    acepcoes: [
      f('Receber com calma, ouvir com atenção e explicar cada passo.', 'reel', 'orientacao'),
      f(
        'É como a Ardeli quer que você se sinta: um atendimento acolhedor, humanizado e de qualidade.',
        'reel',
      ),
    ],
  } satisfies VerbeteTexto,
  fato: f(
    'A Andriele atende em Lages desde 2018, no Studio Ar Pilates e Fisioterapia.',
    'studioAr',
  ),
  chamada: f('Conheça quem cuida de você', 'orientacao'),
} as const;

// ---------- opinião (avaliar no Google) ----------
export const opiniao = {
  verbete: {
    palavra: 'opinião',
    classe: 's.f.',
    acepcoes: [
      f('O que você achou do atendimento, contado com as suas palavras.', 'orientacao'),
      f('Sua opinião ajuda outras pessoas a encontrarem cuidado perto de casa.', 'prompt'),
    ],
  } satisfies VerbeteTexto,
  pergunta: f('Já foi atendido na Ardeli?', 'prompt'),
  botao: 'Avaliar no Google',
  nota: f(
    'O link abre a página da clínica no Google. Você escreve o que quiser, se quiser.',
    'site',
  ),
} as const;

// ---------- endereço (como chegar) ----------
export const endereco = {
  verbete: {
    palavra: 'endereço',
    classe: 's.m.',
    acepcoes: [
      f('Av. Dom Pedro II, 2700, no bairro Brusque, em Lages (SC). CEP 88503-062.', 'google'),
      f('Segunda a sexta, das 8h às 20h.', 'joao', 'google'),
    ],
  } satisfies VerbeteTexto,
  copiar: 'Copiar endereço',
  copiado: 'Endereço copiado',
  mapaConsentimento: f(
    'O mapa interativo é do Google. Ele só carrega se você tocar em "Mostrar o mapa".',
    'site',
  ),
  mostrarMapa: 'Mostrar o mapa',
} as const;
