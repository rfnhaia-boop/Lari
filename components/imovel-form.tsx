"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

interface ImovelFormProps {
  onClose: () => void;
  onCreated: () => void;
}

const campoBase =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-slate-100 placeholder:text-muted focus:border-primary/60 focus:outline-none";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in-up">
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Novo imóvel</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1 text-muted transition-colors hover:bg-border hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input name="titulo" required placeholder="Título (ex: Apê 2 quartos com varanda)" className={campoBase} />

          <div className="grid grid-cols-2 gap-3">
            <select name="tipo" defaultValue="apartamento" className={campoBase}>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
            <select name="finalidade" defaultValue="venda" className={campoBase}>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input name="bairro" placeholder="Bairro" className={campoBase} />
            <input name="cidade" required placeholder="Cidade" className={campoBase} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <input name="quartos" type="number" min="0" placeholder="Quartos" className={campoBase} />
            <input name="banheiros" type="number" min="0" placeholder="Banh." className={campoBase} />
            <input name="vagas" type="number" min="0" placeholder="Vagas" className={campoBase} />
            <input name="area" type="number" min="0" step="0.01" placeholder="m²" className={campoBase} />
          </div>

          <input name="preco" type="number" min="0" step="0.01" placeholder="Preço (R$)" className={campoBase} />

          <textarea name="descricao" rows={3} placeholder="Observações (acabamento, lazer, diferenciais...)" className={campoBase + " resize-none"} />

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-muted transition-colors hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {salvando && <Loader2 size={16} className="animate-spin" />}
              Salvar imóvel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
