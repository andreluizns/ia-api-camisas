// src/app/api/admin/chat-session/[id]/route.ts
// Autenticação garantida pelo middleware (matcher: /api/admin/:path*)
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  })

  return NextResponse.json({ messages })
}
