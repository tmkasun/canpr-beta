import React, { useMemo, useState } from 'react';
import {
  Users,
  Calendar,
  Trophy,
  ArrowRight,
  Bell,
  RefreshCcw,
  Clock,
  UserCheck,
  Zap,
  BarChart3,
  LineChart,
  Filter,
  Info
} from 'lucide-react';
import { format, parseISO, differenceInDays, formatDistanceToNow, isValid, startOfYear, isAfter } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ScoreTrendChart } from '@/components/dashboard/ScoreTrendChart';
import { InvitationBarChart } from '@/components/dashboard/InvitationBarChart';
import { DrawPredictor } from '@/components/dashboard/DrawPredictor';
import { useDrawData } from '@/hooks/use-draw-data';
import { usePredictions } from '@/hooks/use-predictions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { CRSProfile, ProgramType } from '@shared/types';
import { cn } from '@/lib/utils';
export function HomePage() {
  const { draws, isLoading, isFetching, currentYear, dataUpdatedAt, refetch } = useDrawData();
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | 'all'>('all');
  const [analyticsMode, setAnalyticsMode] = useState<'crs' | 'itas'>('crs');
  const [rangeLimit, setRangeLimit] = useState<string>('20');
  const { data: profilesData } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => api<{ items: CRSProfile[] }>('/api/profiles'),
    staleTime: 1000 * 60 * 5,
  });
  const filteredDraws = useMemo(() => {
    if (selectedProgram === 'all') return draws;
    return draws.filter(d => d.programType === selectedProgram);
  }, [draws, selectedProgram]);
  const rangedDraws = useMemo(() => {
    if (rangeLimit === 'all') return filteredDraws;
    const limit = parseInt(rangeLimit, 10);
    return filteredDraws.slice(0, limit);
  }, [filteredDraws, rangeLimit]);
  const prediction = usePredictions(filteredDraws);
  const latestDraw = useMemo(() => filteredDraws[0] ?? null, [filteredDraws]);
  const previousDraw = useMemo(() => filteredDraws[1] ?? null, [filteredDraws]);
  const latestScore = latestDraw?.crsScore ?? 0;
  const prevScore = previousDraw?.crsScore ?? 0;
  const crsDiff = latestScore > 0 && prevScore > 0 ? latestScore - prevScore : 0;
  const isUpTrend = crsDiff < 0;
  const totalItasYearToDate = useMemo(() => {
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    return filteredDraws
      .filter(d => {
        const dDate = parseISO(d.date);
        return isValid(dDate) && isAfter(dDate, yearStart);
      })
      .reduce((acc, d) => acc + (Number(d.itasIssued) || 0), 0);
  }, [filteredDraws, currentYear]);
  const latestProfile = useMemo(() => {
    if (!profilesData?.items || profilesData.items.length === 0) return null;
    return [...profilesData.items].sort((a, b) =>
      parseISO(b.date).getTime() - parseISO(a.date).getTime()
    )[0];
  }, [profilesData]);
  const isNewDraw = useMemo(() => {
    if (!latestDraw?.date) return false;
    const d = parseISO(latestDraw.date);
    return isValid(d) && differenceInDays(new Date(), d) <= 14;
  }, [latestDraw]);
  const lastDate = useMemo(() => {
    if (!latestDraw?.date) return '---';
    const d = parseISO(latestDraw.date);
    return isValid(d) ? format(d, 'MMM d, yyyy') : '---';
  }, [latestDraw]);
  const userScore = latestProfile?.score ?? null;
  const personalGap = (userScore !== null && latestScore > 0) ? userScore - latestScore : null;
  const isQualified = personalGap !== null && personalGap >= 0;
  const marketSummary = useMemo(() => {
    if (filteredDraws.length < 2) return "";
    const avgScore = Math.round(filteredDraws.slice(0, 5).reduce((a, b) => a + b.crsScore, 0) / 5);
    const direction = crsDiff > 0 ? "climbing" : "cooling";
    return `The ${selectedProgram === 'all' ? 'General' : selectedProgram} market is ${direction}; scores average ${avgScore} pts recently.`;
  }, [filteredDraws, selectedProgram, crsDiff]);
  if (isLoading && draws.length === 0) {
    return (
      <AppLayout container>
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-8 w-8 rounded-full hover:bg-muted"
                title="Refresh Live Data"
              >
                <RefreshCcw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              </Button>
              {isNewDraw && (
                <Badge className="bg-emerald-500 text-white border-none shadow-sm h-6 px-3 animate-pulse">
                  <Bell className="w-3 h-3 mr-1.5" /> Recent Round
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-muted-foreground text-sm font-medium">IRCC Intelligence Terminal �� {currentYear}</p>
              {dataUpdatedAt && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 tabular-nums bg-muted/50 px-2 py-0.5 rounded-md border">
                  <Clock className="size-3" />
                  Synced {formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Select value={selectedProgram} onValueChange={(v) => setSelectedProgram(v as ProgramType | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl border-muted bg-card shadow-sm font-bold">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rounds</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="CEC">CEC (Exp. Class)</SelectItem>
                <SelectItem value="PNP">PNP (Provincial)</SelectItem>
                <SelectItem value="Category-based">Category-based</SelectItem>
                <SelectItem value="FSW">FSW (Skilled)</SelectItem>
              </SelectContent>
            </Select>
            <Link to="/calculator" className="w-full">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 px-8 font-bold rounded-xl h-12">
                Calculate Score
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Latest Cutoff"
            value={latestScore || "---"}
            icon={Trophy}
            description={latestDraw?.programType ? `${latestDraw.programType} Round` : "Round specific"}
            trend={latestScore > 0 && prevScore > 0 ? { value: Math.abs(crsDiff), isUp: isUpTrend } : undefined}
          />
          <StatCard
            title={`ITAs (${currentYear})`}
            value={totalItasYearToDate.toLocaleString()}
            icon={Users}
            description={`Filtered ${selectedProgram === 'all' ? 'Total' : selectedProgram}`}
          />
          <DrawPredictor prediction={prediction} />
          <StatCard
            title="Your Status"
            value={userScore !== null ? userScore : "---"}
            icon={userScore !== null ? UserCheck : Zap}
            description={userScore !== null ? "Your Saved Profile" : "No Profile Set"}
            trend={personalGap !== null ? { value: Math.abs(personalGap), isUp: isQualified } : undefined}
            link="/calculator"
            linkText={userScore !== null ? "Update Profile" : "Start Calculation"}
            className={cn(userScore === null && "border-dashed border-muted-foreground/30")}
          />
          <StatCard
            title="Most Recent"
            value={lastDate}
            icon={Calendar}
            description={selectedProgram === 'all' ? "Across all streams" : `${selectedProgram} specific`}
          />
        </div>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Deep Trend Analysis</h2>
                <Badge variant="outline" className="text-[10px] uppercase h-5 font-black border-red-200 text-red-600 bg-red-50 dark:bg-red-950/20">
                  <Info className="size-3 mr-1" /> Market Intelligence
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{marketSummary}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-xl border">
                <Filter className="size-3.5 text-muted-foreground" />
                <Select value={rangeLimit} onValueChange={setRangeLimit}>
                  <SelectTrigger className="h-8 w-[140px] border-none bg-transparent shadow-none font-bold text-xs focus:ring-0">
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Last 10 Draws</SelectItem>
                    <SelectItem value="20">Last 20 Draws</SelectItem>
                    <SelectItem value="50">Last 50 Draws</SelectItem>
                    <SelectItem value="all">Full History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ToggleGroup
                type="single"
                value={analyticsMode}
                onValueChange={(v) => v && setAnalyticsMode(v as 'crs' | 'itas')}
                className="bg-muted/50 p-1 rounded-xl border"
              >
                <ToggleGroupItem value="crs" className="rounded-lg px-4 gap-2 data-[state=on]:bg-white data-[state=on]:shadow-sm font-bold text-xs transition-all">
                  <LineChart className="size-3.5" /> CRS Score
                </ToggleGroupItem>
                <ToggleGroupItem value="itas" className="rounded-lg px-4 gap-2 data-[state=on]:bg-white data-[state=on]:shadow-sm font-bold text-xs transition-all">
                  <BarChart3 className="size-3.5" /> ITA Volume
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${analyticsMode}-${rangeLimit}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 grid-cols-1 lg:grid-cols-3"
            >
              <ScoreTrendChart
                data={rangedDraws}
                isLoading={isLoading && draws.length === 0}
                mode={analyticsMode}
              />
              <InvitationBarChart
                data={rangedDraws}
                isLoading={isLoading && draws.length === 0}
                mode={analyticsMode}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="rounded-2xl border bg-card shadow-lg p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Recent Activity: {selectedProgram === 'all' ? 'All' : selectedProgram}</h2>
              <p className="text-sm text-muted-foreground">Historical logs matching your current filter</p>
            </div>
            <Link to="/history" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto text-primary hover:text-primary border-primary/20 hover:bg-primary/5 font-bold group rounded-xl">
                View History <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredDraws.slice(0, 5).map((draw) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={draw.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-primary/[0.02] group transition-all duration-300"
                >
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
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredDraws.length === 0 && (
              <div className="py-12 text-center text-muted-foreground italic bg-muted/20 rounded-xl border border-dashed">
                No recent draws found for this specific program type.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}