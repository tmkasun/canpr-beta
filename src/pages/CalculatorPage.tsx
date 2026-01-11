import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calculator, Info, CheckCircle2 } from 'lucide-react';
import { MOCK_DRAWS } from '@shared/mock-canada-data';
export function CalculatorPage() {
  const [age, setAge] = useState<string>("25");
  const [edu, setEdu] = useState<string>("master");
  const [lang, setLang] = useState<string>("high");
  const [exp, setExp] = useState<string>("3");
  const latestCutoff = MOCK_DRAWS[0].crsScore;
  const score = useMemo(() => {
    let total = 0;
    // Age simplified IRCC logic
    const ageVal = parseInt(age);
    if (ageVal >= 20 && ageVal <= 29) total += 110;
    else if (ageVal >= 30) total += Math.max(0, 110 - (ageVal - 29) * 5);
    // Education
    if (edu === "phd") total += 150;
    else if (edu === "master") total += 135;
    else if (edu === "bachelor") total += 120;
    // Languages
    if (lang === "high") total += 136;
    else if (lang === "mid") total += 100;
    else total += 60;
    // Experience
    if (exp === "3") total += 50;
    else if (exp === "2") total += 38;
    else total += 25;
    return total;
  }, [age, edu, lang, exp]);
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">CRS Score Calculator</h1>
          <p className="text-muted-foreground">Estimate your Comprehensive Ranking System score for Express Entry.</p>
        </div>
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-soft border-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-red-600" />
                  Personal Factors
                </CardTitle>
                <CardDescription>Basic profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edu">Highest Education</Label>
                    <Select value={edu} onValueChange={setEdu}>
                      <SelectTrigger id="edu">
                        <SelectValue placeholder="Select Education" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phd">Doctorate (PhD)</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="college">College Diploma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lang">Language Proficiency (CLB)</Label>
                    <Select value={lang} onValueChange={setLang}>
                      <SelectTrigger id="lang">
                        <SelectValue placeholder="Select Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">CLB 9 or Higher</SelectItem>
                        <SelectItem value="mid">CLB 7 - 8</SelectItem>
                        <SelectItem value="low">Below CLB 7</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exp">Canadian Work Experience</Label>
                    <Select value={exp} onValueChange={setExp}>
                      <SelectTrigger id="exp">
                        <SelectValue placeholder="Select Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3+ Years</SelectItem>
                        <SelectItem value="2">2 Years</SelectItem>
                        <SelectItem value="1">1 Year</SelectItem>
                        <SelectItem value="0">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="p-6 rounded-xl bg-muted/30 border border-dashed text-sm text-muted-foreground">
              Note: This calculator is for estimation purposes only. Your actual CRS score will be determined by IRCC during the application process.
            </div>
          </div>
          <div className="space-y-6">
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
                  <div className="flex items-center gap-2 bg-white/20 p-3 rounded-lg text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                    You are currently above the latest cutoff score!
                  </div>
                ) : (
                  <Button variant="secondary" className="w-full text-red-600 font-bold hover:bg-white/90">
                    How to improve?
                  </Button>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-soft border-none">
              <CardHeader>
                <CardTitle className="text-sm">Points Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm py-2 border-b">
                  <span className="text-muted-foreground">Core Human Capital</span>
                  <span className="font-medium">{score} / 600</span>
                </div>
                <div className="flex justify-between items-center text-sm py-2 border-b">
                  <span className="text-muted-foreground">Skill Transferability</span>
                  <span className="font-medium">0 / 100</span>
                </div>
                <div className="flex justify-between items-center text-sm py-2">
                  <span className="text-muted-foreground">Additional Points</span>
                  <span className="font-medium">0 / 600</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}