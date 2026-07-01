// Prêmios da roleta diária.
// Conforme o doc do sócio: 4 prêmios (vídeo, +5 interações, +1 descrição, sem bônus).
// Cada bônus soma no LIMITE MENSAL da conta (não é crédito isolado).

export type TipoPremio = "video" | "interacoes" | "descricoes" | "nada";

export interface Premio {
  tipo: TipoPremio;
  qtd: number; // pra "nada" = 0
  label: string;
  emoji: string;
  peso: number; // chance relativa de sair
}

export const PREMIOS: Premio[] = [
  { tipo: "interacoes", qtd: 5, label: "+5 interações com a IA",     emoji: "💬", peso: 4 },
  { tipo: "descricoes", qtd: 1, label: "+1 descrição de imóvel",     emoji: "📝", peso: 3 },
  { tipo: "video",      qtd: 1, label: "1 vídeo do imóvel com IA",   emoji: "🎬", peso: 2 },
  { tipo: "nada",       qtd: 0, label: "Sem bônus hoje",             emoji: "🎲", peso: 1 },
];

export function sortearIndice(): number {
  const total = PREMIOS.reduce((s, p) => s + p.peso, 0);
  let r = Math.random() * total;
  for (let i = 0; i < PREMIOS.length; i++) {
    r -= PREMIOS[i].peso;
    if (r <= 0) return i;
  }
  return PREMIOS.length - 1;
}

export function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
