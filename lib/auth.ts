import { cookies } from "next/headers";
import crypto from "crypto";

// Login simples, 1 conta por instância (definida no .env: LARI_USUARIO / LARI_SENHA).
// Sem e-mail, sem cadastro. Cada imobiliária = uma instância = um login.

export const COOKIE = "lari_auth";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

// Há credenciais configuradas? Se não, o app fica aberto (modo dev/sem trava).
export function autenticacaoAtiva(): boolean {
  return Boolean(process.env.LARI_USUARIO && process.env.LARI_SENHA);
}

// Token derivado da senha — não guardamos a senha no cookie.
export function tokenEsperado(): string {
  const u = process.env.LARI_USUARIO || "";
  const s = process.env.LARI_SENHA || "";
  return crypto.createHash("sha256").update(`${u}:${s}:lari-auth-v1`).digest("hex");
}

export function checaCredenciais(usuario: string, senha: string): boolean {
  return (
    autenticacaoAtiva() &&
    usuario === process.env.LARI_USUARIO &&
    senha === process.env.LARI_SENHA
  );
}

// Está logado? (lê o cookie). Roda no servidor (Server Component / Route Handler).
export function autorizado(): boolean {
  if (!autenticacaoAtiva()) return true; // sem credenciais = liberado
  return cookies().get(COOKIE)?.value === tokenEsperado();
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};
