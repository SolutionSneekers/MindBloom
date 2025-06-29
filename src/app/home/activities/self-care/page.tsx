
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { generateSelfCareActivities } from '@/ai/flows/generate-self-care-activities';
import { generateActivityDetails } from '@/ai/flows/generate-activity-details';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Music, Gamepad2, Feather, Shuffle, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const [mood, setMood] = useState<string | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [journalEntry, setJournalEntry] = useState<string | null>(null);

  const [activities, setActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the details modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [activityDetails, setActivityDetails] = useState('');
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // New state for loading last check-in
  const [isLastCheckinLoading, setIsLastCheckinLoading] = useState(false);

  const fetchActivities = useCallback(async (mood: string, stressLevel: number, journalEntry?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await generateSelfCareActivities({
        mood,
        stressLevel,
        journalEntry: journalEntry || undefined,
      });
      setActivities(result.activities);
    } catch (e) {
      setError('Could not generate activities. Please try again later.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const moodParam = searchParams.get('mood');
    const stressLevelParam = searchParams.get('stressLevel');
    const journalEntryParam = searchParams.get('journalEntry');

    if (moodParam && stressLevelParam) {
      const stressLevelNum = parseInt(stressLevelParam, 10);
      setMood(moodParam);
      setStressLevel(stressLevelNum);
      setJournalEntry(journalEntryParam);
      fetchActivities(moodParam, stressLevelNum, journalEntryParam || undefined);
    } else {
      setLoading(false);
    }
  }, [searchParams, fetchActivities]);

  const handleUseLastCheckin = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to use this feature.",
        variant: "destructive",
      });
      return;
    }
    setIsLastCheckinLoading(true);
    try {
      const q = query(
        collection(db, "moods"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const lastCheckin = querySnapshot.docs[0].data();
        const lastMood = lastCheckin.mood;
        const lastStress = lastCheckin.stressLevel;
        const lastJournal = lastCheckin.journalEntry || undefined;

        setMood(lastMood);
        setStressLevel(lastStress);
        setJournalEntry(lastJournal);

        await fetchActivities(lastMood, lastStress, lastJournal);
      } else {
        toast({
          title: "Not Found",
          description: "No previous check-in found. Please complete one first.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Could not fetch your last check-in.",
        variant: "destructive",
      });
    } finally {
      setIsLastCheckinLoading(false);
    }
  };


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
        stressLevel,
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

  if (!loading && !activities.length && !error) {
    return (
        <Card className="text-center p-8 transition-shadow hover:shadow-lg">
            <CardTitle>Get Your Suggestions</CardTitle>
            <CardDescription className="mb-6">
                Complete a new mood check-in or use your most recent one to get personalized activity suggestions.
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleUseLastCheckin} disabled={isLastCheckinLoading}>
                    {isLastCheckinLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Use Last Check-in
                </Button>
                <Button asChild>
                    <Link href="/home/mood/check-in">New Check-in</Link>
                </Button>
            </div>
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
