export const ETAPAS = ["Novo", "Contato", "Visita", "Proposta", "Fechado"] as const;
export type Etapa = (typeof ETAPAS)[number];

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  instagram: string;
  etapa: string;
  interesse: string;
  observacao: string;
  criadoEm: string;
  atualizado: string;
}

// Monta links de contato
export function linkWhatsApp(tel: string) {
  const num = tel.replace(/\D/g, "");
  return num ? `https://wa.me/${num.length <= 11 ? "55" + num : num}` : "";
}
export function linkEmail(email: string) {
  return email ? `mailto:${email}` : "";
}
export function linkInstagram(handle: string) {
  const h = handle.replace(/^@/, "").trim();
  return h ? `https://instagram.com/${h}` : "";
}
