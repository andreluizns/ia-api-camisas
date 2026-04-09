// src/components/admin/chat-report-table.tsx
"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Loader2, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type ChatMessage = {
  id: string
  role: string
  content: string
  createdAt: string
}

type ChatSessionSummary = {
  id: string
  name: string
  city: string
  createdAt: Date
  _count: { messages: number }
  userMessageCount: number
}

type Props = { sessions: ChatSessionSummary[] }

export function ChatReportTable({ sessions }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({})
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function toggleSession(sessionId: string) {
    if (expandedId === sessionId) {
      setExpandedId(null)
      return
    }

    setExpandedId(sessionId)

    // Já carregou antes — não busca de novo
    if (messages[sessionId]) return

    setLoadingId(sessionId)
    try {
      const res = await fetch(`/api/admin/chat-session/${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => ({ ...prev, [sessionId]: data.messages }))
      }
    } finally {
      setLoadingId(null)
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-md border bg-white py-16 text-center text-slate-400">
        Nenhuma conversa registrada ainda.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => {
        const isOpen = expandedId === session.id
        const isLoading = loadingId === session.id
        const sessionMessages = messages[session.id] ?? []

        return (
          <div key={session.id} className="overflow-hidden rounded-md border bg-white">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left hover:bg-slate-50"
              onClick={() => toggleSession(session.id)}
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium text-slate-900">{session.name}</p>
                  <p className="text-sm text-slate-500">{session.city}</p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {session.userMessageCount} pergunta{session.userMessageCount !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                {new Date(session.createdAt).toLocaleString("pt-BR")}
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {isOpen && !isLoading && (
              <div className="max-h-96 space-y-3 overflow-y-auto border-t bg-slate-50 p-4">
                {sessionMessages.length === 0 && (
                  <p className="text-center text-sm text-slate-400">Sem mensagens nesta sessão.</p>
                )}
                {sessionMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-slate-900 text-white"
                          : "border bg-white text-slate-700"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className="mt-1 text-xs opacity-60">
                        {new Date(msg.createdAt).toLocaleTimeString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
