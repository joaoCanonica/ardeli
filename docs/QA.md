# QA: desempenho, acessibilidade, navegadores, acabamento e deploy

Sessão 9 · 23/11/2026 · build de preview servido por `pnpm servir` (imita a Vercel: brotli, cabeçalhos e CSP do `vercel.json`).
Ferramentas: Lighthouse 12.8.2, axe-core 4.14.1 (via @axe-core/playwright 4.14.0) e Playwright 1.63, todos no Chromium.
Números completos: `docs/qa/lighthouse.json` (depois) e `docs/qa/lighthouse-antes.json` (antes, servidor sem compressão).

## 1. Desempenho

### Lighthouse mobile, todas as rotas (perfil padrão: "4G lento", 1,6 Mbps, RTT 150 ms, CPU 4×)

| Rota | Perf | A11y | BP | SEO* | FCP | LCP | TBT | CLS | Peso transferido | JS |
|---|---|---|---|---|---|---|---|---|---|---|
| / | 99 | 100 | 100 | 66 | 1,29 s | **1,80 s** | 0 ms | 0 | 161 KB | 11,3 KB |
| /convenios/ | 100 | 100 | 100 | 63 | 1,24 s | 1,50 s | 0 | 0 | 82 KB | 6,6 KB |
| /atendimentos/ | 100 | 100 | 100 | 63 | 1,21 s | 1,51 s | 0 | 0 | 82 KB | 6,6 KB |
| /atendimentos/musculoesqueletica/ | 100 | 100 | 100 | 66 | 1,24 s | 1,58 s | 0 | 0 | 99 KB | 6,6 KB |
| /primeira-avaliacao/ | 100 | 100 | 100 | 63 | 1,21 s | 1,51 s | 0 | 0 | 83 KB | 6,6 KB |
| /quem-cuida/ | 100 | 100 | 100 | 63 | 1,20 s | 1,50 s | 0 | 0 | 104 KB | 6,6 KB |
| /a-clinica/ | 100 | 100 | 100 | 66 | 1,25 s | 1,73 s | 0 | 0 | 204 KB | 8,4 KB |
| /perguntas-frequentes/ | 100 | 100 | 100 | 63 | 1,25 s | 1,51 s | 0 | 0 | 82 KB | 6,6 KB |
| /como-chegar/ | 99 | 100 | 100 | 66 | 1,51 s | 1,73 s | 0 | 0 | 123 KB | 8,4 KB |
| /agendar/ | 100 | 100 | 100 | 63 | 1,25 s | 1,51 s | 0 | 0 | 80 KB | 5,5 KB |
| /privacidade/ | 100 | 100 | 100 | 63 | 1,25 s | 1,50 s | 0 | 0 | 82 KB | 6,6 KB |
| /avaliar/qr/ | 100 | 100 | 100 | 63 | 0,9 s | 1,2 s | 0 | **0** (era 0,089) | 64 KB | 2,3 KB |

\* SEO: no preview, a única falha é "is-crawlable" (o `noindex` proposital). Todos os outros itens de SEO passam. Em produção o noindex sai.

**Orçamento (CLAUDE.md §5):** Perf ≥ 95 ✓ · BP ≥ 95 ✓ · A11y 100 ✓ · CLS ≈ 0 ✓ · INP: TBT 0 ms em todas ✓ · JS inicial ≤ 30 KB ✓ (máx. 8,7 KB gzip na home, contando os scripts inline).
**LCP < 1,8 s:** ✓ em 4G (perfil do CLAUDE.md: todas as rotas entre 0,49 e 0,59 s). **No "4G lento" do Lighthouse, a home fica no limite: 1,80–1,89 s entre execuções; /a-clinica, 1,73–1,88 s.**

Investigação do LCP da home (medida, não suposição):
- não é a abertura: COM abertura 1,89 s × SEM abertura (reduced-motion) 1,89 s;
- não é o tamanho do HTML: tirar o logo do rodapé reduz só 80 bytes em brotli (o SVG repetido já é comprimido);
- **é a disputa de banda com as duas fontes pré-carregadas (45 KB)**: sem o pré-carregamento, o LCP cai para 1,2–1,6 s, **mas o CLS sobe para até 0,019–0,028** (a fonte troca depois da pintura). Pré-carregar só uma não muda o LCP (1,9 s);
- decisão pendente (Q7): manter CLS 0 (atual) ou aceitar CLS ~0,02 por LCP ~1,4 s. **Não troquei um critério do orçamento pelo outro sem ordem.**

