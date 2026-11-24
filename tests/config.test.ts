import { execFileSync, spawnSync } from 'node:child_process';
import { registroDe } from '../src/lib/registro.ts';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { clinica } from '../src/config/clinica.ts';
import { encontrarTermosVetados, termosVetados } from '../src/config/termos.ts';
import { aviso, bloqueante, confirmado, exigir, opcional, valorDe } from '../src/config/tipos.ts';
import {
  camposDe,
  modoAtual,
  travasFalhando,
  verificarCampo,
  verificarConfig,
} from '../src/config/travas.ts';
import { atendimentos } from '../src/content/dados/atendimentos.ts';
import { convenios } from '../src/content/dados/convenios.ts';
import { profissionais } from '../src/content/dados/profissionais.ts';
import { atendimentoSchema, convenioSchema, profissionalSchema } from '../src/content/schemas.ts';

const raiz = new URL('..', import.meta.url).pathname;

describe('tipos', () => {
  it('estados', () => {
    expect(valorDe(confirmado('x', 'fonte'))).toBe('x');
    expect(valorDe(opcional<string>())).toBeNull();
    expect(valorDe(bloqueante('y'))).toBeNull();
    expect(valorDe(aviso('z', 'motivo', 1))).toBe(1);
    expect(() => confirmado('x', ' ')).toThrow(/sem fonte/);
    expect(() => exigir(bloqueante('y'), 'teste')).toThrow(/não confirmado/);
  });
});

describe('dados', () => {
  it('coleções passam nos schemas', () => {
    for (const p of profissionais) expect(profissionalSchema.safeParse(p).success, p.id).toBe(true);
    for (const a of atendimentos) expect(atendimentoSchema.safeParse(a).success, a.id).toBe(true);
    for (const c of convenios) expect(convenioSchema.safeParse(c).success, c.id).toBe(true);
  });

  it('cadastro fixo da clínica', () => {
    expect(valorDe(clinica.empresa.cnes)).toBe('8422478');
    expect(valorDe(clinica.empresa.crefitoEmpresa)).toBe('RE005047');
    expect(valorDe(clinica.empresa.cnpj)).toBe('60.246.544/0001-60');
    expect(valorDe(clinica.dominio)).toBe('https://ardeli.com.br');
    expect(valorDe(clinica.whatsapp)?.numero).toBe('5549999281721');
    expect(valorDe(clinica.horario)).toMatchObject({
      abre: '08:00',
      fecha: '20:00',
      dias: [1, 2, 3, 4, 5],
    });
    expect(valorDe(clinica.acessibilidade)).toMatch(/rampa/);
    expect(valorDe(clinica.tourPublicadoEm)).toBe('2026-11-04');
    expect(valorDe(clinica.estacionamento)).toMatch(/em frente à clínica/);
    expect(valorDe(clinica.pontoDeReferencia)).toMatch(/Colégio Industrial/);
    expect(valorDe(clinica.fechaEmFeriados)).toBe(true);
  });

  it('todos os atendimentos do CNES publicados (João, 23/11/2026); nada sem confirmação', () => {
    expect(atendimentos.filter((a) => a.publicado).map((a) => a.id)).toEqual([
      'musculoesqueletica',
      'neurologia',
      'cardiorrespiratoria',
      'oncologia',
      'obstetrica',
      'queimados',
    ]);
    for (const a of atendimentos.filter((x) => x.publicado))
      expect(a.confirmacao.estado).toBe('confirmado');
  });

  it('profissionais: Andriele bloqueante, Nicole 444436-F, sem título nem foto', () => {
    const [andriele, nicole] = profissionais;
    expect(andriele?.crefito.estado).toBe('bloqueante'); // nº pessoal: ainda não confirmado
    expect(nicole?.crefito).toMatchObject({ estado: 'confirmado', valor: '444436-F' });
    for (const p of profissionais) {
      expect(p.titulosReconhecidos).toEqual([]);
      expect(p.foto).toBeNull();
      expect(p.profissao).toBe('Fisioterapeuta');
    }
  });

  it('todos os convênios confirmados, inclusive o SUS (João, 23/11/2026)', () => {
    const estado = Object.fromEntries(convenios.map((c) => [c.id, c.atende.estado]));
    expect(estado).toEqual({
      particular: 'confirmado',
      unimed: 'confirmado',
      aapl: 'confirmado',
      sus: 'confirmado',
    });
    expect(convenios.find((c) => c.id === 'sus')?.textoSePendente).toBe(
      'Consulte a disponibilidade pelo WhatsApp.',
    );
  });

  it('textos da config não usam termo vetado', () => {
    const textos = JSON.stringify({ atendimentos, convenios, profissionais });
    expect(encontrarTermosVetados(textos)).toEqual([]);
  });
});

