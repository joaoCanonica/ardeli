// Coleções do site. Os dados ficam em src/content/dados/*.ts (os mesmos que
// os scripts de trava leem) e são validados pelos schemas de src/content/schemas.ts.
import { defineCollection } from 'astro:content';
import { atendimentos } from './content/dados/atendimentos.ts';
import { convenios } from './content/dados/convenios.ts';
import { profissionais } from './content/dados/profissionais.ts';
import { atendimentoSchema, convenioSchema, profissionalSchema } from './content/schemas.ts';

export const collections = {
  profissionais: defineCollection({ loader: () => profissionais, schema: profissionalSchema }),
  atendimentos: defineCollection({ loader: () => atendimentos, schema: atendimentoSchema }),
  convenios: defineCollection({ loader: () => convenios, schema: convenioSchema }),
};