### Home com e sem abertura; Android básico

| Situação | Perf | FCP | LCP | CLS |
|---|---|---|---|---|
| Home COM abertura (sessão nova) | 99 | 1,36 s | 1,89 s | 0 |
| Home SEM abertura (reduced-motion) | 99 | 1,58 s | 1,89 s | 0 |
| Home · 3G lento (400 kbps, RTT 400 ms, CPU 6×) | 66 | 4,41 s | 6,21 s | 0 |
| /agendar · 3G lento, CPU 6× | 76 | 3,21 s | 4,81 s | 0 |

Em 3G lento, o botão "Agendar" é um link direto para o WhatsApp desde o primeiro byte (funciona antes do JS).

### Pesos

| | Cru | gzip | brotli |
|---|---|---|---|
| HTML da home | 220 KB | 47,5 KB | 31,5 KB |
| HTML de /convenios | 109 KB | 31,4 KB | 20,0 KB |
| HTML de /agendar | 95 KB | 29,4 KB | 18,6 KB |
| Todo o JS do site | — | 4,8 KB | — |
| Fontes (4 arquivos, subset pt-BR) | 70 KB | — | — |
| Imagem LCP da home (AVIF 720 px) | 23 KB | — | — |
| dist/media (vídeos + imagens, carregados sob demanda) | 31,3 MB | — | — |

Nenhuma rota faz requisição a terceiros no carregamento (Lighthouse "third-party" = 0; e2e confirma).

## 2. Acessibilidade (`pnpm audit-a11y`: verde, 1.786 verificações)

| Teste | Resultado |
|---|---|
| **axe** (WCAG 2.0/2.1/2.2 A e AA + boas práticas), 14 rotas × 390 e 1440, mais gaveta aberta, menu aberto, mapa perguntando, FAQ aberta, A++, prefers-contrast: more e forced-colors | **0 violação** em 39 varreduras (antes: 59) |
| **Teclado do início ao fim** (capa → seletor de convênio → Agendar da Unimed → agendador → WhatsApp) | 1º Tab = "Pular para o conteúdo"; 12 Tabs até o seletor; setas escolhem Unimed; Enter abre a gaveta com Unimed marcado e o foco dentro; setas e Espaço escolhem "tarde"; **21 Tabs no total**; Enter envia "Olá! Vim pelo site da Ardeli e quero agendar uma avaliação. Atendimento: Unimed. Prefiro à tarde." Esc fecha a gaveta e devolve o foco ao botão |
| **Foco visível** | Em todos os elementos percorridos de /, /agendar, /convenios e /como-chegar |
| **Reflow**: zoom 200% (640 px), 400% (320 × 256 px) e 390 px a 200% (195 px), 14 rotas | Sem rolagem horizontal, sem texto cortado |
| **A+/A−** | 18 → 20 → 22 px; guardado só no aparelho (localStorage); vale nas outras páginas; sem transbordo a 390 px; A− volta a 18 px |
| **prefers-contrast: more** e **forced-colors** | axe sem violação (em forced-colors as cores são do sistema; a regra de contraste não se aplica e foi desligada só nessa varredura) |
| **reduced-motion** | Nenhuma animação rodando, abertura não aparece, vídeo não toca sozinho. Sem a preferência, a abertura termina em ~1,1 s |
| **Alvos ≥ 48 px** (exceto link dentro de frase) | Todos, 14 rotas × 2 larguras |
| **Árvore de acessibilidade** do agendador e do seletor | `docs/qa/arvore-acessibilidade.md` (grupos nomeados, rádios com nome) |

Correções feitas nesta sessão:
- links de ação isolados com 24–29 px viraram alvos de 48 px (fatos da capa, "Como é a primeira avaliação", "Conheça quem cuida", "Veja os atendimentos", "Abrir no Google Maps", "Perguntar sobre o SUS", telefone, Instagram e links do rodapé);
- A−/A+: o nome acessível agora começa pelo texto visível ("A− diminuir o texto"), conforme a WCAG 2.5.3;
- a faixa "em revisão" e o botão fixo agora ficam dentro de landmarks;
- /avaliar: o meta refresh passou de 3 s para 0 s (WCAG 2.2.1; o link continua visível).

### 3. Leitor de tela (NVDA e VoiceOver): roteiro para o João

