
'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { generateJournalingPrompts } from '@/ai/flows/generate-journaling-prompts';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, Timestamp, getDoc } from 'firebase/firestore';
import { calculateAge } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Save, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';

interface JournalEntry {
  id: string;
  entry: string;
  mood: string | null;
  prompt: string | null;
  createdAt: string;
  timestamp: Timestamp;
}

const moods = ['Happy', 'Calm', 'Okay', 'Sad', 'Anxious', 'Angry'];

export default function JournalPage() {
  const { toast } = useToast();
  // State for new entry
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('Select a mood to get a journaling prompt.');
  const [journalEntry, setJournalEntry] = useState<string>('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [age, setAge] = useState<number | undefined>(undefined);

  // State for past entries
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [showAllEntries, setShowAllEntries] = useState(false);

  // State for dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editEntryText, setEditEntryText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const fetchJournalEntries = useCallback(async () => {
    if (!auth.currentUser) {
      setIsLoadingEntries(false);
      return;
    }
    setIsLoadingEntries(true);
    try {
      const q = query(
        collection(db, "journalEntries"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const entries: JournalEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt) {
          const timestamp = data.createdAt as Timestamp;
          entries.push({
            id: doc.id,
            entry: data.entry,
            mood: data.mood,
            prompt: data.prompt,
            createdAt: timestamp.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            timestamp: timestamp,
          });
        }
      });
      setPastEntries(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      toast({
        title: "Error",
        description: "Failed to fetch past journal entries.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEntries(false);
    }
  }, [toast]);

  const fetchUserAge = useCallback(async () => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.dob && userData.dob instanceof Timestamp) {
          setAge(calculateAge(userData.dob.toDate()));
        }
      }
    }
  }, []);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchJournalEntries();
        fetchUserAge();
      } else {
        setIsLoadingEntries(false);
        setPastEntries([]);
      }
    });
    return () => unsubscribe();
  }, [fetchJournalEntries, fetchUserAge]);

  const handleGetPrompt = useCallback(async (mood: string) => {
    setSelectedMood(mood);
    if (!mood) return;

    setIsLoadingPrompt(true);
    setPrompt('Generating a new prompt for you...');
    try {
      const result = await generateJournalingPrompts({ mood, age });
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
      setIsLoadingPrompt(false);
    }
  }, [age, toast]);
  
  const saveToFirestore = useCallback(async () => {
    if (!journalEntry || !auth.currentUser) {
      toast({
        title: "Error",
        description: "Journal entry cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'journalEntries'), {
        userId: auth.currentUser.uid,
        entry: journalEntry,
        mood: selectedMood || null,
        prompt: prompt.startsWith('Select a mood') ? null : prompt,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Saved!",
        description: "Your journal entry has been saved.",
      });
      setJournalEntry('');
      setSelectedMood('');
      setPrompt('Select a mood to get a journaling prompt.');
      fetchJournalEntries(); // Refresh list
    } catch (error) {
      console.error("Error saving entry: ", error);
      toast({
        title: "Error",
        description: "Failed to save your journal entry.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [journalEntry, selectedMood, prompt, toast, fetchJournalEntries]);

  const handleOpenEditDialog = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setEditEntryText(entry.entry);
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateEntry = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEntry || !auth.currentUser || !editEntryText) return;
    setIsUpdating(true);
    try {
      const entryRef = doc(db, "journalEntries", selectedEntry.id);
      await updateDoc(entryRef, {
        entry: editEntryText,
      });
      await fetchJournalEntries();
      toast({
        title: "Success",
        description: "Journal entry updated.",
      });
    } catch (error) {
      console.error("Error updating entry:", error);
      toast({
        title: "Error",
        description: "Could not update journal entry.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setIsEditDialogOpen(false);
      setSelectedEntry(null);
    }
  }, [selectedEntry, editEntryText, toast, fetchJournalEntries]);

  const handleDeleteEntry = useCallback(async () => {
    if (!selectedEntry || !auth.currentUser) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "journalEntries", selectedEntry.id));
      await fetchJournalEntries();
      toast({
        title: "Success",
        description: "Journal entry deleted.",
      });
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast({
        title: "Error",
        description: "Could not delete journal entry.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedEntry(null);
    }
  }, [selectedEntry, toast, fetchJournalEntries]);

  const displayedEntries = showAllEntries ? pastEntries : pastEntries.slice(0, 7);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline">My Journal</h1>
        <p className="text-muted-foreground">
          A space for your thoughts, guided by AI-powered prompts.
        </p>
      </div>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="font-headline text-xl">Journaling Prompt</CardTitle>
              <CardDescription>Select a mood to get a personalized prompt.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select onValueChange={handleGetPrompt} value={selectedMood}>
                <SelectTrigger className="w-full sm:w-[180px]">
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
              <Button onClick={() => handleGetPrompt(selectedMood)} disabled={!selectedMood || isLoadingPrompt} size="icon" variant="outline">
                <RefreshCw className={`h-4 w-4 ${isLoadingPrompt ? 'animate-spin' : ''}`} />
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
      
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-xl">New Entry</CardTitle>
           <CardDescription>
            {currentDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="new-journal-entry">Your thoughts <span className="text-destructive">*</span></Label>
            <Textarea
              id="new-journal-entry"
              placeholder="Start writing here..."
              className="min-h-[200px] text-base"
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
           <Button onClick={saveToFirestore} disabled={!journalEntry || isSaving}>
            <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Entry'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Past Entries</CardTitle>
          <CardDescription>Review and manage your previous journal entries.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingEntries ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-12 w-full" />
                </Card>
              ))}
            </div>
          ) : pastEntries.length > 0 ? (
            <>
              {displayedEntries.map((entry) => (
                <Card key={entry.id} className="p-4 transition-shadow hover:shadow-md">
                   <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{entry.createdAt}</p>
                        {entry.prompt && <p className="text-sm text-muted-foreground italic mt-1">&quot;{entry.prompt}&quot;</p>}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(entry)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteDialog(entry)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  <p className="text-muted-foreground mt-4 whitespace-pre-wrap">{entry.entry}</p>
                </Card>
              ))}
              {pastEntries.length > 7 && (
                <div className="mt-6 flex justify-center">
                  <Button variant="outline" onClick={() => setShowAllEntries(!showAllEntries)}>
                    {showAllEntries ? 'Show Less' : `Show All (${pastEntries.length}) Entries`}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">You have no past journal entries.</p>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setSelectedEntry(null);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
            <DialogDescription>
              Make changes to your journal entry from {selectedEntry?.createdAt}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateEntry} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-journal-entry" className="text-base font-medium">Your entry <span className="text-destructive">*</span></Label>
                <Textarea
                  id="edit-journal-entry"
                  value={editEntryText}
                  onChange={(e) => setEditEntryText(e.target.value)}
                  rows={10}
                  className="text-base"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your journal entry from {selectedEntry?.createdAt}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setSelectedEntry(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
