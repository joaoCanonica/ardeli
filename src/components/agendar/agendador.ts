// Agendador no navegador: prévia ao vivo, pré-preenchimento e envio para o destino.
import {
  textoPedido,
  urlDoDestino,
  type Destino,
  type Dia,
  type Forma,
  type Motivo,
  type Periodo,
  type Permitidos,
} from '../../lib/agenda-nucleo.ts';
import { medir } from '../../lib/medir.ts';

interface Config {
  permitidos: Permitidos;
  destino: Destino;
}

export interface Prefill {
  forma?: string | null;
  motivo?: string | null;
}

function lerPedido(form: HTMLFormElement) {
  const d = new FormData(form);
  const forma = (d.get('forma') as Forma | null) ?? null;
  const motivo = ((d.get('motivo') as string | null) || undefined) as Motivo | undefined;
  const periodo = ((d.get('periodo') as string | null) || undefined) as Periodo | undefined;
  const dias = d.getAll('dia').map((x) => Number(x) as Dia);
  return { forma, motivo, periodo, dias };
}

/** Marca forma/motivo vindos da URL ou do botão, só se forem valores oferecidos. */
export function preencher(form: HTMLFormElement, p: Prefill): void {
  const marcar = (nome: string, valor?: string | null) => {
    if (!valor) return;
    const input = form.querySelector<HTMLInputElement>(
      `input[name="${nome}"][value="${CSS.escape(valor)}"]`,
    );
    if (input) input.checked = true;
  };
  marcar('forma', p.forma);
  marcar('motivo', p.motivo);
  form.dispatchEvent(new Event('change'));
}

export function iniciarAgendadores(): void {
  for (const form of document.querySelectorAll<HTMLFormElement>('form[data-agendador]')) {
    if (form.dataset.pronto) continue;
    form.dataset.pronto = '1';
    let config: Config;
    try {
      config = JSON.parse(form.dataset.config ?? '') as Config;
    } catch {
      continue;
    }
    const previa = form.querySelector<HTMLOutputElement>('[data-previa]');
    const erro = form.querySelector<HTMLElement>('[data-erro-forma]');
    const geral = form.querySelector<HTMLInputElement>('[data-texto-geral]')?.value ?? '';

    const atualizar = () => {
      const p = lerPedido(form);
      if (!previa) return;
      try {
        previa.value = p.forma ? textoPedido({ ...p, forma: p.forma }, config.permitidos) : geral;
      } catch {
        previa.value = geral;
      }
      if (erro && p.forma) erro.hidden = true;
    };
    form.addEventListener('change', atualizar);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const p = lerPedido(form);
      if (!p.forma) {
        if (erro) erro.hidden = false;
        form.querySelector<HTMLInputElement>('input[name="forma"]')?.focus();
        return;
      }
      let url: string;
      try {
        url = urlDoDestino(
          textoPedido({ ...p, forma: p.forma }, config.permitidos),
          config.destino,
        );
      } catch {
        url = urlDoDestino(geral, config.destino);
      }
      const passo = p.periodo || p.dias.length ? '3' : p.motivo ? '2' : '1';
      medir('agendador_enviado', { forma: p.forma, motivo: p.motivo ?? 'nenhum', passo });
      form.dataset.ultimaUrl = url;
      window.location.assign(url);
    });

    // Página /agendar: pré-preenche por ?forma= e ?motivo=.
    if (form.closest('[data-agendar-pagina]')) {
      const q = new URLSearchParams(location.search);
      preencher(form, { forma: q.get('forma'), motivo: q.get('motivo') });
    } else {
      atualizar();
    }
  }
}
