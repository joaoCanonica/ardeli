// Inline (roda antes da 1ª pintura). Hash sha256 na CSP: astro.config.mjs.
(() => {
  const el = document.getElementById('abertura');
  if (!el) return;
  let tocar;
  try {
    tocar = !sessionStorage.getItem('ardeli:abertura');
    sessionStorage.setItem('ardeli:abertura', '1');
  } catch {
    tocar = false;
  }
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) tocar = false;
  if (navigator.connection && navigator.connection.saveData) tocar = false;
  if (!tocar) {
    el.remove();
    return;
  }
  const raiz = document.documentElement;
  const tipos = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
  const fim = () => {
    if (!el.isConnected) return;
    raiz.classList.remove('abrindo');
    el.remove();
    for (const t of tipos) removeEventListener(t, fim, true);
  };
  for (const t of tipos) addEventListener(t, fim, { capture: true, passive: true });
  raiz.classList.add('abrindo');
  el.hidden = false;
  setTimeout(() => {
    if (!el.isConnected) return;
    el.classList.add('abertura--saindo');
    const s = el.querySelector('svg');
    const g = el.querySelector('#simbolo');
    const alvo = document.querySelector('.cab__marca [data-parte="simbolo"]');
    if (!s || !g || !alvo || !s.animate) return;
    const o = s.getBoundingClientRect();
    const de = g.getBoundingClientRect();
    const para = alvo.getBoundingClientRect();
    const k = para.height / de.height;
    const tx = para.left - o.left - k * (de.left - o.left);
    const ty = para.top - o.top - k * (de.top - o.top);
    s.style.transformOrigin = '0 0';
    s.animate([{ transform: 'none' }, { transform: `translate(${tx}px,${ty}px) scale(${k})` }], {
      duration: 330,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      fill: 'forwards',
    });
  }, 850);
  setTimeout(fim, 1200);
})();
