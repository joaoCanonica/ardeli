# SEO local e GEO: o que o site faz e o que o João faz fora dele

Objetivo (CLAUDE.md §1, item 3): o Google e as IAs passarem a citar a Ardeli em "fisioterapia Unimed Lages", "fisioterapia aposentados Lages" e "fisioterapia no Brusque". Hoje a Ardeli tem 0 avaliações e não aparece entre as 21 primeiras em "fisioterapia Lages SC". No Modo IA, a resposta para "Unimed e SUS em Lages" cita duas concorrentes e não a Ardeli (investigação §5). A vaga existe: quase nenhuma clínica tem site explicando convênio.

## 1. O que o site já faz (sessão 8)

| Item | Onde | Regra |
|---|---|---|
| JSON-LD em toda página | `src/lib/seo/jsonld.ts` | Gerado da config. `MedicalClinic` + `Physiotherapy`, `medicalSpecialty` Physiotherapy, serviços como `PhysicalTherapy`, convênios em `healthPlanNetworkId`, fisioterapeutas como `Person` com `hasCredential` (CREFITO), CNES e registro de empresa em `identifier`. **Sem `AggregateRating` e sem `Review`.** |
| FAQPage | /perguntas-frequentes | Só as perguntas publicadas, com a resposta igual à da página. |
| BreadcrumbList | todas as internas | Início › página (› atendimento). |
| VideoObject | /a-clinica | O tour mudo, com pôster da fachada. |
| Open Graph | toda página | `public/og/ardeli-1200x630.jpg`: still real da fachada, logo horizontal, "Fisioterapia no Brusque, Lages/SC" e as linhas do Art. 48. Regerar com `pnpm og` quando mudar o CREFITO (o audit-seo avisa). |
| Canonical, og:url, sitemap | toda página | Só com o **domínio** confirmado (pendência F1/18). |
| Títulos que são perguntas | H1 de cada página | "A Ardeli atende Unimed e AAPL?", "Fisioterapia no bairro Brusque: onde fica a Ardeli?", "Como é a primeira avaliação de fisioterapia?"… Em /convenios, os H2 também são perguntas: "A Ardeli atende Unimed?" e "Fisioterapia para aposentados da AAPL em Lages". |
| Parágrafo-resposta | topo de cada página interna | 2–3 frases que respondem o título sozinhas (é o trecho que uma IA cita). Textos em `src/content/textos/respostas.ts`, com fonte em cada frase. |
| NAP idêntico | rodapé, endereço, cartaz, JSON-LD, llms.txt | Fonte única `src/lib/seo/nap.ts`. O `audit-seo` reprova qualquer variação. |
| llms.txt | `/llms.txt` | Resumo para IAs: o que é, onde, horário, convênios, atendimentos, quem cuida (com CREFITO), como agendar, como chegar. Formato llmstxt.org v2. |

**NAP oficial (copiar igual em todo cadastro):**

- Nome: **Ardeli Fisioterapia**
- Endereço: **Av. Dom Pedro II, 2700 – Brusque, Lages – SC, 88503-062**
- Telefone: **(49) 99928-1721**
- Horário: **segunda a sexta, das 8h às 20h**
- Site: o domínio definitivo (pendente)

Escrever "Av." e não "Avenida"; "Brusque" como bairro; o mesmo traço. Diferença pequena (um "Avenida" num cadastro, "D. Pedro" em outro) faz o Google duvidar se é o mesmo lugar.

## 2. Ficha do Google (Perfil da Empresa)

1. **Site:** colocar o domínio definitivo assim que existir.
2. **Descrição** (até 750 caracteres; sem preço, sem promessa, sem "especialista"). Sugestão:
   > A Ardeli Fisioterapia fica no bairro Brusque, em Lages, na Av. Dom Pedro II, 2700. Atende particular, pela Unimed Lages e pela AAPL (Associação dos Aposentados e Pensionistas de Lages), de segunda a sexta, das 8h às 20h. A primeira consulta é uma avaliação com a fisioterapeuta: ela conversa com você, observa como você se movimenta e combina um plano de tratamento. Atendimentos em ortopedia e dor: coluna, articulações, pós-operatório e recuperação após lesão. Responsáveis: Andriele da Silva, Fisioterapeuta, CREFITO-10 nº [número], e Nicole de Abreu Batista, Fisioterapeuta, CREFITO-10 nº 444436-F. Agendamento pelo WhatsApp (49) 99928-1721.

   Incluir "SUS" só depois de confirmado (pendência T1).
