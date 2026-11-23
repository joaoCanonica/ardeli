// Registro profissional exibido (COFFITO Art. 48): UMA regra para rodapé, cartão,
// respostas, llms.txt, JSON-LD e travas.
//   pessoal  → "CREFITO-10 nº 444436-F" (número da pessoa, confirmado);
//   clinica  → "Responsável técnica · CREFITO-10 RE005047 (registro da clínica)" — só para
//              a responsável técnica, por ordem expressa do João, enquanto o nº pessoal
//              não chega. NUNCA apresentado como número pessoal;
//   pendente → "CREFITO-10: número em confirmação" (trava a produção).
import { clinica } from '../config/clinica.ts';
import { valorDe } from '../config/tipos.ts';
import type { Profissional } from '../content/schemas.ts';

export interface Registro {
  readonly tipo: 'pessoal' | 'clinica' | 'pendente';
  /** Trecho depois de "Fisioterapeuta · ". */
  readonly curto: string;
  /** Linha completa do Art. 48: "Nome · Fisioterapeuta · …". */
  readonly linha: string;
  /** Só quando é o número da própria pessoa (vai para hasCredential). */
  readonly numeroPessoal: string | null;
}

export function registroDe(
  p: Pick<Profissional, 'nome' | 'profissao' | 'crefito' | 'responsavel' | 'registroDaClinica'>,
): Registro {
  const regiao = valorDe(clinica.empresa.regiaoCrefito) ?? '10';
  const re = valorDe(clinica.empresa.crefitoEmpresa);
  let tipo: Registro['tipo'] = 'pendente';
  let curto = `CREFITO-${regiao}: número em confirmação`;
  let numeroPessoal: string | null = null;
  if (p.crefito.estado === 'confirmado') {
    tipo = 'pessoal';
    numeroPessoal = p.crefito.valor;
    curto = `CREFITO-${regiao} nº ${p.crefito.valor}`;
  } else if (
    p.responsavel &&
    re &&
    p.registroDaClinica?.estado === 'confirmado' &&
    p.registroDaClinica.valor
  ) {
    tipo = 'clinica';
    curto = `Responsável técnica · CREFITO-${regiao} ${re} (registro da clínica)`;
  }
  return { tipo, curto, linha: `${p.nome} · ${p.profissao} · ${curto}`, numeroPessoal };
}
