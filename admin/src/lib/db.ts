import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const dbUrl =
  (process.env.DATABASE_URL ?? "") +
  (process.env.DATABASE_URL?.includes("?") ? "&" : "?") +
  "connection_limit=5&pool_timeout=20"

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: dbUrl })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
