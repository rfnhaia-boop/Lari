import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PREMIOS, sortearIndice, mesmoDia } from "@/lib/roleta";
import { contaAtual } from "@/lib/auth";
import { estadoLimites } from "@/lib/limites";

export async function POST() {
  const contaId = contaAtual();
  if (!contaId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  // garante ciclo mensal em dia
  await estadoLimites(contaId);

  const carteira = await prisma.carteira.upsert({
    where: { contaId },
    update: {},
    create: { contaId },
  });

  if (carteira.ultimoGiro && mesmoDia(new Date(carteira.ultimoGiro), new Date())) {
    return NextResponse.json({ error: "Você já girou hoje. Volte amanhã!" }, { status: 403 });
  }

  const indice = sortearIndice();
  const premio = PREMIOS[indice];

  // aplica o prêmio no limite do mês (ou nos vídeos, ou nada)
  const patch: Record<string, unknown> = { ultimoGiro: new Date() };
  if (premio.tipo === "descricoes") patch.bonusDescricoes = { increment: premio.qtd };
  else if (premio.tipo === "interacoes") patch.bonusInteracoes = { increment: premio.qtd };
  else if (premio.tipo === "video") patch.videos = { increment: premio.qtd };

  await prisma.carteira.update({ where: { contaId }, data: patch });

  const est = await estadoLimites(contaId);
  return NextResponse.json({ indice, premio, limites: est });
}
