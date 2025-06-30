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

const moodEmojis: { [key: string]: string } = {
  'Angry': '😠',
  'Sad': '😢',
  'Anxious': '😟',
  'Okay': '🙂',
  'Calm': '😌',
  'Happy': '😄',
};

export interface MoodChartData {
    name: string; // date e.g., 'Jul 20'
    mood: number; // mood value for Y-axis
    stressLevel: number;
    time: string;
    moodName: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const emoji = moodEmojis[data.moodName] || '😐';

    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm text-sm">
        <p className="font-bold mb-2">{label} at {data.time}</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground">Mood:</span>
            <span className="font-semibold flex items-center gap-1">{emoji} {data.moodName}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-muted-foreground">Stress Level:</span>
            <span className="font-semibold">{data.stressLevel}/10</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};


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
          content={<CustomTooltip />}
        />
        <Bar dataKey="mood" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
