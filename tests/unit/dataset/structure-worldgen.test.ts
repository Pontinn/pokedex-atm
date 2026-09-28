// U10 (pwa-auto-update): structurePlaced so com templates que a geracao do mundo alcanca (structure_set -> structure ->
// template_pool -> template -> jigsaw -> ...), citando a estrutura dona; e a tinta dos itens vanilla tingidos em codigo.
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { openSource } from "../../../tools/dataset/src/instance";
import {
  collectExtraSources,
  itemsByStructure,
  resolveConfigConditions,
  templateJigsawPools,
  templatesByStructure,
  tomlBooleans,
} from "../../../tools/dataset/src/items/extra-sources";
import { tintPng, VANILLA_ITEM_TINTS } from "../../../tools/dataset/src/media/vanilla-textures";

const snapshot = path.resolve(import.meta.dirname, "../../../data-source/atm-1.3.0");
const single = (location: string) => ({ weight: 1, element: { element_type: "minecraft:single_pool_element", location } });

describe("templatesByStructure (fixtures)", () => {
  const sets = new Map<string, unknown>([
    ["m:main", { structures: [{ structure: "m:castle", weight: 1 }, { structure: "m:off", weight: 1 }, { structure: "m:wrapped", weight: 1 }] }],
    ["m:disabled_set", { "neoforge:conditions": [{ type: "neoforge:false" }], structures: [{ structure: "m:nosets" }] }],
  ]);
  const structures = new Map<string, unknown>([
    ["m:castle", { type: "minecraft:jigsaw", start_pool: "m:castle/start" }],
    ["m:off", { "neoforge:conditions": [{ type: "neoforge:false" }] }],
    ["m:nosets", { type: "minecraft:jigsaw", start_pool: "m:lonely" }],
    ["m:wrapped", { type: "lithostitched:delegating", delegate: { type: "minecraft:jigsaw", start_pool: "m:wrap/start" } }],
  ]);
  const pools = new Map<string, unknown>([
    ["m:castle/start", { fallback: "m:castle/fallback", elements: [single("m:castle/gate")] }],
    ["m:castle/rooms", { elements: [{ weight: 1, element: { element_type: "minecraft:list_pool_element", elements: [{ element_type: "minecraft:single_pool_element", location: "m:castle/room_a" }, { element_type: "minecraft:legacy_single_pool_element", location: "m:castle/room_b" }] } }] }],
    ["m:castle/fallback", { elements: [single("m:castle/cap")] }],
    ["m:lonely", { elements: [single("m:lonely_room")] }],
    ["m:wrap/start", { elements: [single("m:wrap/piece")] }],
    ["m:unused", { elements: [single("m:orphan")] }],
  ]);
  // o portao tem um bloco jigsaw que puxa o pool das salas
  const jigsaw = new Map<string, string[]>([["m:castle/gate", ["m:castle/rooms"]]]);
  const byTemplate = templatesByStructure({ sets, structures, pools, jigsaw });

  it("follows start_pool -> elements -> jigsaw pools -> nested list elements, and the fallback pool", () => {
    expect(byTemplate.get("m:castle/gate")).toEqual(["m:castle"]);
    expect(byTemplate.get("m:castle/room_a")).toEqual(["m:castle"]);
    expect(byTemplate.get("m:castle/room_b")).toEqual(["m:castle"]);
    expect(byTemplate.get("m:castle/cap")).toEqual(["m:castle"]);
  });

  it("finds start_pool inside a wrapping structure type (delegate)", () => {
    expect(byTemplate.get("m:wrap/piece")).toEqual(["m:wrapped"]);
  });

  it("excludes templates no structure reaches (gametest, orphan pool), disabled structures and structures without an enabled set", () => {
    expect(byTemplate.has("create:gametest/items/depot_display")).toBe(false);
    expect(byTemplate.has("m:orphan")).toBe(false);
    expect(byTemplate.has("m:lonely_room")).toBe(false);
    expect([...byTemplate.values()].flat()).not.toContain("m:off");
  });

  it("collapses item -> templates into item -> owning structures and reports unreached templates", () => {
    const itemTemplates = new Map([
      ["x:gem", ["m:castle/room_a", "m:castle/room_b", "create:gametest/items/depot_display"]],
      ["x:only_test", ["create:gametest/items/depot_display"]],
    ]);
    const { structures: out, unreachedTemplates } = itemsByStructure(itemTemplates, byTemplate);
    expect(out.get("x:gem")).toEqual(["m:castle"]);
    expect(out.has("x:only_test")).toBe(false);
    expect(unreachedTemplates).toEqual(["create:gametest/items/depot_display"]);
  });

  it("reads jigsaw pools from template NBT blocks", () => {
    const root = { blocks: [{ nbt: { id: "minecraft:jigsaw", pool: "m:b" } }, { nbt: { pool: "m:a" } }, { nbt: { Items: [] } }, { state: 0 }] };
    expect(templateJigsawPools(root as never)).toEqual(["m:a", "m:b"]);
  });

  it("resolves ars_additions:config conditions from the mod config", () => {
    const flags = tomlBooleans("[structures]\r\n\t#comment\r\n\tarcane_library_enabled = true\r\n\tnexus_tower_enabled = false\r\n");
    expect(flags).toEqual(new Map([["arcane_library_enabled", true], ["nexus_tower_enabled", false]]));
    expect(resolveConfigConditions([{ type: "ars_additions:config", config: "arcane_library_enabled" }], flags)).toEqual([{ type: "neoforge:true" }]);
    expect(resolveConfigConditions([{ type: "ars_additions:config", config: "nexus_tower_enabled" }], flags)).toEqual([{ type: "neoforge:false" }]);
    expect(resolveConfigConditions([{ type: "ars_additions:config", config: "missing" }], flags)).toEqual([{ type: "ars_additions:config", config: "missing" }]);
  });
});

