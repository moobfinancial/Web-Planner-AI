"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"

export function ContactFAQ() {
  const faqs = [
    {
      question: "How quickly will I receive a response to my inquiry?",
      answer:
        "We aim to respond to all inquiries within 24 hours during business days. For urgent technical support issues, our premium support team is available for Pro and Enterprise customers with faster response times.",
    },
    {
      question: "I'm having trouble with my account. How can I get help?",
      answer:
        "For account-related issues, please email support@webplanner.com with your account details and a description of the problem. You can also use the contact form on this page and select 'Technical Support' as the subject.",
    },
    {
      question: "Do you offer custom enterprise solutions?",
      answer:
        "Yes, we offer tailored enterprise solutions for organizations with specific requirements. Please contact our sales team through the form on this page or email enterprise@webplanner.com to discuss your needs.",
    },
    {
      question: "How can I request a feature for WebPlanner?",
      answer:
        "We love hearing feature suggestions from our users! You can submit feature requests through the contact form (select 'Product Feedback' as the subject) or directly from your dashboard if you're a registered user.",
    },
    {
      question: "Is there a community forum for WebPlanner users?",
      answer:
        "Yes, we have an active community forum where users can share ideas, ask questions, and connect with other WebPlanner users. You can access the forum from your dashboard after signing in.",
    },
    {
      question: "How can I become a WebPlanner partner or affiliate?",
      answer:
        "We're always looking for strategic partnerships. Please contact us through the form on this page (select 'Partnership Opportunity' as the subject) with details about your organization and partnership ideas.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 circuit-bg opacity-30"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
            <p className="max-w-[600px] text-foreground/80">
              Find quick answers to common questions about contacting and working with us
            </p>
          </div>

          <div className="w-full max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-8 text-center">
            <p className="mb-4">
              Can't find what you're looking for? Check our{" "}
              <Link href="/help" className="text-primary hover:underline">
                Help Center
              </Link>{" "}
              or contact us directly.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
