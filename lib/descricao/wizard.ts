// Passos do wizard conversacional de descrição (categoria Residencial).
// Cada passo vira uma "pergunta da Lari" no chat, com o controle apropriado.

export type StepType = "single" | "multi" | "counters" | "fields";

export interface Option {
  value: string;
  label: string;
}

export interface Field {
  key: string;
  label: string;
  type: "number" | "text" | "stepper" | "select";
  optional?: boolean;
  options?: Option[];
  min?: number;
  max?: number;
}

export interface Step {
  id: string;
  pergunta: string;
  type: StepType;
  key?: string; // single/multi
  options?: string[]; // single/multi (label = value)
  fields?: Field[]; // counters/fields
  opcional?: boolean; // multi pode ser pulado
}

// Passo de categoria (sempre o primeiro)
export const STEP_CATEGORIA: Step = {
  id: "categoria",
  pergunta: "Qual é a categoria do imóvel?",
  type: "single",
  key: "categoria_imovel",
  options: ["Residencial", "Comercial", "Terreno e lote"],
};

export const WIZARD_RESIDENCIAL: Step[] = [
  {
    id: "subtipo",
    pergunta: "Qual o subtipo residencial?",
    type: "single",
    key: "subtipo",
    options: ["Casa", "Apartamento", "Casa em condomínio", "Cobertura/Duplex", "Sobrado", "Kitnet/Studio", "Chácara/Sítio"],
  },
  {
    id: "distribuicao",
    pergunta: "Vamos ao tamanho e distribuição. Ajuste o que tiver:",
    type: "counters",
    fields: [
      { key: "quartos", label: "Quartos", type: "stepper", min: 0, max: 10 },
      { key: "suites", label: "Suítes", type: "stepper", min: 0, max: 8 },
      { key: "banheiros", label: "Banheiros", type: "stepper", min: 0, max: 10 },
      { key: "vagas", label: "Vagas totais", type: "stepper", min: 0, max: 10 },
      { key: "vagas_cobertas", label: "Vagas cobertas", type: "stepper", min: 0, max: 10 },
      { key: "area_privativa", label: "Área privativa (m²)", type: "number", optional: true },
      { key: "area_total", label: "Área total (m²)", type: "number", optional: true },
    ],
  },
  {
    id: "ambientes",
    pergunta: "Quais ambientes o imóvel tem?",
    type: "multi",
    key: "ambientes",
    opcional: true,
    options: ["Sala de estar", "Sala de jantar", "Sala integrada", "Sala de TV", "Cozinha", "Cozinha integrada", "Home office", "Lavabo", "Closet", "Área de serviço", "Despensa", "Varanda/Sacada", "Varanda gourmet"],
  },
  {
    id: "diferenciais",
    pergunta: "Marque os diferenciais internos:",
    type: "multi",
    key: "diferenciais",
    opcional: true,
    options: ["Armários planejados", "Ar-condicionado", "Iluminação embutida", "Aquecimento a gás", "Chuveiro a gás", "Box de vidro", "Fechadura eletrônica", "Vista livre", "Reformado", "Sol da manhã", "Sol da tarde", "Andar alto", "Mobiliado", "Piso porcelanato", "Piso laminado", "Piso vinílico"],
  },
  {
    id: "area_externa",
    pergunta: "Tem alguma área externa?",
    type: "multi",
    key: "area_externa",
    opcional: true,
    options: ["Quintal", "Jardim", "Varanda", "Churrasqueira", "Piscina", "Área gourmet", "Edícula", "Canil", "Horta ou pomar"],
  },
  {
    id: "condominio",
    pergunta: "E o condomínio / lazer? (se houver)",
    type: "multi",
    key: "condominio",
    opcional: true,
    options: ["Portaria 24h", "Elevador", "Piscina", "Academia", "Salão de festas", "Playground", "Espaço gourmet", "Segurança / câmeras", "Brinquedoteca", "Coworking", "Bicicletário", "Pet place", "Quadra de tênis", "Quadra poliesportiva", "Campo de golfe"],
  },
  {
    id: "localizacao",
    pergunta: "Onde fica o imóvel?",
    type: "fields",
    fields: [
      { key: "cidade", label: "Cidade", type: "text" },
      { key: "bairro", label: "Bairro", type: "text" },
      { key: "referencia", label: "Referência (opcional)", type: "text", optional: true },
    ],
  },
  {
    id: "proximidades",
    pergunta: "O que tem por perto?",
    type: "multi",
    key: "proximidades",
    opcional: true,
    options: ["Escolas", "Mercados", "Transporte", "Parques", "Shoppings", "Restaurantes", "Bares", "Acesso fácil às rodovias", "Rua sem saída"],
  },
  {
    id: "finalidade",
    pergunta: "Qual a finalidade?",
    type: "single",
    key: "finalidade",
    options: ["Venda", "Aluguel", "Temporada"],
  },
  {
    id: "valores",
    pergunta: "Condições e valores:",
    type: "fields",
    fields: [
      { key: "preco", label: "Preço (R$)", type: "number" },
      { key: "iptu", label: "IPTU (R$) — opcional", type: "number", optional: true },
      { key: "aceita_financiamento", label: "Aceita financiamento?", type: "select", optional: true, options: [{ value: "", label: "—" }, { value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }] },
      { key: "aceita_permuta", label: "Aceita permuta?", type: "select", optional: true, options: [{ value: "", label: "—" }, { value: "Sim", label: "Sim" }, { value: "Não", label: "Não" }] },
    ],
  },
  {
    id: "publico",
    pergunta: "Pra qual público é ideal?",
    type: "single",
    key: "publico",
    options: ["Todos", "Família", "Casal", "Investidor", "Estudante"],
  },
  {
    id: "tom",
    pergunta: "Qual o tom do texto?",
    type: "single",
    key: "tom",
    options: ["Sofisticado", "Persuasivo", "Objetivo"],
  },
  {
    id: "observacoes",
    pergunta: "Quer adicionar alguma observação extra? (opcional)",
    type: "fields",
    opcional: true,
    fields: [{ key: "observacoes", label: "Observações", type: "text", optional: true }],
  },
  {
    id: "contato",
    pergunta: "Por último, seus dados pro rodapé:",
    type: "fields",
    fields: [
      { key: "imobiliaria", label: "Imobiliária", type: "text", optional: true },
      { key: "nome_corretor", label: "Seu nome", type: "text", optional: true },
      { key: "telefone", label: "WhatsApp", type: "text", optional: true },
    ],
  },
];
