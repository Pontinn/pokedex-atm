import { beforeAll, describe, expect, it } from "vitest";
import { buildExpected, type Expected } from "../../../tools/dataset/audit/expected";
import { MANUAL_SAMPLE } from "../../../tools/dataset/audit/sample";
import { abilityPairs } from "../../../tools/dataset/audit/compare";
import { buildLoadOrder, DEFAULT_SRC, loadOrder, parseModsToml } from "../../../tools/dataset/audit/raw";

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

  it("abilities: normal + oculta da mesma habilidade = 2 pares, comparacao consistente", () => {
    const g = e.species.get(92)!; // gastly: levitate e h:levitate no cru
    expect(abilityPairs(g.abilities)).toEqual(["levitate", "levitate(H)"]);
    expect(abilityPairs([{ id: "levitate", hidden: false }, { id: "levitate", hidden: true }])).toEqual(abilityPairs(g.abilities));
    expect(abilityPairs([{ id: "levitate", hidden: false }, { id: "levitate", hidden: false }])).not.toEqual(abilityPairs(g.abilities));
    expect(abilityPairs([{ id: "levitate", hidden: true }])).not.toEqual(abilityPairs(g.abilities));
  });

  it("colisao de spawn: kubejs vence jar; entre jars vence o mod que carrega depois", () => {
    const only = (dex: number) => [...new Set(e.species.get(dex)!.spawns.map((s) => s.source))];
    expect(only(120)).toEqual(["allthemons"]); // staryu: cobblemon < allthemons
    expect(only(670)).toEqual(["zamega"]); // floette: cobblemon < zamega
    expect(only(479)).toEqual(["ccc"]); // rotom: mega_showdown < allthemons < ccc
    expect(only(839)).toEqual(["ccc"]); // coalossal
    expect(e.species.get(479)!.spawnsAll.filter((s) => s.source === "mega_showdown").every((s) => s.shadowedBy === "ccc")).toBe(true);
    expect(e.species.get(550)!.spawnsAll.filter((s) => s.source === "cobblemon").every((s) => s.shadowedBy === "kubejs")).toBe(true);
    expect([...e.species.values()].flatMap((s) => s.spawnsAll).filter((s) => s.unorderedWith.length)).toEqual([]);
  });

  // spawn-bait T1.2 (7): esperado de isca, tempero, receita da panela e pesca, reescrito sem tools/dataset/src
  it("spawn-bait: 80 itens com efeito de isca (81 arquivos, kubejs vence), tempero do allthemodium pelo script do kubejs", () => {
    expect(e.baitItems.size).toBe(80);
    expect(e.baitItems.get("minecraft:enchanted_golden_apple")?.effects.map((x) => [x.kind, x.value])).toEqual([
      ["biteTime", 0.1],
      ["rarityBucket", 10],
      ["shinyReroll", 5],
    ]);
    expect(e.baitItems.get("allthemodium:allthemodium_carrot")?.seasoning).toBe(true);
    expect(e.baitItems.get("cobblemon:occa_berry")?.effects).toEqual([{ kind: "typing", subcategory: "fire", chance: 1, value: 10 }]);
    expect(e.baitItems.get("cobblemon:poke_bait")).toMatchObject({ effects: [], seasoning: false });
    expect(e.baitItems.has("allthemons:mythical_pecha_berry")).toBe(false);
  });

  it("spawn-bait: 2 receitas de isca da panela e a pesca do Staryu-10 igual ao exemplo da SPEC 5.3", () => {
    expect([...e.potRecipes.keys()].sort()).toEqual(["cobblemon:poke_bait", "cobblemon:poke_snack"]);
    expect(e.potRecipes.get("cobblemon:poke_snack")?.ingredients.map((i) => i.count)).toEqual([3, 2, 1, 3]);
    const staryu = e.species.get(120)?.spawnsAll.find((s) => s.id === "staryu-10");
    expect(staryu?.fishing).toEqual({ bait: null, rodType: null, rodBall: null, minLureLevel: 1, maxLureLevel: null, lureMultipliers: [{ lureMin: 3, lureMax: null, multiplier: 3 }] });
    const wooper = e.species.get(194)?.spawnsAll.find((s) => s.id === "wooper-true-16");
    expect(wooper?.fishing?.rodBall).toBe("cobblemon:love_ball");
  });
});

describe("audit: ordem de carga dos mods (neoforge.mods.toml)", () => {
  it("parser + fecho transitivo, AFTER e BEFORE, required e optional, pares sem ordem", () => {
    const t = (txt: string, root: string) => ({ root, toml: parseModsToml(txt) });
    const a = t(`[[mods]]
modId="a"
[[dependencies.a]]
  modId="b"
  type="optional"
  ordering="AFTER"
[[dependencies.a]] # fix
  modId="c"
  type="optional"
  ordering="BEFORE"
`, "/a");
    const d = t(`[[mods]]
modId = "d"
[[dependencies.d]]
modId = "b"
mandatory=true
ordering = "AFTER" # comentario
`, "/d");
    const o = buildLoadOrder([a, d]);
    expect(a.toml.modIds).toEqual(["a"]);
    expect(o.cmp("b", "a")).toBe(-1);
    expect(o.cmp("a", "c")).toBe(-1);
    expect(o.cmp("b", "c")).toBe(-1); // transitivo
    expect(o.cmp("c", "b")).toBe(1);
    expect(o.cmp("d", "a")).toBe(0); // sem ordem
    expect(o.cmp("d", "c")).toBe(0);
    expect(o.modIdOf("/d")).toBe("d");
    const cyc = buildLoadOrder([t(`[[mods]]
modId="x"
[[dependencies.x]]
modId="y"
ordering="AFTER"
[[dependencies.x]]
modId="y"
ordering="BEFORE"
`, "/x")]);
    expect(cyc.cmp("x", "y")).toBe(0); // ciclo = sem ordem
  });

  it("snapshot: mega_showdown < allthemons < ccc; cobblemon < allthemons/zamega; zamega x ccc sem ordem", () => {
    const o = loadOrder(DEFAULT_SRC);
    const ccc = "mr_complete_cobblemoncollectionmythsandlegendscompat";
    expect(o.cmp("mega_showdown", "allthemons")).toBe(-1);
    expect(o.cmp("allthemons", ccc)).toBe(-1);
    expect(o.cmp("mega_showdown", ccc)).toBe(-1);
    expect(o.cmp("cobblemon", "allthemons")).toBe(-1);
    expect(o.cmp("cobblemon", "zamega")).toBe(-1);
    expect(o.cmp("zamega", ccc)).toBe(0);
  });
});
