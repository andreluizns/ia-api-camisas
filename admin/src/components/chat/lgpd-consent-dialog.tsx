"use client"

import { useState } from "react"
import { Loader2, ShieldCheck } from "lucide-react"

type Props = {
  onConsent: (name: string, city: string) => Promise<void>
}

export function LgpdConsentDialog({ onConsent }: Props) {
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed || !name.trim() || !city.trim()) return
    setLoading(true)
    await onConsent(name.trim(), city.trim())
  }

  const canSubmit = agreed && name.trim().length > 0 && city.trim().length > 0 && !loading

  return (
    <div className="flex h-full items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

        {/* Header do card */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 pb-5 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Assistente
              </p>
              <h2 className="text-xl font-bold text-white">
                Bem-vindo ao Chat!
              </h2>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <p className="text-sm text-slate-500">
            Informe seus dados para personalizarmos o atendimento.
          </p>

          {/* Campos */}
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Seu nome <span className="text-emerald-600">*</span>
              </label>
              <input
                type="text"
                placeholder="João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Sua cidade <span className="text-emerald-600">*</span>
              </label>
              <input
                type="text"
                placeholder="São Paulo"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:opacity-50"
              />
            </div>
          </div>

          {/* LGPD */}
          <div className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="mt-0.5 shrink-0">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-700">Aviso LGPD:</span>{" "}
              Seu nome e cidade serão usados exclusivamente para fins de análise interna. Não
              compartilhamos dados com terceiros. Exclusão via{" "}
              <span className="text-emerald-600">privacidade@loja.com.br</span>.
            </p>
          </div>

          {/* Checkbox */}
          <label className="flex cursor-pointer items-start gap-3">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={loading}
              />
              <div className="flex h-4 w-4 items-center justify-center rounded border border-slate-300 transition-colors peer-checked:border-emerald-500 peer-checked:bg-emerald-500">
                {agreed && (
                  <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-xs leading-relaxed text-slate-500">
              Concordo com o registro do meu nome e cidade para melhoria do serviço, conforme a LGPD.
            </span>
          </label>

          {/* Botão */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Iniciando chat...
              </>
            ) : (
              "Entrar no Chat →"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
