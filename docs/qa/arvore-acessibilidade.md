# Árvore de acessibilidade (o que o leitor de tela recebe)

Gerado por `pnpm audit-a11y` (Chromium). Serve de roteiro para o teste com NVDA e VoiceOver.

## Agendador (/agendar)

```yaml
- form "Agendar avaliação":
  - heading "Agendar avaliação" [level=2]
  - group "Como você vai ser atendido?":
    - text: Como você vai ser atendido?
    - radio "Particular"
    - text: Particular
    - radio "Unimed"
    - text: Unimed
    - radio "AAPL"
    - text: AAPL
    - radio "SUS"
    - text: SUS
    - radio "Não sei"
    - text: Não sei
  - group "O que te traz? (opcional)":
    - text: O que te traz? (opcional)
    - paragraph: Não precisa contar detalhes. Escolha só o mais próximo, ou pule.
    - radio "Dor (coluna, ombro, joelho…)"
    - text: Dor (coluna, ombro, joelho…)
    - radio "Pós-operatório"
    - text: Pós-operatório
    - radio "Recuperação após lesão"
    - text: Recuperação após lesão
    - radio "Neurológico"
    - text: Neurológico
    - radio "Respiratório"
    - text: Respiratório
    - radio "Outro"
    - text: Outro
    - radio "Prefiro não dizer" [checked]
    - text: Prefiro não dizer
  - group "Quando você prefere?":
    - text: Quando você prefere?
    - group "Período":
      - text: Período
      - radio "Manhã (8h–12h)"
      - text: Manhã (8h–12h)
      - radio "Tarde (12h–18h)"
      - text: Tarde (12h–18h)
      - radio "Noite (18h–20h)"
      - text: Noite (18h–20h)
      - radio "Qualquer horário"
      - text: Qualquer horário
    - group "Dias (segunda a sexta)":
      - text: Dias (segunda a sexta)
      - checkbox "Segunda"
      - text: Segunda
      - checkbox "Terça"
      - text: Terça
      - checkbox "Quarta"
      - text: Quarta
      - checkbox "Quinta"
      - text: Quinta
      - checkbox "Sexta"
      - text: Sexta
  - paragraph: Sua mensagem
  - status "Sua mensagem": Olá! Vim pelo site da Ardeli e quero agendar uma avaliação. Ainda não sei se vai ser particular ou por convênio.
  - button "Enviar pelo WhatsApp (abre o WhatsApp)"
  - paragraph: Não guardamos nada aqui. A mensagem vai do seu celular direto para o WhatsApp da clínica.
```

## Seletor de convênio (home)

```yaml
- group "Como você vai ser atendido?":
  - text: Como você vai ser atendido?
  - radio "Particular"
  - text: Particular
  - radio "Unimed"
  - text: Unimed
  - radio "AAPL"
  - text: AAPL
  - radio "SUS"
  - text: SUS
  - paragraph: Escolha uma opção para ver o que levar e agendar.
- paragraph
```
