import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, ArrowRight, BookOpen, Share2, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
const INSIGHTS = [
  {
    id: 1,
    title: "Why CEC Draws are Returning in 2024",
    excerpt: "After a long hiatus, IRCC has resumed program-specific draws for Canadian Experience Class candidates. Here is what it means for you.",
    content: "The resumption of Canadian Experience Class (CEC) draws marks a significant shift in Canada's immigration strategy for 2024. Following a series of all-program draws that kept CRS scores elevated, the dedicated CEC rounds are designed to target candidates already integrated into the Canadian workforce. \n\nExperts suggest that this move aims to manage the volume of temporary residents and transition them into permanent residency. For candidates with Canadian work experience, this provides a more predictable path, as CEC-specific cutoffs are typically lower than general admission rounds. We expect to see regular CEC draws throughout the summer and autumn, potentially stabilizing scores in the low 500s.",
    category: "News",
    date: "June 2, 2024",
    author: "Maple Team",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "STEM Category Prediction: Fall 2024",
    excerpt: "Data patterns suggest a large-scale STEM occupation draw in early October. We analyze the score fluctuations for tech professionals.",
    content: "Our data modeling engine has identified a recurring pattern in Category-based invitations for STEM (Science, Technology, Engineering, and Mathematics) occupations. Analyzing the last 18 months, IRCC tends to conduct large STEM rounds following quarterly labor market reviews.\n\nFor tech professionals in the Express Entry pool, the predicted cutoff for a Fall STEM round is likely to fall between 485 and 495. This is significantly lower than general draws, making it a prime opportunity for software engineers, data scientists, and mathematicians. Improving your language scores now could be the deciding factor for an ITA in October.",
    category: "Prediction",
    date: "May 28, 2024",
    author: "Data Analyst",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Mastering the French Proficiency Bonus",
    excerpt: "Learn how a B2 level in French can add up to 50 points to your CRS score and unlock dedicated category-based invitations.",
    content: "French language proficiency remains the most powerful 'bonus' in the current Express Entry system. Not only does it grant up to 50 additional points for bilingualism, but it also qualifies candidates for the French Language Proficiency category-based draws.\n\nThese draws have consistently seen the lowest cutoffs in the history of the system, sometimes dropping into the high 300s. Achieving a CLB 7 or higher in Niveaux de compétence linguistique canadiens (NCLC) is arguably the single best investment a candidate can make in 2024, regardless of their work experience or age.",
    category: "Guide",
    date: "May 15, 2024",
    author: "Immigration Consultant",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    title: "Provincial Nominee Programs vs Express Entry",
    excerpt: "A comprehensive comparison between direct Express Entry and the PNP route for candidates with scores below 500.",
    content: "When CRS scores remain stubbornly above 520, the Provincial Nominee Program (PNP) becomes the primary bridge to residency. A provincial nomination effectively guarantees an Invitation to Apply by adding 600 points to your profile.\n\nHowever, PNPs come with their own complexities, including longer processing times and residency obligations. This guide breaks down the most active streams for 2024, including Ontario's Human Capital Priorities stream and British Columbia's Skills Immigration. For those with scores in the 450-480 range, a PNP strategy is no longer optional—it is essential.",
    category: "Guide",
    date: "May 10, 2024",
    author: "Legal Expert",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800"
  }
];
export function InsightsPage() {
  const [email, setEmail] = useState("");
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Subscribed!", { description: "You'll receive weekly draw alerts." });
      setEmail("");
    }
  };
  return (
    <AppLayout container>
      <div className="space-y-12 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Intelligence & Analysis</h1>
          <p className="text-muted-foreground">Expert commentary, data predictions, and strategic guides for your PR journey.</p>
        </div>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
          {INSIGHTS.map((item) => (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <Card className="group overflow-hidden border-none shadow-soft transition-all hover:shadow-md cursor-pointer flex flex-col h-full bg-card">
                  <AspectRatio ratio={16 / 9} className="overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute top-4 left-4">
                      <Badge className={cn(
                        "font-black uppercase tracking-widest text-[10px] h-6 border-none shadow-sm px-3",
                        item.category === 'News' ? 'bg-blue-600' :
                        item.category === 'Prediction' ? 'bg-purple-600' : 'bg-emerald-600'
                      )}>
                        {item.category}
                      </Badge>
                    </div>
                  </AspectRatio>
                  <CardHeader className="flex-1">
                    <CardTitle className="text-xl group-hover:text-red-600 transition-colors leading-snug">
                      {item.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {item.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> {item.author}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 italic">
                      {item.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 pb-6">
                    <Button variant="ghost" className="p-0 h-auto text-red-600 hover:text-red-700 hover:bg-transparent font-black uppercase tracking-tighter text-xs group/btn">
                      Read Analysis <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden border-none rounded-2xl">
                <ScrollArea className="max-h-[90vh]">
                  <div className="relative">
                    <AspectRatio ratio={21 / 9}>
                      <img src={item.image} className="object-cover w-full h-full" alt={item.title} />
                      <div className="absolute inset-0 bg-black/40" />
                    </AspectRatio>
                    <div className="absolute bottom-6 left-8 right-8">
                       <Badge className="mb-3">{item.category}</Badge>
                       <h2 className="text-2xl font-black text-white leading-tight">{item.title}</h2>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between py-4 border-y border-dashed">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center font-bold text-red-600">
                          {item.author.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold">{item.author}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.date} • {item.readTime}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Button variant="outline" size="icon" className="rounded-full h-8 w-8"><Share2 className="size-4" /></Button>
                         <Button variant="outline" size="icon" className="rounded-full h-8 w-8"><BookOpen className="size-4" /></Button>
                      </div>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </div>
                    <div className="bg-muted/30 p-6 rounded-2xl border border-dashed text-center space-y-3">
                       <h4 className="font-bold text-sm">Was this analysis helpful?</h4>
                       <div className="flex items-center justify-center gap-3">
                          <Button variant="outline" className="rounded-xl h-9 px-6 font-bold text-xs">Yes, very</Button>
                          <Button variant="outline" className="rounded-xl h-9 px-6 font-bold text-xs">Needs more data</Button>
                       </div>
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          ))}
        </div>
        <section className="bg-red-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl shadow-red-600/20">
          <div className="absolute -right-20 -top-20 size-80 bg-white/10 rounded-full blur-3xl" />
          <div className="relative max-w-xl space-y-6">
            <h2 className="text-3xl font-black leading-tight">Stay ahead of the next IRCC draw.</h2>
            <p className="text-red-100 font-medium opacity-80">
              Get weekly score predictions, market analysis, and category-based alerts delivered to your inbox. Join 12,000+ candidates.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <Input 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address" 
                className="bg-white/10 border-white/20 text-white placeholder:text-red-100/50 h-12 rounded-xl focus-visible:ring-white" 
              />
              <Button type="submit" size="lg" variant="secondary" className="font-black rounded-xl h-12 px-8 shrink-0">
                <Mail className="mr-2 size-4" /> Subscribe
              </Button>
            </form>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}