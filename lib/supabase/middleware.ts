// middleware.ts

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set, update the request's cookies.
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          // Also update the response's cookies.
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request's cookies.
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          // Also update the response's cookies.
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // This call is essential to refresh the session cookie if it has expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define as rotas públicas que não exigem autenticação.
  const publicPaths = ["/auth/login"];

  // Se o usuário não estiver logado e a rota não for pública, redireciona para o login.
  if (!user && !publicPaths.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return response;
}

// Configuração para definir quais rotas o middleware deve observar.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
