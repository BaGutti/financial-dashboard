import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rutas que requieren autenticación
  const protectedRoutes = ["/dashboard"];

  // Rutas que requieren NO estar autenticado
  const authRoutes = ["/auth/login", "/auth/register"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  const isAuthRoute = authRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  // Si no hay sesión y está intentando acceder a una ruta protegida
  if (!session && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Si ya está autenticado y está intentando acceder a rutas de auth
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
