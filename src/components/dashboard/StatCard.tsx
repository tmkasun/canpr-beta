import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}
export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  className 
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-none shadow-soft transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
          <Icon className="h-4 w-4 text-red-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-1.5">
            {trend && (
              <span className={cn(
                "flex items-center text-xs font-medium",
                trend.isUp ? "text-emerald-600" : "text-rose-600"
              )}>
                {trend.isUp ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                {trend.value}%
              </span>
            )}
            {description && (
              <p className="text-xs text-muted-foreground truncate">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}