// Script ainda não implementado. Sai com erro de propósito:
// uma auditoria que não roda nunca pode parecer "verde".
export function naoImplementado(nome, sessao) {
  console.error(`✖ ${nome}: ainda não implementado (previsto no ${sessao}).`);
  console.error('  Este script falha de propósito até existir de verdade.');
  process.exit(2);
}
