import React, { useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Trophy, 
  Activity, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ScoreTrendChart } from '@/components/dashboard/ScoreTrendChart';
import { InvitationBarChart } from '@/components/dashboard/InvitationBarChart';
import { MOCK_DRAWS } from '@shared/mock-canada-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
export function HomePage() {
  const latestDraw = useMemo(() => MOCK_DRAWS[0], []);
  const stats = useMemo(() => {
    const totalItas = MOCK_DRAWS
      .filter(d => d.date.startsWith('2024'))
      .reduce((acc, d) => acc + d.itasIssued, 0);
    const prevCrs = MOCK_DRAWS[1]?.crsScore ?? 0;
    const crsDiff = latestDraw.crsScore - prevCrs;
    return {
      latestScore: latestDraw.crsScore,
      totalItas,
      lastDate: format(parseISO(latestDraw.date), "MMM d, yyyy"),
      program: latestDraw.programType,
      crsTrend: {
        value: Math.abs(crsDiff),
        isUp: crsDiff < 0 // In CRS context, "down" is usually good (easier to get PR)
      }
    };
  }, [latestDraw]);
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive insights into Canada Express Entry draws</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/calculator">
              <Button className="bg-red-600 hover:bg-red-700 text-white shadow-primary">
                Run Score Simulator
              </Button>
            </Link>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Latest Cutoff Score"
            value={stats.latestScore}
            icon={Trophy}
            description={`Program: ${stats.program}`}
          />
          <StatCard 
            title="Total ITAs (2024)"
            value={stats.totalItas.toLocaleString()}
            icon={Users}
            description="Invitations issued YTD"
            trend={{ value: 12, isUp: true }}
          />
          <StatCard 
            title="Last Draw Date"
            value={stats.lastDate}
            icon={Calendar}
            description="Official IRCC update"
          />
          <StatCard 
            title="System Health"
            value="Active"
            icon={Activity}
            description="Processing times stable"
          />
        </div>
        {/* Charts Row */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <ScoreTrendChart data={MOCK_DRAWS} />
          <InvitationBarChart data={MOCK_DRAWS} />
        </div>
        {/* Recent Draws List Summary */}
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link to="/history">
              <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                View All History <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {MOCK_DRAWS.slice(0, 5).map((draw) => (
              <div key={draw.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50 border border-transparent hover:border-border">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border shadow-sm text-xs font-bold text-red-600">
                    #{draw.drawNumber}
                  </div>
                  <div>
                    <div className="font-semibold">{draw.programType} Draw</div>
                    <div className="text-xs text-muted-foreground">{format(parseISO(draw.date), "MMMM d, yyyy")}</div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">ITAs</div>
                    <div className="font-bold">{draw.itasIssued.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Score</div>
                    <Badge variant="secondary" className="font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      {draw.crsScore}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}