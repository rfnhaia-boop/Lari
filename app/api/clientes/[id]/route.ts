import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contaAtual } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const contaId = contaAtual();
  if (!contaId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const data = await req.json();

  const r = await prisma.cliente.updateMany({
    where: { id: params.id, contaId },
    data: {
      ...(data.etapa !== undefined && { etapa: String(data.etapa) }),
      ...(data.nome !== undefined && { nome: String(data.nome) }),
      ...(data.telefone !== undefined && { telefone: String(data.telefone) }),
      ...(data.email !== undefined && { email: String(data.email) }),
      ...(data.instagram !== undefined && { instagram: String(data.instagram) }),
      ...(data.interesse !== undefined && { interesse: String(data.interesse) }),
      ...(data.observacao !== undefined && { observacao: String(data.observacao) }),
      ...(data.historico !== undefined && { historico: String(data.historico) }),
    },
  });
  if (r.count === 0) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

  const cliente = await prisma.cliente.findUnique({ where: { id: params.id } });
  return NextResponse.json(cliente);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const contaId = contaAtual();
  if (!contaId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const r = await prisma.cliente.deleteMany({ where: { id: params.id, contaId } });
  if (r.count === 0) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
