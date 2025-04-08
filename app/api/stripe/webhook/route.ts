import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe'; // Our initialized Stripe client
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email'; // Import email helper
import { PaymentConfirmationEmail } from '@/emails/payment-confirmation-email'; // Import email template

// Ensure Stripe is initialized before using it
if (!stripe) {
  throw new Error('Stripe has not been initialized. Check your STRIPE_SECRET_KEY.');
}

// This tells Next.js to pass the raw request body, which is needed for Stripe signature verification
/* export const config = {
  api: {
    bodyParser: false,
  },
}; */ // Removed deprecated config

// Helper function to read the raw body from the request stream
async function buffer(readable: ReadableStream<Uint8Array>) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * POST /api/stripe/webhook
 * Handles incoming webhook events from Stripe.
 */
export async function POST(req: Request) {
  console.log('[API /api/stripe/webhook POST] Received Stripe webhook event.');

  const buf = await buffer(req.body as ReadableStream<Uint8Array>);
  const sig = headers().get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('[API /api/stripe/webhook POST] Webhook secret or signature missing.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Use non-null assertion as stripe is checked at the start of the function
    event = stripe!.webhooks.constructEvent(buf, sig, webhookSecret);
    console.log(`[API /api/stripe/webhook POST] Successfully constructed event: ${event.type}`);
  } catch (err: any) {
    console.error(`[API /api/stripe/webhook POST] Error verifying webhook signature: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[API /api/stripe/webhook POST] Handling checkout.session.completed for session: ${session.id}`);

        // Metadata should contain our userId
        const userId = session?.metadata?.userId;
        const subscriptionId = session.subscription;
        const customerId = session.customer;
        const status = session.status; // Should be 'complete'

        if (status !== 'complete') {
          console.log(`[API /api/stripe/webhook POST] Ignoring incomplete checkout session: ${session.id}`);
          break; // Ignore if not complete
        }

        if (!userId) {
          console.error(`[API /api/stripe/webhook POST] Missing userId in checkout session metadata for session: ${session.id}`);
          // Decide how to handle this - maybe log and ignore, or investigate
          break;
        }

        if (!subscriptionId || typeof subscriptionId !== 'string') {
            console.error(`[API /api/stripe/webhook POST] Missing or invalid subscription ID in checkout session: ${session.id}`);
            break;
        }

        // Retrieve the full subscription details to get the current period end and price ID
        // Use non-null assertion as stripe is checked at the start of the function
        const subscription = await stripe!.subscriptions.retrieve(subscriptionId);

        // Update user in DB
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: typeof customerId === 'string' ? customerId : null,
            stripePriceId: subscription.items.data[0]?.price.id, // Get price ID from the first item
            stripeSubscriptionStatus: subscription.status, // e.g., 'active'
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000 // Convert Unix timestamp to Date
            ),
          },
        });

        console.log(`[API /api/stripe/webhook POST] Updated user ${userId} with subscription ${subscription.id}, status ${subscription.status}`);

        // Send Payment Confirmation Email
        if (updatedUser.email) {
            try {
                // You might want to fetch more details like plan name based on priceId if needed for the email
                const planName = updatedUser.stripePriceId === 'price_1RBTk2DsNaVptGN1DMyzhJCG' ? 'Subscription Plan A' : 
                                 updatedUser.stripePriceId === 'price_1RBTlPDsNaVptGN1IidrZuTp' ? 'Subscription Plan B' :
                                 'Your Subscribed Plan'; // Fallback name

                await sendEmail({
                    to: updatedUser.email,
                    subject: 'Your Subscription Confirmation',
                    react: PaymentConfirmationEmail({ 
                        name: updatedUser.name || 'Valued Customer', // Use name if available
                        planName: planName,
                        // Add more props as needed by your template (e.g., price, billing cycle)
                    }),
                });
                console.log(`[API /api/stripe/webhook POST] Sent payment confirmation email to ${updatedUser.email}`);
            } catch (emailError) {
                console.error(`[API /api/stripe/webhook POST] Failed to send payment confirmation email to ${updatedUser.email}:`, emailError);
                // Log error but don't fail the webhook processing
            }
        } else {
             console.warn(`[API /api/stripe/webhook POST] Cannot send confirmation email: User ${userId} has no email address.`);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[API /api/stripe/webhook POST] Handling customer.subscription.updated for subscription: ${subscription.id}`);

        const user = await prisma.user.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!user) {
          console.error(`[API /api/stripe/webhook POST] No user found for subscription update: ${subscription.id}`);
          break;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripeSubscriptionStatus: subscription.status,
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
          },
        });
        console.log(`[API /api/stripe/webhook POST] Updated subscription status to ${subscription.status} for user ${user.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[API /api/stripe/webhook POST] Handling customer.subscription.deleted for subscription: ${subscription.id}`);

        // When a subscription is canceled, its status might become 'canceled'
        // or it might be deleted immediately depending on settings.
        // Update the status in your DB.
        const user = await prisma.user.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!user) {
          console.error(`[API /api/stripe/webhook POST] No user found for subscription deletion: ${subscription.id}`);
          break;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            stripeSubscriptionStatus: subscription.status, // Should reflect 'canceled' or similar
            // Optionally clear other fields or keep for historical data
             stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000), // Keep end date
          },
        });
        console.log(`[API /api/stripe/webhook POST] Marked subscription ${subscription.id} status as ${subscription.status} for user ${user.id}`);
        break;
      }

      // ... handle other event types as needed (e.g., payment_failed)

      default:
        console.log(`[API /api/stripe/webhook POST] Unhandled event type ${event.type}`);
    }
  } catch (error) {
     console.error('[API /api/stripe/webhook POST] Error handling webhook event:', error);
     // Return a 500 status code to indicate an internal error to Stripe
     // Stripe will retry sending the webhook if it receives a non-2xx response.
     return NextResponse.json({ error: 'Internal Server Error handling webhook' }, { status: 500 });
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
