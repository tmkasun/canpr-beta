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
import { format, parseISO, differenceInDays, formatDistanceToNow, isValid } from 'date-fns';
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
  const latestScore = latestDraw?.crsScore ?? 0;
  const prevScore = previousDraw?.crsScore ?? 0;
  const isNewDraw = latestDraw && isValid(parseISO(latestDraw.date)) 
    ? differenceInDays(new Date(), parseISO(latestDraw.date)) <= 7 
    : false;
  const lastDate = latestDraw && isValid(parseISO(latestDraw.date))
    ? format(parseISO(latestDraw.date), 'MMM d, yyyy')
    : '---';
  const crsDiff = latestScore - prevScore;
  const isUp = crsDiff < 0; // Scores going down is "Up" trend for candidates
  if (isLoading && draws.length === 0) {
    return (
      <AppLayout container>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between gap-4">
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Executive Dashboard</h1>
              <AnimatePresence>
                {isFetching && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 text-[10px] font-bold border border-red-100"
                  >
                    <RefreshCcw className="h-3 w-3 animate-spin" /> Live Syncing
                  </motion.div>
                )}
              </AnimatePresence>
              {isNewDraw && (
                <Badge className="bg-emerald-500 text-white border-none h-5 px-2">
                  <Bell className="w-2.5 h-2.5 mr-1" /> New Round
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-sm font-medium">Official IRCC Data Analytics for {currentYear}</p>
              {dataUpdatedAt && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50 tabular-nums">
                  <Clock className="size-3" />
                  Synced {formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })}
                </div>
              )}
            </div>
          </div>
          <Link to="/calculator" className="w-full md:w-auto">
            <Button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 px-6 font-bold">
              Check Eligibility
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Latest Cutoff"
            value={latestScore || "---"}
            icon={Trophy}
            description={latestDraw?.programType ? `Type: ${latestDraw.programType}` : "Pending update"}
            trend={latestScore > 0 && prevScore > 0 ? { value: Math.abs(crsDiff), isUp } : undefined}
          />
          <StatCard
            title={`ITAs Issued (${currentYear})`}
            value={totalItasYearToDate.toLocaleString()}
            icon={Users}
            description="Total candidates invited YTD"
          />
          <StatCard title="Last Draw Date" value={lastDate} icon={Calendar} description="Official publication date" />
          <StatCard title="IRCC Status" value="Active" icon={Activity} description="Data gateway operational" />
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <ScoreTrendChart data={draws} isLoading={isLoading && draws.length === 0} />
          <InvitationBarChart data={draws} isLoading={isLoading && draws.length === 0} />
        </div>
        <div className="rounded-xl border bg-card shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Recent IRCC Activity</h2>
            <Link to="/history">
              <Button variant="ghost" className="text-red-600 hover:text-red-700 font-bold group">
                Full Records <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {draws.slice(0, 5).map((draw) => (
              <div key={draw.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-transparent hover:border-border group transition-all">
                <div className="flex items-center gap-4 truncate">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-background flex items-center justify-center border font-bold text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    {draw.drawNumber}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-sm text-foreground truncate">{draw.programType} Round</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                      {isValid(parseISO(draw.date)) ? format(parseISO(draw.date), "MMMM d, yyyy") : draw.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0 ml-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Invitations</div>
                    <div className="font-black text-sm tabular-nums">{draw.itasIssued.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Cutoff</div>
                    <Badge variant="secondary" className="font-black bg-red-100 text-red-700 dark:bg-red-900/30 tabular-nums px-3">
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