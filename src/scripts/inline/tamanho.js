// Inline no <head>: aplica o tamanho de texto salvo antes da pintura (sem piscar).
// Hash sha256 na CSP: astro.config.mjs.
try {
  const t = localStorage.getItem('ardeli:tamanho');
  if (t === '1' || t === '2') document.documentElement.dataset.tamanho = t;
} catch {
  /* sem armazenamento: tamanho padrão */
}
