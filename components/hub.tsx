"use client";

import { useChat } from "ai/react";
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Video,
  MessageCircle,
  Users,
  Home,
  Sparkles,
  X,
  LogOut,
  Lock,
  Calculator,
} from "lucide-react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { ImoveisView } from "@/components/imoveis-view";
import { AnunciosView } from "@/components/anuncios-view";
import { DescricaoChat } from "@/components/descricao-chat";
import { RoletaModal } from "@/components/roleta-modal";
import { CrmView } from "@/components/crm-view";
import { LimitesCards } from "@/components/limites-cards";
import { ComissaoModal } from "@/components/comissao-modal";
import { SKILLS } from "@/lib/skills";
import { type Cliente, parseHistorico, fmtDataCurta } from "@/lib/crm";

interface RecursoLimite {
  usadas: number; base: number; bonus: number; limite: number; restante: number;
}
interface Carteira {
  videos: number;
  podeGirar: boolean;
  limites?: {
    plano: string;
    descricoes: RecursoLimite;
    interacoes: RecursoLimite;
    videos: number;
  };
}

type View = "hub" | "imoveis" | "anuncios" | "descricao" | "crm";

interface Funcao {
  id?: string; // id da skill (quando aplicável)
  icon: React.ElementType;
  label: string;
  view?: View; // abre uma view inline em vez de skill
  premium?: "videos"; // consome crédito; some quando zera
  action?: "comissao"; // abre um modal específico (calculadora de comissão etc.)
}

const FUNCOES: Funcao[] = [
  { icon: FileText, label: "Descrição de Imóveis", view: "descricao" },
  { id: "whatsapp", icon: MessageCircle, label: "Assistente" },
  { id: "video", icon: Video, label: "Vídeo", premium: "videos" },
  { id: "leads", icon: Users, label: "Proprietários", view: "crm" },
  { icon: Calculator, label: "Comissão", action: "comissao" },
];

export function Hub({ mostrarSair = false }: { mostrarSair?: boolean }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append, setMessages } =
    useChat({ api: "/api/chat" });

  const [skillAtiva, setSkillAtiva] = useState<string | null>(null);
  const [view, setView] = useState<View>("hub");
  const [carteira, setCarteira] = useState<Carteira | null>(null);
  const [roletaAberta, setRoletaAberta] = useState(false);
  const [comissaoAberta, setComissaoAberta] = useState(false);
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

  // Toda vez que o chat para de streamar (isLoading true→false), recarrega
  // os limites — pra refletir a interação consumida na barra do dashboard.
  useEffect(() => {
    if (!isLoading && messages.length > 0) carregarCarteira(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const conversando = messages.length > 0 || input.trim().length > 0;
  const sugestoesAtivas = skillAtiva ? SKILLS[skillAtiva]?.sugestoes : undefined;

  // Ativa uma skill. Se a skill tem sugestões de prompt, só entra no modo
  // (mostra os chips); senão, dispara a mensagem inicial daquele contexto.
  function ativarSkill(id: string) {
    setSkillAtiva(id);
    setView("hub");
    if (!SKILLS[id].sugestoes) {
      append({ role: "user", content: SKILLS[id].starter }, { body: { skillId: id } });
    }
  }

  // Envia uma sugestão de prompt (chip) no contexto da skill ativa
  function enviarSugestao(texto: string) {
    append({ role: "user", content: texto }, { body: { skillId: skillAtiva } });
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
        <div className="glow-light absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[90px]" />
        <div className="glow-light glow-delay absolute left-1/4 top-1/2 h-56 w-56 rounded-full bg-primary/10 blur-[90px]" />
        <div className="glow-light glow-delay-2 absolute right-1/4 top-1/2 h-56 w-56 rounded-full bg-amber-200/10 blur-[90px]" />
        <div className="glow-light absolute bottom-10 left-1/2 h-40 w-[28rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[80px]" />
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
              onClick={() => setView(view === "crm" ? "hub" : "crm")}
              className={
                "rounded-xl px-3 py-2 text-sm transition-transform hover:scale-105 " +
                (view === "crm" ? "bg-primary text-primary-fg" : "glass text-white")
              }
            >
              Proprietários
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
            {!conversando && sugestoesAtivas ? (
              <motion.div
                key="chips"
                className="flex h-full flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 text-center">
                  <h1 className="text-2xl font-bold text-white">{SKILLS[skillAtiva!].label}</h1>
                  <p className="mt-2 text-sm text-muted">Escolha um atalho ou escreva sua pergunta 👇</p>
                </div>
                <div className="flex w-full max-w-md flex-col gap-2">
                  {sugestoesAtivas.map((s) => (
                    <button
                      key={s}
                      onClick={() => enviarSugestao(s)}
                      className="glass rounded-2xl px-4 py-3 text-left text-sm text-white transition-transform hover:scale-[1.02] active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : !conversando ? (
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

                <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:gap-4">
                  {FUNCOES.map((f, i) => {
                    const Icon = f.icon;
                    const dir = i % 2 === 0 ? -1 : 1;
                    const creditos = f.premium ? (carteira?.[f.premium] ?? 0) : null;
                    const bloqueado = f.premium ? creditos === 0 : false;
                    const conteudo = (
                      <>
                        {f.premium &&
                          (bloqueado ? (
                            <span className="absolute right-2 top-2 text-muted">
                              <Lock size={13} />
                            </span>
                          ) : (
                            <span className="absolute right-1.5 top-1.5 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-fg">
                              {creditos}
                            </span>
                          ))}
                        <Icon size={24} className={bloqueado ? "text-muted" : "text-primary"} />
                        <span className={"text-xs font-medium " + (bloqueado ? "text-muted" : "text-white")}>{f.label}</span>
                      </>
                    );
                    const classe =
                      "glass relative flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl transition-transform hover:scale-105 active:scale-95" +
                      (bloqueado ? " opacity-70" : "");

                    function handle() {
                      if (f.action === "comissao") return setComissaoAberta(true);
                      if (f.premium) {
                        if (bloqueado) return setRoletaAberta(true); // desbloqueia girando a roleta
                        return usarPremium(f.id!, f.premium);
                      }
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

                {/* Limites de uso (contador X/Y + barra) */}
                {carteira?.limites && (
                  <div className="mt-5 w-full max-w-md">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Seus limites de uso
                    </h3>
                    <LimitesCards limites={carteira.limites} />
                  </div>
                )}
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

      {comissaoAberta && <ComissaoModal onClose={() => setComissaoAberta(false)} />}
    </main>
  );
}
