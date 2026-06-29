import { NextResponse } from "next/server";
import { checaCredenciais, tokenEsperado, COOKIE, cookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const { usuario, senha } = await req.json();
  if (!checaCredenciais(String(usuario ?? ""), String(senha ?? ""))) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, tokenEsperado(), cookieOptions);
  return res;
}
