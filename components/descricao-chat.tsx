"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Sparkles, Copy, Check, RotateCcw, Minus, Plus, Loader2 } from "lucide-react";
import { STEP_CATEGORIA, WIZARD_RESIDENCIAL, type Step, type Field } from "@/lib/descricao/wizard";

interface Msg {
  role: "lari" | "user";
  content: string;
}

const STEPS: Step[] = [STEP_CATEGORIA, ...WIZARD_RESIDENCIAL];

export function DescricaoChat() {
  const [stepIndex, setStepIndex] = useState(0);
  const [dados, setDados] = useState<Record<string, unknown>>({});
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [phase, setPhase] = useState<"asking" | "blocked" | "generating" | "done">("asking");
  const [resultado, setResultado] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [clienteFase, setClienteFase] = useState<"ask" | "form" | "saved" | null>(null);
  const [clienteSalvo, setClienteSalvo] = useState("");

  const fimRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, resultado, stepIndex]);

  const step = STEPS[stepIndex];

  function avancar(novosDados: Record<string, unknown>, summary: string) {
    const pergunta = step.pergunta;
    setMsgs((m) => [...m, { role: "lari", content: pergunta }, { role: "user", content: summary || "—" }]);
    const merged = { ...dados, ...novosDados };
    setDados(merged);

    // categoria diferente de residencial → ainda não implementado
    if (step.id === "categoria" && !String(novosDados.categoria_imovel).toLowerCase().includes("residencial")) {
      setMsgs((m) => [...m, { role: "lari", content: "Por enquanto eu gero descrição para imóveis Residenciais. Comercial e Terreno chegam em breve! 😉" }]);
      setPhase("blocked");
      return;
    }

    if (stepIndex >= STEPS.length - 1) {
      gerar(merged);
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  async function gerar(merged: Record<string, unknown>) {
    setPhase("generating");
    setResultado("");
    try {
      const res = await fetch("/api/descricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dados: merged }),
      });
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setResultado(acc);
      }
    } catch {
      setResultado("Ops, não consegui gerar agora. Verifique a chave da API e tente de novo.");
    }
    setPhase("done");
    setClienteFase("ask");
  }

  async function salvarCliente(nome: string, telefone: string) {
    const interesse = [dados.subtipo, dados.bairro, dados.cidade].filter(Boolean).join(" · ");
    await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, telefone, interesse, etapa: "Novo" }),
    });
    setClienteSalvo(nome);
    setClienteFase("saved");
  }

  function reiniciar() {
    setStepIndex(0);
    setDados({});
    setMsgs([]);
    setResultado("");
    setPhase("asking");
  }

  async function copiar() {
    await navigator.clipboard.writeText(resultado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Conversa */}
      {msgs.map((m, i) => (
        <Bolha key={i} role={m.role}>
          {m.content}
        </Bolha>
      ))}

      {/* Pergunta atual + controle */}
      {phase === "asking" && step && (
        <div className="space-y-3">
          <Bolha role="lari">{step.pergunta}</Bolha>
          <Controle step={step} onSubmit={avancar} />
        </div>
      )}

      {/* Resultado */}
      {(phase === "generating" || phase === "done") && (
        <div className="space-y-3">
          <Bolha role="lari">Pronto! Aqui está a descrição:</Bolha>
          <div className="glass-strong whitespace-pre-wrap rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed text-slate-100">
            {resultado}
            {phase === "generating" && <span className="ml-0.5 inline-block animate-blink">▊</span>}
          </div>
          {phase === "done" && (
            <div className="flex gap-2">
              <button onClick={copiar} className="flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm text-white transition-transform hover:scale-105">
                {copiado ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
                {copiado ? "Copiado!" : "Copiar"}
              </button>
              <button onClick={reiniciar} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-transform hover:scale-105">
                <RotateCcw size={16} /> Nova descrição
              </button>
            </div>
          )}

          {/* Virar cliente no funil */}
          {clienteFase === "ask" && (
            <div className="space-y-2">
              <Bolha role="lari">Esse anúncio é pra um cliente real? Posso adicionar no seu funil. 🎯</Bolha>
              <div className="flex gap-2">
                <button onClick={() => setClienteFase("form")} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-fg">Sim, adicionar</button>
                <button onClick={() => setClienteFase(null)} className="rounded-full glass px-4 py-2 text-sm text-white">Agora não</button>
              </div>
            </div>
          )}
          {clienteFase === "form" && <ClienteRapido onSalvar={salvarCliente} />}
          {clienteFase === "saved" && (
            <Bolha role="lari">Pronto! Adicionei <span className="font-semibold">{clienteSalvo}</span> no funil em <span className="text-primary">Novo</span>. Acompanhe em “Clientes”. ✅</Bolha>
          )}
        </div>
      )}

      {phase === "blocked" && (
        <button onClick={reiniciar} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-transform hover:scale-105">
          <RotateCcw size={16} /> Recomeçar
        </button>
      )}

      <div ref={fimRef} />
    </div>
  );
}

function ClienteRapido({ onSalvar }: { onSalvar: (nome: string, telefone: string) => void }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const campo = "w-full rounded-lg bg-black/30 px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none";
  return (
    <div className="glass space-y-3 rounded-2xl p-4">
      <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do cliente" className={campo} />
      <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="WhatsApp / telefone" className={campo} />
      <button
        onClick={() => nome.trim() && onSalvar(nome, telefone)}
        disabled={!nome.trim()}
        className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-fg transition-transform hover:scale-[1.01] disabled:opacity-40"
      >
        Adicionar ao funil
      </button>
    </div>
  );
}

