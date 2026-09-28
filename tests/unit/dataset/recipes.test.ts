// U7a (pwa-auto-update): receitas de todos os namespaces, tipos customizados, neoforge:conditions e
// remocoes/adicoes do kubejs.
import path from "node:path";
import { describe, expect, it } from "vitest";
import { openSource } from "../../../tools/dataset/src/instance";
import {
  buildRecipeIndex,
  collectRecipes,
  evalConditions,
  parseKubejsAdditions,
  parseKubejsRemovals,
  recipeOutputs,
  removalMatches,
  resolveItemTags,
  type RecipeFile,
} from "../../../tools/dataset/src/items/recipes";

const snapshot = path.resolve(import.meta.dirname, "../../../data-source/atm-1.3.0");
const enc = new TextEncoder();
const file = (source: string, p: string, data: unknown): RecipeFile => ({ source, path: p, bytes: enc.encode(JSON.stringify(data)) });

describe("recipeOutputs (custom recipe types)", () => {
  it("reads result-like keys of any type and skips inputs and intermediate steps", () => {
    expect(recipeOutputs({ type: "minecraft:crafting_shaped", key: { A: { item: "x:in" } }, result: { id: "mega_showdown:red_orb", count: 1 } })).toEqual([
      "mega_showdown:red_orb",
    ]);
    // create:sequenced_assembly: results valem, sequence/transitional_item nao
    expect(
      recipeOutputs({
        type: "create:sequenced_assembly",
        ingredient: { item: "x:base" },
        transitional_item: { id: "x:incomplete" },
        sequence: [{ type: "create:deploying", results: [{ id: "x:incomplete" }] }],
        results: [{ id: "cobblemon:poke_ball", chance: 120 }, { id: "x:scrap", chance: 8 }],
      }),
    ).toEqual(["cobblemon:poke_ball", "x:scrap"]);
    // mekanism output {id}, productivebees results[].item.item, botanypots drops[].output
    expect(recipeOutputs({ type: "mekanism:sawing", input: { item: "a:b" }, main_output: { id: "allthemons:bits", count: 2 } })).toEqual(["allthemons:bits"]);
    expect(recipeOutputs({ type: "productivebees:advanced_beehive", ingredient: "productivebees:terabeegos", results: [{ chance: 0.05, item: { item: "mega_showdown:stellar_tera_shard" } }] })).toEqual([
      "mega_showdown:stellar_tera_shard",
    ]);
    expect(recipeOutputs({ type: "botanypots:crop", seed: { item: "a:seed" }, drops: [{ chance: 1, output: { id: "allthemons:apricorn" } }] })).toEqual(["allthemons:apricorn"]);
    // tag como saida nao vira item; receita sem saida = []
    expect(recipeOutputs({ type: "x:y", result: "#c:gems" })).toEqual([]);
    expect(recipeOutputs({ type: "minecraft:crafting_special_bannerduplicate" })).toEqual([]);
  });
});

describe("evalConditions", () => {
  const mods = new Set(["minecraft", "neoforge", "mega_showdown", "create"]);
  it("drops recipes whose neoforge:mod_loaded names an absent mod, including inside not/and/or", () => {
    expect(evalConditions(undefined, mods)).toBe("ok");
    expect(evalConditions([{ type: "neoforge:mod_loaded", modid: "create" }], mods)).toBe("ok");
    expect(evalConditions([{ type: "neoforge:mod_loaded", modid: "tconstruct" }], mods)).toBe("absentMod");
    expect(evalConditions([{ type: "neoforge:not", value: { type: "neoforge:mod_loaded", modid: "create" } }], mods)).toBe("absentMod");
    expect(
      evalConditions([{ type: "neoforge:or", values: [{ type: "neoforge:mod_loaded", modid: "energizedpower" }, { type: "neoforge:mod_loaded", modid: "create" }] }], mods),
    ).toBe("ok");
  });
  it("marks conditions that the files cannot prove as unknown, and proves bee_exists from bee definitions", () => {
    expect(evalConditions([{ type: "supplementaries:flag", flag: "x" }], mods)).toBe("unknown");
    expect(evalConditions([{ type: "productivebees:bee_exists", bee: "productivebees:terabeegos" }], mods)).toBe("unknown");
    expect(evalConditions([{ type: "productivebees:bee_exists", bee: "productivebees:terabeegos" }], mods, { bees: new Set(["productivebees:terabeegos"]) })).toBe("ok");
  });
});

