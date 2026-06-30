import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verificarSenha, assinarSessao, COOKIE, cookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, senha } = await req.json();
  const mail = String(email ?? "").toLowerCase().trim();

  const usuario = await prisma.usuario.findUnique({ where: { email: mail } });
  if (!usuario || !verificarSenha(String(senha ?? ""), usuario.senhaHash)) {
    return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    COOKIE,
    assinarSessao({ usuarioId: usuario.id, contaId: usuario.contaId }),
    cookieOptions
  );
  return res;
}
