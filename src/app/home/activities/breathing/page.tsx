
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Play, Pause, RefreshCw, HelpCircle } from 'lucide-react';

type BreathingPhase = {
  name: 'Inhale' | 'Hold' | 'Exhale' | 'Pause';
  duration: number;
  instruction: string;
};

type BreathingExerciseInfo = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  benefits: string;
  howTo: string[];
  phases: BreathingPhase[] | null;
  cycleText: string | null;
};

const exercises: BreathingExerciseInfo[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    tagline: 'A simple technique to calm your nervous system.',
    description: 'This technique, used by Navy SEALs, helps to regulate your breath and calm your body and mind under stress.',
    benefits: 'Reduces stress, improves focus, and calms the nervous system.',
    howTo: [
      'Find a comfortable seated position.',
      'Inhale for 4 seconds.',
      'Hold your breath for 4 seconds.',
      'Exhale for 6 seconds.',
      'Pause for 2 seconds before repeating.',
    ],
    phases: [
      { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly...' },
      { name: 'Hold', duration: 4, instruction: 'Hold your breath...' },
      { name: 'Exhale', duration: 6, instruction: 'Breathe out slowly...' },
      { name: 'Pause', duration: 2, instruction: 'Pause...' },
    ],
    cycleText: 'Inhale (4s) → Hold (4s) → Exhale (6s) → Pause (2s)',
  },
  {
    id: '4-7-8-breathing',
    name: '4-7-8 Breathing',
    tagline: 'The "relaxing breath" to help you unwind.',
    description: 'This rhythmic breathing pattern is a natural tranquilizer for the nervous system, ideal for reducing anxiety or falling asleep.',
    benefits: 'Promotes deep relaxation, helps with sleep, and reduces anxiety.',
    howTo: [
        'Sit with your back straight.',
        'Inhale quietly through your nose for 4 seconds.',
        'Hold your breath for a count of 7 seconds.',
        'Exhale completely through your mouth, making a whoosh sound, for 8 seconds.',
        'Repeat the cycle up to 4 times.'
    ],
    phases: [
      { name: 'Inhale', duration: 4, instruction: 'Breathe in...' },
      { name: 'Hold', duration: 7, instruction: 'Hold...' },
      { name: 'Exhale', duration: 8, instruction: 'Breathe out...' },
    ],
    cycleText: 'Inhale (4s) → Hold (7s) → Exhale (8s)',
  },
  {
    id: 'diaphragmatic-breathing',
    name: 'Belly Breathing',
    tagline: 'Strengthen your diaphragm for deeper breaths.',
    description: 'Also known as "diaphragmatic breathing," this foundational exercise encourages full oxygen exchange and can reduce stress.',
    benefits: 'Strengthens the diaphragm, reduces heart rate, and lowers blood pressure.',
    howTo: [
        'Lie on your back with knees bent or sit comfortably.',
        'Place one hand on your upper chest and the other on your belly.',
        'Breathe in slowly through your nose, letting your stomach rise. Your chest should remain still.',
        'Exhale through pursed lips as your belly falls.',
        'Practice for 5-10 minutes daily.'
    ],
    phases: null,
    cycleText: null,
  },
  {
    id: 'pursed-lip-breathing',
    name: 'Pursed-Lip Breathing',
    tagline: 'Slow your breathing during moments of anxiety.',
    description: 'This simple technique helps slow the pace of breathing, making each breath more effective and relieving shortness of breath.',
    benefits: 'Slows breathing rate, relieves shortness of breath, and promotes relaxation.',
    howTo: [
        'Relax your neck and shoulders.',
        'Keeping your mouth closed, inhale through your nose for 2 seconds.',
        'Purse your lips as if you\'re about to whistle.',
        'Exhale slowly through your pursed lips for 4-6 seconds.',
        'Repeat until you feel calm.'
    ],
    phases: [
        { name: 'Inhale', duration: 2, instruction: 'Breathe in...' },
        { name: 'Exhale', duration: 5, instruction: 'Breathe out slowly...' },
    ],
    cycleText: 'Inhale (2s) → Exhale (5s)',
  },
  {
    id: 'alternate-nostril-breathing',
    name: 'Alternate Nostril',
    tagline: 'Balance your mind and body.',
    description: 'Known as Nadi Shodhana in yoga, this practice helps to bring calm, balance, and unity to the left and right sides of your brain.',
    benefits: 'Improves focus, calms the mind, and can lower heart rate.',
    howTo: [
        'Sit comfortably. Use your right thumb to close your right nostril.',
        'Inhale through your left nostril.',
        'Close the left nostril with your ring finger, then release your thumb from the right nostril.',
        'Exhale through your right nostril.',
        'Inhale through the right nostril, then switch again.',
        'Continue for up to 5 minutes.'
    ],
    phases: null,
    cycleText: null,
  }
];

