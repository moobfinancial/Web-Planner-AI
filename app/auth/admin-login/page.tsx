'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession, signOut } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" })
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const { update } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    console.log("[Admin Login Page] Attempting sign in..."); // Log attempt

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: true, // Let NextAuth handle the redirect
        callbackUrl: "/admin/dashboard" // Specify desired destination for admin
      })

      // If redirect is true, this part is usually only reached if there's an error
      if (result?.error) {
        console.error("[Admin Login Page] Sign in error:", result.error); // Log error
        // Map common errors or show a generic message
        if (result.error === "CredentialsSignin") {
             setError("Invalid email or password.");
        } else {
             setError("An unexpected error occurred during login.");
        }
        setIsLoading(false); // Stop loading on error
      } 
      // No need for success handling here, redirect takes over
      // No need for explicit finally block if setIsLoading(false) is handled in error path
      
    } catch (err) {
      console.error("[Admin Login Page] Unexpected catch block error:", err); // Log any unexpected errors
      setError("An error occurred during login")
      setIsLoading(false)
    } 
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative">
      {/* Circuit background */}
      <div className="absolute inset-0 circuit-bg"></div>

      {/* Glowing accent */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-futuristic-cyan/10 dark:bg-futuristic-cyan/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-futuristic-cyan/10 dark:bg-futuristic-blue/20 rounded-full blur-3xl"></div>

      <div className="mx-auto w-full max-w-md relative z-10">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center">
              <Link href="/" className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-futuristic-cyan"
                >
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="font-bold text-futuristic-cyan">Resort Fresh Admin</span>
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Need to go back?</span>
              <Link href="/" className="text-sm font-medium text-futuristic-cyan hover:underline">
                Return to main site
              </Link>
            </div>
            <Link href="/forgot-password" className="text-sm text-futuristic-cyan hover:underline">
              Forgot password?
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
