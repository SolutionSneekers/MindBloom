
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smile, History, ArrowRight } from 'lucide-react';

const moodPages = [
    {
        title: "Mood Check-In",
        description: "Log how you're feeling right now to get personalized insights.",
        href: "/dashboard/mood/check-in",
        icon: Smile,
    },
    {
        title: "Mood History",
        description: "Review your past mood entries and discover long-term trends.",
        href: "/dashboard/mood/history",
        icon: History,
    }
];

export default function MoodPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Mood Tracking</h1>
                <p className="text-muted-foreground">
                    Check in with your emotions and review your journey over time.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                {moodPages.map((page) => (
                    <Card key={page.title} className="flex flex-col transition-shadow hover:shadow-lg">
                        <CardHeader>
                             <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="font-headline text-xl flex items-center gap-3">
                                        <page.icon className="h-6 w-6 text-primary" />
                                        {page.title}
                                    </CardTitle>
                                    <CardDescription className="mt-2">{page.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow" />
                        <CardFooter>
                             <Link href={page.href} className="w-full">
                                <Button className="w-full">
                                    Go to {page.title} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