const Animator = ({ exercise }: { exercise: BreathingExerciseInfo }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  
  const phases = exercise.phases!;
  const [countdown, setCountdown] = useState(phases[0].duration);

  useEffect(() => {
    // Reset animation when exercise changes
    setIsAnimating(false);
    setPhaseIndex(0);
    setCountdown(phases[0].duration);
  }, [exercise, phases]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAnimating) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        const nextPhaseIndex = (phaseIndex + 1) % phases.length;
        setPhaseIndex(nextPhaseIndex);
        setCountdown(phases[nextPhaseIndex].duration);
      }
    }
    return () => clearTimeout(timer);
  }, [isAnimating, countdown, phaseIndex, phases]);

  const currentPhase = phases[phaseIndex];
  const circleSizeClass = currentPhase.name === 'Inhale' ? 'scale-110' : 'scale-100';

  const handleStartPause = () => {
    setIsAnimating(!isAnimating);
  };

  const handleReset = () => {
    setIsAnimating(false);
    setPhaseIndex(0);
    setCountdown(phases[0].duration);
  };
  
  return (
    <div className="flex flex-col items-center justify-center pt-4">
      <div className="relative flex items-center justify-center w-56 h-56 sm:w-64 sm:h-64">
        <div
          className={cn(
            'absolute bg-accent/30 rounded-full transition-transform duration-[4000ms] ease-in-out',
            isAnimating && circleSizeClass
          )}
          style={{
            width: '100%',
            height: '100%',
            transitionDuration: isAnimating ? `${currentPhase.duration}s` : '0s',
          }}
        />
        <div className="relative z-10 text-center">
          <p className="text-4xl font-bold text-primary sm:text-5xl">{countdown}</p>
          <p className="text-lg font-medium text-muted-foreground">{currentPhase.instruction}</p>
        </div>
      </div>
      <div className="flex space-x-4 mt-8">
        <Button onClick={handleStartPause} size="lg" className="w-32">
          {isAnimating ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
          {isAnimating ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={handleReset} variant="outline" size="lg">
          <RefreshCw className="mr-2 h-5 w-5" />
          Reset
        </Button>
      </div>
       {exercise.cycleText && (
        <div className="mt-8 text-center">
            <h2 className="text-xl font-bold sm:text-2xl font-headline">{exercise.name} Cycle</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">{exercise.cycleText}</p>
        </div>
       )}
    </div>
  )
}

const Instructions = ({ exercise }: { exercise: BreathingExerciseInfo }) => {
    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold font-headline">How to practice {exercise.name}:</h3>
            <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
                {exercise.howTo.map((step, index) => (
                    <li key={index}>{step}</li>
                ))}
            </ul>
        </div>
    )
}

export default function BreathingExercisePage() {
  const [activeTab, setActiveTab] = useState(exercises[0].id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Breathing Exercises</h1>
        <p className="text-muted-foreground">
            Center yourself with a guided breathing session. Select an exercise below.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto">
            {exercises.map(ex => (
                <TabsTrigger 
                    key={ex.id} 
                    value={ex.id} 
                    className="whitespace-normal h-full py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                    {ex.name}
                </TabsTrigger>
            ))}
        </TabsList>
        {exercises.map(exercise => (
             <TabsContent key={exercise.id} value={exercise.id}>
                <Card className="w-full mt-4 overflow-hidden transition-shadow hover:shadow-lg">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="font-headline text-xl">{exercise.name}</CardTitle>
                                <CardDescription>{exercise.tagline}</CardDescription>
                            </div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                        <span className="sr-only">About {exercise.name}</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="font-headline text-2xl">{exercise.name}</DialogTitle>
                                        <DialogDescription>{exercise.description}</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 space-y-4 text-sm">
                                        <div>
                                            <h4 className="font-semibold mb-1">Best for:</h4>
                                            <p className="text-muted-foreground">{exercise.benefits}</p>
                                        </div>
                                         <div>
                                            <h4 className="font-semibold mb-1">How to do it:</h4>
                                            <ul className="list-decimal list-inside space-y-1 text-muted-foreground">
                                                {exercise.howTo.map((step, index) => (
                                                    <li key={index}>{step}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                       {exercise.phases ? <Animator exercise={exercise} /> : <Instructions exercise={exercise} />}
                    </CardContent>
                </Card>
             </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
