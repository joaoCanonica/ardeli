// audit-seo: SEO local e GEO sobre o dist/ (rode depois do build).
//   - metas, H1 único, Open Graph 1200×630, canonical (com domínio), lang pt-BR;
//   - JSON-LD: parse, clínica = config, sem AggregateRating/Review, FAQPage = página,
//     BreadcrumbList nas internas, VideoObject no tour;
//   - NAP idêntico: todo [data-nap] = config; nenhuma variação de telefone, número,
//     CEP ou nome em HTML nem no llms.txt;
//   - llms.txt no formato llmstxt.org; robots.txt e sitemap.xml;
//   - imagem OG atual (hash das entradas, inclusive o CREFITO).
// Preview: domínio ausente é aviso. Produção (ARDELI_MODO=producao): trava.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseHTML } from 'linkedom';
import sharp from 'sharp';
import { modoAtual } from '../src/config/modo.ts';
import { clinica } from '../src/config/clinica.ts';
import { valorDe } from '../src/config/tipos.ts';
import { convenios } from '../src/content/dados/convenios.ts';
import { profissionais } from '../src/content/dados/profissionais.ts';
import { grupos } from '../src/content/textos/faq.ts';
import { atendimentosPublicados, conveniosAceitos } from '../src/lib/seo/jsonld.ts';
import { nap } from '../src/lib/seo/nap.ts';
import { OG_IMAGEM, absoluta, caminhoCanonico, dominio } from '../src/lib/seo/site.ts';
import { hashOg, raiz } from './lib/og.mjs';

const dist = join(raiz, 'dist');
const producao = modoAtual() === 'producao';
const N = nap();
const falhas = [];
const avisos = [];
let checagens = 0;
const ok = (cond, msg) => {
  checagens++;
  if (!cond) falhas.push(msg);
};
const avisa = (msg) => avisos.push(msg);
const norm = (s) => (s ?? '').replace(/\s+/g, ' ').trim();

if (!existsSync(dist)) {
  console.error('✖ dist/ ausente: rode pnpm build');
  process.exit(1);
}

// ---------- páginas indexáveis ----------
const INDEXAVEIS = [
  '/',
  '/convenios/',
  '/atendimentos/',
  ...atendimentosPublicados().map((a) => `/atendimentos/${a.id}/`),
  '/primeira-avaliacao/',
  '/quem-cuida/',
  '/a-clinica/',
  '/perguntas-frequentes/',
  '/como-chegar/',
  '/agendar/',
  '/privacidade/',
];
const arquivoDe = (c) =>
  join(dist, c === '/' ? 'index.html' : `${c.replace(/^\/|\/$/g, '')}/index.html`);

function htmls(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? htmls(p) : n.endsWith('.html') ? [p] : [];
  });
}

const temDominio = dominio() !== null;
if (!temDominio) {
  const msg = 'domínio ausente: sem canonical, og:url, og:image absoluta e sitemap';
  if (producao) ok(false, msg);
  else avisa(msg);
}

/** Procura chaves proibidas em qualquer nível do JSON-LD. */
function chavesProibidas(x, achadas = []) {
  if (Array.isArray(x)) x.forEach((i) => chavesProibidas(i, achadas));
  else if (x && typeof x === 'object')
    for (const [k, v] of Object.entries(x)) {
      if (/^(aggregateRating|review|reviews)$/i.test(k)) achadas.push(k);
      if (k === '@type' && [v].flat().some((t) => /^(AggregateRating|Review|Rating)$/.test(t)))
        achadas.push(String(v));
      chavesProibidas(v, achadas);
    }
  return achadas;
}

const tipos = (no) => [no['@type']].flat();
const titulos = new Map();
const descricoes = new Map();

