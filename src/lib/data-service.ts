import { DrawEntry, ProgramType } from "@shared/types";
import { MOCK_DRAWS } from "@shared/mock-canada-data";
import { parse, format, isValid, parseISO } from "date-fns";
import { api } from "./api-client";
const CACHE_KEY = "maple_metrics_draw_cache";
interface IrccDraw {
  drawNumber: string | number;
  drawDate: string;
  drawName: string;
  drawSize: string | number;
  drawCRS: string | number;
  drawDateFull?: string;
}
interface IrccResponse {
  rounds: IrccDraw[];
}
function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}
function determineProgramType(name: string): ProgramType {
  const n = name.toLowerCase();
  if (n.includes("provincial nominee") || n.includes("pnp")) return "PNP";
  if (n.includes("canadian experience") || n.includes("cec")) return "CEC";
  if (n.includes("federal skilled worker") || n.includes("fsw")) return "FSW";
  if (n.includes("federal skilled trades") || n.includes("fst")) return "FST";
  const categoryKeywords = ["stem", "healthcare", "french", "transport", "trade", "agriculture", "category-based"];
  if (categoryKeywords.some(kw => n.includes(kw))) {
    return "Category-based";
  }
  return "General";
}
function safeParseInt(val: string | number | undefined, fallback = 0): number {
  if (val === undefined || val === null) return fallback;
  const str = val.toString().replace(/[^0-9]/g, "").trim();
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? fallback : parsed;
}
export async function fetchLatestDraws(): Promise<DrawEntry[]> {
  try {
    const json = await api<IrccResponse>('/api/ircc-data');
    if (!json.rounds || !Array.isArray(json.rounds)) {
      throw new Error("Invalid IRCC payload structure");
    }
    const normalized: DrawEntry[] = json.rounds.reduce((acc: DrawEntry[], r, idx) => {
      try {
        if (!r.drawNumber || !r.drawDate) return acc;
        const cleanName = stripHtml(r.drawName || "");
        const rawDate = r.drawDate.trim();
        let dateIso = "";
        const parsedIso = parseISO(rawDate);
        if (isValid(parsedIso)) {
          dateIso = format(parsedIso, "yyyy-MM-dd");
        } else {
          const formats = ["MMMM d, yyyy", "MMM d, yyyy", "yyyy-MM-dd", "dd/MM/yyyy"];
          for (const fmt of formats) {
            try {
              const p = parse(rawDate, fmt, new Date());
              if (isValid(p)) {
                dateIso = format(p, "yyyy-MM-dd");
                break;
              }
            } catch { continue; }
          }
        }
        if (!dateIso) return acc;
        const entry: DrawEntry = {
          id: `ircc-${safeParseInt(r.drawNumber) || idx}`,
          drawNumber: safeParseInt(r.drawNumber),
          date: dateIso,
          programType: determineProgramType(cleanName),
          itasIssued: safeParseInt(r.drawSize),
          crsScore: safeParseInt(r.drawCRS),
          description: cleanName
        };
        acc.push(entry);
      } catch (innerError) {
        console.warn("[DATA SERVICE] Skipping malformed record:", innerError);
      }
      return acc;
    }, []);
    const sorted = normalized.sort((a, b) =>
      parseISO(b.date).getTime() - parseISO(a.date).getTime()
    );
    if (sorted.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: sorted
      }));
    }
    return sorted;
  } catch (error) {
    console.error("[DATA SERVICE] Fetch failed, attempting cache fallback.");
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data && Array.isArray(parsed.data)) return parsed.data;
      }
    } catch { /* Ignore */ }
    return MOCK_DRAWS.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }
}