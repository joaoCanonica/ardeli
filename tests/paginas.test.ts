import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { atendimentos } from '../src/content/dados/atendimentos.ts';

const raiz = new URL('..', import.meta.url).pathname;
const dist = `${raiz}dist`;

const PAGINAS = [
  'convenios',
  'atendimentos',
  'primeira-avaliacao',
  'quem-cuida',
  'a-clinica',
  'perguntas-frequentes',
  'como-chegar',
  'privacidade',
];

const texto = (html: string) =>
  html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

describe('arquivos das páginas', () => {
  it('cada página interna existe em src/pages', () => {
    for (const p of [...PAGINAS.filter((x) => x !== 'atendimentos'), '404']) {
      expect(existsSync(`${raiz}src/pages/${p}.astro`), p).toBe(true);
    }
    expect(existsSync(`${raiz}src/pages/atendimentos/index.astro`)).toBe(true);
    expect(existsSync(`${raiz}src/pages/atendimentos/[id].astro`)).toBe(true);
  });
});

describe.runIf(existsSync(`${dist}/convenios/index.html`))('páginas geradas (dist/)', () => {
  const ler = (rota: string) => readFileSync(`${dist}/${rota}`, 'utf8');
  const rotas = [
    ...PAGINAS.map((p) => `${p}/index.html`),
    ...atendimentos.filter((a) => a.publicado).map((a) => `atendimentos/${a.id}/index.html`),
    '404.html',
  ];

  for (const rota of rotas) {
    it(`${rota}: não está vazia (H1, verbete, conteúdo, rodapé com Art. 48)`, () => {
      const html = ler(rota);
      const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? '';
      expect(html).toMatch(/<h1\b[^>]*>[^<]{4,}/);
      expect(main).toMatch(/class="[^"]*verbete__palavra/);
      expect(texto(main).length, rota).toBeGreaterThan(rota === '404.html' ? 150 : 400);
      const rodape = texto(html.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] ?? '');
      expect(rodape).toContain('Fisioterapeuta');
      expect(rodape).toContain('CREFITO-10 nº 444436-F');
      expect(rodape).toContain('RE005047');
      expect(rodape).toContain('CNES 8422478');
    });
  }

  it('atendimento não publicado não tem página; publicado tem', () => {
    const geradas = readdirSync(`${dist}/atendimentos`).filter((n) => n !== 'index.html');
    expect(geradas.sort()).toEqual(
      atendimentos
        .filter((a) => a.publicado)
        .map((a) => a.id)
        .sort(),
    );
  });

  it('/convenios tem as 4 âncoras e mensagens prontas', () => {
    const html = ler('convenios/index.html');
    for (const id of ['particular', 'unimed', 'aapl', 'sus']) expect(html).toContain(`id="${id}"`);
    const mensagens = [...html.matchAll(/href="https:\/\/wa\.me\/\d+\?text=([^"]+)"/g)].map((m) =>
      decodeURIComponent(m[1] ?? ''),
    );
    expect(mensagens).toContain(
      'Olá! Vim pelo site da Ardeli e quero agendar uma avaliação. Atendimento: Unimed.',
    );
  });

  it('/perguntas-frequentes não mostra perguntas pendentes', () => {
    const t = texto(ler('perguntas-frequentes/index.html'));
    expect(t).toContain('A Ardeli atende Unimed?');
    for (const q of ['Preciso de pedido médico?']) {
      expect(t).not.toContain(q);
    }
  });
});
