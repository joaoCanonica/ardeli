// Feriados que valem em Lages/SC. Cada um com a fonte.
//
// Pesquisa em 22/11/2026:
// - Nacionais: Lei 662/1949 (redação da Lei 10.607/2002), Lei 6.802/1980 (12/10)
//   e Lei 14.759/2023 (20/11, Dia Nacional de Zumbi e da Consciência Negra).
// - Religiosos municipais: a Lei 9.093/1995 (art. 2º) permite ao município até
//   4 feriados religiosos, contando a Sexta-Feira da Paixão.
// - Lages: 15/08, Nossa Senhora dos Prazeres (padroeira), na lista de feriados
//   locais do TJSC; Corpus Christi tratado como feriado em Lages (notícia sobre o
//   Decreto municipal 23.288/2026, ponto facultativo no dia seguinte).
// - 22/11, aniversário de Lages: aparece só em sites de calendário; o TJSC não o
//   lista e a Lei 9.093/1995 não prevê feriado civil anual de aniversário. Fica
//   como "incerto": o site trata como possível feriado e pede para confirmar.
//
// Carnaval é ponto facultativo, não feriado: não entra.
// Nenhuma lei municipal de Lages foi localizada; confirmar com a clínica (PENDENCIAS).

export type Abrangencia = 'nacional' | 'municipal';
export type Certeza = 'lei' | 'fonte-secundaria' | 'incerto';

export interface Feriado {
  readonly data: string; // AAAA-MM-DD
  readonly nome: string;
  readonly abrangencia: Abrangencia;
  readonly certeza: Certeza;
  readonly fonte: string;
}

interface Regra {
  readonly nome: string;
  readonly abrangencia: Abrangencia;
  readonly certeza: Certeza;
  readonly fonte: string;
  /** Mês e dia fixos, ou deslocamento em dias a partir do domingo de Páscoa. */
  readonly fixo?: readonly [mes: number, dia: number];
  readonly pascoa?: number;
}

const LEI_662 = 'Lei 662/1949, art. 1º (redação da Lei 10.607/2002)';

export const regrasDeFeriado: readonly Regra[] = [
  {
    nome: 'Confraternização Universal',
    fixo: [1, 1],
    abrangencia: 'nacional',
    certeza: 'lei',
    fonte: LEI_662,
  },
  { nome: 'Tiradentes', fixo: [4, 21], abrangencia: 'nacional', certeza: 'lei', fonte: LEI_662 },
  {
    nome: 'Dia do Trabalho',
    fixo: [5, 1],
    abrangencia: 'nacional',
    certeza: 'lei',
    fonte: LEI_662,
  },
  {
    nome: 'Independência do Brasil',
    fixo: [9, 7],
    abrangencia: 'nacional',
    certeza: 'lei',
    fonte: LEI_662,
  },
  {
    nome: 'Nossa Senhora Aparecida',
    fixo: [10, 12],
    abrangencia: 'nacional',
    certeza: 'lei',
    fonte: 'Lei 6.802/1980',
  },
  { nome: 'Finados', fixo: [11, 2], abrangencia: 'nacional', certeza: 'lei', fonte: LEI_662 },
  {
    nome: 'Proclamação da República',
    fixo: [11, 15],
    abrangencia: 'nacional',
    certeza: 'lei',
    fonte: LEI_662,
  },
  {
    nome: 'Dia Nacional de Zumbi e da Consciência Negra',
    fixo: [11, 20],
    abrangencia: 'nacional',
    certeza: 'lei',
    fonte: 'Lei 14.759/2023',
  },
  { nome: 'Natal', fixo: [12, 25], abrangencia: 'nacional', certeza: 'lei', fonte: LEI_662 },
  {
    nome: 'Sexta-Feira da Paixão',
    pascoa: -2,
    abrangencia: 'municipal',
    certeza: 'lei',
    fonte: 'Lei 9.093/1995, art. 2º (feriado religioso, inclui a Sexta-Feira da Paixão)',
  },
  {
    nome: 'Corpus Christi',
    pascoa: 60,
    abrangencia: 'municipal',
    certeza: 'fonte-secundaria',
    fonte:
      'Lei 9.093/1995, art. 2º; tratado como feriado em Lages (Decreto municipal 23.288/2026, noticiado pela Rádio Clube/SCC10)',
  },
  {
    nome: 'Nossa Senhora dos Prazeres (padroeira de Lages)',
    fixo: [8, 15],
    abrangencia: 'municipal',
    certeza: 'fonte-secundaria',
    fonte: 'TJSC, lista de feriados locais (Lages: 15/08); Lei 9.093/1995, art. 2º',
  },
  {
    nome: 'Aniversário de Lages',
    fixo: [11, 22],
    abrangencia: 'municipal',
    certeza: 'incerto',
    fonte:
      'só calendários online (proximoferiado.net, feriados.inf.br); não consta da lista do TJSC',
  },
];

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher, calendário gregoriano). */
export function pascoa(ano: number): { mes: number; dia: number } {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return { mes, dia };
}

const iso = (ano: number, mes: number, dia: number) =>
  `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

export function feriadosDoAno(ano: number): Feriado[] {
  const p = pascoa(ano);
  const base = Date.UTC(ano, p.mes - 1, p.dia);
  return regrasDeFeriado
    .map((r) => {
      let data: string;
      if (r.fixo) data = iso(ano, r.fixo[0], r.fixo[1]);
      else {
        const d = new Date(base + (r.pascoa ?? 0) * 86_400_000);
        data = iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
      }
      return { data, nome: r.nome, abrangencia: r.abrangencia, certeza: r.certeza, fonte: r.fonte };
    })
    .sort((x, y) => x.data.localeCompare(y.data));
}

/** Feriado na data local (AAAA-MM-DD), ou null. */
export function feriadoEm(dataIso: string): Feriado | null {
  const ano = Number(dataIso.slice(0, 4));
  return feriadosDoAno(ano).find((f) => f.data === dataIso) ?? null;
}
