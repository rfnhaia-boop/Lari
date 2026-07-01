import { prisma } from "@/lib/db";

// Limites base por plano. Base p/ Asaas: quando um cliente muda de plano,
// só troca aqui (ou lê do banco em `Conta.plano`) e o resto continua igual.
export const LIMITES_BASE: Record<string, { descricoes: number; interacoes: number }> = {
  trial:        { descricoes: 20,  interacoes: 500 },
  pessoal:      { descricoes: 20,  interacoes: 500 },
  empresarial:  { descricoes: 100, interacoes: 2000 },
};

export type Recurso = "descricoes" | "interacoes";

export function baseDoPlano(plano: string, recurso: Recurso): number {
  return (LIMITES_BASE[plano] ?? LIMITES_BASE.trial)[recurso];
}

// Estado dos limites da conta (com ciclo mensal já resetado se virou o mês)
export async function estadoLimites(contaId: string) {
  const conta = await prisma.conta.findUnique({ where: { id: contaId } });
  if (!conta) return null;

  const carteira = await prisma.carteira.upsert({
    where: { contaId },
    update: {},
    create: { contaId },
  });

  const agora = new Date();
  const mes = agora.getMonth() + 1;
  const ano = agora.getFullYear();

  // Vira o mês? zera o uso E os bônus (bônus dura o mês corrente)
  let c = carteira;
  if (carteira.cicloMes !== mes || carteira.cicloAno !== ano) {
    c = await prisma.carteira.update({
      where: { contaId },
      data: {
        cicloMes: mes,
        cicloAno: ano,
        descricoesUsadas: 0,
        interacoesUsadas: 0,
        bonusDescricoes: 0,
        bonusInteracoes: 0,
      },
    });
  }

  const baseDesc = baseDoPlano(conta.plano, "descricoes");
  const baseInt = baseDoPlano(conta.plano, "interacoes");

  return {
    plano: conta.plano,
    descricoes: {
      usadas: c.descricoesUsadas,
      base: baseDesc,
      bonus: c.bonusDescricoes,
      limite: baseDesc + c.bonusDescricoes,
      restante: Math.max(0, baseDesc + c.bonusDescricoes - c.descricoesUsadas),
    },
    interacoes: {
      usadas: c.interacoesUsadas,
      base: baseInt,
      bonus: c.bonusInteracoes,
      limite: baseInt + c.bonusInteracoes,
      restante: Math.max(0, baseInt + c.bonusInteracoes - c.interacoesUsadas),
    },
    videos: c.videos,
    ultimoGiro: c.ultimoGiro,
  };
}

// Consome 1 unidade do recurso. Retorna false se estourou o limite.
export async function consumir(contaId: string, recurso: Recurso): Promise<boolean> {
  const est = await estadoLimites(contaId);
  if (!est) return false;
  if (est[recurso].restante <= 0) return false;

  await prisma.carteira.update({
    where: { contaId },
    data:
      recurso === "descricoes"
        ? { descricoesUsadas: { increment: 1 } }
        : { interacoesUsadas: { increment: 1 } },
  });
  return true;
}
