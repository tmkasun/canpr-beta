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
}
export function InvitationBarChart({ data, isLoading }: InvitationBarChartProps) {
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
  const chartData = [...data]
    .filter(entry => entry.date && isValid(parseISO(entry.date)))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(-10)
    .map(entry => ({
      ...entry,
      shortDate: format(parseISO(entry.date), "MM/dd"),
    }));
  return (
    <Card className="shadow-soft border-none">
      <CardHeader>
        <CardTitle className="text-lg">Invitations Issued (ITAs)</CardTitle>
        <CardDescription>Volume of candidates invited in last 10 draws</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
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
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.programType === 'PNP' ? '#6366f1' : entry.programType === 'CEC' ? '#10b981' : '#D80621'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}