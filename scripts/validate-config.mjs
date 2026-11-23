// Verifica a config contra as travas de produção (CLAUDE.md §10).
//   ARDELI_MODO=preview  (padrão) → mostra tudo e passa (o site sai com faixa "em revisão" e noindex).
//   ARDELI_MODO=producao           → falha se qualquer trava estiver aberta.

import { modoAtual, travasFalhando, verificarConfig } from '../src/config/travas.ts';

const modo = modoAtual();
const verificacoes = verificarConfig();
const icone = { trava: '✖', aviso: '!', pendente: '·' };

console.log(`validate-config — modo: ${modo}\n`);
for (const nivel of ['trava', 'aviso', 'pendente']) {
  const doNivel = verificacoes.filter((v) => v.nivel === nivel);
  if (!doNivel.length) continue;
  console.log(`${nivel.toUpperCase()}S`);
  for (const v of doNivel) {
    const marca = v.ok ? (nivel === 'trava' ? '✓' : icone[nivel]) : icone[nivel];
    console.log(`  ${marca} ${v.mensagem}`);
  }
  console.log('');
}

const abertas = travasFalhando(verificacoes);
if (abertas.length === 0) {
  console.log('✓ nenhuma trava aberta.');
} else if (modo === 'producao') {
  console.error(
    `✖ PRODUÇÃO TRAVADA: ${abertas.length} trava(s) aberta(s). Ver docs/PENDENCIAS.md.`,
  );
  process.exit(1);
} else {
  console.log(`! ${abertas.length} trava(s) aberta(s): preview liberado; produção travada.`);
}