for (const caminho of INDEXAVEIS) {
  const arq = arquivoDe(caminho);
  if (!existsSync(arq)) {
    ok(false, `${caminho}: página não gerada`);
    continue;
  }
  const html = readFileSync(arq, 'utf8');
  const { document: d } = parseHTML(html);
  const meta = (sel) => d.querySelector(sel)?.getAttribute('content') ?? null;
  const p = caminho;

  ok(d.documentElement.getAttribute('lang') === 'pt-BR', `${p}: <html lang> não é pt-BR`);
  const titulo = norm(d.querySelector('title')?.textContent);
  ok(titulo.length >= 15 && titulo.length <= 70, `${p}: <title> com ${titulo.length} caracteres`);
  const desc = meta('meta[name="description"]') ?? '';
  ok(desc.length >= 50 && desc.length <= 160, `${p}: description com ${desc.length} caracteres`);
  if (titulos.has(titulo)) ok(false, `${p}: <title> repetido de ${titulos.get(titulo)}`);
  if (descricoes.has(desc)) ok(false, `${p}: description repetida de ${descricoes.get(desc)}`);
  titulos.set(titulo, p);
  descricoes.set(desc, p);
  ok(d.querySelectorAll('h1').length === 1, `${p}: precisa de exatamente um <h1>`);

  // Open Graph
  for (const [k, v] of [
    ['og:title', null],
    ['og:description', null],
    ['og:locale', 'pt_BR'],
    ['og:type', 'website'],
    ['og:image', absoluta(OG_IMAGEM.caminho)],
    ['og:image:width', '1200'],
    ['og:image:height', '630'],
    ['og:image:alt', null],
  ]) {
    const c = meta(`meta[property="${k}"]`);
    ok(c && (v === null || c === v), `${p}: ${k} ausente ou diferente (${c ?? '—'})`);
  }
  ok(meta('meta[name="twitter:card"]') === 'summary_large_image', `${p}: twitter:card`);
  const canonical = d.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;
  if (temDominio) {
    ok(canonical === absoluta(caminhoCanonico(p)), `${p}: canonical ${canonical ?? 'ausente'}`);
    ok(meta('meta[property="og:url"]') === canonical, `${p}: og:url ≠ canonical`);
  }
  ok(
    d.querySelector('link[rel="describedby"][href="/llms.txt"]'),
    `${p}: sem <link rel="describedby" href="/llms.txt">`,
  );

  // JSON-LD
  const scripts = [...d.querySelectorAll('script[type="application/ld+json"]')];
  ok(scripts.length === 1, `${p}: ${scripts.length} blocos JSON-LD (esperado 1 @graph)`);
  let grafo = [];
  try {
    grafo = JSON.parse(scripts[0]?.textContent ?? '{}')['@graph'] ?? [];
  } catch (e) {
    ok(false, `${p}: JSON-LD inválido (${e.message})`);
  }
  const proibidas = chavesProibidas(grafo);
  ok(
    proibidas.length === 0,
    `${p}: JSON-LD com avaliação (${proibidas.join(', ')}) — COFFITO Art. 10, V`,
  );

  const clin = grafo.find((n) => tipos(n).includes('MedicalClinic'));
  ok(clin, `${p}: sem o nó MedicalClinic`);
  if (clin) {
    ok(tipos(clin).includes('Physiotherapy'), `${p}: clínica sem o tipo Physiotherapy`);
    ok(clin.medicalSpecialty === 'https://schema.org/Physiotherapy', `${p}: medicalSpecialty`);
    ok(clin.name === N.nome, `${p}: JSON-LD name ≠ NAP`);
    ok(clin.telephone === N.telefoneE164, `${p}: JSON-LD telephone ≠ NAP`);
    const a = clin.address ?? {};
    ok(
      a.streetAddress === `${N.logradouro}, ${N.numero}` &&
        a.addressLocality === N.cidade &&
        a.addressRegion === N.uf &&
        a.postalCode === N.cep &&
        a.addressCountry === N.pais,
      `${p}: JSON-LD address ≠ NAP`,
    );
    const geo = valorDe(clinica.geo);
    ok(clin.geo?.latitude === geo?.lat && clin.geo?.longitude === geo?.lng, `${p}: geo ≠ config`);
    const oh = clin.openingHoursSpecification?.[0];
    ok(
      oh?.opens === '08:00' && oh?.closes === '20:00' && oh?.dayOfWeek?.length === 5,
      `${p}: horário`,
    );
    ok(
      JSON.stringify(clin.healthPlanNetworkId ?? []) === JSON.stringify(conveniosAceitos()),
      `${p}: healthPlanNetworkId ≠ convênios confirmados`,
    );
    const sus = convenios.find((c) => c.id === 'sus');
    if (sus?.atende.estado !== 'confirmado')
      ok(!/\bSUS\b/.test(JSON.stringify(clin)), `${p}: JSON-LD cita SUS sem confirmação`);
    ok(
      JSON.stringify((clin.availableService ?? []).map((s) => s.name)) ===
        JSON.stringify(atendimentosPublicados().map((x) => x.nome)),
      `${p}: availableService ≠ atendimentos publicados`,
    );
    ok(
      (clin.identifier ?? []).some(
        (i) => i.propertyID === 'CNES' && i.value === valorDe(clinica.empresa.cnes),
      ),
      `${p}: identifier sem CNES`,
    );
    ok(
      (clin.identifier ?? []).some((i) => i.value === valorDe(clinica.empresa.crefitoEmpresa)),
      `${p}: identifier sem registro de empresa no CREFITO`,
    );
    for (const pr of profissionais) {
      const pe = (clin.employee ?? []).find((e) => e.name === pr.nome);
      ok(
        pe && pe.jobTitle === 'Fisioterapeuta',
        `${p}: employee ${pr.nome} ausente ou sem jobTitle`,
      );
      if (pr.crefito.estado === 'confirmado')
        ok(
          pe?.hasCredential?.identifier === pr.crefito.valor,
          `${p}: ${pr.nome} sem hasCredential do CREFITO`,
        );
      else ok(!pe?.hasCredential, `${p}: ${pr.nome} com credencial não confirmada`);
    }
  }

  const ehHome = p === '/';
  const trilha = grafo.find((n) => tipos(n).includes('BreadcrumbList'));
  if (ehHome) ok(!trilha, '/: home não leva BreadcrumbList');
  else {
    const itens = trilha?.itemListElement ?? [];
    ok(
      itens.length >= 2 &&
        itens.every((it, i) => it.position === i + 1 && it.name && it.item) &&
        itens.at(-1)?.item === absoluta(caminhoCanonico(p)),
      `${p}: BreadcrumbList incompleta`,
    );
  }
  ok(
    grafo.some((n) => tipos(n).includes('WebPage')),
    `${p}: sem WebPage`,
  );

  const faq = grafo.find((n) => tipos(n).includes('FAQPage'));
  if (p === '/perguntas-frequentes/') {
    const publicadas = grupos.flatMap((g) => g.perguntas.filter((q) => q.publicado));
    ok(faq?.mainEntity?.length === publicadas.length, `${p}: FAQPage ≠ perguntas publicadas`);
    // Espaço entre elementos: textContent cola os parágrafos.
    const texto = norm(
      parseHTML(html.replace(/</g, ' <')).document.querySelector('main')?.textContent,
    );
    for (const q of faq?.mainEntity ?? []) {
      ok(texto.includes(norm(q.name)), `${p}: pergunta "${q.name}" não está visível`);
      ok(
        texto.includes(norm(q.acceptedAnswer?.text).slice(0, 60)),
        `${p}: resposta de "${q.name}" não está visível`,
      );
    }
  } else ok(!faq, `${p}: FAQPage fora da página de perguntas`);

  const video = grafo.find((n) => tipos(n).includes('VideoObject'));
  if (p === '/a-clinica/') {
    ok(
      video?.name && video?.thumbnailUrl?.length && video?.uploadDate && video?.contentUrl,
      `${p}: VideoObject sem name/thumbnailUrl/uploadDate/contentUrl`,
    );
    ok(
      html.includes(video?.contentUrl?.replace(dominio() ?? '', '') ?? '§'),
      `${p}: o vídeo do JSON-LD não está na página`,
    );
  } else ok(!video, `${p}: VideoObject fora de /a-clinica`);

  // NAP no rodapé de toda página indexável.
  ok(d.querySelector('footer [data-nap="endereco"]'), `${p}: rodapé sem endereço (NAP)`);
  ok(d.querySelector('footer [data-nap="telefone"]'), `${p}: rodapé sem telefone (NAP)`);
}

