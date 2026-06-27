import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  try {
    const cliente = await prisma.cliente.update({
      where: { id: params.id },
      data: {
        ...(data.etapa !== undefined && { etapa: String(data.etapa) }),
        ...(data.nome !== undefined && { nome: String(data.nome) }),
        ...(data.telefone !== undefined && { telefone: String(data.telefone) }),
        ...(data.email !== undefined && { email: String(data.email) }),
        ...(data.instagram !== undefined && { instagram: String(data.instagram) }),
        ...(data.interesse !== undefined && { interesse: String(data.interesse) }),
        ...(data.observacao !== undefined && { observacao: String(data.observacao) }),
      },
    });
    return NextResponse.json(cliente);
  } catch {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.cliente.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }
}
