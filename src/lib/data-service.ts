import { DrawEntry, ProgramType } from "@shared/types";
import { MOCK_DRAWS } from "@shared/mock-canada-data";
import { parse, format, isValid } from "date-fns";
import { api } from "./api-client";
const CACHE_KEY = "maple_metrics_draw_cache";
const CACHE_TTL = 300000; // Reduce to 5 minutes to favor freshness
interface IrccDraw {
  roundNumber: string;
  roundDate: string;
  roundType: string;
  roundName: string;
  roundInvitations: string;
  roundLowestScore: string;
}
interface IrccResponse {
  rounds: IrccDraw[];
}
function determineProgramType(name: string, type: string): ProgramType {
  const combined = (name + " " + type).toLowerCase();
  if (combined.includes("provincial nominee")) return "PNP";
  if (combined.includes("canadian experience")) return "CEC";
  if (combined.includes("federal skilled worker")) return "FSW";
  if (combined.includes("federal skilled trades")) return "FST";
  if (
    combined.includes("french") || 
    combined.includes("stem") || 
    combined.includes("healthcare") || 
    combined.includes("transport") || 
    combined.includes("agriculture") || 
    combined.includes("trade") ||
    combined.includes("category-based")
  ) {
    return "Category-based";
  }
  return "General";
}
export async function fetchLatestDraws(): Promise<DrawEntry[]> {
  try {
    // Attempt to fetch from internal proxy
    const json = await api<IrccResponse>('/api/ircc-data');
    if (!json.rounds || !Array.isArray(json.rounds)) {
      throw new Error("Invalid response structure from IRCC proxy");
    }
    const normalized: DrawEntry[] = json.rounds.map((r, idx) => {
      let dateIso = "";
      // Attempt multiple date formats if needed
      const formats = ["MMMM d, yyyy", "yyyy-MM-dd"];
      for (const fmt of formats) {
        const parsedDate = parse(r.roundDate, fmt, new Date());
        if (isValid(parsedDate)) {
          dateIso = format(parsedDate, "yyyy-MM-dd");
          break;
        }
      }
      if (!dateIso) {
        console.warn(`Unparseable date in round ${r.roundNumber}: ${r.roundDate}`);
        dateIso = new Date().toISOString().split('T')[0];
      }
      return {
        id: `ircc-${r.roundNumber || idx}`,
        drawNumber: parseInt(r.roundNumber) || 0,
        date: dateIso,
        programType: determineProgramType(r.roundName, r.roundType),
        itasIssued: parseInt(r.roundInvitations.replace(/,/g, "")) || 0,
        crsScore: parseInt(r.roundLowestScore) || 0,
        description: r.roundName !== r.roundType ? r.roundName : undefined
      };
    });
    // Cache locally briefly for session stability
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data: normalized
    }));
    return normalized;
  } catch (error) {
    console.error("IRCC Data Service Error:", error);
    // Fallback to cache if network fails
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data } = JSON.parse(cached);
      console.warn("Serving stale data from cache due to fetch failure");
      return data;
    }
    // Ultimate fallback
    return MOCK_DRAWS;
  }
}