3. **Categoria:** principal "Fisioterapeuta" (ou "Clínica de fisioterapia", se aparecer). Não usar "Academia" nem "Pilates" como principal.
4. **Serviços:** só os confirmados. Hoje: fisioterapia em ortopedia e dor; pós-operatório; recuperação após lesão; avaliação de fisioterapia. Os outros (neurologia, cardiorrespiratória…) entram quando a clínica confirmar.
5. **Atributos de acessibilidade:** marcar só o que for verdade e conferido no local (entrada acessível para cadeira de rodas, banheiro acessível, estacionamento acessível). Hoje é pendência (T5).
6. **Fotos:**
   - **recategorizar as fotos que hoje aparecem como "Academia"**: em Fotos, abrir cada uma e trocar a categoria para "Interior", "Exterior" ou "Na empresa". Se não der para trocar, apagar e reenviar já com a categoria certa;
   - **15 ou mais fotos reais**: fachada de frente com o letreiro inteiro, recepção, ginásio de reabilitação, sala de esteira e bikes, corredor com jardim vertical, os dois consultórios;
   - sem pacientes; sem antes e depois (COFFITO Art. 15, V); sem arte com texto.
7. **Horário especial:** cadastrar feriados quando a clínica decidir (pendência).

## 3. Avaliações

- **Meta:** 20 avaliações no primeiro trimestre.
- **Como pedir:** gerar o link "Pedir avaliações" na ficha (pendência F3) e enviar a mensagem pós-sessão (docs/FUNIL.md §2). O QR do balcão está em /avaliar/qr.
- **Sem incentivo**, sem filtro (pedir a todos, não só a quem gostou), sem pedir nota específica. A política do Google proíbe avaliação incentivada ou seletiva.
- **Responder todas**, inclusive as negativas, em até 2 dias úteis. A resposta não pode confirmar que a pessoa é paciente nem citar dado de saúde (sigilo e LGPD). Por exemplo: "Obrigada por contar. Sua opinião ajuda a gente a cuidar melhor de quem chega." Para uma negativa: "Sentimos muito. Por favor, fale com a gente pelo WhatsApp (49) 99928-1721 para entendermos melhor."
- **O site nunca mostra avaliações** (COFFITO Art. 10, V), nem em estrelas, carrossel ou JSON-LD. Além disso, o Google não mostra estrelas de avaliações publicadas pelo próprio negócio no site dele ("self-serving reviews").

## 4. Levar o público do @studio.ar.pilates (1.601 seguidores)

1. **Bio do Studio Ar:** uma linha "Fisioterapia: @ardeli_fisioterapia" + o link do site da Ardeli.
2. **Destaque fixo** "Ardeli": 3 a 5 stories com a fachada, o ginásio, os convênios (Unimed e AAPL, só o nome, sem logo) e "agende pelo WhatsApp".
3. **Um post de anúncio** (carrossel) no Studio Ar: "A fisioterapia agora tem casa própria: Ardeli Fisioterapia, Av. Dom Pedro II, 2700, Brusque". Na legenda, nome e CREFITO-10 das fisioterapeutas (Art. 48). Sem antes e depois, sem depoimento, sem preço.
4. No perfil da Ardeli: o link da bio aponta para o site (não para o WhatsApp direto), para o Google ligar a conta ao domínio.

## 5. NAP nos outros cadastros

Copiar o NAP oficial (seção 1), letra por letra:

| Onde | O que fazer |
|---|---|
| **CNES 8422478** | Conferir se endereço, CEP e telefone no CNES batem com o NAP. Se não, pedir a atualização (pela Secretaria Municipal de Saúde / gestor do cadastro). |
| **Instagram @ardeli_fisioterapia** | Botão "Como chegar" com o endereço igual; telefone igual; link do site. |
| **Bing Places** | Importar do Perfil da Empresa no Google (opção "importar") e conferir. |
| **Apple Business Connect** | Cadastrar a clínica (aparece no Mapas do iPhone e na Siri), com o NAP igual e as mesmas fotos. |
| **Doctoralia** (opcional) | Se a clínica quiser: perfil das fisioterapeutas com CREFITO; desligar a exibição de opiniões no site da clínica (o nosso site não mostra nenhuma). |
| **Facebook** (se houver página) | NAP igual. |

