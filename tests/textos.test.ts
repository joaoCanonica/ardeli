import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { encontrarTermosVetados } from '../src/config/termos.ts';
import { atendimentos } from '../src/content/dados/atendimentos.ts';
import { grupos } from '../src/content/textos/faq.ts';
import { capa } from '../src/content/textos/home.ts';
import {
  colherFrases,
  colherRotulos,
  FONTES,
  metas,
  pendenciasTextos,
  textosDoSite,
} from '../src/content/textos/index.ts';
import { altDe, mensagensWhatsApp, rodape } from '../src/content/textos/microtextos.ts';
import { ORIGEM } from '../src/lib/whatsapp.ts';

const raiz = new URL('..', import.meta.url).pathname;
const frases = colherFrases();

describe('fonte de cada frase', () => {
  it('toda frase tem ao menos uma fonte registrada', () => {
    expect(frases.length).toBeGreaterThan(150);
    for (const fr of frases) {
      expect(fr.fontes.length, fr.onde).toBeGreaterThan(0);
      for (const id of fr.fontes) expect(Object.keys(FONTES), `${fr.onde}: ${id}`).toContain(id);
    }
  });

  it('fatos do cliente usam fonte verificável (não só "orientacao")', () => {
    const fatos = [
      /2018/,
      /2024/,
      /RE005047/,
      /8422478/,
      /444436-F/,
      /Dom Pedro II, 2700/,
      /8h às 20h/,
      /Unimed/,
      /AAPL/,
    ];
    for (const fr of frases.filter((x) => x.publicavel)) {
      if (fatos.some((re) => re.test(fr.texto)) && !/Confirme pelo WhatsApp/.test(fr.texto)) {
        const soOrientacao = fr.fontes.every((x) => x === 'orientacao' || x === 'pratica');
        // Orientação que só cita o nome do convênio é permitida ("carteirinha da Unimed").
        if (soOrientacao && !/carteirinha|Para saber/.test(fr.texto)) {
          throw new Error(`${fr.onde}: fato sem fonte verificável → "${fr.texto}"`);
        }
      }
    }
  });
});

