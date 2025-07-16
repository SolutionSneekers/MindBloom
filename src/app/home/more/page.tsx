
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Settings, Info } from 'lucide-react';

const morePages = [
    {
        title: "Profile",
        description: "Manage your personal details and account settings.",
        href: "/home/more/profile",
        icon: User,
    },
    {
        title: "Settings",
        description: "Customize your application preferences, like theme.",
        href: "/home/more/settings",
        icon: Settings,
    },
    {
        title: "About MindBloom",
        description: "Learn more about our mission, principles, and how to get in touch.",
        href: "/home/more/about",
        icon: Info,
    }
];

export default function MorePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">More Options</h1>
                <p className="text-muted-foreground">
                    Manage your profile, settings, and other application preferences.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {morePages.map((page) => (
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
