import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, Info, CheckCircle2, Save, Trash2, History } from 'lucide-react';
import { MOCK_DRAWS } from '@shared/mock-canada-data';
import { api } from '@/lib/api-client';
import { CRSProfile } from '@shared/types';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
export function CalculatorPage() {
  const [age, setAge] = useState<string>("25");
  const [edu, setEdu] = useState<string>("master");
  const [lang, setLang] = useState<string>("high");
  const [exp, setExp] = useState<string>("3");
  const [label, setLabel] = useState<string>("My Estimate");
  const [isSaving, setIsSaving] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<CRSProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const latestCutoff = MOCK_DRAWS[0].crsScore;
  const score = useMemo(() => {
    let total = 0;
    const ageVal = parseInt(age);
    if (ageVal >= 20 && ageVal <= 29) total += 110;
    else if (ageVal >= 30) total += Math.max(0, 110 - (ageVal - 29) * 5);
    if (edu === "phd") total += 150;
    else if (edu === "master") total += 135;
    else if (edu === "bachelor") total += 120;
    if (lang === "high") total += 136;
    else if (lang === "mid") total += 100;
    else total += 60;
    if (exp === "3") total += 50;
    else if (exp === "2") total += 38;
    else total += 25;
    return total;
  }, [age, edu, lang, exp]);
  useEffect(() => {
    fetchProfiles();
  }, []);
  const fetchProfiles = async () => {
    try {
      const res = await api<{ items: CRSProfile[] }>('/api/profiles');
      setSavedProfiles(res.items.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
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
        label,
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
    toast.info(`Loaded: ${p.label}`);
  };
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">CRS Score Calculator</h1>
          <p className="text-muted-foreground">Estimate your Comprehensive Ranking System score and save it for tracking.</p>
        </div>
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-soft border-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-red-600" />
                  Personal Factors
                </CardTitle>
                <CardDescription>Input your profile details to calculate the score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Profile Label</Label>
                    <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Target Score" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edu">Highest Education</Label>
                    <Select value={edu} onValueChange={setEdu}>
                      <SelectTrigger id="edu"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phd">Doctorate (PhD)</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="college">College Diploma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lang">Language Proficiency (CLB)</Label>
                    <Select value={lang} onValueChange={setLang}>
                      <SelectTrigger id="lang"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">CLB 9 or Higher</SelectItem>
                        <SelectItem value="mid">CLB 7 - 8</SelectItem>
                        <SelectItem value="low">Below CLB 7</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp">Canadian Work Experience</Label>
                  <Select value={exp} onValueChange={setExp}>
                    <SelectTrigger id="exp"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3+ Years</SelectItem>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="0">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save this Estimate"}
                </Button>
              </CardContent>
            </Card>
            <Card className="shadow-soft border-none overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <History className="h-4 w-4 text-red-600" />
                  Saved Estimations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="p-4 space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    ))
                  ) : savedProfiles.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm italic">
                      No saved profiles yet. Save your first estimation above.
                    </div>
                  ) : (
                    <AnimatePresence>
                      {savedProfiles.map((p) => (
                        <motion.div 
                          key={p.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                        >
                          <div className="cursor-pointer flex-1" onClick={() => loadProfile(p)}>
                            <div className="font-semibold text-sm">{p.label}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {format(parseISO(p.date), "MMM d, yyyy · HH:mm")}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-xs font-bold text-red-600">{p.score} pts</div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(p.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <motion.div
              animate={score >= latestCutoff ? { scale: [1, 1.02, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Card className="bg-red-600 text-white shadow-primary border-none overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Calculator className="h-24 w-24" />
                </div>
                <CardHeader>
                  <CardTitle className="text-white/90 text-sm font-medium uppercase tracking-wider">Estimated Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-6xl font-black">{score}</div>
                  <div className="space-y-2 pt-4 border-t border-white/20">
                    <div className="flex justify-between items-center text-sm">
                      <span>Latest Cutoff:</span>
                      <span className="font-bold">{latestCutoff}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Target Gap:</span>
                      <span className="font-bold">{latestCutoff - score > 0 ? `-${latestCutoff - score}` : `+${Math.abs(latestCutoff - score)}`}</span>
                    </div>
                  </div>
                  {score >= latestCutoff ? (
                    <div className="flex items-center gap-2 bg-white/20 p-3 rounded-lg text-xs font-medium">
                      <CheckCircle2 className="h-4 w-4" />
                      Qualifies for the latest draw!
                    </div>
                  ) : (
                    <Button variant="secondary" className="w-full text-red-600 font-bold hover:bg-white/90">
                      Improve Score
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}