describe('COFFITO e termos vetados', () => {
  it('nenhuma frase ou rótulo usa termo vetado', () => {
    for (const fr of frases) expect(encontrarTermosVetados(fr.texto), fr.onde).toEqual([]);
    for (const r of colherRotulos()) expect(encontrarTermosVetados(r.texto), r.onde).toEqual([]);
  });

  it('nenhum padrão de depoimento (citação seguida de nome)', () => {
    const re = /["“”«][^"“”«»]{12,400}["”»]\s*[—–-]\s*\p{Lu}/u;
    for (const fr of frases) expect(re.test(fr.texto), fr.onde).toBe(false);
  });

  it('sem promessa de resultado nem "especialista" (inclusive variações)', () => {
    const promessa = /\b(resolve|resolvemos|elimina|livre da dor|sem sentir dor|garant)/i;
    for (const fr of frases) expect(promessa.test(fr.texto), `${fr.onde}: ${fr.texto}`).toBe(false);
  });

  it('SUS publicável só junto de "Consulte a disponibilidade" no mesmo bloco', () => {
    const bloco = (onde: string) => onde.split('.').slice(0, -2).join('.');
    for (const fr of frases.filter((x) => x.publicavel && /\bSUS\b/.test(x.texto))) {
      const vizinhas = frases.filter((x) => x.publicavel && bloco(x.onde) === bloco(fr.onde));
      expect(
        vizinhas.some((x) => /consulte a disponibilidade/i.test(x.texto)),
        fr.onde,
      ).toBe(true);
    }
    // Os textos de "como funciona pelo SUS" existem, mas guardados.
    const guardadas = frases.filter((x) => x.exige === 'sus-confirmado');
    expect(guardadas.length).toBeGreaterThan(0);
    for (const g of guardadas) expect(g.publicavel).toBe(false);
  });
});

describe('voz', () => {
  it('frases curtas: no máximo 32 palavras por sentença (exceto a citação do quadro)', () => {
    for (const fr of frases) {
      if (fr.fontes.includes('quadro') && fr.fontes.length === 1) continue;
      for (const sentenca of fr.texto.split(/(?<=[.!?:])\s+/)) {
        expect(sentenca.split(/\s+/).length, `${fr.onde}: ${sentenca}`).toBeLessThanOrEqual(32);
      }
    }
  });

  it('termos técnicos explicados na primeira vez', () => {
    const t = JSON.stringify(textosDoSite);
    expect(t).toContain(
      'Avaliação funcional: a fisioterapeuta observa como você se move para montar o plano.',
    );
    expect(t).toMatch(/pós-operatório, que é o período de recuperação depois da cirurgia/);
    expect(t).toMatch(/eletroterapia: um aparelho que usa pequenas correntes elétricas na pele/);
    expect(t).toMatch(/espaldar \(uma escada de madeira presa à parede\)/);
    expect(t).toMatch(/CREFITO-10 é o conselho que registra os fisioterapeutas/);
  });

  it('capa com as acepções pedidas, sem mudar uma vírgula', () => {
    expect(capa.verbete.acepcoes.map((a) => a.texto)).toEqual([
      'Acompanhar a recuperação do seu movimento, da avaliação ao dia a dia.',
      'Fisioterapia no bairro Brusque, em Lages: particular, Unimed e AAPL.',
    ]);
  });
});

describe('metas', () => {
  for (const [pagina, m] of Object.entries(metas())) {
    it(`${pagina}: title ≤ 60, description ≤ 155, com fisioterapia e Lages`, () => {
      expect(m.titulo.length, m.titulo).toBeLessThanOrEqual(60);
      expect(m.descricao.length, m.descricao).toBeLessThanOrEqual(155);
      expect(m.descricao.length).toBeGreaterThan(70);
      expect(`${m.titulo} ${m.descricao}`).toMatch(/fisioterapia/i);
      expect(m.descricao).toMatch(/Lages/);
    });
  }
});

describe('pendências', () => {
  it('perguntas pendentes ficam fora (publicado: false) e apontam a pendência', () => {
    const ids = pendenciasTextos.map((p) => p.id);
    const todas = grupos.flatMap((g) => g.perguntas);
    for (const id of ['sus', 'pedido-medico', 'duracao-sessao', 'estacionamento', 'acessivel']) {
      const q = todas.find((x) => x.id === id);
      expect(q?.publicado, id).toBe(false);
      expect(ids, id).toContain(q?.pendencia);
    }
    for (const id of ['unimed', 'aapl', 'como-agendar'])
      expect(todas.find((x) => x.id === id)?.publicado).toBe(true);
  });

  it('textos de atendimento só para atendimentos publicados', () => {
    const publicados = atendimentos.filter((a) => a.publicado).map((a) => a.id);
    expect(textosDoSite.atendimentos.itens.map((a) => a.id)).toEqual(publicados);
  });

  it('docs/PENDENCIAS.md lista as pendências de texto', () => {
    const doc = readFileSync(`${raiz}docs/PENDENCIAS.md`, 'utf8');
    for (const p of pendenciasTextos) expect(doc, p.id).toContain(p.campo.split(':')[0] ?? p.campo);
  });
});

describe('microtextos', () => {
  it('toda mensagem de WhatsApp diz de onde veio; SUS pergunta, não afirma', () => {
    for (const [k, m] of Object.entries(mensagensWhatsApp)) expect(m, k).toContain(ORIGEM);
    expect(mensagensWhatsApp.perguntarSus).toMatch(/quero saber se a Ardeli atende pelo SUS/);
  });

  it('rodapé com Art. 48 completo', () => {
    const r = rodape();
    expect(r.profissionais.map((p) => p.texto)).toEqual([
      'Andriele da Silva · Fisioterapeuta · CREFITO-10: número em confirmação',
      'Nicole de Abreu Batista · Fisioterapeuta · CREFITO-10 nº 444436-F',
    ]);
    expect(r.empresa.texto).toBe('Registro de empresa no CREFITO-10: RE005047 · CNES 8422478');
  });

  it('toda imagem publicada tem alt (ambiente + o que se vê)', () => {
    const indice = `${raiz}public/media/media-index.json`;
    if (!existsSync(indice)) return;
    const ids = Object.keys(
      (JSON.parse(readFileSync(indice, 'utf8')) as { imagens: object }).imagens,
    );
    expect(ids.length).toBeGreaterThan(40);
    for (const id of ids) expect(altDe(id).length, id).toBeGreaterThan(20);
  });
});
