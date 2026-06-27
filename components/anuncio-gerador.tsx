"use client";

import { useState } from "react";
import { useCompletion } from "ai/react";
import { X, Sparkles, Copy, Check, Save, Loader2 } from "lucide-react";
import { CANAIS, type Imovel } from "@/lib/format";

interface AnuncioGeradorProps {
  imovel: Imovel;
  onClose: () => void;
}

export function AnuncioGerador({ imovel, onClose }: AnuncioGeradorProps) {
  const [canal, setCanal] = useState("instagram");
  const [copiado, setCopiado] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/anuncios/gerar",
  });

  async function gerar() {
    setSalvo(false);
    setCopiado(false);
    await complete("", { body: { imovelId: imovel.id, canal } });
  }

  async function copiar() {
    await navigator.clipboard.writeText(completion);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  async function salvar() {
    setSalvando(true);
    await fetch("/api/anuncios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imovelId: imovel.id, canal, conteudo: completion }),
    });
    setSalvando(false);
    setSalvo(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in-up">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <div>
              <h2 className="text-sm font-semibold text-white">Gerar anúncio</h2>
              <p className="text-xs text-muted">{imovel.titulo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1 text-muted transition-colors hover:bg-border hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Seletor de canal */}
        <div className="flex items-center gap-2 border-b border-border p-5">
          <div className="flex flex-1 gap-2">
            {CANAIS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCanal(c.id)}
                className={
                  "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors " +
                  (canal === c.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted hover:text-white")
                }
              >
                {c.label}
              </button>
            ))}
          </div>
          <button
            onClick={gerar}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Gerar
          </button>
        </div>

        {/* Resultado */}
        <div className="flex-1 overflow-y-auto p-5">
          {completion ? (
            <div className="whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm leading-relaxed text-slate-100">
              {completion}
              {isLoading && <span className="ml-0.5 inline-block animate-blink">▊</span>}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-center text-sm text-muted">
              Escolha o canal e clique em <span className="mx-1 font-medium text-primary">Gerar</span> para a IA criar o anúncio.
            </div>
          )}
        </div>

        {/* Ações */}
        {completion && !isLoading && (
          <div className="flex justify-end gap-2 border-t border-border p-5">
            <button
              onClick={copiar}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-slate-200 transition-colors hover:border-primary/50"
            >
              {copiado ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
              {copiado ? "Copiado!" : "Copiar"}
            </button>
            <button
              onClick={salvar}
              disabled={salvando || salvo}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
            >
              {salvando ? <Loader2 size={16} className="animate-spin" /> : salvo ? <Check size={16} /> : <Save size={16} />}
              {salvo ? "Salvo!" : "Salvar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
