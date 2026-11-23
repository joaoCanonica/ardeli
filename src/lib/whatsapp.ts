// Links de WhatsApp. Toda mensagem diz "Vim pelo site da Ardeli" (para a
// clínica saber a origem). Nada é guardado: o texto vai só na URL que a
// pessoa abre e envia (ou não) do próprio aparelho.

import { clinica } from '../config/clinica.ts';
import { valorDe } from '../config/tipos.ts';
import type { Atendimento, Convenio } from '../content/schemas.ts';

export { ORIGEM } from './agenda-nucleo.ts';
import { ORIGEM } from './agenda-nucleo.ts';

export function numeroWhatsApp(): string {
  const w = valorDe(clinica.whatsapp);
  if (!w) throw new Error('WhatsApp da clínica ausente (trava de produção)');
  return w.numero;
}

export function linkWhatsApp(texto: string): string {
  const t = texto.includes(ORIGEM) ? texto : `Olá! ${ORIGEM}. ${texto}`.trim();
  return `https://wa.me/${numeroWhatsApp()}?text=${encodeURIComponent(t)}`;
}

export const mensagens = {
  geral: (): string => `Olá! ${ORIGEM} e quero falar com a clínica.`,

  convenio: (c: Pick<Convenio, 'id' | 'nomeCompleto' | 'atende'>): string => {
    if (c.id === 'particular') return `Olá! ${ORIGEM} e quero agendar uma avaliação particular.`;
    if (c.atende.estado !== 'confirmado') {
      // Não afirma que atende: pergunta.
      return `Olá! ${ORIGEM} e quero saber se a Ardeli atende pelo ${c.nomeCompleto} e como funciona.`;
    }
    if (c.id === 'aapl') {
      return `Olá! ${ORIGEM}. Sou associado(a) da AAPL e quero saber como agendar uma avaliação.`;
    }
    return `Olá! ${ORIGEM}. Tenho ${c.nomeCompleto} e quero saber como agendar uma avaliação.`;
  },

  atendimento: (a: Pick<Atendimento, 'nomeCurto'>): string =>
    `Olá! ${ORIGEM} e quero saber sobre o atendimento de ${a.nomeCurto}.`,

  comoChegar: (): string => {
    const e = valorDe(clinica.endereco);
    const onde = e ? ` (${e.logradouro}, ${e.numero}, ${e.bairro})` : '';
    return `Olá! ${ORIGEM} e quero ajuda para chegar à clínica${onde}.`;
  },
} as const;
