// Dados cadastrais da clínica. Fonte: docs/ARDELI_INVESTIGACAO_CLIENTE.md §2.
// Faltou dado → opcional() ou bloqueante(); nunca inventar. Ver docs/PENDENCIAS.md.

import { aviso, bloqueante, confirmado, opcional, type Campo } from './tipos.ts';

const FONTE_JOAO = 'João (WAXLO), investigação 22/11/2026';
const FONTE_MAPS = 'ficha do Google Maps, vista em 22/11/2026';
const FONTE_CNES = 'CNES 8422478 / CREFITO-10, dados enviados pelo João';

const LAT = -27.8252972;
const LNG = -50.3256737;
const CID = '10553999783368888140';

export const clinica = {
  nome: confirmado('Ardeli Fisioterapia', FONTE_JOAO),

  empresa: {
    razaoSocial: confirmado('60.246.544 ANDRIELE DA SILVA', FONTE_CNES),
    cnpj: bloqueante('CNPJ completo') as Campo<string>,
    cnes: confirmado('8422478', FONTE_CNES),
    crefitoEmpresa: confirmado('RE005047', `${FONTE_CNES} (registro definitivo desde 15/07/2026)`),
    regiaoCrefito: confirmado('10', FONTE_CNES),
  },

  endereco: confirmado(
    {
      logradouro: 'Av. Dom Pedro II',
      numero: '2700',
      bairro: 'Brusque',
      cidade: 'Lages',
      uf: 'SC',
      cep: '88503-062',
      pais: 'BR',
      /** Uma linha, para texto corrido. */
      linha: 'Av. Dom Pedro II, 2700 – Brusque, Lages – SC, 88503-062',
    },
    FONTE_MAPS,
  ),
  geo: confirmado({ lat: LAT, lng: LNG }, FONTE_MAPS),
  plusCode: confirmado('5MFF+VP Lages, SC', FONTE_MAPS),
  mapsCid: confirmado(CID, FONTE_MAPS),

  links: {
    /** Ficha da clínica no Google Maps. */
    googleMaps: `https://maps.google.com/?cid=${CID}`,
    /** Rota até a clínica (abre o app de mapas). */
    googleMapsRota: `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`,
    waze: `https://waze.com/ul?ll=${LAT},${LNG}&navigate=yes`,
    appleMaps: `https://maps.apple.com/?daddr=${LAT},${LNG}&q=${encodeURIComponent('Ardeli Fisioterapia')}`,
    instagram: 'https://www.instagram.com/ardeli_fisioterapia/',
  },

  whatsapp: confirmado(
    { numero: '5549999281721', exibicao: '(49) 99928-1721' },
    `${FONTE_JOAO} (mesmo número do Studio Ar)`,
  ),
  /** "Ligar" com um toque. Hoje é o número do WhatsApp; falta confirmar se atende ligação. */
  telefone: aviso(
    'telefone para ligação',
    'é o número do WhatsApp; confirmar se a clínica atende ligação nele',
    { e164: '+5549999281721', exibicao: '(49) 99928-1721' },
  ),

  horario: confirmado(
    {
      fusoHorario: 'America/Sao_Paulo',
      /** 1 = segunda … 5 = sexta (ISO). */
      dias: [1, 2, 3, 4, 5] as const,
      abre: '08:00',
      fecha: '20:00',
    },
    `${FONTE_JOAO} + ${FONTE_MAPS}`,
  ),
  /** A clínica fecha nos feriados? Enquanto não confirmar, o site pede para confirmar pelo WhatsApp. */
  fechaEmFeriados: opcional<boolean>(null),

  acessibilidade: opcional<string>(null),
  estacionamento: opcional<string>(null),
  pontoDeReferencia: opcional<string>(null),

  google: {
    /** Link "Pedir avaliações" do Perfil da Empresa. Sem ele, cai na ficha (cid). */
    linkPedirAvaliacoes: bloqueante("link 'Pedir avaliações' do Perfil da Empresa no Google", {
      fallback: 'link da ficha no Google Maps (cid)',
    }) as Campo<string>,
  },

  dominio: opcional<string>(null),
};

export type Clinica = typeof clinica;
