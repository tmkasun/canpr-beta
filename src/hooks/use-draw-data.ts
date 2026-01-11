import { useQuery } from "@tanstack/react-query";
import { fetchLatestDraws } from "@/lib/data-service";
import { DrawEntry } from "@shared/types";
import { parseISO, isAfter, startOfYear } from "date-fns";
export function useDrawData() {
  const query = useQuery({
    queryKey: ["draws"],
    queryFn: fetchLatestDraws,
    staleTime: 0, // Always consider data stale
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const draws = query.data ?? [];
  const latestDraw = draws[0] ?? null;
  const previousDraw = draws[1] ?? null;
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date());
  const totalItasYearToDate = draws
    .filter(d => {
      try {
        return isAfter(parseISO(d.date), yearStart);
      } catch {
        return false;
      }
    })
    .reduce((acc, d) => acc + d.itasIssued, 0);
  return {
    ...query,
    draws,
    latestDraw,
    previousDraw,
    totalItasYearToDate,
    currentYear,
    isInitialLoading: query.isLoading && !query.isFetching, // Specifically for the very first load
  };
}