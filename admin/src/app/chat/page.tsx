"use client"

import { useState } from "react"
import { LgpdConsentDialog } from "@/components/chat/lgpd-consent-dialog"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userName, setUserName] = useState("")

  async function handleConsent(name: string, city: string) {
    const res = await fetch("/api/chat/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, city }),
    })

    if (res.ok) {
      const data = await res.json()
      setUserName(name)
      setSessionId(data.sessionId)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3.5 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-900">Chat de Camisas</h1>
          <p className="text-xs text-slate-400">Assistente com IA · Catálogo completo</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-400">Online</span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {!sessionId ? (
          <LgpdConsentDialog onConsent={handleConsent} />
        ) : (
          <ChatInterface sessionId={sessionId} userName={userName} />
        )}
      </div>
    </div>
  )
}
