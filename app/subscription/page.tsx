import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { FeatureComparison } from "@/components/subscription/FeatureComparison";
import { Testimonials } from "@/components/subscription/Testimonials";
import { PricingFAQ } from "@/components/subscription/PricingFAQ";

// Set the title for the page
export const metadata = {
  title: "Subscription Plans | WebPlanner AI",
  description: "Choose the best plan for your web development planning needs.",
};

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);

  // 1. Check Authentication (Optional: Header now handles logged out state)
  // if (!session?.user) {
  //   redirect("/login?message=Please log in to view subscription options.");
  // }

  // 2. Ensure Stripe Publishable Key is available (needed by client component)
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    console.error("Stripe Publishable Key is not set in environment variables.");
    // Optional: Render an error message or redirect
    // Keeping this check as SubscriptionPlans might still need it
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-red-500">Subscription service is currently unavailable. Please contact support.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section with Pricing Cards */}
        <section className="w-full py-12 md:py-24 bg-gradient-to-b from-background to-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-8 md:mb-12">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Simple, Transparent Pricing
              </h1>
              <p className="text-muted-foreground max-w-[700px] md:text-xl">
                Choose the plan that fits your project planning needs. No hidden fees or surprises.
              </p>
            </div>
            
            {/* Subscription Plans Component */}
            <SubscriptionPlans stripePublicKey={publishableKey} />
          </div>
        </section>

        {/* Feature Comparison Table */}
        <FeatureComparison />
        
        {/* Testimonials Section */}
        <Testimonials />
        
        {/* FAQ Section */}
        <PricingFAQ />
      </main>
      <Footer />
    </div>
  );
}
