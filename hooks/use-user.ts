import { useEffect, useState } from 'react'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/prisma/client"

export function useUser() {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await getServerSession(authOptions)
        
        if (session?.user?.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email.toLowerCase() }
          })

          if (dbUser) {
            setUser(dbUser)
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading }
}
