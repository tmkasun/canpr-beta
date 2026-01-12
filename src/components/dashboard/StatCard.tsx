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
    isUp: boolean;
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
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className={cn(
        "overflow-hidden border border-transparent shadow-soft transition-all duration-300 hover:shadow-md hover:border-red-200/50 dark:hover:border-red-900/50 h-full group bg-card flex flex-col",
        className
      )}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
            {title}
          </CardTitle>
          <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/20 group-hover:bg-red-600 group-hover:shadow-[0_0_15px_-3px_rgba(220,38,38,0.4)] dark:group-hover:bg-red-900/40 transition-all duration-300">
            <Icon className="h-4 w-4 text-red-600 group-hover:text-white transition-colors duration-300" />
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={value}
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
              {trend && trend.value !== 0 && (
                <span className={cn(
                  "flex items-center text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                  trend.isUp
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                )}>
                  {trend.isUp ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                  {trend.value} pts
                </span>
              )}
              {description && (
                <p className="text-[11px] font-medium text-muted-foreground/70 truncate max-w-full italic">
                  {description}
                </p>
              )}
            </div>
          )}
        </CardContent>
        {link && (
          <CardFooter className="px-6 py-3 border-t border-dashed bg-muted/5 group-hover:bg-muted/10 transition-colors">
            <Link
              to={link}
              className="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-red-600 transition-colors group/link"
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