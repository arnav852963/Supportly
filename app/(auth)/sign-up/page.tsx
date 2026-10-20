import { Suspense } from "react"
import { redirectIfAuthenticated } from "@/modules/auth/actions/session"
import { SignUpForm } from "@/modules/auth/components/sign-up-form"

async function AuthCheck() {
  await redirectIfAuthenticated()
  return null
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpForm />}>
      <AuthCheck />
      <SignUpForm />
    </Suspense>
  )
}
