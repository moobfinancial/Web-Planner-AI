"use client"

import { Button } from "@/components/ui/button"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"

export function PricingFAQ() {
  const faqs = [
    {
      question: "How does the free plan work?",
      answer:
        "Our free plan allows you to create one website plan per month using our basic AI generation tools. You can export your plan to PDF and access community support. It's perfect for individuals just getting started with website planning.",
    },
    {
      question: "Can I upgrade or downgrade my plan at any time?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll have immediate access to the new features. When downgrading, the changes will take effect at the end of your current billing cycle.",
    },
    {
      question: "Do you offer a free trial for paid plans?",
      answer:
        "Yes, we offer a 14-day free trial for our Pro plan. You can try all the features without any commitment. No credit card is required to start your trial.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express) as well as PayPal. For Enterprise plans, we also offer invoice-based payments.",
    },
    {
      question: "Is there a limit to how many revisions I can make?",
      answer:
        "The Free plan has a limit of 3 revisions per plan. The Pro and Enterprise plans offer unlimited revisions, allowing you to refine your website plans as much as needed.",
    },
    {
      question: "What's the difference between basic, advanced, and premium AI generation?",
      answer:
        "Basic AI generation provides fundamental website planning with standard sections. Advanced AI generation offers more detailed plans with industry-specific recommendations and enhanced customization. Premium AI generation uses our most powerful models for comprehensive plans with advanced features, technical specifications, and tailored development guidance.",
    },
    {
      question: "How does team collaboration work?",
      answer:
        "Team collaboration allows multiple users to work on the same website plans. The Pro plan supports up to 3 team members, while the Enterprise plan offers unlimited team members with role-based permissions for more granular access control.",
    },
    {
      question: "Do you offer custom enterprise solutions?",
      answer: (
        <>
          Yes, we offer custom solutions for enterprise clients with specific needs. Please{" "}
          <Link href="/contact" className="text-primary hover:underline">
            contact our sales team
          </Link>{" "}
          to discuss your requirements.
        </>
      ),
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Optional: Add a background style if desired */}
      {/* <div className="absolute inset-0 circuit-bg opacity-30"></div> */}
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
            <p className="max-w-[600px] text-muted-foreground">
              Find answers to common questions about our plans and features
            </p>
          </div>

          <div className="w-full max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-medium">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-8 text-center">
            <p className="mb-4 text-muted-foreground">Still have questions?</p>
            <Link href="/contact">
              <Button variant="outline">Contact Support</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
