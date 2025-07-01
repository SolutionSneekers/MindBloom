'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { valueToMood, moodEmojis } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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

const DetailsCard = ({ entry, onClose }: { entry: MoodChartData; onClose: () => void }) => {
    const emoji = moodEmojis[entry.moodName] || '😐';
    return (
      <Card className="mt-4 animate-in fade-in-50">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
            <CardTitle className="text-base font-medium">
                Details for {entry.name}
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close details</span>
            </Button>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pb-3 text-sm">
             <p className="font-semibold text-muted-foreground">{entry.time}</p>
             <div className="flex justify-between items-center gap-4">
                 <span className="text-muted-foreground">Mood:</span>
                 <span className="font-semibold flex items-center gap-1">{emoji} {entry.moodName}</span>
             </div>
             <div className="flex justify-between items-center gap-4">
                 <span className="text-muted-foreground">Stress Level:</span>
                 <span className="font-semibold">{entry.stressLevel}/10</span>
             </div>
        </CardContent>
      </Card>
    );
};


export default function MoodHistoryChart({ data }: { data: MoodChartData[] }) {
  const isMobile = useIsMobile();
  const [selectedEntry, setSelectedEntry] = useState<MoodChartData | null>(null);

  const handleBarClick = (data: any) => {
    if (isMobile) {
      if (selectedEntry && selectedEntry.name === data.payload.name && selectedEntry.time === data.payload.time) {
          setSelectedEntry(null);
      } else {
          setSelectedEntry(data.payload);
      }
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No mood data available to display.
      </div>
    )
  }

  return (
    <>
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
          {!isMobile && (
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
              content={<CustomTooltip />}
            />
          )}
          <Bar 
            dataKey="mood" 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]} 
            onClick={isMobile ? handleBarClick : undefined}
            className={cn(isMobile && "cursor-pointer")}
          />
        </BarChart>
      </ResponsiveContainer>
      {isMobile && selectedEntry && <DetailsCard entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
    </>
  )
}
