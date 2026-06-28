import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const clientes = await prisma.cliente.findMany({ orderBy: { atualizado: "desc" } });
  return NextResponse.json(clientes);
}

export async function POST(req: Request) {
  const data = await req.json();
  if (!data.nome) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }
  const cliente = await prisma.cliente.create({
    data: {
      nome: String(data.nome),
      telefone: String(data.telefone ?? ""),
      email: String(data.email ?? ""),
      instagram: String(data.instagram ?? ""),
      etapa: String(data.etapa ?? "Novo"),
      interesse: String(data.interesse ?? ""),
      observacao: String(data.observacao ?? ""),
      historico: String(data.historico ?? ""),
    },
  });
  return NextResponse.json(cliente, { status: 201 });
}
