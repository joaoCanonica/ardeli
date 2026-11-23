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

## Textos (sessão 5)

O que fica fora do site, ou aparece como "Confirme pelo WhatsApp: a gente explica rapidinho.", até o João confirmar. Fonte única: `pendenciasTextos` em `src/content/textos/index.ts`.

| # | Campo | Efeito nos textos |
|---|---|---|
| T1 | SUS: contrato vigente e caminho de acesso | FAQ "Atende pelo SUS?" fora; /convenios diz "Consulte a disponibilidade pelo WhatsApp"; textos do SUS guardados (exige sus-confirmado) |
| T2 | Precisa de pedido médico? (por convênio) | Pergunta fora do FAQ e da página de atendimento |
| T3 | Duração da sessão e da primeira avaliação | Pergunta fora do FAQ; /primeira-avaliacao mostra "Confirme pelo WhatsApp" |
| T4 | Estacionamento | Pergunta fora do FAQ; /como-chegar mostra "Confirme pelo WhatsApp" |
| T5 | Acessibilidade do espaço (entrada, banheiro, circulação) | Pergunta fora do FAQ; /primeira-avaliacao e /como-chegar mostram "Confirme pelo WhatsApp" |
| T6 | Ponto de referência | /como-chegar mostra "Confirme pelo WhatsApp" |
| T7 | Unimed: planos aceitos, guia, pedido médico | "Confirme pelo WhatsApp" em /convenios e no FAQ |
| T8 | AAPL: como funciona para o associado | "Confirme pelo WhatsApp" em /convenios e no FAQ |
| T9 | Validar com a Andriele o passo a passo (conversa, avaliação, plano, acompanhamento) e "o que levar" | Publicado como rotina comum da fisioterapia (fonte "pratica"/"orientacao") |
| T10 | Confirmar que Unimed e AAPL pedem carteirinha | Publicado como orientação ("leve a carteirinha") |
| T11 | Pode linkar o Instagram do Studio Ar? | Fato "atende em Lages desde 2018, no Studio Ar" sem link |

Frases com fonte "pratica" (rotina comum da fisioterapia) e "orientacao" (explicação geral) estão publicadas, mas a Andriele deve validar o passo a passo da primeira avaliação e a lista "o que levar".

## Home (sessão 6A)

| # | Campo | Efeito |
|---|---|---|
| H1 | Imagem do **mapa estático** | Os servidores de mapa (OpenStreetMap, Carto) estão bloqueados no ambiente de build. Enquanto não houver `src/assets/mapa-estatico.png` (export do OpenStreetMap com atribuição "© OpenStreetMap", ou liberar o host para gerar), a seção de endereço mostra um painel neutro com o código do Google e o botão "Mostrar o mapa" (mapa interativo só após o clique) |
| H2 | Link para o Instagram do Studio Ar na seção "acolhimento" (= T11) | Fato "A Andriele atende em Lages desde 2018, no Studio Ar Pilates e Fisioterapia" publicado sem link |
| H3 | Páginas internas (/convenios, /atendimentos, /quem-cuida, /a-clinica, /como-chegar, /primeira-avaliacao, /privacidade) | Chegam na sessão 6B; até lá, os links da home e do menu levam a páginas que ainda não existem |

## Agendar e avaliar (sessão 7)

| # | Campo | Efeito |
|---|---|---|
| F1 | Domínio definitivo (= 18) | Medição desligada; o QR de /avaliar/qr aponta direto para a ficha do Google (sem contar `?o=qr`); a mensagem pós-sessão usa o link "Pedir avaliações" no lugar de `{SITE}/avaliar?o=whatsapp` |
| F2 | Conta no Plausible + rewrite `/api/event` → `https://plausible.io/api/event` na hospedagem (repassando `X-Forwarded-For` e `User-Agent`) | Sem isso, nenhum evento sai do aparelho (só `window.__ardeliEventos`) |
| F3 | Link "Pedir avaliações" gerado na ficha do Google | `linkAvaliar()` usa o link da ficha (`?cid=`); a ficha abre, mas não direto na caixa de avaliação |
| F4 | CREFITO-10 da Andriele (= bloqueante) | A folha do QR diz "número em confirmação": não imprimir para o balcão até chegar |
| F5 | Quem envia a mensagem pós-sessão e quando (recepção, no mesmo dia) | Roteiro pronto em `docs/FUNIL.md` §2 |

