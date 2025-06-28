import MoodHistoryChart from "@/components/mood-history-chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const moodHistoryData = [
  {
    date: "2024-07-21",
    mood: "Happy",
    stressLevel: 2,
    journalSnippet: "Had a great day with friends...",
  },
  {
    date: "2024-07-20",
    mood: "Anxious",
    stressLevel: 8,
    journalSnippet: "Stressed about the upcoming project deadline.",
  },
  {
    date: "2024-07-19",
    mood: "Calm",
    stressLevel: 3,
    journalSnippet: "A quiet evening, read a book.",
  },
  {
    date: "2024-07-18",
    mood: "Okay",
    stressLevel: 5,
    journalSnippet: "Just a regular day, nothing special.",
  },
  {
    date: "2024-07-17",
    mood: "Sad",
    stressLevel: 7,
    journalSnippet: "Feeling a bit down today.",
  },
  {
    date: "2024-07-16",
    mood: "Happy",
    stressLevel: 1,
    journalSnippet: "Felt really productive and accomplished a lot.",
  },
]

const moodColors: { [key: string]: string } = {
  Happy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Anxious: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Calm: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Okay: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  Sad: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  Angry: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export default function MoodHistoryPage() {
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
            A visual overview of your mood fluctuations over the past week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MoodHistoryChart />
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
              {moodHistoryData.map((entry) => (
                <TableRow key={entry.date}>
                  <TableCell className="font-medium">{entry.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(moodColors[entry.mood])}>{entry.mood}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{entry.stressLevel}</TableCell>
                  <TableCell className="text-muted-foreground italic">
                    &quot;{entry.journalSnippet}&quot;
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to use with cn
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
