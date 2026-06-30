import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mesmoDia } from "@/lib/roleta";
import { contaAtual } from "@/lib/auth";

export async function GET() {
  const contaId = contaAtual();
  if (!contaId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const carteira = await prisma.carteira.upsert({
    where: { contaId },
    update: {},
    create: { contaId },
  });

  const podeGirar = !carteira.ultimoGiro || !mesmoDia(new Date(carteira.ultimoGiro), new Date());

  return NextResponse.json({ ...carteira, podeGirar });
}
