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
  const cleanStr = val.toString().replace(/,/g, "").replace(/[^0-9.]/g, "").trim();
  const parsed = parseInt(cleanStr, 10);
  return isNaN(parsed) ? fallback : parsed;
}
export async function fetchLatestDraws(): Promise<DrawEntry[]> {
  try {
    const json = await api<IrccResponse>('/api/ircc-data');
    if (!json || !json.rounds || !Array.isArray(json.rounds)) {
      throw new Error("Invalid IRCC payload structure: Missing 'rounds' array");
    }
    const normalized: DrawEntry[] = json.rounds.reduce((acc: DrawEntry[], r, idx) => {
      try {
        // Safe check for required fields: at least date or name should exist
        if (!r.drawDate && !r.drawName) return acc;
        const cleanName = stripHtml(r.drawName || "Express Entry Round");
        const drawNum = safeParseInt(r.drawNumber, idx + 1000); // Fallback for missing draw number
        // Robust date cleaning: remove non-breaking spaces, zero-width chars, and timezone offsets
        const rawDate = r.drawDate
          .trim()
          .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/\s+(EST|EDT|UTC|PST|PDT|GMT).*$/, "");
        let dateIso = "";
        const parsedIso = parseISO(rawDate);
        if (isValid(parsedIso)) {
          dateIso = format(parsedIso, "yyyy-MM-dd");
        } else {
          // Fallback parsing for common IRCC text formats
          const formats = ["MMMM d, yyyy", "MMM d, yyyy", "yyyy-MM-dd", "dd/MM/yyyy", "d MMMM yyyy"];
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
        const crsValue = safeParseInt(r.drawCRS);
        // Minimum sanity check for CRS scores
        if (crsValue < 0 || crsValue > 1200) return acc;
        const entry: DrawEntry = {
          id: `ircc-${drawNum}-idx-${idx}`,
          drawNumber: drawNum,
          date: dateIso,
          programType: determineProgramType(cleanName),
          itasIssued: safeParseInt(r.drawSize),
          crsScore: crsValue,
          description: cleanName
        };
        acc.push(entry);
      } catch (innerError) {
        console.warn("[DATA SERVICE] Parse error for record:", innerError);
      }
      return acc;
    }, []);
    const sorted = [...normalized].sort((a, b) => 
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
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[DATA SERVICE] Live fetch failed: ${errorMsg}. Attempting cache restoration.`);
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.data && Array.isArray(parsed.data)) {
          const ageMinutes = Math.round((Date.now() - (parsed.timestamp || 0)) / 60000);
          console.info(`[DATA SERVICE] Cache hit successful. Restored ${parsed.data.length} records. Data age: ${ageMinutes}m.`);
          return parsed.data;
        }
      } catch { /* ignored */ }
    }
    console.warn("[DATA SERVICE] Critical failure: No live data and no valid cache. Falling back to local mock storage.");
    return [...MOCK_DRAWS].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }
}