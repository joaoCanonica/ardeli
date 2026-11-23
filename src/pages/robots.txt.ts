// /robots.txt: libera tudo (o preview se protege com noindex, que o robô precisa
// conseguir ler) e aponta o sitemap quando houver domínio.
import type { APIRoute } from 'astro';
import { absoluta, dominio } from '../lib/seo/site.ts';

export const GET: APIRoute = () => {
  const linhas = [
    'User-agent: *',
    'Allow: /',
    ...(dominio() ? ['', `Sitemap: ${absoluta('/sitemap.xml')}`] : []),
  ];
  return new Response(`${linhas.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
