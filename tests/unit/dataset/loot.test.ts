// U7b (pwa-auto-update): loot tables de todos os namespaces -> structureLoot/fishing (resto no report).
import path from "node:path";
import { describe, expect, it } from "vitest";
import { openSource } from "../../../tools/dataset/src/instance";
import { buildLootIndex, classifyLootTable, collectLoot, lootTableItems, mobIdOfTable, parseLootModifiers } from "../../../tools/dataset/src/items/loot";

const snapshot = path.resolve(import.meta.dirname, "../../../data-source/atm-1.3.0");

const table = (...entries: unknown[]) => ({ pools: [{ rolls: 1, entries }] });
const item = (name: string) => ({ type: "minecraft:item", name });
const ref = (value: string) => ({ type: "minecraft:loot_table", value });
const tag = (name: string) => ({ type: "minecraft:tag", name, expand: true });

describe("classifyLootTable", () => {
  it("classifies by path in any namespace", () => {
    expect(classifyLootTable("legendarymonuments:chests/bell_tower_chest")).toBe("structure");
    expect(classifyLootTable("minecraft:archaeology/desert_well")).toBe("structure");
    expect(classifyLootTable("betterdungeons:zombie_dungeon/chests/common")).toBe("structure");
    expect(classifyLootTable("cobblemonextrastructures:chests/fishing")).toBe("structure");
    expect(classifyLootTable("minecraft:gameplay/fishing/treasure")).toBe("fishing");
    expect(classifyLootTable("cobblemon:fishing/pokerod")).toBe("fishing");
    expect(classifyLootTable("mega_showdown:blocks/keystone_ore")).toBe("block");
    expect(classifyLootTable("minecraft:entities/evoker")).toBe("entity");
    expect(classifyLootTable("minecraft:gameplay/piglin_bartering")).toBe("gameplay");
    expect(classifyLootTable("mega_showdown:sets/any_showdown_held_item")).toBe("subTable");
    expect(classifyLootTable("rctmod:generic/epic")).toBe("subTable");
    expect(classifyLootTable("rctmod:trainers/single/boss_giovanni_0045")).toBe("trainer");
    expect(classifyLootTable("rctmod:trainers/groups/cue_ball")).toBe("trainerGroup");
    expect(classifyLootTable("botanytrees:tree_drops/minecraft/oak")).toBe("other");
    // U7c: blocos do cobblemon viram blockDrop; o resto do cobblemon segue a regra antiga (structureLoot)
    expect(classifyLootTable("cobblemon:blocks/apricorn_black")).toBe("block");
    expect(classifyLootTable("cobblemon:ruins/common")).toBe("structure");
  });
});

describe("lootTableItems", () => {
  it("expands nested references in any namespace, tags (nested) and inline tables, without looping", () => {
    const tables = new Map<string, unknown>([
      ["legendarymonuments:chests/a", table(item("mega_showdown:red_orb"), ref("mega_showdown:sets/held"), { type: "minecraft:alternatives", children: [item("x:alt")] })],
      ["mega_showdown:sets/held", table(item("mega_showdown:soul_dew"), ref("legendarymonuments:chests/a"), tag("mega_showdown:plates"))],
      ["x:chests/inline", table({ type: "minecraft:loot_table", value: table(item("x:inline_item")) })],
    ]);
    const tags = new Map([["mega_showdown:plates", new Set(["mega_showdown:flame_plate"])]]);
    expect([...lootTableItems("legendarymonuments:chests/a", tables, tags)].sort()).toEqual([
      "mega_showdown:flame_plate",
      "mega_showdown:red_orb",
      "mega_showdown:soul_dew",
      "x:alt",
    ]);
    expect([...lootTableItems("x:chests/inline", tables, tags)]).toEqual(["x:inline_item"]);
    expect(lootTableItems("x:missing", tables, tags).size).toBe(0);
  });
});

