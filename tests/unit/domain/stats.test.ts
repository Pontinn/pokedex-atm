// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { BaseStats } from "../../../src/data/types";
import { NATURES, natureModifier } from "../../../src/domain/natures";
import { StatRangeError, calculateHp, calculateOther, calculateStats, recommendedInvestment } from "../../../src/domain/stats";

const all = (v: number): BaseStats => ({ hp: v, attack: v, defence: v, specialAttack: v, specialDefence: v, speed: v });

describe("stat formulas (PRD example: base 100, L100, IV 31, EV 252)", () => {
  it("neutral 299, favorable 328, unfavorable 269, HP 404", () => {
    expect(calculateOther(100, 31, 252, 100, 1)).toBe(299);
    expect(calculateOther(100, 31, 252, 100, 1.1)).toBe(328);
    expect(calculateOther(100, 31, 252, 100, 0.9)).toBe(269);
    expect(calculateHp(100, 31, 252, 100)).toBe(404);
  });

  it("calculateStats applies the nature per stat and also returns level 100", () => {
    const evs: BaseStats = { hp: 252, attack: 252, defence: 0, specialAttack: 0, specialDefence: 0, speed: 0 };
    const r = calculateStats(all(100), 50, all(31), evs, "adamant");
    expect(r.atLevel100.hp).toBe(404);
    expect(r.atLevel100.attack).toBe(328);
    expect(r.atLevel100.specialAttack).toBe(Math.floor((Math.floor(231) + 5) * 0.9));
    expect(r.atLevel.hp).toBe(Math.floor((294 * 50) / 100) + 60);
  });

  it("rejects out-of-range inputs with a typed error", () => {
    expect(() => calculateStats(all(100), 0, all(31), all(0), null)).toThrow(StatRangeError);
    expect(() => calculateStats(all(100), 50, all(32), all(0), null)).toThrow(/IV/);
    expect(() => calculateStats(all(100), 50, all(31), { ...all(0), hp: 253 }, null)).toThrow(/EV/);
    try {
      calculateStats(all(100), 50, all(31), { ...all(0), hp: 252, attack: 252, defence: 8 }, null);
      expect.unreachable();
    } catch (e) {
      expect((e as StatRangeError).code).toBe("evTotalExceeded");
    }
  });
});

describe("natures", () => {
  it("25 natures, 5 neutral, each non-neutral with distinct up/down", () => {
    expect(NATURES).toHaveLength(25);
    expect(NATURES.filter((x) => x.up === null).map((x) => x.id).sort()).toEqual(
      ["bashful", "docile", "hardy", "quirky", "serious"],
    );
    expect(natureModifier("modest", "specialAttack")).toBe(1.1);
    expect(natureModifier("modest", "attack")).toBe(0.9);
    expect(natureModifier("hardy", "attack")).toBe(1);
    expect(natureModifier(null, "speed")).toBe(1);
    expect(NATURES.find((x) => x.id === "adamant")?.name).toEqual({ pt: "Rígida", en: "Adamant" });
  });
});

describe("recommendedInvestment", () => {
  it("Charizard (78/84/78/109/85/100): SpA + Spe highlighted, 252/252/4 SpD", () => {
    const r = recommendedInvestment({ hp: 78, attack: 84, defence: 78, specialAttack: 109, specialDefence: 85, speed: 100 });
    expect(r.highlight).toEqual(["specialAttack", "speed"]);
    expect(r.evs).toEqual({ hp: 0, attack: 0, defence: 0, specialAttack: 252, specialDefence: 4, speed: 252 });
    expect(Object.values(r.ivs).every((v) => v === 31)).toBe(true);
  });

  it("Mew (all 100): canonical order hp, attack", () => {
    const r = recommendedInvestment(all(100));
    expect(r.highlight).toEqual(["hp", "attack"]);
    expect(r.evs).toEqual({ hp: 252, attack: 252, defence: 4, specialAttack: 0, specialDefence: 0, speed: 0 });
  });
});
