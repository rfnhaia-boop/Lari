import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashSenha, assinarSessao, COOKIE, cookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const { imobiliaria, nome, email, senha } = await req.json();
  const mail = String(email ?? "").toLowerCase().trim();

  if (!imobiliaria || !nome || !mail || !senha) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }
  if (String(senha).length < 6) {
    return NextResponse.json({ error: "A senha precisa de pelo menos 6 caracteres." }, { status: 400 });
  }

  const existe = await prisma.usuario.findUnique({ where: { email: mail } });
  if (existe) {
    return NextResponse.json({ error: "Já existe uma conta com esse e-mail." }, { status: 409 });
  }

  // Cria a conta (imobiliária) + 1º usuário (dono) + carteira da conta
  const conta = await prisma.conta.create({
    data: {
      nome: String(imobiliaria),
      carteira: { create: {} },
      usuarios: {
        create: {
          nome: String(nome),
          email: mail,
          senhaHash: hashSenha(String(senha)),
          papel: "admin",
        },
      },
    },
    include: { usuarios: true },
  });

  const usuario = conta.usuarios[0];
  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    COOKIE,
    assinarSessao({ usuarioId: usuario.id, contaId: conta.id }),
    cookieOptions
  );
  return res;
}
