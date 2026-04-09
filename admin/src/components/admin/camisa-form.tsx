// src/components/admin/camisa-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Camisa } from "@prisma/client"
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
import { CAMISA_MODELS } from "@/lib/validations/camisa-schema"
import { createCamisa, updateCamisa } from "@/lib/actions/camisa-actions"

type Props = {
  camisa?: Camisa
  mode: "create" | "edit"
}

export function CamisaForm({ camisa, mode }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState<string>(camisa?.model ?? "")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const data = {
      club: form.get("club") as string,
      brand: form.get("brand") as string,
      model: model,
      year: Number(form.get("year")),
      price: Number(form.get("price")),
      imageUrl: (form.get("imageUrl") as string) || undefined,
    }

    const result =
      mode === "create"
        ? await createCamisa(data)
        : await updateCamisa(camisa!.id, data)

    setLoading(false)

    if (result.success) {
      toast.success(mode === "create" ? "Camisa criada!" : "Camisa atualizada!")
      router.push("/camisas")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="space-y-1">
        <Label htmlFor="club">Clube *</Label>
        <Input
          id="club"
          name="club"
          placeholder="Flamengo"
          defaultValue={camisa?.club}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="brand">Marca *</Label>
        <Input
          id="brand"
          name="brand"
          placeholder="Adidas"
          defaultValue={camisa?.brand}
          required
        />
      </div>

      <div className="space-y-1">
        <Label>Modelo *</Label>
        <Select value={model} onValueChange={(v) => setModel(v ?? "")} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o modelo" />
          </SelectTrigger>
          <SelectContent>
            {CAMISA_MODELS.map((m) => (
              <SelectItem key={m} value={m} className="capitalize">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="year">Ano *</Label>
        <Input
          id="year"
          name="year"
          type="number"
          placeholder="2024"
          defaultValue={camisa?.year}
          min={1900}
          max={new Date().getFullYear() + 1}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="price">Preço (R$) *</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          placeholder="299.90"
          defaultValue={camisa?.price ? String(camisa.price) : undefined}
          min={0.01}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="imageUrl">URL da Imagem</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://exemplo.com/camisa.jpg"
          defaultValue={camisa?.imageUrl ?? undefined}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? mode === "create"
              ? "Criando..."
              : "Salvando..."
            : mode === "create"
              ? "Criar Camisa"
              : "Salvar Alterações"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
