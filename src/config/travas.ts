// Travas de produção (CLAUDE.md §10) sobre a config. A varredura do HTML
// publicado fica em scripts/audit-compliance.mjs.
//
// trava = impede produção. aviso = publica com o texto seguro, mas precisa resolver.
// pendente = dado opcional vazio (a página omite).

import { registroDe } from '../lib/registro.ts';
import { readFileSync } from 'node:fs';
import { atendimentos } from '../content/dados/atendimentos.ts';
import { convenios } from '../content/dados/convenios.ts';
import { profissionais } from '../content/dados/profissionais.ts';
import { opcoesForma } from '../lib/agenda.ts';
import { clinica } from './clinica.ts';
import type { Campo } from './tipos.ts';

export type Nivel = 'trava' | 'aviso' | 'pendente';

export interface Verificacao {
  readonly id: string;
  readonly nivel: Nivel;
  readonly ok: boolean;
  readonly mensagem: string;
}

export { modoAtual, type Modo } from './modo.ts';

function ehCampo(x: unknown): x is Campo<unknown> {
  return (
    typeof x === 'object' &&
    x !== null &&
    'estado' in x &&
    ['confirmado', 'opcional', 'bloqueante', 'aviso'].includes(
      String((x as { estado: unknown }).estado),
    )
  );
}

/** Percorre um objeto e devolve [caminho, campo] de todos os Campo<T>. */
export function camposDe(obj: unknown, caminho = ''): [string, Campo<unknown>][] {
  if (ehCampo(obj)) return [[caminho, obj]];
  if (typeof obj !== 'object' || obj === null) return [];
  return Object.entries(obj).flatMap(([k, v]) => camposDe(v, caminho ? `${caminho}.${k}` : k));
}

interface MidiaItem {
  id: string;
  naoUsar: boolean;
  contemPessoa: boolean;
  autorizacaoImagem?: string | null;
  pessoaApenasNosTrechos?: boolean;
  trechos: { id: string; contemPessoa?: boolean; autorizacaoImagem?: string | null }[];
}

export interface EntradaTravas {
  readonly manifestoMidia?: { itens: MidiaItem[] };
}

function lerManifesto(): { itens: MidiaItem[] } {
  const url = new URL('../../media.manifest.json', import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8')) as { itens: MidiaItem[] };
}

export function verificarConfig(entrada: EntradaTravas = {}): Verificacao[] {
  const v: Verificacao[] = [];
  const add = (id: string, nivel: Nivel, ok: boolean, mensagem: string) =>
    v.push({ id, nivel, ok, mensagem });

  // 1. CREFITO de cada profissional (Art. 48).
  for (const p of profissionais) {
    const reg = registroDe(p);
    if (reg.tipo === 'clinica') {
      // Ordem expressa do João (23/11/2026): exibir o registro da clínica até o nº pessoal chegar.
      add(
        `crefito:${p.id}`,
        'aviso',
        true,
        `${reg.linha} — nº pessoal pendente; recomendado publicá-lo quando chegar (Art. 48)`,
      );
      continue;
    }
    const ok = p.crefito.estado === 'confirmado';
    add(
      `crefito:${p.id}`,
      'trava',
      ok,
      ok
        ? `${p.nome} · Fisioterapeuta · CREFITO-10 ${p.crefito.estado === 'confirmado' ? p.crefito.valor : ''}`
        : `CREFITO-10 de ${p.nome} ausente (COFFITO Art. 48)`,
    );
    if (p.foto && !p.foto.autorizacaoImagem) {
      add(`foto:${p.id}`, 'trava', false, `foto de ${p.nome} sem autorização de imagem`);
    }
  }

  // 2. WhatsApp.
  add(
    'whatsapp',
    'trava',
    clinica.whatsapp.estado === 'confirmado',
    clinica.whatsapp.estado === 'confirmado'
      ? 'WhatsApp confirmado'
      : 'WhatsApp da clínica ausente',
  );

  // 3. Atendimento publicado sem confirmação.
  for (const a of atendimentos) {
    if (!a.publicado) {
      add(`atendimento:${a.id}`, 'pendente', true, `${a.nomeCurto}: não publicado até confirmar`);
      continue;
    }
    const ok = a.confirmacao.estado === 'confirmado';
    add(
      `atendimento:${a.id}`,
      'trava',
      ok,
      ok ? `${a.nomeCurto}: publicado e confirmado` : `${a.nomeCurto}: publicado SEM confirmação`,
    );
  }

  // 4. SUS afirmado sem confirmação (config: o agendador não pode oferecer SUS).
  const sus = convenios.find((c) => c.id === 'sus');
  if (sus) {
    const confirmadoSus = sus.atende.estado === 'confirmado';
    const oferecido = opcoesForma().some((o) => o.id === 'sus');
    add(
      'sus',
      confirmadoSus ? 'trava' : 'aviso',
      confirmadoSus || !oferecido,
      confirmadoSus
        ? 'SUS confirmado'
        : oferecido
          ? 'SUS oferecido no agendador sem confirmação'
          : `SUS não confirmado: o site diz "${sus.textoSePendente}"`,
    );
  }
  for (const c of convenios) {
    if (
      c.id !== 'particular' &&
      c.atende.estado === 'confirmado' &&
      c.regras.estado !== 'confirmado'
    ) {
      add(
        `regras:${c.id}`,
        'pendente',
        true,
        `${c.nomeCompleto}: regras pendentes ("${c.textoSePendente}")`,
      );
    }
  }

  // 5. Imagem com pessoa sem autorização.
  const midia = entrada.manifestoMidia ?? lerManifesto();
  for (const item of midia.itens) {
    if (item.naoUsar) continue;
    if (!item.contemPessoa || item.autorizacaoImagem) continue;
    const trechosSemAut = item.trechos.filter((t) => t.contemPessoa && !t.autorizacaoImagem);
    if (item.pessoaApenasNosTrechos === true && trechosSemAut.length > 0) {
      add(
        `midia:${item.id}`,
        'aviso',
        true,
        `${item.id}: pessoa só em ${trechosSemAut.length} trecho(s), cortados dos derivados`,
      );
    } else {
      add(
        `midia:${item.id}`,
        'trava',
        false,
        `${item.id}: contém pessoa sem autorização de imagem`,
      );
    }
  }

  // 6. Demais campos da config: bloqueante sem fallback trava; com fallback avisa.
  for (const [caminho, campo] of camposDe(clinica)) {
    if (caminho === 'whatsapp') continue;
    const r = verificarCampo(`clinica.${caminho}`, campo);
    if (r) v.push(r);
  }

  return v;
}

/** Regra de um campo da config (exportada para teste). */
export function verificarCampo(id: string, campo: Campo<unknown>): Verificacao | null {
  if (campo.estado === 'bloqueante') {
    return campo.fallback
      ? { id, nivel: 'aviso', ok: true, mensagem: `${campo.rotulo} pendente → ${campo.fallback}` }
      : { id, nivel: 'trava', ok: false, mensagem: `${campo.rotulo} ausente` };
  }
  if (campo.estado === 'aviso')
    return { id, nivel: 'aviso', ok: true, mensagem: `${campo.rotulo}: ${campo.motivo}` };
  if (campo.estado === 'opcional' && campo.valor === null)
    return { id, nivel: 'pendente', ok: true, mensagem: `${id}: vazio (a página omite)` };
  return null;
}

export function travasFalhando(v: readonly Verificacao[]): Verificacao[] {
  return v.filter((x) => x.nivel === 'trava' && !x.ok);
}
