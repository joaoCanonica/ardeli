import { describe, expect, it } from 'vitest';
import { convenios } from '../src/content/dados/convenios.ts';
import { profissionais } from '../src/content/dados/profissionais.ts';
import { aberturas } from '../src/content/textos/respostas.ts';
import { encontrarTermosVetados } from '../src/config/termos.ts';
import {
  conveniosAceitos,
  grafo,
  noClinica,
  noFaq,
  noTrilha,
  serializar,
} from '../src/lib/seo/jsonld.ts';
import { gerarLlmsTxt } from '../src/lib/seo/llms.ts';
import { nap } from '../src/lib/seo/nap.ts';

describe('JSON-LD', () => {
  const c = noClinica();
  const json = JSON.stringify(c);

  it('é MedicalClinic + Physiotherapy, com especialidade Physiotherapy (não Physician)', () => {
    expect(c['@type']).toEqual(['MedicalClinic', 'Physiotherapy']);
    expect(c.medicalSpecialty).toBe('https://schema.org/Physiotherapy');
    expect(json).not.toMatch(/Physician/);
  });

  it('nunca leva avaliação (COFFITO Art. 10, V)', () => {
    expect(json).not.toMatch(/aggregateRating|AggregateRating|"review"|Review/);
  });

  it('não usa isAcceptedPaymentMethod (não existe no schema.org)', () => {
    expect(json).not.toMatch(/isAcceptedPaymentMethod/);
  });

  it('convênios: só os confirmados; SUS só com confirmação', () => {
    const sus = convenios.find((x) => x.id === 'sus');
    expect(c.healthPlanNetworkId).toEqual(conveniosAceitos());
    if (sus?.atende.estado !== 'confirmado') expect(json).not.toMatch(/\bSUS\b/);
  });

  it('credencial (CREFITO) só para quem tem número confirmado', () => {
    const empregados = c.employee as unknown as {
      name: string;
      hasCredential?: { identifier: string };
    }[];
    for (const p of profissionais) {
      const e = empregados.find((x) => x.name === p.nome);
      expect(e).toBeDefined();
      if (p.crefito.estado === 'confirmado')
        expect(e?.hasCredential?.identifier).toBe(p.crefito.valor);
      else expect(e?.hasCredential).toBeUndefined();
    }
  });

  it('NAP do JSON-LD = NAP do site', () => {
    const n = nap();
    expect(c.name).toBe(n.nome);
    expect(c.telephone).toBe(n.telefoneE164);
    expect(json).toContain(`"streetAddress":"${n.logradouro}, ${n.numero}"`);
    expect(json).toContain(`"postalCode":"${n.cep}"`);
  });

  it('FAQPage só com perguntas publicadas; trilha numerada', () => {
    const faq = noFaq('/perguntas-frequentes/');
    expect(JSON.stringify(faq)).not.toMatch(/Preciso de pedido médico\?/);
    const t = noTrilha('/convenios/', [
      { nome: 'Início', caminho: '/' },
      { nome: 'Convênios', caminho: '/convenios' },
    ]);
    expect(JSON.stringify(t)).toContain('"position":2');
  });

  it('serializa sem fechar o <script>', () => {
    expect(serializar(grafo([noClinica()]))).not.toContain('</');
  });
});

describe('llms.txt', () => {
  const t = gerarLlmsTxt();
  it('segue llmstxt.org: H1, citação, H2 só com listas de links', () => {
    const linhas = t.split('\n');
    expect(linhas[0]).toBe('# Ardeli Fisioterapia');
    expect(linhas[2]?.startsWith('> ')).toBe(true);
    expect(linhas.some((l) => /^#{3,} /.test(l))).toBe(false);
    const i = linhas.findIndex((l) => l.startsWith('## '));
    for (const l of linhas.slice(i).filter((x) => x.trim() && !x.startsWith('## ')))
      expect(l).toMatch(/^- \[[^\]]+\]\([^)]+\): .+/);
  });
  it('traz NAP, horário, convênios e as fisioterapeutas (Art. 48)', () => {
    const n = nap();
    for (const s of [n.endereco, n.telefone, 'Unimed Lages', 'AAPL', 'segunda a sexta'])
      expect(t).toContain(s);
    for (const p of profissionais) expect(t).toContain(`${p.nome} · Fisioterapeuta`);
  });
});

describe('aberturas (conteúdo citável)', () => {
  it('sem termo vetado e com resposta curta', () => {
    for (const [id, a] of Object.entries(aberturas)) {
      expect(encontrarTermosVetados(`${a.h1} ${a.resposta.texto}`), id).toEqual([]);
      expect(a.resposta.texto.length, id).toBeLessThanOrEqual(320);
    }
  });
  it('títulos-pergunta pedidos no prompt', () => {
    expect(aberturas.convenios.h1).toMatch(/A Ardeli atende Unimed/);
    expect(aberturas.comoChegar.h1).toMatch(/Fisioterapia no bairro Brusque/);
  });
});
