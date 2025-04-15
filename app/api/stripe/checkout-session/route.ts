import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe'; // Import initialized Stripe SDK
import { prisma } from '@/lib/prisma'; // Import prisma client

// Ensure the route is treated as dynamic
export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Helper function to get or create Stripe customer ID
async function getOrCreateStripeCustomerId(userId: string, email: string, name?: string | null): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    console.log(`[API /api/stripe/checkout-session POST] Found existing Stripe customer ID for user ${userId}: ${user.stripeCustomerId}`);
    return user.stripeCustomerId;
  }

  // Create a new Stripe customer
  console.log(`[API /api/stripe/checkout-session POST] No Stripe customer ID found for user ${userId}. Creating new customer...`);
  try {
    const customer = await stripe!.customers.create({
      email: email,
      name: name || undefined, // Add name if available
      metadata: {
        userId: userId, // Link Stripe customer to our user ID
      },
    });

    // Update our user record with the new Stripe customer ID
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    console.log(`[API /api/stripe/checkout-session POST] Created Stripe customer ${customer.id} for user ${userId} and updated DB.`);
    return customer.id;
  } catch (error: any) {
    console.error(`[API /api/stripe/checkout-session POST] Error creating Stripe customer for user ${userId}:`, error);
    throw new Error("Could not create Stripe customer."); // Re-throw to be caught by the main handler
  }
}

/**
 * POST /api/stripe/checkout-session
 * Creates a Stripe Checkout session for a user to subscribe.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      console.log("[API /api/stripe/checkout-session POST] Unauthorized: No user session or email.");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const userName = session.user.name; // Get user name if available

    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
      console.log("[API /api/stripe/checkout-session POST] Bad Request: Missing priceId.");
      return new NextResponse("Price ID is required", { status: 400 });
    }

    console.log(`[API /api/stripe/checkout-session POST] Received request for priceId: ${priceId} from user: ${userId}`);

    // Get or create Stripe Customer ID
    const stripeCustomerId = await getOrCreateStripeCustomerId(userId, userEmail, userName);

    // Create the Stripe Checkout Session
    const checkoutSession = await stripe!.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: stripeCustomerId, // Use the customer ID
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscription/cancel`,
      metadata: {
        userId: userId, // Include userId in metadata for webhook verification
      },
    });

    console.log(`[API /api/stripe/checkout-session POST] Created checkout session ${checkoutSession.id} for user ${userId}`);

    if (!checkoutSession.url) {
      console.error("[API /api/stripe/checkout-session POST] Error: Checkout session URL is null.");
      return new NextResponse("Could not create checkout session", { status: 500 });
    }

    // Return the session URL to redirect the client
    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error("[API /api/stripe/checkout-session POST] Internal Server Error:", error);
    return new NextResponse("Internal Server Error: " + error.message, { status: 500 });
  }
}
