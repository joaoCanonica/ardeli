# Teste SIMULADO com perfil 60+

Gerado por `scripts/teste-60-simulado.mjs` em 2026-11-23. **É uma simulação** (robô com o perfil abaixo); o teste com uma pessoa real fica com o João (docs/QA.md §4).

**Perfil:** celular Android simples (Moto G4, tela de 360 px), rede 3G (750 kbps, 300 ms), letra aumentada (A++), uma ação por vez.
**Tempo humano estimado:** 4 s para ler cada tela + 1.5 s por toque + 2 s por rolagem (estimativa conservadora para 60+).

Carregamento da home em 3G: primeira pintura em 0.5 s, página completa em 1.7 s. Classes do aparelho: `rede-lenta`; fonte usada: Roboto.

| Tarefa | Concluiu? | Toques | Rolagens | Tempo humano estimado | Atritos |
|---|---|---|---|---|---|
| Aumentar a letra (A+ duas vezes) | sim | 4 | 0 | ~26 s | nenhum |
| Descobrir se atende Unimed | sim | 0 | 1 | ~6 s | "Unimed" não aparece na primeira tela com letra aumentada |
| Agendar terça à tarde pela Unimed | sim | 5 | 2 | ~36 s | nenhum |
| Achar o endereço e o botão de ligar | sim | 0 | 1 | ~6 s | nenhum |

- Aumentar a letra (A+ duas vezes): texto do corpo ficou em 22px
- Agendar terça à tarde pela Unimed: mensagem: “Olá! Vim pelo site da Ardeli e quero agendar uma avaliação. Atendimento: Unimed. Prefiro à tarde, terça.”

## Capturas

- Aumentar a letra (A+ duas vezes): `docs/qa/teste-60/01-letra-maior.jpg`
- Descobrir se atende Unimed: `docs/qa/teste-60/02-capa.jpg`
- Agendar terça à tarde pela Unimed: `docs/qa/teste-60/03-gaveta-aberta.jpg`
- Agendar terça à tarde pela Unimed: `docs/qa/teste-60/04-escolhas-feitas.jpg`
- Achar o endereço e o botão de ligar: `docs/qa/teste-60/05-endereco-e-ligar.jpg`
