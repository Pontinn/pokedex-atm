// U7c (pwa-auto-update): fontes de obtencao fora de receita/loot (extra-sources.ts), com fixture por fonte e o snapshot.
import { gzipSync } from "node:zlib";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { openSource } from "../../../tools/dataset/src/instance";
import {
  bareItemId,
  collectExtraSources,
  interactionRoutes,
  parseBpShop,
  parseFtbLang,
  parseQuestRewards,
  parseRituals,
  rewardTableHex,
  structureItemIds,
  teraShardRoutes,
  worldgenBlocks,
} from "../../../tools/dataset/src/items/extra-sources";
import { parseNbt, type Nbt } from "../../../tools/dataset/src/lib/nbt";
import { parseSnbt } from "../../../tools/dataset/src/lib/snbt";

const snapshot = path.resolve(import.meta.dirname, "../../../data-source/atm-1.3.0");

describe("snbt / nbt readers", () => {
  it("parses FTB snbt: bare keys with dots, lists without commas, suffixed numbers, big longs as strings, escapes", () => {
    const v = parseSnbt(`{\n\tchapter.0A.title: "A \\"b\\""\n\tlist: [{ id: "x:y", count: 2 }\n{ id: "x:z" }]\n\tn: 1.5d\n\tbig: 299590067093682297L\n\tok: true\n\tarr: [I; 1, 2]\n}`);
    expect(v).toEqual({ "chapter.0A.title": 'A "b"', list: [{ id: "x:y", count: 2 }, { id: "x:z" }], n: 1.5, big: "299590067093682297", ok: true, arr: [1, 2] });
  });

  it("parses gzip NBT (compound, list, string, int, long)", () => {
    // raiz compound "" { blocks: [ { nbt: { Items: [ { id: "a:b" } ] } } ], n: 7 (int), l: 1 (long) }
    const str = (s: string) => [0, s.length, ...Buffer.from(s)];
    const bytes = [
      10, ...str(""),
      9, ...str("blocks"), 10, 0, 0, 0, 1,
      10, ...str("nbt"),
      9, ...str("Items"), 10, 0, 0, 0, 1,
      8, ...str("id"), ...str("a:b"), 0,
      0, // fim nbt
      0, // fim bloco
      3, ...str("n"), 0, 0, 0, 7,
      4, ...str("l"), 0, 0, 0, 0, 0, 0, 0, 1,
      0,
    ];
    const root = parseNbt(gzipSync(Buffer.from(bytes)));
    expect(root).toEqual({ blocks: [{ nbt: { Items: [{ id: "a:b" }] } }], n: 7, l: 1n });
    expect([...structureItemIds(root)]).toEqual(["a:b"]);
  });
});

describe("parseBpShop", () => {
  it("reads items[] and the defaults (load_default_items), skips commands, keeps the price", () => {
    const shop = parseBpShop({
      load_default_items: true,
      items: [{ id: "mega_stone", bp_cost: 10, item_id: "mega_showdown:mega_stone" }, { id: "cmd", bp_cost: 5, command: "give {player} x" }],
      _default_items: [{ id: "alloy", bp_cost: 5, item_id: "cobblemon:metal_alloy" }, { id: "mega_stone", bp_cost: 99, item_id: "mega_showdown:mega_stone" }],
    });
    expect([...shop]).toEqual([["cobblemon:metal_alloy", 5], ["mega_showdown:mega_stone", 10]]);
    expect(parseBpShop({ load_default_items: false, _default_items: [{ id: "a", item_id: "x:y", bp_cost: 1 }] }).size).toBe(0);
  });
});

describe("parseRituals", () => {
  it("collects itemOutputs/displayOutputs of each altar block with its id", () => {
    const js = `event.recipes.summoningrituals.altar('x:catalyst')\n  .itemOutputs(['2x a:one', "a:two[comp=1]"])\n  .id("m:r1")\nevent.recipes.summoningrituals.altar("x:c")\n  .displayOutputs(['a:egg'])\n`;
    const r = parseRituals(new Map([["kubejs/server_scripts/r.js", js]]));
    expect(r.get("a:one")).toEqual(["m:r1"]);
    expect(r.get("a:two")).toEqual(["m:r1"]);
    expect(r.get("a:egg")).toEqual(["kubejs/server_scripts/r.js:4"]);
    expect(r.has("x:catalyst")).toBe(false);
  });
});

describe("parseQuestRewards", () => {
  it("item rewards and random rewards through reward tables, titles from the FTB lang (color codes removed)", () => {
    const hex = rewardTableHex("299590067093682297");
    expect(hex).toBe("04285B94275AB879"); // = id do reward_tables/powah_orb.snbt do pack
    const chapters = new Map([
      ["c.snbt", `{ id: "C1" quests: [{ id: "A1" rewards: [{ id: "R" item: { count: 1, id: "a:item" } type: "item" }] tasks: [{ item: { id: "a:task" } type: "item" }] }\n{ id: "A2" rewards: [{ id: "R2" table_id: 299590067093682297L type: "random" }] }] }`],
    ]);
    const rewardTables = new Map([["t.snbt", `{ id: "${hex}" rewards: [{ item: { id: "a:from_table" } }] }`]]);
    const langEn = parseFtbLang(`{ chapter.C1.title: "&6Chap" quest.A1.title: "Quest \\\\& one" }`);
    const langPt = parseFtbLang(`{ chapter.C1.title: "Cap" }`);
    const q = parseQuestRewards({ chapters, rewardTables, langPt, langEn });
    expect(q.get("a:item")).toEqual([{ chapter: { pt: "Cap", en: "Chap" }, title: { pt: "Quest & one", en: "Quest & one" } }]);
    expect(q.get("a:from_table")).toEqual([{ chapter: { pt: "Cap", en: "Chap" }, title: null }]);
    expect(q.has("a:task")).toBe(false);
  });
});

