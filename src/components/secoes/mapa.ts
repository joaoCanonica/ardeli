// Mapa interativo só com consentimento explícito: "Mostrar o mapa" abre a pergunta,
// com Aceitar e Recusar do mesmo peso. Nada é pedido ao Google antes de "Aceitar".
// A escolha vale só para esta visita (sessionStorage), nunca vira cookie.
const CHAVE = 'ardeli:mapa';

function lembrar(valor?: 'aceito' | 'recusado'): string | null {
  try {
    if (valor) sessionStorage.setItem(CHAVE, valor);
    return sessionStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function iniciarMapa(): void {
  for (const m of document.querySelectorAll<HTMLElement>('[data-mapa]')) {
    const mostrar = m.querySelector<HTMLButtonElement>('[data-mapa-mostrar]');
    const nota = m.querySelector<HTMLElement>('[data-mapa-nota]');
    const quadro = m.querySelector<HTMLElement>('[data-mapa-quadro]');
    const pergunta = m.querySelector<HTMLElement>('[data-mapa-consentimento]');
    if (!mostrar || !quadro || !pergunta || !m.dataset.embed) continue;
    mostrar.hidden = false;
    if (nota) nota.hidden = false;

    const carregar = () => {
      const f = document.createElement('iframe');
      f.src = m.dataset.embed ?? '';
      f.title = 'Mapa interativo: Ardeli Fisioterapia, Av. Dom Pedro II, 2700, Lages';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      quadro.replaceChildren(f);
      mostrar.hidden = true;
      pergunta.hidden = true;
      if (nota) nota.hidden = true;
    };

    mostrar.addEventListener('click', () => {
      if (lembrar() === 'aceito') return carregar();
      pergunta.hidden = false;
      mostrar.hidden = true;
      pergunta.querySelector<HTMLButtonElement>('[data-mapa-aceitar]')?.focus();
    });
    pergunta.querySelector('[data-mapa-aceitar]')?.addEventListener('click', () => {
      lembrar('aceito');
      carregar();
    });
    pergunta.querySelector('[data-mapa-recusar]')?.addEventListener('click', () => {
      lembrar('recusado');
      pergunta.hidden = true;
      mostrar.hidden = false;
      mostrar.focus();
    });
  }
}