describe('termos vetados', () => {
  it('acha termos com e sem acento, respeitando limite de palavra', () => {
    expect(encontrarTermosVetados('Avaliação GRATIS hoje').map((o) => o.termo)).toContain('grátis');
    expect(encontrarTermosVetados('resultado 100% garantido').map((o) => o.termo)).toEqual(
      expect.arrayContaining(['100%', 'garantido']),
    );
    expect(encontrarTermosVetados('quem procura cuidado')).toEqual([]);
    expect(encontrarTermosVetados('Temos a cura')).toHaveLength(1);
    expect(encontrarTermosVetados('A melhor clínica de Lages').map((o) => o.termo)).toEqual(
      expect.arrayContaining(['a melhor', 'melhor clínica']),
    );
  });

  it('"especialista" só junto de título confirmado', () => {
    expect(encontrarTermosVetados('Especialista em coluna')).toHaveLength(1);
    expect(
      encontrarTermosVetados('Especialista em Fisioterapia Traumato-Ortopédica', [
        'Fisioterapia Traumato-Ortopédica',
      ]),
    ).toEqual([]);
  });

  it('a lista tem todos os termos pedidos', () => {
    expect(termosVetados.map((t) => t.termo)).toEqual(
      expect.arrayContaining([
        'cura',
        'curar',
        'garantido',
        'sem dor',
        'número 1',
        'avaliação grátis',
        'depoimento',
        'antes e depois',
      ]),
    );
  });
});

describe('travas', () => {
  it('modo', () => {
    expect(modoAtual({})).toBe('preview');
    expect(modoAtual({ ARDELI_MODO: 'producao' })).toBe('producao');
  });

  it('Andriele: nº pessoal pendente; exibe o registro da clínica (ordem do João) sem travar', () => {
    const abertas = travasFalhando(verificarConfig()).map((v) => v.id);
    expect(abertas).not.toContain('crefito:andriele-da-silva');
    const andriele = profissionais.find((p) => p.id === 'andriele-da-silva');
    expect(andriele?.crefito.estado).toBe('bloqueante');
    if (!andriele) throw new Error('Andriele ausente');
    const r = registroDe(andriele);
    expect(r.tipo).toBe('clinica');
    expect(r.numeroPessoal).toBeNull();
    expect(r.linha).toBe(
      'Andriele da Silva · Fisioterapeuta · Responsável técnica · CREFITO-10 RE005047 (registro da clínica)',
    );
  });

  it('sem nº pessoal e sem a ordem do registro da clínica, continua pendente (trava)', () => {
    const base = profissionais.find((p) => p.id === 'andriele-da-silva');
    if (!base) throw new Error('Andriele ausente');
    expect(registroDe({ ...base, registroDaClinica: undefined }).tipo).toBe('pendente');
    // Só a responsável técnica pode usar o registro da clínica.
    expect(registroDe({ ...base, responsavel: false }).tipo).toBe('pendente');
  });

  it('imagem com pessoa sem autorização trava; pessoa só em trechos cortados avisa', () => {
    const base = { id: 'x', naoUsar: false, contemPessoa: true, trechos: [] };
    const trava = verificarConfig({ manifestoMidia: { itens: [base] } }).find(
      (v) => v.id === 'midia:x',
    );
    expect(trava).toMatchObject({ nivel: 'trava', ok: false });
    const cortado = verificarConfig({
      manifestoMidia: {
        itens: [
          { ...base, pessoaApenasNosTrechos: true, trechos: [{ id: 't', contemPessoa: true }] },
        ],
      },
    }).find((v) => v.id === 'midia:x');
    expect(cortado).toMatchObject({ nivel: 'aviso', ok: true });
    const naoUsar = verificarConfig({ manifestoMidia: { itens: [{ ...base, naoUsar: true }] } });
    expect(naoUsar.find((v) => v.id === 'midia:x')).toBeUndefined();
  });

  it('bloqueante sem fallback trava; com fallback avisa', () => {
    const v = verificarConfig();
    expect(verificarCampo('x', bloqueante('CNPJ'))).toMatchObject({ nivel: 'trava', ok: false });
    expect(verificarCampo('x', bloqueante('link', { fallback: 'ficha' }))).toMatchObject({
      nivel: 'aviso',
      ok: true,
    });
    expect(v.find((x) => x.id === 'clinica.google.linkPedirAvaliacoes')).toBeUndefined();
    expect(v.find((x) => x.id === 'sus')).toMatchObject({ nivel: 'trava', ok: true });
  });

  it('camposDe acha campos aninhados', () => {
    expect(camposDe(clinica).map(([c]) => c)).toEqual(
      expect.arrayContaining(['empresa.cnpj', 'whatsapp', 'google.linkPedirAvaliacoes']),
    );
  });
});

