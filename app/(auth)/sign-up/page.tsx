import { redirectIfAuthenticated } from "@/modules/auth/actions/session"
import { SignUpForm } from "@/modules/auth/components/sign-up-form"

export default async function SignUpPage() {
  await redirectIfAuthenticated()

  return <SignUpForm />
}
