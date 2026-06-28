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
  historico: string;
  criadoEm: string;
  atualizado: string;
}

// Histórico de contatos: armazenado como JSON no campo `historico`
export interface ContatoHist {
  data: string; // ISO
  texto: string;
}

export function parseHistorico(raw: string): ContatoHist[] {
  try {
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? arr.filter((x) => x && typeof x.texto === "string") : [];
  } catch {
    return [];
  }
}

export function fmtDataCurta(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
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
