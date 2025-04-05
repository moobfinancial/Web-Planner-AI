import { useSession, signIn, signOut } from "next-auth/react"

export const useAuth = () => {
  const { data: session, status } = useSession()

  const handleSignIn = async () => {
    await signIn("credentials", {
      redirect: false,
      email: "",
      password: "",
    })
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return {
    session,
    status,
    handleSignIn,
    handleSignOut,
  }
}