// ---------- NAP idêntico em todo HTML e no llms.txt ----------
const todos = htmls(dist);
const llms = existsSync(join(dist, 'llms.txt')) ? readFileSync(join(dist, 'llms.txt'), 'utf8') : '';
const textos = todos.map((arq) => {
  const { document: d } = parseHTML(readFileSync(arq, 'utf8'));
  for (const el of d.querySelectorAll('[data-nap]')) {
    const campo = el.getAttribute('data-nap');
    const esperado = { endereco: N.endereco, telefone: N.telefone, nome: N.nome }[campo];
    ok(
      norm(el.textContent) === esperado,
      `${relative(dist, arq)}: [data-nap=${campo}] "${norm(el.textContent)}" ≠ "${esperado}"`,
    );
  }
  const { document: d2 } = parseHTML(readFileSync(arq, 'utf8').replace(/</g, ' <'));
  d2.querySelectorAll('script, style').forEach((s) => s.remove());
  return [relative(dist, arq), norm(d2.documentElement.textContent)];
});
textos.push(['llms.txt', llms]);
for (const [onde, t] of textos) {
  for (const m of t.matchAll(
    /\(\s*49\s*\)[\s.-]*\d[\d\s.-]{6,12}\d|\b49[\s.-]?9\d{3,4}[\s.-]?\d{4,5}\b/g,
  ))
    ok(norm(m[0]) === N.telefone, `${onde}: telefone fora do formato "${N.telefone}": "${m[0]}"`);
  for (const m of t.matchAll(/Dom Pedro II,?\s*(?:n[º°o.]\s*)?(\d{2,5})/g))
    ok(m[1] === N.numero, `${onde}: número divergente "${m[0]}"`);
  for (const m of t.matchAll(/\b(\d{5})-?(\d{3})\b/g))
    if (/^88\d{3}$/.test(m[1]))
      ok(`${m[1]}-${m[2]}` === N.cep, `${onde}: CEP divergente "${m[0]}"`);
  ok(!/Ardel{2,}i|Ardelí|Ardeli\s+Fisio(?!terapia)/i.test(t), `${onde}: grafia divergente do nome`);
  ok(!/Dom Pedro 2\b|D\. Pedro II/.test(t), `${onde}: grafia divergente da avenida`);
}

