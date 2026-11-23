// Eventos de funil, sem cookie e sem texto livre. Só nomes e valores de listas fechadas.
// Roda no navegador; não importa config (recebe a config por <meta name="ardeli-medicao">).

export const EVENTOS = {
  clique_agendar: {
    forma: ['particular', 'unimed', 'aapl', 'sus', 'nao-sei', 'nenhuma'],
    origem: [
      'cabecalho',
      'capa',
      'avaliacao',
      'convenio',
      'botao-fixo',
      'convenios',
      'atendimento',
      'primeira-avaliacao',
      'outro',
    ],
  },
  agendador_enviado: {
    forma: ['particular', 'unimed', 'aapl', 'sus', 'nao-sei'],
    motivo: [
      'dor',
      'pos-operatorio',
      'recuperacao-lesao',
      'neurologico',
      'respiratorio',
      'outro',
      'nenhum',
    ],
    passo: ['1', '2', '3'],
  },
  clique_ligar: {},
  clique_convenio: { convenio: ['particular', 'unimed', 'aapl', 'sus'] },
  clique_avaliar: { origem: ['qr', 'site', 'whatsapp', 'direto'] },
  clique_como_chegar: { destino: ['google', 'waze', 'apple', 'pagina'] },
} as const;

export type NomeEvento = keyof typeof EVENTOS;
type Props = Record<string, string>;

/** Mantém só chaves e valores permitidos para o evento (nada de texto livre). */
export function limparProps(nome: NomeEvento, props: Props = {}): Props {
  const permitidas = EVENTOS[nome] as Record<string, readonly string[]>;
  const limpo: Props = {};
  for (const [k, v] of Object.entries(props)) {
    if (permitidas[k]?.includes(v)) limpo[k] = v;
  }
  return limpo;
}

interface ConfigCliente {
  ativo: boolean;
  endpoint: string;
  dominio: string | null;
}

function config(): ConfigCliente {
  try {
    const m = document.querySelector<HTMLMetaElement>('meta[name="ardeli-medicao"]');
    return m
      ? (JSON.parse(m.content) as ConfigCliente)
      : { ativo: false, endpoint: '', dominio: null };
  } catch {
    return { ativo: false, endpoint: '', dominio: null };
  }
}

declare global {
  interface Window {
    __ardeliEventos?: { nome: string; props: Props }[];
  }
}

export function medir(nome: NomeEvento, props: Props = {}): void {
  const p = limparProps(nome, props);
  // Registro só na memória da página (testes e depuração); some ao sair.
  (window.__ardeliEventos ??= []).push({ nome, props: p });
  const c = config();
  if (!c.ativo || !c.dominio || !navigator.sendBeacon) return;
  const corpo = JSON.stringify({
    name: nome,
    // Só o caminho: sem query string (?motivo=…) nem hash.
    url: `${location.origin}${location.pathname}`,
    domain: c.dominio,
    props: p,
  });
  navigator.sendBeacon(c.endpoint, new Blob([corpo], { type: 'application/json' }));
}
