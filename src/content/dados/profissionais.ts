// Quem cuida. Só fatos confirmados (CLAUDE.md §1; investigação §2–3).
// COFFITO Art. 48: nome + "Fisioterapeuta" + nº do CREFITO-10 em toda divulgação.
import { bloqueante, confirmado, opcional } from '../../config/tipos.ts';
import type { Profissional } from '../schemas.ts';

const FONTE_INSTAGRAM = 'Instagram @studio.ar.pilates e @fisio.andrielesilva, visto em 22/11/2026';

export const profissionais: Profissional[] = [
  {
    id: 'andriele-da-silva',
    ordem: 1,
    nome: 'Andriele da Silva',
    profissao: 'Fisioterapeuta',
    crefito: bloqueante('CREFITO-10 da Andriele da Silva'),
    responsavel: true,
    formacao: opcional(null),
    titulosReconhecidos: [],
    resumo: [
      {
        texto: 'Fisioterapeuta responsável pela Ardeli.',
        fonte: 'João (WAXLO), investigação 22/11/2026',
      },
      {
        texto: 'Dona do Studio Ar Pilates e Fisioterapia, em Lages, desde janeiro de 2018.',
        fonte: FONTE_INSTAGRAM,
      },
      {
        texto: 'Forma instrutores de Pilates no curso Top Class desde 2024.',
        fonte: FONTE_INSTAGRAM,
      },
    ],
    foto: null,
  },
  {
    id: 'nicole-de-abreu-batista',
    ordem: 2,
    nome: 'Nicole de Abreu Batista',
    profissao: 'Fisioterapeuta',
    crefito: confirmado('444436-F', 'CREFITO-10, dado enviado pelo João'),
    responsavel: false,
    formacao: opcional(null),
    titulosReconhecidos: [],
    resumo: [],
    foto: null,
  },
];
