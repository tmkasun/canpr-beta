import React from 'react';
import {
  Users,
  Calendar,
  Trophy,
  Activity,
  ArrowRight,
  Bell,
  RefreshCcw
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ScoreTrendChart } from '@/components/dashboard/ScoreTrendChart';
import { InvitationBarChart } from '@/components/dashboard/InvitationBarChart';
import { useDrawData } from '@/hooks/use-draw-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
export function HomePage() {
  const { draws, latestDraw, previousDraw, totalItasYearToDate, isLoading, isFetching, currentYear } = useDrawData();
  const isNewDraw = latestDraw ? differenceInDays(new Date(), parseISO(latestDraw.date)) <= 10 : false;
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
          <div className="h-12 w-64 bg-muted animate-pulse rounded-lg" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
          </div>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 h-[400px] bg-muted animate-pulse rounded-xl" />
            <div className="h-[400px] bg-muted animate-pulse rounded-xl" />
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Executive Dashboard</h1>
              <AnimatePresence>
                {isFetching && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 px-2 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider"
                  >
                    <RefreshCcw className="h-3 w-3 animate-spin" />
                    Syncing Live
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-sm">Canada Express Entry analytics for {currentYear}</p>
              {isNewDraw && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none animate-bounce py-0 h-5">
                  <Bell className="w-2.5 h-2.5 mr-1" /> New Draw
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/calculator">
              <Button className="bg-red-600 hover:bg-red-700 text-white shadow-primary">
                Run Score Simulator
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
            trend={{ value: 100, isUp: true }}
          />
          <StatCard title="Last Draw Date" value={lastDate} icon={Calendar} description="Official IRCC update" />
          <StatCard title="System Health" value="Active" icon={Activity} description="IRCC API Gateway Online" />
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <ScoreTrendChart data={draws} isLoading={isLoading && draws.length === 0} />
          <InvitationBarChart data={draws} isLoading={isLoading && draws.length === 0} />
        </div>
        <div className="rounded-xl border bg-card shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            <Link to="/history">
              <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                View All History <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {draws.slice(0, 5).map((draw) => (
              <div key={draw.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 transition-all hover:bg-muted/50 border border-transparent hover:border-border group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm text-xs font-bold text-red-600 group-hover:bg-red-50 group-hover:text-red-700 transition-colors">
                    #{draw.drawNumber}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{draw.programType} Draw</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-tight">{format(parseISO(draw.date), "MMMM d, yyyy")}</div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] uppercase text-muted-foreground font-medium">ITAs</div>
                    <div className="font-bold text-sm text-foreground">{draw.itasIssued.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-muted-foreground font-medium">Score</div>
                    <Badge variant="secondary" className="font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-3">
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