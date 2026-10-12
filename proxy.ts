import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { PUBLIC_ROUTES } from "@/modules/auth/constants"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Auth pages are open to everyone.
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next()

  const session = await auth.api.getSession({ headers: request.headers })
  if (session) return NextResponse.next()

  return NextResponse.redirect(new URL("/sign-in", request.url))
}

export const config = {
  // Skip API routes (incl. /api/auth), Next internals, and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
