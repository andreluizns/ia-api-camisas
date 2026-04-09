"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "@/lib/auth-client"

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const result = await signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    })

    if (result.error) {
      toast.error("Credenciais inválidas. Verifique e-mail e senha.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      {/* Cabeçalho — visível só no mobile (no desktop o painel esquerdo tem o logo) */}
      <div className="mb-8 lg:hidden">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-600">
          Painel Administrativo
        </p>
        <h1 className="font-display mt-1 text-4xl font-bold uppercase leading-none text-slate-900">
          Admin<span className="text-emerald-600">Camisas</span>
        </h1>
      </div>

      <div className="mb-8 hidden lg:block">
        <h2 className="text-2xl font-semibold text-slate-900">Bem-vindo de volta</h2>
        <p className="mt-1 text-sm text-slate-500">Entre com suas credenciais de administrador</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@admin.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="h-10 border-slate-200 bg-slate-50 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            Senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-10 border-slate-200 bg-slate-50 pr-10 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="mt-2 h-10 w-full cursor-pointer bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-500/40"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>
    </div>
  )
}
