// @vitest-environment node
// spawn-bait T1.1: regra das 3 melhores bagas, contextos, reforcos e faixa de Lure contra o dataset REAL publicado.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { BaitEffectKind, ItemInfo, ItemsFile, SpeciesDetail } from "../../../src/data/types";
import {
  MAX_SEASONINGS,
  POKE_BAIT_ITEM_ID,
  SNACK_ITEM_ID,
  baitBoosters,
  baitContexts,
  buildBaitIndex,
  getBaitIndex,
  lureRange,
  recommendBerries,
} from "../../../src/domain/bait";

const root = join(__dirname, "../../../public/data");
const version = (JSON.parse(readFileSync(join(root, "current.json"), "utf8")) as { datasetVersion: string }).datasetVersion;
const items = JSON.parse(readFileSync(join(root, version, "items.json"), "utf8")) as ItemsFile;
const species = (dex: number) => JSON.parse(readFileSync(join(root, version, "species", `${dex}.json`), "utf8")) as SpeciesDetail;
const index = buildBaitIndex(items);
const ids = (dex: number) => recommendBerries(species(dex), index).map((p) => p.itemId);
const c = (id: string) => `cobblemon:${id}_berry`;

function berry(id: string, effects: { kind: BaitEffectKind; subcategory: string | null }[], seasoning = true): ItemInfo {
  return {
    ...items["cobblemon:occa_berry"]!,
    id,
    bait: { seasoning, effects: effects.map((e) => ({ ...e, chance: 1, value: 1, text: { pt: "x", en: "x" } })) },
  };
}

describe("spawn-bait: 3 best berries on the real dataset", () => {
  it("exposes the constants", () => {
    expect(SNACK_ITEM_ID).toBe("cobblemon:poke_snack");
    expect(POKE_BAIT_ITEM_ID).toBe("cobblemon:poke_bait");
    expect(MAX_SEASONINGS).toBe(3);
  });

  it("Charizard: Occa (fire), Coba (flying), Lum (dragon/monster)", () => {
    expect(recommendBerries(species(6), index)).toEqual([
      { itemId: c("occa"), kind: "typing", labels: ["fire"] },
      { itemId: c("coba"), kind: "typing", labels: ["flying"] },
      { itemId: c("lum"), kind: "eggGroup", labels: ["dragon", "monster"] },
    ]);
  });

  it("matches the PRD worked examples", () => {
    expect(ids(130)).toEqual([c("passho"), c("coba"), c("aspear")]);
    expect(ids(95)).toEqual([c("charti"), c("shuca"), c("persim")]);
    expect(recommendBerries(species(95), index)[2]!.labels).toEqual(["mineral", "amorphous"]);
    expect(ids(129)).toEqual([c("passho"), c("aspear"), c("lum")]);
    expect(ids(120)).toEqual([c("passho"), c("pecha")]);
    expect(ids(349)).toEqual([c("passho"), c("aspear"), c("lum")]);
    expect(ids(132)).toEqual([c("chilan")]);
    expect(ids(172)).toEqual([c("wacan")]);
    expect(ids(194)).toEqual([c("passho"), c("shuca"), c("aspear")]);
  });

  it("baitContexts: snack only, rod only, both, none", () => {
    expect(baitContexts(species(6).spawns)).toEqual({ snack: true, rod: false });
    expect(baitContexts(species(349).spawns)).toEqual({ snack: false, rod: true });
    expect(baitContexts(species(129).spawns)).toEqual({ snack: true, rod: true });
    expect(baitContexts(species(1011).spawns)).toBeNull();
  });

  it("boosters are the 7 accepted items with rarity/shiny effects, by id", () => {
    const boosters = baitBoosters(items);
    expect(boosters.map((b) => b.itemId)).toEqual([
      "allthemodium:allthemodium_apple",
      "allthemodium:allthemodium_carrot",
      "cobblemon:starf_berry",
      "minecraft:enchanted_golden_apple",
      "minecraft:glistering_melon_slice",
      "minecraft:golden_apple",
      "minecraft:golden_carrot",
    ]);
    const by = new Map(boosters.map((b) => [b.itemId, b]));
    expect(by.get("minecraft:golden_apple")).toEqual({ itemId: "minecraft:golden_apple", rarity: true, shiny: true });
    expect(by.get("cobblemon:starf_berry")).toEqual({ itemId: "cobblemon:starf_berry", rarity: false, shiny: true });
    expect(by.get("minecraft:glistering_melon_slice")).toEqual({ itemId: "minecraft:glistering_melon_slice", rarity: true, shiny: false });
    expect(by.has("allthemons:mythical_pecha_berry")).toBe(false);
    for (const b of boosters) expect(items[b.itemId]!.bait!.seasoning).toBe(true);
  });

  it("getBaitIndex memoizes per items object (WeakMap)", () => {
    expect(getBaitIndex(items)).toBe(getBaitIndex(items));
    expect(getBaitIndex({ ...items })).not.toBe(getBaitIndex(items));
  });

  it("buildBaitIndex and recommendBerries over the 1027 species stay under 5 ms", () => {
    let t0 = performance.now();
    buildBaitIndex(items);
    expect(performance.now() - t0).toBeLessThan(5);
    const dir = join(root, version, "species");
    const all = readdirSync(dir).map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as SpeciesDetail);
    expect(all).toHaveLength(1027);
    let worst = 0;
    for (const s of all) {
      t0 = performance.now();
      recommendBerries(s, index);
      worst = Math.max(worst, performance.now() - t0);
    }
    expect(worst).toBeLessThan(5);
  });
});

