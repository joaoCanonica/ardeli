// Entradas da imagem de Open Graph (1200×630). O hash muda se mudar qualquer texto
// (inclusive o CREFITO), a foto, a marca ou as fontes: o audit-seo exige regerar (pnpm og).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rodape } from '../../src/content/textos/microtextos.ts';
import { conveniosAceitos } from '../../src/lib/seo/jsonld.ts';
import { OG_IMAGEM } from '../../src/lib/seo/site.ts';

export const raiz = fileURLToPath(new URL('../..', import.meta.url));
const VERSAO = 1;

export const ARQUIVOS_OG = {
  foto: join(raiz, 'public/media/img/still-fachada-4x5-720.webp'),
  logo: join(raiz, 'src/components/marca/svg/ardeli-horizontal.svg'),
  serifa: join(raiz, 'src/assets/fontes/crimson-pro-pt-normal.woff2'),
  sans: join(raiz, 'src/assets/fontes/atkinson-hyperlegible-next-pt-normal.woff2'),
};

export function entradaOg() {
  const r = rodape();
  return {
    versao: VERSAO,
    titulo: 'Fisioterapia no Brusque, Lages/SC',
    formas: ['Particular', ...conveniosAceitos().map((c) => c.split(' (')[0])].join(' · '),
    horario: r.horario,
    // COFFITO Art. 48: nome, "Fisioterapeuta" e CREFITO-10 também no Open Graph.
    profissionais: r.profissionais.map((p) => p.texto),
    empresa: r.empresa.texto,
    saida: OG_IMAGEM.caminho,
  };
}

export function hashOg() {
  const h = createHash('sha256').update(JSON.stringify(entradaOg()));
  for (const arq of Object.values(ARQUIVOS_OG)) h.update(readFileSync(arq));
  return h.digest('hex').slice(0, 16);
}
