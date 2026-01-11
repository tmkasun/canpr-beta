import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, Info, CheckCircle2, Save, Trash2, History, ArrowRight, Sparkles, Loader2, Lightbulb, AlertTriangle } from 'lucide-react';
import { useDrawData } from '@/hooks/use-draw-data';
import { api } from '@/lib/api-client';
import { CRSProfile } from '@shared/types';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
export function CalculatorPage() {
  const { latestDraw, isLoading: drawsLoading } = useDrawData();
  const [age, setAge] = useState<string>("25");
  const [edu, setEdu] = useState<string>("master");
  const [lang, setLang] = useState<string>("high");
  const [exp, setExp] = useState<string>("3");
  const [label, setLabel] = useState<string>("Current Profile");
  const [isSaving, setIsSaving] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<CRSProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const latestCutoff = latestDraw?.crsScore ?? 500;
  const score = useMemo(() => {
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
  }, [age, edu, lang, exp]);
  const qualifies = score >= latestCutoff;
  const gap = latestCutoff - score;
  useEffect(() => {
    fetchProfiles();
  }, []);
  const fetchProfiles = async () => {
    try {
      const res = await api<{ items: CRSProfile[] }>('/api/profiles');
      setSavedProfiles((res.items || []).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newProfile: CRSProfile = {
        id: crypto.randomUUID(),
        label: label.trim() || "My Estimate",
        score,
        age,
        education: edu,
        language: lang,
        experience: exp,
        date: new Date().toISOString()
      };
      await api('/api/profiles', { method: 'POST', body: JSON.stringify(newProfile) });
      toast.success("Estimate saved successfully");
      fetchProfiles();
    } catch (e) {
      toast.error("Failed to save estimate");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      await api(`/api/profiles/${id}`, { method: 'DELETE' });
      setSavedProfiles(prev => prev.filter(p => p.id !== id));
      toast.success("Estimate removed");
    } catch (e) {
      toast.error("Failed to delete");
    }
  };
  const loadProfile = (p: CRSProfile) => {
    setAge(p.age);
    setEdu(p.education);
    setLang(p.language);
    setExp(p.experience);
    setLabel(p.label);
    toast.info(`Loaded profile: ${p.label}`);
  };
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">CRS Score Calculator</h1>
          <p className="text-muted-foreground">Detailed Comprehensive Ranking System simulation based on latest IRCC trends.</p>
        </div>
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-soft border-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Calculator className="h-5 w-5 text-red-600" />
                  Profile Configuration
                </CardTitle>
                <CardDescription>Simulate your entry criteria to see how you rank</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="label" className="text-xs font-bold uppercase tracking-wider opacity-70">Label</Label>
                    <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Optimistic Goal" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-xs font-bold uppercase tracking-wider opacity-70">Current Age</Label>
                    <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} min="18" max="100" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="edu" className="text-xs font-bold uppercase tracking-wider opacity-70">Highest Degree</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="size-3 cursor-help text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Degrees must be accompanied by an Educational Credential Assessment (ECA) for non-Canadian credentials.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select value={edu} onValueChange={setEdu}>
                      <SelectTrigger id="edu"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phd">Doctorate (PhD)</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="bachelor">Bachelor's Degree (3+ yrs)</SelectItem>
                        <SelectItem value="college">College Diploma (2 yrs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lang" className="text-xs font-bold uppercase tracking-wider opacity-70">Language Proficiency</Label>
                    <Select value={lang} onValueChange={setLang}>
                      <SelectTrigger id="lang"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">CLB 9+ (Expert)</SelectItem>
                        <SelectItem value="mid">CLB 7 - 8 (Fluent)</SelectItem>
                        <SelectItem value="low">Below CLB 7 (Basic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="exp" className="text-xs font-bold uppercase tracking-wider opacity-70">Canadian Experience</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3 cursor-help text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Full-time work experience in Canada in a TEER 0, 1, 2, or 3 occupation.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={exp} onValueChange={setExp}>
                    <SelectTrigger id="exp"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3+ Years</SelectItem>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="0">Less than 1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 h-11"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? "Saving..." : "Save Calculation"}
                </Button>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-none overflow-hidden flex flex-col h-[400px]">
              <CardHeader className="bg-muted/30 pb-3">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                  <History className="h-4 w-4 text-red-600" />
                  Saved Profiles
                </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1">
                <div className="divide-y">
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="p-4 space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    ))
                  ) : savedProfiles.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground text-sm italic">
                      No saved profiles yet.
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {savedProfiles.map((p) => (
                        <motion.div
                          key={p.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group cursor-pointer"
                          onClick={() => loadProfile(p)}
                        >
                          <div className="flex-1">
                            <div className="font-bold text-sm text-foreground">{p.label}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {format(parseISO(p.date), "MMM d, yyyy · HH:mm")}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-black text-red-600 tabular-nums">{p.score}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                              className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
          <div className="space-y-6">
            <motion.div
              animate={qualifies ? { y: [0, -4, 0] } : {}}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Card className={cn(
                "text-white shadow-xl border-none overflow-hidden relative min-h-[350px] transition-colors duration-500",
                qualifies ? "bg-emerald-600 shadow-emerald-600/20" : "bg-red-600 shadow-red-600/20"
              )}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Sparkles className="size-32" />
                </div>
                <CardHeader>
                  <CardTitle className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">Live Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-1">
                    <div className="text-7xl font-black tabular-nums">{score}</div>
                    <div className="text-xs font-bold text-white/70">Estimated CRS Points</div>
                  </div>
                  <div className="space-y-3 pt-6 border-t border-white/20">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="opacity-80">Latest IRCC Cutoff:</span>
                      <span className="font-black text-lg">
                        {drawsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : latestCutoff}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="opacity-80">Current Gap:</span>
                      <span className={cn("font-black text-lg", qualifies ? "text-emerald-200" : "text-red-200")}>
                        {drawsLoading ? "..." : (gap > 0 ? `-${gap}` : `+${Math.abs(gap)}`)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {qualifies ? (
                      <div className="flex items-center gap-3 bg-white/20 p-4 rounded-xl text-xs font-bold backdrop-blur-sm border border-white/10">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        Qualified! You are above the latest general cutoff.
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-black/10 p-4 rounded-xl text-xs font-bold border border-white/5">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        Below cutoff. Check Category-based history for lower thresholds.
                      </div>
                    )}
                    <Link to="/history" className="block">
                      <Button variant="secondary" className="w-full text-foreground font-black hover:bg-white transition-all group h-12">
                        Benchmark Trends
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <Card className="border-none shadow-soft bg-red-50 dark:bg-red-950/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Lightbulb className="size-4 text-red-600" />
                  Target Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {gap > 0 ? (
                    <>
                      Improving your <strong>Language CLB</strong> from Mid to High could add up to <strong>36 points</strong>, 
                      closing your {gap} point gap completely.
                    </>
                  ) : (
                    <>
                      Your profile is competitive. Consider obtaining a <strong>Provincial Nomination</strong> to add a 
                      guaranteed <strong>600 points</strong> and secure an ITA in the next round.
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}