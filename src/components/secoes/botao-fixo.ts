// Esconde o botão fixo enquanto o endereço, o rodapé ou a capa (com seus botões) estão na tela.
export function iniciarBotaoFixo(): void {
  const fixo = document.querySelector<HTMLElement>('[data-botao-fixo]');
  if (!fixo || !('IntersectionObserver' in window)) return;
  const alvos = [...document.querySelectorAll('[data-secao-endereco], footer, .botoes-capa')];
  const visiveis = new Set<Element>();
  const io = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (e.isIntersecting) visiveis.add(e.target);
      else visiveis.delete(e.target);
    }
    fixo.toggleAttribute('data-escondido', visiveis.size > 0);
    fixo.toggleAttribute('inert', visiveis.size > 0);
  });
  for (const a of alvos) io.observe(a);
}