## 6. Teste mensal no Modo IA (sem login)

Todo dia 1º, numa janela anônima (sem login no Google), na mesma cidade:

1. "fisioterapia Unimed Lages"
2. "fisioterapia AAPL Lages"
3. "fisioterapia bairro Brusque Lages"
4. "fisioterapia pós-operatório Lages"

Anotar numa planilha: data · consulta · a Ardeli aparece? (sim/não) · posição/menção · o que foi dito (copiar a frase) · fontes citadas · erro de dado (endereço, horário, convênio). Fazer o mesmo na busca comum (pacote local, os 3 primeiros do mapa). Se uma IA disser algo errado sobre a Ardeli, corrigir a fonte (ficha, site, cadastros), nunca "responder" à IA.

## 7. Como validar

| Ferramenta | Comando ou link | Resultado nesta sessão |
|---|---|---|
| audit-seo (local, roda no build) | `pnpm build` | verde: 638 verificações em 11 páginas (672 com domínio de teste) |
| validator.schema.org | `pnpm validar-schema` (envia só o JSON-LD) | 0 erro, 0 aviso (11 páginas, 13 objetos) em 23/11/2026 |
| Rich Results Test (Google) | https://search.google.com/test/rich-results, com a URL publicada | depende do site no ar (João) |
| Search Console | após publicar: verificar o domínio, enviar `/sitemap.xml`, inspecionar a home | depende do domínio |

## 8. Fontes consultadas (23/11/2026)

- schema.org, vocabulário v. atual (arquivo `schemaorg-current-https.jsonld`): `MedicalClinic` é subtipo de `MedicalBusiness` e `MedicalOrganization`; `Physiotherapy` é ao mesmo tempo `MedicalBusiness` e valor de `MedicalSpecialty`; `PhysicalTherapy` é `MedicalTherapy` (serve em `availableService`); `Physician` é "médico ou consultório médico" (não se aplica); `healthPlanNetworkId` (Text) vale para `MedicalOrganization`; `hasCredential` → `Credential`, com `recognizedBy` e `credentialCategory`. **`isAcceptedPaymentMethod` não existe no schema.org** (o validator.schema.org acusa `INVALID_PREDICATE`); por isso os convênios vão em `healthPlanNetworkId` e na descrição.
- Google Search Central, Local business: propriedades obrigatórias `name` e `address`; horários sem `validFrom`/`validThrough` valem o ano todo; `aggregateRating` só para sites que coletam avaliações de **outros** negócios.
- Google Search Central, Review snippet: LocalBusiness e Organization só "for sites that capture reviews about other local businesses; see the guidelines about self-serving reviews". Blog de 16/09/2019 ("Making review rich results more helpful"): avaliações autosservidas deixaram de gerar estrelas.
- Google Search Central, FAQPage: desde 2023, o resultado rico de FAQ só aparece para "well-known, authoritative government and health websites". Mantemos o FAQPage porque é dado correto e ajuda IAs a ler as perguntas, mas sem contar com estrelas ou dropdown no Google.
- Google Search Central, Video: obrigatórios `name`, `thumbnailUrl`, `uploadDate`.
- Google Search Central, Breadcrumb: `itemListElement` com `ListItem` (`position`, `name`, `item`).
- Google Search Central, "Creating helpful, reliable, people-first content": saúde é tema YMYL ("Your Money or Your Life"), que exige conteúdo "highly accurate and consistent with established expert consensus" e mostra claramente quem escreveu ("Who"). Daí a autoria com nome e CREFITO em todas as páginas e nenhuma promessa.
- Google Search Central, diretrizes gerais de dados estruturados: "Don't mark up content that is not visible to readers of the page". Por isso cada dado do JSON-LD está visível na página (FAQ, tour, profissionais, endereço).
- llmstxt.org, "The /llms.txt file, v2": arquivo em Markdown na raiz; H1 com o nome (único obrigatório), citação-resumo, detalhes sem títulos e seções H2 que são listas de links; a seção "Optional" agrupa o secundário; descoberta por `rel="describedby"`. É uma proposta, não um padrão obrigatório.
