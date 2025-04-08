import type { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/prisma/client"

import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string
    role: "USER" | "ADMIN"
  }
  
  interface Session extends DefaultSession {
    user: {
      id: string
      role: "USER" | "ADMIN"
      image?: string | null
    } & DefaultSession["user"]
  }

  interface JWT {
    id: string
    role: "USER" | "ADMIN"
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        const crypto = require('crypto')
        if (!user || !crypto.timingSafeEqual(
          Buffer.from(user.password),
          Buffer.from(credentials.password)
        )) return null

        return {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
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
      if (token?.id && session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, image: true },
        });

        if (dbUser) {
          session.user.id = token.id as string;
          session.user.role = dbUser.role as "USER" | "ADMIN";
          session.user.image = dbUser.image;
        } else {
          console.error(`Session callback: User not found for token id: ${token.id}`);
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      
      return url.startsWith(baseUrl) ? url : baseUrl
    }
  },
  pages: {
    signIn: "/login", 
    error: "/login", 
    // Consider adding specific admin error page if needed: error: "/auth/admin-error"
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
