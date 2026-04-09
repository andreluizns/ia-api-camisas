// src/app/(admin)/camisas/[id]/page.tsx
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { CamisaForm } from "@/components/admin/camisa-form"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  if (id === "new") return { title: "Nova Camisa — Admin" }
  return { title: "Editar Camisa — Admin" }
}

export default async function CamisaDetailPage({ params }: Props) {
  const { id } = await params

  if (id === "new") {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Nova Camisa</h1>
        <CamisaForm mode="create" />
      </div>
    )
  }

  const camisa = await prisma.camisa.findUnique({ where: { id } })
  if (!camisa) notFound()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Editar Camisa</h1>
      <CamisaForm camisa={camisa} mode="edit" />
    </div>
  )
}
