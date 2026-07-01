import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contaAtual } from "@/lib/auth";

// Consome 1 vídeo (recurso especial, crédito isolado).
// Descrições/interações são consumidas via lib/limites.ts (bloqueio por limite).
export async function POST() {
  const contaId = contaAtual();
  if (!contaId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const carteira = await prisma.carteira.upsert({
    where: { contaId },
    update: {},
    create: { contaId },
  });

  if (carteira.videos <= 0) {
    return NextResponse.json({ error: "Sem créditos." }, { status: 403 });
  }

  const atualizada = await prisma.carteira.update({
    where: { contaId },
    data: { videos: { decrement: 1 } },
  });

  return NextResponse.json(atualizada);
}
