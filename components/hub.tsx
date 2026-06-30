"use client";

import { useChat } from "ai/react";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Megaphone,
  Video,
  MessageCircle,
  Users,
  Home,
  Sparkles,
  X,
  LogOut,
} from "lucide-react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { ImoveisView } from "@/components/imoveis-view";
import { AnunciosView } from "@/components/anuncios-view";
import { DescricaoChat } from "@/components/descricao-chat";
import { RoletaModal } from "@/components/roleta-modal";
import { CrmView } from "@/components/crm-view";
import { SKILLS } from "@/lib/skills";
import { type Cliente, parseHistorico, fmtDataCurta } from "@/lib/crm";

interface Carteira {
  videos: number;
  leads: number;
  descricoes: number;
  podeGirar: boolean;
}

type View = "hub" | "imoveis" | "anuncios" | "descricao" | "crm";

interface Funcao {
  id?: string; // id da skill (quando aplicável)
  icon: React.ElementType;
  label: string;
  view?: View; // abre uma view inline em vez de skill
  premium?: "videos"; // consome crédito; some quando zera
}

const FUNCOES: Funcao[] = [
  { id: "apartamento", icon: Building2, label: "Apartamento", view: "descricao" },
  { id: "anuncio", icon: Megaphone, label: "Anúncio", view: "descricao" },
  { id: "video", icon: Video, label: "Vídeo", premium: "videos" },
  { id: "whatsapp", icon: MessageCircle, label: "WhatsApp" },
  { id: "leads", icon: Users, label: "Clientes", view: "crm" },
  { icon: Home, label: "Imóveis", view: "imoveis" },
];

