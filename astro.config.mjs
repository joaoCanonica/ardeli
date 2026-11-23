// @ts-check
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig, fontProviders } from 'astro/config';

// Scripts is:inline (src/scripts/inline/*.js): o Astro não os põe na CSP sozinho;
// o hash sai do próprio arquivo, então nunca fica desatualizado.
/**
 * @param {string} arq
 * @returns {`sha256-${string}`}
 */
const hashInline = (arq) =>
  `sha256-${createHash('sha256')
    .update(readFileSync(new URL(`./src/scripts/inline/${arq}`, import.meta.url)))
    .digest('base64')}`;

// Site estático. O domínio definitivo é pendência (docs/PENDENCIAS.md).
// Fontes self-hosted (subset latino, OFL; licenças em src/assets/fontes/).
// Escolha e justificativa: docs/TIPOGRAFIA.md. O Astro gera @font-face,
// preload e fallback com métricas ajustadas (CLS ≈ 0).
export default defineConfig({
  // Domínio: ardeli.com.br (confirmado); SITE_URL sobrescreve.
  site: (process.env.SITE_URL ?? 'https://ardeli.com.br').replace(/\/+$/, ''),
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  // CSP por hash (<meta http-equiv>, gerada por página no build): todo <script> e
  // <style> inline entra por sha256. Atributos style="" (LQIP, proporções) só em
  // style-src-attr. Cabeçalhos que a <meta> não cobre (frame-ancestors, HSTS…): vercel.json.
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "media-src 'self'",
        "connect-src 'self'",
        // Mapa do Google: só depois de "Aceitar" (docs/FUNIL.md §5).
        'frame-src https://www.google.com',
        // Agendador sem JS envia o formulário nativo para o WhatsApp.
        "form-action 'self' https://wa.me",
        "base-uri 'self'",
        "object-src 'none'",
        "manifest-src 'self'",
        "worker-src 'none'",
        'upgrade-insecure-requests',
      ],
      scriptDirective: {
        hashes: [hashInline('tamanho.js'), hashInline('abertura.js')],
      },
      styleDirective: {
        resources: [{ resource: "'unsafe-inline'", kind: 'attribute' }],
      },
    },
  },
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
