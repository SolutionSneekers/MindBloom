
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Wind, Heart } from 'lucide-react';

const activityPages = [
    {
        title: "Self-Care Suggestions",
        description: "Get personalized, AI-powered activity suggestions based on your mood.",
        href: "/home/activities/self-care",
        icon: Heart,
    },
    {
        title: "Breathing Exercise",
        description: "Center yourself with a guided box breathing session.",
        href: "/home/activities/breathing",
        icon: Wind,
    }
];

export default function ActivitiesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Wellness Activities</h1>
                <p className="text-muted-foreground">
                    A collection of tools and exercises to help you find balance.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                {activityPages.map((page) => (
                     <Link key={page.title} href={page.href} className="flex">
                        <Card className="flex flex-col w-full transition-shadow hover:shadow-lg hover:border-primary/50">
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
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
