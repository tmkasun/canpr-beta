import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MOCK_DRAWS } from '@shared/mock-canada-data';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ProgramType } from '@shared/types';
export function HistoryPage() {
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const filteredDraws = useMemo(() => {
    return MOCK_DRAWS.filter((draw) => {
      const matchesSearch = draw.drawNumber.toString().includes(search) || 
                           (draw.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesProgram = programFilter === "all" || draw.programType === programFilter;
      return matchesSearch && matchesProgram;
    });
  }, [search, programFilter]);
  const getProgramBadge = (type: ProgramType) => {
    switch (type) {
      case 'PNP': return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">PNP</Badge>;
      case 'CEC': return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">CEC</Badge>;
      case 'General': return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">General</Badge>;
      default: return <Badge variant="secondary">{type}</Badge>;
    }
  };
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Historical Data</h1>
          <p className="text-muted-foreground">Complete archive of Canada Express Entry invitations and cutoff scores.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by draw number or description..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Program Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="CEC">CEC Only</SelectItem>
                <SelectItem value="PNP">PNP Only</SelectItem>
                <SelectItem value="Category-based">Category-based</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Draw #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Program Type</TableHead>
                <TableHead className="text-right">ITAs Issued</TableHead>
                <TableHead className="text-right">CRS Cutoff</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDraws.length > 0 ? (
                filteredDraws.map((draw) => (
                  <TableRow key={draw.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-bold text-red-600">#{draw.drawNumber}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(parseISO(draw.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getProgramBadge(draw.programType)}
                        {draw.description && (
                          <span className="text-[10px] text-muted-foreground italic">
                            {draw.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {draw.itasIssued.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-muted">
                        {draw.crsScore}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No results found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}