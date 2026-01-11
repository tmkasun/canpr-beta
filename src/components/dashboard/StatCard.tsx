import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className={cn("overflow-hidden border-none shadow-soft transition-all hover:shadow-md h-full group", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
            <Icon className="h-4 w-4 text-red-600 group-hover:scale-110 transition-transform duration-200" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
          {(description || trend) && (
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              {trend && (
                <span className={cn(
                  "flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-md",
                  trend.isUp 
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" 
                    : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                )}>
                  {trend.isUp ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                  {trend.value}
                </span>
              )}
              {description && (
                <p className="text-xs text-muted-foreground truncate max-w-full">
                  {description}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}