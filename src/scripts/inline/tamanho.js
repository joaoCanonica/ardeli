// Inline no <head>, antes da pintura (hash sha256 na CSP: astro.config.mjs).
// 1) Tamanho de texto salvo (A+/A−), sem piscar.
// 2) Rede lenta (2G/3G) ou "economia de dados": usa a fonte do sistema (html.rede-lenta)
//    e não baixa as fontes da marca. Em rede boa, pré-carrega as fontes da marca
//    (URLs na <meta name="ardeli-fontes">), como antes: sem troca de fonte, CLS 0.
// 3) Aparelho fraco (≤ 2 GB ou ≤ 2 núcleos): marca html.aparelho-simples (sem abertura).
const raiz = document.documentElement;
try {
  const t = localStorage.getItem('ardeli:tamanho');
  if (t === '1' || t === '2') raiz.dataset.tamanho = t;
} catch {
  /* sem armazenamento: tamanho padrão */
}
const rede = navigator.connection;
const lenta = !!rede && (rede.saveData === true || /(^|-)(2g|3g)$/.test(rede.effectiveType || ''));
if (lenta) raiz.classList.add('rede-lenta');
if ((navigator.deviceMemory || 8) <= 2 || (navigator.hardwareConcurrency || 8) <= 2)
  raiz.classList.add('aparelho-simples');
if (!lenta) {
  const meta = document.querySelector('meta[name="ardeli-fontes"]');
  for (const href of meta && meta.content ? meta.content.split(' ') : []) {
    const l = document.createElement('link');
    l.rel = 'preload';
    l.as = 'font';
    l.type = 'font/woff2';
    l.crossOrigin = 'anonymous';
    l.href = href;
    document.head.appendChild(l);
  }
}
