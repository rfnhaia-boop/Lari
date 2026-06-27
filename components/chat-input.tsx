"use client";

import { useRef, useEffect, useState } from "react";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChatInput({ input, isLoading, onChange, onSubmit }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focado, setFocado] = useState(false);

  // Auto-resize do textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
    }
  }

  const podeEnviar = !isLoading && input.trim().length > 0;

  return (
    <div className="relative">
      {/* Brilho atrás da barra, acende no foco */}
      <div
        className={
          "pointer-events-none absolute -inset-1 rounded-[28px] bg-primary/40 blur-xl transition-opacity duration-500 " +
          (focado ? "opacity-100" : "opacity-40")
        }
      />

      <form
        onSubmit={onSubmit}
        className={
          "glass-strong relative flex items-end gap-2 rounded-[26px] p-2 pl-4 transition-all duration-300 " +
          (focado
            ? "border-primary/60 ring-2 ring-primary/30"
            : "border-white/10")
        }
      >
        {/* Ícone da Lari */}
        <Sparkles
          size={18}
          className={
            "mb-2.5 shrink-0 transition-colors " +
            (focado ? "text-primary" : "text-muted")
          }
        />

        <textarea
          ref={textareaRef}
          value={input}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          rows={1}
          placeholder="Fala com a Lari..."
          className="max-h-40 flex-1 resize-none bg-transparent py-2.5 text-[15px] text-slate-100 placeholder:text-muted focus:outline-none"
        />

        <button
          type="submit"
          disabled={!podeEnviar}
          aria-label="Enviar mensagem"
          className={
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 " +
            (podeEnviar
              ? "bg-primary text-primary-fg shadow-[0_0_20px_rgba(34,197,140,0.5)] hover:scale-105 active:scale-95"
              : "bg-white/10 text-muted")
          }
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ArrowUp size={20} strokeWidth={2.5} />
          )}
        </button>
      </form>
    </div>
  );
}
