// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Site estático. O domínio definitivo é pendência (docs/PENDENCIAS.md).
// Fontes self-hosted (subset latino, OFL; licenças em src/assets/fontes/).
// Escolha e justificativa: docs/TIPOGRAFIA.md. O Astro gera @font-face,
// preload e fallback com métricas ajustadas (CLS ≈ 0).
export default defineConfig({
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
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
            src: ['./src/assets/fontes/crimson-pro-pt-normal.woff2'],
            weight: '400 600',
            style: 'normal',
          },
          {
            // Itálico só para a classe gramatical (s.f., v.t.d.…): subset de 11,6 KB (docs/TIPOGRAFIA.md).
            src: ['./src/assets/fontes/crimson-pro-italico-classes.woff2'],
            weight: '400 600',
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
            src: ['./src/assets/fontes/atkinson-hyperlegible-next-pt-normal.woff2'],
            weight: '400 700',
            style: 'normal',
          },
          {
            src: ['./src/assets/fontes/atkinson-hyperlegible-next-pt-italic.woff2'],
            weight: '400 700',
            style: 'italic',
          },
        ],
      },
    },
  ],
});
