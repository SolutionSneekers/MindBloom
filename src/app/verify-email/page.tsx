'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto max-w-md w-full text-center shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
           <div className="flex justify-center mb-4">
            <MailCheck className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-headline">Check Your Inbox</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Please click the link in the email to activate your account. You may need to check your spam folder.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
