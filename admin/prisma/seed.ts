// prisma/seed.ts
import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

const dbUrl =
  (process.env.DATABASE_URL ?? "") +
  (process.env.DATABASE_URL?.includes("?") ? "&" : "?") +
  "connection_limit=5&pool_timeout=20"

const adapter = new PrismaPg({ connectionString: dbUrl })
const prisma = new PrismaClient({ adapter })

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql", usePlural: false }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "user", input: false },
    },
  },
})

async function main() {
  console.log("🌱 Iniciando seed...")

  // 1. Admin user
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@admin.com" },
  })

  if (!existingAdmin) {
    const result = await auth.api.signUpEmail({
      body: {
        name: "Administrador",
        email: "admin@admin.com",
        password: "admin123",
      },
    })

    if (result?.user) {
      await prisma.user.update({
        where: { id: result.user.id },
        data: { role: "admin" },
      })
      console.log("✅ Admin criado: admin@admin.com / admin123")
    }
  } else {
    console.log("ℹ️  Admin já existe, pulando...")
  }

  // 2. Usuário Master
  const existingMaster = await prisma.user.findUnique({
    where: { email: "master@master.com" },
  })

  if (!existingMaster) {
    const masterResult = await auth.api.signUpEmail({
      body: {
        name: "Master",
        email: "master@master.com",
        password: "master123",
      },
    })

    if (masterResult?.user) {
      await prisma.user.update({
        where: { id: masterResult.user.id },
        data: { role: "master" },
      })
      console.log("✅ Master criado: master@master.com / master123")
    }
  } else {
    console.log("ℹ️  Master já existe, pulando...")
  }

  // 3. Camisas de exemplo — times da Série A
  const camisasExemplo = [
    { club: "Flamengo", brand: "Adidas", model: "titular", year: 2024, price: 329.9, imageUrl: null },
    { club: "Flamengo", brand: "Adidas", model: "reserva", year: 2024, price: 329.9, imageUrl: null },
    { club: "Palmeiras", brand: "Puma", model: "titular", year: 2024, price: 299.9, imageUrl: null },
    { club: "Palmeiras", brand: "Puma", model: "reserva", year: 2024, price: 299.9, imageUrl: null },
    { club: "Corinthians", brand: "Nike", model: "titular", year: 2024, price: 319.9, imageUrl: null },
    { club: "São Paulo", brand: "Adidas", model: "titular", year: 2024, price: 289.9, imageUrl: null },
    { club: "Grêmio", brand: "Umbro", model: "titular", year: 2024, price: 259.9, imageUrl: null },
    { club: "Internacional", brand: "Adidas", model: "titular", year: 2024, price: 279.9, imageUrl: null },
    { club: "Atlético-MG", brand: "Le Coq Sportif", model: "titular", year: 2024, price: 249.9, imageUrl: null },
    { club: "Cruzeiro", brand: "Adidas", model: "titular", year: 2024, price: 269.9, imageUrl: null },
  ]

  for (const camisa of camisasExemplo) {
    const exists = await prisma.camisa.findFirst({
      where: { club: camisa.club, model: camisa.model, year: camisa.year },
    })
    if (!exists) {
      await prisma.camisa.create({ data: camisa })
    }
  }

  console.log(`✅ Camisas de exemplo verificadas (${camisasExemplo.length} registros)`)
  console.log("🎉 Seed concluído!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
