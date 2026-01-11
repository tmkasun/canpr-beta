import React from 'react';
import {
  Users,
  Calendar,
  Trophy,
  Activity,
  ArrowRight,
  Bell
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ScoreTrendChart } from '@/components/dashboard/ScoreTrendChart';
import { InvitationBarChart } from '@/components/dashboard/InvitationBarChart';
import { useDrawData } from '@/hooks/use-draw-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
export function HomePage() {
  const { draws, latestDraw, previousDraw, totalItasYearToDate, isLoading, currentYear } = useDrawData();
  const isNewDraw = latestDraw ? differenceInDays(new Date(), parseISO(latestDraw.date)) <= 14 : false;
  const latestScore = latestDraw?.crsScore ?? 0;
  const prevScore = previousDraw?.crsScore ?? 0;
  const lastDate = latestDraw ? format(parseISO(latestDraw.date), 'MMM d, yyyy') : 'No Data';
  const program = latestDraw?.programType ?? 'N/A';
  const crsDiff = latestScore - prevScore;
  const crsTrendValue = Math.abs(crsDiff);
  const isUp = crsDiff < 0; // Lower CRS is better for accessibility
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  if (isLoading) {
    return (
      <AppLayout container>
        <div className="space-y-8 animate-pulse">
          <div className="h-12 w-64 bg-muted rounded-lg" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
          </div>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 h-[400px] bg-muted rounded-xl" />
            <div className="h-[400px] bg-muted rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Executive Dashboard</h1>
              {isNewDraw && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none animate-pulse">
                  <Bell className="w-3 h-3 mr-1" /> New Draw
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Comprehensive insights into Canada Express Entry draws</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/calculator">
              <Button className="bg-red-600 hover:bg-red-700 text-white shadow-primary">
                Run Score Simulator
              </Button>
            </Link>
          </motion.div>
        </div>
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Latest Cutoff Score"
            value={latestScore}
            icon={Trophy}
            description={`Program: ${program}`}
            trend={{ value: crsTrendValue, isUp }}
          />
          <StatCard
            title={`Total ITAs (${currentYear})`}
            value={totalItasYearToDate.toLocaleString()}
            icon={Users}
            description="Invitations issued YTD"
            trend={{ value: 12, isUp: true }}
          />
          <StatCard title="Last Draw Date" value={lastDate} icon={Calendar} description="Official IRCC update" />
          <StatCard title="System Health" value="Active" icon={Activity} description="Processing times stable" />
        </motion.div>
        <motion.div variants={itemVariants} className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <ScoreTrendChart data={draws} />
          <InvitationBarChart data={draws} />
        </motion.div>
        <motion.div variants={itemVariants} className="rounded-xl border bg-card shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            <Link to="/history">
              <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                View All History <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {draws.slice(0, 5).map((draw) => (
              <div key={draw.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 transition-all hover:bg-muted/50 border border-transparent hover:border-border hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm text-xs font-bold text-red-600">
                    #{draw.drawNumber}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{draw.programType} Draw</div>
                    <div className="text-xs text-muted-foreground">{format(parseISO(draw.date), "MMMM d, yyyy")}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] uppercase text-muted-foreground">ITAs</div>
                    <div className="font-bold text-sm text-foreground">{draw.itasIssued.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-muted-foreground">Score</div>
                    <Badge variant="secondary" className="font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      {draw.crsScore}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}