function Bolha({ role, children }: { role: "lari" | "user"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={"flex w-full gap-2 " + (isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-full " + (isUser ? "bg-white/15 text-white" : "bg-primary text-primary-fg")}>
        {isUser ? "🧑" : <Home size={16} />}
      </div>
      <div className={"max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed " + (isUser ? "rounded-tr-sm bg-primary text-primary-fg" : "rounded-tl-sm glass-strong text-slate-100")}>
        {children}
      </div>
    </motion.div>
  );
}

/* ---- Controles por tipo de passo ---- */

function Controle({ step, onSubmit }: { step: Step; onSubmit: (d: Record<string, unknown>, s: string) => void }) {
  if (step.type === "single") return <CtrlSingle step={step} onSubmit={onSubmit} />;
  if (step.type === "multi") return <CtrlMulti step={step} onSubmit={onSubmit} />;
  if (step.type === "counters") return <CtrlCounters step={step} onSubmit={onSubmit} />;
  return <CtrlFields step={step} onSubmit={onSubmit} />;
}

const chip = "glass rounded-full px-4 py-2 text-sm text-white transition-transform hover:scale-105 active:scale-95";
const chipOn = "rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-fg transition-transform hover:scale-105";

function CtrlSingle({ step, onSubmit }: { step: Step; onSubmit: (d: Record<string, unknown>, s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {step.options!.map((opt) => (
        <button key={opt} className={chip} onClick={() => onSubmit({ [step.key!]: opt }, opt)}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function CtrlMulti({ step, onSubmit }: { step: Step; onSubmit: (d: Record<string, unknown>, s: string) => void }) {
  const [sel, setSel] = useState<string[]>([]);
  const toggle = (o: string) => setSel((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {step.options!.map((opt) => (
          <button key={opt} className={sel.includes(opt) ? chipOn : chip} onClick={() => toggle(opt)}>
            {opt}
          </button>
        ))}
      </div>
      <button
        onClick={() => onSubmit({ [step.key!]: sel }, sel.length ? sel.join(", ") : "Nenhum")}
        className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-fg transition-transform hover:scale-105"
      >
        Continuar
      </button>
    </div>
  );
}

function CtrlCounters({ step, onSubmit }: { step: Step; onSubmit: (d: Record<string, unknown>, s: string) => void }) {
  const init: Record<string, number> = {};
  step.fields!.forEach((f) => (init[f.key] = 0));
  const [vals, setVals] = useState<Record<string, number>>(init);
  const set = (k: string, v: number) => setVals((s) => ({ ...s, [k]: Math.max(0, v) }));

  function continuar() {
    const resumo = step
      .fields!.filter((f) => vals[f.key] > 0)
      .map((f) => `${vals[f.key]} ${f.label.toLowerCase()}`)
      .join(", ");
    onSubmit({ ...vals }, resumo || "—");
  }

  return (
    <div className="glass space-y-3 rounded-2xl p-4">
      {step.fields!.map((f) =>
        f.type === "stepper" ? (
          <div key={f.key} className="flex items-center justify-between">
            <span className="text-sm text-white">{f.label}</span>
            <div className="flex items-center gap-3">
              <button onClick={() => set(f.key, vals[f.key] - 1)} className="flex h-8 w-8 items-center justify-center rounded-full glass text-white"><Minus size={14} /></button>
              <span className="w-6 text-center text-sm font-semibold text-white">{vals[f.key]}</span>
              <button onClick={() => set(f.key, vals[f.key] + 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-fg"><Plus size={14} /></button>
            </div>
          </div>
        ) : (
          <div key={f.key} className="flex items-center justify-between gap-3">
            <span className="text-sm text-white">{f.label}</span>
            <input
              type="number"
              min={0}
              onChange={(e) => set(f.key, Number(e.target.value))}
              className="w-24 rounded-lg bg-black/30 px-3 py-1.5 text-sm text-white focus:outline-none"
              placeholder="0"
            />
          </div>
        )
      )}
      <button onClick={continuar} className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-fg transition-transform hover:scale-[1.01]">
        Continuar
      </button>
    </div>
  );
}

function CtrlFields({ step, onSubmit }: { step: Step; onSubmit: (d: Record<string, unknown>, s: string) => void }) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setVals((s) => ({ ...s, [k]: v }));
  const obrigatoriosOk = step.fields!.every((f) => f.optional || (vals[f.key] && vals[f.key].trim()));

  function continuar() {
    const resumo = step
      .fields!.filter((f) => vals[f.key] && vals[f.key].trim())
      .map((f) => `${f.label.replace(/ \(.*\)/, "")}: ${vals[f.key]}`)
      .join(" · ");
    onSubmit({ ...vals }, resumo || "—");
  }

  return (
    <div className="glass space-y-3 rounded-2xl p-4">
      {step.fields!.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-xs text-muted">{f.label}</label>
          {f.type === "select" ? (
            <select onChange={(e) => set(f.key, e.target.value)} className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm text-white focus:outline-none">
              {f.options!.map((o) => (
                <option key={o.value} value={o.value} className="bg-surface">{o.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={f.type === "number" ? "number" : "text"}
              onChange={(e) => set(f.key, e.target.value)}
              className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none"
              placeholder={f.label}
            />
          )}
        </div>
      ))}
      <button
        onClick={continuar}
        disabled={!obrigatoriosOk}
        className="w-full rounded-xl bg-primary py-2 text-sm font-medium text-primary-fg transition-transform hover:scale-[1.01] disabled:opacity-40"
      >
        Continuar
      </button>
    </div>
  );
}
