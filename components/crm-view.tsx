"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight, Phone, X, Sparkles, MessageCircle, Mail, Instagram } from "lucide-react";
import { ETAPAS, type Cliente, linkWhatsApp, linkEmail, linkInstagram } from "@/lib/crm";

export function CrmView() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const res = await fetch("/api/clientes");
    setClientes(await res.json());
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function mover(c: Cliente, dir: 1 | -1) {
    const idx = ETAPAS.indexOf(c.etapa as (typeof ETAPAS)[number]);
    const novo = ETAPAS[Math.min(ETAPAS.length - 1, Math.max(0, idx + dir))];
    if (novo === c.etapa) return;
    setClientes((prev) => prev.map((x) => (x.id === c.id ? { ...x, etapa: novo } : x)));
    await fetch(`/api/clientes/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etapa: novo }),
    });
  }

  async function excluir(id: string) {
    setClientes((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/clientes/${id}`, { method: "DELETE" });
  }

  // Lari proativa: contatos parados fora de "Novo" e "Fechado"
  const emAndamento = clientes.filter((c) => c.etapa === "Contato" || c.etapa === "Visita" || c.etapa === "Proposta");

  return (
    <div className="space-y-4">
      {/* Lari proativa */}
      {!carregando && clientes.length > 0 && (
        <div className="glass flex items-start gap-3 rounded-2xl p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg">
            <Sparkles size={16} />
          </div>
          <p className="text-sm text-slate-100">
            {emAndamento.length > 0 ? (
              <>Você tem <span className="font-semibold text-primary">{emAndamento.length} cliente(s)</span> em andamento no funil. Que tal dar um retorno pros que estão parados em <span className="font-medium">Contato</span> ou <span className="font-medium">Visita</span>? 👇</>
            ) : (
              <>Seu funil tem {clientes.length} cliente(s). Bora mover quem avançou pra próxima etapa! 🚀</>
            )}
          </p>
        </div>
      )}

      {/* Cadastrar */}
      <button
        onClick={() => setFormAberto(true)}
        className="glass flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-white transition-transform hover:scale-[1.01] active:scale-95"
      >
        <Plus size={18} className="text-primary" /> Novo cliente
      </button>

      {/* Kanban */}
      {carregando ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {ETAPAS.map((etapa) => {
            const lista = clientes.filter((c) => c.etapa === etapa);
            return (
              <div key={etapa} className="w-60 shrink-0">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-white">{etapa}</span>
                  <span className="rounded-full bg-white/10 px-2 text-xs text-muted">{lista.length}</span>
                </div>
                <div className="space-y-2">
                  {lista.map((c) => {
                    const idx = ETAPAS.indexOf(etapa);
                    return (
                      <article
                        key={c.id}
                        onClick={() => setEditando(c)}
                        className="glass cursor-pointer rounded-xl p-3 transition-colors hover:border-primary/40"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-white">{c.nome}</h4>
                          <button onClick={(e) => { e.stopPropagation(); excluir(c.id); }} aria-label="Excluir" className="text-muted hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {c.telefone && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                            <Phone size={12} /> {c.telefone}
                          </p>
                        )}
                        {c.interesse && <p className="mt-1 text-xs text-slate-300">{c.interesse}</p>}
                        {c.observacao && <p className="mt-1 truncate text-xs italic text-muted">📝 {c.observacao}</p>}
                        <div className="mt-2 flex items-center justify-between">
                          <button onClick={(e) => { e.stopPropagation(); mover(c, -1); }} disabled={idx === 0} className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white disabled:opacity-30">
                            <ChevronLeft size={16} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); mover(c, 1); }} disabled={idx === ETAPAS.length - 1} className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white disabled:opacity-30">
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                  {lista.length === 0 && (
                    <div className="rounded-xl border border-dashed border-white/10 py-6 text-center text-xs text-muted">vazio</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formAberto && (
        <ClienteForm
          onClose={() => setFormAberto(false)}
          onCreated={() => {
            setFormAberto(false);
            carregar();
          }}
        />
      )}

      {editando && (
        <ClienteModal
          cliente={editando}
          onClose={() => setEditando(null)}
          onSalvo={() => {
            setEditando(null);
            carregar();
          }}
        />
      )}
    </div>
  );
}

function ClienteModal({ cliente, onClose, onSalvo }: { cliente: Cliente; onClose: () => void; onSalvo: () => void }) {
  const [f, setF] = useState({
    nome: cliente.nome,
    telefone: cliente.telefone,
    email: cliente.email,
    instagram: cliente.instagram,
    interesse: cliente.interesse,
    etapa: cliente.etapa,
    observacao: cliente.observacao,
  });
  const [salvando, setSalvando] = useState(false);
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));
  const campo = "w-full rounded-lg bg-black/30 px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none";

  async function salvar() {
    setSalvando(true);
    await fetch(`/api/clientes/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    setSalvando(false);
    onSalvo();
  }

  const wa = linkWhatsApp(f.telefone);
  const mail = linkEmail(f.email);
  const insta = linkInstagram(f.instagram);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-strong max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Editar cliente</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Contato rápido */}
        <div className="mb-4 flex gap-2">
          <a href={wa || undefined} target="_blank" rel="noreferrer" className={"flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-transform hover:scale-105 " + (wa ? "bg-[#25D366] text-white" : "glass text-muted pointer-events-none opacity-40")}>
            <MessageCircle size={16} /> WhatsApp
          </a>
          <a href={mail || undefined} className={"flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-transform hover:scale-105 " + (mail ? "bg-primary text-primary-fg" : "glass text-muted pointer-events-none opacity-40")}>
            <Mail size={16} /> E-mail
          </a>
          <a href={insta || undefined} target="_blank" rel="noreferrer" className={"flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-transform hover:scale-105 " + (insta ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" : "glass text-muted pointer-events-none opacity-40")}>
            <Instagram size={16} /> Instagram
          </a>
        </div>

        <div className="space-y-3">
          <input value={f.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Nome" className={campo} />
          <input value={f.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="WhatsApp / telefone" className={campo} />
          <input value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="E-mail" className={campo} />
          <input value={f.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="Instagram (@usuario)" className={campo} />
          <input value={f.interesse} onChange={(e) => set("interesse", e.target.value)} placeholder="Interesse (o que procura)" className={campo} />
          <select value={f.etapa} onChange={(e) => set("etapa", e.target.value)} className={campo}>
            {ETAPAS.map((e) => (
              <option key={e} value={e} className="bg-surface">{e}</option>
            ))}
          </select>
          <textarea value={f.observacao} onChange={(e) => set("observacao", e.target.value)} rows={4} placeholder="📝 Anotações sobre o cliente / conversa..." className={campo + " resize-none"} />
        </div>

        <button onClick={salvar} disabled={salvando} className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-fg transition-transform hover:scale-[1.01] disabled:opacity-50">
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}

function ClienteForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [salvando, setSalvando] = useState(false);
  const campo = "w-full rounded-lg bg-black/30 px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSalvando(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    setSalvando(false);
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="glass-strong w-full max-w-md rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Novo cliente</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input name="nome" required placeholder="Nome do cliente" className={campo} />
          <input name="telefone" placeholder="WhatsApp / telefone" className={campo} />
          <input name="interesse" placeholder="O que procura (ex: apê 2 quartos, até 400k)" className={campo} />
          <select name="etapa" defaultValue="Novo" className={campo}>
            {ETAPAS.map((e) => (
              <option key={e} value={e} className="bg-surface">{e}</option>
            ))}
          </select>
          <button disabled={salvando} className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-fg transition-transform hover:scale-[1.01] disabled:opacity-50">
            {salvando ? "Salvando..." : "Adicionar ao funil"}
          </button>
        </form>
      </div>
    </div>
  );
}
