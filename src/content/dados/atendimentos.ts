// Atendimentos (nunca "especialidades": COFFITO Art. 30 e 48, I).
// Áreas do CNES 8422478. Todas confirmadas pelo João em 23/11/2026 ("os atendimentos eu
// mandei todos"). Textos de cada página em src/content/textos/atendimentos.ts (fonte por frase).
import { confirmado } from '../../config/tipos.ts';
import { textosAtendimentos, type TextoAtendimento } from '../textos/atendimentos.ts';
import { textos } from '../textos/tipos.ts';
import type { Atendimento } from '../schemas.ts';

const CNES_JOAO = 'CNES 8422478 + João (WAXLO), 23/11/2026: todas as áreas do CNES são atendidas';

const BASE: readonly {
  id: TextoAtendimento['id'];
  nome: string;
  nomeCurto: string;
  fonte: string;
}[] = [
  {
    id: 'musculoesqueletica',
    nome: 'Ortopedia e dor: coluna, articulações, pós-operatório e recuperação após lesão',
    nomeCurto: 'ortopedia e dor',
    fonte:
      'vitrine da clínica ("Recuperação funcional: movimento, independência e qualidade de vida") + CNES 8422478',
  },
  {
    id: 'neurologia',
    nome: 'Neurologia: depois de AVC e em condições que afetam os nervos e o movimento',
    nomeCurto: 'neurologia',
    fonte: CNES_JOAO,
  },
  {
    id: 'cardiorrespiratoria',
    nome: 'Respiração e coração: fôlego e condicionamento',
    nomeCurto: 'respiração e coração',
    fonte: CNES_JOAO,
  },
  {
    id: 'oncologia',
    nome: 'Durante e depois do tratamento do câncer',
    nomeCurto: 'oncologia',
    fonte: CNES_JOAO,
  },
  {
    id: 'obstetrica',
    nome: 'Gestação e pós-parto',
    nomeCurto: 'gestação e pós-parto',
    fonte: CNES_JOAO,
  },
  {
    id: 'queimados',
    nome: 'Recuperação depois de queimaduras',
    nomeCurto: 'queimaduras',
    fonte: CNES_JOAO,
  },
];

export const atendimentos: Atendimento[] = BASE.map((b, i) => {
  const t = textosAtendimentos.find((x) => x.id === b.id);
  if (!t) throw new Error(`textos do atendimento ${b.id} ausentes`);
  return {
    id: b.id,
    ordem: i + 1,
    nome: b.nome,
    nomeCurto: b.nomeCurto,
    verbete: {
      palavra: t.verbete.palavra,
      classe: t.verbete.classe,
      acepcoes: textos(t.verbete.acepcoes),
    },
    paraQuem: textos(t.paraQuem),
    comoFunciona: textos(t.comoE),
    confirmacao: confirmado(true, b.fonte),
    publicado: true,
  };
});
