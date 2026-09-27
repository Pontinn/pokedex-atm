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

describe("recommendedInvestment (RF-110 rev 7: role rule)", () => {
  const bs = (hp: number, attack: number, defence: number, specialAttack: number, specialDefence: number, speed: number): BaseStats => ({
    hp,
    attack,
    defence,
    specialAttack,
    specialDefence,
    speed,
  });
  const ev = (p: Partial<BaseStats>): BaseStats => ({ hp: 0, attack: 0, defence: 0, specialAttack: 0, specialDefence: 0, speed: 0, ...p });

  it("Charizard 78/84/78/109/85/100 -> fastAttacker, SpA + Spe, timid, 252 SpA/252 Spe/4 HP", () => {
    const r = recommendedInvestment(bs(78, 84, 78, 109, 85, 100));
    expect(r.role).toBe("fastAttacker");
    expect(r.highlight).toEqual(["specialAttack", "speed"]);
    expect(r.natureId).toBe("timid");
    expect(r.evs).toEqual(ev({ specialAttack: 252, speed: 252, hp: 4 }));
    expect(Object.values(r.ivs).every((v) => v === 31)).toBe(true);
  });

  it("Gyarados 95/125/79/60/100/81 -> fastAttacker, Atk + Spe, jolly", () => {
    const r = recommendedInvestment(bs(95, 125, 79, 60, 100, 81));
    expect(r.role).toBe("fastAttacker");
    expect(r.highlight).toEqual(["attack", "speed"]);
    expect(r.natureId).toBe("jolly");
    expect(r.evs).toEqual(ev({ attack: 252, speed: 252, hp: 4 }));
  });

  it("Snorlax 160/110/65/65/110/30 -> slowAttacker, HP + Atk, adamant, 252 HP/252 Atk/4 SpD", () => {
    const r = recommendedInvestment(bs(160, 110, 65, 65, 110, 30));
    expect(r.role).toBe("slowAttacker");
    expect(r.highlight).toEqual(["hp", "attack"]);
    expect(r.natureId).toBe("adamant");
    expect(r.evs).toEqual(ev({ hp: 252, attack: 252, specialDefence: 4 }));
  });

  it("Blissey 255/10/10/75/135/55 -> defensive, HP + SpD, calm, 252 HP/252 SpD/4 Def", () => {
    const r = recommendedInvestment(bs(255, 10, 10, 75, 135, 55));
    expect(r.role).toBe("defensive");
    expect(r.highlight).toEqual(["hp", "specialDefence"]);
    expect(r.natureId).toBe("calm");
    expect(r.evs).toEqual(ev({ hp: 252, specialDefence: 252, defence: 4 }));
  });

  it("Shuckle 20/10/230/10/230/5 -> defensive, HP + Def, bold (ties: defence, weak offense attack)", () => {
    const r = recommendedInvestment(bs(20, 10, 230, 10, 230, 5));
    expect(r.role).toBe("defensive");
    expect(r.highlight).toEqual(["hp", "defence"]);
    expect(r.natureId).toBe("bold");
    expect(r.evs).toEqual(ev({ hp: 252, defence: 252, specialDefence: 4 }));
  });

  it("Mew (all 100) -> fastAttacker, Atk + Spe, jolly (tie: attack)", () => {
    const r = recommendedInvestment(all(100));
    expect(r.role).toBe("fastAttacker");
    expect(r.highlight).toEqual(["attack", "speed"]);
    expect(r.natureId).toBe("jolly");
  });

  it("defensive natures: impish (+Def -SpA) and careful (+SpD -SpA) when attack is the stronger offense", () => {
    expect(recommendedInvestment(bs(100, 70, 120, 50, 90, 40)).natureId).toBe("impish");
    expect(recommendedInvestment(bs(100, 70, 90, 50, 120, 40)).natureId).toBe("careful");
  });

  it("slow special attacker -> modest; thresholds: offense 80 is not defensive, speed 80 is fast", () => {
    const slow = recommendedInvestment(bs(90, 60, 70, 100, 110, 50));
    expect(slow.role).toBe("slowAttacker");
    expect(slow.natureId).toBe("modest");
    expect(slow.evs).toEqual(ev({ hp: 252, specialAttack: 252, specialDefence: 4 }));
    expect(recommendedInvestment(bs(90, 80, 120, 40, 60, 30)).role).toBe("slowAttacker");
    expect(recommendedInvestment(bs(90, 79, 100, 40, 60, 30)).role).toBe("defensive");
    expect(recommendedInvestment(bs(90, 100, 60, 40, 60, 80)).role).toBe("fastAttacker");
    expect(recommendedInvestment(bs(90, 100, 60, 40, 60, 79)).role).toBe("slowAttacker");
  });

  it("EV total is always 508 and every nature id exists in NATURES", () => {
    for (const s of [bs(78, 84, 78, 109, 85, 100), bs(160, 110, 65, 65, 110, 30), bs(255, 10, 10, 75, 135, 55), all(100)]) {
      const r = recommendedInvestment(s);
      expect(Object.values(r.evs).reduce((a, b) => a + b, 0)).toBe(508);
      expect(NATURES.some((n) => n.id === r.natureId)).toBe(true);
    }
  });
});
