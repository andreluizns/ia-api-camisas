// src/components/admin/user-table.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteUser } from "@/lib/actions/user-actions"
import type { AppRole } from "@/lib/permissions"
import { canEditUser } from "@/lib/permissions"

type UserWithPermission = {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
  permission: {
    canCreateCamisa: boolean
    canEditCamisa: boolean
    canDeleteCamisa: boolean
    canManageUsers: boolean
  } | null
}

type Props = {
  users: UserWithPermission[]
  viewerRole: AppRole
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    master: "bg-violet-100 text-violet-700 border border-violet-200",
    admin: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    user: "bg-slate-100 text-slate-600 border border-slate-200",
  }
  const labels: Record<string, string> = {
    master: "Master",
    admin: "Admin",
    user: "Usuário",
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[role] ?? styles.user}`}>
      {labels[role] ?? role}
    </span>
  )
}

export function UserTable({ users, viewerRole }: Props) {
  const router = useRouter()
  const [toDelete, setToDelete] = useState<UserWithPermission | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    const result = await deleteUser(toDelete.id)
    setDeleting(false)
    setToDelete(null)
    if (result.success) {
      toast.success("Usuário excluído com sucesso")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-slate-400">
                  Nenhum usuário cadastrado
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {canEditUser(viewerRole, user.role as AppRole) && (
                      <>
                        <Link
                          href={`/users/${user.id}`}
                          className={buttonVariants({ variant: "ghost", size: "icon" })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer text-red-500 hover:text-red-600"
                          onClick={() => setToDelete(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
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
              Tem certeza que deseja excluir o usuário{" "}
              <strong>{toDelete?.name}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
