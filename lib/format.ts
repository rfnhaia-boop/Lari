export function formatBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

export interface Imovel {
  id: string;
  titulo: string;
  tipo: string;
  finalidade: string;
  bairro: string;
  cidade: string;
  quartos: number;
  banheiros: number;
  vagas: number;
  area: number;
  preco: number;
  descricao: string;
  criadoEm: string;
}

export interface Anuncio {
  id: string;
  canal: string;
  conteudo: string;
  imovelId: string;
  criadoEm: string;
  imovel?: { titulo: string; cidade: string };
}

export const CANAIS: { id: string; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "portal", label: "OLX / Portal" },
];
