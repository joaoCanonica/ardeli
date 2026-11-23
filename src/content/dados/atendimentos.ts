// Atendimentos (nunca "especialidades": COFFITO Art. 30 e 48, I).
// Registros a partir das áreas do CNES 8422478. Só a musculoesquelética está
// publicada (a vitrine da clínica diz "Recuperação funcional"). As outras
// ficam publicado=false até a clínica confirmar que atende (PENDENCIAS).
// Publicados: textos em src/content/textos/atendimentos.ts (com fonte de cada frase).
// Não publicados: rascunho; só são revistos quando a clínica confirmar a área.

import { bloqueante, confirmado } from '../../config/tipos.ts';
import { textosAtendimentos } from '../textos/atendimentos.ts';
import { textos } from '../textos/tipos.ts';
import type { Atendimento } from '../schemas.ts';

const musc = textosAtendimentos.find((a) => a.id === 'musculoesqueletica');
if (!musc) throw new Error('textos do atendimento musculoesquelético ausentes');

const pendente = (area: string) => bloqueante(`confirmar com a clínica se atende ${area}`);

const COMO_FUNCIONA_BASE = [
  'Primeira avaliação: a fisioterapeuta conversa com você e observa como você se movimenta.',
  'Plano de tratamento com objetivos combinados com você.',
  'Sessões com exercícios e, quando indicado, outros recursos da fisioterapia.',
  'Reavaliação ao longo do tratamento, para ajustar o plano.',
];

export const atendimentos: Atendimento[] = [
  {
    id: 'musculoesqueletica',
    ordem: 1,
    nome: 'Ortopedia e dor: coluna, articulações, pós-operatório e recuperação após lesão',
    nomeCurto: 'ortopedia e dor',
    verbete: {
      palavra: musc.verbete.palavra,
      classe: musc.verbete.classe,
      acepcoes: textos(musc.verbete.acepcoes),
    },
    paraQuem: textos(musc.paraQuem),
    comoFunciona: textos(musc.comoE),
    confirmacao: confirmado(
      true,
      'vitrine da clínica ("Recuperação funcional: movimento, independência e qualidade de vida") + CNES 8422478',
    ),
    publicado: true,
  },
  {
    id: 'neurologia',
    ordem: 2,
    nome: 'Neurologia: depois de AVC e em condições que afetam os nervos e o movimento',
    nomeCurto: 'neurologia',
    verbete: {
      palavra: 'movimento',
      classe: 's.m.',
      acepcoes: ['Reaprender gestos do dia a dia quando o sistema nervoso foi afetado.'],
    },
    paraQuem: ['Quem teve AVC ou tem uma condição neurológica que afeta o movimento.'],
    comoFunciona: COMO_FUNCIONA_BASE,
    confirmacao: pendente('neurologia'),
    publicado: false,
  },
  {
    id: 'cardiorrespiratoria',
    ordem: 3,
    nome: 'Respiração e coração: fôlego e condicionamento',
    nomeCurto: 'respiração',
    verbete: {
      palavra: 'fôlego',
      classe: 's.m.',
      acepcoes: ['Respirar melhor e ganhar resistência para as tarefas do dia.'],
    },
    paraQuem: ['Quem tem doença respiratória ou do coração e foi orientado a fazer fisioterapia.'],
    comoFunciona: COMO_FUNCIONA_BASE,
    confirmacao: pendente('cardiovascular e pneumofuncional'),
    publicado: false,
  },
  {
    id: 'oncologia',
    ordem: 4,
    nome: 'Durante e depois do tratamento do câncer',
    nomeCurto: 'oncologia',
    verbete: {
      palavra: 'cuidado',
      classe: 's.m.',
      acepcoes: ['Exercícios e orientação durante e depois do tratamento do câncer.'],
    },
    paraQuem: [
      'Quem está em tratamento de câncer ou terminou e foi orientado a fazer fisioterapia.',
    ],
    comoFunciona: COMO_FUNCIONA_BASE,
    confirmacao: pendente('oncologia'),
    publicado: false,
  },
  {
    id: 'obstetrica',
    ordem: 5,
    nome: 'Gestação e pós-parto',
    nomeCurto: 'gestação e pós-parto',
    verbete: {
      palavra: 'gestação',
      classe: 's.f.',
      acepcoes: ['Cuidado com o corpo durante a gravidez e depois do parto.'],
    },
    paraQuem: ['Gestantes e mulheres no pós-parto.'],
    comoFunciona: COMO_FUNCIONA_BASE,
    confirmacao: pendente('obstetrícia/neonatal'),
    publicado: false,
  },
  {
    id: 'queimados',
    ordem: 6,
    nome: 'Recuperação depois de queimaduras',
    nomeCurto: 'queimaduras',
    verbete: {
      palavra: 'pele',
      classe: 's.f.',
      acepcoes: ['Recuperar o movimento depois de uma queimadura.'],
    },
    paraQuem: ['Quem teve queimadura e foi orientado a fazer fisioterapia.'],
    comoFunciona: COMO_FUNCIONA_BASE,
    confirmacao: pendente('queimados'),
    publicado: false,
  },
];
