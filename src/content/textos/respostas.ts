// Conteúdo citável (Prompt 8): cada página abre com um H1 que é uma pergunta ou busca
// real e um parágrafo-resposta de 2–3 frases que se sustenta sozinho (Google, IAs).
// Regras: só fato confirmado (fonte em cada frase), sem promessa, sem "especialista",
// SUS só como "consulte a disponibilidade". NAP igual ao da config.
import { registroDe } from '../../lib/registro.ts';
import { clinica } from '../../config/clinica.ts';
import { valorDe } from '../../config/tipos.ts';
import { profissionais } from '../dados/profissionais.ts';
import { f, type Frase } from './tipos.ts';

export interface Abertura {
  readonly h1: string;
  readonly resposta: Frase;
}

const end = valorDe(clinica.endereco);
const ENDERECO = end?.linha ?? '';
const TEL = valorDe(clinica.whatsapp)?.exibicao ?? '';

/** Quem cuida, com o CREFITO como está na config (Art. 48). */
function fraseQuemCuida(): Frase {
  const partes = [...profissionais]
    .sort((a, b) => a.ordem - b.ordem)
    .map((p) => {
      const r = registroDe(p);
      // "responsável técnica" já vem no registro da clínica; não repetir.
      const papel = p.responsavel && r.tipo !== 'clinica' ? ' responsável' : '';
      return `${p.nome}, ${p.profissao.toLowerCase()}${papel} (${r.tipo === 'clinica' ? r.curto.replace(/^Responsável técnica · /, 'responsável técnica, ') : r.curto})`;
    });
  return f(
    `Na Ardeli, quem cuida de você são ${partes.join(', e ')}. A Andriele atende em Lages desde 2018, no Studio Ar Pilates e Fisioterapia.`,
    'joao',
    'crefito',
    'studioAr',
  );
}

export const aberturas = {
  convenios: {
    h1: 'A Ardeli atende Unimed e AAPL?',
    resposta: f(
      `Sim. A Ardeli Fisioterapia, no bairro Brusque, em Lages, atende pela Unimed Lages, pela AAPL (Associação dos Aposentados e Pensionistas de Lages) e particular. SUS: consulte a disponibilidade pelo WhatsApp ${TEL}.`,
      'joao',
      'postUnimed',
      'postAapl',
    ),
  },
  atendimentos: {
    h1: 'Que tipo de fisioterapia a Ardeli faz?',
    resposta: f(
      'A Ardeli atende fisioterapia em ortopedia e dor: coluna, articulações, pós-operatório e recuperação após lesão. Todo atendimento começa com uma avaliação com a fisioterapeuta.',
      'vitrine',
      'cnes',
      'pratica',
    ),
  },
  musculoesqueletica: {
    h1: 'Fisioterapia para dor e pós-operatório em Lages',
    resposta: f(
      'A Ardeli Fisioterapia, no bairro Brusque, em Lages, atende pessoas com dor na coluna ou nas articulações, depois de uma cirurgia ou de uma lesão. Particular, Unimed ou AAPL, de segunda a sexta, das 8h às 20h.',
      'vitrine',
      'cnes',
      'joao',
      'google',
    ),
  },
  primeiraAvaliacao: {
    h1: 'Como é a primeira avaliação de fisioterapia?',
    resposta: f(
      'Na primeira avaliação, a fisioterapeuta conversa com você sobre o que sente e observa como você se movimenta. Depois, explica o que encontrou e combina com você um plano de tratamento.',
      'pratica',
    ),
  },
  quemCuida: {
    h1: 'Quem são as fisioterapeutas da Ardeli?',
    resposta: fraseQuemCuida(),
  },
  aClinica: {
    h1: 'Como é a clínica Ardeli por dentro?',
    resposta: f(
      'A Ardeli tem ginásio de reabilitação, sala de esteira e bikes, dois consultórios com maca e recepção, na Av. Dom Pedro II, 2700, no bairro Brusque. Veja o tour em vídeo, sem som, ambiente por ambiente.',
      'tour',
      'google',
    ),
  },
  perguntasFrequentes: {
    h1: 'Perguntas frequentes sobre a Ardeli Fisioterapia',
    resposta: f(
      `A Ardeli Fisioterapia fica no bairro Brusque, em Lages, atende particular, Unimed e AAPL, de segunda a sexta, das 8h às 20h. Para agendar a avaliação, é só chamar no WhatsApp ${TEL}.`,
      'joao',
      'google',
      'postUnimed',
      'postAapl',
    ),
  },
  comoChegar: {
    h1: 'Fisioterapia no bairro Brusque: onde fica a Ardeli?',
    resposta: f(
      `A Ardeli Fisioterapia fica na ${ENDERECO}. Atende de segunda a sexta, das 8h às 20h. WhatsApp: ${TEL}.`,
      'google',
      'joao',
    ),
  },
  agendar: {
    h1: 'Como agendar uma avaliação de fisioterapia na Ardeli?',
    resposta: f(
      `Pelo WhatsApp ${TEL}. Escolha abaixo como você vai ser atendido e quando prefere: a mensagem fica pronta e vai do seu celular direto para a clínica.`,
      'joao',
      'site',
    ),
  },
  privacidade: {
    h1: 'O site da Ardeli guarda os meus dados?',
    resposta: f(
      'Não. O agendador monta a mensagem no seu aparelho e nada do que você escreve é guardado ou contado. O site não usa cookies; o mapa do Google só carrega se você aceitar.',
      'site',
      'lgpd',
    ),
  },
} as const satisfies Record<string, Abertura>;
