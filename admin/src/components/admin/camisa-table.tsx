// src/components/admin/camisa-table.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Pencil, Shirt, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteCamisa } from "@/lib/actions/camisa-actions"

type CamisaSerialized = {
  id: string
  club: string
  brand: string
  model: string
  year: number
  price: string
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

type Props = {
  camisas: CamisaSerialized[]
  canEdit?: boolean
  canDelete?: boolean
}

export function CamisaTable({ camisas, canEdit = true, canDelete = true }: Props) {
  const router = useRouter()
  const [toDelete, setToDelete] = useState<CamisaSerialized | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    const result = await deleteCamisa(toDelete.id)
    setDeleting(false)
    setToDelete(null)
    if (result.success) {
      toast.success("Camisa excluída com sucesso")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const hasActions = canEdit || canDelete

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Clube</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Preço</TableHead>
              {hasActions && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {camisas.length === 0 && (
              <TableRow>
                <TableCell colSpan={hasActions ? 7 : 6} className="py-8 text-center text-slate-400">
                  Nenhuma camisa cadastrada
                </TableCell>
              </TableRow>
            )}
            {camisas.map((camisa) => (
              <TableRow key={camisa.id}>
                <TableCell>
                  {camisa.imageUrl ? (
                    <Image
                      src={camisa.imageUrl}
                      alt={`${camisa.club} ${camisa.model}`}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100">
                      <Shirt className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{camisa.club}</TableCell>
                <TableCell>{camisa.brand}</TableCell>
                <TableCell className="capitalize">{camisa.model}</TableCell>
                <TableCell>{camisa.year}</TableCell>
                <TableCell>
                  {Number(camisa.price).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                {hasActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit && (
                        <Link
                          href={`/camisas/${camisa.id}`}
                          className={buttonVariants({ variant: "ghost", size: "icon" })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer text-red-500 hover:text-red-600"
                          onClick={() => setToDelete(camisa)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a camisa{" "}
              <strong>
                {toDelete?.club} — {toDelete?.model}
              </strong>
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
