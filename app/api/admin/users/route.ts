import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/client';
import { hash } from 'bcrypt'; 
import { Role, UserStatus } from '@prisma/client'; 
import { randomBytes } from 'crypto'; // For generating tokens
import { sendEmail } from '@/lib/email'; // Import email helper
import AdminVerificationEmail from '@/emails/admin-verification-email'; // Import email template

// Ensure the route is treated as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users
 * Fetches a list of all users for the admin panel.
 * Requires ADMIN privileges.
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  // 1. Check if user is authenticated and is an ADMIN
  if (!session?.user || session.user.role !== 'ADMIN') {
    console.warn('[API /api/admin/users GET] Unauthorized access attempt.');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    console.log('[API /api/admin/users GET] Fetching users for admin:', session.user.email);

    // 2. Fetch users from the database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        status: true, // Include status field
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`[API /api/admin/users GET] Successfully fetched ${users.length} users.`);
    return NextResponse.json(users);

  } catch (error) {
    console.error('[API /api/admin/users GET] Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error fetching users.' }, { status: 500 });
  }
}

/**
 * POST /api/admin/users
 * Creates a new user.
 * Requires ADMIN privileges.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // 1. Check if user is authenticated and is an ADMIN
  if (!session?.user || session.user.role !== 'ADMIN') {
    console.warn('[API /api/admin/users POST] Unauthorized attempt to create user.');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, name, password, role, status } = body;

    console.log(`[API /api/admin/users POST] Attempting to create user: ${email} by admin: ${session.user.email}`);

    // 2. Validate input
    if (!email || !name || !password || !role || !status) {
      console.log('[API /api/admin/users POST] Missing required fields.');
      return NextResponse.json({ error: 'Missing required fields (email, name, password, role, status)' }, { status: 400 });
    }
    
    // Validate role enum
    if (!Object.values(Role).includes(role as Role)) {
       console.log(`[API /api/admin/users POST] Invalid role provided: ${role}`);
       return NextResponse.json({ error: `Invalid role specified. Must be one of: ${Object.values(Role).join(', ')}` }, { status: 400 });
    }

    // Validate status enum
    if (!Object.values(UserStatus).includes(status as UserStatus)) {
       console.log(`[API /api/admin/users POST] Invalid status provided: ${status}`);
       return NextResponse.json({ error: `Invalid status specified. Must be one of: ${Object.values(UserStatus).join(', ')}` }, { status: 400 });
    }

    // Basic password length check (consider more robust validation)
    if (password.length < 8) {
      console.log('[API /api/admin/users POST] Password too short.');
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    // 3. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      console.log(`[API /api/admin/users POST] Email already exists: ${email}`);
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 }); // 409 Conflict
    }

    // 4. Hash the password
    const hashedPassword = await hash(password, 10); // Salt rounds = 10

    // Prepare data, including verification token if admin
    let verificationToken: string | null = null;
    let verificationTokenExpiry: Date | null = null;

    if (role === Role.ADMIN) {
      verificationToken = randomBytes(32).toString('hex');
      verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 24 hours
      console.log(`[API /api/admin/users POST] Generated verification token for new admin: ${email}`);
    }

    // 5. Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword, // Correct field name based on schema
        role: role as Role, // Cast to Role enum
        status: status as UserStatus, // Add status
        emailVerificationToken: verificationToken, // Store token if admin
        verificationTokenExpiry: verificationTokenExpiry, // Store expiry if admin
        // emailVerified can be null initially, set upon verification flow if needed
      },
      // Select the fields to return (exclude password hash)
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        status: true, // Include status
        createdAt: true,
        updatedAt: true,
      }
    });

    console.log(`[API /api/admin/users POST] Successfully created user: ${newUser.email} (ID: ${newUser.id})`);

    // 6. Send verification email if the new user is an ADMIN
    if (newUser.role === Role.ADMIN && verificationToken) {
       const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-admin-email?token=${verificationToken}`;
       console.log(`[API /api/admin/users POST] Sending verification email to admin: ${newUser.email}`);
       try {
          const emailResult = await sendEmail({
            to: newUser.email!,
            subject: 'Verify Your Admin Email',
            react: AdminVerificationEmail({ name: newUser.name, verificationUrl }),
          });
          if (emailResult.success) {
            console.log(`[API /api/admin/users POST] Verification email sent successfully to ${newUser.email}.`);
          } else {
            console.error(`[API /api/admin/users POST] Failed to send verification email to ${newUser.email}: ${emailResult.error}`);
            // Consider how to handle email sending failure - perhaps log and proceed, or return an error?
            // For now, we log the error but still return the created user.
          }
       } catch (emailError) {
            console.error(`[API /api/admin/users POST] Error sending verification email to ${newUser.email}:`, emailError);
       }
    }

    return NextResponse.json(newUser, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('[API /api/admin/users POST] Error creating user:', error);
    // Check for specific Prisma errors if needed, e.g., P2002 for unique constraint
    return NextResponse.json({ error: 'Internal Server Error creating user.' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users?userId={id}
 * Updates an existing user's details (name, email, role, status).
 * Does NOT update the password.
 * Requires ADMIN privileges.
 */
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  // 1. Check if user is authenticated and is an ADMIN
  if (!session?.user || session.user.role !== 'ADMIN') {
    console.warn('[API /api/admin/users PUT] Unauthorized attempt to update user.');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2. Check if userId is provided in the query
  if (!userId) {
    console.log('[API /api/admin/users PUT] Missing userId query parameter.');
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    // Only allow updating name, email, role, and status. Exclude password.
    const { name, email, role, status } = body;

    console.log(`[API /api/admin/users PUT] Attempting to update user ID: ${userId} by admin: ${session.user.email}`);

    // 3. Validate input
    if (!email || !name || !role || !status) {
      console.log('[API /api/admin/users PUT] Missing required fields (name, email, role, status).');
      return NextResponse.json({ error: 'Missing required fields (name, email, role, status)' }, { status: 400 });
    }

    // Validate role enum
    if (!Object.values(Role).includes(role as Role)) {
       console.log(`[API /api/admin/users PUT] Invalid role provided: ${role}`);
       return NextResponse.json({ error: `Invalid role specified. Must be one of: ${Object.values(Role).join(', ')}` }, { status: 400 });
    }

    // Validate status enum
    if (!Object.values(UserStatus).includes(status as UserStatus)) {
       console.log(`[API /api/admin/users PUT] Invalid status provided: ${status}`);
       return NextResponse.json({ error: `Invalid status specified. Must be one of: ${Object.values(UserStatus).join(', ')}` }, { status: 400 });
    }
    
    // Optional: Check if the new email is already taken by *another* user
    const existingUserWithEmail = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        console.log(`[API /api/admin/users PUT] Email ${email} is already taken by another user.`);
        return NextResponse.json({ error: 'Email is already in use by another account' }, { status: 409 }); // Conflict
    }

    // 4. Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name,
        email: email,
        role: role as Role, // Cast to Role enum
        status: status as UserStatus, // Update status
      },
      // Select the fields to return (exclude password hash)
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        status: true, // Include status
        createdAt: true,
        updatedAt: true,
      }
    });

    console.log(`[API /api/admin/users PUT] Successfully updated user: ${updatedUser.email} (ID: ${updatedUser.id})`);
    return NextResponse.json(updatedUser, { status: 200 }); // 200 OK

  } catch (error: any) {
     // Check for specific Prisma errors, e.g., P2025 Record not found
    if (error.code === 'P2025') {
      console.error(`[API /api/admin/users PUT] User not found for ID: ${userId}`, error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.error(`[API /api/admin/users PUT] Error updating user ID: ${userId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error updating user.' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users?userId={id}
 * Deletes a user.
 * Requires ADMIN privileges.
 * Prevents admin from deleting their own account.
 */
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const userIdToDelete = searchParams.get('userId');

  // 1. Check if user is authenticated and is an ADMIN
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    console.warn('[API /api/admin/users DELETE] Unauthorized attempt to delete user.');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2. Check if userId is provided
  if (!userIdToDelete) {
    console.log('[API /api/admin/users DELETE] Missing userId query parameter.');
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // 3. Prevent admin from deleting themselves
  if (userIdToDelete === session.user.id) {
    console.warn(`[API /api/admin/users DELETE] Admin (${session.user.email}) attempted to delete their own account.`);
    return NextResponse.json({ error: 'Admins cannot delete their own account' }, { status: 400 });
  }

  try {
    console.log(`[API /api/admin/users DELETE] Attempting to delete user ID: ${userIdToDelete} by admin: ${session.user.email}`);

    // 4. Delete the user
    await prisma.user.delete({
      where: { id: userIdToDelete },
    });

    console.log(`[API /api/admin/users DELETE] Successfully deleted user ID: ${userIdToDelete}`);
    // Return 200 OK with a success message, or 204 No Content
    return NextResponse.json({ message: 'User successfully deleted' }, { status: 200 });
    // Alternatively, for 204 No Content:
    // return new Response(null, { status: 204 });

  } catch (error: any) {
    // Check for specific Prisma errors, e.g., P2025 Record to delete does not exist
    if (error.code === 'P2025') {
      console.error(`[API /api/admin/users DELETE] User not found for deletion, ID: ${userIdToDelete}`, error);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.error(`[API /api/admin/users DELETE] Error deleting user ID: ${userIdToDelete}:`, error);
    return NextResponse.json({ error: 'Internal Server Error deleting user.' }, { status: 500 });
  }
}
