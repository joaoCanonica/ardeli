// Abre a gaveta do agendador a partir de qualquer [data-agendar]. Sem JS, o link segue
// para o WhatsApp com a mensagem geral (ou a do convênio).
import { medir } from '../../lib/medir.ts';
import { preencher } from './agendador.ts';

export function iniciarGaveta(): void {
  const gaveta = document.querySelector<HTMLDialogElement>('[data-gaveta]');
  const form = gaveta?.querySelector<HTMLFormElement>('form[data-agendador]');
  if (!gaveta || !form || typeof gaveta.showModal !== 'function') return;
  let gatilho: HTMLElement | null = null;

  document.addEventListener('click', (e) => {
    const link = (e.target as Element).closest<HTMLElement>('[data-agendar]');
    if (!link || e.defaultPrevented || (e as MouseEvent).metaKey || (e as MouseEvent).ctrlKey)
      return;
    e.preventDefault();
    gatilho = link;
    form.reset();
    preencher(form, { forma: link.dataset.forma ?? null, motivo: link.dataset.motivo ?? null });
    medir('clique_agendar', {
      forma: link.dataset.forma ?? 'nenhuma',
      origem: link.dataset.origem ?? 'outro',
    });
    gaveta.showModal();
    const marcado = form.querySelector<HTMLInputElement>('input[name="forma"]:checked');
    (marcado ?? form.querySelector<HTMLInputElement>('input[name="forma"]'))?.focus();
  });

  gaveta.querySelector('[data-gaveta-fechar]')?.addEventListener('click', () => gaveta.close());
  // Clique no fundo (fora do conteúdo) fecha.
  gaveta.addEventListener('click', (e) => {
    if (e.target === gaveta) gaveta.close();
  });
  gaveta.addEventListener('close', () => gatilho?.focus());
}
