import { useEffect, useState } from 'react'
import { prisma } from '@/prisma/client'

interface User {
  id: string
  name: string
  email: string
}

export function useUserSearch(query: string) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setUsers([])
      return
    }

    setIsLoading(true)
    const searchUsers = async () => {
      try {
        const results = await prisma.user.findMany({
          where: {
            OR: [
              { email: { contains: query.toLowerCase(), mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } }
            ]
          },
          select: {
            id: true,
            name: true,
            email: true
          }
        })
        setUsers(results)
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(searchUsers, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  return { users, isLoading }
}
