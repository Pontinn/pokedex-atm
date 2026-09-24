// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  TYPE_CHART,
  TYPE_IDS,
  effectivenessAgainst,
  groupByMultiplier,
  singleMultiplier,
  typeChartMatrix,
} from "../../../src/domain/type-chart";

describe("type chart", () => {
  it("Charizard (fire, flying): rock x4, water x2, ground x0, fire x0.5", () => {
    const e = effectivenessAgainst(["fire", "flying"]);
    expect(e.rock).toBe(4);
    expect(e.water).toBe(2);
    expect(e.electric).toBe(2);
    expect(e.ground).toBe(0);
    expect(e.fire).toBe(0.5);
    expect(e.grass).toBe(0.25);
    expect(e.bug).toBe(0.25);
    expect(e.normal).toBe(1);
  });

  it("Fire/Water vs fire = 0.5", () => {
    expect(effectivenessAgainst(["fire", "water"]).fire).toBe(0.25);
    expect(singleMultiplier("fire", "fire") * singleMultiplier("fire", "flying")).toBe(0.5);
    expect(effectivenessAgainst(["water"]).fire).toBe(0.5);
  });

  it("empty defenders -> everything x1", () => {
    const e = effectivenessAgainst([]);
    expect(Object.values(e).every((m) => m === 1)).toBe(true);
    expect(groupByMultiplier(e)).toEqual([]);
  });

  it("groupByMultiplier orders rows x4, x2, x0.5, x0.25, x0 and omits x1", () => {
    const groups = groupByMultiplier(effectivenessAgainst(["fire", "flying"]));
    expect(groups.map((g) => g.multiplier)).toEqual([4, 2, 0.5, 0.25, 0]);
    expect(groups[0]).toEqual({ multiplier: 4, types: ["rock"] });
    expect(groups[1]!.types).toEqual(["water", "electric"]);
    expect(groups[4]).toEqual({ multiplier: 0, types: ["ground"] });
  });

  it("chart is complete: 18 attackers, matrix only 0/0.5/1/2, ghost immune to normal", () => {
    expect(Object.keys(TYPE_CHART)).toHaveLength(18);
    expect(TYPE_IDS).toHaveLength(18);
    const m = typeChartMatrix();
    expect(m.normal.ghost).toBe(0);
    expect(m.dragon.fairy).toBe(0);
    for (const a of TYPE_IDS) for (const d of TYPE_IDS) expect([0, 0.5, 1, 2]).toContain(m[a][d]);
  });
});
