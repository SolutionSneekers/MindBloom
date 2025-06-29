'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto max-w-md w-full text-center shadow-lg">
        <CardHeader>
           <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-headline">404 - Page Not Found</CardTitle>
          <CardDescription>
            Sorry, the page you are looking for could not be found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            It seems you've taken a wrong turn. Let's get you back on track.
          </p>
          <Button asChild className="w-full">
            <Link href="/home">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
