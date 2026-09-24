import { beforeAll, describe, expect, it } from "vitest";
import { buildExpected, type Expected } from "../../../tools/dataset/audit/expected";
import { MANUAL_SAMPLE } from "../../../tools/dataset/audit/sample";

// Fatos conhecidos da SPEC/handoffs, conferidos contra o construtor de esperado da auditoria (A1).
describe("audit: esperado derivado do snapshot cru", () => {
  let e: Expected;
  beforeAll(() => {
    e = buildExpected();
  }, 60_000);

  it("1027 especies (1025 + Creepyon/Piglich)", () => {
    expect(e.species.size).toBe(1027);
    expect(e.species.get(9901)?.name.pt).toBe("Piglichu");
    expect(e.species.get(9902)?.slug).toBe("creepyon");
    expect(e.species.get(9902)?.generation).toBe("custom");
  });

  it("Eevee: 8 arestas, raridade uncommon + [rare, ultra-rare]", () => {
    const ev = e.species.get(133)!;
    expect(ev.evolutions).toHaveLength(8);
    expect(ev.evolutions.find((x) => x.toSlug === "espeon")?.requirements.sort()).toEqual(["friendship:160", "timeRange:day"]);
    expect(ev.evolutions.find((x) => x.toSlug === "sylveon")?.requirements).toContain("hasMoveType:fairy");
    expect(ev.rarity).toEqual({ primary: "uncommon", secondary: ["rare", "ultra-rare"] });
  });

  it("Mareep: drop silentgear:sinew 25% da adicao do allthemons, 4 entradas", () => {
    const m = e.species.get(179)!;
    expect(m.drops).toHaveLength(4);
    expect(m.drops).toContainEqual({ item: "silentgear:sinew", percentage: 25, quantityRange: null });
  });

  it("Mewtwo: ultra-rare pelo ccc e fossil do allthemons", () => {
    const m = e.species.get(150)!;
    expect(m.rarity.primary).toBe("ultra-rare");
    expect(m.fossils[0]?.items).toEqual(["allthemons:pika_star", "allthemons:ancient_dna_sample"]);
    expect(m.obtainKinds).toEqual(["fossil", "addon"]);
  });

  it("Charizard: Mega-X exige charizardite_x + keystone, Gmax sem item, obtain evolution+breeding", () => {
    const c = e.species.get(6)!;
    expect(c.forms.find((f) => f.name === "Mega-X")?.requiredItems).toEqual(["mega_showdown:charizardite_x", "mega_showdown:keystone"]);
    expect(c.forms.find((f) => f.name === "Gmax")?.requiredItems).toEqual([]);
    expect(c.obtainKinds).toEqual(["evolution", "breeding"]);
    expect(e.species.get(142)!.obtainKinds).toEqual(["fossil", "breeding"]);
  });

  it("16 rotas de fossil, 48 bolas, levelCap do toml", () => {
    expect(e.fossilRoutes).toHaveLength(16);
    expect(e.balls).toHaveLength(48);
    expect(e.balls.every((b) => b.rule.kind !== "MISSING_RULE")).toBe(true);
    expect(e.levelCap).toEqual({ initialLevelCap: 15, relativeLevelCap: 0, initialSeries: "empty", freeroamRequiresCompletedSeries: true });
  });

  it("BDSP: 43 treinadores-chave (kubejs vence), comecando por Roark", () => {
    const b = e.series.find((s) => s.id === "bdsp")!;
    expect(b.keyTrainers).toHaveLength(43);
    expect(b.keyTrainers[0]).toBe("gym_leader_roark_0395");
    expect(e.series.find((s) => s.id === "radicalred")!.keyTrainers).toHaveLength(39);
    expect(e.series.find((s) => s.id === "unbound")!.keyTrainers).toHaveLength(38);
  });

  it("amostra manual: 50 especies distintas e existentes", () => {
    expect(MANUAL_SAMPLE).toHaveLength(50);
    expect(new Set(MANUAL_SAMPLE.map((s) => s.dex)).size).toBe(50);
    for (const s of MANUAL_SAMPLE) expect(e.species.get(s.dex)?.slug).toBe(s.slug);
  });
});
