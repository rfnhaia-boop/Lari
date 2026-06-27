"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, Copy, Check, Megaphone } from "lucide-react";
import { CANAIS, type Anuncio } from "@/lib/format";

function labelCanal(id: string) {
  return CANAIS.find((c) => c.id === id)?.label ?? id;
}

export function AnunciosView() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const res = await fetch("/api/anuncios");
    setAnuncios(await res.json());
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function excluir(id: string) {
    setAnuncios((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/anuncios/${id}`, { method: "DELETE" });
  }

  async function copiar(a: Anuncio) {
    await navigator.clipboard.writeText(a.conteudo);
    setCopiadoId(a.id);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
        Anúncios salvos {anuncios.length > 0 && `(${anuncios.length})`}
      </p>

      {carregando ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="glass h-32 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : anuncios.length === 0 ? (
        <div className="glass flex h-48 flex-col items-center justify-center rounded-2xl text-center">
          <Megaphone size={26} className="mb-2 text-primary" />
          <p className="text-sm font-medium text-white">Nenhum anúncio salvo</p>
          <p className="mt-1 text-sm text-muted">Gere um anúncio em “Imóveis” e salve aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {anuncios.map((a) => (
            <article key={a.id} className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                    {labelCanal(a.canal)}
                  </span>
                  {a.imovel && (
                    <p className="mt-1.5 text-sm font-medium text-white">
                      {a.imovel.titulo} <span className="font-normal text-muted">· {a.imovel.cidade}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => copiar(a)} aria-label="Copiar" className="rounded-lg p-2 text-muted transition-colors hover:bg-white/10 hover:text-white">
                    {copiadoId === a.id ? <Check size={16} className="text-primary" /> : <Copy size={16} />}
                  </button>
                  <button onClick={() => excluir(a.id)} aria-label="Excluir" className="rounded-lg p-2 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap rounded-xl bg-black/20 p-3 text-sm leading-relaxed text-slate-200">
                {a.conteudo}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
