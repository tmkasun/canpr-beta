import { DrawEntry, ProgramType } from "@shared/types";
import { MOCK_DRAWS } from "@shared/mock-canada-data";
import { parse, format, isValid, parseISO } from "date-fns";
import { api } from "./api-client";
const CACHE_KEY = "maple_metrics_draw_cache";
/**
 * Updated interface to match the actual IRCC Express Entry JSON schema
 * based on client feedback and sample structure.
 */
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
/**
 * Strips HTML tags from a string to ensure safe UI rendering.
 */
function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}
/**
 * Maps the verbose 'drawName' from IRCC to standardized ProgramType codes.
 */
function determineProgramType(name: string): ProgramType {
  const n = name.toLowerCase();
  if (n.includes("provincial nominee")) return "PNP";
  if (n.includes("canadian experience")) return "CEC";
  if (n.includes("federal skilled worker")) return "FSW";
  if (n.includes("federal skilled trades")) return "FST";
  if (
    n.includes("stem") ||
    n.includes("healthcare") ||
    n.includes("french") ||
    n.includes("transport") ||
    n.includes("trade") ||
    n.includes("agriculture") ||
    n.includes("category-based")
  ) {
    return "Category-based";
  }
  return "General";
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
        // Clean values
        const cleanName = stripHtml(r.drawName || "");
        const rawDate = r.drawDate.trim();
        // Attempt to parse date (Expected: yyyy-MM-dd)
        let dateIso = "";
        const parsedDate = parseISO(rawDate);
        if (isValid(parsedDate)) {
          dateIso = format(parsedDate, "yyyy-MM-dd");
        } else {
          // Fallback parsing for common IRCC formats if ISO fails
          const formats = ["MMMM d, yyyy", "MMM d, yyyy", "yyyy-MM-dd"];
          for (const fmt of formats) {
            const p = parse(rawDate, fmt, new Date());
            if (isValid(p)) {
              dateIso = format(p, "yyyy-MM-dd");
              break;
            }
          }
        }
        if (!dateIso) return acc;
        const entry: DrawEntry = {
          id: `ircc-${r.drawNumber.toString().replace(/,/g, "").trim() || idx}`,
          drawNumber: parseInt(r.drawNumber.toString().replace(/,/g, "")) || 0,
          date: dateIso,
          programType: determineProgramType(cleanName),
          itasIssued: parseInt(r.drawSize?.toString().replace(/,/g, "") || "0") || 0,
          crsScore: parseInt(r.drawCRS?.toString().replace(/,/g, "") || "0") || 0,
          description: cleanName
        };
        acc.push(entry);
      } catch (innerError) {
        console.warn("[DATA SERVICE] Skipping malformed record:", innerError);
      }
      return acc;
    }, []);
    // Ensure strictly descending chronological order
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
    console.error("[DATA SERVICE] Fetch failed:", error instanceof Error ? error.message : String(error));
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data && Array.isArray(parsed.data)) {
          return parsed.data;
        }
      }
    } catch {
      // Fallback silently
    }
    return MOCK_DRAWS.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }
}