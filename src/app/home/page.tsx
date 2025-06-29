
'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Smile,
  TrendingUp,
  Wind,
} from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore"
import { onAuthStateChanged, User } from "firebase/auth"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import MoodHistoryChart, { MoodChartData } from "@/components/mood-history-chart"
import { Skeleton } from "@/components/ui/skeleton"

const quickAccessItems = [
  {
    title: "New Mood Check-In",
    description: "Log your current mood and feelings.",
    icon: Smile,
    href: "/home/mood/check-in",
    color: "text-green-500",
  },
  {
    title: "Start Journaling",
    description: "Let your thoughts flow freely.",
    icon: BookOpen,
    href: "/home/journal",
    color: "text-blue-500",
  },
  {
    title: "Breathing Exercise",
    description: "Find your calm and center yourself.",
    icon: Wind,
    href: "/home/activities/breathing",
    color: "text-sky-500",
  },
]

const moodToValue: { [key: string]: number } = {
  Angry: 1, Sad: 2, Anxious: 3, Okay: 4, Calm: 5, Happy: 6,
};


export default function HomePage() {
  const [chartData, setChartData] = useState<MoodChartData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [checkInCount, setCheckInCount] = useState(0);
  const [journalStreak, setJournalStreak] = useState(0);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!auth.currentUser) {
        setLoadingData(false);
        return;
      }
      setLoadingData(true);
      try {
        // Fetch mood data
        const moodQuery = query(
          collection(db, "moods"),
          where("userId", "==", auth.currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(30)
        );
        const moodSnapshot = await getDocs(moodQuery);
        
        const history: {date: string; mood: string}[] = [];
        moodSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt) {
            const createdAt = (data.createdAt as Timestamp).toDate();
            history.push({
              date: createdAt.toLocaleDateString(),
              mood: data.mood,
            });
          }
        });

        const last7Days = history.slice(0, 7).reverse();
        const formattedChartData: MoodChartData[] = last7Days.map(entry => {
             const date = new Date(entry.date);
             return {
                name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric'}),
                mood: moodToValue[entry.mood],
             };
        });

        setChartData(formattedChartData);
        setCheckInCount(moodSnapshot.size);

        // Fetch journal data for streak
        const journalQuery = query(
            collection(db, "journalEntries"),
            where("userId", "==", auth.currentUser.uid),
            orderBy("createdAt", "desc")
        );
        const journalSnapshot = await getDocs(journalQuery);
        const entries = journalSnapshot.docs.map(doc => {
            const data = doc.data();
            return data.createdAt ? (data.createdAt as Timestamp).toDate() : null;
        }).filter(date => date !== null) as Date[];

        // Calculate streak
        if (entries.length === 0) {
            setJournalStreak(0);
        } else {
            let streak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const uniqueEntryDates = [...new Set(entries.map(d => {
                const date = new Date(d);
                date.setHours(0, 0, 0, 0);
                return date.getTime();
            }))].map(t => new Date(t));

            uniqueEntryDates.sort((a, b) => b.getTime() - a.getTime());
            
            const mostRecentEntry = new Date(uniqueEntryDates[0]);
            const diffDaysFromToday = (today.getTime() - mostRecentEntry.getTime()) / (1000 * 3600 * 24);

            if (diffDaysFromToday <= 1) {
                streak = 1;
                let lastDate = mostRecentEntry;
                for (let i = 1; i < uniqueEntryDates.length; i++) {
                    const currentDate = new Date(uniqueEntryDates[i]);
                    const expectedPreviousDate = new Date(lastDate);
                    expectedPreviousDate.setDate(expectedPreviousDate.getDate() - 1);
                    
                    if (currentDate.getTime() === expectedPreviousDate.getTime()) {
                        streak++;
                        lastDate = currentDate;
                    } else {
                        break; 
                    }
                }
            }
            setJournalStreak(streak);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, user => {
        if (user) {
          if (user.displayName) {
            setFirstName(user.displayName.split(' ')[0]);
          }
          fetchDashboardData();
        } else {
            setLoadingData(false);
            setChartData([]);
            setCheckInCount(0);
            setJournalStreak(0);
            setFirstName('');
        }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">
            Welcome back{firstName && `, ${firstName}`}!
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/home/mood/check-in">
              <Smile className="mr-2 h-4 w-4" /> New Check-in
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Journal Streak
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingData ? <Skeleton className="h-8 w-10 inline-block" /> : `${journalStreak} days`}</div>
            <p className="text-xs text-muted-foreground">
              Keep up the great work!
            </p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mood Check-ins
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingData ? <Skeleton className="h-8 w-10 inline-block" /> : checkInCount}</div>
            <p className="text-xs text-muted-foreground">
              in the last 30 days
            </p>
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Mood
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Positive</div>
            <p className="text-xs text-muted-foreground">
              Trend is improving
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-headline">Daily Affirmation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base">
              &quot;I am resilient and can handle whatever comes my way.&quot;
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Mood Overview</CardTitle>
            <CardDescription>
              Your mood trends over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {loadingData ? <Skeleton className="h-[350px] w-full" /> : <MoodHistoryChart data={chartData} />}
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Quick Access</CardTitle>
            <CardDescription>
              Jump right into an activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {quickAccessItems.map(item => (
              <Link href={item.href} key={item.title}>
                <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className={`p-2 bg-muted rounded-lg`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="ml-auto font-medium"><ArrowUpRight className="h-4 w-4 text-muted-foreground" /></div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
