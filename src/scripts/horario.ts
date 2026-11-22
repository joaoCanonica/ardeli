// Preenche o status ("Aberto agora · até 20h") e destaca "hoje" na tabela.
// Os dados (horário e feriados) vêm em data-* gerados no build; sem JS fica o
// horário por extenso, que é sempre verdadeiro.
import { calcularStatus, type ConfigHorario } from '../lib/horario-nucleo.ts';

export function iniciarHorario(): void {
  const fonte = document.querySelector<HTMLElement>('[data-config-horario]');
  if (!fonte?.dataset.configHorario) return;
  let config: ConfigHorario;
  try {
    config = JSON.parse(fonte.dataset.configHorario) as ConfigHorario;
  } catch {
    return;
  }
  const s = calcularStatus(new Date(), config);

  for (const el of document.querySelectorAll<HTMLElement>('[data-status-horario]')) {
    const alvo = el.querySelector<HTMLElement>('[data-status-texto]');
    if (!alvo) continue;
    alvo.textContent = s.texto;
    el.dataset.estado = s.aberto === true ? 'aberto' : s.aberto === false ? 'fechado' : 'confirmar';
    el.hidden = false;
  }
  for (const linha of document.querySelectorAll<HTMLElement>(
    `[data-tabela-horario] [data-dia="${s.diaSemana}"]`,
  )) {
    linha.setAttribute('aria-current', 'date');
    linha.querySelector<HTMLElement>('[data-hoje]')?.removeAttribute('hidden');
  }
}
