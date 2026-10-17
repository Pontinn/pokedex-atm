// @vitest-environment node
// natures (quick): modelo puro da pagina Naturezas. Esperados derivados de NATURES (dominio) por caminho independente;
// as unicas constantes literais sao os exemplos do criterio de sucesso da IDEA (Adamant, Velocidade).
import { describe, expect, it } from "vitest";
import { NATURES, natureModifier, type BattleStatKey } from "../../../src/domain/natures";
import { MESSAGES } from "../../../src/i18n/messages";
import { defaultUi } from "../../../src/navigation/types";
import {
  BATTLE_STATS,
  NEUTRAL_NATURES,
  STAT_LABEL,
  isBattleStat,
  isNatureId,
  natureGrid,
  natureName,
  neutralStat,
  statGroups,
} from "../../../src/screens/Natures/natures-model";

describe("natures model", () => {
  it("default ui opens the table with nothing selected", () => {
    expect(defaultUi("natures")).toEqual({ view: "table", selected: null, stat: null });
  });

  it("has the 5 battle stats with core.ts labels (HP never appears)", () => {
    expect([...BATTLE_STATS].sort()).toEqual(["attack", "defence", "specialAttack", "specialDefence", "speed"]);
    for (const s of BATTLE_STATS) expect(MESSAGES[STAT_LABEL[s]].pt.length).toBeGreaterThan(0);
    expect(isBattleStat("hp")).toBe(false);
    expect(isBattleStat("speed")).toBe(true);
  });

  it("grid is 5 x 5, every cell filled, each of the 25 natures exactly once", () => {
    const grid = natureGrid();
    expect(grid.map((r) => r.up)).toEqual([...BATTLE_STATS]);
    const ids = grid.flatMap((r) => r.cells.map((c) => c.nature.id));
    expect(ids).toHaveLength(25);
    expect(new Set(ids)).toEqual(new Set(NATURES.map((n) => n.id)));
  });

  it("off-diagonal cells raise the row stat by 10% and lower the column stat by 10%", () => {
    for (const row of natureGrid()) {
      for (const c of row.cells) {
        if (c.up === c.down) continue;
        expect(c.neutral).toBe(false);
        expect(natureModifier(c.nature.id, c.up)).toBe(1.1);
        expect(natureModifier(c.nature.id, c.down)).toBe(0.9);
      }
    }
  });

  it("the diagonal holds the 5 neutral natures, which change nothing", () => {
    const diag = natureGrid().map((r) => r.cells.find((c) => c.up === c.down)!);
    expect(diag.every((c) => c.neutral)).toBe(true);
    expect(new Set(diag.map((c) => c.nature.id))).toEqual(new Set(NATURES.filter((n) => n.up === null).map((n) => n.id)));
    expect(NEUTRAL_NATURES).toHaveLength(5);
    for (const n of NEUTRAL_NATURES) for (const s of BATTLE_STATS) expect(natureModifier(n.id, s)).toBe(1);
    expect(new Set(NEUTRAL_NATURES.map(neutralStat))).toEqual(new Set(BATTLE_STATS));
  });

  it("each stat has 4 natures raising it and 4 lowering it", () => {
    for (const s of BATTLE_STATS) {
      const g = statGroups(s);
      expect(g.raise).toHaveLength(4);
      expect(g.lower).toHaveLength(4);
      for (const n of g.raise) expect(natureModifier(n.id, s)).toBe(1.1);
      for (const n of g.lower) expect(natureModifier(n.id, s)).toBe(0.9);
      const other = BATTLE_STATS.filter((x) => x !== s);
      expect(g.raise.map((n) => n.down)).toEqual(other);
      expect(g.lower.map((n) => n.up)).toEqual(other);
    }
  });

  it("success criterion: Adamant raises Attack and lowers Sp. Atk; Speed has Timid/Hasty/Jolly/Naive up", () => {
    const adamant = natureGrid().flatMap((r) => r.cells).find((c) => c.nature.id === "adamant")!;
    expect([adamant.up, adamant.down]).toEqual<BattleStatKey[]>(["attack", "specialAttack"]);
    expect(natureName(adamant.nature, "pt")).toBe("Rígida");
    expect(natureName(adamant.nature, "en")).toBe("Adamant");
    expect(new Set(statGroups("speed").raise.map((n) => n.id))).toEqual(new Set(["timid", "hasty", "jolly", "naive"]));
    expect(new Set(statGroups("speed").lower.map((n) => n.id))).toEqual(new Set(["brave", "relaxed", "quiet", "sassy"]));
  });

  it("isNatureId accepts only the 25 ids", () => {
    expect(isNatureId("adamant")).toBe(true);
    expect(isNatureId("nope")).toBe(false);
    expect(isNatureId(null)).toBe(false);
  });
});
