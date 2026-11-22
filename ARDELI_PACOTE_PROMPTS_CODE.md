# Ardeli Fisioterapia: pacote de prompts para o Claude Code (Opus)

Versão 1 · 22/11/2026 · WAXLO

**Base:**
- `ARDELI_INVESTIGACAO_CLIENTE.md`: história, equipe, convênios, agendamento, acessibilidade, **regras do COFFITO**, plano Google.
- `ARDELI_MAPA_MIDIA.md`: o vídeo-tour por capítulo e cada imagem avaliada.
- Logos: `ardeli-logo.svg` (+ `-mono` e `-negativo`), `ardeli-horizontal.svg` (+ `-mono` e `-negativo`), `ardeli-simbolo.svg` (+ `-mono`).

**Repositório:** `github.com/joaoCanonica/ardeli`.

**Não há JSON de avaliações:** a ficha do Google tem 0.

---

## Como usar (ordem exata)

1. **Antes da sessão 0**, suba ao repositório:
   - `ARDELI_INVESTIGACAO_CLIENTE.md`, `ARDELI_MAPA_MIDIA.md` e este arquivo, na raiz;
   - os 8 SVG, em `assets/marca/`. O JPG de comparação é só para você.
2. Abra o Claude Code (Opus) **na pasta do repositório**.
3. **Sessão 0:** cole o bloco da seção B e, logo abaixo, o Prompt 0. **Sem anexos.**
4. **Sessões seguintes:** uma sessão nova para cada, colando **só o prompt**. Uma sessão, um commit.
5. Quando chegar material novo:
   - retratos, fotos em alta ou o vídeo sem música → **Prompt L**;
   - dado novo (CREFITO da Andriele, SUS, áreas, regras dos convênios, acessibilidade, domínio) → **Prompt D**;
   - agenda online → **Prompt A**.
6. Depois das sessões **1, 3, 4, 6A, 7 e 9**, me traga o relatório e as capturas (390 e 1440 px).
7. **Ordem:** 0 Fundação · 1 Mídia · 2 Config · 3 Design system · 4 Capa · 5 Textos · 6A Home · 6B Páginas · 7 Agendar e avaliar · 8 SEO e GEO · 9 QA e deploy.

---

## A. Dados fixos

| Campo | Valor | Estado |
|---|---|---|
| Nome | **Ardeli Fisioterapia** | CONFIRMADO |
| Empresa | 60.246.544 ANDRIELE DA SILVA (CNPJ completo PENDENTE) · CNES **8422478** · registro de empresa CREFITO-10 **RE005047** | CONFIRMADO, exceto o CNPJ completo |
| Responsável | **Andriele da Silva**, fisioterapeuta. CREFITO-10 pessoal **PENDENTE (bloqueante)**. Dona do Studio Ar Pilates e Fisioterapia desde jan/2018; forma instrutores no curso Top Class em Pilates | VISTO (Instagram) |
| Fisioterapeuta | **Nicole de Abreu Batista** · CREFITO-10 **444436-F** | CONFIRMADO |
| Endereço | **Av. Dom Pedro II, 2700 – Da Brusque, Lages – SC, 88503-062** | CONFIRMADO |
| Coordenadas | -27.8252972, -50.3256737 · plus code 5MFF+VP · Maps cid 10553999783368888140 | VISTO |
| WhatsApp | (49) 99928-1721 · wa.me/5549999281721 | CONFIRMADO |
| Horário | seg–sex 08:00–20:00 · sáb e dom fechado | CONFIRMADO |
| Formas de atendimento | Particular · Unimed Lages · AAPL · SUS (**vigência PENDENTE**) | CONFIRMADO, exceto o SUS |
| Áreas (CNES) | musculoesquelética · neurologia · cardiovascular e pneumofuncional · oncologia · obstetrícia/neonatal · queimados | **Confirmar quais aparecem no site**. Até lá, `publicado=false`, exceto musculoesquelética (vitrine: "recuperação funcional") |
| Instagram | @ardeli_fisioterapia · ligados @studio.ar.pilates e @fisio.andrielesilva | VISTO |
| Google | 0 avaliações · sem site | VISTO 22/11 |
| Cores | Marinho #123048 · Sálvia #7B8261 · Ardósia #434D58 · Linho #F8F6F1 | MEDIDO no logo |

**Decisões do João:**
- site para fazer a clínica nova **crescer**, analisando e melhorando a presença;
- premium e **sem cara de IA**;
- foco em **agendamento** e no **local** (onde é, como é o espaço, quem atende).

---

## B. BLOCO "CONTEXTO DO PROJETO" (colar só na sessão 0)

````text
CONTEXTO DO PROJETO — Ardeli Fisioterapia (clínica nova em Lages/SC; site de confiança, convênios e agendamento)
Idioma de tudo: português do Brasil.

