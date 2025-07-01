'use client';

import { useState, useEffect, FormEvent, useCallback, useMemo } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, Timestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";
import MoodHistoryChart, { MoodChartData } from "@/components/mood-history-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { moodToValue, moods } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MoodHistoryEntry {
  id: string;
  date: string; // Stored as ISO string
  mood: string;
  stressLevel: number;
  journalEntry: string;
}

export default function MoodHistoryPage() {
  const [moodHistoryData, setMoodHistoryData] = useState<MoodHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MoodHistoryEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);

  const [editMood, setEditMood] = useState('');
  const [editStressLevel, setEditStressLevel] = useState([3]);
  const [editJournalEntry, setEditJournalEntry] = useState('');

  const fetchMoodHistory = useCallback(async () => {
    if (!auth.currentUser) {
      setLoading(false);
      setMoodHistoryData([]);
      return;
    }
    setLoading(true);
    try {
      const q = query(
        collection(db, "moods"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      const history: MoodHistoryEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt) {
          const createdAt = (data.createdAt as Timestamp).toDate();

          history.push({
            id: doc.id,
            date: createdAt.toISOString(),
            mood: data.mood,
            stressLevel: data.stressLevel,
            journalEntry: data.journalEntry || '',
          });
        }
      });

      setMoodHistoryData(history);
    } catch (error) {
      console.error("Error fetching mood history:", error);
       toast({
        title: "Error",
        description: "Could not fetch mood history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
            fetchMoodHistory();
        } else {
            setLoading(false);
            setMoodHistoryData([]);
        }
    });

    return () => unsubscribe();
  }, [fetchMoodHistory]);

  const chartData = useMemo(() => {
    if (moodHistoryData.length === 0) {
      return [];
    }
    const last7Days = moodHistoryData.slice(0, 7).reverse();
    const newChartData: MoodChartData[] = last7Days.map(entry => {
         const date = new Date(entry.date);
         if (isNaN(date.getTime())) {
             console.error("Invalid date encountered in mood history:", entry.date);
             return null;
         }
         return {
            name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric'}),
            mood: moodToValue[entry.mood],
            stressLevel: entry.stressLevel,
            time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            moodName: entry.mood,
         };
    }).filter((item): item is MoodChartData => item !== null);
    return newChartData;
  }, [moodHistoryData]);

  const handleOpenEditDialog = (entry: MoodHistoryEntry) => {
    setSelectedEntry(entry);
    setEditMood(entry.mood);
    setEditStressLevel([entry.stressLevel]);
    setEditJournalEntry(entry.journalEntry);
    setIsEditDialogOpen(true);
  }
  
  const handleOpenDeleteDialog = (entry: MoodHistoryEntry) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteEntry = useCallback(async () => {
    if (!selectedEntry || !auth.currentUser) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "moods", selectedEntry.id));
      await fetchMoodHistory();
      toast({
        title: "Success",
        description: "Mood entry deleted.",
      });
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast({
        title: "Error",
        description: "Could not delete mood entry.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedEntry(null);
    }
  }, [selectedEntry, fetchMoodHistory, toast]);

  const handleUpdateEntry = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEntry || !auth.currentUser) return;
    setIsUpdating(true);
    try {
      const entryRef = doc(db, "moods", selectedEntry.id);
      await updateDoc(entryRef, {
        mood: editMood,
        stressLevel: editStressLevel[0],
        journalEntry: editJournalEntry,
      });
      await fetchMoodHistory();
      toast({
        title: "Success",
        description: "Mood entry updated.",
      });
    } catch (error) {
      console.error("Error updating entry:", error);
       toast({
        title: "Error",
        description: "Could not update mood entry.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setIsEditDialogOpen(false);
      setSelectedEntry(null);
    }
  }, [selectedEntry, editMood, editStressLevel, editJournalEntry, fetchMoodHistory, toast]);

  const displayedEntries = showAll ? moodHistoryData : moodHistoryData.slice(0, 7);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Mood History</h1>
        <p className="text-muted-foreground">
          Review your past mood check-ins and discover patterns.
        </p>
      </div>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Mood Trends</CardTitle>
          <CardDescription>
            A visual overview of your mood fluctuations over the last 7 entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-[350px] w-full" /> : <MoodHistoryChart data={chartData} />}
        </CardContent>
      </Card>

      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Mood Check-in Log</CardTitle>
          <CardDescription>
            A detailed log of your recent mood entries. You can edit or delete entries here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
             </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead>Mood</TableHead>
                      <TableHead className="text-center">Stress</TableHead>
                      <TableHead className="hidden md:table-cell">Journal Snippet</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedEntries.length > 0 ? displayedEntries.map((entry) => {
                      const displayDate = new Date(entry.date).toLocaleDateString();
                      return (
                      <TableRow key={entry.id}>
                         <TableCell className="hidden md:table-cell font-medium">{displayDate}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant={
                                entry.mood === 'Angry' ? 'destructive'
                                : entry.mood === 'Happy' ? 'default'
                                : 'secondary'
                              }
                              className="w-fit"
                            >
                              {entry.mood}
                            </Badge>
                            <span className="text-xs text-muted-foreground md:hidden">{displayDate}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{entry.stressLevel}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="max-w-xs truncate text-muted-foreground italic">
                            &quot;{entry.journalEntry || 'No journal entry.'}&quot;
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
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
                        </TableCell>
                      </TableRow>
                    )}) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">No mood check-ins yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {moodHistoryData.length > 7 && (
                <div className="mt-6 flex justify-center">
                  <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'Show Less' : `Show All (${moodHistoryData.length}) Entries`}
                  </Button>
                </div>
              )}
            </>
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
            <DialogTitle>Edit Mood Entry</DialogTitle>
            <DialogDescription>
              Make changes to your mood entry from {selectedEntry ? new Date(selectedEntry.date).toLocaleDateString() : ''}. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateEntry} className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">1. Select your mood <span className="text-destructive">*</span></Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {moods.map((mood) => (
                    <div key={mood.name} className="flex flex-col items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-16 h-16 rounded-full text-3xl flex items-center justify-center transition-all duration-200 ease-in-out',
                          editMood === mood.name ? 'border-primary border-4 bg-accent' : 'border'
                        )}
                        onClick={() => setEditMood(mood.name)}
                      >
                        {mood.emoji}
                      </Button>
                      <span className="text-xs font-medium">{mood.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-journal-entry" className="text-base font-medium">2. Journal Entry</Label>
                <Textarea
                  id="edit-journal-entry"
                  placeholder="What's on your mind?"
                  value={editJournalEntry}
                  onChange={(e) => setEditJournalEntry(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">3. Stress level</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Low</span>
                  <Slider
                    value={editStressLevel}
                    onValueChange={setEditStressLevel}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <span className="text-sm text-muted-foreground">High</span>
                </div>
                <div className="text-center text-lg font-bold text-primary">{editStressLevel[0]}</div>
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
              This action cannot be undone. This will permanently delete your mood entry from {selectedEntry ? new Date(selectedEntry.date).toLocaleDateString() : ''}.
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
  )
}
