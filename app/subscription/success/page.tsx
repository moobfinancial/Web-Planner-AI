import Link from 'next/link';
import { CheckCircle } from 'lucide-react'; // Using lucide-react for icons
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic'; // Prevent static generation

export const metadata = {
  title: 'Subscription Successful | WebPlanner AI',
};

export default function SubscriptionSuccessPage() {
  // Optional: You could use useSearchParams() in a client component
  // to read the session_id if needed for more detailed confirmation,
  // but often a generic success message is sufficient as the webhook handles the backend update.

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Thank you for subscribing! Your plan is now active.
      </p>
      <p className="text-muted-foreground mb-8">
        You will receive a confirmation email shortly. You can manage your subscription in your account settings.
      </p>
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link> {/* Adjust link as needed */}
      </Button>
    </div>
  );
}
