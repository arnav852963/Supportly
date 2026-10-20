"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { APIError } from "better-auth/api"
import { auth } from "@/lib/auth"
import {
  signInSchema,
  signUpSchema,
  type SignInValues,
  type SignUpValues,
} from "@/modules/auth/schema"

type ActionResult = { error: string }

export async function signUpAction(values: SignUpValues): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await auth.api.signUpEmail({
      body: parsed.data,
      headers: await headers(),
    })
  } catch (error) {
    console.error("signUpAction error:", error)
    if (error instanceof APIError) return { error: error.message }
    return { error: "Something went wrong. Please try again." }
  }

  // redirect() throws internally, so it must stay outside the try/catch.
  redirect("/")
}

export async function signInAction(values: SignInValues): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await auth.api.signInEmail({
      body: parsed.data,
      headers: await headers(),
    })
  } catch (error) {
    console.error("signInAction error:", error)
    if (error instanceof APIError) return { error: error.message }
    return { error: "Something went wrong. Please try again." }
  }

  redirect("/")
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() })
  redirect("/sign-in")
}
