// src/components/admin/user-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createUser, updateUser } from "@/lib/actions/user-actions"
import { PermissionPanel } from "@/components/admin/permission-panel"
import type { PermissionValues } from "@/components/admin/permission-panel"
import type { AppRole } from "@/lib/permissions"
import { canConfigurePermissions, canManageMasters } from "@/lib/permissions"

type UserWithPermission = {
  id: string
  name: string
  email: string
  role: string
  permission: {
    canCreateCamisa: boolean
    canEditCamisa: boolean
    canDeleteCamisa: boolean
    canManageUsers: boolean
  } | null
}

type Props = {
  user?: UserWithPermission
  mode: "create" | "edit"
  viewerRole: AppRole
}

export function UserForm({ user, mode, viewerRole }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<string>(user?.role ?? "user")
  const [permissions, setPermissions] = useState<PermissionValues>({
    canCreateCamisa: user?.permission?.canCreateCamisa ?? false,
    canEditCamisa: user?.permission?.canEditCamisa ?? false,
    canDeleteCamisa: user?.permission?.canDeleteCamisa ?? false,
    canManageUsers: user?.permission?.canManageUsers ?? false,
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const data = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      password: (form.get("password") as string) || undefined,
      role: role as "master" | "admin" | "user",
      permissions: role === "user" ? permissions : undefined,
    }

    const result =
      mode === "create"
        ? await createUser(data)
        : await updateUser(user!.id, data)

    setLoading(false)

    if (result.success) {
      toast.success(mode === "create" ? "Usuário criado!" : "Usuário atualizado!")
      router.push("/users")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" name="name" placeholder="João Silva" defaultValue={user?.name} required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">E-mail *</Label>
        <Input id="email" name="email" type="email" placeholder="joao@exemplo.com" defaultValue={user?.email} required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">
          Senha {mode === "edit" ? "(deixe em branco para manter)" : "*"}
        </Label>
        <Input id="password" name="password" type="password" placeholder="••••••••" minLength={8} required={mode === "create"} />
      </div>

      <div className="space-y-1">
        <Label>Papel *</Label>
        <Select value={role} onValueChange={(v) => setRole(v ?? "user")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {canManageMasters(viewerRole) && (
              <SelectItem value="master">Master</SelectItem>
            )}
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {role === "user" && canConfigurePermissions(viewerRole) && (
        <PermissionPanel
          values={permissions}
          onChange={(key, checked) =>
            setPermissions((prev) => ({ ...prev, [key]: checked }))
          }
          disabled={loading}
        />
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="cursor-pointer">
          {loading
            ? mode === "create" ? "Criando..." : "Salvando..."
            : mode === "create" ? "Criar Usuário" : "Salvar Alterações"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="cursor-pointer">
          Cancelar
        </Button>
      </div>
    </form>
  )
}
