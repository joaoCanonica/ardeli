// Loop mudo da capa (desktop). Só entra depois do load e com folga da rede.
// Pausa sozinho fora da tela e com reduced-motion; botão de pausa (WCAG 2.2.2).
interface ConexaoRede {
  saveData?: boolean;
  effectiveType?: string;
}

export function iniciarLoopCapa(): void {
  const caixa = document.querySelector<HTMLElement>('[data-fundo-capa]');
  const botao = document.querySelector<HTMLButtonElement>('[data-capa-pausa]');
  if (!caixa?.dataset.mp4 || !caixa.dataset.webm || !botao) return;

  const movimento = matchMedia('(prefers-reduced-motion: reduce)');
  const tela = matchMedia(caixa.dataset.midia ?? '(min-width: 48rem)');
  const rede = (navigator as Navigator & { connection?: ConexaoRede }).connection;
  if (
    movimento.matches ||
    !tela.matches ||
    rede?.saveData ||
    /2g|3g/.test(rede?.effectiveType ?? '')
  )
    return;

  const montar = () => {
    const v = document.createElement('video');
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.setAttribute('aria-hidden', 'true');
    v.tabIndex = -1;
    if (caixa.dataset.poster) v.poster = caixa.dataset.poster;
    for (const [src, tipo] of [
      [caixa.dataset.webm, 'video/webm'],
      [caixa.dataset.mp4, 'video/mp4'],
    ] as const) {
      const s = document.createElement('source');
      s.src = src ?? '';
      s.type = tipo;
      v.append(s);
    }
    let pausadoPelaPessoa = false;
    const pausar = botao.querySelector<HTMLElement>('[data-rotulo-pausar]');
    const tocar = botao.querySelector<HTMLElement>('[data-rotulo-tocar]');
    const rotulos = () => {
      if (pausar) pausar.hidden = v.paused;
      if (tocar) tocar.hidden = !v.paused;
    };
    v.addEventListener('playing', () => {
      v.classList.add('visivel');
      botao.hidden = false;
      rotulos();
    });
    v.addEventListener('pause', rotulos);
    botao.addEventListener('click', () => {
      pausadoPelaPessoa = !v.paused;
      if (v.paused) void v.play().catch(() => undefined);
      else v.pause();
    });
    movimento.addEventListener('change', () => {
      if (movimento.matches) v.pause();
    });
    new IntersectionObserver(([e]) => {
      if (!e) return;
      if (!e.isIntersecting) v.pause();
      else if (!pausadoPelaPessoa && !movimento.matches) void v.play().catch(() => undefined);
    }).observe(caixa);
    caixa.append(v);
    void v.play().catch(() => undefined);
  };

  const depoisDoLoad = () => {
    const ocioso = (window as Window & { requestIdleCallback?: (f: () => void) => void })
      .requestIdleCallback;
    if (ocioso) ocioso(montar);
    else setTimeout(montar, 300);
  };
  if (document.readyState === 'complete') depoisDoLoad();
  else addEventListener('load', depoisDoLoad, { once: true });
}
