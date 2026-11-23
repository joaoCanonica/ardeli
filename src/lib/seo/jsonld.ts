// JSON-LD a partir da config e do conteúdo (nunca escrito à mão).
// Tipos de schema-dts (gerados do vocabulário schema.org): propriedade ou tipo errado
// não compila. Regras:
//   - MedicalClinic + Physiotherapy (Physiotherapy é ao mesmo tempo MedicalBusiness e
//     valor de MedicalSpecialty no schema.org); serviços como PhysicalTherapy (MedicalTherapy).
//   - Physician NÃO: no schema.org é "médico ou consultório médico".
//   - SEM AggregateRating e SEM Review (COFFITO Art. 10, V; Google: avaliações
//     "autosservidas" de LocalBusiness não geram estrelas).
//   - Convênio só confirmado (healthPlanNetworkId); SUS só com confirmação.
//   - CREFITO só confirmado (hasCredential); sem número, a pessoa sai sem credencial
//     (e a produção já trava pelo Art. 48).
import type {
  BreadcrumbList,
  EducationalOccupationalCredential,
  FAQPage,
  Graph,
  MedicalClinicLeaf,
  OpeningHoursSpecification,
  Person,
  PhysicalTherapy,
  PropertyValue,
  Thing,
  VideoObject,
  WebPage,
  WebSite,
} from 'schema-dts';
import { clinica } from '../../config/clinica.ts';
import { exigir, valorDe } from '../../config/tipos.ts';
import { atendimentos } from '../../content/dados/atendimentos.ts';
import { convenios } from '../../content/dados/convenios.ts';
import { profissionais } from '../../content/dados/profissionais.ts';
import { grupos } from '../../content/textos/faq.ts';
import { nap } from './nap.ts';
import { OG_IMAGEM, absoluta, caminhoCanonico } from './site.ts';

export const ID = {
  clinica: () => absoluta('/#clinica'),
  site: () => absoluta('/#site'),
  pagina: (caminho: string) => absoluta(`${caminhoCanonico(caminho)}#pagina`),
  trilha: (caminho: string) => absoluta(`${caminhoCanonico(caminho)}#trilha`),
  pessoa: (id: string) => absoluta(`/quem-cuida/#${id}`),
  tour: () => absoluta('/a-clinica/#tour'),
} as const;

const DIAS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

const CREFITO_ORG = (regiao: string) =>
  ({
    '@type': 'Organization',
    name: `Conselho Regional de Fisioterapia e Terapia Ocupacional da ${regiao}ª Região (CREFITO-${regiao})`,
    alternateName: `CREFITO-${regiao}`,
  }) as const;

/** Convênios confirmados (sem "Particular"). SUS entra só se confirmado. */
export function conveniosAceitos(): string[] {
  return convenios
    .filter((c) => c.id !== 'particular' && c.atende.estado === 'confirmado')
    .sort((a, b) => a.ordem - b.ordem)
    .map((c) => c.nomeCompleto);
}

export function atendimentosPublicados() {
  return atendimentos
    .filter((a) => a.publicado && a.confirmacao.estado === 'confirmado')
    .sort((a, b) => a.ordem - b.ordem);
}

function pessoas(): Person[] {
  const regiao = valorDe(clinica.empresa.regiaoCrefito) ?? '10';
  return [...profissionais]
    .sort((a, b) => a.ordem - b.ordem)
    .map((p) => {
      const pessoa: Person = {
        '@type': 'Person',
        '@id': ID.pessoa(p.id),
        name: p.nome,
        jobTitle: p.profissao,
        worksFor: { '@id': ID.clinica() },
      };
      if (p.crefito.estado === 'confirmado') {
        const credencial: EducationalOccupationalCredential = {
          '@type': 'EducationalOccupationalCredential',
          name: `CREFITO-${regiao} nº ${p.crefito.valor}`,
          credentialCategory: 'Inscrição profissional de fisioterapeuta',
          identifier: p.crefito.valor,
          recognizedBy: CREFITO_ORG(regiao),
        };
        pessoa.hasCredential = credencial;
      }
      return pessoa;
    });
}

function horario(): OpeningHoursSpecification[] {
  const h = exigir(clinica.horario, 'JSON-LD: horário');
  return [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dias.map((d) => `https://schema.org/${DIAS[d - 1] ?? 'Monday'}` as const),
      opens: h.abre,
      closes: h.fecha,
    },
  ];
}

function identificadores(): PropertyValue[] {
  const ids: PropertyValue[] = [];
  const cnes = valorDe(clinica.empresa.cnes);
  const re = valorDe(clinica.empresa.crefitoEmpresa);
  const regiao = valorDe(clinica.empresa.regiaoCrefito) ?? '10';
  if (cnes) ids.push({ '@type': 'PropertyValue', propertyID: 'CNES', value: cnes });
  if (re)
    ids.push({
      '@type': 'PropertyValue',
      propertyID: `CREFITO-${regiao} (registro de empresa)`,
      value: re,
    });
  return ids;
}

/** MedicalClinic e Physiotherapy (MedicalBusiness) ao mesmo tempo; propriedades checadas como MedicalClinic. */
export type NoClinica = Omit<MedicalClinicLeaf, '@type'> & {
  '@type': ['MedicalClinic', 'Physiotherapy'];
};

