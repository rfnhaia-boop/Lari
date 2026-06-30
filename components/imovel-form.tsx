"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";

interface ImovelFormProps {
  onClose: () => void;
  onCreated: () => void;
}

const campo =
  "w-full rounded-lg bg-black/30 px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/50";

export function ImovelForm({ onClose, onCreated }: ImovelFormProps) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    const res = await fetch("/api/imoveis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSalvando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error ?? "Erro ao salvar.");
      return;
    }

    onCreated();
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-3 backdrop-blur-md sm:p-4">
      <form onSubmit={handleSubmit} className="glass-modal flex h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl text-white">
        {/* Cabeçalho fixo */}
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-semibold text-white">Novo imóvel</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Campos (rolável) */}
        <div className="flex-1 space-y-3 overflow-y-auto border-t border-white/10 px-5 py-4">
          <input name="titulo" required placeholder="Título (ex: Apê 2 quartos com varanda)" className={campo} />

          <div className="grid grid-cols-2 gap-3">
            <select name="tipo" defaultValue="apartamento" className={campo}>
              <option value="apartamento" className="bg-surface">Apartamento</option>
              <option value="casa" className="bg-surface">Casa</option>
              <option value="terreno" className="bg-surface">Terreno</option>
              <option value="comercial" className="bg-surface">Comercial</option>
            </select>
            <select name="finalidade" defaultValue="venda" className={campo}>
              <option value="venda" className="bg-surface">Venda</option>
              <option value="aluguel" className="bg-surface">Aluguel</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input name="bairro" placeholder="Bairro" className={campo} />
            <input name="cidade" required placeholder="Cidade" className={campo} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <input name="quartos" type="number" min="0" placeholder="Quartos" className={campo} />
            <input name="banheiros" type="number" min="0" placeholder="Banh." className={campo} />
            <input name="vagas" type="number" min="0" placeholder="Vagas" className={campo} />
            <input name="area" type="number" min="0" step="0.01" placeholder="m²" className={campo} />
          </div>

          <input name="preco" type="number" min="0" step="0.01" placeholder="Preço (R$)" className={campo} />

          <textarea name="descricao" rows={3} placeholder="Observações (acabamento, lazer, diferenciais...)" className={campo + " resize-none"} />

          {erro && <p className="text-sm text-red-400">{erro}</p>}
        </div>

        {/* Ação fixa no rodapé */}
        <div className="border-t border-white/10 p-4">
          <button
            type="submit"
            disabled={salvando}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-fg transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
          >
            {salvando && <Loader2 size={16} className="animate-spin" />}
            {salvando ? "Salvando..." : "Salvar imóvel"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
