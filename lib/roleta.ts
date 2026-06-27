// Prêmios da roleta diária. A ordem define os segmentos da roda (mesmo índice no servidor e no cliente).

export type TipoPremio = "videos" | "leads" | "descricoes";

export interface Premio {
  tipo: TipoPremio;
  qtd: number;
  label: string;
  emoji: string;
  peso: number; // chance relativa de sair
}

export const PREMIOS: Premio[] = [
  { tipo: "videos", qtd: 2, label: "2 gerações de vídeo", emoji: "🎬", peso: 4 },
  { tipo: "videos", qtd: 1, label: "1 geração de vídeo", emoji: "🎬", peso: 4 },
  { tipo: "videos", qtd: 3, label: "3 gerações de vídeo", emoji: "🎬", peso: 2 },
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
