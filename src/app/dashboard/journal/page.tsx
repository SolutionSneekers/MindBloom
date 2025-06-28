'use client';

import { useState } from 'react';
import { generateJournalingPrompts } from '@/ai/flows/generate-journaling-prompts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Download, Save } from 'lucide-react';

const moods = ['Happy', 'Calm', 'Okay', 'Sad', 'Anxious', 'Angry'];

export default function JournalPage() {
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('Select a mood to get a journaling prompt.');
  const [journalEntry, setJournalEntry] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGetPrompt = async (mood: string) => {
    setSelectedMood(mood);
    if (!mood) return;

    setIsLoading(true);
    setPrompt('Generating a new prompt for you...');
    try {
      const result = await generateJournalingPrompts({ mood });
      setPrompt(result.prompt);
    } catch (error) {
      console.error(error);
      setPrompt('Could not generate a prompt. Please try again.');
       toast({
        title: "Error",
        description: "Failed to generate a new prompt.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveLocally = () => {
    localStorage.setItem(`journalEntry-${new Date().toISOString()}`, journalEntry);
    toast({
      title: "Saved!",
      description: "Your journal entry has been saved locally.",
    });
  };

  const exportAsTxt = () => {
    const blob = new Blob([journalEntry], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindbloom-journal-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
     toast({
      title: "Exported!",
      description: "Your journal entry is being downloaded.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Journal</h1>
        <p className="text-muted-foreground">
          A space for your thoughts, guided by AI-powered prompts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline">Journaling Prompt</CardTitle>
              <CardDescription>Select a mood to get a personalized prompt.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select onValueChange={handleGetPrompt} value={selectedMood}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a mood" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((mood) => (
                    <SelectItem key={mood} value={mood}>
                      {mood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => handleGetPrompt(selectedMood)} disabled={!selectedMood || isLoading} size="icon" variant="outline">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg italic text-primary p-4 bg-muted rounded-md min-h-[60px]">
            {prompt}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Today's Entry</CardTitle>
           <CardDescription>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Start writing here..."
            className="min-h-[300px] text-base"
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
          />
        </CardContent>
        <CardContent className="flex justify-end gap-2">
           <Button variant="outline" onClick={saveLocally} disabled={!journalEntry}>
            <Save className="mr-2 h-4 w-4" /> Save Locally
          </Button>
          <Button onClick={exportAsTxt} disabled={!journalEntry}>
            <Download className="mr-2 h-4 w-4" /> Export as .txt
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
