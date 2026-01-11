import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useDrawData } from '@/hooks/use-draw-data';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Download, FileX, ArrowUpDown, X, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ProgramType, DrawEntry } from '@shared/types';
import { toast } from 'sonner';
type SortConfig = {
  key: keyof DrawEntry;
  direction: 'asc' | 'desc';
} | null;
export function HistoryPage() {
  const { draws, isLoading, refetch, isRefetching } = useDrawData();
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const filteredDraws = useMemo(() => {
    let result = draws.filter((draw) => {
      const matchesSearch = draw.drawNumber.toString().includes(search) ||
                           (draw.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesProgram = programFilter === "all" || draw.programType === programFilter;
      return matchesSearch && matchesProgram;
    });
    if (sort) {
      result.sort((a, b) => {
        const aValue = a[sort.key];
        const bValue = b[sort.key];
        if (aValue === undefined || bValue === undefined) return 0;
        if (sort.key === 'date') {
          const aTime = parseISO(a.date).getTime();
          const bTime = parseISO(b.date).getTime();
          return sort.direction === 'asc' ? aTime - bTime : bTime - aTime;
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }
    return result;
  }, [draws, search, programFilter, sort]);
  const handleSort = (key: keyof DrawEntry) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  };
  const handleExport = () => {
    toast.success("Preparing Live Dataset Export...", {
      description: `Including all ${filteredDraws.length} filtered draws.`
    });
  };
  const clearFilters = () => {
    setSearch("");
    setProgramFilter("all");
  };
  const getProgramBadge = (type: ProgramType) => {
    let label: string = type;
    let description: string = type;
    switch (type) {
      case 'PNP': label = 'PNP'; description = 'Provincial Nominee Program'; break;
      case 'CEC': label = 'CEC'; description = 'Canadian Experience Class'; break;
      case 'General': label = 'General'; description = 'All Express Entry Programs'; break;
      case 'FSW': label = 'FSW'; description = 'Federal Skilled Worker'; break;
      case 'FST': label = 'FST'; description = 'Federal Skilled Trades'; break;
      case 'Category-based': label = 'Category'; description = 'Occupation-specific or targeted category draw'; break;
    }
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={
              type === 'PNP' ? "bg-blue-100 text-blue-800 border-blue-200" :
              type === 'CEC' ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
              type === 'Category-based' ? "bg-purple-100 text-purple-800 border-purple-200" :
              "bg-red-100 text-red-800 border-red-200"
            }>
              {label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent><p>{description}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Historical Data</h1>
            <p className="text-muted-foreground">Complete archive of Canada Express Entry invitations and cutoff scores.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={isRefetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            </Button>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by draw number or description..."
              className="pl-9 pr-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
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
                <SelectItem value="FSW">FSW Only</SelectItem>
                <SelectItem value="FST">FST Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(search || programFilter !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-red-600">
              Clear All
            </Button>
          )}
        </div>
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead
                  className="w-[120px] cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort('drawNumber')}
                >
                  <div className="flex items-center gap-1">
                    Draw # <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Date <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Program Type</TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort('itasIssued')}
                >
                  <div className="flex items-center justify-end gap-1">
                    ITAs Issued <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => handleSort('crsScore')}
                >
                  <div className="flex items-center justify-end gap-1">
                    CRS Cutoff <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-12 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredDraws.length > 0 ? (
                filteredDraws.map((draw) => (
                  <TableRow key={draw.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-bold text-red-600">#{draw.drawNumber}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(parseISO(draw.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {getProgramBadge(draw.programType)}
                        </div>
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
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-muted text-foreground">
                        {draw.crsScore}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64">
                    <div className="flex flex-col items-center justify-center text-center p-8">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <FileX className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">No results found</h3>
                      <p className="text-sm text-muted-foreground max-w-[300px] mt-1">
                        We couldn't find any draws matching your current filters. Try adjusting your search or program type.
                      </p>
                      <Button
                        variant="link"
                        onClick={clearFilters}
                        className="mt-4 text-red-600"
                      >
                        Clear all filters
                      </Button>
                    </div>
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