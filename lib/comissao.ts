// Calculadora de comissão imobiliária — regra fixa do doc do sócio:
// Total = 6% do valor do imóvel (é o 100% da base de distribuição).
// TODOS os percentuais abaixo derivam do total, nunca do valor do imóvel.
//
//   • Imobiliária: 50% do total (sempre)
//   • Operacional: 50% restante do total, que se divide entre:
//     A) Corretor CAPTOU + VENDEU: fica com 50% do operacional (100% dele)
//     B) Corretor só VENDEU (outro captou): vendedor 35% + captador 15%

export interface Comissao {
  valorImovel: number;
  total: number; // 6%
  imobiliaria: number; // 50% do total
  operacional: number; // 50% do total
  cenarioA: {
    agente: number; // 50% do operacional
  };
  cenarioB: {
    vendedor: number; // 35% do operacional
    captador: number; // 15% do operacional
  };
}

export function calcular(valorImovel: number): Comissao {
  const v = Math.max(0, Number(valorImovel) || 0);
  const total = v * 0.06;
  const imobiliaria = total * 0.5;
  const operacional = total * 0.5;
  return {
    valorImovel: v,
    total,
    imobiliaria,
    operacional,
    cenarioA: { agente: operacional * 0.5 },
    cenarioB: {
      vendedor: operacional * 0.35,
      captador: operacional * 0.15,
    },
  };
}
