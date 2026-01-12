import React from "react";
import { LucideIcon, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    iconDirection?: 'up' | 'down';
  };
  link?: string;
  linkText?: string;
  className?: string;
}
export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  link,
  linkText,
  className
}: StatCardProps) {
  const renderTrendIcon = () => {
    if (!trend) return null;
    const direction = trend.iconDirection || (trend.isPositive ? 'up' : 'down');
    return direction === 'up' ? (
      <TrendingUp className="mr-1 h-3 w-3" />
    ) : (
      <TrendingDown className="mr-1 h-3 w-3" />
    );
  };
  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        layout: { duration: 0.3 }
      }}
      className="h-full"
    >
      <Card className={cn(
        "overflow-hidden border border-border shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary group bg-card flex flex-col h-full",
        className
      )}>
        <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0">
          <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/90">
            {title}
          </CardTitle>
          <div className="p-1.5 rounded-xl bg-muted group-hover:bg-primary group-hover:shadow-[0_0_15px_-3px_rgba(216,6,33,0.4)] transition-all duration-300">
            <Icon className="h-3.5 w-3.5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`val-${title}-${value}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-black tracking-tight text-foreground tabular-nums"
              >
                {value}
              </motion.div>
            </AnimatePresence>
          </div>
          {(description || (trend && trend.value !== 0)) && (
            <div className="mt-2 flex items-center gap-1.5 flex-wrap min-h-[22px]">
              {trend && (
                <span className={cn(
                  "flex items-center text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border transition-colors",
                  trend.isPositive
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50"
                    : "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50"
                )}>
                  {renderTrendIcon()}
                  {trend.value} pts
                </span>
              )}
              {description && (
                <p className="text-[11px] font-medium text-muted-foreground/80 truncate max-w-full italic">
                  {description}
                </p>
              )}
            </div>
          )}
        </CardContent>
        {link && (
          <CardFooter className="px-6 py-3 border-t border-dashed bg-muted/5 group-hover:bg-muted/10 transition-colors mt-auto">
            <Link
              to={link}
              className="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group/link"
            >
              <span>{linkText || "View Details"}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}