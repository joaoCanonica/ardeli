# Pendências

Dado do cliente nunca é inventado. Cada item abaixo fica fora do site, ou trava a produção, até o João confirmar.
Fontes: `docs/ARDELI_INVESTIGACAO_CLIENTE.md` (§2, §11) e `docs/ARDELI_PACOTE_PROMPTS_CODE.md` (seção A).

**Como resolver:** troque o campo em `src/config/` ou `src/content/dados/` por `confirmado(valor, "João, <data>")`, rode `pnpm validate-config` e `pnpm test`.
`pnpm validate-config` mostra o estado atual. Em produção (`ARDELI_MODO=producao`), toda **trava** aberta impede o build.

## Travas (impedem a produção)

| # | Campo | Onde | Efeito enquanto falta |
|---|---|---|---|
| 1 | Nº do CREFITO-10 pessoal da **Andriele da Silva** | `src/content/dados/profissionais.ts` → `crefito` | **Produção travada** (COFFITO Art. 48). No preview, o rodapé mostra "CREFITO pendente" |
| 2 | CNPJ completo (base 60.246.544) | `src/config/clinica.ts` → `empresa.cnpj` | **Produção travada** (pedido como `bloqueante`). Se o João preferir não mostrar o CNPJ no site, isso muda só com ordem expressa |

## Avisos (publica com texto seguro)

| # | Campo | Onde | O que o site faz enquanto falta |
|---|---|---|---|
| 3 | **SUS**: contrato vigente e caminho de acesso (UBS, regulação) | `src/content/dados/convenios.ts` → `sus.atende` | Diz "Consulte a disponibilidade pelo WhatsApp." **Não afirma** atendimento pelo SUS; o agendador não oferece SUS; o `audit-compliance` reprova qualquer menção afirmativa |
| 4 | Link "Pedir avaliações" do Perfil da Empresa no Google | `src/config/clinica.ts` → `google.linkPedirAvaliacoes` | "Avaliar no Google" abre a ficha do Maps (cid) |
| 5 | Telefone para **ligação**: o número do WhatsApp atende ligação? | `src/config/clinica.ts` → `telefone` | "Ligar" usa o número do WhatsApp |
| 6 | Autorização da pessoa refletida no vídeo-tour (quem filmou; 4 trechos: 1,6–3,2 · 6,1–7,7 · 9,9–11,0 · 41,3–42,75 s) | `media.manifest.json` | Trechos cortados de todos os derivados |

## Pendentes (o site omite)

| # | Campo | Onde | Efeito |
|---|---|---|---|
| 7 | Áreas de atendimento além da musculoesquelética (neurologia, cardiorrespiratória, oncologia, obstétrica, queimados) | `src/content/dados/atendimentos.ts` → `confirmacao`, `publicado` | `publicado=false`; o agendador não oferece "Neurológico" nem "Respiratório" |
| 8 | Regras da **Unimed** (planos aceitos, pedido médico, guia) | `convenios.ts` → `unimed.regras` | "Confirme pelo WhatsApp: a gente explica rapidinho." |
| 9 | Regras da **AAPL** (como funciona para o associado) | `convenios.ts` → `aapl.regras` | idem |
| 10 | A clínica **fecha nos feriados**? E quais feriados municipais de Lages ela segue (15/08, Corpus Christi, 22/11)? | `clinica.ts` → `fechaEmFeriados`; `src/config/feriados.ts` | Em feriado, o status diz "confirme o horário pelo WhatsApp" (não afirma aberto nem fechado). 22/11 está como "incerto" |
| 11 | Acessibilidade do espaço (entrada sem degrau, banheiro adaptado) | `clinica.ts` → `acessibilidade` | Fora do site e da FAQ |
| 12 | Estacionamento | `clinica.ts` → `estacionamento` | Fora do site |
| 13 | Ponto de referência do endereço | `clinica.ts` → `pontoDeReferencia` | Fora do site |
| 14 | Formação da Andriele (ano, instituição, títulos reconhecidos pelo COFFITO) | `profissionais.ts` → `formacao`, `titulosReconhecidos` | Nada de "especialista em" (o audit reprova) |
| 15 | Formação da Nicole de Abreu Batista | idem | Só nome, profissão e CREFITO |
| 16 | Retratos da Andriele e da Nicole, com autorização de imagem | `profissionais.ts` → `foto` | `foto: null` |
| 17 | Origem do nome "Ardeli" | — | Não contar a história |
| 18 | Domínio definitivo do site | `clinica.ts` → `dominio`; `astro.config.mjs` | Sem canonical/sitemap até a sessão de SEO |
| 19 | Duração da sessão / precisa de pedido médico (FAQ) | — | Pergunta fica fora da FAQ |
| 20 | Vídeo-tour original sem música (e em resolução maior) | `media.manifest.json` | Tour sempre mudo |
| 21 | Fotos do espaço em alta (≥ 2400 px), fachada de frente com letreiro inteiro | `docs/MIDIA_CATALOGO.md` §6 | Imagens largas limitadas a 720 px |
| 22 | Relação com o Studio Ar: o Pilates continua lá? O site cita e linka? | — | O site só cita a trajetória da Andriele (fato confirmado) |
