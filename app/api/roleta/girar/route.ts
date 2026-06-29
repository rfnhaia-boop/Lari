import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PREMIOS, sortearIndice, mesmoDia } from "@/lib/roleta";
import { autorizado } from "@/lib/auth";

export async function POST() {
  if (!autorizado()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const carteira = await prisma.carteira.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  if (carteira.ultimoGiro && mesmoDia(new Date(carteira.ultimoGiro), new Date())) {
    return NextResponse.json({ error: "Você já girou hoje. Volte amanhã!" }, { status: 403 });
  }

  const indice = sortearIndice();
  const premio = PREMIOS[indice];

  const atualizada = await prisma.carteira.update({
    where: { id: "default" },
    data: {
      [premio.tipo]: { increment: premio.qtd },
      ultimoGiro: new Date(),
    },
  });

  return NextResponse.json({ indice, premio, carteira: atualizada });
}
