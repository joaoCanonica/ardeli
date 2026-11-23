// Medição sem cookie: Plausible, pela API de eventos, via caminho do PRÓPRIO domínio
// (/api/event → plausible.io/api/event por rewrite da hospedagem). Nenhum script de
// terceiro é carregado e nenhum request vai a terceiro a partir do navegador.
// Desligada enquanto o domínio não estiver confirmado (clinica.dominio).
import { clinica } from './clinica.ts';
import { valorDe } from './tipos.ts';

export interface ConfigMedicao {
  readonly ativo: boolean;
  readonly provedor: 'plausible';
  /** Caminho de primeira parte (mesmo domínio). */
  readonly endpoint: string;
  readonly dominio: string | null;
}

export function configMedicao(): ConfigMedicao {
  const dominio = valorDe(clinica.dominio);
  return { ativo: dominio !== null, provedor: 'plausible', endpoint: '/api/event', dominio };
}
