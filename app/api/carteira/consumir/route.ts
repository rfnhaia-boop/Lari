import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contaAtual } from "@/lib/auth";

// Consome 1 crédito de um tipo (ex: videos). Não deixa ficar negativo.
export async function POST(req: Request) {
  const contaId = contaAtual();
  if (!contaId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { tipo } = await req.json();
  const campo = String(tipo ?? "videos");

  const carteira = await prisma.carteira.upsert({
    where: { contaId },
    update: {},
    create: { contaId },
  });

  const atual = (carteira as Record<string, unknown>)[campo];
  if (typeof atual !== "number" || atual <= 0) {
    return NextResponse.json({ error: "Sem créditos." }, { status: 403 });
  }

  const atualizada = await prisma.carteira.update({
    where: { contaId },
    data: { [campo]: { decrement: 1 } },
  });

  return NextResponse.json(atualizada);
}
