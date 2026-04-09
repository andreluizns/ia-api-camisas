// src/lib/actions/camisa-actions.ts
"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { camisaSchema } from "@/lib/validations/camisa-schema"

export type ActionResult =
  | { success: true; data?: unknown }
  | { success: false; error: string }

export async function createCamisa(formData: unknown): Promise<ActionResult> {
  const parsed = camisaSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  try {
    const camisa = await prisma.camisa.create({
      data: {
        ...parsed.data,
        price: parsed.data.price,
        imageUrl: parsed.data.imageUrl ?? null,
      },
    })
    revalidatePath("/camisas")
    return { success: true, data: camisa }
  } catch {
    return { success: false, error: "Erro ao criar camisa" }
  }
}

export async function updateCamisa(
  id: string,
  formData: unknown
): Promise<ActionResult> {
  const parsed = camisaSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  try {
    const camisa = await prisma.camisa.update({
      where: { id },
      data: {
        ...parsed.data,
        price: parsed.data.price,
        imageUrl: parsed.data.imageUrl ?? null,
        updatedAt: new Date(),
      },
    })
    revalidatePath("/camisas")
    revalidatePath(`/camisas/${id}`)
    return { success: true, data: camisa }
  } catch {
    return { success: false, error: "Camisa não encontrada ou erro ao atualizar" }
  }
}

export async function deleteCamisa(id: string): Promise<ActionResult> {
  try {
    await prisma.camisa.delete({ where: { id } })
    revalidatePath("/camisas")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao deletar camisa" }
  }
}
