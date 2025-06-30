
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { moods } from '@/lib/utils';

export default function MoodCheckInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [stressLevel, setStressLevel] = useState([5]);
  const [journalEntry, setJournalEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedMood || !auth.currentUser) {
      toast({
        title: "Error",
        description: "Please select a mood and make sure you're logged in.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const moodLog = {
        userId: auth.currentUser.uid,
        mood: selectedMood,
        stressLevel: stressLevel[0],
        journalEntry: journalEntry,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'moods'), moodLog);

      toast({
        title: "Check-in saved!",
        description: "Your mood has been logged.",
      });

      const journalParam = journalEntry ? `&journalEntry=${encodeURIComponent(journalEntry)}` : '';
      router.push(
        `/home/activities/self-care?mood=${selectedMood}&stressLevel=${stressLevel[0]}${journalParam}`
      );
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Error",
        description: "Could not save your check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start py-8 px-4">
      <Card className="w-full max-w-2xl transition-shadow hover:shadow-lg">
        <CardHeader className="text-center sm:text-left">
          <CardTitle className="text-2xl md:text-3xl font-headline">How are you feeling?</CardTitle>
          <CardDescription>Select a mood to describe how you're feeling right now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label className="text-base font-medium">1. Select your mood <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {moods.map((mood) => (
                <div key={mood.name} className="flex flex-col items-center gap-2">
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-auto aspect-square rounded-full text-3xl sm:text-4xl flex items-center justify-center transition-all duration-200 ease-in-out transform hover:scale-110',
                      selectedMood === mood.name ? 'border-primary border-4 bg-accent' : 'border'
                    )}
                    onClick={() => setSelectedMood(mood.name)}
                    disabled={isLoading}
                  >
                    {mood.emoji}
                  </Button>
                  <span className="text-sm font-medium text-center">{mood.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="journal-entry" className="text-base font-medium">2. Tell us more (optional)</Label>
            <Textarea
              id="journal-entry"
              placeholder="What's on your mind? You can write as much or as little as you want."
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              rows={5}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
             <Label className="text-base font-medium">3. What's your stress level?</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Low</span>
              <Slider
                value={stressLevel}
                onValueChange={setStressLevel}
                min={1}
                max={10}
                step={1}
                disabled={isLoading}
              />
              <span className="text-sm text-muted-foreground">High</span>
            </div>
            <div className="text-center text-lg font-bold text-primary">{stressLevel[0]}</div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!selectedMood || isLoading}
          >
            {isLoading ? 'Saving...' : 'Find Self-Care Activities'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
