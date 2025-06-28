'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const moodToValue: { [key: string]: number } = {
  Angry: 1,
  Sad: 2,
  Anxious: 3,
  Okay: 4,
  Calm: 5,
  Happy: 6,
}

const valueToMood: { [key: number]: string } = {
  1: "Angry",
  2: "Sad",
  3: "Anxious",
  4: "Okay",
  5: "Calm",
  6: "Happy",
}

export interface MoodChartData {
    name: string;
    mood: number;
}

export default function MoodHistoryChart({ data }: { data: MoodChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No mood data available to display.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => valueToMood[value] || ""}
          domain={[0, 7]}
          ticks={[1,2,3,4,5,6]}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
          contentStyle={{
            background: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          formatter={(value: number) => [valueToMood[value], "Mood"]}
        />
        <Bar dataKey="mood" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
