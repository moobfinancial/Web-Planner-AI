"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SubscriptionPlansProps {
  stripePublicKey: string;
}

export function SubscriptionPlans({ stripePublicKey }: SubscriptionPlansProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  // Price IDs from your Stripe Dashboard
  const STRIPE_PRICE_IDS = {
    monthly: {
      pro: "price_1RBTk2DsNaVptGN1DMyzhJCG", // $10/month
      enterprise: "price_1RBTlPDsNaVptGN1IidrZuTp", // $20/month
    },
    yearly: {
      pro: "price_1RBTk2DsNaVptGN1DMyzhJCG", // Use actual yearly price IDs when available
      enterprise: "price_1RBTlPDsNaVptGN1IidrZuTp", // Use actual yearly price IDs when available
    }
  };

  // Calculate yearly prices (20% discount is common)
  const monthlyProPrice = 10;
  const monthlyEnterprisePrice = 20;
  const yearlyProPrice = monthlyProPrice * 12 * 0.8; // 20% discount
  const yearlyEnterprisePrice = monthlyEnterprisePrice * 12 * 0.8; // 20% discount

  const handleSubscription = async (priceId: string) => {
    setIsLoading(priceId);

    try {
      // 1. Create Checkout Session on the server
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // 2. Redirect to Checkout
      const stripe = await loadStripe(stripePublicKey);
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }

      // Redirect to Checkout page
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <section className="w-full">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex justify-center">
            <Tabs 
              defaultValue="monthly" 
              value={billingInterval}
              onValueChange={(value) => setBillingInterval(value as 'monthly' | 'yearly')}
              className="w-full max-w-md"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">
                  Yearly <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">Save 20%</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {/* Free Plan */}
            <Card className="flex flex-col border-2 border-muted">
              <CardHeader className="flex flex-col space-y-1.5 pb-4">
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>For individuals just getting started</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                  $0
                  <span className="ml-1 text-xl font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>1 website plan per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Basic AI generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>PDF export</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>3 revisions per plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Community support</span>
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => toast.info("You're currently using the Free plan")}
                >
                  Current Plan
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="flex flex-col border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="flex flex-col space-y-1.5 pb-4">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For professionals and small teams</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                  ${billingInterval === 'monthly' ? monthlyProPrice : Math.round(yearlyProPrice / 12)}
                  <span className="ml-1 text-xl font-normal text-muted-foreground">/month</span>
                </div>
                {billingInterval === 'yearly' && (
                  <p className="text-sm text-muted-foreground">Billed ${yearlyProPrice.toFixed(0)} yearly</p>
                )}
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited website plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Advanced AI generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>PDF & HTML exports</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited revisions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Up to 3 team members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Priority email support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Custom branding</span>
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-4">
                <Button 
                  className="w-full"
                  onClick={() => handleSubscription(STRIPE_PRICE_IDS[billingInterval].pro)}
                  disabled={isLoading !== null}
                >
                  {isLoading === STRIPE_PRICE_IDS[billingInterval].pro ? "Processing..." : "Choose Plan"}
                </Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="flex flex-col border-2 border-muted">
              <CardHeader className="flex flex-col space-y-1.5 pb-4">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>For larger teams and businesses</CardDescription>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                  ${billingInterval === 'monthly' ? monthlyEnterprisePrice : Math.round(yearlyEnterprisePrice / 12)}
                  <span className="ml-1 text-xl font-normal text-muted-foreground">/month</span>
                </div>
                {billingInterval === 'yearly' && (
                  <p className="text-sm text-muted-foreground">Billed ${yearlyEnterprisePrice.toFixed(0)} yearly</p>
                )}
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Everything in Pro, plus:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Premium AI generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited team members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>API access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Custom integrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Dedicated account manager</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>4-8 hour support response</span>
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-4">
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSubscription(STRIPE_PRICE_IDS[billingInterval].enterprise)}
                  disabled={isLoading !== null}
                >
                  {isLoading === STRIPE_PRICE_IDS[billingInterval].enterprise ? "Processing..." : "Choose Plan"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
