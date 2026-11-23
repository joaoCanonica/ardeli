// NAP (nome, endereço, telefone): UMA fonte para o site inteiro, o JSON-LD e o llms.txt.
// Onde o NAP aparece como dado (rodapé, "como chegar", cartaz, llms.txt), o texto é
// exatamente este. scripts/audit-seo.mjs falha se encontrar variação.
import { clinica } from '../../config/clinica.ts';
import { exigir, valorDe } from '../../config/tipos.ts';

export interface Nap {
  readonly nome: string;
  /** Endereço em uma linha, idêntico em todo lugar. */
  readonly endereco: string;
  /** Telefone como aparece para a pessoa. */
  readonly telefone: string;
  /** Telefone em E.164 (tel: e JSON-LD). */
  readonly telefoneE164: string;
  readonly logradouro: string;
  readonly numero: string;
  readonly bairro: string;
  readonly cidade: string;
  readonly uf: string;
  readonly cep: string;
  readonly pais: string;
}

export function nap(): Nap {
  const nome = exigir(clinica.nome, 'NAP: nome');
  const e = exigir(clinica.endereco, 'NAP: endereço');
  // Telefone: hoje é o número do WhatsApp (aviso na config); sem ele, o WhatsApp.
  const tel = valorDe(clinica.telefone);
  const wa = exigir(clinica.whatsapp, 'NAP: WhatsApp');
  return {
    nome,
    endereco: e.linha,
    telefone: tel?.exibicao ?? wa.exibicao,
    telefoneE164: tel?.e164 ?? `+${wa.numero}`,
    logradouro: e.logradouro,
    numero: e.numero,
    bairro: e.bairro,
    cidade: e.cidade,
    uf: e.uf,
    cep: e.cep,
    pais: e.pais,
  };
}
