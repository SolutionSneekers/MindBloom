
'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  BookOpen,
  Calendar,
  Check,
  Copy,
  HeartPulse,
  Smile,
  Sparkles,
  TrendingUp,
  Wind,
} from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { generateDailyAffirmation } from "@/ai/flows/generate-daily-affirmation"
import { useToast } from "@/hooks/use-toast"

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
import { moodToValue, valueToMood } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const quickAccessItems = [
  {
    title: "Mood Check-In",
    description: "Log your current feelings.",
    icon: Smile,
    href: "/home/mood/check-in",
    color: "bg-green-100 dark:bg-green-900/50",
    iconColor: "text-green-500",
  },
  {
    title: "Start Journaling",
    description: "Let your thoughts flow.",
    icon: BookOpen,
    href: "/home/journal",
    color: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-500",
  },
  {
    title: "Breathing Exercise",
    description: "Find your calm.",
    icon: Wind,
    href: "/home/activities/breathing",
    color: "bg-sky-100 dark:bg-sky-900/50",
    iconColor: "text-sky-500",
  },
]

export default function HomePage() {
  const [chartData, setChartData] = useState<MoodChartData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [checkInCount, setCheckInCount] = useState(0);
  const [journalStreak, setJournalStreak] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [affirmation, setAffirmation] = useState('');
  const [loadingAffirmation, setLoadingAffirmation] = useState(true);
  const [overallMood, setOverallMood] = useState({ text: 'No data', trend: 'N/A' });
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(affirmation);
    setIsCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Your daily affirmation is ready to be shared.",
    });
    setTimeout(() => setIsCopied(false), 2000); // Revert icon after 2 seconds
  };

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
        
        const history: {date: Date; mood: string; stressLevel: number}[] = [];
        moodSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt) {
            const createdAt = (data.createdAt as Timestamp).toDate();
            history.push({
              date: createdAt,
              mood: data.mood,
              stressLevel: data.stressLevel,
            });
          }
        });

        const last7Days = history.slice(0, 7).reverse();
        const formattedChartData: MoodChartData[] = last7Days.map(entry => {
             return {
                name: entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric'}),
                mood: moodToValue[entry.mood],
                stressLevel: entry.stressLevel,
                time: entry.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                moodName: entry.mood,
             };
        });

        setChartData(formattedChartData);
        setCheckInCount(moodSnapshot.size);
        
        if (formattedChartData.length > 0) {
          const totalMood = formattedChartData.reduce((acc, curr) => acc + curr.mood, 0);
          const avgMoodValue = Math.round(totalMood / formattedChartData.length);
          const avgMoodText = valueToMood[avgMoodValue] || 'Neutral';

          let trendText = 'is steady';
          if (formattedChartData.length > 1) {
            const firstMood = formattedChartData[0].mood;
            const lastMood = formattedChartData[formattedChartData.length - 1].mood;
            if (lastMood > firstMood) trendText = 'is improving';
            if (lastMood < firstMood) trendText = 'is declining';
          }
          setOverallMood({ text: avgMoodText, trend: trendText });
        } else {
          setOverallMood({ text: 'No data', trend: 'N/A' });
        }

        // Fetch journal data for streak, optimized to fetch only last 365 entries
        const journalQuery = query(
            collection(db, "journalEntries"),
            where("userId", "==", auth.currentUser.uid),
            orderBy("createdAt", "desc"),
            limit(365) 
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

    const fetchAffirmation = async () => {
      setLoadingAffirmation(true);
      try {
        const today = new Date().toDateString();
        const storedDataRaw = localStorage.getItem('dailyAffirmation');

        if (storedDataRaw) {
          const storedData = JSON.parse(storedDataRaw);
          if (storedData.date === today) {
            setAffirmation(storedData.affirmation);
            setLoadingAffirmation(false);
            return; // Use cached affirmation and exit
          }
        }

        // If no valid cache, fetch a new one
        const result = await generateDailyAffirmation();
        const newAffirmation = result.affirmation;
        setAffirmation(newAffirmation);
        localStorage.setItem(
          'dailyAffirmation',
          JSON.stringify({ affirmation: newAffirmation, date: today })
        );
      } catch (error) {
        console.error("Error handling daily affirmation:", error);
        setAffirmation("I am resilient and can handle whatever comes my way."); // Fallback
      } finally {
        setLoadingAffirmation(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, user => {
        if (user) {
          if (user.displayName) {
            setFirstName(user.displayName.split(' ')[0]);
          }
          fetchDashboardData();
          fetchAffirmation();
        } else {
            setLoadingData(false);
            setChartData([]);
            setCheckInCount(0);
            setJournalStreak(0);
            setFirstName('');
            setLoadingAffirmation(false);
            setAffirmation('');
        }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tight">
          Welcome back
          {firstName && (
            <>, <span className="text-primary">{firstName}</span></>
          )}
          !
        </h1>
        <Button asChild>
          <Link href="/home/mood/check-in">
            <Smile className="mr-2 h-4 w-4" /> New Mood Check-in
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Daily Affirmation Card */}
        <Card className="col-span-full lg:col-span-3 bg-primary text-primary-foreground transition-shadow hover:shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Sparkles /> Daily Affirmation
            </CardTitle>
          </CardHeader>
          <CardContent className="relative flex-grow flex items-center">
            {loadingAffirmation ? (
              <div className="space-y-2 w-full">
                <Skeleton className="h-8 w-full bg-primary-foreground/20" />
                <Skeleton className="h-8 w-3/4 bg-primary-foreground/20" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-light pr-12">
                  &quot;{affirmation}&quot;
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopy}
                  className="absolute bottom-0 right-0 shrink-0 hover:bg-primary-foreground/20 text-primary-foreground"
                >
                  {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  <span className="sr-only">Copy affirmation</span>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="col-span-full lg:col-span-2 transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Your Stats</CardTitle>
            <CardDescription>A summary of your recent activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingData ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </>
            ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Journal Streak</span>
                    </div>
                    <div className="text-lg font-bold">{`${journalStreak} days`}</div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div className="flex flex-col">
                              <span className="font-medium leading-none">Mood Check-ins</span>
                              <span className="text-xs text-muted-foreground">(last 30 days)</span>
                          </div>
                      </div>
                      <div className="text-lg font-bold">{checkInCount}</div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HeartPulse className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Overall Mood</span>
                    </div>
                    <div className="text-lg font-bold">{overallMood.text}</div>
                  </div>
                </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Mood Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Mood Overview</CardTitle>
          <CardDescription>Your mood and stress trends from the last 7 check-ins.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
           {loadingData ? <Skeleton className="h-[350px] w-full" /> : <MoodHistoryChart data={chartData} />}
        </CardContent>
      </Card>

      {/* Quick Access Activities */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold font-headline mb-4">Start an Activity</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {quickAccessItems.map((item) => (
             <Link key={item.title} href={item.href} className="flex">
                <Card className="w-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-primary/50">
                    <CardHeader>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${item.color}`}>
                                <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                            </div>
                            <div>
                                <CardTitle className="font-headline text-lg">{item.title}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}