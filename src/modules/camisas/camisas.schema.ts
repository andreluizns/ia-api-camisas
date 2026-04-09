import { z } from "zod";

export const MODELOS_CAMISA = [
  "titular",
  "reserva",
  "camisa 3",
  "treino",
  "viagem",
] as const;

export const createCamisaSchema = z.object({
  club: z.string().min(1),
  brand: z.string().min(1),
  model: z.enum(MODELOS_CAMISA),
  year: z.number().int().min(1950),
  price: z.number().positive(),
  imageUrl: z.string().trim().url().max(2048).optional(),
});

export const searchRequestSchema = z.object({
  search: z.string().min(1),
});

const yearMaxFilter = new Date().getFullYear() + 1;

const optionalFilterYear = z.coerce
  .number()
  .int()
  .min(1950)
  .max(yearMaxFilter)
  .optional();

export const filtersSchema = z.object({
  club: z.string().trim().min(1).optional(),
  brand: z.string().trim().min(1).optional(),
  model: z.string().trim().min(1).optional(),
  year: optionalFilterYear,
  yearMin: optionalFilterYear,
  yearMax: optionalFilterYear,
});

export type SearchCamisasRequestInput = z.infer<typeof searchRequestSchema>;
export type CreateCamisaInput = z.infer<typeof createCamisaSchema>;
export type SearchFilters = z.infer<typeof filtersSchema>;

// ── Schemas de resposta ────────────────────────────────────────────────────────

// Representa uma camisa como retornada pelo banco (via Drizzle ORM)
// Importante: price vem como string do Postgres (tipo numeric), id é UUID string
export const camisaResponseSchema = z.object({
  id: z.string().uuid(),
  club: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number().int(),
  price: z.string(), // Drizzle retorna numeric do Postgres como string
  imageUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Resposta do endpoint POST /camisas/search (AiSearchAgentService.run())
export const searchResponseSchema = z.object({
  items: z.array(camisaResponseSchema),
  reply: z.string(),
});

export type CamisaResponse = z.infer<typeof camisaResponseSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