describe("spawn-bait: rule edge cases (synthetic)", () => {
  const fixture: ItemsFile = {
    "t:b_fire": berry("t:b_fire", [{ kind: "typing", subcategory: "fire" }]),
    "t:a_fire": berry("t:a_fire", [{ kind: "typing", subcategory: "fire" }]),
    "t:no_season": berry("t:no_season", [{ kind: "typing", subcategory: "fire" }], false),
    "t:nature": berry("t:nature", [
      { kind: "nature", subcategory: "atk" },
      { kind: "ev", subcategory: "hp" },
    ]),
    "t:both": berry("t:both", [
      { kind: "eggGroup", subcategory: "monster" },
      { kind: "typing", subcategory: "water" },
    ]),
    "t:mon": berry("t:mon", [{ kind: "eggGroup", subcategory: "monster" }]),
    "t:no_bait": { ...items["cobblemon:potion"]!, id: "t:no_bait", bait: null },
    "t:shiny": berry("t:shiny", [{ kind: "shinyReroll", subcategory: null }], false),
  };
  const idx = buildBaitIndex(fixture);

  it("never picks seasoning false (RF-55) nor nature/EV berries (RF-17)", () => {
    const all = recommendBerries({ types: ["fire", "water"], eggGroups: ["monster"] }, idx, 10).map((p) => p.itemId);
    expect(all).not.toContain("t:no_season");
    expect(all).not.toContain("t:nature");
    expect(idx.boosters).toEqual([]);
  });

  it("orders ties by id, respects max and dedupes keeping the first position and kind", () => {
    expect(recommendBerries({ types: ["fire"], eggGroups: [] }, idx).map((p) => p.itemId)).toEqual(["t:a_fire", "t:b_fire"]);
    const picks = recommendBerries({ types: ["fire", "water"], eggGroups: ["monster"] }, idx, 10);
    expect(picks.map((p) => [p.itemId, p.kind])).toEqual([
      ["t:a_fire", "typing"],
      ["t:b_fire", "typing"],
      ["t:both", "typing"],
      ["t:mon", "eggGroup"],
    ]);
    expect(recommendBerries({ types: ["fire", "water"], eggGroups: ["monster"] }, idx, 2)).toHaveLength(2);
    expect(recommendBerries({ types: ["fire"], eggGroups: [] }, idx, 1).map((p) => p.itemId)).toEqual(["t:a_fire"]);
  });

  it("groups without berry add nothing and nothing is filled in (RF-52/53)", () => {
    expect(recommendBerries({ types: ["ghost"], eggGroups: ["undiscovered", "ditto"] }, idx)).toEqual([]);
    expect(recommendBerries({ types: [], eggGroups: [] }, idx)).toEqual([]);
  });

  it("a repeated effect on the same berry does not repeat the id", () => {
    const dup = buildBaitIndex({
      "t:dup": berry("t:dup", [
        { kind: "typing", subcategory: "fire" },
        { kind: "typing", subcategory: "fire" },
        { kind: "eggGroup", subcategory: "dragon" },
        { kind: "eggGroup", subcategory: "dragon" },
        { kind: "typing", subcategory: null },
      ]),
    });
    expect(dup.byType.get("fire")).toEqual(["t:dup"]);
    expect(dup.byEggGroup.get("dragon")).toEqual(["t:dup"]);
    expect(dup.labels.get("t:dup")).toEqual({ typing: ["fire"], eggGroup: ["dragon"] });
  });

  it("baitContexts on synthetic spawns", () => {
    expect(baitContexts([])).toBeNull();
    expect(baitContexts([{ context: "fishing" }, { context: "surface" }])).toEqual({ snack: true, rod: true });
  });
});

describe("spawn-bait: lureRange", () => {
  it("covers min only, max only, both and none", () => {
    expect(lureRange(1, null)).toEqual({ key: "where.fish.rangeMin", vars: { min: 1 } });
    expect(lureRange(null, 2)).toEqual({ key: "where.fish.rangeMax", vars: { max: 2 } });
    expect(lureRange(2, 2)).toEqual({ key: "where.fish.rangeBoth", vars: { min: 2, max: 2 } });
    expect(lureRange(null, null)).toBeNull();
  });
});
