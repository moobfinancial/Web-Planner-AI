// Add this line to explicitly mark the route as dynamic
export const dynamic = 'force-dynamic';

import NextAuth, { AuthOptions, DefaultSession } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextRequest } from "next/server"

// Import email sending utilities and template
import { sendEmail } from '@/lib/email';
import WelcomeEmail from '@/emails/welcome-email';

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
      image?: string | null
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
      console.log("[NextAuth Session Callback] Token received:", JSON.stringify(token)); // Log token
      if (token?.id && session.user) {
        let dbUser = null;
        try {
          console.log(`[NextAuth Session Callback] Finding user with ID: ${token.id}`);
          dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, image: true },
          });
          console.log("[NextAuth Session Callback] DB User found:", JSON.stringify(dbUser)); // Log DB result
        } catch (e) {
           console.error("[NextAuth Session Callback] Error fetching user from DB:", e);
        }

        if (dbUser) {
          session.user.id = token.id as string;
          session.user.role = dbUser.role as "USER" | "ADMIN";
          session.user.image = dbUser.image;
          console.log(`[NextAuth Session Callback] Setting session role to: ${session.user.role}`); // Log role being set
        } else {
          console.error(`[NextAuth Session Callback] User not found in DB for token id: ${token.id}`);
        }
      } else {
         console.log("[NextAuth Session Callback] Token ID or session.user missing.");
      }
      console.log("[NextAuth Session Callback] Returning session:", JSON.stringify(session)); // Log final session
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      // Disallows callback URLs on different origins
      return baseUrl // Default redirect to base URL
    }
  },
  events: {
    async createUser({ user }) {
      console.log(`New user created: ${user.id}, Email: ${user.email}`);
      if (user.email) { // Ensure email exists before sending
        try {
          const result = await sendEmail({
            to: user.email,
            subject: `Welcome to Web Planner AI!`, // Customize subject if needed
            react: WelcomeEmail({ name: user.name, appName: "Web Planner AI" }), // Pass user name
          });
          if (result.success) {
            console.log(`Welcome email sent successfully to ${user.email}`);
          } else {
            console.error(`Failed to send welcome email to ${user.email}: ${result.error}`);
            // Decide if you need more robust error handling/logging here
          }
        } catch (error) {
           console.error(`Error triggering welcome email for ${user.email}:`, error);
        }
      }
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
