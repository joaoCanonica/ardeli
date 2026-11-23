# Conferência final: COFFITO, LGPD e CDC

Data: 23/11/2026 · build de preview · fonte das regras: CLAUDE.md §3 e `docs/ARDELI_INVESTIGACAO_CLIENTE.md` §8.
**Nenhuma trava foi afrouxada nesta sessão.** Foram acrescentadas três (preço em valor, logo de terceiros, coleta de dado de saúde) e uma ficou mais rígida (domínio por `SITE_URL`).

## Resultado

| Regra | Como é garantida | Resultado |
|---|---|---|
| **Art. 48** · nome + "Fisioterapeuta" + nº do CREFITO-10 em toda divulgação | `audit-compliance` (rodapé de toda página), `audit-seo` (llms.txt), `gerar-og` (imagem de compartilhamento), cartaz do QR, JSON-LD (`hasCredential` só com número) | ✓ nas 17 páginas do build, no llms.txt, na imagem OG e no cartaz. **Andriele: "número em confirmação" → produção travada** |
| **Art. 15, V** · sem antes e depois, sem identificar paciente | termos vetados; `prepare-media` não publica item com pessoa sem autorização; trechos com reflexo cortados | ✓ nenhuma ocorrência; 4 trechos do tour cortados |
| **Art. 10, V** · sem depoimento ou avaliação | `audit-compliance` (blockquote, citação + nome, estrelas, JSON-LD de Review), `audit-seo` (AggregateRating/Review em qualquer nível) | ✓ nenhuma; só o botão "Avaliar no Google" |
| **Art. 15, III** · sem promessa de resultado | termos vetados ("cura", "garantido", "100%", "acaba com a dor", "sem dor"…) em src/content e no HTML | ✓ nenhuma |
| **Art. 40, I** · sem preço, promoção, grátis | termos vetados + **novo**: preço em valor (`R$ 120`, "120 reais", "valor da consulta") | ✓ nenhuma (teste negativo reprovou corretamente) |
| **Art. 30 e 48, I** · "especialista" só com título reconhecido | termo vetado; `titulosReconhecidos` vazio | ✓ nenhuma; áreas aparecem como "atendimentos" |
| **SUS só confirmado** | `audit-compliance` (toda menção junto de "consulte a disponibilidade"), agendador sem a opção, JSON-LD/llms.txt sem SUS | ✓ "Consulte a disponibilidade pelo WhatsApp" |
| **Marcas de terceiros** só em texto | **novo**: nenhuma `<img>`/`<source>`/`<use>` com unimed/aapl/sus | ✓ só o nome em texto |
| **Área de atendimento não confirmada** | `validate-config` (publicado sem confirmação trava) | ✓ só "ortopedia e dor" publicada |
| **Imagem com pessoa sem autorização** | `validate-config` + `prepare-media` | ✓ nenhuma |
| **Termo vetado no HTML** (lista do CLAUDE.md §8 também) | `audit-compliance` | ✓ |

## LGPD (dado de saúde é sensível)

| Ponto | Garantia | Resultado |
|---|---|---|
| Nenhum formulário guarda queixa | **novo**: todo `<form>` é GET e só para `https://wa.me/` (o agendador monta a mensagem no aparelho) | ✓ 1 formulário por página com agendador, todos GET → wa.me |
| Nada sai do aparelho por script | **novo**: nenhum `fetch`/XHR/WebSocket/`document.cookie =` nos scripts; `sendBeacon` só na medição de lista fechada | ✓ |
| Sem cookie | medição sem cookie (Plausible por rewrite do próprio domínio, desligada até o domínio); A+/A− em localStorage; mapa em sessionStorage | ✓ nenhum cookie (e2e: 7 páginas, mapa recusado) |
| Nenhum terceiro antes do clique | e2e: 7 páginas sem request externo; mapa do Google só após "Aceitar" (mesmo peso que "Recusar") | ✓ |
| Medição sem texto livre | `limparProps` só aceita valores de listas fechadas; o motivo vai como categoria | ✓ |
| Página de privacidade | /privacidade explica o que fica no aparelho, o mapa, os direitos (art. 18) e quem é responsável | ✓ |

## CDC (Código de Defesa do Consumidor) e informação clara

| Ponto | Situação |
|---|---|
| Identificação de quem oferece o serviço (art. 31; boa prática do Decreto 7.962/2013) | Nome, endereço, telefone, razão social, registro de empresa no CREFITO-10 e CNES no rodapé/privacidade. **CNPJ completo pendente: trava a produção** (`empresa.cnpj` bloqueante) |
| Publicidade enganosa (art. 37) | Sem promessa, sem preço, convênios só os confirmados; regras de cada convênio "Confirme pelo WhatsApp" até a clínica confirmar |
| Informação de horário | "Segunda a sexta, das 8h às 20h"; feriado não afirmado ("confirme pelo WhatsApp") até a clínica confirmar |

## Travas de produção abertas (impedem o deploy em produção)

1. CREFITO-10 da Andriele da Silva (Art. 48).
2. CNPJ completo.
3. `SITE_URL` (domínio definitivo) — definir na Vercel.

Prova: `ARDELI_MODO=producao node scripts/validate-config.mjs` → código de saída 1. Com `SITE_URL` definido, sobram 1 e 2.

## Como repetir

```bash
pnpm build
```

```bash
ARDELI_MODO=producao node scripts/validate-config.mjs
```
