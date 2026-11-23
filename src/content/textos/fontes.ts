// Registro de fontes. Toda frase de src/content/textos aponta para pelo menos uma.
// - Fato do cliente → fonte verificável (João, Google, CNES, CREFITO, Instagram, vídeo).
// - Explicação geral (o que é avaliação funcional, roupa confortável) → `orientacao`.
// - Como a fisioterapia costuma funcionar → `pratica` (validar com a Andriele; ver PENDENCIAS).
// - Regra legal → `coffito` / `lgpd`.

export const FONTES = {
  joao: 'João (WAXLO): dados confirmados em 22/11/2026 (docs/ARDELI_INVESTIGACAO_CLIENTE.md §2)',
  google: 'Ficha da Ardeli no Google Maps, vista em 22/11/2026 (endereço, horário, coordenadas)',
  cnes: 'CNES 8422478 (Cadastro Nacional de Estabelecimentos de Saúde)',
  crefito:
    'CREFITO-10: registro de empresa RE005047 (desde 15/07/2026) e inscrição de Nicole de Abreu Batista (444436-F, 21/01/2026)',
  bio: 'Instagram @ardeli_fisioterapia, bio: "Cuidamos do seu movimento em todas as fases da vida."',
  vitrine:
    'Vitrine da clínica (vídeo-tour, 5–6 s): Fisioterapia (cuidado e reabilitação) · Recuperação funcional · Bem-estar · Atendimento acessível',
  porta:
    'Porta de vidro da entrada (vídeo-tour, 7–9 s): "Cuidar do seu corpo é investir na sua qualidade de vida."',
  quadro:
    'Quadro "fisioterapia, s.f." do consultório 1 (vídeo-tour, 35–37 s): "1. Área da saúde que previne, avalia e trata distúrbios do movimento e da função do corpo. 2. Utiliza exercícios, recursos físicos e técnicas terapêuticas para promover reabilitação, alívio da dor e qualidade de vida."',
  postUnimed: 'Instagram @ardeli_fisioterapia, 19/10/2026: "Agora atendemos Unimed!"',
  postAapl:
    'Instagram @ardeli_fisioterapia, 19/11/2026: "A Clínica Ardeli Fisioterapia agora é credenciada com a AAPL" e "Cuidar de você é o nosso compromisso."',
  reel: 'Reel do espaço, @ardeli_fisioterapia, 04/11/2026: atendimento "acolhedor, humanizado e de qualidade"',
  studioAr:
    'Instagram @studio.ar.pilates, post de 12/02/2024: "Inauguramos em janeiro de 2018… São 6 anos"',
  topClass:
    'Instagram @studio.ar.pilates: 1ª turma do curso Top Class em Pilates em mar/2024; turmas até jul/2026',
  tour: 'Vídeo-tour da clínica (media-originais/videos/tour.mp4), conferido quadro a quadro (docs/MIDIA_CATALOGO.md)',
  coffito: 'Código de Ética e Deontologia da Fisioterapia (Resolução COFFITO 424/2013)',
  lgpd: 'Lei Geral de Proteção de Dados Pessoais (Lei 13.709/2018), arts. 5º, 7º, 11 e 18',
  site: 'Funcionamento do próprio site (src/lib, src/scripts, src/components): o que ele guarda e o que não guarda',
  orientacao: 'Orientação geral ou explicação de termo, sem fato do cliente',
  pratica:
    'Como a fisioterapia costuma funcionar (avaliação, plano, acompanhamento). Validar a rotina com a Andriele',
  prompt: 'Texto definido pelo João no pacote de prompts (WAXLO)',
} as const;

export type FonteId = keyof typeof FONTES;
