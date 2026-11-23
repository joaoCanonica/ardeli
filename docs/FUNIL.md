# Funil: agendar e avaliar

Como a pessoa chega à avaliação, como a clínica pede a opinião depois, e o que o site conta (sem cookie). Fonte do plano Google: `docs/ARDELI_INVESTIGACAO_CLIENTE.md` §6 e §10.

## 1. Agendar

- **Onde:** todo botão "Agendar" do site (cabeçalho, capa, seções, botão fixo, /convenios, atendimentos, primeira avaliação) abre a **gaveta** do agendador; a página **/agendar** tem o mesmo formulário.
- **Três passos numa tela:** (1) como você vai ser atendido · (2) o que te traz (opcional, genérico) · (3) quando prefere (período + dias, segunda a sexta). Prévia da mensagem e "Enviar pelo WhatsApp".
- **Pré-preenchido** por `?forma=` (particular, unimed, aapl, nao-sei; sus só com confirmação) e `?motivo=` (dor, pos-operatorio, recuperacao-lesao, neurologico, respiratorio, outro). Um botão com `data-forma` (ex.: /convenios#unimed) abre a gaveta com a forma marcada.
- **SUS:** enquanto não for confirmado, não aparece como opção; `?forma=sus` é ignorado.
- **Sem JS:** os botões são links diretos para o WhatsApp e o formulário envia a mensagem geral: "Olá! Vim pelo site da Ardeli e quero agendar uma avaliação. Ainda não sei se vai ser particular ou por convênio."
- **Nada é guardado.** A mensagem é montada no aparelho e só sai se a pessoa enviar. Aviso no formulário: "Não guardamos nada aqui. A mensagem vai do seu celular direto para o WhatsApp da clínica."
- **Destino** vem de `src/config/agenda.ts` (fase 1: WhatsApp 5549999281721). Fase 2: `link-externo` ou `api` sem mexer no formulário.

Exemplo: "Olá! Vim pelo site da Ardeli e quero agendar uma avaliação. Atendimento: Unimed. Motivo: pós-operatório. Prefiro à tarde, terça ou quinta."

## 2. Pedir a opinião (recepção)

**Mensagem pós-sessão** (a recepção envia pelo WhatsApp, para todos, no mesmo dia):

> Obrigada por vir hoje! Se puder contar como foi seu atendimento, isso ajuda outras pessoas a nos encontrarem: {SITE}/avaliar?o=whatsapp

- `{SITE}` = o domínio definitivo (pendência 18). Até lá, use o link "Pedir avaliações" da ficha do Google.
- **Sem incentivo:** nada de brinde, desconto, sorteio ou "em troca". Pedir a **todos**, não só a quem gostou (regra do Google e do COFFITO).
- O site **não mostra avaliações** (COFFITO Art. 10, V). Só o botão "Avaliar no Google" e o link para a ficha.

**Endereços:**

| Caminho | Para quê |
|---|---|
| `/avaliar?o=whatsapp` | link da mensagem pós-sessão |
| `/avaliar?o=qr` | o QR do balcão |
| `/avaliar?o=site` | botões do site (seção "opinião" e rodapé) |
| `/avaliar/qr` | folhas A6 e A5 para imprimir (QR gerado no build, em SVG) |

`/avaliar` redireciona para a ficha do Google (meta refresh de 3 s + JS imediato; link visível; `noindex`) e conta a origem.

**QR no balcão:** abrir `/avaliar/qr`, escolher "Imprimir A6" ou "Imprimir A5", papel sem margem. A folha leva o símbolo, a frase, o endereço e as fisioterapeutas com o CREFITO-10 (Art. 48 vale para impresso). Enquanto o CREFITO da Andriele não chegar, a folha diz "número em confirmação": **não imprimir para o balcão até lá.** Enquanto o domínio não existir, o QR aponta direto para a ficha (sem contar a origem).

## 3. Plano Google (fora do site, começar já)

1. **Ficha:** cadastrar o site; descrição com Unimed, AAPL, SUS (se confirmado), Brusque e o horário; serviços (só as áreas confirmadas); atributos (acessibilidade, estacionamento, se confirmados); trocar as fotos classificadas como "Academia" por fotos do espaço; 15+ fotos (fachada, recepção, ginásio, consultórios).
2. **Avaliações:** gerar o link "Pedir avaliações"; mensagem pós-sessão (acima); QR no balcão; sem incentivo e pedindo a todos; responder todas; meta: 20 no primeiro trimestre.
3. **Studio Ar:** na bio e nos destaques do @studio.ar.pilates, apontar para a Ardeli e para o site; 1 post de anúncio.
4. **NAP idêntico** (nome, endereço, telefone) no Google, Instagram, CNES, Doctoralia (opcional), Bing e Apple.
5. **Teste mensal no Modo IA** (anotar se a Ardeli aparece e o que é dito): "fisioterapia Unimed Lages" · "fisioterapia aposentados AAPL Lages" · "fisioterapia no bairro Brusque Lages" · "fisioterapia pós-operatório Lages".

## 4. Medição sem cookie

**Escolha: Plausible**, pela Events API, chamada do próprio domínio.

- **Por quê:** não usa cookie nem guarda identificador (não exige banner); a Events API aceita eventos com propriedades sem carregar script (0 KB a mais de JS, dentro do orçamento de 30 KB); hospedagem na UE e opção de auto-hospedar (Plausible CE).
- **Por que não Umami:** também é sem cookie, mas pede o script dele na página ou um servidor próprio com banco; o Plausible faz o mesmo sem script nem servidor nosso.
- **Sem request de terceiro:** o site envia `navigator.sendBeacon('/api/event')` para o **próprio domínio**; a hospedagem repassa para `https://plausible.io/api/event` (rewrite com `X-Forwarded-For` e `User-Agent`). O navegador nunca fala com o Plausible.
- **Desligada** até existir `clinica.dominio` (pendência 18) e a conta no Plausible (pendência F2). Antes disso, os eventos só vão para `window.__ardeliEventos` (usado no e2e).
- **Nunca texto livre:** `src/lib/medir.ts` só aceita valores de listas fechadas; o que não estiver na lista é descartado. A URL vai sem query.

| Evento | Propriedades (valores fechados) |
|---|---|
| `clique_agendar` | `forma` (particular, unimed, aapl, sus, nao-sei, nenhuma) · `origem` (cabecalho, capa, avaliacao, convenio, botao-fixo, convenios, atendimento, primeira-avaliacao, outro) |
| `agendador_enviado` | `forma` (particular, unimed, aapl, sus, nao-sei) · `motivo` (categoria ou nenhum) · `passo` (1, 2, 3: o último passo preenchido) |
| `clique_ligar` | — |
| `clique_convenio` | `convenio` (particular, unimed, aapl, sus) |
| `clique_avaliar` | `origem` (qr, site, whatsapp, direto) |
| `clique_como_chegar` | `destino` (google, waze, apple, pagina) |

O motivo vai só como categoria (ex.: "pos-operatorio"), nunca como texto escrito. A página /privacidade explica isso.

## 5. Consentimento

Só o **mapa interativo** do Google usa cookie de terceiro. Ele só carrega depois de "Mostrar o mapa" e **"Aceitar e mostrar o mapa"**; "Recusar" tem o mesmo tamanho, cor e peso, e nada é carregado. A escolha vale só para a aba aberta (sessionStorage). Nada mais no site pede consentimento.

## 6. Como testar

```bash
pnpm build
```

```bash
pnpm preview --port 4329
```

```bash
pnpm e2e
```

O e2e (390 px) confere a mensagem exata em 8 cenários, o redirecionamento de /avaliar, a impressão A6/A5 de /avaliar/qr, o consentimento do mapa e que nenhuma página faz request de terceiro antes do clique.