describe('scripts', () => {
  const rodar = (script: string, env: Record<string, string> = {}) =>
    spawnSync('node', [join(raiz, 'scripts', script)], {
      env: { ...process.env, ...env },
      encoding: 'utf8',
    });

  it('validate-config: preview e produção passam (sem trava aberta); SITE_URL inválida quebra', () => {
    expect(rodar('validate-config.mjs', { ARDELI_MODO: 'preview' }).status).toBe(0);
    const prod = rodar('validate-config.mjs', { ARDELI_MODO: 'producao' });
    expect(prod.status).toBe(0);
    expect(prod.stdout).toMatch(/nenhuma trava aberta/);
    expect(
      rodar('validate-config.mjs', { ARDELI_MODO: 'producao', SITE_URL: 'http://ardeli.com.br/x' })
        .status,
    ).not.toBe(0);
  });

  function distFalso(html: string): string {
    const d = mkdtempSync(join(tmpdir(), 'ardeli-dist-'));
    mkdirSync(join(d, 'pagina'));
    writeFileSync(join(d, 'pagina', 'index.html'), html);
    return d;
  }
  const pagina = (corpo: string) =>
    `<!doctype html><html lang="pt-BR"><head><meta name="robots" content="noindex, nofollow"></head><body>${corpo}<footer>Nicole de Abreu Batista · Fisioterapeuta · CREFITO-10 444436-F</footer></body></html>`;
  const audit = (html: string, env: Record<string, string> = {}) =>
    rodar('audit-compliance.mjs', { ARDELI_DIST: distFalso(html), ARDELI_MODO: 'preview', ...env });

  it('audit-compliance: página limpa passa no preview', () => {
    const r = audit(
      pagina('<h1>Ardeli Fisioterapia</h1><p>SUS: Consulte a disponibilidade pelo WhatsApp.</p>'),
    );
    // Rodapé falso sem a linha da Andriele: no preview é aviso, não falha.
    expect(r.stdout + r.stderr).toMatch(
      /rodapé sem "Andriele da Silva · Fisioterapeuta · Responsável técnica/,
    );
    expect(r.status).toBe(0);
  });

  it('audit-compliance: termo vetado, depoimento e SUS afirmado falham', () => {
    expect(audit(pagina('<p>Avaliação grátis!</p>')).status).toBe(1);
    expect(
      audit(pagina('<p>“Me ajudaram muito com a dor nas costas.” — Maria Souza</p>')).status,
    ).toBe(1);
    expect(audit(pagina('<blockquote>Ótimo</blockquote>')).status).toBe(1);
    expect(
      audit(pagina('<script type="application/ld+json">{"@type":"AggregateRating"}</script>'))
        .status,
    ).toBe(1);
    // SUS confirmado: afirmar atendimento pelo SUS passa (sem confirmação, reprovaria).
    expect(audit(pagina('<p>Atendemos pelo SUS.</p>')).status).toBe(0);
    expect(audit(pagina('<img src="/media/img/arte-unimed-720.webp" alt="">')).status).toBe(1);
  });

  it('audit-compliance: preview sem noindex falha; produção trava sem CREFITO no rodapé', () => {
    expect(audit('<html><body><footer></footer></body></html>').status).toBe(1);
    expect(audit(pagina('<h1>Ardeli</h1>'), { ARDELI_MODO: 'producao' }).status).toBe(1);
  });

  it('validate-config roda com o node do projeto (sem build)', () => {
    expect(() =>
      execFileSync('node', [join(raiz, 'scripts/validate-config.mjs')], { stdio: 'pipe' }),
    ).not.toThrow();
  });
});
