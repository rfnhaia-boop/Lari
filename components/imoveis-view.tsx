"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, MapPin, BedDouble, Bath, Car, Ruler, Sparkles, Home } from "lucide-react";
import { ImovelForm } from "@/components/imovel-form";
import { AnuncioGerador } from "@/components/anuncio-gerador";
import { formatBRL, type Imovel } from "@/lib/format";

export function ImoveisView() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [gerarPara, setGerarPara] = useState<Imovel | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const res = await fetch("/api/imoveis");
    setImoveis(await res.json());
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function excluir(id: string) {
    setImoveis((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/imoveis/${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-5">
      {/* Cadastrar */}
      <button
        onClick={() => setFormAberto(true)}
        className="glass flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-medium text-white transition-transform hover:scale-[1.01] active:scale-95"
      >
        <Plus size={18} className="text-primary" /> Cadastrar imóvel
      </button>

      {/* Lista */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
          Seus imóveis {imoveis.length > 0 && `(${imoveis.length})`}
        </p>

        {carregando ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="glass h-40 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : imoveis.length === 0 ? (
          <div className="glass flex h-48 flex-col items-center justify-center rounded-2xl text-center">
            <Home size={26} className="mb-2 text-primary" />
            <p className="text-sm font-medium text-white">Nenhum imóvel cadastrado</p>
            <p className="mt-1 text-sm text-muted">Toque em “Cadastrar imóvel” para começar.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {imoveis.map((imovel) => (
              <article key={imovel.id} className="group glass flex flex-col rounded-2xl p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                    {imovel.tipo} · {imovel.finalidade}
                  </span>
                  <button
                    onClick={() => excluir(imovel.id)}
                    aria-label="Excluir imóvel"
                    className="rounded-lg p-1 text-muted transition-all hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="font-semibold text-white">{imovel.titulo}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                  <MapPin size={14} />
                  {[imovel.bairro, imovel.cidade].filter(Boolean).join(", ")}
                </p>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                  {imovel.quartos > 0 && <span className="flex items-center gap-1"><BedDouble size={14} /> {imovel.quartos}</span>}
                  {imovel.banheiros > 0 && <span className="flex items-center gap-1"><Bath size={14} /> {imovel.banheiros}</span>}
                  {imovel.vagas > 0 && <span className="flex items-center gap-1"><Car size={14} /> {imovel.vagas}</span>}
                  {imovel.area > 0 && <span className="flex items-center gap-1"><Ruler size={14} /> {imovel.area} m²</span>}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-bold text-primary">{formatBRL(imovel.preco)}</p>
                  <button
                    onClick={() => setGerarPara(imovel)}
                    className="flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/25"
                  >
                    <Sparkles size={14} /> Gerar anúncio
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {formAberto && (
        <ImovelForm
          onClose={() => setFormAberto(false)}
          onCreated={() => {
            setFormAberto(false);
            carregar();
          }}
        />
      )}
      {gerarPara && <AnuncioGerador imovel={gerarPara} onClose={() => setGerarPara(null)} />}
    </div>
  );
}
