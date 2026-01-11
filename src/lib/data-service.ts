import { DrawEntry, ProgramType } from "@shared/types";
import { MOCK_DRAWS } from "@shared/mock-canada-data";
import { parse, format, isValid } from "date-fns";
const IRCC_JSON_URL = "https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json";
const CACHE_KEY = "maple_metrics_draw_cache";
const CACHE_TTL = 3600000; // 1 hour
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
  if (combined.includes("french") || combined.includes("stem") || combined.includes("healthcare") || combined.includes("transport") || combined.includes("agriculture") || combined.includes("trade")) {
    return "Category-based";
  }
  return "General";
}
export async function fetchLatestDraws(): Promise<DrawEntry[]> {
  try {
    // Check Cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }
    const response = await fetch(IRCC_JSON_URL);
    if (!response.ok) throw new Error("Failed to fetch IRCC data");
    const json = (await response.json()) as IrccResponse;
    if (!json.rounds || !Array.isArray(json.rounds)) {
      throw new Error("Invalid IRCC JSON format");
    }
    const normalized: DrawEntry[] = json.rounds.map((r, idx) => {
      // IRCC dates are often "May 31, 2024"
      let dateIso = new Date().toISOString();
      const parsedDate = parse(r.roundDate, "MMMM d, yyyy", new Date());
      if (isValid(parsedDate)) {
        dateIso = format(parsedDate, "yyyy-MM-dd");
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
    // Cache results
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data: normalized
    }));
    return normalized;
  } catch (error) {
    console.error("IRCC Fetch Error, falling back to mocks:", error);
    return MOCK_DRAWS;
  }
}