Não há leitor de tela neste ambiente. A árvore que o NVDA/VoiceOver recebe está em `docs/qa/arvore-acessibilidade.md`. Roteiro (10 min):
1. **NVDA + Chrome (Windows)**, /agendar: Tab até o primeiro rádio. Deve anunciar "Como você vai ser atendido?, grupo, Particular, botão de opção, não marcado, 1 de 4". Setas mudam a opção. A prévia "Sua mensagem" é lida ao chegar nela.
2. Home, seletor de convênio: ao escolher "Unimed", o anúncio (aria-live) diz o que apareceu.
3. **VoiceOver + Safari (iPhone)**: arrastar o dedo pela gaveta "Agendar avaliação" (rótulo "Agendar avaliação", diálogo); o rotor "Controles de formulário" lista os 3 passos.
4. Anotar: o que foi lido errado ou duas vezes, onde o foco se perdeu.

### 4. Pessoa com mais de 60 anos: roteiro e ficha (João)

Sem interferir, pedir no celular da pessoa: "Você tem Unimed. Marque uma avaliação para terça à tarde." Cronometrar. Depois: "Onde fica a clínica?" e "Quem vai te atender?".

| Tarefa | Tempo | Conseguiu? | Onde travou (palavras dela) |
|---|---|---|---|
| Descobrir se atende Unimed | | | |
| Agendar (até abrir o WhatsApp com a mensagem) | | | |
| Achar o endereço / ligar | | | |
| Aumentar a letra (A+) | | | |

Meta do CLAUDE.md: entender o convênio e agendar em menos de 30 s.

## 5. Navegadores

| Navegador | Como | Resultado |
|---|---|---|
| Chrome (Chromium 1.63) | todos os testes desta página | ✓ |
| Android básico (390 px, 3G lento, CPU 6×) | Lighthouse com rede e CPU limitadas | FCP 4,4 s, LCP 6,2 s, CLS 0, agendar funciona como link antes do JS |
| Sem JS | 12 rotas com JS desligado | ✓ sem rolagem horizontal; 1 H1 por página; todo "Agendar" é link direto para o WhatsApp; telefone e Art. 48 presentes; o formulário do agendador envia a mensagem geral |
| **Safari iOS** e **Firefox** | não rodam neste ambiente (só o Chromium vem instalado) | **pendente (Q6)**: roteiro abaixo |

Recursos de CSS usados e suporte mínimo: `:has()` (Safari 15.4, Firefox 121), container queries (Safari 16, Firefox 110), `<dialog>` (Safari 15.4), `dvh` (Safari 15.4, Firefox 101), `inert` (Safari 15.5, Firefox 112), `text-wrap: balance/pretty` (melhoria progressiva: sem suporte, só quebra de linha comum). CSP por `<meta>`: Safari e Firefox suportam.
Roteiro para Safari iOS e Firefox: abrir a home, tocar "Agendar", escolher Unimed + tarde, enviar (abre o WhatsApp), voltar; girar o celular; A+ duas vezes; /avaliar/qr → Imprimir A6.

## 6. Acabamento (`pnpm audit-acabamento`: verde)

- **Verbetes:** 38 verbetes em 12 rotas × 2 larguras. Palavra e classe estão na mesma linha de base (≤ 1 px, medido com sonda); o fio, um `::after`, foi conferido nas capturas.
- **Viúvas e órfãs:** 0 em 530 blocos de texto. Antes eram 15: `text-wrap: balance` nos blocos curtos (acepções, respostas, avisos, Art. 48, perguntas) e `pretty` nos parágrafos.
- **Fotos:** 23 imagens sem distorção (`object-fit: cover` ou proporção do arquivo).
- **Textos cortados:** nenhum.
- **Aspas, travessões e acentos:** 20 pares de aspas retas viraram “curvas” nos textos públicos. Não há reticências de três pontos, hífen no lugar de travessão nem palavras sem acento. Também saiu um espaço antes de vírgula no texto oculto da faixa de fatos.
- **Capturas antes e depois:** `docs/qa/capturas/*-antes-depois.jpg` (home, convênios, agendar com zoom 200%, quem cuida, como chegar). Capturas completas (390/1440 × padrão, reduced-motion e zoom 200%) em `docs/capturas/2026-11-23-antes` e `-depois`, fora do git.

## 7. Deploy (Vercel, estático)

- **`vercel.json`:**
  - comando de build e saída `dist/`;
  - `trailingSlash`;
  - rewrite `/api/event` → Plausible;
  - cabeçalhos: HSTS de 1 ano com subdomínios (sem `preload`, que é decisão do dono do domínio), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (câmera, microfone, geolocalização, pagamento… negados), `X-Content-Type-Options`, `X-Frame-Options: DENY`, `frame-ancestors 'none'` e `Cross-Origin-Opener-Policy`;
  - cache de **1 ano (immutable)** para `/_astro/*` e `/media/*`, 1 dia para `/og/*` e **`no-store` para `/avaliar`**;
  - **`X-Robots-Tag: noindex` em todo `*.vercel.app`** (preview).
