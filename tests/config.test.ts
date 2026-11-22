import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { clinica } from '../src/config/clinica.ts';
import { encontrarTermosVetados, termosVetados } from '../src/config/termos.ts';
import { aviso, bloqueante, confirmado, exigir, opcional, valorDe } from '../src/config/tipos.ts';
import { camposDe, modoAtual, travasFalhando, verificarConfig } from '../src/config/travas.ts';
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
    expect(clinica.empresa.cnpj.estado).toBe('bloqueante');
    expect(valorDe(clinica.whatsapp)?.numero).toBe('5549999281721');
    expect(valorDe(clinica.horario)).toMatchObject({
      abre: '08:00',
      fecha: '20:00',
      dias: [1, 2, 3, 4, 5],
    });
    for (const c of ['acessibilidade', 'estacionamento', 'pontoDeReferencia'] as const) {
      expect(clinica[c].estado).toBe('opcional');
    }
  });

  it('só a musculoesquelética está publicada; nada publicado sem confirmação', () => {
    expect(atendimentos.filter((a) => a.publicado).map((a) => a.id)).toEqual([
      'musculoesqueletica',
    ]);
    for (const a of atendimentos.filter((x) => x.publicado))
      expect(a.confirmacao.estado).toBe('confirmado');
  });

  it('profissionais: Andriele bloqueante, Nicole 444436-F, sem título nem foto', () => {
    const [andriele, nicole] = profissionais;
    expect(andriele?.crefito.estado).toBe('bloqueante');
    expect(nicole?.crefito).toMatchObject({ estado: 'confirmado', valor: '444436-F' });
    for (const p of profissionais) {
      expect(p.titulosReconhecidos).toEqual([]);
      expect(p.foto).toBeNull();
      expect(p.profissao).toBe('Fisioterapeuta');
    }
  });

  it('SUS não confirmado; os outros confirmados', () => {
    const estado = Object.fromEntries(convenios.map((c) => [c.id, c.atende.estado]));
    expect(estado).toEqual({
      particular: 'confirmado',
      unimed: 'confirmado',
      aapl: 'confirmado',
      sus: 'bloqueante',
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

  it('produção trava sem o CREFITO da Andriele', () => {
    const abertas = travasFalhando(verificarConfig()).map((v) => v.id);
    expect(abertas).toContain('crefito:andriele-da-silva');
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
    expect(v.find((x) => x.id === 'clinica.empresa.cnpj')).toMatchObject({
      nivel: 'trava',
      ok: false,
    });
    expect(v.find((x) => x.id === 'clinica.google.linkPedirAvaliacoes')).toMatchObject({
      nivel: 'aviso',
    });
    expect(v.find((x) => x.id === 'sus')).toMatchObject({ nivel: 'aviso', ok: true });
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

  it('validate-config: preview passa, produção trava', () => {
    expect(rodar('validate-config.mjs', { ARDELI_MODO: 'preview' }).status).toBe(0);
    const prod = rodar('validate-config.mjs', { ARDELI_MODO: 'producao' });
    expect(prod.status).toBe(1);
    expect(prod.stdout).toMatch(/CREFITO-10 de Andriele da Silva ausente/);
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
    expect(r.stdout + r.stderr).toMatch(/CREFITO-10 de Andriele da Silva pendente/);
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
    expect(audit(pagina('<p>Atendemos pelo SUS.</p>')).status).toBe(1);
    expect(audit(pagina('<p>Convênios: Unimed, AAPL e SUS.</p>')).status).toBe(1);
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
