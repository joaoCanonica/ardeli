# Ardeli Fisioterapia — site

Site estático da Ardeli Fisioterapia (Lages/SC), em Astro + TypeScript strict.

**Antes de qualquer mudança, leia [`CLAUDE.md`](CLAUDE.md)** (contexto, regras do COFFITO, travas).
Dados que faltam ficam em [`docs/PENDENCIAS.md`](docs/PENDENCIAS.md); nada é inventado.

## Requisitos

- Node 22.23.5 (`.nvmrc`) e pnpm 10.28 (`packageManager`)
- ffmpeg/ffprobe (preparo de mídia) e Chromium do Playwright (capturas)

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm install` | instala as dependências |
| `pnpm dev` | servidor local |
| `pnpm build` / `pnpm preview` | gera e serve o `dist/` (preview: noindex; a faixa "em revisão" entra com o layout). Antes: mídia + `validate-config`; depois: `audit-compliance` |
| `pnpm build:producao` | build com `ARDELI_MODO=producao`: **trava** se houver pendência bloqueante (ex.: CREFITO da Andriele) |
| `pnpm check` | `astro check` + ESLint + Prettier |
| `pnpm test` | Vitest |
| `pnpm media:prepare` | gera `public/media/` a partir de `media-originais/` e `media.manifest.json` (roda sozinho antes de `dev`/`build`; precisa de ffmpeg) |
| `pnpm media:folha` | refaz as folhas de contato dos stills em `docs/dados/` |
| `pnpm capturar` | capturas por rota em 390 e 1440 px (padrão, reduced-motion, zoom 200%) em `docs/capturas/<data>/` |
| `pnpm validate-config` | mostra travas, avisos e pendências da config (`src/config`, `src/content/dados`) |
| `pnpm audit-compliance` | varre o `dist/`: termos vetados, depoimento, SUS afirmado, CREFITO no rodapé, mídia fora do índice |
| `pnpm audit-a11y`, `audit-lighthouse`, `audit-seo`, `audit-contraste` | ainda não implementados: **falham de propósito** até a sessão que os cria |

## Pastas

- `src/` — `config`, `components`, `layouts`, `pages`, `styles`, `scripts`, `content`, `lib`
- `scripts/` — automações (Node)
- `docs/` — contexto, investigação, mapa de mídia, pacote de prompts, pendências, `capturas/`, `dados/`
- `media-originais/` — mídia original (versionada); derivados vão para `public/media/` (fora do git); catálogo em [`docs/MIDIA_CATALOGO.md`](docs/MIDIA_CATALOGO.md)
