"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export function Testimonials() {
  const testimonials = [
    {
      quote: "WebPlanner AI has completely transformed our development process. The AI-generated plans are incredibly detailed and save us countless hours of planning.",
      author: "Sarah Johnson",
      title: "CTO at TechStart",
      avatar: "/avatars/avatar-1.png" // You'll need to add these images or use placeholders
    },
    {
      quote: "The subscription was worth every penny. Our team can now focus on implementation rather than spending days on planning and documentation.",
      author: "Michael Chen",
      title: "Lead Developer at WebCraft",
      avatar: "/avatars/avatar-2.png"
    },
    {
      quote: "As a freelancer, the Pro plan gives me everything I need to present professional plans to my clients. It's like having a planning department at my fingertips.",
      author: "Alex Rivera",
      title: "Independent Web Developer",
      avatar: "/avatars/avatar-3.png"
    }
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">What Our Customers Say</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
              Don't just take our word for it — hear from some of our satisfied customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-background border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                    <div className="flex items-center space-x-4">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        {/* If you have actual avatar images, uncomment this */}
                        {/* <Image
                          src={testimonial.avatar}
                          alt={`${testimonial.author} avatar`}
                          fill
                          className="object-cover"
                        /> */}
                        
                        {/* Fallback avatar with initials */}
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                          {testimonial.author.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{testimonial.author}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.title}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
