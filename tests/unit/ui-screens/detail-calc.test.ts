// F5.4: leitura/clamp dos inputs da calculadora e tipos da calculadora de efetividade.
import { describe, expect, it } from "vitest";
import { calculateStats } from "../../../src/domain/stats";
import { clampInt, readCalcState } from "../../../src/screens/Detail/StatsCalculator";
import { selectedTypes } from "../../../src/screens/Detail/TypeCalculator";

describe("calculator inputs", () => {
  it("clamps and falls back to 0 for non-numeric", () => {
    expect(clampInt("abc", 0, 31)).toBe(0);
    expect(clampInt("40", 0, 31)).toBe(31);
    expect(clampInt("-5", 0, 252)).toBe(0);
    expect(clampInt("", 1, 100, 1)).toBe(1);
    expect(clampInt(500, 1, 100)).toBe(100);
  });

  it("defaults: level 50, hardy, IV 31, EV 0; EV total is summed", () => {
    const s = readCalcState({ "ev.attack": 252, "ev.speed": "300", nature: "nope" });
    expect(s.level).toBe(50);
    expect(s.nature).toBe("hardy");
    expect(s.ivs.hp).toBe(31);
    expect(s.evs.speed).toBe(252);
    expect(s.evTotal).toBe(504);
  });

  it("base 100 / L100 / IV31 / EV252: 299 neutral, 328 favorable, 269 unfavorable", () => {
    const base = { hp: 100, attack: 100, defence: 100, specialAttack: 100, specialDefence: 100, speed: 100 };
    const s = readCalcState({ level: 100, "ev.attack": 252 });
    expect(calculateStats(base, s.level, s.ivs, s.evs, "hardy").atLevel.attack).toBe(299);
    expect(calculateStats(base, s.level, s.ivs, s.evs, "adamant").atLevel.attack).toBe(328);
    expect(calculateStats(base, s.level, s.ivs, s.evs, "modest").atLevel.attack).toBe(269);
  });

  it("type selection: prefilled, editable, never repeated, empty second type", () => {
    expect(selectedTypes({}, ["fire", "flying"])).toEqual(["fire", "flying"]);
    expect(selectedTypes({ t2: "water" }, ["fire", "flying"])).toEqual(["fire", "water"]);
    expect(selectedTypes({ t2: "" }, ["fire", "flying"])).toEqual(["fire"]);
    expect(selectedTypes({ t1: "water", t2: "water" }, ["fire"])).toEqual(["water"]);
  });
});
