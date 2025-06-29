
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, Heart, ArrowRight } from 'lucide-react';

const activityPages = [
    {
        title: "Self-Care Suggestions",
        description: "Get personalized, AI-powered activity suggestions based on your mood.",
        href: "/dashboard/activities/self-care",
        icon: Heart,
    },
    {
        title: "Breathing Exercise",
        description: "Center yourself with a guided box breathing session.",
        href: "/dashboard/activities/breathing",
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
                                    Start Activity <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
