import React, { useMemo } from 'react';
import {
  Users,
  Calendar,
  Trophy,
  Activity,
  ArrowRight,
  Bell,
  RefreshCcw,
  Clock,
  UserCheck
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
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CRSProfile } from '@shared/types';
import { cn } from '@/lib/utils';
export function HomePage() {
  const { draws, latestDraw, previousDraw, totalItasYearToDate, averageCrsAllTime, isLoading, isFetching, currentYear, dataUpdatedAt } = useDrawData();
  const { data: profilesData } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => api<{ items: CRSProfile[] }>('/api/profiles'),
  });
  const latestProfile = useMemo(() => {
    if (!profilesData?.items || profilesData.items.length === 0) return null;
    return [...profilesData.items].sort((a, b) => 
      parseISO(b.date).getTime() - parseISO(a.date).getTime()
    )[0];
  }, [profilesData]);
  const latestScore = latestDraw?.crsScore ?? 0;
  const prevScore = previousDraw?.crsScore ?? 0;
  const isNewDraw = latestDraw && isValid(parseISO(latestDraw.date))
    ? differenceInDays(new Date(), parseISO(latestDraw.date)) <= 7
    : false;
  const lastDate = latestDraw && isValid(parseISO(latestDraw.date))
    ? format(parseISO(latestDraw.date), 'MMM d, yyyy')
    : '---';
  const crsDiff = latestScore - prevScore;
  const isUpTrend = crsDiff < 0;
  // Personal score calculations
  const userScore = latestProfile?.score ?? averageCrsAllTime;
  const scoreLabel = latestProfile ? "Your Saved Score" : "Historical Average";
  const personalGap = userScore - latestScore;
  const isQualified = personalGap >= 0;
  if (isLoading && draws.length === 0) {
    return (
      <AppLayout container>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
             <div className="space-y-3">
               <Skeleton className="h-10 w-72 rounded-lg" />
               <Skeleton className="h-4 w-56 rounded-md" />
             </div>
             <Skeleton className="h-12 w-44 rounded-xl" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Executive Dashboard</h1>
              <AnimatePresence>
                {isFetching && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20"
                  >
                    <RefreshCcw className="h-3 w-3 animate-spin" /> Live Updating
                  </motion.div>
                )}
              </AnimatePresence>
              {isNewDraw && (
                <Badge className="bg-emerald-500 text-white border-none shadow-sm h-6 px-3">
                  <Bell className="w-3 h-3 mr-1.5" /> Recent Draw
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-muted-foreground text-sm font-medium">IRCC Intelligence Terminal • {currentYear}</p>
              {dataUpdatedAt && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 tabular-nums bg-muted/50 px-2 py-0.5 rounded-md border">
                  <Clock className="size-3" />
                  Last synced {formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })}
                </div>
              )}
            </div>
          </div>
          <Link to="/calculator" className="w-full md:w-auto">
            <Button size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 px-8 font-bold rounded-xl h-12">
              Calculate Your Score
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Latest Cutoff"
            value={latestScore || "---"}
            icon={Trophy}
            description={latestDraw?.programType ? `Type: ${latestDraw.programType}` : "Round specific"}
            trend={latestScore > 0 && prevScore > 0 ? { value: Math.abs(crsDiff), isUp: isUpTrend } : undefined}
          />
          <StatCard
            title={`ITAs (${currentYear})`}
            value={totalItasYearToDate.toLocaleString()}
            icon={Users}
            description="Total candidates invited YTD"
          />
          <StatCard 
            title="Your Status" 
            value={userScore} 
            icon={UserCheck} 
            description={scoreLabel}
            trend={latestScore > 0 ? { value: Math.abs(personalGap), isUp: isQualified } : undefined}
            link="/calculator"
            linkText="Update Profile"
          />
          <StatCard 
            title="Next Draw" 
            value={lastDate} 
            icon={Calendar} 
            description="Anticipated Window" 
          />
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <ScoreTrendChart data={draws} isLoading={isLoading && draws.length === 0} />
          <InvitationBarChart data={draws} isLoading={isLoading && draws.length === 0} />
        </div>
        <div className="rounded-2xl border bg-card shadow-lg p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Recent IRCC Activity</h2>
              <p className="text-sm text-muted-foreground">Detailed logs of the latest Express Entry rounds</p>
            </div>
            <Link to="/history" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto text-primary hover:text-primary border-primary/20 hover:bg-primary/5 font-bold group rounded-xl">
                View All Draws <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {draws.slice(0, 5).map((draw) => (
              <div key={draw.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-primary/[0.02] group transition-all duration-300">
                <div className="flex items-center gap-5 truncate">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-background flex items-center justify-center border-2 border-primary/10 font-black text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                    {draw.drawNumber}
                  </div>
                  <div className="truncate space-y-0.5">
                    <div className="font-bold text-base text-foreground truncate">{draw.programType} Round</div>
                    <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                      {isValid(parseISO(draw.date)) ? format(parseISO(draw.date), "MMMM d, yyyy") : draw.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-10 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-primary/5">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Invitations</div>
                    <div className="font-black text-base tabular-nums">{draw.itasIssued.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Min. Score</div>
                    <Badge variant="secondary" className="font-black bg-primary/10 text-primary border-primary/5 tabular-nums px-4 py-1 text-sm rounded-lg">
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