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
  const rawDraws = query.data ?? [];
  // Guarantee chronological descending order for all consumers with stable reference
  const draws = useMemo(() => {
    return [...rawDraws].sort((a, b) => {
      const timeA = parseISO(a.date).getTime();
      const timeB = parseISO(b.date).getTime();
      return timeB - timeA;
    });
  }, [rawDraws]);
  const latestDraw = useMemo(() => draws[0] ?? null, [draws]);
  const previousDraw = useMemo(() => draws[1] ?? null, [draws]);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const totalItasYearToDate = useMemo(() => {
    const yearStart = startOfYear(new Date());
    return draws
      .filter(d => {
        try {
          const dDate = parseISO(d.date);
          return isValid(dDate) && isAfter(dDate, yearStart);
        } catch {
          return false;
        }
      })
      .reduce((acc, d) => acc + d.itasIssued, 0);
  }, [draws]);
  return {
    ...query,
    draws,
    latestDraw,
    previousDraw,
    totalItasYearToDate,
    currentYear,
    isInitialLoading: query.isLoading && !query.isFetching,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}