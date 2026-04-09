import { GoogleGenAI, Type, FunctionCallingConfigMode } from "@google/genai";
import { z } from "zod";
import { env } from "../../../config/env.js";
import type { CamisasRepository } from "../camisas.repository.js";
import type { SearchFilters } from "../camisas.schema.js";

// ── Validação dos argumentos retornados pelo Gemini ────────────────────────────

const toolYearMax = new Date().getFullYear() + 1;

const toolOptionalAno = z.coerce
  .number()
  .int()
  .min(1950)
  .max(toolYearMax)
  .optional();

const toolArgsSchema = z.object({
  clube: z.string().trim().min(1).optional(),
  marca: z.string().trim().min(1).optional(),
  tipo: z.string().trim().min(1).optional(),
  ano: toolOptionalAno,
  ano_min: toolOptionalAno,
  ano_max: toolOptionalAno,
});

// ── Definição da ferramenta para o Gemini ─────────────────────────────────────

const TOOL_NAME = "buscar_camisas";

const BUSCAR_CAMISAS_DECLARATION = {
  name: TOOL_NAME,
  description:
    'Consulta o catálogo de camisas de time por critérios. `clube` = nome do time (Flamengo, Barcelona). `marca` = fabricante (Nike, Adidas, Puma). `tipo` = tipo da camisa: titular, reserva, camisa 3, treino ou viagem. `ano` = ano exato (não misture com ano_min/ano_max). `ano_min`/`ano_max` = faixa de anos. Use {} para pedidos genéricos sem critérios.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      clube: {
        type: Type.STRING,
        description: "Nome do time ou clube (ex.: Flamengo, Barcelona, Real Madrid)",
      },
      marca: {
        type: Type.STRING,
        description: "Fabricante da camisa (ex.: Nike, Adidas, Puma, Umbro)",
      },
      tipo: {
        type: Type.STRING,
        description: "Tipo da camisa: titular, reserva, camisa 3, treino ou viagem",
      },
      ano: {
        type: Type.INTEGER,
        description: "Ano exato da camisa (ex.: 2023). Não use junto com ano_min/ano_max.",
      },
      ano_min: {
        type: Type.INTEGER,
        description: "Limite inferior do ano (inclusive), ex.: 'a partir de 2021' → 2021",
      },
      ano_max: {
        type: Type.INTEGER,
        description: "Limite superior do ano (inclusive), ex.: 'até 2023' → 2023",
      },
    },
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function naturalReply(itemCount: number): string {
  if (itemCount === 0) return "Não encontrei nenhuma camisa no nosso catálogo.";
  if (itemCount === 1) return "Encontrei 1 camisa com essas características.";
  return `Encontrei ${itemCount} camisas no catálogo pra você.`;
}

function toolArgsToFilters(args: Record<string, unknown>): SearchFilters {
  const parsed = toolArgsSchema.safeParse(args);
  if (!parsed.success) return {};

  const { clube, marca, tipo, ano, ano_min: anoMin, ano_max: anoMax } = parsed.data;

  return {
    ...(clube ? { club: clube } : {}),
    ...(marca ? { brand: marca } : {}),
    ...(tipo ? { model: tipo } : {}),
    ...(ano !== undefined ? { year: ano } : {}),
    ...(anoMin !== undefined ? { yearMin: anoMin } : {}),
    ...(anoMax !== undefined ? { yearMax: anoMax } : {}),
  };
}

// ── Serviço ────────────────────────────────────────────────────────────────────

export class AiSearchAgentService {
  private readonly ai: GoogleGenAI;

  constructor(private readonly repository: CamisasRepository) {
    this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  async run(userMessage: string) {
    console.log("MENSAGEM: ", userMessage);

    const response = await this.ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
      config: {
        systemInstruction:
          "Assistente de catálogo de camisas de time de futebol (português). Chame buscar_camisas exatamente uma vez. Preencha `clube` se citar um time; `marca` para o fabricante; `tipo` para o tipo da camisa (titular, reserva, camisa 3, treino ou viagem); `ano` para um ano exato (não misture com ano_min/ano_max); `ano_min` e/ou `ano_max` para intervalos. Combine campos quando fizer sentido.",
        tools: [{ functionDeclarations: [BUSCAR_CAMISAS_DECLARATION] }],
        toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.ANY } },
      },
    });

    // Extrair o function call da resposta
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const functionCallPart = parts.find((p) => p.functionCall != null);
    const args = (functionCallPart?.functionCall?.args ?? {}) as Record<string, unknown>;

    const filters = toolArgsToFilters(args);
    const { items } = await this.repository.searchfilterCamisas({ filters });

    return {
      items,
      reply: naturalReply(items.length),
    };
  }
}
