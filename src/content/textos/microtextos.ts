// Microtextos: botões, mensagens de WhatsApp, alt das imagens, rodapé (Art. 48) e meta da home.
import { nap } from '../../lib/seo/nap.ts';
import { clinica } from '../../config/clinica.ts';
import { valorDe } from '../../config/tipos.ts';
import { montarPedido } from '../../lib/agenda.ts';
import { mensagens } from '../../lib/whatsapp.ts';
import { convenios } from '../dados/convenios.ts';
import { profissionais } from '../dados/profissionais.ts';
import { f, type Frase, type Meta } from './tipos.ts';

export const metaHome = {
  titulo: 'Fisioterapia no Brusque, em Lages · Ardeli Fisioterapia',
  descricao:
    'Fisioterapia no bairro Brusque, em Lages (SC). Particular, Unimed e AAPL. Segunda a sexta, das 8h às 20h. Agende sua avaliação pelo WhatsApp.',
} satisfies Meta;

// ---------- botões e rótulos ----------
export const botoes = {
  agendar: 'Agendar avaliação',
  agendarCurto: 'Agendar',
  verConvenios: 'Ver convênios aceitos',
  verAtendimentos: 'Ver os atendimentos',
  primeiraAvaliacao: 'Como é a primeira avaliação',
  quemCuida: 'Conheça quem cuida',
  conhecaClinica: 'Conheça a clínica',
  verTour: 'Ver o tour em vídeo',
  pausarVideo: 'Pausar o vídeo',
  continuarVideo: 'Continuar o vídeo',
  comoChegar: 'Como chegar',
  ligar: 'Ligar',
  whatsapp: 'Chamar no WhatsApp',
  avaliarGoogle: 'Avaliar no Google',
  copiarEndereco: 'Copiar endereço',
  enderecoCopiado: 'Endereço copiado',
  mostrarMapa: 'Mostrar o mapa',
  menu: 'Menu',
  fecharMenu: 'Fechar menu',
  pular: 'Pular para o conteúdo',
  texto: 'Texto',
  diminuirTexto: 'Diminuir o texto',
  aumentarTexto: 'Aumentar o texto',
  imprimir: 'Imprimir esta lista',
  voltarInicio: 'Voltar para o início',
  /** Para leitor de tela, junto dos botões que abrem outro app. */
  abreWhatsApp: 'abre o WhatsApp',
  abreMapa: 'abre o mapa',
} as const;

// ---------- mensagens de WhatsApp (todas com "Vim pelo site da Ardeli") ----------
// Geradas pelas mesmas funções que o site usa (src/lib), para não divergirem.
const conv = (id: string) => convenios.find((c) => c.id === id);
export const mensagensWhatsApp = {
  geral: mensagens.geral(),
  agendar: montarPedido({ forma: 'nao-sei' }),
  agendarParticular: montarPedido({ forma: 'particular' }),
  agendarUnimed: montarPedido({ forma: 'unimed' }),
  agendarAapl: montarPedido({ forma: 'aapl' }),
  /** SUS não confirmado: pergunta, não afirma. */
  perguntarSus: (() => {
    const sus = conv('sus');
    return sus ? mensagens.convenio(sus) : mensagens.geral();
  })(),
  atendimentoOrtopedia: mensagens.atendimento({ nomeCurto: 'ortopedia e dor' }),
  comoChegar: mensagens.comoChegar(),
} as const;