describe("structurePlaced on the snapshot (U10)", () => {
  const { reader } = openSource(snapshot, () => {});
  const report = { warn: () => {}, section: () => {}, warnings: [], sections: {} };
  const x = collectExtraSources({ reader, report } as never, () => null);
  const all = [...x.structures.values()].flat();

  it("cites structures, never gametest or raw template pieces", () => {
    expect(all.filter((id) => id.includes("gametest"))).toEqual([]);
    expect(x.structures.get("mega_showdown:flame_plate")).toEqual(["legendarymonuments:traditional_village/ecruteak"]);
    expect(x.structures.get("mega_showdown:max_mushroom")).toEqual(["legendarymonuments:hoopa_pyramid"]);
    expect(new Set(all).has("allthemons:bee_gym_102")).toBe(false);
    expect(new Set(all).has("allthemons:bee_gym")).toBe(true);
  });

  it("drops the gyms the kubejs disables and reports the unreached templates", () => {
    expect(x.structures.has("cobblemon:life_orb")).toBe(false);
    const unreached = x.structureTemplatesUnreached.map((u) => u.template);
    expect(unreached).toContain("rgs:blackthorn_gym");
    expect(unreached).toContain("create:gametest/items/depot_display");
    expect(x.structures.get("minecraft:diamond") ?? []).not.toContain("create:gametest/items/arm_purgatory");
  });

  it("keeps the arcane library (ars_additions config says enabled)", () => {
    expect(new Set(all).has("ars_additions:arcane_library")).toBe(true);
  });
});

describe("vanilla item tint (U10)", () => {
  it("uses the 1.21.1 no-world colors: vine = foliage default, lily pad = 0x71C35C", () => {
    expect(VANILLA_ITEM_TINTS).toEqual({ vine: 0x48b518, lily_pad: 0x71c35c });
  });

  it("multiplies RGB by the tint and keeps alpha", async () => {
    const src = await sharp(Buffer.from([255, 255, 255, 255, 128, 128, 128, 100, 0, 0, 0, 0]), { raw: { width: 3, height: 1, channels: 4 } })
      .png()
      .toBuffer();
    const out = await tintPng(new Uint8Array(src), 0x48b518);
    const { data } = await sharp(out).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    expect([...data]).toEqual([0x48, 0xb5, 0x18, 255, 36, 91, 12, 100, 0, 0, 0, 0]);
  });
});
