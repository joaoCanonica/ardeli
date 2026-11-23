// Cliques medidos em qualquer página (delegação): ligar, como chegar.
// Agendar, convênio e avaliar são medidos onde acontecem.
import { medir } from '../lib/medir.ts';

export function iniciarMedicaoCliques(): void {
  document.addEventListener(
    'click',
    (e) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      const conv = href.match(/^#(particular|unimed|aapl|sus)$/);
      if (conv?.[1]) medir('clique_convenio', { convenio: conv[1] });
      else if (href.startsWith('tel:')) medir('clique_ligar');
      else if (/waze\.com/.test(href)) medir('clique_como_chegar', { destino: 'waze' });
      else if (/maps\.apple\.com/.test(href)) medir('clique_como_chegar', { destino: 'apple' });
      else if (/google\.com\/maps\/dir/.test(href))
        medir('clique_como_chegar', { destino: 'google' });
      else if (/^\/como-chegar\/?$/.test(href)) medir('clique_como_chegar', { destino: 'pagina' });
    },
    { capture: true },
  );
}
