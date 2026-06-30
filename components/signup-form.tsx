"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Eye, EyeOff, Loader2 } from "lucide-react";

export function SignupForm() {
  const [f, setF] = useState({ imobiliaria: "", nome: "", email: "", senha: "" });
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    if (res.ok) {
      window.location.href = "/";
    } else {
      const j = await res.json().catch(() => ({}));
      setErro(j.error || "Não foi possível criar a conta.");
      setEnviando(false);
    }
  }

  const campo =
    "w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/60";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div
        className="fixed inset-0 -z-30 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-background/50 via-background/65 to-background/90" />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="glow-light absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-[90px]" />
        <div className="glow-light glow-delay absolute bottom-10 left-1/2 h-40 w-[28rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[80px]" />
      </div>

      <form onSubmit={criar} className="glass-modal w-full max-w-sm rounded-3xl p-7 text-white">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-fg shadow-lg">
            <Home size={26} />
          </div>
          <h1 className="text-xl font-bold">Criar conta</h1>
          <p className="mt-1 text-sm text-muted">Comece a usar a Lari na sua imobiliária</p>
        </div>

        <div className="space-y-3">
          <input value={f.imobiliaria} onChange={(e) => set("imobiliaria", e.target.value)} placeholder="Nome da imobiliária" className={campo} />
          <input value={f.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Seu nome" autoComplete="name" className={campo} />
          <input value={f.email} onChange={(e) => set("email", e.target.value)} type="email" placeholder="E-mail" autoComplete="email" className={campo} />
          <div className="relative">
            <input
              value={f.senha}
              onChange={(e) => set("senha", e.target.value)}
              type={verSenha ? "text" : "password"}
              placeholder="Senha (mín. 6 caracteres)"
              autoComplete="new-password"
              className={campo + " pr-11"}
            />
            <button
              type="button"
              onClick={() => setVerSenha((v) => !v)}
              aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
            >
              {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {erro && <p className="mt-3 text-center text-sm text-red-300">{erro}</p>}

        <button
          disabled={enviando}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-fg transition-transform hover:scale-[1.01] disabled:opacity-50"
        >
          {enviando ? <Loader2 size={16} className="animate-spin" /> : null}
          {enviando ? "Criando..." : "Criar conta"}
        </button>

        <p className="mt-5 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}
