// Seletor de convênio: mostra só o bloco escolhido. Sem JS, todos ficam abertos.
export function iniciarSeletorConvenio(): void {
  for (const raiz of document.querySelectorAll<HTMLElement>('[data-seletor-convenio]')) {
    const opcoes = raiz.querySelector<HTMLFieldSetElement>('[data-seletor-opcoes]');
    const semJs = raiz.querySelector<HTMLElement>('[data-seletor-semjs]');
    const anuncio = raiz.querySelector<HTMLElement>('[data-seletor-anuncio]');
    const dica = raiz.querySelector<HTMLElement>('[data-seletor-dica]');
    const paineis = [...raiz.querySelectorAll<HTMLElement>('[data-painel]')];
    if (!opcoes || paineis.length === 0) continue;

    opcoes.hidden = false;
    if (semJs) semJs.hidden = true;
    for (const p of paineis) p.hidden = true;

    opcoes.addEventListener('change', (e) => {
      const alvo = e.target as HTMLInputElement;
      if (alvo.name !== 'forma-atendimento') return;
      for (const p of paineis) p.hidden = p.dataset.painel !== alvo.value;
      if (dica) dica.hidden = true;
      const nome = alvo.closest('label')?.textContent?.trim() ?? alvo.value;
      if (anuncio)
        anuncio.textContent = `${nome}: quem pode usar, o que levar e o botão para agendar aparecem logo abaixo.`;
    });
  }
}
