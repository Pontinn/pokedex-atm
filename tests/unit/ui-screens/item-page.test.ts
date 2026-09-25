// @vitest-environment node
// F9.3: regras da pagina do item contra o dataset REAL: sem rota, receita so "Sim" com tipos, loot humanizado, Usado em.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { ItemsFile } from "../../../src/data/types";
import { lootTableLabel, obtainRows, recipeLabels, showsEffect, uniqueEvolutions, unknownItemName } from "../../../src/screens/Item/item-page-model";

const root = join(__dirname, "../../../public/data");
const version = (JSON.parse(readFileSync(join(root, "current.json"), "utf8")) as { datasetVersion: string }).datasetVersion;
const items = JSON.parse(readFileSync(join(root, version, "items.json"), "utf8")) as ItemsFile;

describe("F9.3 item page", () => {
  it("item without route shows a single 'none' row; unknown id too", () => {
    const none = Object.values(items).find((i) => i.obtain.every((r) => r.kind === "none"))!;
    expect(obtainRows(none)).toEqual([{ kind: "none" }]);
    expect(obtainRows(null)).toEqual([{ kind: "none" }]);
    expect(obtainRows(items["cobblemon:potion"]!).map((r) => r.kind)).toEqual(["craftable", "structureLoot"]);
  });

  it("recipe types become readable labels without repeats; never the recipe", () => {
    expect(recipeLabels(["minecraft:crafting_shaped", "minecraft:crafting_shapeless", "minecraft:smelting"], "pt")).toEqual(["Bancada de trabalho", "Fornalha"]);
    expect(recipeLabels(["cobblemon:brewing_stand", "cobblemon:cooking_pot_shapeless"], "en")).toEqual(["Brewing stand", "Cooking pot"]);
    expect(recipeLabels(["foo:weird_machine"], "en")).toEqual(["Weird machine"]);
  });

  it("loot tables are humanized; unknown ids humanized", () => {
    expect(lootTableLabel("ruins/gilded_chests/base")).toBe("Ruins: Gilded chests (base)");
    expect(lootTableLabel("blocks/potion")).toBe("Blocks (potion)");
    expect(unknownItemName("minecraft:gunpowder")).toEqual({ pt: "Gunpowder", en: "Gunpowder" });
  });

  it("Fire Stone is used in Vulpix, Growlithe and Eevee evolutions; Potion shows its effect", () => {
    const evo = items["cobblemon:fire_stone"]!.usedIn.evolutions;
    for (const pair of [
      { from: 133, to: 136 },
      { from: 37, to: 38 },
      { from: 58, to: 59 },
    ])
      expect(evo).toContainEqual(pair);
    expect(showsEffect(items["cobblemon:potion"]!)).toBe(true);
    expect(showsEffect(items["cobblemon:fire_stone"]!)).toBe(false);
  });

  it("used-in shows each evolution pair once (regional routes repeat from/to without a form)", () => {
    const thunder = items["cobblemon:thunder_stone"]!.usedIn.evolutions;
    expect(thunder.filter((e) => e.from === 25 && e.to === 26)).toHaveLength(2);
    const shown = uniqueEvolutions(thunder);
    expect(shown.filter((e) => e.from === 25 && e.to === 26)).toHaveLength(1);
    expect(shown.length).toBe(new Set(thunder.map((e) => `${e.from}-${e.to}`)).size);
    for (const item of Object.values(items)) {
      const keys = uniqueEvolutions(item.usedIn.evolutions).map((e) => `${e.from}-${e.to}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
    expect(uniqueEvolutions([{ from: 1, to: 2 }, { from: 3, to: 4 }, { from: 1, to: 2 }])).toEqual([{ from: 1, to: 2 }, { from: 3, to: 4 }]);
  });
});
