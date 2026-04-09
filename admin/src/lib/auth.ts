import { betterAuth } from "better-auth"
import { admin } from "better-auth/plugins"
import { adminAc, userAc } from "better-auth/plugins/admin/access"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./db"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    usePlural: false,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin", "master"],
      roles: {
        admin: adminAc,
        master: adminAc, // master tem as mesmas capacidades que admin no Better Auth
        user: userAc,
      },
    }),
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
