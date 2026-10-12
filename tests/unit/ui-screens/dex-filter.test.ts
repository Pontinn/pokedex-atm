// F3.2: filtro combinavel da Pokedex (funcao pura; o e2e cobre a UI com o dataset real).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { SpeciesSummary } from "../../../src/data/types";
import type { DexFilters } from "../../../src/navigation/types";
import { normalizeSearch } from "../../../src/domain/search";
import { filterSpecies, matchesQuery, sortGenerations } from "../../../src/screens/Dex/use-filtered-species";
import { gridColumns } from "../../../src/screens/Dex/DexGrid";

function sp(dex: number, pt: string, en: string, types: SpeciesSummary["types"], generation: string, evo: SpeciesSummary["evolutionMethods"], bst = 300): SpeciesSummary {
  return {
    dex,
    slug: en.toLowerCase(),
    name: { pt, en },
    searchKey: `${normalizeSearch(pt)}|${normalizeSearch(en)}`,
    types,
    generation,
    labels: [],
    bst,
    rarity: { primary: "common", secondary: [] },
    evolutionMethods: evo,
    hasSprite: true,
    artworkId: dex,
    games: [],
  };
}

const INDEX = [
  sp(4, "Charmander", "Charmander", ["fire"], "gen1", ["level"], 309),
  sp(6, "Charizard", "Charizard", ["fire", "flying"], "gen1", ["none"], 534),
  sp(25, "Pikachu", "Pikachu", ["electric"], "gen1", ["item"], 320),
  sp(133, "Eevee", "Eevee", ["normal"], "gen1", ["item", "friendship", "level"], 325),
  sp(155, "Cyndaquil", "Cyndaquil", ["fire"], "gen2", ["level"], 309),
  sp(195, "Pântano", "Quagsire", ["water", "ground"], "gen2", ["none"], 430),
  sp(9901, "Creepyon", "Creepyon", ["ghost"], "custom", ["none"], 400),
];

const base = { filters: { types: [], generation: null, game: null, evolution: null, query: "" }, sort: "num" as const, status: "all" as const, captured: {}, lang: "pt" as const };
const dexes = (list: SpeciesSummary[]) => list.map((s) => s.dex);

describe("filterSpecies", () => {
  it("Fire + gen1 -> only gen 1 Fire species", () => {
    expect(dexes(filterSpecies(INDEX, { ...base, filters: { ...base.filters, types: ["fire"], generation: "gen1" } }))).toEqual([4, 6]);
  });
  it("types are OR among themselves", () => {
    expect(dexes(filterSpecies(INDEX, { ...base, filters: { ...base.filters, types: ["fire", "electric"] } }))).toEqual([4, 6, 25, 155]);
  });
  it("evolution 'item' -> only species with an item evolution", () => {
    expect(dexes(filterSpecies(INDEX, { ...base, filters: { ...base.filters, evolution: "item" } }))).toEqual([25, 133]);
  });
  it("status caught/missing uses the captured entries", () => {
    const captured = { "6": { capturedAt: 1 }, "25": { capturedAt: 2 } };
    expect(dexes(filterSpecies(INDEX, { ...base, status: "caught", captured }))).toEqual([6, 25]);
    expect(dexes(filterSpecies(INDEX, { ...base, status: "missing", captured }))).toEqual([4, 133, 155, 195, 9901]);
  });
  it("text AND filters: 'char' + Fire -> Charmander, Charizard", () => {
    expect(dexes(filterSpecies(INDEX, { ...base, filters: { ...base.filters, types: ["fire"], query: "char" } }))).toEqual([4, 6]);
  });
  it("text matches numbers and PT/EN names without accents; blank text = no filter", () => {
    expect(dexes(filterSpecies(INDEX, { ...base, filters: { ...base.filters, query: "#025" } }))).toEqual([25]);
    expect(dexes(filterSpecies(INDEX, { ...base, filters: { ...base.filters, query: "pantano" } }))).toEqual([195]);
    expect(dexes(filterSpecies(INDEX, { ...base, filters: { ...base.filters, query: "QUAG" } }))).toEqual([195]);
    expect(filterSpecies(INDEX, { ...base, filters: { ...base.filters, query: "   " } })).toHaveLength(INDEX.length);
    expect(matchesQuery(INDEX[0]!, "zzzz")).toBe(false);
  });
  it("custom generation shows the pack species; sorting by name and bst keeps the filter", () => {
    expect(dexes(filterSpecies(INDEX, { ...base, filters: { ...base.filters, generation: "custom" } }))).toEqual([9901]);
    expect(dexes(filterSpecies(INDEX, { ...base, sort: "bst", filters: { ...base.filters, types: ["fire"] } }))).toEqual([6, 4, 155]);
    expect(dexes(filterSpecies(INDEX, { ...base, sort: "name", filters: { ...base.filters, types: ["fire"] } }))).toEqual([6, 4, 155]);
  });
});

