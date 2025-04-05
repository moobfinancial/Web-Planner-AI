import NextAuth, { AuthOptions, DefaultSession } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextRequest } from "next/server"

// Ensure Prisma client is properly initialized
const prisma = new PrismaClient()

// Test the connection
async function testConnection() {
  try {
    await prisma.$connect()
    console.log("Database connection successful")
  } catch (error) {
    console.error("Database connection error:", error)
    throw error
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "USER" | "ADMIN"
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: "USER" | "ADMIN"
    name?: string | null
    email?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "USER" | "ADMIN"
  }
}

// Test the connection when the module loads
testConnection().catch(console.error)

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user || !user?.password) {
            return null
          }

          const isCorrectPassword = await compare(
            credentials.password,
            user.password
          )

          if (!isCorrectPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24 * 7, // 7 days
  },
  pages: {
    signIn: "/admin/login",
    signOut: "/admin/login",
    error: "/admin/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "USER" | "ADMIN"
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      
      // Allow admin routes if user has admin role
      if (url.startsWith("/admin")) return url
      
      // For other URLs, only allow if they start with baseUrl
      return url.startsWith(baseUrl) ? url : baseUrl
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
