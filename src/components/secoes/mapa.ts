// Mapa interativo só com consentimento: nada é pedido ao Google antes do clique.
export function iniciarMapa(): void {
  for (const m of document.querySelectorAll<HTMLElement>('[data-mapa]')) {
    const botao = m.querySelector<HTMLButtonElement>('[data-mapa-mostrar]');
    const nota = m.querySelector<HTMLElement>('[data-mapa-nota]');
    const quadro = m.querySelector<HTMLElement>('[data-mapa-quadro]');
    if (!botao || !quadro || !m.dataset.embed) continue;
    botao.hidden = false;
    if (nota) nota.hidden = false;
    botao.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = m.dataset.embed ?? '';
      f.title = 'Mapa interativo: Ardeli Fisioterapia, Av. Dom Pedro II, 2700, Lages';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      quadro.replaceChildren(f);
      botao.hidden = true;
      if (nota) nota.hidden = true;
    });
  }
}
