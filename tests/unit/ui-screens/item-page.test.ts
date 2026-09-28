// @vitest-environment node
// F9.3: regras da pagina do item contra o dataset REAL: sem rota, receita so "Sim" com tipos, loot humanizado, Usado em.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { ItemsFile } from "../../../src/data/types";
import { lootTableLabel, obtainRows, RECIPE_TYPE_LABELS, recipeLabels, recipeTypeLabel, showsEffect, uniqueEvolutions, unknownItemName } from "../../../src/screens/Item/item-page-model";

const root = join(__dirname, "../../../public/data");
const version = (JSON.parse(readFileSync(join(root, "current.json"), "utf8")) as { datasetVersion: string }).datasetVersion;
const items = JSON.parse(readFileSync(join(root, version, "items.json"), "utf8")) as ItemsFile;

describe("F9.3 item page", () => {
  it("item without route shows a single 'none' row; unknown id too", () => {
    // U7d: o dataset publicado nao tem mais `none` (zero item sem rota); o caso sai de um item sintetico.
    expect(Object.values(items).some((i) => i.obtain.some((r) => r.kind === "none"))).toBe(false);
    const none: ItemsFile[string] = { ...items["cobblemon:potion"]!, obtain: [{ kind: "none" }] };
    expect(obtainRows(none)).toEqual([{ kind: "none" }]);
    expect(obtainRows(null)).toEqual([{ kind: "none" }]);
    // U7c: pocao ganhou recompensa de missao e estrutura gerada no mundo.
    expect(obtainRows(items["cobblemon:potion"]!).map((r) => r.kind)).toEqual(["craftable", "structureLoot", "questReward", "structurePlaced"]);
  });

  it("recipe types become readable labels without repeats; never the recipe", () => {
    expect(recipeLabels(["minecraft:crafting_shaped", "minecraft:crafting_shapeless", "minecraft:smelting"], "pt")).toEqual(["Bancada de trabalho", "Fornalha"]);
    expect(recipeLabels(["cobblemon:brewing_stand", "cobblemon:cooking_pot_shapeless"], "en")).toEqual(["Brewing stand", "Cooking pot"]);
    expect(recipeLabels(["foo:weird_machine"], "en")).toEqual(["Weird machine"]);
  });

  // U7e: os 89 tipos de receita do dataset do U7a (receitas de todos os namespaces) tem rotulo do jogo em pt e en.
  const U7A_RECIPE_TYPES = [
      "actuallyadditions:color_change", "actuallyadditions:crushing", "actuallyadditions:laser", "aether:freezing",
      "apokinetics:frostwork", "apokinetics:momentum", "apotheosis:sized_upgrade_recipe",
      "apothic_enchanting:infusion", "botanypots:crop", "cobblegengalore:blockgen", "cobblemon:brewing_stand",
      "cobblemon:cooking_pot", "cobblemon:cooking_pot_shapeless", "create:compacting", "create:crushing",
      "create:cutting", "create:deploying", "create:filling", "create:haunting", "create:mechanical_crafting",
      "create:milling", "create:mixing", "create:pressing", "create:sequenced_assembly", "create:splashing",
      "create_aquatic_ambitions:channeling", "create_dragons_plus:ending", "create_dragons_plus:freezing",
      "enderio:alloy_smelting", "enderio:sag_milling", "enderio:tank", "eternal_starlight:alloy",
      "eternal_starlight:drying", "extendedae:circuit_cutter", "farmersdelight:cutting",
      "farmingforblockheads:market", "forbidden_arcanus:clibano_combustion", "immersiveengineering:arc_furnace",
      "immersiveengineering:bottling_machine", "immersiveengineering:cloche", "immersiveengineering:coke_oven",
      "immersiveengineering:crusher", "immersiveengineering:mineral_mix", "industrialforegoing:crusher",
      "industrialforegoing:laser_drill_ore", "integrateddynamics:drying_basin",
      "integrateddynamics:mechanical_drying_basin", "mekanism:combining", "mekanism:crushing", "mekanism:enriching",
      "mekanism:injecting", "mekanism:metallurgic_infusing", "mekanism:nucleosynthesizing", "mekanism:painting",
      "mekanism:sawing", "mekmm:lathe", "mekmm:stamper", "minecraft:blasting", "minecraft:campfire_cooking",
      "minecraft:crafting_shaped", "minecraft:crafting_shapeless", "minecraft:smelting",
      "minecraft:smithing_transform", "minecraft:smoking", "minecraft:stonecutting", "naturesaura:altar",
      "occultism:crushing", "occultism:crystallize", "oritech:assembler", "oritech:atomic_forge",
      "oritech:deep_drill", "oritech:foundry", "oritech:grinder", "oritech:particle_collision", "oritech:pulverizer",
      "oritech:refinery", "pneumaticcraft:assembly_drill", "pneumaticcraft:assembly_laser",
      "pneumaticcraft:pressure_chamber", "productivebees:advanced_beehive", "productivebees:bottler",
      "productivebees:centrifuge", "productivemetalworks:block_casting", "productivemetalworks:item_casting",
      "pylons:harvesting", "railcraft:coking", "railcraft:crusher", "silentgear:salvaging", "theurgy:incubation",
  ];

  it("every recipe type of the pack has an in-game label in pt and en (no humanized fallback)", () => {
    expect(U7A_RECIPE_TYPES).toHaveLength(89);
    for (const type of U7A_RECIPE_TYPES) {
      const label = recipeTypeLabel(type);
      expect(label, type).not.toBeNull();
      expect(label!.pt.trim(), type).not.toBe("");
      expect(label!.en.trim(), type).not.toBe("");
    }
    for (const type of Object.keys(RECIPE_TYPE_LABELS)) expect(U7A_RECIPE_TYPES, type).toContain(type);
    const published = new Set(Object.values(items).flatMap((i) => i.obtain.flatMap((r) => (r.kind === "craftable" ? r.recipeTypes : []))));
    for (const type of published) expect(recipeTypeLabel(type), type).not.toBeNull();
    expect(recipeLabels(["create:sequenced_assembly", "oritech:assembler", "pneumaticcraft:pressure_chamber"], "pt")).toEqual(["Montagem sequenciada", "Montadora", "Câmara de Pressão"]);
    expect(recipeLabels(["create:sequenced_assembly", "oritech:assembler", "pneumaticcraft:pressure_chamber"], "en")).toEqual(["Recipe Sequence", "Assembler", "Pressure Chamber"]);
    expect(recipeLabels(["mekanism:crushing", "railcraft:crusher", "immersiveengineering:crusher"], "pt")).toEqual(["Triturador"]);
    expect(recipeLabels(["minecraft:crafting_shaped"], "en")).toEqual(["Crafting table"]);
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
