// /llms.txt: resumo da clínica para IAs (gerado da config; ver src/lib/seo/llms.ts).
import type { APIRoute } from 'astro';
import { gerarLlmsTxt } from '../lib/seo/llms.ts';

export const GET: APIRoute = () =>
  new Response(gerarLlmsTxt(), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
