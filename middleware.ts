import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(request: NextRequest) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
        
        if (isAdminRoute) {
          return token?.role === "ADMIN"
        }
        
        return !!token
      },
    },
    pages: {
      signIn: "/login",
      signOut: "/login",
      error: "/login"
    }
  }
)

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)",
  ],
}
