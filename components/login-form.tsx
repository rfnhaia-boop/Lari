"use client";

import { useState } from "react";
import { Home, Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginForm() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
    });
    if (res.ok) {
      window.location.href = "/";
    } else {
      setErro("Usuário ou senha incorretos.");
      setEnviando(false);
    }
  }

  const campo =
    "w-full rounded-xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/60";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Fundo + overlay (igual ao hub) */}
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

      <form onSubmit={entrar} className="glass-modal w-full max-w-sm rounded-3xl p-7 text-white">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-fg shadow-lg">
            <Home size={26} />
          </div>
          <h1 className="text-xl font-bold">Lari</h1>
          <p className="mt-1 text-sm text-muted">Acesso da imobiliária</p>
        </div>

        <div className="space-y-3">
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Usuário"
            autoComplete="username"
            autoFocus
            className={campo}
          />
          <div className="relative">
            <input
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              type={verSenha ? "text" : "password"}
              placeholder="Senha"
              autoComplete="current-password"
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
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
