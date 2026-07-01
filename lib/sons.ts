// Sons discretos e agradáveis para a roleta.
// Web Audio API — sem arquivos externos, sem dependências novas.
// Preferência liga/desliga persistida em localStorage ("lari:sons").

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // browsers exigem retomar o contexto após um clique do usuário
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function sonsHabilitados(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("lari:sons") !== "off";
}

export function setSons(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("lari:sons", on ? "on" : "off");
}

// tocador com envelope de amplitude simples (attack/decay) — evita clicks/pops
function tocar(
  freq: number,
  duracao: number,
  opcoes: { tipo?: OscillatorType; vol?: number; slideParaHz?: number } = {}
) {
  if (!sonsHabilitados()) return;
  const c = getCtx();
  if (!c) return;

  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = opcoes.tipo ?? "sine";
  osc.frequency.setValueAtTime(freq, t0);
  if (opcoes.slideParaHz) {
    osc.frequency.exponentialRampToValueAtTime(opcoes.slideParaHz, t0 + duracao);
  }

  const vol = opcoes.vol ?? 0.12;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duracao);

  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duracao + 0.02);
}

// 🔘 Clique curto ao pressionar "Girar"
export function somClique() {
  tocar(880, 0.06, { tipo: "triangle", vol: 0.10 });
}

// 🎯 Loop discreto durante o giro (tique-taque estilo roleta).
// Retorna uma função pra parar.
export function somGirando(): () => void {
  if (!sonsHabilitados()) return () => {};
  let ativo = true;
  let intervalo = 60; // começa rápido...
  function tick() {
    if (!ativo) return;
    tocar(1400, 0.03, { tipo: "square", vol: 0.05 });
    intervalo = Math.min(220, intervalo * 1.08); // ...vai desacelerando (efeito de perda de energia)
    setTimeout(tick, intervalo);
  }
  tick();
  return () => { ativo = false; };
}

// 🎉 Recompensa — arpejo curto ascendente (dó, mi, sol)
export function somPremio() {
  const c = getCtx();
  if (!c || !sonsHabilitados()) return;
  const t = c.currentTime;
  // 3 notas escalonadas
  tocar(523.25, 0.18, { tipo: "sine", vol: 0.13 }); // C5
  setTimeout(() => tocar(659.25, 0.18, { tipo: "sine", vol: 0.13 }), 90);  // E5
  setTimeout(() => tocar(783.99, 0.30, { tipo: "sine", vol: 0.15 }), 180); // G5
  // brilho discreto agudo
  setTimeout(() => tocar(1567.98, 0.20, { tipo: "triangle", vol: 0.06 }), 260);
  void t;
}

// 🎲 "Sem bônus" — tom leve descendente (mais discreto que o de prêmio)
export function somSemBonus() {
  tocar(392, 0.35, { tipo: "sine", vol: 0.10, slideParaHz: 220 });
}