1. QUEM E O QUÊ
- Cliente: Ardeli Fisioterapia, clínica de fisioterapia aberta em 2026 (registro de empresa no CREFITO-10 RE005047 desde 15/07/2026; CNES 8422478), na Av. Dom Pedro II, 2700, bairro Brusque, Lages/SC. Atende seg–sex 8h–20h. Particular, Unimed Lages, AAPL (Associação dos Aposentados e Pensionistas de Lages) e SUS (confirmar vigência).
- Quem cuida: Andriele da Silva (fisioterapeuta, responsável; dona do Studio Ar Pilates e Fisioterapia em Lages desde janeiro de 2018; forma instrutores de Pilates no curso Top Class desde 2024) e Nicole de Abreu Batista (fisioterapeuta, CREFITO-10 444436-F).
- O espaço (vídeo-tour no repositório): fachada com letreiro e vitrine; ginásio de reabilitação com treliça de madeira no teto, parede vermelha, espaldar, tablado, bolas, faixas e halteres; sala de esteira e bikes; corredor de taco com jardim vertical; 2 consultórios com maca e eletroterapia; recepção com divisória de vidro.
- Voz real (vitrine, bio, posts): "Cuidamos do seu movimento em todas as fases da vida." · "Cuidar do seu corpo é investir na sua qualidade de vida." · Fisioterapia (cuidado e reabilitação) · Recuperação funcional (movimento, independência e qualidade de vida) · Bem-estar (saúde integral para o dia a dia) · Atendimento acessível (acessível, humano e para todos) · "acolhedor, humanizado e de qualidade".
- Público: adultos e idosos (aposentados), pós-operatório, dor, recuperação após lesão. Acessibilidade é requisito de produto, não detalhe.
- OBJETIVO (nesta ordem): (1) AGENDAR: a pessoa entende se é atendida pelo convênio dela e agenda a avaliação em menos de 30 s; (2) CONFIANÇA para uma clínica nova sem avaliações: quem cuida (trajetória real, CREFITO visível), o espaço real (tour), como funciona a primeira avaliação; (3) SER ENCONTRADA: Google e IAs passarem a citar a Ardeli em "fisioterapia Unimed Lages", "fisioterapia aposentados Lages", "fisioterapia no Brusque"; (4) AVALIAÇÕES: converter pacientes em avaliações no Google (hoje 0).
- Meta do João (CEO da WAXLO): premium, sóbrio, humano, zero "cara de IA", zero visual de clínica genérica (azul-hospital, ícone de coluna, foto de banco).
- Dado do cliente nunca é inventado (CREFITO, especialidades, regras de convênio, SUS, acessibilidade, preços). Faltou: campo pendente em docs/PENDENCIAS.md.

2. FONTES DE VERDADE NO REPOSITÓRIO
ARDELI_INVESTIGACAO_CLIENTE.md (seção 8 = regras do COFFITO), ARDELI_MAPA_MIDIA.md, assets/marca/ardeli-*.svg.

3. REGRAS DO COFFITO (Código de Ética, Res. 424/2013) — VALEM DESDE A PRIMEIRA LINHA
- Art. 48: toda divulgação mostra nome do profissional, "Fisioterapeuta" e o nº de inscrição no CREFITO-10. Rodapé, página da equipe e Open Graph. Andriele sem número = bloqueante de produção.
- Art. 15, V: PROIBIDO antes e depois e qualquer imagem ou dado que identifique paciente.
- Art. 10, V: PROIBIDO depoimento, carta de agradecimento ou trecho de avaliação de paciente para autopromoção. O site NÃO mostra avaliações; só o botão "Avaliar no Google" e o link para a ficha.
- Art. 15, III: PROIBIDO prometer resultado ("cura", "acaba com a dor", "garantido", "100%").
- Art. 40, I: sem preço, promoção, "avaliação grátis", desconto.
- Art. 30 e 48, I: "especialista em" só com título reconhecido pelo COFFITO e confirmado. As áreas aparecem como "atendimentos".
- Marcas de terceiros (Unimed, AAPL, SUS): só o nome em texto; sem logo sem autorização.
- LGPD: dado de saúde é sensível. Nada de formulário que guarde queixa; o agendador monta a mensagem no aparelho.

4. FUNIL
- Ação principal: "Agendar avaliação". Fase 1: agendador (forma de atendimento → motivo opcional e genérico → período e dia seg–sex) monta a mensagem e abre o WhatsApp 5549999281721. Adaptador de destino (whatsapp | link-externo | api) para a agenda online depois.
- Secundárias: Convênios (página-chave), Ligar (um toque), Como chegar, Conheça a clínica.
- Avaliar no Google: bloco + /avaliar (redireciona) + /avaliar/qr (impressão). Sem incentivo e sem exibir avaliações.

5. STACK
- Astro (estável atual; fixar), TypeScript strict, estático, pnpm, Node LTS.
- Movimento: CSS + IntersectionObserver + WAAPI; nada de GSAP, Lenis, Swiper, jQuery, nem scroll sequestrado. Sem 3D nesta versão.
- Orçamento: JS inicial ≤ 30 KB gzip; LCP < 1,8 s em 4G; CLS ≈ 0; INP < 200 ms; Lighthouse mobile ≥ 95 (Perf/BP/SEO) e 100 (A11y).
- Fontes self-hosted (subset latino).

6. IDENTIDADE
- Marca: assets/marca/ardeli-logo.svg (vertical), ardeli-horizontal.svg (cabeçalho), ardeli-simbolo.svg (favicon), com versões -mono (currentColor) e -negativo (sobre Marinho). Grupos #arco, #figura, #letra-a, #palavra, #descritor. Nunca redesenhar.
- Assinatura: "VERBETE". A clínica tem na parede o quadro "fisioterapia, s.f. 1. … 2. …". O site usa a forma do verbete de dicionário:
  (a) cada seção abre com uma PALAVRA em serifa grande + classe gramatical em itálico (s.f., s.m., v.t.d.) + acepções numeradas (1., 2.) com fio fino entre elas;
  (b) palavras: cuidar (capa), movimento, recuperação, avaliação, convênio, acolhimento, endereço;
  (c) o arco verde do símbolo só como gesto do logo (abertura curta e favicon), nunca como enfeite de fundo.
