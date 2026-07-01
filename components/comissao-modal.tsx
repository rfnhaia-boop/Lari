"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Calculator, Building2, Users, User } from "lucide-react";
import { calcular } from "@/lib/comissao";

interface Props {
  onClose: () => void;
}

export function ComissaoModal({ onClose }: Props) {
  const [valor, setValor] = useState<string>("");
  const numero = useMemo(() => {
    // trata em reais inteiros: "1000000" → R$ 1.000.000
    const digits = valor.replace(/\D/g, "");
    return digits ? Number(digits) : 0;
  }, [valor]);

  // Formata BRL sem os centavos (fica mais limpo pra valor de imóvel)
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const c = useMemo(() => calcular(numero), [numero]);

  const campo =
    "w-full rounded-xl bg-black/30 px-4 py-3 text-lg text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/50";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-3 backdrop-blur-md sm:p-4">
      <div className="glass-modal flex h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl text-white">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-primary"><Calculator size={20} /></span>
            <h2 className="text-lg font-semibold">Calculadora de comissão</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 space-y-4 overflow-y-auto border-t border-white/10 px-5 py-4">
          {/* Input */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Valor do imóvel</label>
            <input
              type="text"
              inputMode="numeric"
              value={valor ? fmt(numero) : ""}
              onChange={(e) => setValor(e.target.value)}
              placeholder="R$ 0,00"
              className={campo}
              autoFocus
            />
          </div>

          {/* Total (destaque) */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted">Comissão total (6%)</span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary ring-1 ring-primary/30">100%</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-primary">{fmt(c.total)}</p>
          </div>

          {/* Imobiliária */}
          <Linha
            icon={<Building2 size={15} />}
            titulo="Imobiliária"
            legenda="50% do total"
            valor={c.imobiliaria}
          />

          {/* Divisor */}
          <div className="pt-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Repartição operacional
            </p>
            <p className="mb-3 text-xs text-muted">
              Os outros <span className="text-white">50%</span> do total = <span className="text-white">{fmt(c.operacional)}</span> pra dividir entre corretor(es).
            </p>

            {/* Cenário A */}
            <div className="glass mb-2 rounded-2xl p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">Cenário A — mesmo corretor captou e vendeu</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <User size={14} className="text-primary" />
                Corretor recebe <span className="ml-auto text-lg font-semibold text-white">{fmt(c.cenarioA.agente)}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted">100% do operacional (50% dele).</p>
            </div>

            {/* Cenário B */}
            <div className="glass rounded-2xl p-4">
              <div className="mb-2 text-sm font-medium">Cenário B — captador e vendedor diferentes</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <User size={14} className="text-primary" />
                  Vendedor <span className="ml-auto font-semibold text-white">{fmt(c.cenarioB.vendedor)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Users size={14} className="text-primary" />
                  Captador <span className="ml-auto font-semibold text-white">{fmt(c.cenarioB.captador)}</span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted">Vendedor 35% + captador 15% do operacional.</p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-fg transition-transform hover:scale-[1.01]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Linha({
  icon, titulo, legenda, valor,
}: { icon: React.ReactNode; titulo: string; legenda: string; valor: number }) {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-4">
      <span className="text-primary">{icon}</span>
      <div className="flex-1">
        <div className="text-sm font-medium">{titulo}</div>
        <div className="text-[11px] text-muted">{legenda}</div>
      </div>
      <div className="text-lg font-semibold">{fmt(valor)}</div>
    </div>
  );
}
