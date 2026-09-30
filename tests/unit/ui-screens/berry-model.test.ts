// @vitest-environment node
// berry-mutations T1.3: regras puras de origem, linhas e agrupamento contra o dataset REAL; conjuntos esperados
// derivados dos 70 arquivos crus data/cobblemon/berries/*.json do snapshot (LESSONS), nunca copiados da SPEC.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { ItemInfo, ItemsFile } from "../../../src/data/types";
import { berryObtainExtras, berryWorldBiomes, groupMutationPairs, groupMutationUses, obtainRows, pageObtainRoutes } from "../../../src/screens/Item/item-page-model";
import { ORIGIN_FILTERS, berryOrigins, filterByOrigin, filterItems, isOriginFilter, visibleTabs } from "../../../src/screens/Items/item-model";

const repo = join(__dirname, "../../..");
const root = join(repo, "public/data");
const version = (JSON.parse(readFileSync(join(root, "current.json"), "utf8")) as { datasetVersion: string }).datasetVersion;
const file = JSON.parse(readFileSync(join(root, version, "items.json"), "utf8")) as ItemsFile;
const items = Object.values(file);
const byId = (id: string) => file[`cobblemon:${id}`]!;

const berriesDir = join(repo, "data-source/atm-1.3.0/mods/Cobblemon-neoforge-1.7.3+1.21.1.jar/data/cobblemon/berries");
const ns = (id: string) => (id.includes(":") ? id : `cobblemon:${id}`);
const raw = new Map<string, { spawnConditions?: unknown[]; mutations?: Record<string, string> }>();
for (const f of readdirSync(berriesDir).filter((x) => x.endsWith(".json"))) raw.set(`cobblemon:${f.replace(/\.json$/, "")}`, JSON.parse(readFileSync(join(berriesDir, f), "utf8")));
const results = new Set<string>();
for (const b of raw.values()) for (const r of Object.values(b.mutations ?? {})) results.add(ns(r));
const withSpawn = new Set([...raw].filter(([, b]) => (b.spawnConditions ?? []).length > 0).map(([id]) => id));
const bothIds = [...raw.keys()].filter((id) => results.has(id) && withSpawn.has(id));
const worldOnly = [...raw.keys()].filter((id) => !results.has(id) && withSpawn.has(id));
const mutOnly = [...raw.keys()].filter((id) => results.has(id) && !withSpawn.has(id));
const kinds = (it: ItemInfo) => pageObtainRoutes(it).map((r) => r.kind);
const sh = (s: string) => s.replace(/cobblemon:|_berry/g, "");

describe("berry-mutations: berryOrigins and filterByOrigin on the real dataset", () => {
  it("origins match the counts derived from the raw berry files; non-berries have none", () => {
    const got = { world: 0, mutation: 0, both: 0 };
    for (const it of items) {
      const o = berryOrigins(it);
      if (!it.berry) {
        expect(o).toEqual([]);
        continue;
      }
      if (o.length === 2) got.both++;
      else if (o[0] === "world") got.world++;
      else if (o[0] === "mutation") got.mutation++;
    }
    expect(got).toEqual({ world: worldOnly.length, mutation: mutOnly.length, both: bothIds.length });
    for (const id of bothIds) expect(berryOrigins(file[id]!)).toEqual(["mutation", "world"]);
    expect(berryOrigins(byId("liechi_berry"))).toEqual(["mutation", "world"]);
    expect(berryOrigins({ berry: undefined as unknown as null })).toEqual([]);
  });

  it("all returns the same reference and changes nothing for every tab and search", () => {
    expect(filterByOrigin(items, "all")).toBe(items);
    for (const tab of visibleTabs(items)) {
      const base = filterItems(items, tab, "", "pt");
      expect(filterByOrigin(base, "all")).toBe(base);
    }
    for (const q of ["ber", "baga", "pocao"]) {
      const base = filterItems(items, null, q, "pt");
      expect(filterByOrigin(base, "all")).toEqual(filterItems(items, null, q, "pt"));
    }
  });

  it("mutation and world keep the filterItems order and match the derived counts", () => {
    const berries = filterItems(items, "berry", "", "pt");
    const mut = filterByOrigin(berries, "mutation");
    const world = filterByOrigin(berries, "world");
    expect(mut.length).toBe(results.size);
    expect(mut).toEqual(berries.filter((it) => results.has(it.id)));
    expect(world.length).toBe(withSpawn.size);
    expect(filterByOrigin(filterItems(items, "bait", "", "pt"), "mutation").length).toBe(results.size);
    expect(filterByOrigin(filterItems(items, "medicine", "", "pt"), "mutation")).toEqual([]);
    const ber = filterByOrigin(filterItems(items, null, "ber", "pt"), "world");
    expect(ber.every((it) => withSpawn.has(it.id))).toBe(true);
    for (const id of bothIds) {
      expect(mut.map((i) => i.id)).toContain(id);
      expect(world.map((i) => i.id)).toContain(id);
    }
  });

  it("isOriginFilter accepts only the 3 options", () => {
    expect(ORIGIN_FILTERS).toEqual(["all", "mutation", "world"]);
    for (const f of ORIGIN_FILTERS) expect(isOriginFilter(f)).toBe(true);
    for (const v of ["xyz", "", null, undefined, 3]) expect(isOriginFilter(v)).toBe(false);
  });

  it("filterByOrigin over the whole catalog stays under 5 ms", () => {
    let best = Infinity;
    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      filterByOrigin(items, "mutation");
      best = Math.min(best, performance.now() - t0);
    }
    expect(best).toBeLessThan(5);
  });
});

