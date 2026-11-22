// Schemas das coleções (validados pelo Astro no build e pelos testes).
import { z } from 'astro/zod';

export function campoSchema<T extends z.ZodType>(valor: T) {
  return z.discriminatedUnion('estado', [
    z.object({ estado: z.literal('confirmado'), valor, fonte: z.string().min(1) }),
    z.object({ estado: z.literal('opcional'), valor: valor.nullable() }),
    z.object({
      estado: z.literal('bloqueante'),
      rotulo: z.string().min(1),
      fallback: z.string().nullable(),
    }),
    z.object({
      estado: z.literal('aviso'),
      rotulo: z.string(),
      motivo: z.string(),
      valor: valor.nullable(),
    }),
  ]);
}

export const profissionalSchema = z.object({
  id: z.string(),
  ordem: z.number().int(),
  nome: z.string().min(1),
  profissao: z.literal('Fisioterapeuta'),
  /** Só o número (ex.: "444436-F"); a região vem de clinica.empresa.regiaoCrefito. */
  crefito: campoSchema(z.string().regex(/^\d{4,7}-F$/, 'formato do CREFITO: 000000-F')),
  responsavel: z.boolean(),
  formacao: campoSchema(z.string()),
  /** Títulos de especialidade reconhecidos pelo COFFITO e confirmados. Vazio até confirmar. */
  titulosReconhecidos: z.array(z.object({ titulo: z.string(), fonte: z.string().min(1) })),
  /** Só fatos confirmados, com a fonte de cada um. */
  resumo: z.array(z.object({ texto: z.string().min(1), fonte: z.string().min(1) })),
  foto: z.object({ midiaId: z.string(), autorizacaoImagem: z.string().min(1) }).nullable(),
});

export const verbeteSchema = z.object({
  palavra: z.string().min(1),
  classe: z.enum(['s.f.', 's.m.', 'v.t.d.', 'v.i.', 'adj.']),
  acepcoes: z.array(z.string().min(1)).min(1),
});

export const atendimentoSchema = z.object({
  id: z.enum([
    'musculoesqueletica',
    'neurologia',
    'cardiorrespiratoria',
    'oncologia',
    'obstetrica',
    'queimados',
  ]),
  ordem: z.number().int(),
  /** Nome em linguagem simples. */
  nome: z.string().min(1),
  /** Nome curto, para mensagens e menus. */
  nomeCurto: z.string().min(1),
  verbete: verbeteSchema,
  paraQuem: z.array(z.string().min(1)),
  comoFunciona: z.array(z.string().min(1)),
  /** A clínica confirmou que atende esta área? */
  confirmacao: campoSchema(z.literal(true)),
  publicado: z.boolean(),
});

export const convenioSchema = z.object({
  id: z.enum(['particular', 'unimed', 'aapl', 'sus']),
  ordem: z.number().int(),
  nome: z.string().min(1),
  nomeCompleto: z.string().min(1),
  /** A clínica atende por este convênio? (só o nome em texto; nunca logo) */
  atende: campoSchema(z.literal(true)),
  regras: campoSchema(z.string()),
  /** Texto público enquanto o atendimento não estiver confirmado. */
  textoSePendente: z.string().min(1),
});

export type Profissional = z.infer<typeof profissionalSchema>;
export type Atendimento = z.infer<typeof atendimentoSchema>;
export type Convenio = z.infer<typeof convenioSchema>;
