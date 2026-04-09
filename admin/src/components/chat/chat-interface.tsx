"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Send, Shirt } from "lucide-react"

type CamisaItem = {
  id: string
  club: string
  brand: string
  model: string
  year: number
  price: string
  imageUrl: string | null
}

type Message = {
  role: "user" | "assistant"
  content: string
  items?: CamisaItem[]
}

type Props = {
  sessionId: string
  userName: string
}

const AIIcon = ({ small }: { small?: boolean }) => (
  <svg
    className={small ? "h-3.5 w-3.5 text-emerald-600" : "h-4 w-4 text-emerald-600"}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
    />
  </svg>
)

export function ChatInterface({ sessionId, userName }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Olá, ${userName}! Sou o assistente de camisas. Pergunte-me sobre qualquer camisa do nosso catálogo — por clube, marca, modelo ou ano. Como posso ajudar?`,
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setLoading(true)

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      })
      const data = res.ok ? await res.json() : null

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.reply ?? "Desculpe, ocorreu um erro. Tente novamente.",
          items: data?.items,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro de conexão. Verifique sua internet e tente novamente." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Histórico de mensagens */}
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 md:px-8">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {/* Avatar do assistente */}
            {msg.role === "assistant" && (
              <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-200">
                <AIIcon small />
              </div>
            )}

            <div className={`max-w-[75%] ${msg.role === "user" ? "max-w-[68%]" : ""}`}>
              {/* Bolha */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "rounded-br-sm bg-emerald-600 text-white"
                    : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Cards de camisas */}
                {msg.items && msg.items.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                      >
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.club}
                            width={44}
                            height={44}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-100">
                            <Shirt className="h-5 w-5 text-emerald-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-800">{item.club}</p>
                          <p className="truncate text-xs capitalize text-slate-400">
                            {item.brand} · {item.model} · {item.year}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-emerald-600">
                            {Number(item.price).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Avatar do usuário */}
            {msg.role === "user" && (
              <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ))}

        {/* Indicador de digitação */}
        {loading && (
          <div className="flex items-end gap-2">
            <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-200">
              <AIIcon small />
            </div>
            <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            placeholder="Pergunte sobre uma camisa..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
