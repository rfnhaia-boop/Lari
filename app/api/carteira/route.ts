import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mesmoDia } from "@/lib/roleta";
import { autorizado } from "@/lib/auth";

export async function GET() {
  if (!autorizado()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const carteira = await prisma.carteira.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  const podeGirar = !carteira.ultimoGiro || !mesmoDia(new Date(carteira.ultimoGiro), new Date());

  return NextResponse.json({ ...carteira, podeGirar });
}
