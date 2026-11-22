// Status de funcionamento ("Aberto agora · até 20h", "Fecha em 30 min",
// "Fechado · abre segunda às 8h"), no fuso da clínica e com feriados.
// Enquanto não se confirmar se a clínica fecha nos feriados, o status num
// feriado pede para confirmar pelo WhatsApp (não afirma aberto nem fechado).

import { clinica } from '../config/clinica.ts';
import { feriadoEm, type Feriado } from '../config/feriados.ts';
import { valorDe } from '../config/tipos.ts';

export interface Status {
  /** true = aberto; false = fechado; null = feriado sem confirmação. */
  readonly aberto: boolean | null;
  readonly texto: string;
  readonly feriado: Feriado | null;
}

interface OpcoesHorario {
  /** Sobrescreve clinica.fechaEmFeriados (testes). null = não confirmado. */
  readonly fechaEmFeriados?: boolean | null;
}

const NOMES_DIA = [
  '',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
  'domingo',
] as const;
const DIA_ABREV: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

const paraMinutos = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const hora = (minutos: number) => {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
};

function partesLocais(data: Date, fuso: string) {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  });
  const p = Object.fromEntries(f.formatToParts(data).map((x) => [x.type, x.value]));
  return {
    iso: `${p.year}-${p.month}-${p.day}`,
    minutos: Number(p.hour) * 60 + Number(p.minute),
    diaSemana: DIA_ABREV[p.weekday ?? ''] ?? 0,
  };
}

function somarDias(iso: string, n: number): { iso: string; diaSemana: number } {
  const [a = 0, m = 1, d = 1] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(a, m - 1, d + n));
  const dow = dt.getUTCDay();
  return { iso: dt.toISOString().slice(0, 10), diaSemana: dow === 0 ? 7 : dow };
}

export function statusEm(data: Date, opcoes: OpcoesHorario = {}): Status {
  const h = valorDe(clinica.horario);
  if (!h) throw new Error('horário da clínica ausente');
  const fechaEmFeriados =
    opcoes.fechaEmFeriados !== undefined
      ? opcoes.fechaEmFeriados
      : valorDe(clinica.fechaEmFeriados);

  const abre = paraMinutos(h.abre);
  const fecha = paraMinutos(h.fecha);
  const dias: readonly number[] = h.dias;
  const agora = partesLocais(data, h.fusoHorario);
  const feriadoHoje = feriadoEm(agora.iso);

  const diaUtilHoje = dias.includes(agora.diaSemana);
  const noHorario = agora.minutos >= abre && agora.minutos < fecha;

  if (diaUtilHoje && noHorario && !(feriadoHoje && fechaEmFeriados === true)) {
    if (feriadoHoje && fechaEmFeriados === null) {
      return {
        aberto: null,
        texto: `Feriado (${feriadoHoje.nome}) · confirme o horário pelo WhatsApp`,
        feriado: feriadoHoje,
      };
    }
    const restante = fecha - agora.minutos;
    return {
      aberto: true,
      texto: restante <= 30 ? `Fecha em ${restante} min` : `Aberto agora · até ${hora(fecha)}`,
      feriado: feriadoHoje,
    };
  }

  // Fechado: procura a próxima abertura.
  for (let n = 0; n <= 14; n++) {
    const dia = somarDias(agora.iso, n);
    if (!dias.includes(dia.diaSemana)) continue;
    if (n === 0 && agora.minutos >= abre) continue;
    const quando = n === 0 ? 'hoje' : n === 1 ? 'amanhã' : (NOMES_DIA[dia.diaSemana] ?? '');
    const feriado = feriadoEm(dia.iso);
    if (feriado && fechaEmFeriados === true) continue;
    if (feriado && fechaEmFeriados === null) {
      return {
        aberto: false,
        texto: `Fechado · ${quando} é feriado (${feriado.nome}): confirme pelo WhatsApp`,
        feriado: feriadoHoje,
      };
    }
    return {
      aberto: false,
      texto: `Fechado · abre ${quando} às ${hora(abre)}`,
      feriado: feriadoHoje,
    };
  }
  return { aberto: false, texto: 'Fechado', feriado: feriadoHoje };
}

/** Texto fixo do horário, para rodapé e páginas. */
export function horarioPorExtenso(): string {
  const h = valorDe(clinica.horario);
  if (!h) return '';
  return `Segunda a sexta, das ${hora(paraMinutos(h.abre))} às ${hora(paraMinutos(h.fecha))}`;
}
