// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Site estático. O domínio definitivo é pendência (docs/PENDENCIAS.md).
// Fontes self-hosted (subset latino, OFL; licenças em src/assets/fontes/).
// Escolha e justificativa: docs/TIPOGRAFIA.md. O Astro gera @font-face,
// preload e fallback com métricas ajustadas (CLS ≈ 0).
export default defineConfig({
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Crimson Pro',
      cssVariable: '--fonte-crimson',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fontes/crimson-pro-latin-wght-normal.woff2'],
            weight: '200 900',
            style: 'normal',
          },
          {
            src: ['./src/assets/fontes/crimson-pro-latin-wght-italic.woff2'],
            weight: '200 900',
            style: 'italic',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Atkinson Hyperlegible Next',
      cssVariable: '--fonte-atkinson',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['./src/assets/fontes/atkinson-hyperlegible-next-latin-wght-normal.woff2'],
            weight: '200 800',
            style: 'normal',
          },
          {
            src: ['./src/assets/fontes/atkinson-hyperlegible-next-latin-wght-italic.woff2'],
            weight: '200 800',
            style: 'italic',
          },
        ],
      },
    },
  ],
});
