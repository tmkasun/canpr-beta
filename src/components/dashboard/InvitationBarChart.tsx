import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { DrawEntry } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
interface InvitationBarChartProps {
  data: DrawEntry[];
  isLoading?: boolean;
  mode?: 'crs' | 'itas';
}
export function InvitationBarChart({ data, isLoading, mode = 'crs' }: InvitationBarChartProps) {
  if (isLoading) {
    return (
      <Card className="shadow-soft border-none">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }
  const isCrsMode = mode === 'crs';
  const chartData = [...data]
    .filter(entry => entry.date && isValid(parseISO(entry.date)))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .map(entry => ({
      ...entry,
      shortDate: format(parseISO(entry.date), "MM/dd"),
      fullDate: format(parseISO(entry.date), "MMM d, yyyy"),
    }));
  const isDense = chartData.length > 20;
  return (
    <Card className="shadow-soft border-none">
      <CardHeader>
        <CardTitle className="text-lg">
          {isCrsMode ? "Volume Context" : "ITA Distribution"}
          {isDense && <span className="ml-2 text-xs font-normal text-muted-foreground">({chartData.length} pts)</span>}
        </CardTitle>
        <CardDescription>
          {isCrsMode
            ? "Invitation volume for the selected window"
            : "Program-specific invitation highlights"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                dy={10}
                interval={isDense ? (chartData.length > 50 ? 9 : 4) : 0}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => val.toLocaleString()}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
                formatter={(value: number, name: string, props: any) => [
                  value.toLocaleString(), 
                  `ITAs (${props.payload.programType})`
                ]}
                labelFormatter={(label, items) => items[0]?.payload?.fullDate || label}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px'
                }}
              />
              <Bar
                dataKey="itasIssued"
                name="ITAs Issued"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
                barSize={isDense ? undefined : 24}
              >
                {chartData.map((entry, index) => {
                  let fill = '#D80621'; // Default General Red
                  if (entry.programType === 'PNP') fill = '#6366f1';
                  if (entry.programType === 'CEC') fill = '#10b981';
                  if (entry.programType === 'Category-based') fill = '#a855f7';
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fill}
                      fillOpacity={isCrsMode ? (isDense ? 0.4 : 0.6) : 1}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}