import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Brush
} from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { DrawEntry } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
interface ScoreTrendChartProps {
  data: DrawEntry[];
  isLoading?: boolean;
  mode?: 'crs' | 'itas';
}
export function ScoreTrendChart({ data, isLoading, mode = 'crs' }: ScoreTrendChartProps) {
  const isMobile = useIsMobile();
  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-2 shadow-soft border border-border min-h-[450px]">
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
  const sortedData = [...data]
    .filter(entry => entry.date && isValid(parseISO(entry.date)))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .map(entry => ({
      ...entry,
      formattedDate: format(parseISO(entry.date), isMobile ? "MM/dd" : "MMM d, yy"),
      fullDate: format(parseISO(entry.date), "MMMM d, yyyy"),
    }));
  const isCrs = mode === 'crs';
  const dataKey = isCrs ? 'crsScore' : 'itasIssued';
  const label = isCrs ? 'CRS Score' : 'Invitations';
  const unit = isCrs ? 'pts' : 'ITAs';
  const isLargeSet = sortedData.length > 30;
  return (
    <Card className="col-span-1 lg:col-span-2 shadow-soft border border-border min-h-[450px]">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between font-bold">
          <span>{isCrs ? "CRS Cutoff Trend" : "Invitation Volume Trend"}</span>
          {isLargeSet && <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">Historical View</Badge>}
        </CardTitle>
        <CardDescription className="text-xs font-medium text-muted-foreground">
          {isCrs 
            ? "Visualizing minimum scores over the selected window" 
            : "Invitation totals per round based on current filters"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-8">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sortedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D80621" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#D80621" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }} 
                axisLine={false}
                tickLine={false}
                dy={10}
                interval={isMobile ? (sortedData.length > 10 ? 4 : 2) : (isLargeSet ? "preserveStartEnd" : 0)}
              />
              <YAxis 
                domain={isCrs ? ['auto', 'auto'] : [0, 'auto']}
                tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => val.toLocaleString()}
                width={40}
              />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${value.toLocaleString()} ${unit}`, 
                  `${label} (${props.payload.programType})`
                ]}
                labelFormatter={(label, items) => items[0]?.payload?.fullDate || label}
                contentStyle={{
                  borderRadius: '16px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  fontSize: '12px',
                  fontWeight: '700',
                  padding: '12px',
                  color: 'hsl(var(--foreground))'
                }}
                itemStyle={{ padding: '2px 0' }}
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
                animationDuration={1500}
              />
              {!isMobile && (
                <Brush 
                  dataKey="formattedDate" 
                  height={25} 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--muted))"
                  className="text-[10px]"
                  travellerWidth={8}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}