// ---------- llms.txt (llmstxt.org) ----------
ok(llms.length > 0, 'llms.txt ausente');
if (llms) {
  const linhas = llms.split('\n');
  ok(linhas[0] === `# ${N.nome}`, 'llms.txt: a 1ª linha deve ser "# Ardeli Fisioterapia"');
  ok(
    linhas.find((l) => l.trim())?.startsWith('# ') && linhas.some((l) => l.startsWith('> ')),
    'llms.txt: sem citação-resumo',
  );
  ok(!linhas.some((l) => /^#{3,}\s/.test(l)), 'llms.txt: só H1 e H2 são permitidos');
  ok(linhas.filter((l) => /^# /.test(l)).length === 1, 'llms.txt: um único H1');
  let emSecao = false;
  for (const l of linhas) {
    if (/^## /.test(l)) emSecao = true;
    else if (emSecao && l.trim())
      ok(
        /^- \[[^\]]+\]\([^)]+\)(: .+)?$/.test(l),
        `llms.txt: linha fora do formato de lista de links: "${l.slice(0, 60)}"`,
      );
  }
  for (const s of [N.endereco, N.telefone, 'segunda a sexta, das 8h às 20h'])
    ok(llms.includes(s), `llms.txt sem "${s}"`);
  const regiao = valorDe(clinica.empresa.regiaoCrefito) ?? '10';
  for (const pr of profissionais) {
    ok(
      llms.includes(`${pr.nome} · Fisioterapeuta`),
      `llms.txt sem ${pr.nome} · Fisioterapeuta (Art. 48)`,
    );
    if (pr.crefito.estado === 'confirmado')
      ok(
        llms.includes(`CREFITO-${regiao} nº ${pr.crefito.valor}`),
        `llms.txt sem o CREFITO de ${pr.nome}`,
      );
  }
  for (const c of conveniosAceitos()) ok(llms.includes(c), `llms.txt sem o convênio ${c}`);
}

// ---------- robots, sitemap ----------
const robots = existsSync(join(dist, 'robots.txt'))
  ? readFileSync(join(dist, 'robots.txt'), 'utf8')
  : '';
ok(
  /User-agent: \*/.test(robots) && !/Disallow: \/\s*$/m.test(robots),
  'robots.txt ausente ou bloqueando tudo',
);
const sitemap = existsSync(join(dist, 'sitemap.xml'))
  ? readFileSync(join(dist, 'sitemap.xml'), 'utf8')
  : '';
ok(sitemap.includes('<urlset'), 'sitemap.xml ausente');
if (temDominio) {
  ok(robots.includes(`Sitemap: ${absoluta('/sitemap.xml')}`), 'robots.txt sem a linha Sitemap');
  for (const c of INDEXAVEIS)
    ok(sitemap.includes(`<loc>${absoluta(caminhoCanonico(c))}</loc>`), `sitemap sem ${c}`);
}

// ---------- imagem de Open Graph ----------
const og = join(dist, OG_IMAGEM.caminho);
if (!existsSync(og)) ok(false, `${OG_IMAGEM.caminho} ausente (pnpm og)`);
else {
  const m = await sharp(og).metadata();
  ok(m.width === 1200 && m.height === 630, `imagem OG ${m.width}×${m.height} (esperado 1200×630)`);
  const reg = JSON.parse(readFileSync(og.replace(/\.jpg$/, '.json'), 'utf8'));
  ok(
    reg.hash === hashOg(),
    'imagem OG desatualizada (texto, CREFITO, foto ou marca mudou): rode pnpm og',
  );
}

// ---------- relatório ----------
for (const a of avisos) console.log(`  ⚠ ${a}`);
for (const f of falhas) console.log(`  ✖ ${f}`);
if (falhas.length) {
  console.log(`✖ audit-seo: ${falhas.length} problema(s) em ${checagens} verificações.`);
  process.exit(1);
}
console.log(
  `✓ audit-seo verde: ${checagens} verificações, ${INDEXAVEIS.length} páginas${avisos.length ? `, ${avisos.length} aviso(s)` : ''}.`,
);
