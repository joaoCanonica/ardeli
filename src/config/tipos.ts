// Estados de um dado do cliente. Nada é inventado: o que não foi confirmado
// fica marcado e a produção sabe o que fazer com ele.
//
// confirmado(v, fonte)          → dado confirmado; `fonte` diz quem/onde confirmou.
// opcional(v)                    → pode faltar sem travar; se null, a página omite.
// bloqueante(rotulo, {fallback}) → falta um dado. Sem `fallback`, TRAVA a produção.
//                                  Com `fallback`, a página usa o texto seguro e avisa.
// aviso(rotulo, motivo, v?)      → dado utilizável, mas com ressalva a resolver.

export interface Confirmado<T> {
  readonly estado: 'confirmado';
  readonly valor: T;
  readonly fonte: string;
}

export interface Opcional<T> {
  readonly estado: 'opcional';
  readonly valor: T | null;
}

export interface Bloqueante {
  readonly estado: 'bloqueante';
  readonly rotulo: string;
  /** O que a página faz enquanto falta o dado. Sem fallback, a produção trava. */
  readonly fallback: string | null;
}

export interface Aviso<T> {
  readonly estado: 'aviso';
  readonly rotulo: string;
  readonly motivo: string;
  readonly valor: T | null;
}

export type Campo<T> = Confirmado<T> | Opcional<T> | Bloqueante | Aviso<T>;

export function confirmado<T>(valor: T, fonte: string): Confirmado<T> {
  if (valor === null || valor === undefined) throw new Error('confirmado() sem valor');
  if (!fonte.trim()) throw new Error('confirmado() sem fonte');
  return { estado: 'confirmado', valor, fonte };
}

export function opcional<T>(valor: T | null = null): Opcional<T> {
  return { estado: 'opcional', valor };
}

export function bloqueante(rotulo: string, opcoes: { fallback?: string } = {}): Bloqueante {
  return { estado: 'bloqueante', rotulo, fallback: opcoes.fallback ?? null };
}

export function aviso<T>(rotulo: string, motivo: string, valor: T | null = null): Aviso<T> {
  return { estado: 'aviso', rotulo, motivo, valor };
}

/** Valor utilizável do campo (confirmado, opcional preenchido ou aviso com valor). */
export function valorDe<T>(campo: Campo<T>): T | null {
  return campo.estado === 'bloqueante' ? null : campo.valor;
}

export function estaConfirmado<T>(campo: Campo<T>): campo is Confirmado<T> {
  return campo.estado === 'confirmado';
}

/** Lança se o campo não estiver confirmado. Use quando a página só pode AFIRMAR com confirmação. */
export function exigir<T>(campo: Campo<T>, contexto: string): T {
  if (campo.estado !== 'confirmado') {
    throw new Error(`${contexto}: dado não confirmado (${campo.estado})`);
  }
  return campo.valor;
}