describe("berry-mutations: page rows on the real dataset", () => {
  it("Occa, Sitrus, Eggant, Liechi and Oran follow SPEC 2.4 item 6", () => {
    const occa = byId("occa_berry");
    expect(kinds(occa)).toEqual(obtainRows(occa).map((r) => r.kind).filter((k) => k !== "plantable"));
    expect(berryObtainExtras(occa)).toEqual(["berryWorld", "berryGrowth"]);
    const sitrus = byId("sitrus_berry");
    expect(kinds(sitrus)).not.toContain("plantable");
    expect(berryObtainExtras(sitrus)).toEqual(["berryGrowth", "mutation"]);
    expect(berryObtainExtras(byId("eggant_berry"))).toEqual(["berryGrowth", "mutation"]);
    expect(kinds(byId("eggant_berry"))).toEqual(["craftable"]);
    expect(berryObtainExtras(byId("liechi_berry"))).toEqual(["berryWorld", "berryGrowth", "mutation"]);
    expect(berryObtainExtras(byId("oran_berry"))).toEqual(["berryWorld", "berryGrowth"]);
  });

  it("every item without berry keeps obtainRows and gets no extras", () => {
    for (const it of items.filter((i) => i.berry === null)) {
      expect(pageObtainRoutes(it)).toEqual(obtainRows(it));
      expect(berryObtainExtras(it)).toEqual([]);
    }
    expect(pageObtainRoutes(null)).toEqual([{ kind: "none" }]);
    expect(berryObtainExtras(null)).toEqual([]);
  });

  it("berryWorld and mutation extras exist exactly for the berries with spawn and pairs (derived)", () => {
    for (const id of raw.keys()) {
      const ex = berryObtainExtras(file[id]!);
      expect(ex.includes("berryWorld")).toBe(withSpawn.has(id));
      expect(ex.includes("mutation")).toBe(results.has(id));
    }
  });

  it("synthetic edge cases: empty biome tags fall back to plantable; no routes and no extras = none", () => {
    const base = { spawn: [], mutationPairs: [], mutationUses: [] };
    const plantAny = { obtain: [{ kind: "plantable", biomeTags: [], mulches: [] }], berry: base } as unknown as ItemInfo;
    expect(berryObtainExtras(plantAny)).toEqual(["plantable"]);
    expect(pageObtainRoutes(plantAny)).toEqual([]);
    const bare = { obtain: [{ kind: "none" }], berry: base } as unknown as ItemInfo;
    expect(pageObtainRoutes(bare)).toEqual([{ kind: "none" }]);
  });
});

