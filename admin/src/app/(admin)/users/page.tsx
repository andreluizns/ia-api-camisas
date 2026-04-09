// src/app/(admin)/users/page.tsx
import Link from "next/link"
import { Suspense } from "react"
import { Plus } from "lucide-react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { buttonVariants } from "@/components/ui/button-variants"
import { UserTable } from "@/components/admin/user-table"
import { UserSearch } from "@/components/admin/user-search"
import { PaginationBar } from "@/components/admin/pagination-bar"
import { canSeeMasters, canConfigurePermissions } from "@/lib/permissions"
import type { AppRole } from "@/lib/permissions"

export const metadata = { title: "Usuários — Admin" }

const PAGE_SIZE = 20

type SearchParams = { q?: string; page?: string }

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { q, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10))

  const session = await auth.api.getSession({ headers: await headers() })
  const viewerRole = ((session?.user as { role?: string })?.role ?? "user") as AppRole

  // Masters só são visíveis para outros Masters
  const roleFilter = canSeeMasters(viewerRole)
    ? {}
    : { role: { not: "master" } }

  const where = {
    ...roleFilter,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { permission: true },
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const canAdd = canConfigurePermissions(viewerRole)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Usuários
          <span className="ml-2 text-base font-normal text-slate-400">({total})</span>
        </h1>
        {canAdd && (
          <Link href="/users/new" className={buttonVariants()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Link>
        )}
      </div>
      <Suspense fallback={<div className="mb-4 h-10 w-72 animate-pulse rounded-md bg-slate-200" />}>
        <UserSearch />
      </Suspense>
      <UserTable users={users} viewerRole={viewerRole} />
      <Suspense fallback={<div className="mt-4 h-8 w-52 animate-pulse rounded-md bg-slate-200" />}>
        <PaginationBar page={page} totalPages={totalPages} basePath="/users" />
      </Suspense>
    </div>
  )
}
