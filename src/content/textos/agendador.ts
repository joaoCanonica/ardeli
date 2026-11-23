// Textos do agendador (/agendar e a gaveta) e da página /avaliar.
import { f, type Meta, type VerbeteTexto } from './tipos.ts';

export const agendador = {
  meta: {
    titulo: 'Agendar avaliação de fisioterapia · Ardeli, Lages',
    descricao:
      'Agende sua avaliação de fisioterapia na Ardeli, no Brusque, em Lages: particular, Unimed ou AAPL. Escolha o período e envie pelo WhatsApp.',
  } satisfies Meta,
  verbete: {
    palavra: 'agendar',
    classe: 'v.t.d.',
    acepcoes: [
      f('Marcar a primeira avaliação com a fisioterapeuta.', 'pratica'),
      f('Aqui você responde três perguntas e a mensagem para o WhatsApp sai pronta.', 'site'),
    ],
  } satisfies VerbeteTexto,
  titulo: 'Agendar avaliação',
  passos: {
    forma: 'Como você vai ser atendido?',
    motivo: 'O que te traz?',
    motivoOpcional: 'opcional',
    motivoDica: f('Não precisa contar detalhes. Escolha só o mais próximo, ou pule.', 'site'),
    semMotivo: 'Prefiro não dizer',
    quando: 'Quando você prefere?',
    periodo: 'Período',
    dias: 'Dias (segunda a sexta)',
  },
  previa: 'Sua mensagem',
  enviar: 'Enviar pelo WhatsApp',
  fechar: 'Fechar',
  aviso: f(
    'Não guardamos nada aqui. A mensagem vai do seu celular direto para o WhatsApp da clínica.',
    'site',
  ),
  semJs: f(
    'Sem JavaScript, a mensagem vai em formato geral. Você completa os detalhes na conversa.',
    'site',
  ),
  escolhaForma: 'Escolha como você vai ser atendido.',
} as const;
