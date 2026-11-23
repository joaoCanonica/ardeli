// /sitemap.xml: só páginas indexáveis (sem _rotas, 404, /avaliar). URLs absolutas
// exigem o domínio; sem ele, o sitemap sai vazio (e a produção trava).
import type { APIRoute } from 'astro';
import { atendimentosPublicados } from '../lib/seo/jsonld.ts';
import { absoluta, dominio } from '../lib/seo/site.ts';

export const PAGINAS_INDEXAVEIS = [
  '/',
  '/convenios/',
  '/atendimentos/',
  '/primeira-avaliacao/',
  '/quem-cuida/',
  '/a-clinica/',
  '/perguntas-frequentes/',
  '/como-chegar/',
  '/agendar/',
  '/privacidade/',
] as const;

export const GET: APIRoute = () => {
  const caminhos = [
    ...PAGINAS_INDEXAVEIS,
    ...atendimentosPublicados().map((a) => `/atendimentos/${a.id}/`),
  ];
  const urls = dominio()
    ? caminhos.map((c) => `  <url><loc>${absoluta(c)}</loc></url>`).join('\n')
    : '';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
