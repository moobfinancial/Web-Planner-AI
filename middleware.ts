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

// Add this config to specify which routes the middleware should run on.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - api/public (Example: for public API endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (the login page itself)
     */
    '/((?!api/auth|api/public|_next/static|_next/image|favicon.ico|login).*)',
  ],
}
