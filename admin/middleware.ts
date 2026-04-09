// middleware.ts — Edge Runtime (sem imports Node.js)
// Faz apenas verificação leve do cookie de sessão.
// A validação completa (role=admin) fica no src/app/(admin)/layout.tsx
// que roda em Node.js server component.
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login", "/api/auth", "/chat", "/api/chat"]

// Em HTTPS (produção) o Better Auth usa __Secure- como prefixo automaticamente
const SESSION_COOKIE_SECURE = "__Secure-better-auth.session_token"
const SESSION_COOKIE = "better-auth.session_token"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Verificação leve: cookie presente? Se não, redireciona para login.
  // A validação do role=admin é feita no AdminLayout (Node.js, com Prisma).
  const sessionCookie =
    request.cookies.get(SESSION_COOKIE_SECURE) ??
    request.cookies.get(SESSION_COOKIE)
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/camisas/:path*",
    "/users/:path*",
    "/relatorio/:path*",
    "/api/admin/:path*",
  ],
}
