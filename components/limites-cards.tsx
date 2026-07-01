"use client";

import { FileText, MessageCircle } from "lucide-react";

interface Recurso {
  usadas: number;
  base: number;
  bonus: number;
  limite: number;
  restante: number;
}

interface Limites {
  descricoes: Recurso;
  interacoes: Recurso;
}

// Barra + contador X/Y. Se ficou acima do limite (não deve, mas por segurança), clampa.
function CardLimite({
  icon,
  titulo,
  r,
}: {
  icon: React.ReactNode;
  titulo: string;
  r: Recurso;
}) {
  const pct = r.limite > 0 ? Math.min(100, Math.round((r.usadas / r.limite) * 100)) : 0;
  const cor = pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-amber-300" : "bg-primary";

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <span className="text-sm font-medium text-white">{titulo}</span>
        </div>
        <span className="text-xs text-muted">
          <span className="font-semibold text-white">{r.usadas}</span> / {r.limite}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div className={"h-full rounded-full transition-all " + cor} style={{ width: pct + "%" }} />
      </div>

      {r.bonus > 0 && (
        <div className="mt-2 text-[11px] text-muted">
          <span className="text-primary">+{r.bonus}</span> de bônus da roleta neste mês
        </div>
      )}
    </div>
  );
}

export function LimitesCards({ limites }: { limites: Limites | null | undefined }) {
  if (!limites) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <CardLimite icon={<FileText size={16} />} titulo="Descrições de imóveis" r={limites.descricoes} />
      <CardLimite icon={<MessageCircle size={16} />} titulo="Assistente de IA" r={limites.interacoes} />
    </div>
  );
}
