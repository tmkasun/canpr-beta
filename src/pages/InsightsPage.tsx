import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Clock, User, ArrowRight } from 'lucide-react';
const INSIGHTS = [
  {
    id: 1,
    title: "Why CEC Draws are Returning in 2024",
    excerpt: "After a long hiatus, IRCC has resumed program-specific draws for Canadian Experience Class candidates. Here is what it means for you.",
    category: "News",
    date: "June 2, 2024",
    author: "Maple Team",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "STEM Category Prediction: Fall 2024",
    excerpt: "Data patterns suggest a large-scale STEM occupation draw in early October. We analyze the score fluctuations for tech professionals.",
    category: "Prediction",
    date: "May 28, 2024",
    author: "Data Analyst",
    image: "https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Mastering the French Proficiency Bonus",
    excerpt: "Learn how a B2 level in French can add up to 50 points to your CRS score and unlock dedicated category-based invitations.",
    category: "Guide",
    date: "May 15, 2024",
    author: "Immigration Consultant",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    title: "Provincial Nominee Programs vs Express Entry",
    excerpt: "A comprehensive comparison between direct Express Entry and the PNP route for candidates with scores below 500.",
    category: "Guide",
    date: "May 10, 2024",
    author: "Legal Expert",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800"
  }
];
export function InsightsPage() {
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Insights & Analysis</h1>
          <p className="text-muted-foreground">Expert commentary, data predictions, and guides for your PR journey.</p>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {INSIGHTS.map((item) => (
            <Card key={item.id} className="group overflow-hidden border-none shadow-soft transition-all hover:shadow-md hover:-translate-y-1">
              <AspectRatio ratio={16 / 9} className="overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={
                    item.category === 'News' ? 'bg-blue-600' : 
                    item.category === 'Prediction' ? 'bg-purple-600' : 'bg-emerald-600'
                  }>
                    {item.category}
                  </Badge>
                </div>
              </AspectRatio>
              <CardHeader>
                <CardTitle className="text-xl group-hover:text-red-600 transition-colors">
                  {item.title}
                </CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {item.author}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.excerpt}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" className="p-0 h-auto text-red-600 hover:text-red-700 hover:bg-transparent font-semibold group/btn">
                  Read Article <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}