## SEO e GEO (sessão 8)

| # | Campo | Efeito |
|---|---|---|
| S1 | Domínio definitivo (= 18, F1) | Agora **trava a produção**: sem ele não há canonical, og:url, og:image absoluta, sitemap nem URLs absolutas no JSON-LD e no llms.txt |
| S2 | Data de lançamento do site | `clinica.tourPublicadoEm` está com a data do commit "midia" (22/11/2026); trocar pela data em que o site for ao ar (VideoObject.uploadDate) |
| S3 | CREFITO-10 da Andriele (= bloqueante) | Sem `hasCredential` no JSON-LD; quando chegar: preencher e rodar `pnpm og` (o audit-seo avisa que a imagem OG ficou desatualizada) |
| S4 | Rich Results Test (Google) | Só roda com o site no ar (URL pública). validator.schema.org já passou sem erro (`pnpm validar-schema`) |
| S5 | Ficha do Google, avaliações, Studio Ar, NAP nos cadastros, teste mensal no Modo IA | Roteiro em `docs/SEO_GEO.md` (fora do site) |
| S6 | Atributos de acessibilidade e serviços da ficha | Só o que for confirmado (T5 e áreas de atendimento) |

## QA e deploy (sessão 9)

| # | Item | Efeito enquanto falta |
|---|---|---|
| Q1 | **`SITE_URL`** nas variáveis de ambiente da Vercel (Production): `https://<domínio>` | Produção travada (substitui o campo "domínio" do `clinica.ts`; o valor nunca é escrito no código) |
| Q2 | Projeto na Vercel + segredos do GitHub `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | O workflow roda QA e build, mas não publica |
| Q3 | `ARDELI_MODO=producao` nas variáveis de Production da Vercel | (o workflow já define no branch main) |
| Q4 | Teste com leitor de tela real (NVDA no Windows, VoiceOver no iPhone) | Roteiro em `docs/QA.md` §3; árvore de acessibilidade em `docs/qa/arvore-acessibilidade.md` |
| Q5 | Teste com uma pessoa de mais de 60 anos | Roteiro e ficha em `docs/QA.md` §4 |
| Q6 | Safari iOS e Firefox reais | Só Chromium roda neste ambiente; roteiro em `docs/QA.md` §5 |
| Q7 | LCP da home e de /a-clinica no perfil "4G lento" do Lighthouse (≈ 1,9 s) | Decisão: manter CLS 0 (fontes pré-carregadas) ou trocar por LCP menor com CLS até 0,02 (ver `docs/QA.md` §1) |

## Resolvido em 23/11/2026 (sessão 10, ordens do João)

| Item | Decisão | Como ficou |
|---|---|---|
| Trava 1 · CREFITO da Andriele | "vai com o que o perfil oficial mostra" | O nº **pessoal** continua não confirmado (não está em fonte pública). Por ordem expressa, o site mostra a Andriele como **Responsável técnica · CREFITO-10 RE005047 (registro da clínica)** — nunca como número pessoal. Vira aviso, não trava. **Recomendado:** publicar o nº pessoal quando chegar (Art. 48 pede o da profissional) |
| Trava 2 · CNPJ | 60.246.544/0001-60 (dígitos conferidos) | No rodapé, no cartaz do QR, em /quem-cuida e em /privacidade |
| 18 / Q1 / Q3 · Domínio | `https://ardeli.com.br` | Valor confirmado na config (`SITE_URL` sobrescreve). Primeiro no ar no endereço da Vercel; o domínio entra depois |
| Q2 · Vercel | Projeto criado pela conta do João | A Vercel compila do GitHub; o `ffmpeg` vem do pacote `@ffmpeg-installer/ffmpeg` |
| Q5 · Teste 60+ | Simulado feito (`docs/qa/TESTE_60_SIMULADO.md`) | O teste com uma pessoa real continua com o João |
| Q7 · LCP × fontes | "mais fluido, para todos os públicos" | Fontes adaptativas: rede boa → fontes da marca (CLS 0); 2G/3G ou economia de dados → fonte do sistema, sem baixar 74 KB. Aparelho simples → sem abertura nem transições |

**Antes de imprimir o cartaz do QR:** o código aponta para `https://ardeli.com.br/avaliar?o=qr`. Imprima só depois que o domínio estiver apontando para a Vercel.
