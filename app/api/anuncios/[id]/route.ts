import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { autorizado } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!autorizado()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    await prisma.anuncio.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Anúncio não encontrado." },
      { status: 404 }
    );
  }
}
