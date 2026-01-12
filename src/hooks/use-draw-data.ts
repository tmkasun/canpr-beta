import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestDraws } from "@/lib/data-service";
import { parseISO, isAfter, startOfYear, isValid } from "date-fns";
export function useDrawData() {
  const query = useQuery({
    queryKey: ["draws"],
    queryFn: fetchLatestDraws,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  // Guarantee chronological descending order for all consumers with stable reference
  const draws = useMemo(() => {
    const rawDraws = query.data ?? [];
    return [...rawDraws].sort((a, b) => {
      const timeA = parseISO(a.date).getTime();
      const timeB = parseISO(b.date).getTime();
      return timeB - timeA;
    });
  }, [query.data]);
  const latestDraw = useMemo(() => draws[0] ?? null, [draws]);
  const previousDraw = useMemo(() => draws[1] ?? null, [draws]);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const yearStart = useMemo(() => startOfYear(new Date(currentYear, 0, 1)), [currentYear]);
  const averageCrsAllTime = useMemo(() => {
    if (draws.length === 0) return 0;
    const sum = draws.reduce((acc, d) => acc + (Number(d.crsScore) || 0), 0);
    return Math.round(sum / draws.length);
  }, [draws]);
  const totalItasYearToDate = useMemo(() => {
    return draws
      .filter(d => {
        try {
          const dDate = parseISO(d.date);
          return isValid(dDate) && isAfter(dDate, yearStart);
        } catch {
          return false;
        }
      })
      .reduce((acc, d) => acc + (Number(d.itasIssued) || 0), 0);
  }, [draws, yearStart]);
  return {
    ...query,
    draws,
    latestDraw,
    previousDraw,
    totalItasYearToDate,
    currentYear,
    yearStart,
    averageCrsAllTime,
    isInitialLoading: query.isLoading && !query.isFetching,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}