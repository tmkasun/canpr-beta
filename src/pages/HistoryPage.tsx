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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, Filter, Download, FileX, ArrowUpDown, X, RefreshCw, Clock, Info } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ProgramType, DrawEntry } from '@shared/types';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
type SortConfig = {
  key: keyof DrawEntry;
  direction: 'asc' | 'desc';
} | null;
export function HistoryPage() {
  const { draws, isLoading, isFetching, refetch, dataUpdatedAt } = useDrawData();
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const filteredDraws = useMemo(() => {
    let result = draws.filter((draw) => {
      const searchStr = search.toLowerCase();
      const matchesSearch = 
        String(draw.drawNumber).includes(searchStr) ||
        (draw.description?.toLowerCase().includes(searchStr) ?? false) ||
        draw.programType.toLowerCase().includes(searchStr);
      const matchesProgram = programFilter === "all" || draw.programType === programFilter;
      return matchesSearch && matchesProgram;
    });
    if (sort) {
      result.sort((a, b) => {
        const aValue = a[sort.key];
        const bValue = b[sort.key];
        if (aValue === undefined || bValue === undefined) return 0;
        if (sort.key === 'date') {
          return sort.direction === 'asc'
            ? parseISO(a.date).getTime() - parseISO(b.date).getTime()
            : parseISO(b.date).getTime() - parseISO(a.date).getTime();
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }
    return result;
  }, [draws, search, programFilter, sort]);
  const handleRefresh = async () => {
    const { data } = await refetch();
    if (data) {
      toast.success("Sync Complete", {
        description: `Successfully updated ${data.length} records from IRCC.`
      });
    }
  };
  const handleClearFilters = () => {
    setSearch("");
    setProgramFilter("all");
    setSort({ key: 'date', direction: 'desc' });
  };
  const handleSort = (key: keyof DrawEntry) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  };
  const getProgramBadge = (type: ProgramType) => {
    const config: Record<ProgramType, { label: string; class: string }> = {
      'PNP': { label: 'PNP', class: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400" },
      'CEC': { label: 'CEC', class: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" },
      'Category-based': { label: 'Category', class: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400" },
      'General': { label: 'General', class: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400" },
      'FSW': { label: 'FSW', class: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400" },
      'FST': { label: 'FST', class: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400" }
    };
    const c = config[type] || config['General'];
    return <Badge variant="outline" className={cn("font-bold h-5 text-[10px]", c.class)}>{c.label}</Badge>;
  };
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Historical Data</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>IRCC Gateway: {dataUpdatedAt ? format(new Date(dataUpdatedAt), "MMM d, HH:mm") : "Syncing..."}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isFetching} className="rounded-xl">
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </Button>
            <Button variant="outline" onClick={() => toast.info("Export is preparing...")} className="gap-2 rounded-xl">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search draw # or description..."
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
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rounds</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="CEC">CEC (Exp. Class)</SelectItem>
                <SelectItem value="PNP">PNP (Provincial)</SelectItem>
                <SelectItem value="Category-based">Category-based</SelectItem>
                <SelectItem value="FSW">FSW (Skilled Worker)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <TooltipProvider>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('drawNumber')}>
                      <div className="flex items-center gap-1 uppercase text-[10px] font-bold">Draw # <ArrowUpDown className="h-3 w-3" /></div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                      <div className="flex items-center gap-1 uppercase text-[10px] font-bold">Date <ArrowUpDown className="h-3 w-3" /></div>
                    </TableHead>
                    <TableHead className="uppercase text-[10px] font-bold">Round Details</TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('itasIssued')}>
                      <div className="flex items-center justify-end gap-1 uppercase text-[10px] font-bold">Invitations <ArrowUpDown className="h-3 w-3" /></div>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('crsScore')}>
                      <div className="flex items-center justify-end gap-1 uppercase text-[10px] font-bold">Score <ArrowUpDown className="h-3 w-3" /></div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && draws.length === 0 ? (
                    Array(10).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredDraws.length > 0 ? (
                    filteredDraws.map((draw) => (
                      <TableRow key={draw.id} className="hover:bg-muted/20 transition-colors group">
                        <TableCell className="font-bold text-red-600">#{draw.drawNumber}</TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">
                          {isValid(parseISO(draw.date)) ? format(parseISO(draw.date), "MMM d, yyyy") : draw.date}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 max-w-[250px]">
                            <div className="flex items-center gap-2">
                              {getProgramBadge(draw.programType)}
                              {draw.description && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs max-w-xs">{draw.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground truncate italic font-medium">
                              {draw.description || "General admission round"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold tabular-nums">{draw.itasIssued.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-black bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors tabular-nums border border-transparent group-hover:border-primary/20">
                            {draw.crsScore}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FileX className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                          <h3 className="font-bold text-lg">No Results Found</h3>
                          <p className="text-sm text-muted-foreground mb-6">Adjust your search or filter criteria to see older records.</p>
                          <Button onClick={handleClearFilters} variant="secondary" className="rounded-xl">Reset All Filters</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </AppLayout>
  );
}