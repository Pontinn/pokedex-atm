// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { ItemInfo, SpeciesSummary } from "../../../src/data/types";
import { normalizeSearch, parseDexQuery, searchItems, searchSpecies } from "../../../src/domain/search";

const sp = (dex: number, slug: string, pt: string, en: string): SpeciesSummary => ({
  dex,
  slug,
  name: { pt, en },
  searchKey: `${normalizeSearch(pt)}|${normalizeSearch(en)}`,
  types: ["normal"],
  generation: "gen1",
  labels: [],
  bst: 0,
  rarity: { primary: null, secondary: [] },
  evolutionMethods: ["none"],
  hasSprite: true,
  artworkId: dex,
});

const INDEX = [
  sp(4, "charmander", "Charmander", "Charmander"),
  sp(5, "charmeleon", "Charmeleon", "Charmeleon"),
  sp(6, "charizard", "Charizard", "Charizard"),
  sp(25, "pikachu", "Pikachu", "Pikachu"),
  sp(195, "quagsire", "Pântano", "Quagsire"),
  sp(250, "hooh", "Ho-Oh", "Ho-Oh"),
  sp(9901, "piglich", "Piglichu", "Piglichu"),
  sp(9902, "creepyon", "Creepyon", "Creepyon"),
];

const item = (id: string, pt: string, en: string) => ({ id, name: { pt, en } }) as ItemInfo;

describe("search", () => {
  it("parseDexQuery accepts 25, 025, 0025, #25 and rejects 0 / text", () => {
    for (const q of ["25", "025", "0025", "#25", " 25 "]) expect(parseDexQuery(q)).toBe(25);
    expect(parseDexQuery("0")).toBeNull();
    expect(parseDexQuery("25a")).toBeNull();
    expect(parseDexQuery("12345")).toBeNull();
  });

  it('"025" -> Pikachu (exact dex)', () => {
    expect(searchSpecies(INDEX, "025").map((s) => s.slug)).toEqual(["pikachu"]);
  });

  it('"pantano" finds Quagsire via the PT name without accent', () => {
    expect(searchSpecies(INDEX, "pantano").map((s) => s.dex)).toEqual([195]);
    expect(searchSpecies(INDEX, "PÂNTANO").map((s) => s.dex)).toEqual([195]);
    expect(searchSpecies(INDEX, "quags").map((s) => s.dex)).toEqual([195]);
  });

  it('"charizar" -> Charizard; "char" ranks prefixes by dex; substrings after prefixes', () => {
    expect(searchSpecies(INDEX, "charizar").map((s) => s.slug)).toEqual(["charizard"]);
    expect(searchSpecies(INDEX, "char").map((s) => s.dex)).toEqual([4, 5, 6]);
    expect(searchSpecies(INDEX, "chu").map((s) => s.dex)).toEqual([25, 9901]);
    expect(searchSpecies(INDEX, "char", 2)).toHaveLength(2);
  });

  it('"9902" -> Creepyon (custom dex)', () => {
    expect(searchSpecies(INDEX, "9902").map((s) => s.slug)).toEqual(["creepyon"]);
  });

  it("empty query, 0 and special characters are safe", () => {
    expect(searchSpecies(INDEX, "")).toEqual([]);
    expect(searchSpecies(INDEX, "   ")).toEqual([]);
    expect(searchSpecies(INDEX, "0")).toEqual([]);
    expect(searchSpecies(INDEX, "(.*")).toEqual([]);
    expect(searchSpecies(INDEX, "ho-oh").map((s) => s.dex)).toEqual([250]);
  });

  it("searchItems matches PT and EN names, prefix first", () => {
    const items = {
      "cobblemon:fire_stone": item("cobblemon:fire_stone", "Pedra do Fogo", "Fire Stone"),
      "cobblemon:potion": item("cobblemon:potion", "Poção", "Potion"),
      "cobblemon:super_potion": item("cobblemon:super_potion", "Super Poção", "Super Potion"),
    };
    expect(searchItems(items, "pocao").map((i) => i.id)).toEqual(["cobblemon:potion", "cobblemon:super_potion"]);
    expect(searchItems(Object.values(items), "fire").map((i) => i.id)).toEqual(["cobblemon:fire_stone"]);
    expect(searchItems(items, "otion").map((i) => i.id)).toEqual(["cobblemon:potion", "cobblemon:super_potion"]);
    expect(searchItems(items, "")).toEqual([]);
  });
});
