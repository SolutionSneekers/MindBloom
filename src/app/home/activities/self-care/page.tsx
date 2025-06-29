
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { generateSelfCareActivities } from '@/ai/flows/generate-self-care-activities';
import { generateActivityDetails } from '@/ai/flows/generate-activity-details';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Heart, Brain, Music, Gamepad2, Feather, Shuffle, Loader2 } from 'lucide-react';
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
  const journalEntry = searchParams.get('journalEntry');

  const [activities, setActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the details modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [activityDetails, setActivityDetails] = useState('');
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    if (mood && stressLevel) {
      const fetchActivities = async () => {
        try {
          setLoading(true);
          const result = await generateSelfCareActivities({
            mood,
            stressLevel: parseInt(stressLevel, 10),
            journalEntry: journalEntry || undefined,
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
  }, [mood, stressLevel, journalEntry]);

  const handleCardClick = async (activity: string) => {
    const activityTitle = activity.split(':')[0];
    setSelectedActivity(activityTitle);
    setIsModalOpen(true);
    setIsDetailsLoading(true);
    setActivityDetails('');

    try {
      if (!mood || !stressLevel) {
        throw new Error("Mood and stress level are required to get details.");
      }
      const result = await generateActivityDetails({
        mood,
        stressLevel: parseInt(stressLevel, 10),
        activity: activityTitle,
        journalEntry: journalEntry || undefined,
      });
      setActivityDetails(result.details);
    } catch (e) {
      console.error(e);
      setActivityDetails("Sorry, we could not fetch the details for this activity. Please try again later.");
    } finally {
      setIsDetailsLoading(false);
    }
  };

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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => {
              const category = getCategoryFromActivity(activity);
              const Icon = categoryIcons[category] || Heart;
              return (
                  <Card 
                    key={index} 
                    className="flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => handleCardClick(activity)}
                  >
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedActivity}</DialogTitle>
            <DialogDescription>A personalized guide just for you.</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {isDetailsLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating your personalized guide...</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{activityDetails}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
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
