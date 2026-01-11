import { DrawEntry, ProgramType } from "@shared/types";
import { MOCK_DRAWS } from "@shared/mock-canada-data";
import { parse, format, isValid } from "date-fns";
import { api } from "./api-client";
const CACHE_KEY = "maple_metrics_draw_cache";
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
  // Specific Category checks
  if (combined.includes("trade occupations")) return "Category-based";
  if (combined.includes("agriculture")) return "Category-based";
  if (combined.includes("transport")) return "Category-based";
  if (combined.includes("stem")) return "Category-based";
  if (combined.includes("healthcare")) return "Category-based";
  if (combined.includes("french")) return "Category-based";
  // Base Programs
  if (combined.includes("provincial nominee")) return "PNP";
  if (combined.includes("canadian experience")) return "CEC";
  if (combined.includes("federal skilled worker")) return "FSW";
  if (combined.includes("federal skilled trades")) return "FST";
  return "General";
}
export async function fetchLatestDraws(): Promise<DrawEntry[]> {
  try {
    const json = await api<IrccResponse>('/api/ircc-data');
    if (!json.rounds || !Array.isArray(json.rounds)) {
      throw new Error("Malformed IRCC response: 'rounds' missing or invalid");
    }
    const normalized: DrawEntry[] = json.rounds.reduce((acc: DrawEntry[], r, idx) => {
      try {
        if (!r.roundNumber || !r.roundDate) return acc;
        let dateIso = "";
        const formats = ["MMMM d, yyyy", "yyyy-MM-dd", "MMM d, yyyy"];
        for (const fmt of formats) {
          const parsedDate = parse(r.roundDate, fmt, new Date());
          if (isValid(parsedDate)) {
            dateIso = format(parsedDate, "yyyy-MM-dd");
            break;
          }
        }
        if (!dateIso) {
          console.warn(`[DATA SERVICE] Unparseable date format in draw ${r.roundNumber}: ${r.roundDate}`);
          dateIso = new Date().toISOString().split('T')[0];
        }
        const entry: DrawEntry = {
          id: `ircc-${r.roundNumber.toString().trim() || idx}`,
          drawNumber: parseInt(r.roundNumber.toString().replace(/,/g, "")) || 0,
          date: dateIso,
          programType: determineProgramType(r.roundName || "", r.roundType || ""),
          itasIssued: parseInt(r.roundInvitations?.toString().replace(/,/g, "") || "0") || 0,
          crsScore: parseInt(r.roundLowestScore?.toString().replace(/,/g, "") || "0") || 0,
          description: (r.roundName && r.roundName !== r.roundType) ? r.roundName : undefined
        };
        acc.push(entry);
      } catch (innerError) {
        console.error(`[DATA SERVICE] Failed to normalize individual record at index ${idx}:`, JSON.stringify(r));
      }
      return acc;
    }, []);
    if (normalized.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: normalized
      }));
    }
    return normalized;
  } catch (error) {
    console.error("[DATA SERVICE] Critical IRCC Fetch Error:", error instanceof Error ? error.message : JSON.stringify(error));
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data && Array.isArray(parsed.data)) {
          console.warn("[DATA SERVICE] Serving stale data from local storage fallback");
          return parsed.data;
        }
      }
    } catch (parseError) {
      console.error("[DATA SERVICE] Failed to parse local cache:", parseError);
    }
    return MOCK_DRAWS;
  }
}