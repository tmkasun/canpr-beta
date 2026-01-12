import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Sparkles, TrendingUp, TrendingDown, Minus, CalendarDays, Zap } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
interface DrawPredictorProps {
  prediction: {
    nextEstimatedDate: Date | null;
    scoreConfidence: number;
    predictedRange: { low: number; high: number } | null;
    trendSignal: 'Steady' | 'Rising' | 'Falling';
    volatility: number;
  };
}
export function DrawPredictor({ prediction }: DrawPredictorProps) {
  const { nextEstimatedDate, scoreConfidence, predictedRange, trendSignal } = prediction;
  const daysUntil = nextEstimatedDate 
    ? differenceInDays(nextEstimatedDate, new Date()) 
    : 0;
  return (
    <Card className="relative overflow-hidden border-none shadow-soft group bg-card h-full flex flex-col">
      <div className="absolute top-0 right-0 p-3">
        <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-full border border-red-100 dark:border-red-900/50">
          <div className="size-1.5 rounded-full bg-red-600 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-tighter text-red-600 dark:text-red-400">Live AI Signal</span>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
          <Sparkles className="size-3.5 text-red-600" />
          Draw Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="text-3xl font-black tracking-tighter text-foreground tabular-nums flex items-baseline gap-1">
              {predictedRange ? (
                <>
                  <span className="text-red-600">{predictedRange.low}</span>
                  <span className="text-muted-foreground/30 text-xl">-</span>
                  <span className="text-red-600">{predictedRange.high}</span>
                </>
              ) : "---"}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Predicted Score Range</p>
          </div>
          <div className="flex flex-col items-end">
            <div className={cn(
              "p-2 rounded-xl mb-1",
              trendSignal === 'Rising' ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600" :
              trendSignal === 'Falling' ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" :
              "bg-blue-50 dark:bg-blue-950/20 text-blue-600"
            )}>
              {trendSignal === 'Rising' ? <TrendingUp className="size-5" /> :
               trendSignal === 'Falling' ? <TrendingDown className="size-5" /> :
               <Minus className="size-5" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">{trendSignal} Trend</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-muted/30 p-3 rounded-xl border border-transparent hover:border-muted-foreground/10 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="size-3 text-muted-foreground" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Next Est.</span>
            </div>
            <div className="text-xs font-black truncate">
              {nextEstimatedDate ? format(nextEstimatedDate, "MMM d") : "Calculating..."}
              <span className="ml-1 text-[10px] text-muted-foreground font-medium">({daysUntil}d)</span>
            </div>
          </div>
          <div className="bg-muted/30 p-3 rounded-xl border border-transparent hover:border-muted-foreground/10 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="size-3 text-muted-foreground" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Confidence</span>
            </div>
            <div className="text-xs font-black flex items-center gap-1.5">
              {scoreConfidence}%
              <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${scoreConfidence}%` }}
                  className="h-full bg-red-600"
                />
              </div>
            </div>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center gap-1.5 cursor-help text-[10px] font-medium text-muted-foreground/60 hover:text-foreground transition-colors pt-2">
                <Info className="size-3" />
                Prediction Methodology
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px] text-[11px] p-3 space-y-2">
              <p className="font-bold">Automated Analysis</p>
              <p>Scores are predicted using a 15-draw moving average, frequency variance, and current program momentum.</p>
              <p className="text-red-500 font-bold">Disclaimer: Estimates only. Not official IRCC advice.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}