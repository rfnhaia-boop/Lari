import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contaAtual } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const contaId = contaAtual();
  if (!contaId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const r = await prisma.imovel.deleteMany({ where: { id: params.id, contaId } });
  if (r.count === 0) return NextResponse.json({ error: "Imóvel não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
