
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Play, Pause, RefreshCw } from 'lucide-react';

const phases = [
  { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly...' },
  { name: 'Hold', duration: 4, instruction: 'Hold your breath...' },
  { name: 'Exhale', duration: 6, instruction: 'Breathe out slowly...' },
  { name: 'Hold', duration: 2, instruction: 'Pause...' },
];

export default function BreathingExercisePage() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(phases[0].duration);

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
  }, [isAnimating, countdown, phaseIndex]);

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
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Card className="w-full max-w-md overflow-hidden transition-shadow hover:shadow-lg">
        <CardContent className="flex flex-col items-center justify-center p-6 pt-8 space-y-8">
          <div className="relative flex items-center justify-center w-56 h-56 sm:w-64 sm:h-64">
            <div
              className={cn(
                'absolute bg-accent/30 rounded-full transition-transform duration-[4000ms] ease-in-out',
                circleSizeClass
              )}
              style={{
                width: '100%',
                height: '100%',
                transitionDuration: `${currentPhase.duration}s`,
              }}
            />
            <div className="relative z-10 text-center">
              <p className="text-4xl font-bold text-primary sm:text-5xl">{countdown}</p>
              <p className="text-lg font-medium text-muted-foreground">{currentPhase.instruction}</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button onClick={handleStartPause} size="lg" className="w-32">
              {isAnimating ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isAnimating ? 'Pause' : 'Start'}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              <RefreshCw className="mr-2 h-5 w-5" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
       <div className="mt-8 text-center">
        <h1 className="text-xl font-bold sm:text-2xl font-headline">Box Breathing</h1>
        <p className="text-muted-foreground">Inhale (4s) → Hold (4s) → Exhale (6s) → Hold (2s)</p>
      </div>
    </div>
  );
}