export function Hub({ mostrarSair = false }: { mostrarSair?: boolean }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append, setMessages } =
    useChat({ api: "/api/chat" });

  const [skillAtiva, setSkillAtiva] = useState<string | null>(null);
  const [view, setView] = useState<View>("hub");
  const [carteira, setCarteira] = useState<Carteira | null>(null);
  const [roletaAberta, setRoletaAberta] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function carregarCarteira(abrirSePuder = false) {
    const res = await fetch("/api/carteira");
    const c: Carteira = await res.json();
    setCarteira(c);
    if (abrirSePuder && c.podeGirar) setRoletaAberta(true);
  }

  useEffect(() => {
    carregarCarteira(true);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const conversando = messages.length > 0 || input.trim().length > 0;

  // Ativa uma skill: define o modo e dispara a mensagem inicial naquele contexto
  function ativarSkill(id: string) {
    setSkillAtiva(id);
    append({ role: "user", content: SKILLS[id].starter }, { body: { skillId: id } });
  }

  // Toda mensagem digitada carrega a skill ativa no contexto.
  // Se estiver em outra view, volta pro hub pra mostrar a conversa.
  function enviar(e: React.FormEvent) {
    if (view !== "hub") setView("hub");
    handleSubmit(e, { body: { skillId: skillAtiva } });
  }

  // Usa uma função premium: consome 1 crédito e ativa a skill
  async function usarPremium(id: string, tipo: "videos") {
    const res = await fetch("/api/carteira/consumir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo }),
    });
    if (res.ok) {
      await carregarCarteira(false);
      ativarSkill(id);
    }
  }

  // Volta pro hub inicial
  function reiniciar() {
    setMessages([]);
    setSkillAtiva(null);
    setView("hub");
  }

  async function sair() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  // Puxa um cliente do CRM pro chat: leva todo o contexto e pede a abordagem
  function mandarClienteParaLari(c: Cliente) {
    const hist = parseHistorico(c.historico);
    const linhasHist = hist.length
      ? hist.map((h, i) => `${i + 1}. ${fmtDataCurta(h.data)} — ${h.texto}`).join("\n")
      : "Nenhum contato registrado.";
    const contexto = [
      `Cliente: ${c.nome}`,
      `Etapa no funil: ${c.etapa}`,
      `Telefone: ${c.telefone || "—"}`,
      `E-mail: ${c.email || "—"}`,
      `Instagram: ${c.instagram || "—"}`,
      `Interesse: ${c.interesse || "—"}`,
      c.observacao ? `Anotações: ${c.observacao}` : "",
      `Histórico de contato:\n${linhasHist}`,
      "",
      "Me ajuda com esse cliente: qual a melhor abordagem agora e escreve a mensagem de WhatsApp ideal pra avançar ele no funil.",
    ].filter(Boolean).join("\n");

    setView("hub");
    setSkillAtiva("whatsapp");
    append({ role: "user", content: contexto }, { body: { skillId: "whatsapp" } });
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Imagem de fundo + overlay */}
      <div
        className="fixed inset-0 -z-30 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-background/40 via-background/55 to-background/90" />

      {/* Luzes (glow) pra dar charme */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="glow-light absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-[90px]" />
        <div className="glow-light glow-delay absolute left-1/4 top-1/2 h-56 w-56 rounded-full bg-cyan-400/20 blur-[90px]" />
        <div className="glow-light glow-delay-2 absolute right-1/4 top-1/2 h-56 w-56 rounded-full bg-emerald-400/20 blur-[90px]" />
        <div className="glow-light absolute bottom-10 left-1/2 h-40 w-[28rem] -translate-x-1/2 rounded-full bg-primary/25 blur-[80px]" />
      </div>

      <div className="mx-auto flex h-[100dvh] max-w-3xl flex-col px-3 sm:px-4">
        {/* Header */}
        <header className="flex items-center justify-between py-4">
          <button onClick={reiniciar} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-fg shadow-lg">
              <Home size={18} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">Lari</span>
          </button>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setView(view === "imoveis" ? "hub" : "imoveis")}
              className={
                "rounded-xl px-3 py-2 text-sm transition-transform hover:scale-105 " +
                (view === "imoveis" ? "bg-primary text-primary-fg" : "glass text-white")
              }
            >
              Imóveis
            </button>
            <button
              onClick={() => setView(view === "anuncios" ? "hub" : "anuncios")}
              className={
                "rounded-xl px-3 py-2 text-sm transition-transform hover:scale-105 " +
                (view === "anuncios" ? "bg-primary text-primary-fg" : "glass text-white")
              }
            >
              Anúncios
            </button>
            <button
              onClick={() => setView(view === "crm" ? "hub" : "crm")}
              className={
                "rounded-xl px-3 py-2 text-sm transition-transform hover:scale-105 " +
                (view === "crm" ? "bg-primary text-primary-fg" : "glass text-white")
              }
            >
              Clientes
            </button>
            {mostrarSair && (
              <button
                onClick={sair}
                aria-label="Sair"
                title="Sair"
                className="glass rounded-xl p-2 text-muted transition-transform hover:scale-105 hover:text-white"
              >
                <LogOut size={18} />
              </button>
            )}
          </nav>
        </header>

        {/* Área central */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-4">
          {view === "imoveis" ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <ImoveisView />
            </motion.div>
          ) : view === "anuncios" ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <AnunciosView />
            </motion.div>
          ) : view === "descricao" ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <DescricaoChat />
            </motion.div>
          ) : view === "crm" ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <CrmView onMandarParaLari={mandarClienteParaLari} />
            </motion.div>
          ) : (
          <AnimatePresence mode="wait">
            {!conversando ? (
              <motion.div
                key="hero"
                className="flex h-full flex-col items-center justify-center"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-8 text-center"
                >
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">Olá! Eu sou a Lari 👋</h1>
                  <p className="mt-2 text-sm text-muted sm:text-base">O que vamos fazer hoje?</p>
                </motion.div>

                <div className="grid w-full max-w-md grid-cols-3 gap-3 sm:gap-4">
                  {FUNCOES.filter((f) => !f.premium || (carteira?.[f.premium] ?? 0) > 0).map((f, i) => {
                    const Icon = f.icon;
                    const dir = i % 3 === 0 ? -1 : i % 3 === 2 ? 1 : 0;
                    const conteudo = (
                      <>
                        {f.premium && (
                          <span className="absolute right-1.5 top-1.5 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-fg">
                            {carteira?.[f.premium] ?? 0}
                          </span>
                        )}
                        <Icon size={24} className="text-primary" />
                        <span className="text-xs font-medium text-white">{f.label}</span>
                      </>
                    );
                    const classe =
                      "glass relative flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl transition-transform hover:scale-105 active:scale-95";

                    function handle() {
                      if (f.premium) return usarPremium(f.id!, f.premium);
                      if (f.view) return setView(f.view);
                      if (f.id) return ativarSkill(f.id);
                    }

                    return (
                      <motion.div
                        key={f.label}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: dir * 350, scale: 0.8 }}
                        transition={{
                          delay: i * 0.05,
                          duration: 0.4,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                      >
                        <button onClick={handle} className={classe}>
                          {conteudo}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                {messages.map((m) => (
                  <ChatMessage key={m.id} role={m.role} content={m.content} />
                ))}
                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    Ops, algo deu errado. Verifique a chave da API em{" "}
                    <code className="font-mono">.env.local</code>.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          )}
        </div>

        {/* Chat — sempre visível, em qualquer view (a Lari acompanha tudo) */}
        <div className="pb-5 pt-2">
          {/* Badge da skill ativa */}
          <AnimatePresence>
            {skillAtiva && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mb-2 flex w-fit items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-white"
              >
                <Sparkles size={14} className="text-primary" />
                Modo: {SKILLS[skillAtiva].label}
                <button onClick={() => setSkillAtiva(null)} aria-label="Sair do modo" className="ml-1 rounded-full p-0.5 hover:bg-white/10">
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <ChatInput
            input={input}
            isLoading={isLoading}
            onChange={handleInputChange}
            onSubmit={enviar}
          />
        </div>
      </div>

      {/* Balãozinho de créditos (some ao zerar) */}
      {carteira && carteira.videos > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-strong fixed bottom-24 left-4 z-30 flex items-center gap-2 rounded-full py-2 pl-3 pr-4 text-sm text-white shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
          title="Gerações de vídeo disponíveis"
        >
          <span className="text-lg">🎬</span>
          <div className="leading-tight">
            <div className="font-bold text-primary">{carteira.videos}</div>
            <div className="text-[10px] text-muted">gerações</div>
          </div>
        </motion.div>
      )}

      {roletaAberta && (
        <RoletaModal
          onClose={() => setRoletaAberta(false)}
          onGanhou={() => carregarCarteira(false)}
        />
      )}
    </main>
  );
}