describe("helpers", () => {
  it("sortGenerations orders gen numbers, suffixes after the base, custom last", () => {
    expect(sortGenerations(["custom", "gen8a", "gen10", "gen2", "gen7b", "gen1", "gen7", "gen8", "gen2"])).toEqual([
      "gen1", "gen2", "gen7", "gen7b", "gen8", "gen8a", "gen10", "custom",
    ]);
  });
  it("gridColumns: 200px min card + 14px gap on desktop, always 2 on mobile", () => {
    expect(gridColumns(964, false)).toBe(4);
    expect(gridColumns(150, false)).toBe(1);
    expect(gridColumns(1200, true)).toBe(2);
  });
});

describe("filterSpecies by game (pokemon-generation)", () => {
  const GAMES: Record<number, number[] | null> = { 4: [1, 7], 6: [1, 7], 25: [7], 133: [1], 155: [3], 195: [3, 7], 9901: null };
  const G = INDEX.map((s) => ({ ...s, games: GAMES[s.dex] ?? [] }));
  const withGame = (game: number | null, extra: Partial<DexFilters> = {}) =>
    dexes(filterSpecies(G, { ...base, filters: { ...base.filters, ...extra, game } }));

  it("game null gives the same result as before for every existing combination (no filter)", () => {
    const combos: Partial<DexFilters>[] = [{}, { types: ["fire"], generation: "gen1" }, { types: ["fire", "electric"] }, { evolution: "item" }, { types: ["fire"], query: "char" }, { query: "pantano" }];
    for (const c of combos) {
      const { game: _omit, ...legacy } = { ...base.filters, ...c };
      void _omit;
      const before = dexes(filterSpecies(G, { ...base, filters: legacy as DexFilters }));
      expect(withGame(null, c)).toEqual(before);
    }
    expect(withGame(null)).toEqual(dexes(G));
  });

  it("game AND type AND generation AND text; custom species never match a game", () => {
    expect(withGame(7)).toEqual([4, 6, 25, 195]);
    expect(withGame(7, { types: ["fire"] })).toEqual([4, 6]);
    expect(withGame(7, { generation: "gen2" })).toEqual([195]);
    expect(withGame(7, { query: "pika" })).toEqual([25]);
    expect(withGame(3, { types: ["fire"] })).toEqual([155]);
    expect(withGame(99)).toEqual([]);
    for (const id of [1, 3, 7]) expect(withGame(id)).not.toContain(9901);
  });

  it("real index and catalog: FireRed / LeafGreen = the species whose games include its id (151); median of 20 runs < 5 ms", () => {
    const version = (JSON.parse(readFileSync("public/data/current.json", "utf8")) as { datasetVersion: string }).datasetVersion;
    const index = JSON.parse(readFileSync(`public/data/${version}/species-index.json`, "utf8")) as SpeciesSummary[];
    const manifest = JSON.parse(readFileSync(`public/data/${version}/dataset-manifest.json`, "utf8")) as { games: { id: number; slug: string }[] };
    const frlg = manifest.games.find((g) => g.slug === "firered-leafgreen")!.id;
    const opts = { ...base, filters: { ...base.filters, game: frlg } };
    const got = dexes(filterSpecies(index, opts));
    const want = index.filter((s) => s.games !== null && s.games.includes(frlg)).map((s) => s.dex);
    expect(got).toEqual(want);
    expect(got.length).toBe(151);
    expect(got).toContain(41);
    expect(got).toContain(42);
    expect(got).not.toContain(169);
    const times: number[] = [];
    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      filterSpecies(index, opts);
      times.push(performance.now() - t0);
    }
    times.sort((a, b) => a - b);
    expect(times[10]!).toBeLessThan(5);
  });
});
