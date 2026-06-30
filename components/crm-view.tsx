"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Plus, Trash2, ChevronLeft, ChevronRight, Phone, X, Sparkles,
  MessageCircle, Mail, Instagram, Pencil, Target, ArrowLeft, StickyNote,
} from "lucide-react";
import {
  ETAPAS, type Cliente, type ContatoHist,
  linkWhatsApp, linkEmail, linkInstagram, parseHistorico, fmtDataCurta,
} from "@/lib/crm";

export function CrmView({ onMandarParaLari }: { onMandarParaLari?: (c: Cliente) => void }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [aberto, setAberto] = useState<Cliente | null>(null);

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
              <>Você tem <span className="font-semibold text-primary">{emAndamento.length} proprietário(s)</span> em andamento no funil. Que tal dar um retorno pros que estão parados em <span className="font-medium">Contato</span> ou <span className="font-medium">Visita</span>? 👇</>
            ) : (
              <>Seu funil tem {clientes.length} proprietário(s). Bora mover quem avançou pra próxima etapa! 🚀</>
            )}
          </p>
        </div>
      )}

      {/* Cadastrar */}
      <button
        onClick={() => setFormAberto(true)}
        className="glass flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-white transition-transform hover:scale-[1.01] active:scale-95"
      >
        <Plus size={18} className="text-primary" /> Novo proprietário
      </button>

      {/* Kanban */}
      {carregando ? (
        <div className="glass h-40 animate-pulse rounded-2xl" />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {ETAPAS.map((etapa) => {
            const lista = clientes.filter((c) => c.etapa === etapa);
            return (
              <div key={etapa} className="w-60 shrink-0 lg:w-auto lg:min-w-0">
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
                        onClick={() => setAberto(c)}
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

      {aberto && (
        <ClienteModal
          clienteInicial={aberto}
          onClose={() => setAberto(null)}
          onAtualizado={carregar}
          onMandarParaLari={(c) => {
            setAberto(null);
            onMandarParaLari?.(c);
          }}
        />
      )}
    </div>
  );
}

const campo = "w-full rounded-lg bg-black/30 px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/50";

function EtapaBadge({ etapa }: { etapa: string }) {
  return (
    <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/30">
      {etapa}
    </span>
  );
}

function ClienteModal({
  clienteInicial, onClose, onAtualizado, onMandarParaLari,
}: {
  clienteInicial: Cliente;
  onClose: () => void;
  onAtualizado: () => void;
  onMandarParaLari: (c: Cliente) => void;
}) {
  const [cliente, setCliente] = useState<Cliente>(clienteInicial);
  const [modo, setModo] = useState<"view" | "edit">("view");

  const wa = linkWhatsApp(cliente.telefone);
  const mail = linkEmail(cliente.email);
  const insta = linkInstagram(cliente.instagram);
  const historico = parseHistorico(cliente.historico);

  // Adiciona um contato no histórico na hora (sem entrar no modo editar)
  async function addContato(texto: string) {
    const novo = [...parseHistorico(cliente.historico), { data: new Date().toISOString(), texto }];
    const res = await fetch(`/api/clientes/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ historico: JSON.stringify(novo) }),
    });
    if (res.ok) {
      setCliente(await res.json());
      onAtualizado();
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-3 backdrop-blur-md sm:p-4">
      <div className="glass-modal flex h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl text-white">
        {modo === "view" ? (
          <ViewMode
            cliente={cliente}
            wa={wa} mail={mail} insta={insta}
            historico={historico}
            onClose={onClose}
            onEditar={() => setModo("edit")}
            onMandar={() => onMandarParaLari(cliente)}
            onAddContato={addContato}
          />
        ) : (
          <EditMode
            cliente={cliente}
            onCancelar={() => setModo("view")}
            onSalvo={(atualizado) => {
              setCliente(atualizado);
              setModo("view");
              onAtualizado();
            }}
          />
        )}
      </div>
    </div>,
    document.body
  );
}

/* ---------- MODO VISUALIZAÇÃO (card informativo) ---------- */
function ViewMode({
  cliente, wa, mail, insta, historico, onClose, onEditar, onMandar, onAddContato,
}: {
  cliente: Cliente;
  wa: string; mail: string; insta: string;
  historico: ContatoHist[];
  onClose: () => void;
  onEditar: () => void;
  onMandar: () => void;
  onAddContato: (texto: string) => Promise<void>;
}) {
  const [nota, setNota] = useState("");
  const [salvandoNota, setSalvandoNota] = useState(false);
  const botaoContato = "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition-transform hover:scale-105";

  async function adicionar() {
    const texto = nota.trim();
    if (!texto || salvandoNota) return;
    setSalvandoNota(true);
    await onAddContato(texto);
    setNota("");
    setSalvandoNota(false);
  }
  return (
    <>
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-2 p-5 pb-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold">{cliente.nome}</h2>
          <div className="mt-1.5"><EtapaBadge etapa={cliente.etapa} /></div>
        </div>
        <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Contato rápido */}
      <div className="flex gap-2 px-5 pb-4">
        <a href={wa || undefined} target="_blank" rel="noreferrer" className={botaoContato + (wa ? " bg-[#25D366] text-white" : " glass text-muted pointer-events-none opacity-40")}>
          <MessageCircle size={16} /> WhatsApp
        </a>
        <a href={mail || undefined} className={botaoContato + (mail ? " bg-primary text-primary-fg" : " glass text-muted pointer-events-none opacity-40")}>
          <Mail size={16} /> E-mail
        </a>
        <a href={insta || undefined} target="_blank" rel="noreferrer" className={botaoContato + (insta ? " bg-gradient-to-br from-purple-500 to-pink-500 text-white" : " glass text-muted pointer-events-none opacity-40")}>
          <Instagram size={16} /> Instagram
        </a>
      </div>

      {/* Conteúdo rolável */}
      <div className="flex-1 space-y-4 overflow-y-auto border-t border-white/10 px-5 py-4">
        {/* Infos */}
        <div className="space-y-2 text-sm">
          <InfoRow icon={<Phone size={15} />} valor={cliente.telefone} vazio="Sem telefone" />
          <InfoRow icon={<Mail size={15} />} valor={cliente.email} vazio="Sem e-mail" />
          <InfoRow icon={<Instagram size={15} />} valor={cliente.instagram} vazio="Sem Instagram" />
          <InfoRow icon={<Target size={15} />} valor={cliente.interesse} vazio="Interesse não informado" />
        </div>

        {/* Histórico */}
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            <StickyNote size={13} /> Histórico de contato
          </h3>
          {historico.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-xs text-muted">
              Nenhum contato registrado ainda.
            </p>
          ) : (
            <ol className="space-y-2">
              {historico.map((h, i) => (
                <li key={i} className="rounded-xl bg-white/5 px-3 py-2 text-sm">
                  <span className="text-xs font-semibold text-primary">Contato {i + 1}</span>
                  {h.data && <span className="ml-1.5 text-xs text-muted">· {fmtDataCurta(h.data)}</span>}
                  <p className="mt-0.5 text-slate-100">{h.texto}</p>
                </li>
              ))}
            </ol>
          )}

          {/* Adicionar nota na hora (sem entrar no editar) */}
          <div className="mt-2 flex gap-2">
            <input
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionar(); } }}
              placeholder="Anotar um contato/observação..."
              className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button
              onClick={adicionar}
              disabled={!nota.trim() || salvandoNota}
              aria-label="Adicionar nota"
              className="shrink-0 rounded-lg bg-primary px-3 text-primary-fg transition-transform hover:scale-105 disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Anotações */}
        {cliente.observacao && (
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Anotações</h3>
            <p className="whitespace-pre-wrap rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-100">{cliente.observacao}</p>
          </div>
        )}
      </div>

      {/* Ações fixas no rodapé */}
      <div className="flex gap-2 border-t border-white/10 p-4">
        <button onClick={onEditar} className="glass flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02]">
          <Pencil size={16} /> Editar
        </button>
        <button onClick={onMandar} className="flex flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-fg transition-transform hover:scale-[1.02]">
          <Sparkles size={16} /> Mandar pra Lari
        </button>
      </div>
    </>
  );
}

function InfoRow({ icon, valor, vazio }: { icon: React.ReactNode; valor: string; vazio: string }) {
  const tem = valor && valor.trim().length > 0;
  return (
    <div className="flex items-center gap-2">
      <span className={tem ? "text-primary" : "text-muted/50"}>{icon}</span>
      <span className={tem ? "text-slate-100" : "text-muted/60 italic"}>{tem ? valor : vazio}</span>
    </div>
  );
}

/* ---------- MODO EDIÇÃO ---------- */
function EditMode({
  cliente, onCancelar, onSalvo,
}: {
  cliente: Cliente;
  onCancelar: () => void;
  onSalvo: (c: Cliente) => void;
}) {
  const [f, setF] = useState({
    nome: cliente.nome,
    telefone: cliente.telefone,
    email: cliente.email,
    instagram: cliente.instagram,
    interesse: cliente.interesse,
    etapa: cliente.etapa,
    observacao: cliente.observacao,
  });
  const [hist, setHist] = useState<ContatoHist[]>(parseHistorico(cliente.historico));
  const [novoContato, setNovoContato] = useState("");
  const [salvando, setSalvando] = useState(false);
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  function addContato() {
    const texto = novoContato.trim();
    if (!texto) return;
    setHist((h) => [...h, { data: new Date().toISOString(), texto }]);
    setNovoContato("");
  }

  async function salvar() {
    setSalvando(true);
    const res = await fetch(`/api/clientes/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, historico: JSON.stringify(hist) }),
    });
    const atualizado = await res.json();
    setSalvando(false);
    onSalvo(atualizado);
  }

  return (
    <>
      <div className="flex items-center justify-between p-5 pb-3">
        <button onClick={onCancelar} className="flex items-center gap-1.5 text-sm text-muted hover:text-white">
          <ArrowLeft size={18} /> Voltar
        </button>
        <h2 className="text-base font-semibold">Editar proprietário</h2>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto border-t border-white/10 px-5 py-4">
        <input value={f.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Nome" className={campo} />
        <input value={f.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="WhatsApp / telefone" className={campo} />
        <input value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="E-mail" className={campo} />
        <input value={f.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="Instagram (@usuario)" className={campo} />
        <input value={f.interesse} onChange={(e) => set("interesse", e.target.value)} placeholder="🎯 Interesse (o que procura)" className={campo} />
        <select value={f.etapa} onChange={(e) => set("etapa", e.target.value)} className={campo}>
          {ETAPAS.map((e) => (
            <option key={e} value={e} className="bg-surface">{e}</option>
          ))}
        </select>
        <textarea value={f.observacao} onChange={(e) => set("observacao", e.target.value)} rows={3} placeholder="📝 Anotações sobre o proprietário..." className={campo + " resize-none"} />

        {/* Histórico editável */}
        <div className="pt-1">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Histórico de contato</h3>
          {hist.length > 0 && (
            <ol className="mb-2 space-y-1.5">
              {hist.map((h, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm">
                  <span className="text-xs font-semibold text-primary">Contato {i + 1}</span>
                  <span className="flex-1 text-slate-100">{h.texto}</span>
                  <button onClick={() => setHist((arr) => arr.filter((_, j) => j !== i))} aria-label="Remover" className="text-muted hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ol>
          )}
          <div className="flex gap-2">
            <input
              value={novoContato}
              onChange={(e) => setNovoContato(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addContato(); } }}
              placeholder="Registrar novo contato..."
              className={campo}
            />
            <button onClick={addContato} className="shrink-0 rounded-lg bg-white/10 px-3 text-sm text-white hover:bg-white/20">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <button onClick={salvar} disabled={salvando} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-fg transition-transform hover:scale-[1.01] disabled:opacity-50">
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </>
  );
}

/* ---------- NOVO CLIENTE ---------- */
function ClienteForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [salvando, setSalvando] = useState(false);

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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-3 backdrop-blur-md sm:p-4">
      <form onSubmit={submit} className="glass-modal flex h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl text-white">
        {/* Cabeçalho fixo */}
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-semibold text-white">Novo proprietário</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Campos (rolável) */}
        <div className="flex-1 space-y-3 overflow-y-auto border-t border-white/10 px-5 py-4">
          <input name="nome" required placeholder="Nome do proprietário" className={campo} />
          <input name="telefone" placeholder="WhatsApp / telefone" className={campo} />
          <input name="email" placeholder="E-mail" className={campo} />
          <input name="instagram" placeholder="Instagram (@usuario)" className={campo} />
          <input name="interesse" placeholder="🎯 O que procura (ex: apê 2 quartos, até 400k)" className={campo} />
          <select name="etapa" defaultValue="Novo" className={campo}>
            {ETAPAS.map((e) => (
              <option key={e} value={e} className="bg-surface">{e}</option>
            ))}
          </select>
        </div>

        {/* Ação fixa no rodapé */}
        <div className="border-t border-white/10 p-4">
          <button disabled={salvando} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-fg transition-transform hover:scale-[1.01] disabled:opacity-50">
            {salvando ? "Salvando..." : "Adicionar ao funil"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
