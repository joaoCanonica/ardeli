import { describe, expect, it } from 'vitest';
import { feriadoEm, feriadosDoAno, pascoa } from '../src/config/feriados.ts';
import { horarioPorExtenso, statusEm } from '../src/lib/horario.ts';

// Lages: UTC−3 (sem horário de verão). 13:00Z = 10:00 local.
const local = (iso: string) => new Date(`${iso}-03:00`);

describe('statusEm', () => {
  it('aberto no meio do dia', () => {
    expect(statusEm(local('2026-11-23T10:00')).texto).toBe('Aberto agora · até 20h');
    expect(statusEm(local('2026-11-23T08:00')).aberto).toBe(true);
  });

  it('avisa nos últimos 30 minutos', () => {
    expect(statusEm(local('2026-11-23T19:30')).texto).toBe('Fecha em 30 min');
    expect(statusEm(local('2026-11-23T19:45')).texto).toBe('Fecha em 15 min');
    expect(statusEm(local('2026-11-23T19:29')).texto).toBe('Aberto agora · até 20h');
  });

  it('fechado antes das 8h, à noite e no fim de semana', () => {
    expect(statusEm(local('2026-11-23T07:00')).texto).toBe('Fechado · abre hoje às 8h');
    expect(statusEm(local('2026-11-24T20:00')).texto).toBe('Fechado · abre amanhã às 8h');
    expect(statusEm(local('2026-11-27T20:00')).texto).toBe('Fechado · abre segunda às 8h');
    expect(statusEm(local('2026-11-28T11:00')).texto).toBe('Fechado · abre segunda às 8h');
    expect(statusEm(local('2026-11-29T23:59')).texto).toBe('Fechado · abre amanhã às 8h');
  });

  it('usa o fuso da clínica, não o do aparelho', () => {
    // 23:30Z de segunda = 20:30 em Lages → fechado.
    expect(statusEm(new Date('2026-11-23T23:30:00Z')).texto).toBe('Fechado · abre amanhã às 8h');
  });

  it('feriado sem confirmação: pede para confirmar, não afirma', () => {
    const s = statusEm(local('2026-12-25T10:00'), { fechaEmFeriados: null });
    expect(s.aberto).toBeNull();
    expect(s.texto).toBe('Feriado (Natal) · confirme o horário pelo WhatsApp');
    expect(statusEm(local('2026-12-24T21:00'), { fechaEmFeriados: null }).texto).toBe(
      'Fechado · amanhã é feriado (Natal): confirme pelo WhatsApp',
    );
  });

  it('feriado confirmado como fechado: pula o dia', () => {
    expect(statusEm(local('2026-12-25T10:00'), { fechaEmFeriados: true }).texto).toBe(
      'Fechado · abre segunda às 8h',
    );
    expect(statusEm(local('2026-12-24T21:00'), { fechaEmFeriados: true }).texto).toBe(
      'Fechado · abre segunda às 8h',
    );
    // Consciência Negra (sexta, 20/11/2026) → abre na segunda, 23/11.
    expect(statusEm(local('2026-11-19T21:00'), { fechaEmFeriados: true }).texto).toBe(
      'Fechado · abre segunda às 8h',
    );
  });

  it('feriado confirmado como aberto: horário normal', () => {
    expect(statusEm(local('2026-12-25T10:00'), { fechaEmFeriados: false }).texto).toBe(
      'Aberto agora · até 20h',
    );
  });

  it('horário por extenso', () => {
    expect(horarioPorExtenso()).toBe('Segunda a sexta, das 8h às 20h');
  });
});

describe('feriados', () => {
  it('Páscoa (algoritmo de Meeus) em anos conhecidos', () => {
    expect(pascoa(2026)).toEqual({ mes: 4, dia: 5 });
    expect(pascoa(2027)).toEqual({ mes: 3, dia: 28 });
    expect(pascoa(2025)).toEqual({ mes: 4, dia: 20 });
  });

  it('móveis de 2026: Sexta-Feira da Paixão 3/4 e Corpus Christi 4/6', () => {
    expect(feriadoEm('2026-04-03')?.nome).toBe('Sexta-Feira da Paixão');
    expect(feriadoEm('2026-06-04')?.nome).toBe('Corpus Christi');
  });

  it('nacionais e de Lages, cada um com fonte', () => {
    const f = feriadosDoAno(2026);
    expect(f.map((x) => x.data)).toContain('2026-11-20');
    expect(feriadoEm('2026-08-15')?.nome).toMatch(/Prazeres/);
    expect(feriadoEm('2026-11-22')?.certeza).toBe('incerto');
    for (const x of f) expect(x.fonte.length).toBeGreaterThan(5);
    expect(feriadoEm('2026-02-17')).toBeNull(); // Carnaval: ponto facultativo
  });
});
