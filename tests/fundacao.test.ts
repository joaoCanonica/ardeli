import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const ler = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), 'utf8');

describe('fundação', () => {
  it('CLAUDE.md, AGENTS.md e docs/CONTEXTO.md são idênticos', () => {
    const claude = ler('CLAUDE.md');
    expect(ler('AGENTS.md')).toBe(claude);
    expect(ler('docs/CONTEXTO.md')).toBe(claude);
  });

  it('CLAUDE.md é o bloco "CONTEXTO DO PROJETO" do pacote de prompts', () => {
    const pacote = ler('docs/ARDELI_PACOTE_PROMPTS_CODE.md');
    const bloco = /## B\. BLOCO[^\n]*\n\n````text\n([\s\S]*?)````/.exec(pacote)?.[1];
    expect(bloco).toBeDefined();
    expect(ler('CLAUDE.md')).toBe(bloco);
  });

  it('no preview, toda página fica fora do índice (Documento)', () => {
    const doc = ler('src/components/base/Documento.astro');
    expect(doc).toContain('const foraDoIndice = noindex || preview;');
    expect(doc).toContain('<meta name="robots" content="noindex, nofollow" />');
  });
});