- PROIBIDO repetir (assinaturas e fontes já usadas em sites nossos): vinho + coluna de pontos, linha da vida, curva dourada, oval verde, arco como assinatura de seção, navy + areia como dupla de fundo, molduras de luz, "Luz de Treino", "Leão de Aço", "A Contraforma", "A Fresta", "O Degradê", "O Florescer", "Edição Todalinda" (capa, capitular, fólio); fontes Cormorant, Bodoni Moda (e família), Marcellus, Instrument Serif, Hanken Grotesk, Fraunces, Lato, Figtree, Jost, Gloock, Urbanist, Spectral, Newsreader, Albert Sans, Libre Caslon, Schibsted Grotesk, Bellefair, Gilda Display, Mulish, Red Hat Text, EB Garamond, Josefin Sans, Archivo, Barlow Condensed, Inter Tight, Geist, Source Serif 4, Literata, Sora, Michroma, DM Serif Display, Playfair Display, Prata, Manrope, Onest.
- Paleta (tokens; validar contraste por script, texto principal AAA):
  Linho ≈ #F8F6F1 (fundo);
  Papel ≈ #FFFFFF (cartões);
  Marinho ≈ #123048 (títulos, texto forte, botão primário, fundo escuro);
  Ardósia ≈ #434D58 (texto);
  Sálvia ≈ #7B8261 (marca, fios, ícones, áreas grandes; NÃO como texto pequeno sobre claro);
  Sálvia escura (derivar até AA, ≈ #5C6347) para links;
  Tijolo ≈ #B5483F e Madeira ≈ #B9773F só como cor de ambiente nas fotos/legendas, nunca chapado.
- Tipografia (decidir na sessão 3; OFL; self-host): verbetes em serifa de livro — Crimson Pro × Libre Baskerville; leitura em sans de alta legibilidade — Atkinson Hyperlegible Next × Nunito Sans (público mais velho). Base 18–19 px; altura de linha 1,6.

7. ACESSIBILIDADE (requisito de produto)
WCAG 2.2 AA em tudo e AAA no texto principal; alvos ≥ 48 px; foco muito visível; telefone e WhatsApp sempre a um toque; linguagem simples (frases curtas, sem jargão ou com explicação); nada de animação essencial; tamanho de fonte ajustável (A+/A−, preferência guardada só no aparelho); funciona sem JS; leitura correta com leitor de tela.

8. ANTI "CARA DE IA" E ANTI "CLÍNICA GENÉRICA"
Proibido: azul-hospital, gradiente, ícone de coluna, esqueleto ou estetoscópio, foto de banco, pessoa sorrindo de jaleco genérica, cards iguais em grade de 3, "sua saúde em boas mãos", "excelência em fisioterapia", "tratamento de ponta", emoji, contador inventado.
Usar: fotos reais do espaço (stills do vídeo), a voz da clínica, o verbete, números verificáveis (desde 2018 com o Studio Ar · seg–sex até 20h · 2 consultórios · Unimed e AAPL).

9. MÍDIA
- Originais em media-originais/. Derivados em public/media/ (fora do git): AVIF/WebP com srcset, LQIP, pôster, loops mudos (MP4 + WebM).
- Manifesto media.manifest.json: id, arquivo, tipo, ambiente, uso, trechos (in/out), resolucaoMax, naoUsar, contemPessoa, problemas.
- Capturas de tela (~380 px) no máximo a 360 px na tela. Artes do Instagram com texto: naoUsar.
- Edição permitida: cor/exposição globais, recorte, corte de trechos, estabilização leve. Proibido: IA generativa, upscaling por IA, inventar ambiente.
- Vídeo sempre mudo (música sem licença conhecida).

10. CONFIG E TRAVAS
src/config/ tipada com confirmado(), opcional(), bloqueante(), aviso(). Preview funciona sempre (faixa "em revisão", noindex). A produção trava em: CREFITO da Andriele ausente; WhatsApp ausente; termo vetado no HTML; depoimento ou trecho de avaliação no HTML; imagem com pessoa sem autorização marcada; área de atendimento não confirmada publicada; SUS afirmado sem confirmação.

11. CONDUTA DO CODE
Um prompt = uma sessão = um commit em português. Plano curto antes. Capturas 390/1440 e com reduced-motion e zoom 200%. Relatório: o que mudou · o que falhou · o que depende do João · números medidos. O Code NUNCA afrouxa listas nem travas sem ordem expressa.
````

---

## PROMPT 0 — Fundação

````text
[COLE AQUI O BLOCO "CONTEXTO DO PROJETO" INTEIRO, ANTES DESTE TEXTO]

Tarefa: criar a fundação do projeto Astro no repositório ardeli e gravar o contexto.
Escopo: estrutura e configuração. NÃO escreva páginas nem componentes visuais. NÃO apague mídia.

1. Salve o bloco como CLAUDE.md na raiz, cópia em AGENTS.md e docs/CONTEXTO.md.
2. docs/: git mv ARDELI_INVESTIGACAO_CLIENTE.md, ARDELI_MAPA_MIDIA.md, ARDELI_PACOTE_PROMPTS_CODE.md. Faltou algum: PENDENCIAS.md.
3. Verifique node, pnpm, git, ffmpeg, ffprobe, sharp, Chromium do Playwright. Nada global sem me dizer.
4. Astro estável, TS strict, estático. package.json "ardeli-site", engines, packageManager, scripts: dev, build, preview, check, test, validate-config, audit-compliance, audit-a11y, audit-lighthouse, audit-seo, audit-contraste, media:prepare, capturar.
5. Estrutura: src/{config,components,layouts,pages,styles,scripts,content,lib}, scripts/, docs/{capturas,dados}, media-originais/, public/. .gitignore: node_modules, dist, .astro, public/media, docs/capturas/**/*.png, .env*.
6. tsconfig strict, ESLint + Prettier, .editorconfig, .nvmrc, Vitest.
7. scripts/capturar.mjs: preview + capturas por rota em 390 e 1440, reduced-motion e zoom 200%.
8. "/" temporária com <h1>Ardeli Fisioterapia</h1> e noindex. README curto.

Critério de aceite: install/build/check/test verdes; CLAUDE.md idêntico ao bloco; commit "fundação".
````

---

## PROMPT 1 — Mídia

````text
Leia CLAUDE.md e docs/ARDELI_MAPA_MIDIA.md. Só mídia; nada vai para páginas.

1. git mv: assets/marca/*.svg → media-originais/marca/; assets/Captura*.png → media-originais/fotos/capturas/; assets/SaveClip*.jpg e logo.jpeg → media-originais/fotos/; snapinsta-1795373761516.mp4 → media-originais/videos/tour.mp4.
2. Manifesto: capturas com resolucaoMax 360; Captura 15-52-14, 15-56-33 e SaveClip 857400492 = naoUsar (artes com texto e logos de terceiros; transcreva o texto em docs/dados/textos-das-artes.md); logo.jpeg = naoUsar (substituído pelos SVG); contemPessoa=false em tudo (confirme quadro a quadro; se aparecer alguém refletido, marque).
3. TOUR — capítulos (confira e ajuste ±0,5 s): fachada 0–4 · vitrine 5–6 · entrada 7–14 · cardio 15–19 · ginasio 20–27 · corredor 28–32 · consultorio-1 33–42 · portas 43–49 · consultorio-2 50–60 · recepcao 67–71 · ginasio-final 72–78 (61–66 fora). Gere: o tour completo mudo e sem 61–66 (MP4 + WebM, 720p e 540p, com capítulos em WebVTT "chapters"); loops mudos "ginasio-final" (72–77) e "ginasio" (20–26) com ≤ 1 MB; pôster AVIF de cada capítulo.
4. STILLS (melhor quadro nítido de cada capítulo, 720×1280, e recortes 4:5 e 16:9 quando o enquadramento permitir, sem preencher com IA): fachada (≈ 1,5 s), tapete com logo (≈ 13 s), cardio (≈ 17 s), ginásio com treliça (≈ 20–21 s), espaldar (≈ 22 s), jardim vertical (≈ 29 s), quadro "fisioterapia, s.f." (≈ 36 s; também um recorte só do quadro), consultório 1 (≈ 40 s), consultório 2 (≈ 52 s), quadros anatômicos (≈ 59 s), recepção (≈ 68 s), ginásio amplo (≈ 75 s). Leve correção global de exposição e balanço de branco (piso escuro e janelas estouradas); registre o que fez.
5. scripts/prepare-media.mjs (predev/prebuild, idempotente, cache por hash): AVIF/WebP 360/720 (nunca acima do original), LQIP.
6. docs/MIDIA_CATALOGO.md: tabela, folha de contato dos stills e a lista do que pedir (retratos da Andriele e da Nicole; fotos em alta; atendimento encenado pela equipe; vídeo sem música).

Critério de aceite: idempotente; loops ≤ 1 MB; nada naoUsar publicável; commit "midia".
````

---

## PROMPT 2 — Config, horário e travas

````text
Leia CLAUDE.md e docs/ARDELI_INVESTIGACAO_CLIENTE.md (seções 2, 6 e 8).

Tarefa: config tipada, coleções, horário, WhatsApp, lógica do agendador e travas.
Escopo: src/config/**, src/content/** (schemas), src/lib/{horario,whatsapp,agenda,avaliar}.ts, scripts/{validate-config,audit-compliance}.mjs, docs/PENDENCIAS.md.

1. tipos.ts: confirmado(v, fonte), opcional(v), bloqueante(rotulo), aviso(rotulo, motivo).
2. clinica.ts: nome, empresa (cnpj = bloqueante("CNPJ completo")), cnes 8422478, crefitoEmpresa "RE005047", endereço completo, geo, plusCode, Maps cid, links Google Maps/Waze/Apple, WhatsApp, horário seg–sex 08–20; acessibilidade, estacionamento, pontoDeReferencia = opcional().
3. Coleção "profissionais": nome, profissao "Fisioterapeuta", crefito ("444436-F" para a Nicole; bloqueante para a Andriele), formacao (opcional), titulosReconhecidos[] (vazio até confirmar), resumo (só fatos confirmados: Andriele = Studio Ar desde jan/2018 e formação de instrutores Top Class em Pilates), foto (null até chegar retrato).
4. Coleção "atendimentos": id, nome (linguagem simples), verbete (palavra + classe + acepções), paraQuem, comoFunciona[], publicado. Registros a partir do CNES: musculoesqueletica ("Ortopedia e dor: coluna, articulações, pós-operatório e recuperação após lesão", publicado=true, porque a vitrine diz "recuperação funcional"), neurologia, cardiorrespiratoria, oncologia, obstetrica, queimados (publicado=false até confirmação).
5. Coleção "convenios": particular (confirmado), unimed (confirmado; regras: opcional("planos aceitos, pedido médico, guia")), aapl (confirmado; regras opcional), sus (bloqueante("contrato vigente e caminho de acesso"); enquanto não confirmar, a página diz "Consulte a disponibilidade pelo WhatsApp" e NÃO afirma atendimento SUS).
6. src/lib/horario.ts: statusEm(data) → "Aberto agora · até 20h", "Fecha em 30 min", "Fechado · abre segunda às 8h". Feriados nacionais e municipais de Lages (pesquisar e citar). Testes.
7. src/lib/whatsapp.ts: linkWhatsApp(texto) com "Vim pelo site da Ardeli". Mensagens: geral, por convênio, por atendimento, "como chegar".
8. src/lib/agenda.ts: montarPedido({forma, motivo?, periodo?, dias?}) → texto exato (ex.: "Olá! Vim pelo site da Ardeli e quero agendar uma avaliação. Atendimento: Unimed. Motivo: pós-operatório. Prefiro à tarde, terça ou quinta."). Formas: Particular | Unimed | AAPL | SUS (só se confirmado) | Não sei. Motivos genéricos: Dor (coluna, ombro, joelho…) | Pós-operatório | Recuperação após lesão | Neurológico | Respiratório | Outro (só os publicados + Outro). Períodos: manhã (8–12) | tarde (12–18) | noite (18–20) | qualquer horário; dias seg–sex. Destinos whatsapp | link-externo | api (stubs testados). Nada guardado.
9. src/lib/avaliar.ts: linkAvaliar() = bloqueante("link 'Pedir avaliações'"), com fallback para a ficha (cid).
10. termos.ts (vetados): "cura", "curar", "garantido", "garantia de resultado", "100%", "acaba com a dor", "sem dor", "milagre", "o melhor", "a melhor", "melhor clínica", "número 1", "especialista" (permitido só junto de título confirmado), "grátis", "gratuito", "promoção", "desconto", "avaliação grátis", "sua saúde em boas mãos", "excelência em fisioterapia", "tratamento de ponta", "antes e depois", "depoimento".
11. validate-config + audit-compliance: travas da seção 10 do CLAUDE.md + varredura do dist/ (termos, padrões de depoimento como aspas seguidas de nome de paciente, menção a SUS sem confirmação, CREFITO ausente no rodapé).

Critério de aceite: testes verdes; preview passa; produção trava sem o CREFITO da Andriele; commit "config".
````

---

## PROMPT 3 — Design system e "Verbete"

````text
Leia CLAUDE.md e src/config. Pesquise antes (MDN/WCAG 2.2): text-wrap, font-size-adjust, prefers-contrast, prefers-reduced-motion, :focus-visible, alvos de toque 2.5.8; e as fontes candidatas (Crimson Pro, Libre Baskerville, Atkinson Hyperlegible Next, Nunito Sans: eixos, licença, legibilidade).

Tarefa: tokens, tipografia, logo, componentes e a assinatura. Página /_estilo (noindex).
Escopo: src/styles/**, src/components/{base,marca,verbete}/**, src/pages/_estilo.astro, scripts/audit-contraste.mjs.

1. Tokens (Linho, Papel, Marinho, Ardósia, Sálvia, Sálvia escura derivada, Tijolo e Madeira só para ambiente). audit-contraste: texto principal AAA; links e botões AA; mostre os pares reprovados (Sálvia sobre Linho em texto pequeno deve reprovar e ficar proibida).
2. Tipografia: teste 2 × 2 em 3 provas — verbete de capa ("cuidar v.t.d. 1. Dar atenção… 2. …"), página de convênios (lista e instruções) e FAQ. Escolha e justifique com capturas, incluindo zoom 200%. Base 18–19 px; números tabulares para horário.
3. Controle A+/A− (3 níveis) no cabeçalho, com preferência em localStorage (try/catch) e sem JS = tamanho padrão.
4. <Logo variante="vertical|horizontal|simbolo" tom="cor|mono|negativo">: SVG inline otimizado (sem destruir curvas); favicon e apple-touch a partir do símbolo.
5. Assinatura "Verbete" (src/components/verbete):
   (a) <Verbete palavra classe acepcoes[]>: palavra em serifa grande (Marinho), classe em itálico pequeno (Ardósia), acepções numeradas com fio Sálvia de 1 px entre elas, numeral em versalete;
   (b) <Acepcao n>: bloco de texto que pode conter link ou botão;
   (c) variações: capa (grande, sobre foto com véu Marinho a 70% para contraste), seção (média), nota (pequena, rodapé).
   Inspiração direta: o quadro "fisioterapia, s.f." do consultório (still do mapa de mídia). Nada de imitar dicionário antigo envelhecido: é limpo e contemporâneo.
6. Componentes: Botão primário (Marinho, texto Linho, ≥ 56 px de altura, ícone do WhatsApp em SVG próprio), Botão secundário, Link, LigarAgora (tel:), StatusHorario, TabelaHorario (hoje destacado), CartaoProfissional (nome, "Fisioterapeuta", CREFITO-10 nº, resumo; sem foto = monograma no símbolo), FotoAmbiente (legenda com o nome do ambiente), CapituloTour, Aviso (informação importante sobre convênio/SUS), Detalhes (FAQ <details> grande).
7. Movimento: só realce (200–400 ms); reduced-motion = nada se move.

Critério de aceite: contraste verde; capturas 390/1440, reduced-motion e zoom 200%; JS ≤ 4 KB; commit "design system".
````

---

## PROMPT 4 — Capa (hero) e abertura curta

````text
Leia CLAUDE.md e os componentes da sessão 3. Use os stills e o loop "ginasio-final".

Tarefa: cabeçalho, capa e uma abertura curtíssima.
Escopo: src/components/{cabecalho,capa,abertura}/**, src/pages/index.astro (só a capa).

1. CABEÇALHO: <Logo horizontal>, Convênios, Atendimentos, Quem cuida, A clínica, Como chegar, A+/A−, botão "Agendar avaliação". Mobile: logo + "Agendar" + menu grande (itens ≥ 56 px) + telefone. Fixo discreto ao rolar.
2. ABERTURA (≤ 1,2 s, uma vez por sessão, pula com qualquer interação, desligada em reduced-motion e Save-Data): o #arco do símbolo se desenha, a #figura e a #letra-a aparecem e o logo vai para o cabeçalho. O pôster da capa já está pintado por baixo (LCP intacto).
3. CAPA:
   - Fundo: still do ginásio com a treliça (desktop: ginásio amplo 16:9 com o loop "ginasio-final" mudo depois do LCP; mobile: still 4:5) com véu Marinho para contraste AAA.
   - <Verbete variante="capa" palavra="cuidar" classe="v.t.d." acepcoes=["Acompanhar a recuperação do seu movimento, da avaliação ao dia a dia.", "Fisioterapia no bairro Brusque, em Lages: particular, Unimed e AAPL."]>. H1 real e simples (ex.: "Fisioterapia no Brusque, em Lages") presente no HTML para leitor de tela e SEO, sem quebrar o verbete; a sessão 5 refina.
   - Botões: "Agendar avaliação" e "Ver convênios aceitos".
   - Faixa de fatos sob a capa: "Seg a sex, 8h às 20h" (com StatusHorario) · "Av. Dom Pedro II, 2700" · "Unimed e AAPL" · "(49) 99928-1721".
4. Alternativa B (para comparar): capa clara (Linho) com o still da fachada recortado à direita e o verbete à esquerda. Entregue /_capa-a e /_capa-b (noindex).

Critério de aceite: LCP < 1,8 s mobile; contraste AAA no texto da capa; capturas 390/1440, reduced-motion e zoom 200%; commit "capa".
````

---

## PROMPT 5 — Textos

````text
Leia CLAUDE.md (seção 3 inteira), docs/ARDELI_INVESTIGACAO_CLIENTE.md e src/config.

Tarefa: TODOS os textos em src/content, com fonte de cada frase real.

Voz: calma, clara, próxima, frases curtas, "você", explicação de termo técnico na primeira vez ("avaliação funcional: quando a fisioterapeuta observa como você se move para montar o plano"). Nada de jargão de marketing. Tudo dentro das regras do COFFITO.

Entregar:
1. Home (ordem do Prompt 6A), com um <Verbete> por seção: cuidar (capa), avaliação (como funciona a primeira consulta, em 4 passos: conversa, avaliação, plano, acompanhamento), convênio (como você pode ser atendido), movimento (atendimentos publicados), acolhimento (quem cuida), endereço (como chegar), opinião (avaliar no Google).
2. /convenios: Particular, Unimed, AAPL, SUS — para cada um: quem pode usar, o que levar, como agendar; o que estiver pendente vira "Confirme pelo WhatsApp: a gente explica rapidinho." SUS: texto condicional (só com confirmação).
3. /atendimentos e /atendimentos/<id>: só publicados; o que é, para quem, como é o atendimento na Ardeli, perguntas comuns; sem promessa.
4. /primeira-avaliacao: passo a passo, quanto tempo leva (só se confirmado), o que levar (exames, pedido médico se tiver, carteirinha), roupa confortável, acessibilidade.
5. /quem-cuida: Andriele (Studio Ar desde janeiro de 2018; formação de instrutores de Pilates desde 2024; CREFITO) e Nicole (CREFITO-10 444436-F); só fatos confirmados; sem "especialista".
6. /a-clinica: o tour por capítulos (um parágrafo curto por ambiente) e a origem do quadro "fisioterapia, s.f.".
7. /perguntas-frequentes: preciso de pedido médico? atende Unimed? atende aposentados da AAPL? atende SUS? quanto tempo dura a sessão? tem estacionamento? o espaço é acessível? como agendar? (pendentes ficam fora até confirmar).
8. /como-chegar, /avaliar/qr ("Sua opinião ajuda outras pessoas a encontrarem cuidado perto de casa."), /privacidade (dado de saúde e WhatsApp explicados em linguagem simples), 404.
9. Microtextos: botões, mensagens de WhatsApp, alt de cada still (ambiente + o que se vê), rodapé com Art. 48 completo (nomes, "Fisioterapeuta", CREFITO-10 de cada uma, registro da empresa RE005047, CNES 8422478).
10. Metas (title ≤ 60, description ≤ 155) com "fisioterapia", "Lages", "Brusque", convênio quando couber.

Critério de aceite: audit-compliance sem termo vetado nem depoimento; pendências listadas; commit "textos".
````

---

## PROMPT 6A — Home

````text
Leia CLAUDE.md, src/content e os componentes das sessões 3 e 4.

Tarefa: home completa abaixo da capa, cada seção com um <Verbete> e um gesto próprio.
Escopo: src/pages/index.astro, src/components/secoes/**.

1. AVALIAÇÃO (Linho): 4 acepções numeradas lado a lado no desktop e em lista no mobile (conversa · avaliação · plano · acompanhamento) + still do consultório 1 + "Agendar avaliação".
2. CONVÊNIO (Papel, a seção mais importante): seletor grande "Como você vai ser atendido?" com 4 botões (Particular · Unimed · AAPL · SUS se confirmado). Ao escolher, mostra o que levar e o botão "Agendar pelo [convênio]" com a mensagem pronta. Sem JS: 4 blocos abertos.
3. MOVIMENTO (Linho): atendimentos publicados em lista de verbetes (palavra + uma acepção), cada um com link; still do ginásio com a treliça ao lado.
4. A CLÍNICA (Marinho): o tour em "capítulos" — linha do tempo vertical com os 6 ambientes principais (fachada, recepção, ginásio, cardio, consultórios, jardim); cada capítulo com still e uma frase; botão "Ver o tour em vídeo" (abre o vídeo mudo com capítulos; sob demanda).
5. ACOLHIMENTO / QUEM CUIDA (Linho): Andriele e Nicole em <CartaoProfissional> (nome, Fisioterapeuta, CREFITO-10 nº) e o fato verificável "Andriele atende em Lages desde 2018, no Studio Ar" com link opcional ao Instagram do Studio Ar (se o João aprovar).
6. OPINIÃO (Papel): "Já foi atendido na Ardeli? Sua opinião ajuda outras pessoas a encontrarem cuidado perto de casa." + "Avaliar no Google". Nada de estrelas, contagem ou citação.
7. ENDEREÇO (Linho): o still da fachada, endereço grande com copiar, ponto de referência (quando confirmado), TabelaHorario com status, mapa estático (interativo só após clique e consentimento), botões Google Maps/Waze/Apple, LigarAgora e WhatsApp.
8. RODAPÉ: <Logo negativo> sobre Marinho, endereço, telefone, horário, Instagram, a nota do Art. 48 completa, CNES, privacidade, "Avaliar no Google".
- Botão fixo "Agendar" no mobile (≥ 56 px), que some na seção 7.

Critério de aceite: capturas 390/1440, reduced-motion e zoom 200%; Lighthouse mobile ≥ 95/100; JS ≤ 30 KB; leitor de tela percorre o seletor de convênio; commit "home".
````

---

## PROMPT 6B — Páginas internas

````text
Leia CLAUDE.md e src/content.

Tarefa: páginas internas, todas abrindo com <Verbete>.
Escopo: src/pages/{convenios,atendimentos/index,atendimentos/[id],primeira-avaliacao,quem-cuida,a-clinica,perguntas-frequentes,como-chegar,privacidade,404}.astro.

- /convenios: os 4 em blocos grandes com âncora (#unimed etc.), cada um com "o que levar" e o botão com mensagem pronta.
- /atendimentos/<id>: verbete + para quem + como funciona + perguntas + "Agendar avaliação"; não publicado = sem página (trava).
- /primeira-avaliacao: passos numerados grandes; checklist "o que levar" para imprimir (@media print).
- /quem-cuida: cartões das profissionais (com foto quando chegar) e o Art. 48 em cada um.
- /a-clinica: o tour completo (vídeo com capítulos + stills por ambiente + o quadro "fisioterapia, s.f." em destaque como origem da identidade).
- /perguntas-frequentes: <details> grandes, agrupados.
- /como-chegar: endereço, referência, acessibilidade, estacionamento (quando confirmados), mapa, horário, rotas.
- /privacidade e 404.

Critério de aceite: capturas de todas (390/1440, zoom 200%); nenhuma página vazia em produção; commit "paginas".
````

---

## PROMPT 7 — Agendar, avaliar e LGPD

````text
Leia CLAUDE.md, src/lib/{agenda,whatsapp,avaliar}.ts.

1. AGENDADOR (gaveta a partir de qualquer "Agendar" e página /agendar): 3 passos grandes numa tela — (1) Como você vai ser atendido (2) O que te traz (opcional, genérico) (3) Quando prefere (período + dias seg–sex) — prévia da mensagem e "Enviar pelo WhatsApp". Abre pré-preenchido por ?forma= e ?motivo=. Funciona como formulário nativo; sem JS cai no link geral. Aviso pequeno: "Não guardamos nada aqui. A mensagem vai do seu celular direto para o WhatsApp da clínica." Destino vem de config (fase 1: WhatsApp).
2. /avaliar: redireciona para linkAvaliar() (meta refresh + link visível, noindex), registra a origem (?o=qr|site|whatsapp).
3. /avaliar/qr: A6 e A5 para imprimir, QR gerado no build (SVG), com o símbolo e a frase; @media print impecável.
4. docs/FUNIL.md: a mensagem pós-sessão para a recepção ("Obrigada por vir hoje! Se puder contar como foi seu atendimento, isso ajuda outras pessoas a nos encontrarem: {SITE}/avaliar?o=whatsapp"), sem incentivo; o roteiro do plano Google (investigação §10).
5. Medição sem cookie (Plausible ou Umami; justifique): clique_agendar(forma, origem), agendador_enviado(forma, motivo?, passo), clique_ligar, clique_convenio(convenio), clique_avaliar(origem), clique_como_chegar. Nunca enviar texto livre.
6. Consentimento só se algo exigir cookie (mapa interativo): Aceitar e Recusar com o mesmo peso.

Critério de aceite: e2e (390 px) gerando a mensagem exata em 8 cenários (particular simples; Unimed + pós-operatório + tarde; AAPL; SUS bloqueado sem confirmação; sem motivo; sem JS; aberto de /convenios#unimed; aberto de /atendimentos/musculoesqueletica); /avaliar redireciona; /avaliar/qr imprime; nenhum request de terceiro antes do clique; commit "agendar e avaliar".
````

---

## PROMPT 8 — SEO local e GEO

````text
Leia CLAUDE.md e a investigação (seções 5 e 10). Pesquise e cite antes: schema.org (MedicalClinic / PhysicalTherapy, MedicalBusiness, Physician não se aplica, Person com hasCredential, OpeningHoursSpecification, isAcceptedPaymentMethod/healthPlanNetworkId), Google Search Central (negócio local; conteúdo de saúde YMYL; avaliações autosservidas), llms.txt.

1. JSON-LD a partir da config: MedicalClinic + PhysicalTherapy (medicalSpecialty "PhysicalTherapy"), name, address, geo, telephone, openingHoursSpecification, url, sameAs (Instagram, ficha Google), identifier (CNES 8422478, CREFITO RE005047), employee Person (nome, jobTitle "Fisioterapeuta", hasCredential com o CREFITO), availableService (atendimentos publicados), healthPlanNetworkId/descrição dos convênios aceitos (Unimed Lages, AAPL; SUS só confirmado), FAQPage, BreadcrumbList, VideoObject do tour. SEM AggregateRating e sem Review.
2. Metas, canonical, Open Graph 1200×630 (still da fachada + <Logo horizontal> + "Fisioterapia no Brusque, Lages/SC"), lang pt-BR.
3. NAP idêntico em todo lugar (audit-seo falha se divergir).
4. llms.txt: o que é, onde, horário, convênios, atendimentos, quem cuida (com CREFITO), como agendar, como chegar.
5. Conteúdo citável: parágrafo-resposta no topo de cada página; títulos que são perguntas reais ("A Ardeli atende Unimed?", "Fisioterapia para aposentados da AAPL em Lages", "Fisioterapia no bairro Brusque").
6. docs/SEO_GEO.md para o João: a ficha do Google (site, descrição, serviços, atributos de acessibilidade, recategorizar as fotos que hoje estão como "Academia", 15+ fotos), o plano de avaliações (meta 20 no 1º trimestre, responder todas), migração de audiência do @studio.ar.pilates (bio, destaque e post), NAP no CNES, Doctoralia (opcional), Bing e Apple; teste mensal no Modo IA sem login: "fisioterapia Unimed Lages", "fisioterapia AAPL Lages", "fisioterapia bairro Brusque Lages", "fisioterapia pós-operatório Lages".

Critério de aceite: Rich Results e validator.schema.org sem erro; audit-seo verde; commit "seo e geo".
````

---

## PROMPT 9 — QA, conferência final e deploy

````text
Leia CLAUDE.md e docs/PENDENCIAS.md.

1. Desempenho: Lighthouse mobile em todas as rotas; pesos; LCP com e sem abertura.
2. Acessibilidade (o teste mais importante deste site): axe; teclado do início ao fim (capa → convênio → agendador → WhatsApp); NVDA/VoiceOver no agendador e no seletor de convênio; zoom 200% e 400% (reflow); A+/A−; prefers-contrast; reduced-motion; alvos ≥ 48 px; teste com uma pessoa de mais de 60 anos se possível (João), registrando onde ela travou.
3. Navegadores: Chrome, Safari iOS, Firefox, Android básico (390 px, 3G lento); sem JS.
4. Acabamento: verbetes alinhados (palavra, classe e fio), viúvas e órfãs, cortes de foto, foco, textos cortados, acentos, aspas e travessões. Capturas antes e depois.
5. Conferência COFFITO/LGPD/CDC: Art. 48 em todas as páginas; nenhum antes e depois, depoimento, preço, promessa, "especialista" sem título; SUS só se confirmado; marcas de terceiros só em texto; dado de saúde não coletado. NÃO afrouxe nenhuma trava.
6. Deploy estático (Vercel por padrão), SITE_URL por env, cabeçalhos (CSP por hash, HSTS, Referrer-Policy, Permissions-Policy), cache longo para /media, preview noindex, /avaliar sem cache.
7. docs/QA.md e docs/CONFERENCIA_FINAL.md com números e capturas.

Critério de aceite: números no relatório; nenhuma trava afrouxada; commit "qa e deploy".
````

---

## PROMPT L — Nova mídia (reutilizável)

````text
Leia CLAUDE.md e docs/MIDIA_CATALOGO.md.
Tarefa: incorporar a mídia de media-novas/.
[Lista: arquivo · o que é · ambiente/pessoa · autorização de imagem (equipe: sim/não) · tem paciente? (se sim: naoUsar)]
1. Inventário e avaliação (nitidez, luz, texto queimado, pessoa identificável).
2. Manifesto e derivados (régua da sessão 1).
3. Encaixe: retratos → CartaoProfissional e /quem-cuida; fotos do espaço → substituem stills/capturas (capa, A clínica, Como chegar, Open Graph); atendimento encenado pela equipe → atendimentos e primeira avaliação (marcar "encenado pela equipe" no manifesto); vídeo sem música → tour.
4. Atualize PENDENCIAS; capturas antes e depois.
Critério de aceite: build verde; LCP não piora; nenhuma pessoa sem autorização; commit "midia: <resumo>".
````

---

## PROMPT D — Novo dado (reutilizável)

````text
Leia CLAUDE.md e src/config.
Tarefa: atualizar dados confirmados pelo João e propagar.
[Dados: CREFITO-10 da Andriele = …; CNPJ completo = …; SUS (vigente? como acessar) = …; áreas publicadas = …; títulos de especialidade reconhecidos = …; Unimed (planos/pedido médico/guia) = …; AAPL (como funciona) = …; acessibilidade/estacionamento/ponto de referência = …; link "Pedir avaliações" = …; origem do nome "Ardeli" = …; relação com o Studio Ar (citar? linkar?) = …; domínio = …]
Passos: trocar opcional()/bloqueante() por confirmado(valor, "João, <data>"); validate-config, testes, audit-seo, build; capturas das páginas afetadas; PENDENCIAS e SEO_GEO.
Critério de aceite: testes verdes; nenhum texto com o valor antigo; commit "dados: <resumo>".
````

---

## PROMPT A — Agenda online (quando decidirem)

````text
Leia CLAUDE.md e src/lib/agenda.ts.
[Escolha: link-externo (URL do provedor por forma de atendimento) ou api (endpoint WAXLO: horários livres, reserva, confirmação)]
Ligue o destino sem mudar a interface; WhatsApp fica como alternativa sempre visível; se coletar dados para a reserva: consentimento LGPD explícito, finalidade, retenção, e política de privacidade atualizada; e2e novos + os 8 antigos verdes.
Critério de aceite: fase 1 intacta como fallback; commit "agenda online".
````

---

## C. O que falta

**Trava a produção**
1. **Nº do CREFITO-10 da Andriele.** O Art. 48 exige o número em toda divulgação. Ela pode consultar no portal do CREFITO-10 ou na carteira profissional.
2. **SUS:** se o contrato está vigente e como o paciente chega. Sem isso, o site não afirma SUS.
3. **Áreas atendidas de fato.** Sem confirmação, só "Ortopedia e dor" é publicada.

**Importante**
4. Retratos da Andriele e da Nicole; fotos do espaço em alta; o vídeo sem música.
5. Regras de Unimed e AAPL (pedido médico, guia, planos).
6. Acessibilidade do espaço, estacionamento e ponto de referência.
7. CNPJ completo; formação e títulos das duas.
8. Relação com o Studio Ar (citar, linkar, onde fica o Pilates).
9. Domínio.

**Fora do site (já pode começar)**
10. Completar a ficha do Google:
    - adicionar o site quando estiver no ar;
    - colocar descrição, serviços e as fotos certas no lugar das classificadas como "Academia".
11. Gerar o link "Pedir avaliações" e começar a pedir avaliação depois das sessões.
12. Anunciar a Ardeli para os 1.601 seguidores do @studio.ar.pilates.
