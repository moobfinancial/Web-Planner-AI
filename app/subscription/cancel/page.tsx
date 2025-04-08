import Link from 'next/link';
import { XCircle } from 'lucide-react'; // Using lucide-react for icons
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic'; // Prevent static generation

export const metadata = {
  title: 'Subscription Cancelled | WebPlanner AI',
};

export default function SubscriptionCancelPage() {
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center text-center">
      <XCircle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Subscription Process Cancelled</h1>
      <p className="text-lg text-muted-foreground mb-8">
        You have cancelled the subscription process. Your plan has not been changed.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" asChild>
           <Link href="/subscription">View Plans Again</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link> {/* Adjust link as needed */}
        </Button>
      </div>
    </div>
  );
}
