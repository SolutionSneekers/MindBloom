
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Smile, History } from 'lucide-react';

const moodPages = [
    {
        title: "Mood Check-In",
        description: "Log how you're feeling right now to get personalized insights.",
        href: "/home/mood/check-in",
        icon: Smile,
    },
    {
        title: "Mood History",
        description: "Review your past mood entries and discover long-term trends.",
        href: "/home/mood/history",
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
                    <Link key={page.title} href={page.href} className="flex">
                        <Card className="flex flex-col w-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
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
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
