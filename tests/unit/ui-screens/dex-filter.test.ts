// F3.2: filtro combinavel da Pokedex (funcao pura; o e2e cobre a UI com o dataset real).
import { describe, expect, it } from "vitest";
import type { SpeciesSummary } from "../../../src/data/types";
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

const base = { filters: { types: [], generation: null, evolution: null, query: "" }, sort: "num" as const, status: "all" as const, captured: {}, lang: "pt" as const };
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
    expect(matchesQuery(INDEX[0], "zzzz")).toBe(false);
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
