import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

async function verifyTokenWithRole(token: string, requiredRole?: string) {
  try {
    const { verifyJWT } = await import("@/lib/auth/jwt")
    const payload = await verifyJWT(token)

    if (!payload) {
      return null
    }

    if (requiredRole && payload.role !== requiredRole) {
      return null
    }

    return payload
  } catch (error) {
    console.error("[v0] Token verification failed in middleware:", error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const pathname = request.nextUrl.pathname

  const publicRoutes = [
    "/auth/login",
    "/auth/sign-up",
    "/auth/sign-up-success",
    "/admin/login",
    "/",
    "/programs",
    "/tours",
    "/community",
  ]

  // Allow public routes without token
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    const payload = await verifyTokenWithRole(token, "admin")
    if (!payload) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/learn") || pathname.startsWith("/enroll")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    const payload = await verifyTokenWithRole(token)
    if (!payload) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
