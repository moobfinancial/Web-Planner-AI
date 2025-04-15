import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt"; // Use getToken to manually check session

export async function middleware(request: NextRequest) {
  // Ensure NEXTAUTH_SECRET is available, otherwise getToken won't work
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("Middleware Error: NEXTAUTH_SECRET is not set.");
    // Decide how to handle this - perhaps redirect to an error page or allow if in dev?
    // For now, let's block access if the secret is missing for security.
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = '/login'; // Or a dedicated error page
    errorUrl.searchParams.set('error', 'configuration_error');
    return NextResponse.redirect(errorUrl);
  }

  const token = await getToken({ req: request, secret });
  const { pathname } = request.nextUrl;

  // Define paths that bypass authentication/authorization checks
  const isPublicPath =
    pathname.startsWith('/api/auth') || // NextAuth specific routes
    pathname.startsWith('/api/public') || // Your defined public API routes
    pathname.startsWith('/_next') || // Next.js internals
    pathname.endsWith('favicon.ico') || // Favicon
    pathname === '/login' || // Main user login page
    pathname === '/register' || // Register page
    pathname === '/auth/admin-login' || // Admin login page
    pathname === '/'; // Root path

  // 1. Allow access to explicitly public paths
  if (isPublicPath) {
    return NextResponse.next();
  }

  // --- All paths below this point require some level of authentication/authorization ---

  const isAdminPath = pathname.startsWith('/admin');

  // 2. Handle Admin Paths
  if (isAdminPath) {
    if (token?.role === 'ADMIN') {
      return NextResponse.next(); // User is ADMIN, allow access
    } else {
      // User is not ADMIN or not logged in, redirect to Admin Login
      const url = request.nextUrl.clone();
      url.pathname = '/auth/admin-login';
      // Add callbackUrl so they are redirected back after successful admin login
      url.searchParams.set('from', pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }

  // 3. Handle General Protected Paths (e.g., /dashboard)
  if (token) {
    return NextResponse.next(); // User is logged in (any role), allow access
  } else {
    // User is not logged in, redirect to Main Login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Add callbackUrl so they are redirected back after successful login
    url.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
}

// Define which paths the middleware should run on.
// It should run on all paths EXCEPT the ones handled implicitly by NextAuth or static assets.
// The logic inside the function then determines if a path is truly public or requires checks.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - api/public (Example: for public API endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/public|_next/static|_next/image|favicon.ico).*)',
  ],
};
