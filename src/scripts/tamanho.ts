// A−/A+: 3 níveis guardados só no aparelho. Sem JS: tamanho padrão.
const CHAVE = 'ardeli:tamanho';
const NOMES = ['padrão', 'grande', 'maior'];

function ler(): number {
  try {
    const v = Number(localStorage.getItem(CHAVE));
    return v === 1 || v === 2 ? v : 0;
  } catch {
    return 0;
  }
}

function gravar(n: number): void {
  try {
    if (n === 0) localStorage.removeItem(CHAVE);
    else localStorage.setItem(CHAVE, String(n));
  } catch {
    /* sem armazenamento: vale só nesta visita */
  }
}

function aplicar(n: number): void {
  const raiz = document.documentElement;
  if (n === 0) delete raiz.dataset.tamanho;
  else raiz.dataset.tamanho = String(n);
  for (const c of document.querySelectorAll<HTMLElement>('[data-controle-tamanho]')) {
    for (const b of c.querySelectorAll<HTMLButtonElement>('[data-passo]')) {
      const limite = b.dataset.passo === '1' ? n === 2 : n === 0;
      b.setAttribute('aria-disabled', String(limite));
    }
  }
}

export function iniciarControleTamanho(): void {
  let nivel = ler();
  aplicar(nivel);
  for (const c of document.querySelectorAll<HTMLElement>('[data-controle-tamanho]')) {
    c.hidden = false;
    const anuncio = c.querySelector<HTMLElement>('[data-tamanho-anuncio]');
    c.addEventListener('click', (e) => {
      const b = (e.target as Element).closest<HTMLButtonElement>('[data-passo]');
      if (!b || b.getAttribute('aria-disabled') === 'true') return;
      nivel = Math.min(2, Math.max(0, nivel + Number(b.dataset.passo)));
      aplicar(nivel);
      gravar(nivel);
      if (anuncio) anuncio.textContent = `Texto ${NOMES[nivel]}`;
    });
  }
}
