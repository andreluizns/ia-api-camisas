// src/app/(admin)/users/[id]/page.tsx
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { UserForm } from "@/components/admin/user-form"
import { canEditUser } from "@/lib/permissions"
import type { AppRole } from "@/lib/permissions"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  if (id === "new") return { title: "Novo Usuário — Admin" }
  return { title: "Editar Usuário — Admin" }
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  const viewerRole = ((session?.user as { role?: string })?.role ?? "user") as AppRole

  if (id === "new") {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Novo Usuário</h1>
        <UserForm mode="create" viewerRole={viewerRole} />
      </div>
    )
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { permission: true },
  })
  if (!user) notFound()

  const targetRole = user.role as AppRole
  if (!canEditUser(viewerRole, targetRole)) notFound()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Editar Usuário</h1>
      <UserForm user={user} mode="edit" viewerRole={viewerRole} />
    </div>
  )
}
