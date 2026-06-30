import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contaAtual } from "@/lib/auth";

export async function GET() {
  const contaId = contaAtual();
  if (!contaId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const imoveis = await prisma.imovel.findMany({
    where: { contaId },
    orderBy: { criadoEm: "desc" },
  });
  return NextResponse.json(imoveis);
}

export async function POST(req: Request) {
  const contaId = contaAtual();
  if (!contaId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const data = await req.json();

  if (!data.titulo || !data.cidade) {
    return NextResponse.json(
      { error: "Título e cidade são obrigatórios." },
      { status: 400 }
    );
  }

  const imovel = await prisma.imovel.create({
    data: {
      contaId,
      titulo: String(data.titulo),
      tipo: String(data.tipo ?? "apartamento"),
      finalidade: String(data.finalidade ?? "venda"),
      bairro: String(data.bairro ?? ""),
      cidade: String(data.cidade),
      quartos: Number(data.quartos ?? 0),
      banheiros: Number(data.banheiros ?? 0),
      vagas: Number(data.vagas ?? 0),
      area: Number(data.area ?? 0),
      preco: Number(data.preco ?? 0),
      descricao: String(data.descricao ?? ""),
    },
  });

  return NextResponse.json(imovel, { status: 201 });
}
