import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn(
    'STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.'
  );
}

// Initialize Stripe with the API key and specify the API version
// Using the latest API version is generally recommended
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-04-10', // Use the latest API version
      typescript: true, // Enable TypeScript support
    })
  : null;

// Basic check to ensure the Stripe object was initialized
if (stripe) {
  console.log('Stripe SDK initialized successfully.');
} else if (stripeSecretKey) {
  // This case should ideally not happen if the key is set and Stripe constructor doesn't throw
  console.error('Stripe SDK failed to initialize despite secret key being present.');
} else {
    // Warning about missing key already logged above
}
