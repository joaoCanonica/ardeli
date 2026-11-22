// "Avaliar no Google". Sem incentivo e sem exibir avaliações (COFFITO Art. 10, V).
// Preferência: link "Pedir avaliações" do Perfil da Empresa (abre direto a caixa
// de avaliação). Enquanto não chegar, cai na ficha da clínica no Google Maps.

import { clinica } from '../config/clinica.ts';
import { valorDe } from '../config/tipos.ts';

export interface LinkAvaliar {
  readonly url: string;
  readonly origem: 'pedir-avaliacoes' | 'ficha';
  /** Presente quando é o fallback. */
  readonly aviso: string | null;
}

export function linkAvaliar(): LinkAvaliar {
  const campo = clinica.google.linkPedirAvaliacoes;
  if (campo.estado === 'confirmado') {
    return { url: campo.valor, origem: 'pedir-avaliacoes', aviso: null };
  }
  const cid = valorDe(clinica.mapsCid);
  if (!cid) throw new Error('sem link de avaliação e sem cid da ficha');
  return {
    url: `https://maps.google.com/?cid=${cid}`,
    origem: 'ficha',
    aviso: `${'rotulo' in campo ? campo.rotulo : 'link de avaliação'} pendente: usando a ficha do Google Maps`,
  };
}
