import { describe, expect, it } from 'vitest';
import { atendimentos } from '../src/content/dados/atendimentos.ts';
import { convenios } from '../src/content/dados/convenios.ts';
import { linkAvaliar } from '../src/lib/avaliar.ts';
import { linkWhatsApp, mensagens, ORIGEM } from '../src/lib/whatsapp.ts';

const conv = (id: string) => {
  const c = convenios.find((x) => x.id === id);
  if (!c) throw new Error(id);
  return c;
};

describe('whatsapp', () => {
  it('link com o número da clínica e texto codificado', () => {
    expect(linkWhatsApp(mensagens.geral())).toBe(
      `https://wa.me/5549999281721?text=${encodeURIComponent('Olá! Vim pelo site da Ardeli e quero falar com a clínica.')}`,
    );
  });

  it('sempre diz de onde veio', () => {
    const url = linkWhatsApp('Quero informações.');
    expect(decodeURIComponent(url.split('text=')[1] ?? '')).toBe(
      `Olá! ${ORIGEM}. Quero informações.`,
    );
  });

  it('mensagens por convênio, atendimento e como chegar', () => {
    expect(mensagens.convenio(conv('unimed'))).toBe(
      'Olá! Vim pelo site da Ardeli. Tenho Unimed Lages e quero saber como agendar uma avaliação.',
    );
    expect(mensagens.convenio(conv('aapl'))).toMatch(/associado\(a\) da AAPL/);
    expect(mensagens.convenio(conv('particular'))).toMatch(/avaliação particular\.$/);
    // SUS não confirmado: pergunta, não afirma.
    expect(mensagens.convenio(conv('sus'))).toBe(
      'Olá! Vim pelo site da Ardeli e quero saber se a Ardeli atende pelo SUS (Sistema Único de Saúde) e como funciona.',
    );
    const musc = atendimentos.find((a) => a.id === 'musculoesqueletica');
    expect(mensagens.atendimento(musc ?? { nomeCurto: '' })).toBe(
      'Olá! Vim pelo site da Ardeli e quero saber sobre o atendimento de ortopedia e dor.',
    );
    expect(mensagens.comoChegar()).toBe(
      'Olá! Vim pelo site da Ardeli e quero ajuda para chegar à clínica (Av. Dom Pedro II, 2700, Brusque).',
    );
  });
});

describe('avaliar', () => {
  it('sem o link "Pedir avaliações", cai na ficha (cid) e avisa', () => {
    const l = linkAvaliar();
    expect(l.origem).toBe('ficha');
    expect(l.url).toBe('https://maps.google.com/?cid=10553999783368888140');
    expect(l.aviso).toMatch(/pendente/);
  });
});