describe("buildRecipeIndex", () => {
  const mods = new Set(["minecraft", "mega_showdown"]);
  it("reads every namespace (singular recipe/ only), keys by recipe id and lets the later source override the same id", () => {
    const { recipes, overridden } = buildRecipeIndex(
      [
        file("vanilla", "data/minecraft/recipe/clock.json", { type: "minecraft:crafting_shaped", result: { id: "minecraft:clock" } }),
        file("mega_showdown.jar", "data/mega_showdown/recipe/red_orb.json", { type: "minecraft:crafting_shaped", result: { id: "mega_showdown:red_orb" } }),
        file("other.jar", "data/minecraft/recipe/clock.json", { type: "create:pressing", results: [{ id: "minecraft:clock" }] }),
        file("t.jar", "data/titanium/recipes/test_serializer/x.json", { type: "titanium:test_serializer", result: { id: "minecraft:diamond" } }),
        file("x.jar", "data/x/recipe/legacy.json", {
          type: "minecraft:crafting_shapeless",
          result: { id: "mega_showdown:blue_orb" },
          "neoforge:conditions": [{ type: "neoforge:mod_loaded", modid: "tconstruct" }],
        }),
      ],
      mods,
    );
    expect(overridden).toBe(1);
    expect(recipes.get("mega_showdown:red_orb")).toMatchObject({ type: "minecraft:crafting_shaped", outputs: ["mega_showdown:red_orb"], status: "ok" });
    expect(recipes.get("minecraft:clock")).toMatchObject({ type: "create:pressing", source: "other.jar" });
    expect(recipes.get("x:legacy")).toMatchObject({ status: "absentMod" });
    // pasta plural recipes/ (formato 1.20) nao carrega no 1.21
    expect([...recipes.keys()].some((id) => id.startsWith("titanium:"))).toBe(false);
  });
});