// ---------- alt das imagens (ambiente + o que se vê) ----------
// Chave = id do still (vale para todos os recortes: 9x16, 4x5, 16x9), pôster ou captura.
// Conferido nos quadros do vídeo (docs/dados/folha-de-contato-*.jpg).
export const alts: Record<string, Frase> = {
  // stills
  fachada: f(
    'Fachada da clínica: letreiro "Ardeli Fisioterapia" com o símbolo e, abaixo, a vitrine verde.',
    'tour',
  ),
  tapete: f('Entrada: tapete cinza com o nome "Ardeli Fisioterapia" em azul e verde.', 'tour'),
  cardio: f(
    'Sala de esteira e bikes: esteira e bicicletas ergométricas diante da parede vermelha com relógio.',
    'tour',
  ),
  'ginasio-trelica': f(
    'Ginásio de reabilitação: treliça de madeira no teto, parede vermelha, bolas azuis e tablado.',
    'tour',
  ),
  espaldar: f(
    'Ginásio: espaldar de madeira na parede vermelha, com faixas elásticas coloridas penduradas.',
    'tour',
  ),
  'jardim-vertical': f('Corredor com piso de taco, bebedouro e jardim vertical ao fundo.', 'tour'),
  'quadro-fisioterapia': f(
    'Consultório 1: quadro emoldurado com o verbete "fisioterapia, s.f." e duas definições numeradas.',
    'tour',
    'quadro',
  ),
  'quadro-fisioterapia-quadro': f(
    'Quadro com a palavra "fisioterapia", a classe "s.f." e duas definições numeradas.',
    'tour',
    'quadro',
  ),
  'consultorio-1': f(
    'Consultório 1: maca com escadinha branca, persiana e piso de madeira.',
    'tour',
  ),
  'consultorio-2': f(
    'Consultório 2: maca estofada com base de madeira, janela com grade e piso de taco.',
    'tour',
  ),
  'quadros-anatomicos': f(
    'Consultório 2: quadros com ilustrações de anatomia e flores, sobre um armário claro.',
    'tour',
  ),
  recepcao: f(
    'Recepção vista do corredor: divisória de vidro, bebedouro e a vitrine para a avenida.',
    'tour',
  ),
  'ginasio-amplo': f(
    'Ginásio amplo: espaldar, tablado e janelas grandes para a avenida, com cadeiras de espera.',
    'tour',
  ),
  // pôsteres dos capítulos do tour
  'poster-fachada': f('Fachada da clínica com o letreiro "Ardeli Fisioterapia".', 'tour'),
  'poster-vitrine': f(
    'Vitrine com as palavras fisioterapia, recuperação funcional, bem-estar e atendimento acessível.',
    'tour',
    'vitrine',
  ),
  'poster-entrada': f(
    'Porta de vidro da entrada com a frase "Cuidar do seu corpo é investir na sua qualidade de vida".',
    'tour',
    'porta',
  ),
  'poster-cardio': f('Sala de esteira e bikes com parede vermelha.', 'tour'),
  'poster-ginasio': f(
    'Ginásio de reabilitação com treliça de madeira no teto e bolas azuis.',
    'tour',
  ),
  'poster-corredor': f('Corredor de taco com jardim vertical ao fundo.', 'tour'),
  'poster-consultorio-1': f('Consultório 1 com maca e aparelho de eletroterapia.', 'tour'),
  'poster-portas': f('Corredor dos consultórios com placa "Fisioterapia" na porta.', 'tour'),
  'poster-consultorio-2': f('Consultório 2 com maca e janela.', 'tour'),
  'poster-recepcao': f('Recepção com divisória de vidro e vista para a avenida.', 'tour'),
  'poster-ginasio-final': f('Ginásio amplo com janelas para a avenida.', 'tour'),
  // capturas (até 360 px)
  'captura-15-04-51': f('Ginásio: treliça de madeira no teto, espelho, bolas e tablado.', 'tour'),
  'captura-15-05-07': f(
    'Consultório 1: maca, aparelho de eletroterapia, poltrona e persiana.',
    'tour',
  ),
  'captura-15-05-23': f('Fachada da clínica vista da rua, de dia.', 'tour'),
  'captura-15-05-48': f('Sala de esteira e bikes com parede vermelha.', 'tour'),
  'captura-15-06-04': f('Espaldar de madeira e faixas elásticas na parede vermelha.', 'tour'),
  'captura-15-06-21': f('Fachada de perto: letreiro, vitrine adesivada e o número 2700.', 'tour'),
  'captura-15-06-42': f('Consultório 2: mesa, maca e piso de madeira.', 'tour'),
};

/** Alt de uma imagem do media-index (ex.: "still-espaldar-4x5" → alts.espaldar). */
export function altDe(idImagem: string): string {
  const semPrefixo = idImagem.replace(/^still-/, '');
  if (alts[semPrefixo]) return alts[semPrefixo].texto;
  const semRecorte = semPrefixo.replace(/-(9x16|4x5|16x9)$/, '');
  const a = alts[semRecorte] ?? alts[idImagem];
  if (!a) throw new Error(`sem alt para a imagem "${idImagem}"`);
  return a.texto;
}

// ---------- rodapé (COFFITO Art. 48: nome, "Fisioterapeuta" e nº de inscrição) ----------
export function rodape() {
  const regiao = valorDe(clinica.empresa.regiaoCrefito) ?? '10';
  const n = nap();
  return {
    nome: n.nome,
    endereco: n.endereco,
    telefone: n.telefone,
    horario: 'Segunda a sexta, das 8h às 20h',
    instagram: '@ardeli_fisioterapia',
    profissionais: [...profissionais]
      .sort((a, b) => a.ordem - b.ordem)
      .map((p) => ({
        nome: p.nome,
        texto:
          p.crefito.estado === 'confirmado'
            ? `${p.nome} · ${p.profissao} · CREFITO-${regiao} nº ${p.crefito.valor}`
            : `${p.nome} · ${p.profissao} · CREFITO-${regiao}: número em confirmação`,
        responsavel: p.responsavel,
      })),
    responsavelTecnica: f('Responsável técnica: Andriele da Silva, Fisioterapeuta.', 'joao'),
    empresa: f(
      `Registro de empresa no CREFITO-${regiao}: ${valorDe(clinica.empresa.crefitoEmpresa) ?? ''} · CNES ${valorDe(clinica.empresa.cnes) ?? ''}`,
      'crefito',
      'cnes',
    ),
    nota: f(
      'Divulgação conforme o Código de Ética da Fisioterapia (Resolução COFFITO 424/2013).',
      'coffito',
    ),
    links: { privacidade: 'Privacidade', avaliar: 'Avaliar no Google' },
  };
}
