import { DrawEntry, ProgramType } from "@shared/types";
import { MOCK_DRAWS } from "@shared/mock-canada-data";
import { parse, format, isValid, parseISO } from "date-fns";
const CACHE_KEY = "maple_metrics_draw_cache";
const IRCC_JSON_URL = "https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json";
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
    // Direct fetch to IRCC. Note: This might be blocked by CORS in the browser, 
    // in which case the catch block handles fallback to local storage or mock data.
    const response = await fetch(IRCC_JSON_URL, {
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MapleMetrics/1.0 (Web; Direct Ingestion)'
      }
    });
    if (!response.ok) {
      throw new Error(`IRCC Direct Fetch Error: ${response.status} ${response.statusText}`);
    }
    const json = (await response.json()) as IrccResponse;
    if (!json || !json.rounds || !Array.isArray(json.rounds)) {
      throw new Error("Invalid IRCC payload structure: Missing 'rounds' array");
    }
    const normalized: DrawEntry[] = json.rounds.reduce((acc: DrawEntry[], r, idx) => {
      try {
        if (!r.drawDate && !r.drawName) return acc;
        const cleanName = stripHtml(r.drawName || "Express Entry Round");
        const drawNum = safeParseInt(r.drawNumber, idx + 1000);
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
    console.warn(`[DATA SERVICE] Direct fetch failed (Likely CORS or Network): ${errorMsg}. Attempting cache restoration.`);
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.data && Array.isArray(parsed.data)) {
          return parsed.data;
        }
      } catch { /* ignored */ }
    }
    console.warn("[DATA SERVICE] Critical failure: Using local mock data.");
    return [...MOCK_DRAWS].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }
}