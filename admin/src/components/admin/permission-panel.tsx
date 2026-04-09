"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export type PermissionValues = {
  canCreateCamisa: boolean
  canEditCamisa: boolean
  canDeleteCamisa: boolean
  canManageUsers: boolean
}

const PERMISSION_LABELS: { key: keyof PermissionValues; label: string; description: string }[] = [
  {
    key: "canCreateCamisa",
    label: "Cadastrar camisas",
    description: "Pode criar novos registros de camisas",
  },
  {
    key: "canEditCamisa",
    label: "Editar camisas",
    description: "Pode modificar camisas existentes",
  },
  {
    key: "canDeleteCamisa",
    label: "Excluir camisas",
    description: "Pode remover camisas do catálogo",
  },
  {
    key: "canManageUsers",
    label: "Gerenciar usuários",
    description: "Pode criar e editar usuários (exceto Masters)",
  },
]

type Props = {
  values: PermissionValues
  onChange: (key: keyof PermissionValues, checked: boolean) => void
  disabled?: boolean
}

export function PermissionPanel({ values, onChange, disabled }: Props) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="mb-3 text-sm font-semibold text-amber-800">
        Permissões de edição
      </p>
      <div className="space-y-3">
        {PERMISSION_LABELS.map(({ key, label, description }) => (
          <div key={key} className="flex items-start gap-3">
            <Checkbox
              id={`perm-${key}`}
              checked={values[key]}
              onCheckedChange={(v) => onChange(key, !!v)}
              disabled={disabled}
              className="mt-0.5"
            />
            <Label htmlFor={`perm-${key}`} className="cursor-pointer space-y-0.5">
              <span className="text-sm font-medium text-slate-800">{label}</span>
              <p className="text-xs text-slate-500">{description}</p>
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
