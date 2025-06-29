
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { generateSelfCareActivities } from '@/ai/flows/generate-self-care-activities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Heart, Brain, Music, Gamepad2, Feather, Shuffle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const categoryIcons: { [key: string]: LucideIcon } = {
    Breathing: Feather,
    Journaling: Brain,
    Movement: Heart,
    Music: Music,
    Games: Gamepad2,
    'Surprise Me': Shuffle,
};

function SelfCareActivitiesContent() {
  const searchParams = useSearchParams();
  const mood = searchParams.get('mood');
  const stressLevel = searchParams.get('stressLevel');

  const [activities, setActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mood && stressLevel) {
      const fetchActivities = async () => {
        try {
          setLoading(true);
          const result = await generateSelfCareActivities({
            mood,
            stressLevel: parseInt(stressLevel, 10),
          });
          setActivities(result.activities);
          setError(null);
        } catch (e) {
          setError('Could not generate activities. Please try again later.');
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchActivities();
    } else {
        setLoading(false);
    }
  }, [mood, stressLevel]);

  if (loading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="flex flex-col">
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-5/6" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  }

  if (error) {
    return (
        <Card className="text-center p-8 transition-shadow hover:shadow-lg">
            <CardTitle>An Error Occurred</CardTitle>
            <CardDescription>{error}</CardDescription>
        </Card>
    );
  }

  if (!mood || !stressLevel || activities.length === 0) {
    return (
        <Card className="text-center p-8 transition-shadow hover:shadow-lg">
            <CardTitle>No Activities Found</CardTitle>
            <CardDescription>
                Please complete a mood check-in to get personalized activity suggestions.
            </CardDescription>
        </Card>
    );
  }

  const getCategoryFromActivity = (activity: string): string => {
    const lowerCaseActivity = activity.toLowerCase();
    if (lowerCaseActivity.includes('breath') || lowerCaseActivity.includes('meditat')) return 'Breathing';
    if (lowerCaseActivity.includes('journal') || lowerCaseActivity.includes('write')) return 'Journaling';
    if (lowerCaseActivity.includes('walk') || lowerCaseActivity.includes('stretch') || lowerCaseActivity.includes('dance')) return 'Movement';
    if (lowerCaseActivity.includes('music') || lowerCaseActivity.includes('song')) return 'Music';
    if (lowerCaseActivity.includes('game') || lowerCaseActivity.includes('puzzle')) return 'Games';
    return 'Surprise Me';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity, index) => {
            const category = getCategoryFromActivity(activity);
            const Icon = categoryIcons[category] || Heart;
            return (
                <Card key={index} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-headline">{activity.split(':')[0]}</CardTitle>
                            <Badge variant="outline">{category}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex items-start gap-4">
                            <Icon className="h-8 w-8 text-primary mt-1" />
                            <p className="text-muted-foreground">{activity.split(': ')[1] || activity}</p>
                        </div>
                    </CardContent>
                </Card>
            )
        })}
    </div>
  );
}


export default function SelfCareActivitiesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Self-Care Suggestions</h1>
                <p className="text-muted-foreground">
                    Here are some AI-powered activities tailored to how you&apos;re feeling.
                </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <SelfCareActivitiesContent />
            </Suspense>
        </div>
    )
}
