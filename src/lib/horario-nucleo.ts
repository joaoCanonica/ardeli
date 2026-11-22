// Núcleo puro do status de horário: sem importar config, para rodar no
// navegador com poucos bytes (src/scripts/horario.ts). A versão com a config
// da clínica é statusEm() em ./horario.ts.

export interface ConfigHorario {
  readonly fuso: string;
  /** 1 = segunda … 7 = domingo (ISO). */
  readonly dias: readonly number[];
  /** Minutos desde 0h. */
  readonly abre: number;
  readonly fecha: number;
  /** AAAA-MM-DD → nome do feriado. */
  readonly feriados: Readonly<Record<string, string>>;
  /** null = não confirmado (pede para confirmar pelo WhatsApp). */
  readonly fechaEmFeriados: boolean | null;
}

export interface StatusNucleo {
  readonly aberto: boolean | null;
  readonly texto: string;
  readonly feriadoHoje: string | null;
  /** Dia da semana local (1–7), para destacar "hoje" na tabela. */
  readonly diaSemana: number;
}

const NOMES = ['', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
const DIA: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

export const hora = (min: number): string => {
  const m = min % 60;
  return `${Math.floor(min / 60)}h${m ? String(m).padStart(2, '0') : ''}`;
};

export function partesLocais(data: Date, fuso: string) {
  const p: Record<string, string> = {};
  for (const x of new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(data)) {
    p[x.type] = x.value;
  }
  return {
    iso: `${p.year}-${p.month}-${p.day}`,
    minutos: Number(p.hour) * 60 + Number(p.minute),
    diaSemana: DIA[p.weekday ?? ''] ?? 0,
  };
}

function somarDias(iso: string, n: number) {
  const [a = 0, m = 1, d = 1] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d + n));
  return { iso: dt.toISOString().slice(0, 10), diaSemana: dt.getUTCDay() || 7 };
}

export function calcularStatus(data: Date, c: ConfigHorario): StatusNucleo {
  const agora = partesLocais(data, c.fuso);
  const feriadoHoje = c.feriados[agora.iso] ?? null;
  const base = { feriadoHoje, diaSemana: agora.diaSemana };

  if (
    c.dias.includes(agora.diaSemana) &&
    agora.minutos >= c.abre &&
    agora.minutos < c.fecha &&
    !(feriadoHoje && c.fechaEmFeriados === true)
  ) {
    if (feriadoHoje && c.fechaEmFeriados === null) {
      return {
        ...base,
        aberto: null,
        texto: `Feriado (${feriadoHoje}) · confirme o horário pelo WhatsApp`,
      };
    }
    const resta = c.fecha - agora.minutos;
    return {
      ...base,
      aberto: true,
      texto: resta <= 30 ? `Fecha em ${resta} min` : `Aberto agora · até ${hora(c.fecha)}`,
    };
  }

  for (let n = 0; n <= 14; n++) {
    const dia = somarDias(agora.iso, n);
    if (!c.dias.includes(dia.diaSemana) || (n === 0 && agora.minutos >= c.abre)) continue;
    const quando = n === 0 ? 'hoje' : n === 1 ? 'amanhã' : (NOMES[dia.diaSemana] ?? '');
    const feriado = c.feriados[dia.iso];
    if (feriado && c.fechaEmFeriados === true) continue;
    if (feriado && c.fechaEmFeriados === null) {
      return {
        ...base,
        aberto: false,
        texto: `Fechado · ${quando} é feriado (${feriado}): confirme pelo WhatsApp`,
      };
    }
    return { ...base, aberto: false, texto: `Fechado · abre ${quando} às ${hora(c.abre)}` };
  }
  return { ...base, aberto: false, texto: 'Fechado' };
}