/** A clínica (vai em toda página; as outras entidades apontam para o @id). */
export function noClinica(): NoClinica {
  const n = nap();
  const geo = exigir(clinica.geo, 'JSON-LD: geo');
  const aceitos = conveniosAceitos();
  const servicos: PhysicalTherapy[] = atendimentosPublicados().map((a) => ({
    '@type': 'PhysicalTherapy',
    name: a.nome,
    url: absoluta(`/atendimentos/${a.id}/`),
  }));
  const no: MedicalClinicLeaf = {
    '@type': 'MedicalClinic',
    '@id': ID.clinica(),
    name: n.nome,
    description: `Clínica de fisioterapia no bairro ${n.bairro}, em ${n.cidade} (${n.uf}). Atende particular${aceitos.length ? `, ${aceitos.join(', ')}` : ''}. Segunda a sexta, das 8h às 20h.`,
    url: absoluta('/'),
    telephone: n.telefoneE164,
    image: [absoluta(OG_IMAGEM.caminho)],
    logo: absoluta('/apple-touch-icon.png'),
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${n.logradouro}, ${n.numero}`,
      addressLocality: n.cidade,
      addressRegion: n.uf,
      postalCode: n.cep,
      addressCountry: n.pais,
    },
    geo: { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng },
    hasMap: clinica.links.googleMaps,
    openingHoursSpecification: horario(),
    sameAs: [clinica.links.instagram, clinica.links.googleMaps],
    identifier: identificadores(),
    medicalSpecialty: 'https://schema.org/Physiotherapy',
    availableService: servicos,
    ...(aceitos.length ? { healthPlanNetworkId: aceitos } : {}),
    employee: pessoas(),
  };
  return { ...no, '@type': ['MedicalClinic', 'Physiotherapy'] };
}

export function noSite(): WebSite {
  return {
    '@type': 'WebSite',
    '@id': ID.site(),
    name: nap().nome,
    url: absoluta('/'),
    inLanguage: 'pt-BR',
    publisher: { '@id': ID.clinica() },
  };
}

export interface Migalha {
  readonly nome: string;
  readonly caminho: string;
}

export function noTrilha(caminho: string, migalhas: readonly Migalha[]): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    '@id': ID.trilha(caminho),
    itemListElement: migalhas.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: m.nome,
      item: absoluta(caminhoCanonico(m.caminho)),
    })),
  };
}

export function noPagina(opcoes: {
  caminho: string;
  titulo: string;
  descricao: string;
  comTrilha: boolean;
  sobre?: Thing;
}): WebPage {
  return {
    '@type': 'WebPage',
    '@id': ID.pagina(opcoes.caminho),
    url: absoluta(caminhoCanonico(opcoes.caminho)),
    name: opcoes.titulo,
    description: opcoes.descricao,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': ID.site() },
    about: opcoes.sobre ?? { '@id': ID.clinica() },
    ...(opcoes.comTrilha ? { breadcrumb: { '@id': ID.trilha(opcoes.caminho) } } : {}),
  };
}

/** Perguntas publicadas, com a resposta exatamente como aparece na página. */
export function noFaq(caminho: string): FAQPage {
  const perguntas = grupos.flatMap((g) => g.perguntas.filter((p) => p.publicado));
  return {
    '@type': 'FAQPage',
    '@id': absoluta(`${caminhoCanonico(caminho)}#perguntas`),
    mainEntity: perguntas.map((p) => ({
      '@type': 'Question',
      name: p.pergunta,
      acceptedAnswer: {
        '@type': 'Answer',
        text: p.resposta
          .filter((r) => !r.exige)
          .map((r) => r.texto)
          .join(' '),
      },
    })),
  };
}

const duracaoIso = (s: number) => {
  const t = Math.round(s);
  return `PT${Math.floor(t / 60) ? `${Math.floor(t / 60)}M` : ''}${t % 60}S`;
};

export function noTour(v: {
  mp4: string;
  duracao: number;
  poster: string;
  largura: number;
  altura: number;
}): VideoObject {
  const data = valorDe(clinica.tourPublicadoEm);
  return {
    '@type': 'VideoObject',
    '@id': ID.tour(),
    name: 'Tour pela Ardeli Fisioterapia',
    description:
      'Vídeo sem som da clínica, ambiente por ambiente: fachada, entrada, sala de esteira e bikes, ginásio de reabilitação, corredor com jardim vertical, dois consultórios e recepção.',
    thumbnailUrl: [absoluta(v.poster)],
    ...(data ? { uploadDate: data } : {}),
    duration: duracaoIso(v.duracao),
    contentUrl: absoluta(v.mp4),
    width: { '@type': 'QuantitativeValue', value: v.largura, unitCode: 'E37' },
    height: { '@type': 'QuantitativeValue', value: v.altura, unitCode: 'E37' },
    inLanguage: 'pt-BR',
    publisher: { '@id': ID.clinica() },
    contentLocation: { '@id': ID.clinica() },
  };
}

type No = Exclude<Graph['@graph'][number], string> | NoClinica;
export interface Grafo {
  '@context': 'https://schema.org';
  '@graph': No[];
}

/** Monta o @graph da página. */
export function grafo(nos: readonly No[]): Grafo {
  return { '@context': 'https://schema.org', '@graph': [...nos] };
}

/** JSON seguro para <script type="application/ld+json"> (sem "</script>"). */
export function serializar(g: Grafo): string {
  return JSON.stringify(g).replace(/</g, '\\u003c');
}
