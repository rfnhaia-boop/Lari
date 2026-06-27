import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/format";

export const runtime = "nodejs";
export const maxDuration = 30;

const INSTRUCOES_CANAL: Record<string, string> = {
  instagram:
    "Crie uma legenda para post no INSTAGRAM. Use emojis com bom gosto, linhas curtas, quebras de linha, e termine com 4-6 hashtags relevantes do mercado imobiliário e da cidade. Tom envolvente e visual.",
  whatsapp:
    "Crie uma mensagem curta para enviar pelo WHATSAPP a um cliente interessado. Tom pessoal e direto, com poucos emojis, e termine com uma pergunta que convide a agendar uma visita.",
  portal:
    "Crie um anúncio para PORTAL IMOBILIÁRIO / OLX. Comece com um título forte, depois uma descrição completa e bem estruturada destacando características e diferenciais, sem hashtags. Tom profissional.",
};

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response("Chave da API não configurada (.env.local).", { status: 500 });
  }

  const { imovelId, canal } = await req.json();

  const imovel = await prisma.imovel.findUnique({ where: { id: imovelId } });
  if (!imovel) {
    return new Response("Imóvel não encontrado.", { status: 404 });
  }

  const instrucao = INSTRUCOES_CANAL[canal] ?? INSTRUCOES_CANAL.portal;

  const dados = [
    `Título interno: ${imovel.titulo}`,
    `Tipo: ${imovel.tipo} (${imovel.finalidade})`,
    `Local: ${[imovel.bairro, imovel.cidade].filter(Boolean).join(", ")}`,
    imovel.quartos ? `${imovel.quartos} quartos` : null,
    imovel.banheiros ? `${imovel.banheiros} banheiros` : null,
    imovel.vagas ? `${imovel.vagas} vagas de garagem` : null,
    imovel.area ? `${imovel.area} m²` : null,
    `Preço: ${formatBRL(imovel.preco)}`,
    imovel.descricao ? `Diferenciais: ${imovel.descricao}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system:
      "Você é um redator publicitário especialista em mercado imobiliário brasileiro. Escreve anúncios que vendem, com linguagem natural e atrativa, sempre em português brasileiro. Entregue APENAS o texto do anúncio, pronto para copiar e colar, sem comentários antes ou depois.",
    prompt: `${instrucao}\n\nDADOS DO IMÓVEL:\n${dados}`,
    temperature: 0.8,
  });

  return result.toDataStreamResponse();
}
