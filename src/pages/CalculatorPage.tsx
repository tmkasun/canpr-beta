import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, Info, CheckCircle2, Save, Trash2, History, ArrowRight, Sparkles, Loader2, PenLine, Settings2, AlertTriangle, Target, Trophy } from 'lucide-react';
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
  const { latestDraw, isLoading: drawsLoading, draws } = useDrawData();
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualScore, setManualScore] = useState<string>("500");
  const [age, setAge] = useState<string>("25");
  const [edu, setEdu] = useState<string>("master");
  const [lang, setLang] = useState<string>("high");
  const [exp, setExp] = useState<string>("3");
  const [label, setLabel] = useState<string>("My Current Goal");
  const latestCutoff = latestDraw?.crsScore ?? 500;
  const cecCutoff = draws.find(d => d.programType === 'CEC')?.crsScore ?? 500;
  const pnpCutoff = draws.find(d => d.programType === 'PNP')?.crsScore ?? 700;
  const { data: profilesData, isLoading: profilesLoading } = useQuery({
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
      toast.success("Profile Benchmark Saved", { description: "Your current score has been added to history." });
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
  const score = useMemo(() => {
    if (isManualMode) return parseInt(manualScore) || 0;
    let total = 0;
    const ageVal = parseInt(age) || 0;
    if (ageVal >= 20 && ageVal <= 29) total += 110;
    else if (ageVal >= 30) total += Math.max(0, 110 - (ageVal - 29) * 5);
    if (edu === "phd") total += 150;
    else if (edu === "master") total += 135;
    else if (edu === "bachelor") total += 120;
    else if (edu === "college") total += 98;
    if (lang === "high") total += 136;
    else if (lang === "mid") total += 100;
    else total += 60;
    if (exp === "3") total += 50;
    else if (exp === "2") total += 38;
    else if (exp === "1") total += 25;
    return total;
  }, [age, edu, lang, exp, isManualMode, manualScore]);
  const qualifies = score >= latestCutoff;
  const gap = latestCutoff - score;
  const handleSave = () => {
    const newProfile: CRSProfile = {
      id: crypto.randomUUID(),
      label: label.trim() || (isManualMode ? "Manual Entry" : "Wizard Result"),
      score,
      age: isManualMode ? "N/A" : age,
      education: isManualMode ? "Manual" : edu,
      language: isManualMode ? "Manual" : lang,
      experience: isManualMode ? "Manual" : exp,
      date: new Date().toISOString()
    };
    saveMutation.mutate(newProfile);
  };
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">CRS Estimator</h1>
            <p className="text-muted-foreground">Comprehensive Ranking System analysis based on the latest IRCC trends and categories.</p>
          </div>
          <div className="flex p-1 bg-muted rounded-xl">
             <Button
               variant={!isManualMode ? "secondary" : "ghost"}
               size="sm"
               className="rounded-lg font-black text-[10px] uppercase tracking-widest px-4"
               onClick={() => setIsManualMode(false)}
             >
               <Settings2 className="mr-2 h-3.5 w-3.5" /> Wizard
             </Button>
             <Button
               variant={isManualMode ? "secondary" : "ghost"}
               size="sm"
               className="rounded-lg font-black text-[10px] uppercase tracking-widest px-4"
               onClick={() => setIsManualMode(true)}
             >
               <PenLine className="mr-2 h-3.5 w-3.5" /> Manual
             </Button>
          </div>
        </div>
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-soft border-none overflow-hidden bg-card">
              <CardHeader className="bg-muted/10 pb-6 border-b border-dashed">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-red-600" />
                  {isManualMode ? "Instant Benchmarking" : "Profile Simulation"}
                </CardTitle>
                <CardDescription>
                  Calculate your score and save it to track improvements over time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="label" className="text-[10px] font-black uppercase tracking-widest opacity-60">Profile Label</Label>
                    <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Master's Goal" className="h-11 rounded-xl" />
                  </div>
                  {isManualMode ? (
                    <div className="space-y-3">
                      <Label htmlFor="manualScore" className="text-[10px] font-black uppercase tracking-widest opacity-60">Manual Points</Label>
                      <Input
                        id="manualScore"
                        type="number"
                        value={manualScore}
                        onChange={(e) => setManualScore(e.target.value)}
                        className="font-black text-xl text-red-600 h-11 rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label htmlFor="age" className="text-[10px] font-black uppercase tracking-widest opacity-60">Current Age</Label>
                      <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                  )}
                </div>
                {!isManualMode && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Education Level</Label>
                        <Select value={edu} onValueChange={setEdu}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phd">Doctorate (PhD)</SelectItem>
                            <SelectItem value="master">Master's Degree</SelectItem>
                            <SelectItem value="bachelor">Bachelor's Degree (3+ yrs)</SelectItem>
                            <SelectItem value="college">College Diploma (2 yrs)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Language Mastery</Label>
                        <Select value={lang} onValueChange={setLang}>
                          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">CLB 9+ (Expert)</SelectItem>
                            <SelectItem value="mid">CLB 7 - 8 (Fluent)</SelectItem>
                            <SelectItem value="low">Below CLB 7 (Basic)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Experience in Canada</Label>
                      <Select value={exp} onValueChange={setExp}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3+ Years (Max points)</SelectItem>
                          <SelectItem value="2">2 Years</SelectItem>
                          <SelectItem value="1">1 Year</SelectItem>
                          <SelectItem value="0">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs h-12 shadow-xl shadow-red-600/20 rounded-xl"
                >
                  {saveMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Benchmark Profile
                </Button>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-none overflow-hidden h-[380px] flex flex-col bg-card">
              <CardHeader className="bg-muted/20 border-b border-dashed">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <History className="size-4 text-red-600" /> Tracked Profiles
                </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1">
                {savedProfiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center p-8 space-y-4">
                    <div className="size-16 rounded-3xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                      <Target className="size-8 text-red-600 opacity-40" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-sm uppercase tracking-wider">No Saved Goals</h4>
                      <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                        Save your calculated scores to benchmark them against live IRCC data.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setLabel("Primary Goal")} className="font-bold rounded-xl h-9">
                      <Sparkles className="size-3.5 mr-2" /> Create First Profile
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-dashed">
                    {savedProfiles.map((p) => (
                      <div key={p.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => setLabel(p.label)}>
                        <div className="space-y-1">
                          <div className="font-black text-sm uppercase tracking-tighter">{p.label}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-2 font-medium">
                            <Clock className="size-3" /> {format(parseISO(p.date), "MMM d, yyyy")}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Points</div>
                              <div className="text-xl font-black text-red-600 tabular-nums">{p.score}</div>
                           </div>
                           <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-rose-600 rounded-lg" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(p.id); }}>
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
                "min-h-[450px] text-white shadow-2xl border-none relative overflow-hidden flex flex-col rounded-3xl transition-colors duration-700",
                qualifies ? "bg-emerald-600 shadow-emerald-600/30" : "bg-red-600 shadow-red-600/30"
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
                    <div className="text-xs font-black uppercase tracking-widest text-white/60">Estimated Entry Score</div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                        <span>Latest General</span>
                        <span className="font-black text-lg">{latestCutoff}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                        <span>CEC Specific</span>
                        <span className="font-black text-lg">{cecCutoff}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest border-t border-white/10 pt-4">
                        <span>Your Gap</span>
                        <span className={cn("font-black text-lg", qualifies ? "text-emerald-200" : "text-red-200")}>
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
                        <div className="text-xs font-bold opacity-80 leading-snug">Below general cutoff. Check STEM/French categories.</div>
                      </div>
                    )}
                    <Link to="/history">
                      <Button variant="secondary" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs group">
                        Review Historical Data <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
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