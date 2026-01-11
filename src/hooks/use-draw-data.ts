import { useQuery } from "@tanstack/react-query";
import { fetchLatestDraws } from "@/lib/data-service";
import { DrawEntry } from "@shared/types";
import { parseISO, isAfter, startOfYear } from "date-fns";
export function useDrawData() {
  const query = useQuery({
    queryKey: ["draws"],
    queryFn: fetchLatestDraws,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
  const draws = query.data ?? [];
  const latestDraw = draws[0] ?? null;
  const previousDraw = draws[1] ?? null;
  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date());
  const totalItasYearToDate = draws
    .filter(d => isAfter(parseISO(d.date), yearStart))
    .reduce((acc, d) => acc + d.itasIssued, 0);
  return {
    ...query,
    draws,
    latestDraw,
    previousDraw,
    totalItasYearToDate,
    currentYear
  };
}