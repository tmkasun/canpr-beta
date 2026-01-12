import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Sparkles, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
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
  const { scoreConfidence, predictedRange, trendSignal } = prediction;
  return (
    <Card className="relative overflow-hidden border border-border shadow-sm group bg-card h-full flex flex-col transition-all duration-300 hover:shadow-md hover:border-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
          <Sparkles className="size-3.5 text-primary" />
          Draw Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-6 flex flex-col justify-center">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="text-3xl font-black tracking-tighter text-foreground tabular-nums flex items-baseline gap-1">
              {predictedRange ? (
                <>
                  <span className="text-primary">{predictedRange.low}</span>
                  <span className="text-muted-foreground/30 text-xl">-</span>
                  <span className="text-primary">{predictedRange.high}</span>
                </>
              ) : "---"}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Predicted Score Range</p>
          </div>
          <div className="flex flex-col items-end">
            <div className={cn(
              "p-2 rounded-xl mb-1 transition-colors duration-300",
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
        <div className="space-y-3">
          <div className="bg-muted/30 p-4 rounded-xl border border-border/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="size-3.5 text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Confidence Level</span>
              </div>
              <span className="text-xs font-black tabular-nums">{scoreConfidence}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scoreConfidence}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
              />
            </div>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center gap-1.5 cursor-help text-[10px] font-bold text-muted-foreground/60 hover:text-foreground transition-colors">
                <Info className="size-3" />
                AI PROJECTION METHODOLOGY
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-[220px] text-[11px] p-4 space-y-2 bg-card border-border shadow-2xl rounded-xl">
              <p className="font-bold text-primary">Algorithmic Forecast</p>
              <p className="leading-relaxed">Scores are projected using a 15-draw rolling average, frequency variance, and current program-specific momentum.</p>
              <p className="text-primary font-bold pt-1 border-t border-dashed mt-2">Disclaimer: Statistical estimates only. Not official IRCC advice.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}