'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/icons"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return;

    setIsLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setIsSent(true)
      toast({
        title: "Password reset email sent.",
        description: "Please check your inbox.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto max-w-sm w-full shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
             <Logo />
          </div>
          <CardTitle className="text-2xl font-headline text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            {isSent ? 'A reset link has been sent to your email.' : 'Enter your email to receive a password reset link.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasMounted && (
            <>
              {!isSent ? (
                <form onSubmit={handleReset}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>
              ) : null}
              <div className="mt-4 text-center text-sm">
                Remember your password?{" "}
                <Link href="/" className="underline">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
