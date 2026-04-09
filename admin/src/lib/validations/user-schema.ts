// src/lib/validations/user-schema.ts
import { z } from "zod"

const permissionsSchema = z
  .object({
    canCreateCamisa: z.boolean().default(false),
    canEditCamisa: z.boolean().default(false),
    canDeleteCamisa: z.boolean().default(false),
    canManageUsers: z.boolean().default(false),
  })
  .optional()

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  role: z.enum(["master", "admin", "user"]).default("user"),
  permissions: permissionsSchema,
})

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  email: z.string().email("E-mail inválido"),
  role: z.enum(["master", "admin", "user"]),
  password: z
    .union([
      z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
      z.literal("").transform(() => undefined),
    ])
    .optional(),
  permissions: permissionsSchema,
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
