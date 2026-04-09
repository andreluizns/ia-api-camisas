// src/app/api/admin/relatorio/camisas/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  // Busca todos os clubes distintos
  const clubs = await prisma.camisa.findMany({
    distinct: ["club"],
    select: { club: true },
    orderBy: { club: "asc" },
  })

  if (clubs.length === 0) {
    return NextResponse.json({ clubs: [], matrix: [] })
  }

  // Para cada clube, conta mensagens de usuário que contêm o nome do time
  const clubNames = clubs.map((c) => c.club)

  // Conta menções por clube (top 50)
  const mentionCounts = await Promise.all(
    clubNames.map(async (club) => {
      const count = await prisma.chatMessage.count({
        where: {
          role: "user",
          content: { contains: club, mode: "insensitive" },
        },
      })
      return { club, count }
    })
  )

  const topClubs = mentionCounts
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)

  if (topClubs.length === 0) {
    return NextResponse.json({ clubs: topClubs, matrix: [] })
  }

  // Monta matrix: city × club → count
  // Usa apenas os top 20 clubes para manter o gráfico legível
  const matrixClubs = topClubs.slice(0, 20).map((c) => c.club)

  const allCities = await prisma.chatSession.findMany({
    distinct: ["city"],
    select: { city: true },
    orderBy: { city: "asc" },
  })
  const cities = allCities.map((c) => c.city)

  const matrixRows = await Promise.all(
    cities.map(async (city) => {
      const cols = await Promise.all(
        matrixClubs.map(async (club) => {
          const count = await prisma.chatMessage.count({
            where: {
              role: "user",
              content: { contains: club, mode: "insensitive" },
              session: { city },
            },
          })
          return { club, count }
        })
      )
      return { city, cols }
    })
  )

  // Remove cidades sem nenhuma menção
  const filteredMatrix = matrixRows.filter((row) =>
    row.cols.some((c) => c.count > 0)
  )

  return NextResponse.json({ clubs: topClubs, matrix: filteredMatrix, matrixClubs })
}
