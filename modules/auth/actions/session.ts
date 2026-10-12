import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Cached per request, so calling it in a layout and a page hits auth only once.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  return prisma.user.findUnique({ where: { id: session.user.id } })
}

// Use in protected pages/layouts/actions. Redirects to sign-in if logged out.
export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect("/sign-in")

  return session
}

// Use on sign-in/sign-up pages. Sends already logged-in users away.
export async function redirectIfAuthenticated(to = "/") {
  const session = await getSession()
  if (session) redirect(to)
}
