// src/app/(admin)/camisas/page.tsx
import Link from "next/link"
import { Suspense } from "react"
import { Plus } from "lucide-react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { buttonVariants } from "@/components/ui/button-variants"
import { CamisaTable } from "@/components/admin/camisa-table"
import { CamisaFilters } from "@/components/admin/camisa-filters"
import { PaginationBar } from "@/components/admin/pagination-bar"
import { isFullAccess } from "@/lib/permissions"
import type { AppRole } from "@/lib/permissions"

export const metadata = { title: "Camisas — Admin" }

const PAGE_SIZE = 20

type SearchParams = { club?: string; brand?: string; year?: string; page?: string }

export default async function CamisasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { club, brand, year, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10))

  const session = await auth.api.getSession({ headers: await headers() })
  const viewerRole = ((session?.user as { role?: string })?.role ?? "user") as AppRole

  let canCreate = isFullAccess(viewerRole)
  let canEdit = isFullAccess(viewerRole)
  let canDelete = isFullAccess(viewerRole)

  if (viewerRole === "user") {
    const perm = await prisma.userPermission.findUnique({
      where: { userId: session!.user.id },
    })
    canCreate = perm?.canCreateCamisa ?? false
    canEdit = perm?.canEditCamisa ?? false
    canDelete = perm?.canDeleteCamisa ?? false
  }

  const where = {
    ...(club ? { club: { contains: club, mode: "insensitive" as const } } : {}),
    ...(brand ? { brand: { contains: brand, mode: "insensitive" as const } } : {}),
    ...(year ? { year: { equals: parseInt(year, 10) } } : {}),
  }

  const [camisas, total] = await Promise.all([
    prisma.camisa.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.camisa.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Prisma retorna price como Decimal — serializar para string antes de passar ao Client Component
  const camisasSerialized = camisas.map((c) => ({
    ...c,
    price: c.price.toString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Camisas
          <span className="ml-2 text-base font-normal text-slate-400">({total})</span>
        </h1>
        {canCreate && (
          <Link href="/camisas/new" className={buttonVariants()}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Camisa
          </Link>
        )}
      </div>
      <Suspense fallback={<div className="mb-4 h-10 w-full max-w-sm animate-pulse rounded-md bg-slate-200" />}>
        <CamisaFilters />
      </Suspense>
      <CamisaTable camisas={camisasSerialized} canEdit={canEdit} canDelete={canDelete} />
      <Suspense fallback={<div className="mt-4 h-8 w-52 animate-pulse rounded-md bg-slate-200" />}>
        <PaginationBar page={page} totalPages={totalPages} basePath="/camisas" />
      </Suspense>
    </div>
  )
}
