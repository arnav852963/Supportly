import { redirectIfAuthenticated } from "@/modules/auth/actions/session"
import { SignInForm } from "@/modules/auth/components/sign-in-form"

export default async function SignInPage() {
  await redirectIfAuthenticated()

  return <SignInForm />
}