describe("buildLootIndex", () => {
  const tables = new Map<string, unknown>([
    ["dungeons_arise:chests/aviary/barrels", table(item("minecraft:totem_of_undying"), ref("mega_showdown:sets/held"))],
    ["mega_showdown:sets/held", table(item("mega_showdown:soul_dew"))],
    ["minecraft:gameplay/fishing/fish", table(item("minecraft:cod"))],
    ["mega_showdown:blocks/keystone_ore", table(item("mega_showdown:keystone"))],
    ["mega_showdown:blocks/max_mushroom", table(item("mega_showdown:max_mushroom"))],
    ["minecraft:entities/evoker", table(item("minecraft:totem_of_undying"))],
    ["rctmod:trainers/groups/cue_ball", table(ref("rctmod:generic/epic"))],
    ["rctmod:generic/epic", table(item("cobblemon:sweet_apple"))],
    ["rctmod:trainers/single/x", table(item("allthemons:the_kitty_badge"))],
    ["cobblemon:ruins/common", table(item("cobblemon:dome_fossil"))],
    ["cobblemon:blocks/apricorn_black", table(item("cobblemon:black_apricorn"))],
    ["minecraft:entities/sheep/blue", table(item("minecraft:blue_wool"))],
    ["minecraft:entities/cow", table(item("minecraft:leather"))],
    ["artifacts:inject/entities/cow", table(item("artifacts:everlasting_beef"))],
    ["eternal_starlight:bosses/boss_common", table(item("x:shared"))],
    ["eternal_starlight:bosses/starlight_golem", table(ref("eternal_starlight:bosses/boss_common"))],
  ]);
  const modifiers = [{ modifier: "allthemons:cataclysm_red_orb", item: "mega_showdown:red_orb", tables: ["cataclysm:entities/ignis", "legendarymonuments:chests/x"] }];
  const idx = buildLootIndex(tables, new Map(), modifiers);

  it("chests of other namespaces become structureLoot with the namespaced id; sub-tables only through references", () => {
    expect([...(idx.structureLoot.get("minecraft:totem_of_undying") ?? [])]).toEqual(["dungeons_arise:chests/aviary/barrels"]);
    expect([...(idx.structureLoot.get("mega_showdown:soul_dew") ?? [])]).toEqual(["dungeons_arise:chests/aviary/barrels"]);
    expect([...(idx.structureLoot.get("cobblemon:dome_fossil") ?? [])]).toEqual(["ruins/common"]);
    expect(idx.fishing.has("minecraft:cod")).toBe(true);
  });

  it("block and entity tables become blockDrop/mobDrop by block/mob id; a block dropping itself is not a route (U7c)", () => {
    expect([...(idx.blockDrop.get("mega_showdown:keystone") ?? [])]).toEqual(["mega_showdown:keystone_ore"]);
    expect([...(idx.blockDrop.get("cobblemon:black_apricorn") ?? [])]).toEqual(["cobblemon:apricorn_black"]);
    expect(idx.structureLoot.has("cobblemon:black_apricorn")).toBe(false);
    expect(idx.blockDrop.has("mega_showdown:max_mushroom")).toBe(false);
    expect([...(idx.blockSelfDrops.get("mega_showdown:max_mushroom") ?? [])]).toEqual(["mega_showdown:blocks/max_mushroom"]);
    expect([...(idx.mobDrop.get("minecraft:totem_of_undying") ?? [])]).toEqual(["minecraft:evoker"]);
    expect([...(idx.mobDrop.get("minecraft:blue_wool") ?? [])]).toEqual(["minecraft:sheep"]);
    expect([...(idx.mobDrop.get("artifacts:everlasting_beef") ?? [])]).toEqual(["minecraft:cow"]);
    // tabela de boss referenciada por outra (boss_common) so conta pelo boss que a usa
    expect([...(idx.mobDrop.get("x:shared") ?? [])]).toEqual(["eternal_starlight:starlight_golem"]);
  });

  it("global loot modifiers add their item to the target tables (mob or chest), even when the table is not in the sources", () => {
    expect([...(idx.mobDrop.get("mega_showdown:red_orb") ?? [])]).toEqual(["cataclysm:ignis"]);
    expect([...(idx.structureLoot.get("mega_showdown:red_orb") ?? [])]).toEqual(["legendarymonuments:chests/x"]);
  });

  it("trainer group tables stay out of the routes (report only)", () => {
    expect([...(idx.pending.trainerGroup.get("cobblemon:sweet_apple") ?? [])]).toEqual(["rctmod:trainers/groups/cue_ball"]);
    expect(idx.structureLoot.has("cobblemon:sweet_apple")).toBe(false);
    expect(idx.structureLoot.has("allthemons:the_kitty_badge")).toBe(false);
    expect(idx.structureLoot.has("mega_showdown:keystone")).toBe(false);
  });
});

