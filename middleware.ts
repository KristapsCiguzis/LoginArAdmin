import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin")
  const isAdminApi = request.nextUrl.pathname.startsWith("/api/admin")

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return null
  }

  if (!isAuth) {
    let from = request.nextUrl.pathname
    if (request.nextUrl.search) {
      from += request.nextUrl.search
    }
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, request.url))
  }

  if ((isAdminPage || isAdminApi) && !token.isAdmin) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return null
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login"],
}