describe("kubejs removals and additions", () => {
  const script = `
ServerEvents.recipes(allthemods => {
    allthemods.remove({type: "minecraft:crafting_shaped", output: "#cobblemon:poke_balls"})
    // allthemods.remove({id: 'cobblemon:should_not_apply'})
    allthemods.remove("legendarymonuments:gs_ball_craft")
    allthemods.remove([{ id: 'a:one' }, { id: /mekmm:.*planting.*/ }])
    allthemods.remove({id: \`powah:energizing/\${id}\`})
    allthemods.shapeless('cobblemon:syrupy_apple', ['cobblemon:sweet_apple', '#c:maple_syrup'])
    allthemods.shaped(Item.of('minecraft:sculk', 1), ['OOO'], { O: 'minecraft:echo_shard' })
    allthemods.custom({ "type": "oritech:assembler", "ingredients": [Ingredient.of('a:b').toJson()], "results": [{ "count": 1, "id": "mega_showdown:zygarde_cube" }], "time": 120 }).id('mega_showdown:zygarde_cube')
})`;
  const scripts = new Map([["mods/Cobblemon/Recipes.js", script]]);

  it("parses literal removals (by tag+type, by id string, lists, regex) and lists dynamic ones", () => {
    const { filters, unparsed } = parseKubejsRemovals(scripts);
    expect(filters.map((f) => ({ ...f, id: f.id instanceof RegExp ? String(f.id) : f.id }))).toEqual([
      { type: "minecraft:crafting_shaped", output: "#cobblemon:poke_balls", where: "mods/Cobblemon/Recipes.js:3" },
      { id: "legendarymonuments:gs_ball_craft", where: "mods/Cobblemon/Recipes.js:5" },
      { id: "a:one", where: "mods/Cobblemon/Recipes.js:6" },
      { id: "/mekmm:.*planting.*/", where: "mods/Cobblemon/Recipes.js:6" },
    ]);
    expect(unparsed).toEqual([{ where: "mods/Cobblemon/Recipes.js:7", text: "{id: `powah:energizing/${id}`}" }]);
  });

  it("removes by output tag (nested tags resolved) only for the matching type, and by id", () => {
    const tags = resolveItemTags([
      { path: "data/cobblemon/tags/item/poke_balls.json", bytes: enc.encode(JSON.stringify({ values: ["cobblemon:poke_ball", "#cobblemon:ancient_balls"] })) },
      { path: "data/cobblemon/tags/item/ancient_balls.json", bytes: enc.encode(JSON.stringify({ values: [{ id: "cobblemon:ancient_poke_ball", required: false }] })) },
    ]);
    const { filters } = parseKubejsRemovals(scripts);
    const removed = (r: { id: string; type: string; outputs: string[] }) => filters.some((f) => removalMatches(f, r, tags));
    expect(removed({ id: "cobblemon:ancient_poke_ball", type: "minecraft:crafting_shaped", outputs: ["cobblemon:ancient_poke_ball"] })).toBe(true);
    expect(removed({ id: "allthemons:x", type: "create:sequenced_assembly", outputs: ["cobblemon:poke_ball"] })).toBe(false);
    expect(removed({ id: "legendarymonuments:gs_ball_craft", type: "minecraft:crafting_shaped", outputs: ["cobblemon:gs_ball"] })).toBe(true);
    expect(removed({ id: "mekmm:planting/bamboo", type: "mekmm:planting", outputs: ["minecraft:bamboo"] })).toBe(true);
    expect(removed({ id: "cobblemon:should_not_apply", type: "x:y", outputs: [] })).toBe(false);
  });

  it("reads recipes added by scripts with a literal output", () => {
    const { recipes } = parseKubejsAdditions(scripts);
    expect(recipes.map(({ type, outputs, id }) => ({ type, outputs, id }))).toEqual([
      { type: "minecraft:crafting_shapeless", outputs: ["cobblemon:syrupy_apple"], id: "kubejs:script/mods/Cobblemon/Recipes.js:8" },
      { type: "minecraft:crafting_shaped", outputs: ["minecraft:sculk"], id: "kubejs:script/mods/Cobblemon/Recipes.js:9" },
      { type: "oritech:assembler", outputs: ["mega_showdown:zygarde_cube"], id: "mega_showdown:zygarde_cube" },
    ]);
  });
});

describe("collectRecipes on the snapshot", () => {
  const { reader } = openSource(snapshot, () => {});
  const warnings: string[] = [];
  const report = { warn: (code: string) => warnings.push(code), section: () => {}, warnings: [], sections: {} };
  const { craftable, removed } = collectRecipes({ reader, report } as never);

  it("applies the kubejs removal of shaped poke ball crafting and keeps the other routes", () => {
    expect(craftable.get("cobblemon:poke_ball")?.has("minecraft:crafting_shaped")).toBe(false);
    expect(craftable.get("cobblemon:poke_ball")?.size).toBeGreaterThan(0);
    expect(removed.some((r) => r.id === "legendarymonuments:gs_ball_craft")).toBe(true);
  });

  it("covers other namespaces, custom types and vanilla", () => {
    expect(craftable.get("zamega:baxcalibrite")?.has("minecraft:crafting_shaped")).toBe(true);
    expect(craftable.get("allthemons:allthemodium_apricorn_bits")).toEqual(new Set(["create:cutting", "mekanism:sawing", "oritech:atomic_forge", "pneumaticcraft:assembly_drill"]));
    expect(craftable.get("mega_showdown:stellar_tera_shard")?.has("productivebees:advanced_beehive")).toBe(true);
    expect(craftable.get("minecraft:clock")?.has("minecraft:crafting_shaped")).toBe(true);
    expect(craftable.get("mega_showdown:zygarde_cube")?.has("oritech:assembler")).toBe(true);
    expect(warnings).not.toContain("W_RECIPE_VANILLA_MISSING");
  });
});
