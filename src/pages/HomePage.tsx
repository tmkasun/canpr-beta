import React from 'react';
import {
  Users,
  Calendar,
  Trophy,
  Activity,
  ArrowRight,
  Bell,
  RefreshCcw,
  Clock
} from 'lucide-react';
import { format, parseISO, differenceInDays, formatDistanceToNow } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ScoreTrendChart } from '@/components/dashboard/ScoreTrendChart';
import { InvitationBarChart } from '@/components/dashboard/InvitationBarChart';
import { useDrawData } from '@/hooks/use-draw-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
export function HomePage() {
  const { draws, latestDraw, previousDraw, totalItasYearToDate, isLoading, isFetching, currentYear, dataUpdatedAt } = useDrawData();
  const isNewDraw = latestDraw ? differenceInDays(new Date(), parseISO(latestDraw.date)) <= 7 : false;
  const latestScore = latestDraw?.crsScore ?? 0;
  const prevScore = previousDraw?.crsScore ?? 0;
  const lastDate = latestDraw ? format(parseISO(latestDraw.date), 'MMM d, yyyy') : 'No Data';
  const program = latestDraw?.programType ?? 'N/A';
  const crsDiff = latestScore - prevScore;
  const crsTrendValue = Math.abs(crsDiff);
  const isUp = crsDiff < 0; 
  if (isLoading && draws.length === 0) {
    return (
      <AppLayout container>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
             <div className="space-y-2">
               <Skeleton className="h-10 w-64" />
               <Skeleton className="h-4 w-48" />
             </div>
             <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <Skeleton className="lg:col-span-2 h-[400px] rounded-xl" />
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Executive Dashboard</h1>
              <AnimatePresence>
                {isFetching && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider border border-red-100 dark:border-red-900/30"
                  >
                    <RefreshCcw className="h-3 w-3 animate-spin" />
                    Live Syncing
                  </motion.div>
                )}
              </AnimatePresence>
              {isNewDraw && (
                <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white border-none shadow-sm h-5 px-2">
                  <Bell className="w-2.5 h-2.5 mr-1" /> Recent Draw
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-muted-foreground text-sm">Canada Express Entry analytics for {currentYear}</p>
              {dataUpdatedAt && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 bg-muted/30 px-2 py-0.5 rounded-md border border-border/50">
                  <Clock className="size-3" />
                  Updated {formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/calculator" className="w-full md:w-auto">
              <Button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 dark:shadow-red-950/40 px-6">
                Calculate My Score
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Latest Cutoff Score"
            value={latestScore || "..."}
            icon={Trophy}
            description={`Program: ${program}`}
            trend={latestScore > 0 && prevScore > 0 ? { value: crsTrendValue, isUp } : undefined}
          />
          <StatCard
            title={`Total ITAs (${currentYear})`}
            value={totalItasYearToDate.toLocaleString()}
            icon={Users}
            description="Invitations issued YTD"
          />
          <StatCard title="Last Draw Date" value={lastDate} icon={Calendar} description="Official IRCC update" />
          <StatCard title="System Health" value="Active" icon={Activity} description="IRCC Gateway Operational" />
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <ScoreTrendChart data={draws} isLoading={isLoading && draws.length === 0} />
          <InvitationBarChart data={draws} isLoading={isLoading && draws.length === 0} />
        </div>
        <div className="rounded-xl border bg-card shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            <Link to="/history">
              <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 group">
                Full History <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading && draws.length === 0 ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border/50 h-[74px]">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))
            ) : draws.slice(0, 5).map((draw) => (
              <div key={draw.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 transition-all hover:bg-muted/50 border border-transparent hover:border-border group h-[74px]">
                <div className="flex items-center gap-4 truncate">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-background flex items-center justify-center border shadow-sm text-xs font-bold text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    #{draw.drawNumber}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-sm text-foreground truncate">{draw.programType} Draw</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-tight">{format(parseISO(draw.date), "MMMM d, yyyy")}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-8 shrink-0 ml-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] uppercase text-muted-foreground font-medium">ITAs</div>
                    <div className="font-bold text-sm text-foreground tabular-nums">{draw.itasIssued.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-muted-foreground font-medium">Score</div>
                    <Badge variant="secondary" className="font-black bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-3 tabular-nums">
                      {draw.crsScore}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}