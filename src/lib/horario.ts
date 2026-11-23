// Status de funcionamento ("Aberto agora · até 20h", "Fecha em 30 min",
// "Fechado · abre segunda às 8h"), no fuso da clínica e com feriados.
// Enquanto não se confirmar se a clínica fecha nos feriados, o status num
// feriado pede para confirmar pelo WhatsApp (não afirma aberto nem fechado).

import { clinica } from '../config/clinica.ts';
import { feriadoEm, feriadosDoAno, type Feriado } from '../config/feriados.ts';
import { valorDe } from '../config/tipos.ts';
import { calcularStatus, hora, partesLocais, type ConfigHorario } from './horario-nucleo.ts';

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

const paraMinutos = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Config do núcleo a partir da clínica, com feriados dos anos pedidos. */
export function configHorario(anos: readonly number[], opcoes: OpcoesHorario = {}): ConfigHorario {
  const h = valorDe(clinica.horario);
  if (!h) throw new Error('horário da clínica ausente');
  const feriados: Record<string, string> = {};
  for (const ano of anos) for (const f of feriadosDoAno(ano)) feriados[f.data] = f.nome;
  return {
    fuso: h.fusoHorario,
    dias: h.dias,
    abre: paraMinutos(h.abre),
    fecha: paraMinutos(h.fecha),
    feriados,
    fechaEmFeriados:
      opcoes.fechaEmFeriados !== undefined
        ? opcoes.fechaEmFeriados
        : valorDe(clinica.fechaEmFeriados),
  };
}

export function statusEm(data: Date, opcoes: OpcoesHorario = {}): Status {
  const fuso = valorDe(clinica.horario)?.fusoHorario ?? 'America/Sao_Paulo';
  const { iso } = partesLocais(data, fuso);
  const ano = Number(iso.slice(0, 4));
  const s = calcularStatus(data, configHorario([ano, ano + 1], opcoes));
  return { aberto: s.aberto, texto: s.texto, feriado: feriadoEm(iso) };
}

/** Texto fixo do horário, para rodapé e páginas (e para quem está sem JS). */
export function horarioPorExtenso(): string {
  const h = valorDe(clinica.horario);
  if (!h) return '';
  return `Segunda a sexta, das ${hora(paraMinutos(h.abre))} às ${hora(paraMinutos(h.fecha))}`;
}
