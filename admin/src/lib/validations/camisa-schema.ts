// src/lib/validations/camisa-schema.ts
import { z } from "zod"

export const CAMISA_MODELS = [
  "titular",
  "reserva",
  "camisa 3",
  "treino",
  "viagem",
] as const

export const camisaSchema = z.object({
  club: z.string().min(1, "Clube é obrigatório").max(120),
  brand: z.string().min(1, "Marca é obrigatória").max(80),
  model: z.enum(CAMISA_MODELS, { error: "Modelo inválido" }),
  year: z
    .number({ message: "Ano deve ser um número" })
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  price: z
    .number({ message: "Preço deve ser um número" })
    .positive("Preço deve ser positivo")
    .multipleOf(0.01),
  imageUrl: z
    .union([
      z.string().url("URL inválida").max(2048),
      z.literal("").transform(() => undefined),
    ])
    .optional(),
})

export type CamisaInput = z.infer<typeof camisaSchema>