describe("collectLoot on the snapshot", () => {
  const { reader } = openSource(snapshot, () => {});
  const warnings: string[] = [];
  const report = { warn: (code: string) => warnings.push(code), section: () => {}, warnings: [], sections: {} };
  const loot = collectLoot({ reader, report } as never);
  const tablesOf = (id: string) => [...(loot.structureLoot.get(id) ?? [])];

  it("reads chests and archaeology of other namespaces, vanilla and nested sets", () => {
    expect(tablesOf("mega_showdown:red_orb")).toEqual(["legendarymonuments:chests/bell_tower_chest"]);
    expect(tablesOf("mega_showdown:sparkling_stone_light")).toEqual(["mega_showdown:archaeological_site/archaeological_site_rare"]);
    expect(tablesOf("cobblemon:sweet_apple")).toEqual(["mega_showdown:archaeology/observatory_sus"]);
    expect(tablesOf("minecraft:totem_of_undying")).toContain("legendarymonuments:chests/bell_tower_chest");
    expect(tablesOf("mega_showdown:soul_dew")).toContain("mega_showdown:archaeological_site/archaeological_site_chest");
    expect(tablesOf("minecraft:diamond")).toContain("minecraft:chests/buried_treasure");
    expect(warnings).not.toContain("W_LOOT_VANILLA_MISSING");
  });

  it("block drops (mega stone crystal), mob drops (evoker) and the kubejs loot modifiers (cataclysm orbs), none in structureLoot", () => {
    expect(loot.blockDrop.get("mega_showdown:mega_stone")?.has("mega_showdown:mega_stone_crystal")).toBe(true);
    expect(loot.mobDrop.get("minecraft:totem_of_undying")?.has("minecraft:evoker")).toBe(true);
    expect([...(loot.mobDrop.get("mega_showdown:red_orb") ?? [])]).toEqual(["cataclysm:ignis", "cataclysm:maledictus"]);
    expect([...(loot.mobDrop.get("mega_showdown:blue_orb") ?? [])].sort()).toEqual(["cataclysm:scylla", "cataclysm:the_leviathan"]);
    expect([...loot.structureLoot.values()].some((s) => [...s].some((t) => /:(blocks|entities)\//.test(t)))).toBe(false);
  });
});

describe("parseLootModifiers / mobIdOfTable", () => {
  const enc = (v: unknown) => new TextEncoder().encode(JSON.stringify(v));
  it("reads only the modifiers listed in global_loot_modifiers.json with addition.id and loot_table_id conditions", () => {
    const files = [
      { path: "data/neoforge/loot_modifiers/global_loot_modifiers.json", bytes: enc({ replace: false, entries: ["a:orb", "a:crop", "a:missing"] }) },
      { path: "data/a/loot_modifiers/orb.json", bytes: enc({ type: "productivelib:item_modifier", addition: { id: "x:orb" }, conditions: [{ condition: "minecraft:any_of", terms: [{ condition: "neoforge:loot_table_id", loot_table_id: "m:entities/boss" }] }] }) },
      { path: "data/a/loot_modifiers/crop.json", bytes: enc({ type: "productivelib:item_modifier", addition: { id: "x:sprig" }, conditions: [{ condition: "minecraft:block_state_property", block: "y:wheat" }] }) },
      { path: "data/a/loot_modifiers/unlisted.json", bytes: enc({ addition: { id: "x:no" }, conditions: [{ condition: "neoforge:loot_table_id", loot_table_id: "m:entities/z" }] }) },
    ];
    expect(parseLootModifiers(files)).toEqual([{ modifier: "a:orb", item: "x:orb", tables: ["m:entities/boss"] }]);
  });
  it("keeps the injection table id when the vanilla target table is unknown", () => {
    expect(mobIdOfTable("artifacts:inject/entities/cow", new Map())).toBe("artifacts:inject/entities/cow");
  });
});
