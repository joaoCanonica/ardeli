import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { calcularStatus } from '../src/lib/horario-nucleo.ts';
import { configHorario } from '../src/lib/horario.ts';
import {
  avaliar,
  avaliarVeu,
  contraste,
  paresObrigatorios,
  paresProibidos,
  tokens,
} from '../src/styles/contraste.ts';

const raiz = new URL('..', import.meta.url).pathname;

describe('tokens e contraste', () => {
  const t = tokens();

  it('cores da marca nos tokens', () => {
    expect(t).toMatchObject({
      linho: '#f8f6f1',
      papel: '#ffffff',
      marinho: '#123048',
      ardosia: '#434d58',
      salvia: '#7b8261',
      tijolo: '#b5483f',
      madeira: '#b9773f',
    });
  });

  it('contraste WCAG (valores de referência)', () => {
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contraste('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });

  it('texto principal AAA; links e botões AA; capa com véu ≥ 4,5', () => {
    for (const p of paresObrigatorios) expect(avaliar(p, t).passa, p.uso).toBe(true);
    expect(avaliarVeu(0.7, t).razao).toBeGreaterThanOrEqual(4.5);
  });

  it('Sálvia sobre Linho em texto pequeno reprova', () => {
    const r = avaliar({ uso: 'x', texto: 'salvia', fundo: 'linho', nivel: 'AA' }, t);
    expect(r.passa).toBe(false);
    expect(paresProibidos.some((p) => p.texto === 'salvia' && p.fundo === 'linho')).toBe(true);
  });

  it('Sálvia escura é derivada (mais escura que a Sálvia) e passa AA sobre Linho e Papel', () => {
    const se = t['salvia-escura'] ?? '';
    expect(contraste(se, t.linho ?? '')).toBeGreaterThanOrEqual(4.5);
    expect(contraste(se, t.papel ?? '')).toBeGreaterThanOrEqual(4.5);
    expect(contraste(se, '#ffffff')).toBeGreaterThan(contraste(t.salvia ?? '', '#ffffff'));
  });

  it('audit-contraste passa', () => {
    const r = spawnSync('node', [`${raiz}scripts/audit-contraste.mjs`], { encoding: 'utf8' });
    expect(r.stdout).toMatch(/contraste verde/);
    expect(r.status).toBe(0);
  });
});

describe('marca', () => {
  const dir = `${raiz}src/components/marca/svg/`;
  const svgs = readdirSync(dir).filter((f) => f.endsWith('.svg'));

  it('8 SVG otimizados, com viewBox e os grupos da marca', () => {
    expect(svgs).toHaveLength(8);
    for (const f of svgs) {
      const s = readFileSync(dir + f, 'utf8');
      expect(s, f).toMatch(/viewBox="/);
      expect(s, f).toMatch(/id="arco"/);
      expect(s, f).toMatch(/id="figura"/);
    }
    const logo = readFileSync(`${dir}ardeli-logo.svg`, 'utf8');
    for (const id of ['letra-a', 'palavra', 'descritor']) expect(logo).toContain(`id="${id}"`);
  });

  it('versões mono usam currentColor', () => {
    for (const f of svgs.filter((x) => x.includes('-mono'))) {
      expect(readFileSync(dir + f, 'utf8')).not.toMatch(/fill="#/);
    }
  });
});

describe('horário no navegador (núcleo)', () => {
  it('núcleo e statusEm usam a mesma config', () => {
    const s = calcularStatus(new Date('2026-11-23T13:00:00Z'), configHorario([2026]));
    expect(s.texto).toBe('Aberto agora · até 20h');
    expect(s.diaSemana).toBe(1);
  });
});

describe('JS do cliente', () => {
  it('scripts não usam nada além de localStorage para a preferência de tamanho', () => {
    const tamanho = readFileSync(`${raiz}src/scripts/tamanho.ts`, 'utf8');
    expect(tamanho).toMatch(/try \{/);
    const horario = readFileSync(`${raiz}src/scripts/horario.ts`, 'utf8');
    expect(horario).not.toMatch(/localStorage|fetch\(|cookie/);
  });
});
