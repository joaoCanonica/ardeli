import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { atendimentos } from '../src/content/dados/atendimentos.ts';
import { convenios } from '../src/content/dados/convenios.ts';
import type { Convenio } from '../src/content/schemas.ts';
import { bloqueante, confirmado } from '../src/config/tipos.ts';
import {
  destinoDoPedido,
  montarPedido,
  opcoesDia,
  opcoesForma,
  opcoesMotivo,
  opcoesPeriodo,
} from '../src/lib/agenda.ts';

describe('montarPedido', () => {
  it('texto exato do exemplo', () => {
    expect(
      montarPedido({ forma: 'unimed', motivo: 'pos-operatorio', periodo: 'tarde', dias: [2, 4] }),
    ).toBe(
      'Olá! Vim pelo site da Ardeli e quero agendar uma avaliação. Atendimento: Unimed. Motivo: pós-operatório. Prefiro à tarde, terça ou quinta.',
    );
  });

  it('só a forma', () => {
    expect(montarPedido({ forma: 'particular' })).toBe(
      'Olá! Vim pelo site da Ardeli e quero agendar uma avaliação. Atendimento: Particular.',
    );
    expect(montarPedido({ forma: 'nao-sei' })).toBe(
      'Olá! Vim pelo site da Ardeli e quero agendar uma avaliação. Ainda não sei se vai ser particular ou por convênio.',
    );
  });

  it('combinações de período e dias', () => {
    expect(montarPedido({ forma: 'aapl', periodo: 'manha' })).toMatch(
      /Atendimento: AAPL\. Prefiro de manhã\.$/,
    );
    expect(montarPedido({ forma: 'aapl', dias: [5, 1, 3] })).toMatch(
      /Prefiro segunda, quarta ou sexta\.$/,
    );
    expect(montarPedido({ forma: 'aapl', periodo: 'noite', dias: [1, 2, 3, 4, 5] })).toMatch(
      /Prefiro à noite, qualquer dia da semana\.$/,
    );
    expect(montarPedido({ forma: 'aapl', periodo: 'qualquer', dias: [3] })).toMatch(
      /Posso em qualquer horário, quarta\.$/,
    );
    expect(montarPedido({ forma: 'unimed', motivo: 'outro' })).toMatch(
      /Motivo: outro \(explico na conversa\)\.$/,
    );
  });

  it('SUS confirmado (23/11/2026): oferecido; sem confirmação, não é oferecido nem aceito', () => {
    expect(opcoesForma().map((o) => o.id)).toEqual([
      'particular',
      'unimed',
      'aapl',
      'sus',
      'nao-sei',
    ]);
    const semSus = convenios.map((c) =>
      c.id === 'sus' ? ({ ...c, atende: bloqueante('SUS') } as Convenio) : c,
    );
    const ctx = { convenios: semSus, atendimentos };
    expect(opcoesForma(ctx).map((o) => o.id)).not.toContain('sus');
    expect(() => montarPedido({ forma: 'sus' }, ctx)).toThrow(/não está confirmada/);
  });

  it('SUS entra quando confirmado', () => {
    const comSus = convenios.map((c) =>
      c.id === 'sus' ? ({ ...c, atende: confirmado(true as const, 'teste') } as Convenio) : c,
    );
    const ctx = { convenios: comSus, atendimentos };
    expect(opcoesForma(ctx).map((o) => o.id)).toContain('sus');
    expect(montarPedido({ forma: 'sus' }, ctx)).toMatch(/Atendimento: SUS\.$/);
  });

  it('motivos: só de atendimentos publicados + Outro', () => {
    expect(opcoesMotivo().map((m) => m.id)).toEqual([
      'dor',
      'pos-operatorio',
      'recuperacao-lesao',
      'neurologico',
      'respiratorio',
      'outro',
    ]);
    // Atendimento despublicado: o motivo dele some e não é aceito.
    const ctx = {
      convenios,
      atendimentos: atendimentos.map((a) =>
        a.id === 'neurologia' ? { ...a, publicado: false } : a,
      ),
    };
    expect(opcoesMotivo(ctx).map((m) => m.id)).not.toContain('neurologico');
    expect(() => montarPedido({ forma: 'unimed', motivo: 'neurologico' }, ctx)).toThrow(
      /não é oferecido/,
    );
  });

  it('dias só de segunda a sexta', () => {
    expect(() => montarPedido({ forma: 'unimed', dias: [6 as 1] })).toThrow(/dia inválido/);
    expect(opcoesDia().map((d) => d.rotulo)).toEqual([
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
    ]);
    expect(opcoesPeriodo().map((p) => p.rotulo)).toEqual([
      'Manhã (8h–12h)',
      'Tarde (12h–18h)',
      'Noite (18h–20h)',
      'Qualquer horário',
    ]);
  });
});

describe('destinos', () => {
  const texto = montarPedido({ forma: 'unimed', motivo: 'dor' });

  it('whatsapp: abre wa.me com o texto', () => {
    const r = destinoDoPedido(texto, { tipo: 'whatsapp' });
    expect(r).toEqual({
      acao: 'abrir',
      url: `https://wa.me/5549999281721?text=${encodeURIComponent(texto)}`,
    });
  });

  it('link-externo: abre a agenda sem levar o texto', () => {
    const r = destinoDoPedido(texto, {
      tipo: 'link-externo',
      url: 'https://agenda.exemplo.com/ardeli',
    });
    expect(r).toEqual({ acao: 'abrir', url: 'https://agenda.exemplo.com/ardeli' });
    expect(() => destinoDoPedido(texto, { tipo: 'link-externo', url: 'http://x.com' })).toThrow(
      /https/,
    );
  });

  it('api: ainda não implementado', () => {
    expect(() =>
      destinoDoPedido(texto, { tipo: 'api', endpoint: 'https://api.exemplo.com' }),
    ).toThrow(/não implementado/);
  });

  it('nada é guardado nem enviado (LGPD)', () => {
    for (const f of ['src/lib/agenda.ts', 'src/lib/whatsapp.ts']) {
      const src = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
      expect(src, f).not.toMatch(
        /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|sendBeacon|XMLHttpRequest/,
      );
    }
  });
});
