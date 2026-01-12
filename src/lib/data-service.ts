import { DrawEntry, ProgramType } from "@shared/types";
import { MOCK_DRAWS } from "@shared/mock-canada-data";
import { parse, format, isValid, parseISO } from "date-fns";
const CACHE_KEY = "maple_metrics_draw_cache";
const PROXY_URL = "https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json";
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
    const response = await fetch(PROXY_URL);
    if (!response.ok) {
      throw new Error(`Proxy status: ${response.status}`);
    }
    const json = (await response.json()) as IrccResponse;
    if (!json || !json.rounds || !Array.isArray(json.rounds)) {
      throw new Error("Invalid structure from IRCC proxy");
    }
    const normalized: DrawEntry[] = json.rounds.reduce((acc: DrawEntry[], r, idx) => {
      try {
        if (!r.drawDate && !r.drawName) return acc;
        const cleanName = stripHtml(r.drawName || "Express Entry Round");
        const drawNum = safeParseInt(r.drawNumber, idx + 1000);
        const rawDate = r.drawDate?.trim() || "";
        if (!rawDate) return acc;
        // Clean invisible characters
        const sanitizedDate = rawDate
          .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/\s+(EST|EDT|UTC|PST|PDT|GMT).*$/, "");
        let dateIso = "";
        const parsedIso = parseISO(sanitizedDate);
        if (isValid(parsedIso)) {
          dateIso = format(parsedIso, "yyyy-MM-dd");
        } else {
          const formats = ["MMMM d, yyyy", "MMM d, yyyy", "yyyy-MM-dd", "dd/MM/yyyy", "d MMMM yyyy"];
          for (const fmt of formats) {
            try {
              const p = parse(sanitizedDate, fmt, new Date());
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
          id: `ircc-${drawNum}-${idx}`,
          drawNumber: drawNum,
          date: dateIso,
          programType: determineProgramType(cleanName),
          itasIssued: safeParseInt(r.drawSize),
          crsScore: crsValue,
          description: cleanName
        };
        acc.push(entry);
      } catch (innerError) {
        console.warn("[DATA SERVICE] Skip malformed record:", innerError);
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
    console.warn("[DATA SERVICE] Remote fetch failed, using cache:", error);
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed?.data)) return parsed.data;
      } catch { /* ignored */ }
    }
    return [...MOCK_DRAWS].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }
}