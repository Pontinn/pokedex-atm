// F4.2: agrupamento de fraquezas com o seletor, total de atributos e id humanizado de habilidade.
import { describe, expect, it } from "vitest";
import { effectivenessAgainst, groupByMultiplier } from "../../../src/domain/type-chart";
import { humanizeId } from "../../../src/screens/Detail/AbilitiesPanel";
import { statTotal } from "../../../src/screens/Detail/StatsPanel";
import { filterGroups } from "../../../src/screens/Detail/WeaknessPanel";

describe("detail panels", () => {
  const charizard = groupByMultiplier(effectivenessAgainst(["fire", "flying"]));
  it("Charizard groups: Rock x4, Water/Electric x2, Fire x1/2, Ground x0", () => {
    const by = Object.fromEntries(charizard.map((g) => [g.multiplier, g.types]));
    expect(by[4]).toEqual(["rock"]);
    expect(by[2]).toEqual(expect.arrayContaining(["water", "electric"]));
    expect(by[0.5]).toContain("fire");
    expect(by[0]).toEqual(["ground"]);
  });
  it("selector keeps only weaknesses or resistances (immunity counts as resistance)", () => {
    expect(filterGroups(charizard, "weak").map((g) => g.multiplier)).toEqual([4, 2]);
    expect(filterGroups(charizard, "res").map((g) => g.multiplier)).toEqual([0.5, 0.25, 0]);
    expect(filterGroups(charizard, "all")).toHaveLength(charizard.length);
  });
  it("BST and humanized ability id", () => {
    expect(statTotal({ hp: 78, attack: 84, defence: 78, specialAttack: 109, specialDefence: 85, speed: 100 })).toBe(534);
    expect(humanizeId("solar_power")).toBe("Solar Power");
    expect(humanizeId("solarpower")).toBe("Solarpower");
  });
});