describe("berry-mutations: grouping", () => {
  it("pair and use groups match SPEC 2.4 item 8 examples", () => {
    const pairs = (id: string) => groupMutationPairs(byId(id).berry!.mutationPairs).map((g) => ({ fixed: sh(g.fixed), partners: g.partners.map(sh) }));
    const uses = (id: string) => groupMutationUses(byId(id).berry!.mutationUses).map((g) => ({ result: sh(g.result), partners: g.partners.map(sh) }));
    expect(pairs("lum_berry")).toEqual([{ fixed: "oran", partners: ["aspear", "cheri", "chesto", "pecha", "rawst"] }]);
    expect(pairs("figy_berry")).toEqual([{ fixed: "cheri", partners: ["persim"] }]);
    expect(pairs("enigma_berry")).toHaveLength(1);
    expect(pairs("enigma_berry")[0]!.fixed).toBe("hopo");
    expect(pairs("enigma_berry")[0]!.partners).toHaveLength(18);
    expect(pairs("liechi_berry")).toEqual([{ fixed: "kelpsy", partners: ["pamtre"] }]);
    expect(uses("cheri_berry")).toEqual([
      { result: "figy", partners: ["persim"] },
      { result: "lum", partners: ["oran"] },
    ]);
    expect(uses("oran_berry")).toEqual([
      { result: "leppa", partners: ["bluk", "nanab", "pinap", "razz", "wepear"] },
      { result: "lum", partners: ["aspear", "cheri", "chesto", "pecha", "rawst"] },
    ]);
    expect(uses("lum_berry")).toEqual([
      { result: "hopo", partners: ["leppa"] },
      { result: "sitrus", partners: ["aguav", "figy", "iapapa", "mago", "wiki"] },
    ]);
  });

  it("for all berries the groups rebuild exactly the published pairs and uses", () => {
    for (const id of raw.keys()) {
      const b = file[id]!.berry!;
      const rebuilt = groupMutationPairs(b.mutationPairs).flatMap((g) => g.partners.map((p) => [g.fixed, p].sort().join("|")));
      expect(rebuilt.sort()).toEqual(b.mutationPairs.map((p) => `${p.a}|${p.b}`).sort());
      const rebuiltUses = groupMutationUses(b.mutationUses).flatMap((g) => g.partners.map((p) => `${p}|${g.result}`));
      expect(rebuiltUses.sort()).toEqual(b.mutationUses.map((u) => `${u.partner}|${u.result}`).sort());
    }
  });

  it("ties go to the smallest id, duplicates collapse, multiple groups are covered", () => {
    expect(groupMutationPairs([{ a: "x:b", b: "x:c" }])).toEqual([{ fixed: "x:b", partners: ["x:c"] }]);
    expect(
      groupMutationPairs([
        { a: "x:a", b: "x:b" },
        { a: "x:a", b: "x:b" },
      ]),
    ).toEqual([{ fixed: "x:a", partners: ["x:b"] }]);
    expect(
      groupMutationPairs([
        { a: "x:a", b: "x:z" },
        { a: "x:a", b: "x:y" },
        { a: "x:c", b: "x:d" },
      ]),
    ).toEqual([
      { fixed: "x:a", partners: ["x:y", "x:z"] },
      { fixed: "x:c", partners: ["x:d"] },
    ]);
    expect(groupMutationPairs([])).toEqual([]);
    expect(groupMutationUses([])).toEqual([]);
    expect(
      groupMutationUses([
        { partner: "x:p", result: "x:r" },
        { partner: "x:p", result: "x:r" },
      ]),
    ).toEqual([{ result: "x:r", partners: ["x:p"] }]);
  });

  it("berryWorldBiomes covers allBiome, preferred, specific and combinations", () => {
    expect(berryWorldBiomes([{ variant: "allBiome", biomeTags: [] }])).toEqual({ any: true, biomeTags: [] });
    expect(berryWorldBiomes([{ variant: "preferredBiome", biomeTags: ["a", "b"] }])).toEqual({ any: false, biomeTags: ["a", "b"] });
    expect(berryWorldBiomes([{ variant: "specificBiome", biomeTags: ["m"] }])).toEqual({ any: false, biomeTags: ["m"] });
    expect(
      berryWorldBiomes([
        { variant: "preferredBiome", biomeTags: ["a", "b"] },
        { variant: "specificBiome", biomeTags: ["b", "c"] },
        { variant: "allBiome", biomeTags: [] },
      ]),
    ).toEqual({ any: true, biomeTags: ["a", "b", "c"] });
    expect(berryWorldBiomes([])).toEqual({ any: false, biomeTags: [] });
  });
});
