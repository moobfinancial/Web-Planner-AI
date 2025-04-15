import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/verify-admin-email
 * Verifies an admin user's email using a token.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  console.log(`[API /api/auth/verify-admin-email GET] Received verification request with token: ${token}`);

  // 1. Validate token presence
  if (!token) {
    console.log('[API /api/auth/verify-admin-email GET] Token missing from request.');
    // Redirect to an error page or return JSON
    // For simplicity, returning JSON error for now
    return NextResponse.json({ error: 'Verification token is missing.' }, { status: 400 });
  }

  try {
    // 2. Find user by verification token
    const user = await prisma.user.findUnique({
      where: {
        emailVerificationToken: token,
      },
    });

    // 3. Validate user and token
    if (!user) {
      console.log(`[API /api/auth/verify-admin-email GET] No user found for token: ${token}`);
      return NextResponse.json({ error: 'Invalid or expired verification token.' }, { status: 400 });
    }

    if (user.emailVerified) {
        console.log(`[API /api/auth/verify-admin-email GET] Email already verified for user: ${user.email}`);
        // Optional: Redirect to login or a confirmation page
        return NextResponse.json({ message: 'Email already verified.' });
    }

    if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
      console.log(`[API /api/auth/verify-admin-email GET] Token expired for user: ${user.email}`);
      // Optional: Implement logic to resend verification email
      return NextResponse.json({ error: 'Verification token has expired.' }, { status: 400 });
    }

    // 4. Update user: Mark email as verified and clear token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null, // Clear the token
        verificationTokenExpiry: null, // Clear the expiry
        status: 'ACTIVE', // Optionally activate user if they were pending
      },
    });

    console.log(`[API /api/auth/verify-admin-email GET] Successfully verified email for user: ${user.email}`);

    // 5. Redirect user to a success page (e.g., login page or dashboard)
    // For now, return a success message
    // TODO: Implement redirection to a user-friendly page
    const loginUrl = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/admin/login` : '/admin/login';
    // return NextResponse.redirect(loginUrl + '?verified=true'); // Example redirect
    return NextResponse.json({ message: 'Email successfully verified. You can now log in.' });

  } catch (error) {
    console.error('[API /api/auth/verify-admin-email GET] Error during verification:', error);
    return NextResponse.json({ error: 'Internal Server Error during verification.' }, { status: 500 });
  }
}
