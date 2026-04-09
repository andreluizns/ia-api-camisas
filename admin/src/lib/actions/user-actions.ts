// src/lib/actions/user-actions.ts
"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createUserSchema, updateUserSchema } from "@/lib/validations/user-schema"
import type { ActionResult } from "./camisa-actions"
import { canEditUser, canManageMasters } from "@/lib/permissions"
import type { AppRole } from "@/lib/permissions"

async function getViewerRole(): Promise<AppRole> {
  const session = await auth.api.getSession({ headers: await headers() })
  return ((session?.user as { role?: string })?.role ?? "user") as AppRole
}

export async function createUser(formData: unknown): Promise<ActionResult> {
  const parsed = createUserSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const viewerRole = await getViewerRole()

  if (parsed.data.role === "master" && !canManageMasters(viewerRole)) {
    return { success: false, error: "Sem permissão para criar usuários Master" }
  }

  try {
    // Better Auth admin plugin só aceita "user" | "admin" no createUser
    // Para "master", criamos como "user" e atualizamos via Prisma logo em seguida
    const createRole = parsed.data.role === "master" ? "user" : parsed.data.role

    const result = await auth.api.createUser({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        role: createRole,
      },
      headers: await headers(),
    })

    if (!result?.user) {
      return { success: false, error: "Erro ao criar usuário" }
    }

    if (parsed.data.role === "master") {
      await prisma.user.update({
        where: { id: result.user.id },
        data: { role: "master" },
      })
    }

    if (parsed.data.role === "user" && parsed.data.permissions) {
      await prisma.userPermission.upsert({
        where: { userId: result.user.id },
        create: { userId: result.user.id, ...parsed.data.permissions },
        update: { ...parsed.data.permissions },
      })
    }

    revalidatePath("/users")
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao criar usuário"
    return { success: false, error: msg }
  }
}

export async function updateUser(id: string, formData: unknown): Promise<ActionResult> {
  const parsed = updateUserSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const viewerRole = await getViewerRole()
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
  if (!target) return { success: false, error: "Usuário não encontrado" }

  if (!canEditUser(viewerRole, target.role as AppRole)) {
    return { success: false, error: "Sem permissão para editar este usuário" }
  }

  if (parsed.data.role === "master" && !canManageMasters(viewerRole)) {
    return { success: false, error: "Sem permissão para atribuir papel Master" }
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        updatedAt: new Date(),
      },
    })

    if (parsed.data.role === "user" && parsed.data.permissions) {
      await prisma.userPermission.upsert({
        where: { userId: id },
        create: { userId: id, ...parsed.data.permissions },
        update: { ...parsed.data.permissions },
      })
    } else if (parsed.data.role !== "user") {
      await prisma.userPermission.deleteMany({ where: { userId: id } })
    }

    revalidatePath("/users")
    revalidatePath(`/users/${id}`)
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao atualizar usuário" }
  }
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const viewerRole = await getViewerRole()
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
  if (!target) return { success: false, error: "Usuário não encontrado" }

  if (!canEditUser(viewerRole, target.role as AppRole)) {
    return { success: false, error: "Sem permissão para excluir este usuário" }
  }

  try {
    await prisma.session.deleteMany({ where: { userId: id } })
    await prisma.account.deleteMany({ where: { userId: id } })
    await prisma.userPermission.deleteMany({ where: { userId: id } })
    await prisma.user.delete({ where: { id } })
    revalidatePath("/users")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao deletar usuário" }
  }
}
