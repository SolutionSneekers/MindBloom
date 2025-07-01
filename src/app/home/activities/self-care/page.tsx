'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { generateSelfCareActivities, type GenerateSelfCareActivitiesOutput } from '@/ai/flows/generate-self-care-activities';
import { generateActivityDetails } from '@/ai/flows/generate-activity-details';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Music, Gamepad2, Feather, Shuffle, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { calculateAge } from '@/lib/utils';
import Link from 'next/link';

type Activity = GenerateSelfCareActivitiesOutput['activities'][0];

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
  const [age, setAge] = useState<number | undefined>(undefined);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the details modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [activityDetails, setActivityDetails] = useState('');
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // New state for loading last check-in
  const [isLastCheckinLoading, setIsLastCheckinLoading] = useState(false);

  const fetchUserAge = useCallback(async () => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.dob && userData.dob instanceof Timestamp) {
          const userAge = calculateAge(userData.dob.toDate());
          setAge(userAge);
          return userAge;
        }
      }
    }
    return undefined;
  }, []);

  const fetchActivities = useCallback(async (mood: string, stressLevel: number, journalEntry?: string) => {
    try {
      setLoading(true);
      setError(null);
      const userAge = await fetchUserAge();
      const result = await generateSelfCareActivities({
        mood,
        stressLevel,
        journalEntry: journalEntry || undefined,
        age: userAge,
      });
      setActivities(result.activities);
    } catch (e) {
      setError('Could not generate activities. Please try again later.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [fetchUserAge]);

  const moodParam = searchParams.get('mood');
  const stressLevelParam = searchParams.get('stressLevel');
  const journalEntryParam = searchParams.get('journalEntry');

  useEffect(() => {
    if (moodParam && stressLevelParam) {
      const stressLevelNum = parseInt(stressLevelParam, 10);
      setMood(moodParam);
      setStressLevel(stressLevelNum);
      setJournalEntry(journalEntryParam);
      fetchActivities(moodParam, stressLevelNum, journalEntryParam || undefined);
    } else {
      setLoading(false);
    }
  }, [moodParam, stressLevelParam, journalEntryParam, fetchActivities]);

  const handleUseLastCheckin = useCallback(async () => {
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
          description: "No previous mood check-in found. Please complete one first.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Could not fetch your last mood check-in.",
        variant: "destructive",
      });
    } finally {
      setIsLastCheckinLoading(false);
    }
  }, [toast, fetchActivities]);


  const handleCardClick = useCallback(async (activity: Activity) => {
    setSelectedActivity(activity.title);
    setIsModalOpen(true);
    setIsDetailsLoading(true);
    setActivityDetails('');

    try {
      if (!mood || !stressLevel) {
        throw new Error("Mood and stress level are required to get details.");
      }
      const userAge = await fetchUserAge();
      const result = await generateActivityDetails({
        mood,
        stressLevel,
        activity: activity.title,
        journalEntry: journalEntry || undefined,
        age: userAge,
      });
      setActivityDetails(result.details);
    } catch (e) {
      console.error(e);
      setActivityDetails("Sorry, we could not fetch the details for this activity. Please try again later.");
    } finally {
      setIsDetailsLoading(false);
    }
  }, [mood, stressLevel, journalEntry, fetchUserAge]);

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
                    Use Last Mood Check-in
                </Button>
                <Button asChild>
                    <Link href="/home/mood/check-in">New Mood Check-in</Link>
                </Button>
            </div>
        </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => {
              const Icon = categoryIcons[activity.category] || Heart;
              return (
                  <Card 
                    key={index} 
                    className="flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => handleCardClick(activity)}
                  >
                      <CardHeader>
                          <div className="flex items-center justify-between">
                              <CardTitle className="text-lg font-headline">{activity.title}</CardTitle>
                              <Badge variant="outline">{activity.category}</Badge>
                          </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                          <div className="flex items-start gap-4">
                              <Icon className="h-8 w-8 text-primary mt-1" />
                              <p className="text-muted-foreground">{activity.description}</p>
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
            <Suspense fallback={<div className="text-center p-8">Loading your suggestions...</div>}>
                <SelfCareActivitiesContent />
            </Suspense>
        </div>
    )
}
