// Cabeçalho: sombra ao rolar (sem mudar altura) e menu que fecha com Esc,
// clique fora ou ao escolher um item. Sem JS, o <details> abre e fecha sozinho.
export function iniciarCabecalho(): void {
  const cab = document.querySelector<HTMLElement>('[data-cabecalho]');
  const sentinela = document.querySelector('[data-cab-sentinela]');
  if (cab && sentinela && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e) cab.toggleAttribute('data-rolado', !e.isIntersecting);
    }).observe(sentinela);
  }

  const menu = document.querySelector<HTMLDetailsElement>('[data-cab-menu]');
  if (!menu) return;
  const resumo = menu.querySelector('summary');
  const fechar = (devolverFoco: boolean) => {
    if (!menu.open) return;
    menu.open = false;
    if (devolverFoco) resumo?.focus();
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fechar(true);
  });
  document.addEventListener('click', (e) => {
    if (menu.open && !menu.contains(e.target as Node)) fechar(false);
  });
  menu.addEventListener('click', (e) => {
    if ((e.target as Element).closest('.cab__lista a')) fechar(false);
  });
}
