// Modo do build: preview (padrão: faixa "em revisão", noindex) ou produção (travas valem).
export type Modo = 'producao' | 'preview';

export function modoAtual(
  env: Record<string, string | undefined> = globalThis.process?.env ?? {},
): Modo {
  const m = (env.ARDELI_MODO ?? 'preview').toLowerCase();
  if (m === 'producao' || m === 'produção' || m === 'production') return 'producao';
  return 'preview';
}
