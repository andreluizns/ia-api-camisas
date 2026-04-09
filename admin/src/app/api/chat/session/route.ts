// src/app/api/chat/session/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"

const sessionSchema = z.object({
  name: z.string().min(1).max(200),
  city: z.string().min(1).max(200),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const parsed = sessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    )
  }

  const session = await prisma.chatSession.create({
    data: {
      name: parsed.data.name,
      city: parsed.data.city,
    },
  })

  return NextResponse.json({ sessionId: session.id })
}
