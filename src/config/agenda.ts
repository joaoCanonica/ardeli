// Destino do agendador. Fase 1: WhatsApp. Fase 2: agenda online
// (link-externo ou api), trocando só esta linha.

export type Destino =
  | { readonly tipo: 'whatsapp' }
  | { readonly tipo: 'link-externo'; readonly url: string }
  | { readonly tipo: 'api'; readonly endpoint: string };

export const destinoAgenda: Destino = { tipo: 'whatsapp' };
