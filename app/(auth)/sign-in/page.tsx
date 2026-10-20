import { Suspense } from "react"
import { redirectIfAuthenticated } from "@/modules/auth/actions/session"
import { SignInForm } from "@/modules/auth/components/sign-in-form"

async function AuthCheck() {
  await redirectIfAuthenticated()
  return null
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInForm />}>
      <AuthCheck />
      <SignInForm />
    </Suspense>
  )
}
