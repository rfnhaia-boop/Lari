import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { buildDescricaoSystem } from "@/lib/descricao/master-prompt";
import { autorizado } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  if (!autorizado()) return new Response("Não autorizado.", { status: 401 });
  if (!process.env.GROQ_API_KEY) {
    return new Response("Chave da API não configurada (.env.local).", { status: 500 });
  }

  const { dados }: { dados: Record<string, unknown> } = await req.json();

  // categoria_imovel chega como rótulo ("Residencial"); normaliza para a chave da lógica
  const cat = String(dados.categoria_imovel ?? "Residencial").toLowerCase();
  const categoria = cat.includes("comerc")
    ? "comercial"
    : cat.includes("terreno") || cat.includes("lote")
    ? "terreno_lote"
    : "residencial";

  const system = buildDescricaoSystem(categoria);

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system,
    prompt: `Gere a descrição com base neste JSON do imóvel:\n\n${JSON.stringify(dados, null, 2)}`,
    temperature: 0.8,
  });

  return result.toTextStreamResponse();
}
