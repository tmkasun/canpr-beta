import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { DrawEntry } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
interface ScoreTrendChartProps {
  data: DrawEntry[];
  isLoading?: boolean;
  mode?: 'crs' | 'itas';
}
export function ScoreTrendChart({ data, isLoading, mode = 'crs' }: ScoreTrendChartProps) {
  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-2 shadow-soft border-none">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  // Sort data by date ascending for the chart
  const sortedData = [...data]
    .filter(entry => entry.date && isValid(parseISO(entry.date)))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(-20) // Limit to last 20 for readability
    .map(entry => ({
      ...entry,
      formattedDate: format(parseISO(entry.date), "MMM d, yy"),
    }));
  const isCrs = mode === 'crs';
  const dataKey = isCrs ? 'crsScore' : 'itasIssued';
  const label = isCrs ? 'CRS Score' : 'Invitations';
  const unit = isCrs ? 'pts' : 'ITAs';
  return (
    <Card className="col-span-1 md:col-span-2 shadow-soft border-none">
      <CardHeader>
        <CardTitle className="text-lg">
          {isCrs ? "CRS Cutoff Score Trend" : "Invitation Volume Trend"}
        </CardTitle>
        <CardDescription>
          {isCrs 
            ? "Fluctuation of minimum CRS scores over recent draws" 
            : "Total candidates invited per round over time"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sortedData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D80621" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#D80621" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                domain={isCrs ? ['auto', 'auto'] : [0, 'auto']}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => val.toLocaleString()}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()} ${unit}`, label]}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="#D80621"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scoreGradient)"
                name={label}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#D80621" }}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}