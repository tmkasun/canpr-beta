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
import { Search, Filter, Download, FileX, ArrowUpDown, X, RefreshCw, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ProgramType, DrawEntry } from '@shared/types';
import { toast } from 'sonner';
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
      toast.success("Data Refreshed", {
        description: `Successfully synchronized ${data.length} records from IRCC.`
      });
    }
  };
  const handleSort = (key: keyof DrawEntry) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  };
  const handleExport = () => {
    toast.success("Export Initialized", {
      description: `Preparing CSV for ${filteredDraws.length} entries.`
    });
  };
  const getProgramBadge = (type: ProgramType) => {
    const config: Record<ProgramType, { label: string; class: string }> = {
      'PNP': { label: 'PNP', class: "bg-blue-100 text-blue-800 border-blue-200" },
      'CEC': { label: 'CEC', class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
      'Category-based': { label: 'Category', class: "bg-purple-100 text-purple-800 border-purple-200" },
      'General': { label: 'General', class: "bg-red-100 text-red-800 border-red-200" },
      'FSW': { label: 'FSW', class: "bg-orange-100 text-orange-800 border-orange-200" },
      'FST': { label: 'FST', class: "bg-amber-100 text-amber-800 border-amber-200" }
    };
    const c = config[type] || config['General'];
    return <Badge className={c.class}>{c.label}</Badge>;
  };
  return (
    <AppLayout container>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Historical Data</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last synced: {dataUpdatedAt ? format(new Date(dataUpdatedAt), "MMM d, HH:mm:ss") : "Pending..."}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh} 
              disabled={isFetching}
              className={cn(isFetching && "opacity-50")}
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </Button>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by draw number..."
              className="pl-9 pr-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Program" />
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
        </div>
        <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px] cursor-pointer" onClick={() => handleSort('drawNumber')}>
                  <div className="flex items-center gap-1">Draw # <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead>Program Type</TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('itasIssued')}>
                  <div className="flex items-center justify-end gap-1">ITAs <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead className="text-right cursor-pointer" onClick={() => handleSort('crsScore')}>
                  <div className="flex items-center justify-end gap-1">Cutoff <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && draws.length === 0 ? (
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
                    <TableCell className="text-muted-foreground">{format(parseISO(draw.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">{getProgramBadge(draw.programType)}</div>
                        {draw.description && <span className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">{draw.description}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{draw.itasIssued.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-muted text-foreground">{draw.crsScore}</span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center p-8">
                      <FileX className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="font-semibold text-lg">No draws found</h3>
                      <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters.</p>
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