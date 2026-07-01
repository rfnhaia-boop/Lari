"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gift, X, Loader2, Volume2, VolumeX } from "lucide-react";
import type { Premio } from "@/lib/roleta";
import { somClique, somGirando, somPremio, somSemBonus, sonsHabilitados, setSons } from "@/lib/sons";

interface RoletaModalProps {
  onClose: () => void;
  onGanhou?: () => void;
}

export function RoletaModal({ onClose, onGanhou }: RoletaModalProps) {
  const [rotation, setRotation] = useState(0);
  const [girando, setGirando] = useState(false);
  const [premio, setPremio] = useState<Premio | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [somOn, setSomOn] = useState(true);

  useEffect(() => setSomOn(sonsHabilitados()), []);
  function toggleSom() {
    const novo = !somOn;
    setSomOn(novo);
    setSons(novo);
    if (novo) somClique(); // feedback ao religar
  }

  async function girar() {
    if (girando || premio) return;
    somClique();
    setGirando(true);
    setErro(null);

    const res = await fetch("/api/roleta/girar", { method: "POST" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErro(d.error ?? "Erro ao girar.");
      setGirando(false);
      return;
    }
    const { premio: p }: { premio: Premio } = await res.json();

    // gira várias voltas + um ângulo aleatório (visual)
    const destino = rotation + 360 * 6 + Math.floor(Math.random() * 360);
    setRotation(destino);
    const pararTique = somGirando();

    setTimeout(() => {
      pararTique();
      setPremio(p);
      setGirando(false);
      if (p.tipo === "nada") somSemBonus();
      else somPremio();
      onGanhou?.();
    }, 4200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-strong relative w-full max-w-sm rounded-3xl p-6 text-center"
      >
        <button
          onClick={toggleSom}
          aria-label={somOn ? "Desativar sons" : "Ativar sons"}
          title={somOn ? "Sons ligados" : "Sons desligados"}
          className="absolute left-4 top-4 z-10 rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white"
        >
          {somOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <button onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4 z-10 rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white">
          <X size={20} />
        </button>

        <div className="mb-1 flex items-center justify-center gap-2 text-primary">
          <Gift size={20} />
          <span className="text-sm font-semibold uppercase tracking-wide">Giro do dia</span>
        </div>
        <h2 className="mb-5 text-xl font-bold text-white">Gire e ganhe um bônus! 🎁</h2>

        {/* Roda (imagem) */}
        <div className="relative mx-auto mb-6 h-64 w-64">
          {/* ponteiro */}
          <div className="absolute left-1/2 top-[-2px] z-10 -translate-x-1/2 drop-shadow">
            <div className="h-0 w-0 border-x-[10px] border-t-[16px] border-x-transparent border-t-primary" />
          </div>
          <img
            src="/roleta.jpg"
            alt="Roleta"
            className="h-64 w-64 select-none rounded-full object-cover shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: "transform 4s cubic-bezier(0.17,0.67,0.12,0.99)",
            }}
            draggable={false}
          />
        </div>

        {premio ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
            <p className="text-lg font-bold text-white">
              {premio.emoji}{" "}
              {premio.tipo === "nada" ? (
                <>Hoje não veio bônus. Volte amanhã!</>
              ) : (
                <>Você ganhou <span className="text-primary">{premio.label}</span>!</>
              )}
            </p>
            <button onClick={onClose} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-fg transition-transform hover:scale-[1.02]">
              Começar a usar
            </button>
          </motion.div>
        ) : (
          <button
            onClick={girar}
            disabled={girando}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-fg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {girando ? <Loader2 size={18} className="animate-spin" /> : <Gift size={18} />}
            {girando ? "Girando..." : "GIRAR"}
          </button>
        )}

        {erro && <p className="mt-3 text-sm text-amber-300">{erro}</p>}
      </motion.div>
    </div>
  );
}