describe("structureItemIds", () => {
  it("items left in containers, frames and trial spawner rewards; never NPC shops, mob equipment or the block entity type", () => {
    const root: Nbt = {
      blocks: [
        { nbt: { id: "cobblemon:display_case", Items: [{ id: "m:plate", count: 1 }] } },
        { nbt: { id: "legendarymonuments:pokemon_trial_spawner", rewards: [{ item: { id: "m:memory" } }] } },
        { nbt: { id: "minecraft:decorated_pot", item: { id: "m:pot_item" } } },
      ],
      entities: [
        { nbt: { id: "minecraft:item_frame", Item: { id: "m:framed" } } },
        { nbt: { id: "x:merchant", CobbleMerchantShop: [{ Offers: [{ Item: { id: "m:sold" } }] }], HandItems: [{ id: "m:sword" }] } },
      ],
    };
    expect([...structureItemIds(root)].sort()).toEqual(["m:framed", "m:memory", "m:plate", "m:pot_item"]);
  });
});

describe("worldgenBlocks / teraShardRoutes / interactionRoutes", () => {
  it("follows biome modifier -> placed feature -> configured feature to the placed block", () => {
    const w = worldgenBlocks({
      biomeModifiers: new Map([["m:add", { type: "neoforge:add_features", features: "m:placed" }]]),
      placed: new Map([["m:placed", { feature: "m:mush" }]]),
      configured: new Map([["m:mush", { config: { to_place: { state: { Name: "m:max_mushroom" } } } }]]),
    });
    expect([...w]).toEqual([["m:max_mushroom", ["m:mush"]]]);
  });

  it("tera shards by config key, with evidence path:key", () => {
    const t = teraShardRoutes({ teraShardDropRate: 10.0, stellarShardDropRate: 0 }, "config/mega_showdown/config.json");
    expect(t.size).toBe(18);
    expect(t.get("mega_showdown:fire_tera_shard")?.evidence).toBe("config/mega_showdown/config.json:teraShardDropRate");
    expect(t.has("mega_showdown:stellar_tera_shard")).toBe(false);
  });

  it("give_item effects of pokemon_interactions, with the species name and the held item", () => {
    const files = new Map([["data/cobblemon/pokemon_interactions/miltank.json", { interactions: [{ requirements: [{ variant: "owner_held_item", itemCondition: "minecraft:glass_bottle" }], effects: [{ variant: "give_item", item: "cobblemon:moomoo_milk" }] }] }]]);
    const r = interactionRoutes(files, (slug) => (slug === "miltank" ? { pt: "Miltank", en: "Miltank" } : null));
    expect(r.get("cobblemon:moomoo_milk")).toEqual([
      { note: { pt: "Interagir com Miltank com minecraft:glass_bottle na mão.", en: "Interact with Miltank holding minecraft:glass_bottle." }, evidence: "data/cobblemon/pokemon_interactions/miltank.json:interactions[0]" },
    ]);
  });

  it("bareItemId drops count and components", () => {
    expect(bareItemId("2x a:b[c=1]")).toBe("a:b");
    expect(bareItemId("#tag")).toBeNull();
  });
});

describe("collectExtraSources on the snapshot", () => {
  const { reader } = openSource(snapshot, () => {});
  const report = { warn: () => {}, section: () => {}, warnings: [], sections: {} };
  const x = collectExtraSources({ reader, report } as never, (slug) => (slug === "miltank" ? { pt: "Miltank", en: "Miltank" } : null));

  it("finds the routes the research proved for the items that had none", () => {
    expect(x.shop.get("cobblemon:metal_alloy")).toBe(5);
    expect(x.shop.has("mega_showdown:legend_plate")).toBe(true);
    expect(x.rituals.get("allthemons:imbued_pokemon_egg")).toEqual(["allthemons:imbued_pokemon_egg"]);
    expect(x.rituals.get("allthemons:shiny_pika_star")).toEqual(["allthemons:shiny_pika_star"]);
    expect(x.structures.get("mega_showdown:flame_plate")?.length).toBeGreaterThan(0);
    expect(x.structures.get("mega_showdown:bug_memory")?.length).toBeGreaterThan(0);
    expect(x.structures.get("mega_showdown:fairy_memory")?.length).toBeGreaterThan(0);
    expect(x.quests.get("mega_showdown:wishing_star")?.length).toBeGreaterThan(0);
    expect(x.worldgenBlocks.get("mega_showdown:max_mushroom")).toEqual(["mega_showdown:max_mushroom"]);
    expect(x.trades.has("minecraft:totem_of_undying")).toBe(true);
    expect(x.special.get("cobblemon:moomoo_milk")?.[0]?.evidence).toMatch(/pokemon_interactions\/miltank\.json/);
    expect(x.special.get("mega_showdown:water_tera_shard")?.[0]?.evidence).toBe("config/mega_showdown/config.json:teraShardDropRate");
  });

  it("proves nothing for the 19 plates/memories the research found no route for", () => {
    for (const id of ["mega_showdown:draco_plate", "mega_showdown:dark_memory", "mega_showdown:pixie_plate"]) {
      expect(x.shop.has(id) || x.structures.has(id) || x.quests.has(id) || x.rituals.has(id)).toBe(false);
    }
  });
});
