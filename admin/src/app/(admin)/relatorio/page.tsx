// src/app/(admin)/relatorio/page.tsx
import { Suspense } from "react"
import { prisma } from "@/lib/db"
import { ChatReportTable } from "@/components/admin/chat-report-table"
import { RelatorioStats } from "@/components/admin/relatorio-stats"
import { PaginationBar } from "@/components/admin/pagination-bar"

export const metadata = { title: "Relatório de Chat — Admin" }

const PAGE_SIZE = 20

type SearchParams = { page?: string }

export default async function RelatorioPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1", 10))

  // Clubes distintos do catálogo para calcular camisas pesquisadas
  const clubsDistinct = await prisma.camisa.findMany({
    distinct: ["club"],
    select: { club: true },
  })

  // Filtro: sessões com ao menos uma mensagem de usuário sobre um clube
  const clubMessageFilter =
    clubsDistinct.length > 0
      ? {
          messages: {
            some: {
              role: "user",
              OR: clubsDistinct.map((c) => ({
                content: { contains: c.club, mode: "insensitive" as const },
              })),
            },
          },
        }
      : {}

  // OR de clubes para contar mensagens
  const clubContentOR =
    clubsDistinct.length > 0
      ? clubsDistinct.map((c) => ({
          content: { contains: c.club, mode: "insensitive" as const },
        }))
      : undefined

  const [totalSessions, totalMessages, cityGroups, totalCamisasPesquisadas, sessions] =
    await Promise.all([
      // Apenas sessões com perguntas sobre times
      prisma.chatSession.count({ where: clubMessageFilter }),
      // Perguntas de usuário que mencionam ao menos um clube do catálogo
      clubContentOR
        ? prisma.chatMessage.count({
            where: { role: "user", OR: clubContentOR },
          })
        : Promise.resolve(0),
      // Usuários únicos por cidade (apenas sessões com times)
      prisma.chatSession.groupBy({
        by: ["city"],
        where: clubMessageFilter,
        _count: { id: true },
      }),
      // Clubes distintos mencionados pelo menos uma vez no chat
      clubContentOR
        ? Promise.all(
            clubsDistinct.map((c) =>
              prisma.chatMessage.count({
                where: {
                  role: "user",
                  content: { contains: c.club, mode: "insensitive" as const },
                },
              })
            )
          ).then((counts) => counts.filter((n) => n > 0).length)
        : Promise.resolve(0),
      // Sessões filtradas por perguntas sobre times
      prisma.chatSession.findMany({
        where: clubMessageFilter,
        include: { _count: { select: { messages: true } } },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
      }),
    ])

  // Conta nomes distintos por cidade para "usuários únicos"
  const cityNameCounts = await Promise.all(
    cityGroups.map(async (g) => {
      const distinctNames = await prisma.chatSession.findMany({
        where: { city: g.city },
        distinct: ["name"],
        select: { name: true },
      })
      return {
        city: g.city,
        users: distinctNames.length,
        sessions: g._count.id,
      }
    })
  )

  const uniqueCities = cityGroups.length

  // Contagem de perguntas por sessão
  const sessionIds = sessions.map((s) => s.id)
  const userMessageCounts = await prisma.chatMessage.groupBy({
    by: ["sessionId"],
    where: { sessionId: { in: sessionIds }, role: "user" },
    _count: { _all: true },
  })
  const userCountMap = Object.fromEntries(
    userMessageCounts.map((r) => [r.sessionId, r._count._all])
  )

  const sessionSummaries = sessions.map((s) => ({
    ...s,
    userMessageCount: userCountMap[s.id] ?? 0,
  }))

  const totalPages = Math.ceil(totalSessions / PAGE_SIZE)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Relatório de Chat</h1>

      <RelatorioStats
        totalSessions={totalSessions}
        totalMessages={totalMessages}
        totalCamisasPesquisadas={totalCamisasPesquisadas}
        uniqueCities={uniqueCities}
        cityData={cityNameCounts}
      />

      <ChatReportTable sessions={sessionSummaries} />

      <Suspense fallback={<div className="mt-4 h-9 w-48 animate-pulse rounded-md bg-slate-200" />}>
        <PaginationBar page={page} totalPages={totalPages} basePath="/relatorio" />
      </Suspense>
    </div>
  )
}
