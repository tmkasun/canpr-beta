import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calculator, Save, Trash2, History, ArrowRight, Sparkles, Loader2, Target, Trophy, Clock, AlertTriangle } from 'lucide-react';
import { useDrawData } from '@/hooks/use-draw-data';
import { api } from '@/lib/api-client';
import { CRSProfile } from '@shared/types';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
export function CalculatorPage() {
  const queryClient = useQueryClient();
  const { latestDraw, draws } = useDrawData();
  const [manualScore, setManualScore] = useState<string>("500");
  const [label, setLabel] = useState<string>("My Target Profile");
  const latestCutoff = latestDraw?.crsScore ?? 500;
  const cecCutoff = draws.find(d => d.programType === 'CEC')?.crsScore ?? 500;
  const { data: profilesData } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => api<{ items: CRSProfile[] }>('/api/profiles'),
  });
  const savedProfiles = useMemo(() => {
    return (profilesData?.items || []).sort((a, b) =>
      parseISO(b.date).getTime() - parseISO(a.date).getTime()
    );
  }, [profilesData]);
  const saveMutation = useMutation({
    mutationFn: (newProfile: CRSProfile) => api('/api/profiles', { method: 'POST', body: JSON.stringify(newProfile) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success("Benchmark Saved", { description: "Your manual score has been persisted." });
    },
    onError: () => toast.error("Storage Error", { description: "Failed to persist your profile estimate." }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/profiles/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.info("Profile Removed");
    },
  });
  const score = parseInt(manualScore) || 0;
  const qualifies = score >= latestCutoff;
  const gap = latestCutoff - score;
  const handleSave = () => {
    if (score <= 0 || score > 1200) {
      toast.error("Invalid Score", { description: "CRS scores must be between 1 and 1200." });
      return;
    }
    const newProfile: CRSProfile = {
      id: crypto.randomUUID(),
      label: label.trim() || "Manual Entry",
      score,
      date: new Date().toISOString()
    };
    saveMutation.mutate(newProfile);
  };
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">CRS Estimator</h1>
          <p className="text-muted-foreground">Benchmark your manual score against the latest IRCC trends and categories.</p>
        </div>
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-soft border-none overflow-hidden bg-card">
              <CardHeader className="bg-muted/10 pb-6 border-b border-dashed">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Direct Benchmarking
                </CardTitle>
                <CardDescription>
                  Enter your estimated score to see where you stand in the current pool.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="label" className="text-[10px] font-black uppercase tracking-widest opacity-60">Profile Label</Label>
                    <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Master's Goal" className="h-12 rounded-xl border-muted bg-muted/20" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="manualScore" className="text-[10px] font-black uppercase tracking-widest opacity-60">Your Estimated Score</Label>
                    <Input
                      id="manualScore"
                      type="number"
                      value={manualScore}
                      onChange={(e) => setManualScore(e.target.value)}
                      className="font-black text-xl text-primary h-12 rounded-xl border-muted bg-muted/20"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs h-12 shadow-xl shadow-primary/20 rounded-xl"
                >
                  {saveMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Benchmark Profile
                </Button>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-none overflow-hidden h-[400px] flex flex-col bg-card">
              <CardHeader className="bg-muted/20 border-b border-dashed">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <History className="size-4 text-primary" /> Tracking History
                </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1">
                {savedProfiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 space-y-4">
                    <div className="size-16 rounded-3xl bg-primary/5 flex items-center justify-center">
                      <Target className="size-8 text-primary opacity-40" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-sm uppercase tracking-wider">No Benchmarks Found</h4>
                      <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                        Save your estimated scores to compare them against live data.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-dashed">
                    {savedProfiles.map((p) => (
                      <div key={p.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                        <div className="space-y-1">
                          <div className="font-black text-sm uppercase tracking-tighter">{p.label}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-2 font-medium">
                            <Clock className="size-3" /> {format(parseISO(p.date), "MMM d, yyyy")}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Points</div>
                              <div className="text-xl font-black text-primary tabular-nums">{p.score}</div>
                           </div>
                           <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive rounded-lg" onClick={() => deleteMutation.mutate(p.id)}>
                             <Trash2 className="size-4" />
                           </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>
          <div className="space-y-6">
            <motion.div animate={qualifies ? { scale: [1, 1.02, 1] } : {}} transition={{ repeat: Infinity, duration: 4 }}>
              <Card className={cn(
                "min-h-[480px] text-white shadow-2xl border-none relative overflow-hidden flex flex-col rounded-3xl transition-colors duration-700",
                qualifies ? "bg-emerald-600 shadow-emerald-600/30" : "bg-primary shadow-primary/30"
              )}>
                <div className="absolute -right-10 -top-10 opacity-10">
                   <Sparkles className="size-48" />
                </div>
                <CardHeader>
                  <CardTitle className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em]">Market Verdict</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <motion.div key={score} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-[120px] font-black leading-none tracking-tighter tabular-nums drop-shadow-lg">
                      {score}
                    </motion.div>
                    <div className="text-xs font-black uppercase tracking-widest text-white/60">Benchmarked Points</div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                        <span>Latest Cutoff</span>
                        <span className="font-black text-lg">{latestCutoff}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                        <span>CEC Specific</span>
                        <span className="font-black text-lg">{cecCutoff}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-t border-white/10 pt-4">
                        <span>Your Gap</span>
                        <span className={cn("font-black text-lg", qualifies ? "text-emerald-200" : "text-rose-200")}>
                          {gap > 0 ? `-${gap}` : `+${Math.abs(gap)}`}
                        </span>
                      </div>
                    </div>
                    {qualifies ? (
                      <div className="flex items-center gap-4 bg-white p-5 rounded-2xl text-emerald-800 shadow-lg">
                        <Trophy className="size-8 shrink-0 text-emerald-600" />
                        <div className="text-xs font-black uppercase leading-tight">Qualified for Selection!</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 bg-black/10 border border-white/5 p-5 rounded-2xl">
                        <AlertTriangle className="size-8 shrink-0 text-white/40" />
                        <div className="text-xs font-bold opacity-80 leading-snug">Below cutoff. Use Category analysis for better targets.</div>
                      </div>
                    )}
                    <Link to="/history" className="block w-full">
                      <Button variant="secondary" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs group">
                        Historical Context <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}