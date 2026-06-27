import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imovelId = searchParams.get("imovelId");

  const anuncios = await prisma.anuncio.findMany({
    where: imovelId ? { imovelId } : undefined,
    orderBy: { criadoEm: "desc" },
    include: { imovel: { select: { titulo: true, cidade: true } } },
  });

  return NextResponse.json(anuncios);
}

export async function POST(req: Request) {
  const data = await req.json();

  if (!data.imovelId || !data.conteudo) {
    return NextResponse.json(
      { error: "imovelId e conteudo são obrigatórios." },
      { status: 400 }
    );
  }

  const anuncio = await prisma.anuncio.create({
    data: {
      imovelId: String(data.imovelId),
      canal: String(data.canal ?? "portal"),
      conteudo: String(data.conteudo),
    },
  });

  return NextResponse.json(anuncio, { status: 201 });
}
