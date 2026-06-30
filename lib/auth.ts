import { cookies } from "next/headers";
import crypto from "crypto";

// Autenticação multi-tenant: usuários no banco (e-mail + senha), sessão por
// cookie assinado contendo usuarioId + contaId. É o contaId que isola os dados.

export const COOKIE = "lari_sessao";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias
const SECRET = process.env.AUTH_SECRET || "dev-secret-troque-em-producao";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

// ---------- Senha (scrypt nativo, sem dependência) ----------
export function hashSenha(senha: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(senha, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verificarSenha(senha: string, armazenado: string): boolean {
  const [saltHex, hashHex] = (armazenado || "").split(":");
  if (!saltHex || !hashHex) return false;
  const hash = Buffer.from(hashHex, "hex");
  const teste = crypto.scryptSync(senha, Buffer.from(saltHex, "hex"), 64);
  return hash.length === teste.length && crypto.timingSafeEqual(hash, teste);
}

// ---------- Sessão (cookie assinado com HMAC) ----------
export interface Sessao {
  usuarioId: string;
  contaId: string;
}

export function assinarSessao(s: Sessao): string {
  const payload = Buffer.from(JSON.stringify(s)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function lerSessao(): Sessao | null {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const esperado = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(esperado);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as Sessao;
  } catch {
    return null;
  }
}

export function autorizado(): boolean {
  return lerSessao() !== null;
}

// Conta do usuário logado — usada pelas APIs pra isolar os dados (Módulo 4).
export function contaAtual(): string | null {
  return lerSessao()?.contaId ?? null;
}
