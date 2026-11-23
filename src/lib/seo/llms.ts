// /llms.txt (proposta llmstxt.org, v2): H1 com o nome, citação-resumo, detalhes sem
// títulos e, depois, seções H2 que são só listas de links ("Optional" = secundárias).
// Gerado da config e dos textos: nada escrito à mão, NAP idêntico ao do site.
import { registroDe } from '../registro.ts';
import { clinica } from '../../config/clinica.ts';
import { valorDe } from '../../config/tipos.ts';
import { convenios } from '../../content/dados/convenios.ts';
import { profissionais } from '../../content/dados/profissionais.ts';
import { metas } from '../../content/textos/index.ts';
import { atendimentosPublicados, conveniosAceitos } from './jsonld.ts';
import { nap } from './nap.ts';
import { absoluta } from './site.ts';

export function gerarLlmsTxt(): string {
  const n = nap();
  const m = metas();
  const regiao = valorDe(clinica.empresa.regiaoCrefito) ?? '10';
  const wa = valorDe(clinica.whatsapp);
  const aceitos = conveniosAceitos();
  const sus = convenios.find((c) => c.id === 'sus');
  const susConfirmado = sus?.atende.estado === 'confirmado';
  const pessoas = [...profissionais]
    .sort((a, b) => a.ordem - b.ordem)
    .map(
      (p) =>
        `  - ${registroDe(p).linha}${p.responsavel && registroDe(p).tipo === 'pessoal' ? ' (responsável técnica)' : ''}`,
    );
  const link = (caminho: string, nome: string, nota: string) =>
    `- [${nome}](${absoluta(caminho)}): ${nota}`;
  const atend = atendimentosPublicados();

  return [
    `# ${n.nome}`,
    '',
    `> Clínica de fisioterapia no bairro ${n.bairro}, em ${n.cidade} (${n.uf}). Atende particular${aceitos.length ? `, ${aceitos.join(' e ')}` : ''}, de segunda a sexta, das 8h às 20h. Agendamento pelo WhatsApp ${wa?.exibicao ?? n.telefone}.`,
    '',
    `- Endereço: ${n.endereco}`,
    `- WhatsApp: ${wa?.exibicao ?? n.telefone}`,
    '- Horário: segunda a sexta, das 8h às 20h',
    `- Formas de atendimento: particular${aceitos.length ? `, ${aceitos.join(', ')}` : ''}${
      susConfirmado ? '' : '. SUS: consulte a disponibilidade pelo WhatsApp'
    }`,
    `- Atendimentos: ${atend.map((a) => a.nome).join('; ')}`,
    '- Quem cuida:',
    ...pessoas,
    `- Registro de empresa no CREFITO-${regiao}: ${valorDe(clinica.empresa.crefitoEmpresa) ?? ''} · CNES ${valorDe(clinica.empresa.cnes) ?? ''}`,
    '- Como agendar: a primeira consulta é uma avaliação com a fisioterapeuta. O site monta a mensagem (forma de atendimento, motivo opcional, período e dias) e abre o WhatsApp da clínica; nada fica guardado no site.',
    `- Como chegar: ${n.endereco}. Rotas: Google Maps ${clinica.links.googleMapsRota} · Waze ${clinica.links.waze}`,
    `- Ficha no Google: ${clinica.links.googleMaps}`,
    `- Instagram: ${clinica.links.instagram}`,
    '',
    'O site não publica avaliações nem depoimentos de pacientes e não promete resultado (Código de Ética da Fisioterapia, Resolução COFFITO 424/2013).',
    '',
    '## Páginas',
    '',
    link('/convenios/', 'Convênios', m['convenios']?.descricao ?? ''),
    link('/atendimentos/', 'Atendimentos', m['atendimentos']?.descricao ?? ''),
    ...atend.map((a) =>
      link(`/atendimentos/${a.id}/`, a.nome, m[`atendimentos/${a.id}`]?.descricao ?? ''),
    ),
    link('/primeira-avaliacao/', 'Primeira avaliação', m['primeira-avaliacao']?.descricao ?? ''),
    link('/quem-cuida/', 'Quem cuida', m['quem-cuida']?.descricao ?? ''),
    link('/como-chegar/', 'Como chegar', m['como-chegar']?.descricao ?? ''),
    link('/agendar/', 'Agendar avaliação', m['agendar']?.descricao ?? ''),
    link(
      '/perguntas-frequentes/',
      'Perguntas frequentes',
      m['perguntas-frequentes']?.descricao ?? '',
    ),
    '',
    '## Optional',
    '',
    link('/a-clinica/', 'A clínica (tour em vídeo)', m['a-clinica']?.descricao ?? ''),
    link('/privacidade/', 'Privacidade', m['privacidade']?.descricao ?? ''),
    '',
  ].join('\n');
}
