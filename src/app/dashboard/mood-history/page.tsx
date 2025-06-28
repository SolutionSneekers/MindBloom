'use client';

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import MoodHistoryChart, { MoodChartData } from "@/components/mood-history-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MoodHistoryEntry {
  id: string;
  date: string;
  mood: string;
  stressLevel: number;
  journalSnippet: string;
}

const moodToValue: { [key: string]: number } = {
  Angry: 1, Sad: 2, Anxious: 3, Okay: 4, Calm: 5, Happy: 6,
};

const moodColors: { [key: string]: string } = {
  Happy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Anxious: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Calm: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Okay: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  Sad: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  Angry: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function MoodHistoryPage() {
  const [moodHistoryData, setMoodHistoryData] = useState<MoodHistoryEntry[]>([]);
  const [chartData, setChartData] = useState<MoodChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoodHistory = async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const q = query(
          collection(db, "moods"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(30)
        );
        const querySnapshot = await getDocs(q);
        
        const history: MoodHistoryEntry[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt) {
            const createdAt = (data.createdAt as Timestamp).toDate();

            history.push({
              id: doc.id,
              date: createdAt.toLocaleDateString(),
              mood: data.mood,
              stressLevel: data.stressLevel,
              journalSnippet: data.journalEntry ? `${data.journalEntry.substring(0, 50)}...` : 'No journal entry.',
            });
          }
        });

        // For chart, take last 7 entries and format them
        const last7Days = history.slice(0, 7).reverse();
        const chart: MoodChartData[] = last7Days.map(entry => {
             const date = new Date(entry.date);
             return {
                name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric'}),
                mood: moodToValue[entry.mood],
             };
        });

        setMoodHistoryData(history);
        setChartData(chart);
      } catch (error) {
        console.error("Error fetching mood history:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
            fetchMoodHistory();
        } else {
            setLoading(false);
            setMoodHistoryData([]);
            setChartData([]);
        }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Mood History</h1>
        <p className="text-muted-foreground">
          Review your past mood check-ins and discover patterns.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Mood Trends</CardTitle>
          <CardDescription>
            A visual overview of your mood fluctuations over the last 7 entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-[350px] w-full" /> : <MoodHistoryChart data={chartData} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Check-in Log</CardTitle>
          <CardDescription>
            A detailed log of your recent mood entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Mood</TableHead>
                    <TableHead className="text-center">Stress Level</TableHead>
                    <TableHead>Journal Snippet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead className="text-center">Stress Level</TableHead>
                  <TableHead>Journal Snippet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moodHistoryData.length > 0 ? moodHistoryData.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(moodColors[entry.mood])}>{entry.mood}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{entry.stressLevel}</TableCell>
                    <TableCell className="text-muted-foreground italic">
                      &quot;{entry.journalSnippet}&quot;
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">No check-ins yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
