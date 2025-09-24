// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  // Criar cliente Supabase para middleware
  const supabase = createRouteHandlerClient({ request, response: NextResponse.next() })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirecionar usuários não logados
  if (!user && !request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configuração de rotas que o middleware deve interceptar
export const config = {
  matcher: ["/dashboard/:path*"], // ajuste para suas rotas protegidas
}
