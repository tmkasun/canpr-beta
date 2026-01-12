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
  // Guarantee chronological descending order for all consumers
  const draws = [...rawDraws].sort((a, b) => {
    const timeA = parseISO(a.date).getTime();
    const timeB = parseISO(b.date).getTime();
    return timeB - timeA;
  });
  const latestDraw = draws[0] ?? null;
  const previousDraw = draws[1] ?? null;
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date());
  const totalItasYearToDate = draws
    .filter(d => {
      try {
        const dDate = parseISO(d.date);
        return isValid(dDate) && isAfter(dDate, yearStart);
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
    isInitialLoading: query.isLoading && !query.isFetching,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}