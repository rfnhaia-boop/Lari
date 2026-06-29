import { groq } from "@ai-sdk/groq";
import { streamText, type CoreMessage } from "ai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { SKILLS } from "@/lib/skills";
import { prisma } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { autorizado } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 30;

async function contextoImoveis(): Promise<string> {
  const imoveis = await prisma.imovel.findMany({ orderBy: { criadoEm: "desc" } });

  if (imoveis.length === 0) {
    return "\n\nO usuário ainda NÃO tem imóveis cadastrados no sistema. Se ele pedir um anúncio sem dar os dados, peça as informações ou sugira que cadastre o imóvel primeiro.";
  }

  const lista = imoveis
    .map((i) => {
      const partes = [
        `- "${i.titulo}" (${i.tipo}, ${i.finalidade})`,
        `bairro ${i.bairro || "—"}, ${i.cidade}`,
        i.quartos ? `${i.quartos} quartos` : null,
        i.banheiros ? `${i.banheiros} banheiros` : null,
        i.vagas ? `${i.vagas} vagas` : null,
        i.area ? `${i.area}m²` : null,
        `${formatBRL(i.preco)}`,
        i.descricao ? `obs: ${i.descricao}` : null,
      ].filter(Boolean);
      return partes.join(" · ");
    })
    .join("\n");

  return `\n\nIMÓVEIS CADASTRADOS NO SISTEMA (use estes dados reais ao criar anúncios e mensagens):\n${lista}`;
}

export async function POST(req: Request) {
  if (!autorizado()) return new Response("Não autorizado.", { status: 401 });
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "Chave da API não configurada. Cole sua GROQ_API_KEY no arquivo .env.local e reinicie o servidor.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages, skillId }: { messages: CoreMessage[]; skillId?: string } =
    await req.json();

  const skill = skillId ? SKILLS[skillId] : null;
  const blocoSkill = skill ? `\n\n${skill.system}` : "";

  const system = SYSTEM_PROMPT + blocoSkill + (await contextoImoveis());

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system,
    messages,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}
