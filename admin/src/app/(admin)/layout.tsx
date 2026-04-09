import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Sidebar } from "@/components/admin/sidebar"
import { Header } from "@/components/admin/header"
import { SessionProvider } from "@/lib/session-context"
import { DEFAULT_PERMISSIONS } from "@/lib/permissions"
import type { AppRole, UserPermissions } from "@/lib/permissions"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) redirect("/login")

  const role = ((session.user as { role?: string }).role ?? "user") as AppRole

  // Apenas master, admin e user têm acesso ao painel
  if (!["master", "admin", "user"].includes(role)) {
    redirect("/login?error=forbidden")
  }

  // Buscar permissões personalizadas (apenas relevante para role=user)
  let permissions: UserPermissions = DEFAULT_PERMISSIONS
  if (role === "user") {
    const perm = await prisma.userPermission.findUnique({
      where: { userId: session.user.id },
    })
    if (perm) {
      permissions = {
        canCreateCamisa: perm.canCreateCamisa,
        canEditCamisa: perm.canEditCamisa,
        canDeleteCamisa: perm.canDeleteCamisa,
        canManageUsers: perm.canManageUsers,
      }
    }
  }

  return (
    <SessionProvider role={role} permissions={permissions} userId={session.user.id}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SessionProvider>
  )
}
