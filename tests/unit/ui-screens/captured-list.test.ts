// F6.2: lista da tela Capturados (abas + busca PT/EN, orfaos fora) e formato da data.
import { describe, expect, it } from "vitest";
import type { SpeciesSummary } from "../../../src/data/types";
import { capturedList, formatCaptureDate } from "../../../src/screens/Captured/CapturedScreen";

const sp = (dex: number, pt: string, en: string) => ({ dex, name: { pt, en }, searchKey: `${pt.toLowerCase()}|${en.toLowerCase()}` }) as unknown as SpeciesSummary;
const index = [sp(4, "Charmander", "Charmander"), sp(6, "Charizard", "Charizard"), sp(25, "Pikachu", "Pikachu"), sp(195, "Pântano", "Quagsire")];

describe("captured list", () => {
  const entries = { "25": { capturedAt: 300 }, "4": { capturedAt: 100 }, "6": { capturedAt: 200 }, "9999": { capturedAt: 999 } };

  it("all caught: most recent first, orphans hidden", () => {
    expect(capturedList(index, entries, "all", "").map((s) => s.dex)).toEqual([25, 6, 4]);
  });

  it("search combines with the tab (AND), by number or PT/EN name", () => {
    expect(capturedList(index, entries, "all", "char").map((s) => s.dex)).toEqual([6, 4]);
    expect(capturedList(index, entries, "missing", "").map((s) => s.dex)).toEqual([195]);
    expect(capturedList(index, entries, "missing", "quagsire").map((s) => s.dex)).toEqual([195]);
    expect(capturedList(index, entries, "missing", "char")).toEqual([]);
    expect(capturedList(index, entries, "all", "#25").map((s) => s.dex)).toEqual([25]);
  });

  it("date format: dd/mm/aaaa in PT, yyyy-mm-dd in EN", () => {
    const ms = new Date(2026, 8, 3, 10).getTime();
    expect(formatCaptureDate(ms, "pt")).toBe("03/09/2026");
    expect(formatCaptureDate(ms, "en")).toBe("2026-09-03");
  });
});
