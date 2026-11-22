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
