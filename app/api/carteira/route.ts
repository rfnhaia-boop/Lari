import { NextResponse } from "next/server";
import { contaAtual } from "@/lib/auth";
import { estadoLimites } from "@/lib/limites";
import { mesmoDia } from "@/lib/roleta";

export async function GET() {
  const contaId = contaAtual();
  if (!contaId) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const est = await estadoLimites(contaId);
  if (!est) return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });

  const podeGirar = !est.ultimoGiro || !mesmoDia(new Date(est.ultimoGiro), new Date());

  // Mantém a forma antiga (videos + podeGirar) pra não quebrar o hub,
  // e adiciona os limites novos.
  return NextResponse.json({
    videos: est.videos,
    podeGirar,
    limites: est,
  });
}
