// Copiar o endereço (com aviso para leitor de tela). Sem JS ou sem permissão: o botão some.
export function iniciarCopiar(): void {
  const botao = document.querySelector<HTMLButtonElement>('[data-copiar]');
  const texto = document.querySelector<HTMLElement>('[data-endereco-texto]')?.dataset.enderecoTexto;
  const aviso = document.querySelector<HTMLElement>('[data-copiar-aviso]');
  if (!botao || !texto || !navigator.clipboard) return;
  botao.hidden = false;
  botao.addEventListener('click', () => {
    navigator.clipboard.writeText(texto).then(
      () => {
        if (aviso) aviso.textContent = 'Endereço copiado';
      },
      () => {
        if (aviso) aviso.textContent = 'Não deu para copiar. Selecione o endereço acima.';
      },
    );
  });
}
