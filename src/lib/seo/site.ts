// URLs do site. Com o domínio confirmado, tudo vira absoluto (canonical, og:url,
// og:image, JSON-LD, sitemap, llms.txt). Sem domínio (preview), os caminhos ficam
// relativos e a produção trava (clinica.dominio é bloqueante).
import { clinica } from '../../config/clinica.ts';
import { valorDe } from '../../config/tipos.ts';

export function dominio(): string | null {
  const d = valorDe(clinica.dominio);
  return d ? d.replace(/\/+$/, '') : null;
}

/** Caminho normalizado com barra final (as páginas são geradas em diretório). */
export function caminhoCanonico(caminho: string): string {
  const semQuery = caminho.split(/[?#]/)[0] ?? '/';
  if (semQuery === '/' || /\.[a-z0-9]+$/i.test(semQuery)) return semQuery || '/';
  return semQuery.endsWith('/') ? semQuery : `${semQuery}/`;
}

/** URL absoluta quando há domínio; senão, o próprio caminho. */
export function absoluta(caminho: string): string {
  const d = dominio();
  return d ? `${d}${caminho.startsWith('/') ? '' : '/'}${caminho}` : caminho;
}

/** Imagem de compartilhamento (1200×630), gerada por pnpm og. */
export const OG_IMAGEM = {
  caminho: '/og/ardeli-1200x630.jpg',
  largura: 1200,
  altura: 630,
  alt: 'Fachada da Ardeli Fisioterapia e a frase “Fisioterapia no Brusque, Lages/SC”.',
} as const;
