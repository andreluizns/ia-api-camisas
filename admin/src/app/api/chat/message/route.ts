// src/app/api/chat/message/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"

const messageSchema = z.object({
  sessionId: z.string().uuid("sessionId deve ser um UUID válido"),
  message: z.string().min(1).max(2000),
})

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3333"

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const parsed = messageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    )
  }

  const { sessionId, message } = parsed.data

  // Verificar que a sessão existe
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } })
  if (!session) {
    return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
  }

  // Salvar mensagem do usuário
  await prisma.chatMessage.create({
    data: { sessionId, role: "user", content: message },
  })

  // Chamar o backend Fastify
  let reply = "Desculpe, não consegui processar sua consulta. Tente novamente."
  let items: unknown[] = []

  try {
    const backendRes = await fetch(`${BACKEND_URL}/camisas/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search: message }),
    })

    if (backendRes.ok) {
      const data = await backendRes.json()
      reply = data.reply ?? reply
      items = data.items ?? []
    }
  } catch {
    // Backend indisponível — retorna a resposta de fallback sem quebrar
  }

  // Salvar resposta do assistente
  await prisma.chatMessage.create({
    data: { sessionId, role: "assistant", content: reply },
  })

  return NextResponse.json({ reply, items })
}