- **CSP por hash**: gerada pelo Astro em cada página (`<meta http-equiv>`).
  - Todo `<script>` e `<style>` inline entra por sha256; os dois scripts `is:inline` (tamanho do texto e abertura) estão em `src/scripts/inline/`, com o hash calculado do próprio arquivo na config.
  - Atributos `style=""` (LQIP, proporções) só em `style-src-attr`.
  - Nenhum script ou estilo inline fora da política (conferido); **nenhuma violação nem erro de JS** em 15 rotas com o mapa aceito e a gaveta aberta.
- **`SITE_URL` por variável de ambiente**: sem ela, a produção trava; uma URL inválida (sem https ou com caminho) quebra o build.
- **Preview sempre noindex**: `<meta robots>`, faixa "em revisão" e `X-Robots-Tag` nos `*.vercel.app`.
- **Por que deploy "prebuilt"**: a mídia derivada sai do `ffmpeg`, que a imagem de build da Vercel não tem. O workflow `.github/workflows/deploy.yml` instala o ffmpeg e roda check, testes, build (com as travas), e2e, audit-a11y e audit-acabamento; só então manda o `dist/` pronto para a Vercel. Produção só no branch `main`, com `ARDELI_MODO=producao`.
- **Teste local igual à Vercel:**

```bash
pnpm build
```

```bash
pnpm servir
```

```bash
BASE=http://localhost:4330 pnpm e2e
```

```bash
BASE=http://localhost:4330 pnpm audit-a11y
```

```bash
BASE=http://localhost:4330 pnpm audit-acabamento
```

```bash
BASE=http://localhost:4330 pnpm audit-lighthouse --saida docs/qa/lighthouse.json
```

## 8. O que falta (João)

Ver `docs/PENDENCIAS.md`:
- **Q1–Q3:** `SITE_URL`, projeto e segredos da Vercel.
- **Q4–Q6:** leitor de tela real, teste com pessoa 60+, Safari iOS e Firefox.
- **Q7:** decisão sobre fontes × LCP.
- **Travas 1–2:** CREFITO da Andriele e CNPJ.

## 9. Sessão 10: produção destravada e site mais fluido (23/11/2026)

**Fluidez para todos os públicos (adaptativa, decidida no `<head>` antes da pintura):**

| Situação | O que o site faz |
|---|---|
| Rede boa (4G/Wi-Fi) | Fontes da marca pré-carregadas, como antes (CLS 0) |
| 2G/3G ou "economia de dados" | Fonte do sistema (Georgia / Roboto); não baixa os 74 KB de fontes; nada troca no meio da leitura |
| Aparelho simples (≤ 2 GB ou ≤ 2 núcleos) | Sem abertura, sem loop da capa, transições instantâneas |

Home com throttling **real** do Chromium (CPU 4×, tela 412 px, mediana de 3; `node scripts/medir-rede.mjs`):

| | 3G lento (400 kbps, 400 ms) | 4G (9 Mbps, 60 ms) |
|---|---|---|
| Antes | LCP 3,36 s · CLS **0,041** · 157 KB | LCP 0,69 s · CLS 0 |
| Depois | **LCP 2,22 s · CLS 0 · 85 KB** | **LCP 0,60 s** · CLS 0 |

**Teste 60+ simulado** (`docs/qa/TESTE_60_SIMULADO.md`, Moto G4, 3G, A++):
- concluiu as 4 tarefas;
- A+ sem rolagem: os controles de texto e o telefone foram para o topo do menu;
- na gaveta, "Enviar pelo WhatsApp" fica sempre à vista;
- agendar terça à tarde pela Unimed leva ~36 s estimados (5 toques, 2 rolagens). O caminho mínimo (Agendar → Unimed → Enviar) leva ~20 s;
- atrito que ficou: com A++, "Unimed" não aparece na primeira tela (precisa de 1 rolagem).

**Produção:** `ARDELI_MODO=producao` sem nenhuma trava aberta; as páginas de trabalho não são geradas; SEO 100 no Lighthouse (sem `noindex`).

**Depois das mudanças:** axe 0 violações · audit-a11y verde (1.776 verificações) · acabamento verde · e2e 16/16.
