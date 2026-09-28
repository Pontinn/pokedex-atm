// U8 (pwa-auto-update): nomes do jogo para refs (bloco, mob, estrutura) e itens sem lang do app, e textura vanilla
// dos itens minecraft pelo modelo do item. Fixtures em memoria e em pasta temporaria.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { interactionRoutes, structureRefs } from "../../../tools/dataset/src/items/extra-sources";
import {
  buildNameLang,
  createNameResolver,
  itemName,
  readJarLangFiles,
  refLangKey,
  vanillaPtBrPath,
} from "../../../tools/dataset/src/items/ref-names";
import { namedRefs } from "../../../tools/dataset/src/items/stage";
import { chooseVanillaTexture, type ReadVanilla } from "../../../tools/dataset/src/media/vanilla-textures";

const tmp = mkdtempSync(path.join(tmpdir(), "u8-ref-names-"));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

const write = (rel: string, content: string) => {
  const full = path.join(tmp, ...rel.split("/"));
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, content);
};

const appLang = {
  en: new Map([["entity.cobblemon.pokemon", "Pokemon"]]),
  // pt so no kubejs (D6): vence o pt do jar; en do jar continua
  pt: new Map([
    ["entity.cobblemon.pokemon", "Pokémon"],
    ["entity.cataclysm.ignis", "Ignis (kubejs)"],
  ]),
};

const names = buildNameLang([
  { origin: "a.jar", lang: "en_us", entries: { "entity.cataclysm.ignis": "Ignis", "block.x.ore": "Ore A", "item.minecraft.glass_bottle": "Glass Bottle" } },
  { origin: "b.jar", lang: "en_us", entries: { "block.x.ore": "Ore B", "block.minecraft.dirt": "Dirt" } },
  { origin: "b.jar", lang: "pt_br", entries: { "entity.cataclysm.ignis": "Ignis (jar)", "block.x.pt_only": "So PT" } },
  { origin: "vanilla", lang: "pt_br", entries: { "item.minecraft.glass_bottle": "Frasco de Vidro", "block.minecraft.dirt": "Terra" } },
  { origin: "vanilla", lang: "en_us", entries: { "block.minecraft.dirt": "Dirt (vanilla)", "structure.m.tower": "Tower" } },
]);
const resolve = createNameResolver(appLang, names);

describe("name lang (U8)", () => {
  it("first layer with the key wins (jars in file-name order, then vanilla)", () => {
    expect(names.en.get("block.x.ore")).toBe("Ore A");
    expect(names.en.get("block.minecraft.dirt")).toBe("Dirt");
  });

  it("app lang (with kubejs on top) wins over jars; en required; pt falls back to en; pt-only = null (D6)", () => {
    expect(resolve("entity.cataclysm.ignis")).toEqual({ pt: "Ignis (kubejs)", en: "Ignis" });
    expect(resolve("entity.cobblemon.pokemon")).toEqual({ pt: "Pokémon", en: "Pokemon" });
    expect(resolve("block.x.ore")).toEqual({ pt: "Ore A", en: "Ore A" });
    expect(resolve("block.x.pt_only")).toBeNull();
    expect(resolve("block.x.nothing")).toBeNull();
  });

  it("ref keys replace / with . and item names fall back to the block key", () => {
    expect(refLangKey("entity", "minecraft:sheep")).toBe("entity.minecraft.sheep");
    expect(refLangKey("structure", "a:rooms/armoury_md")).toBe("structure.a.rooms.armoury_md");
    expect(itemName(resolve, "minecraft:glass_bottle")).toEqual({ pt: "Frasco de Vidro", en: "Glass Bottle" });
    expect(itemName(resolve, "minecraft:dirt")).toEqual({ pt: "Terra", en: "Dirt" });
    expect(itemName(resolve, "minecraft:unknown")).toBeNull();
  });

  it("namedRefs and structureRefs fill names from the resolver, null when the game has no key", () => {
    expect(namedRefs(["x:ore", "x:missing", "x:ore"], "block", resolve)).toEqual([
      { id: "x:missing", name: null },
      { id: "x:ore", name: { pt: "Ore A", en: "Ore A" } },
    ]);
    expect(structureRefs(["m:tower", "m:hut"], (id) => resolve(refLangKey("structure", id)))).toEqual([
      { id: "m:hut", name: null },
      { id: "m:tower", name: { pt: "Tower", en: "Tower" } },
    ]);
    expect(structureRefs(["m:tower"])).toEqual([{ id: "m:tower", name: null }]);
  });

  it("interaction notes name the held item instead of the raw id; unknown ids stay as written", () => {
    const files = new Map([
      [
        "data/cobblemon/pokemon_interactions/miltank.json",
        { interactions: [{ requirements: [{ variant: "owner_held_item", itemCondition: "minecraft:glass_bottle" }], effects: [{ variant: "give_item", item: "cobblemon:moomoo_milk" }] }] },
      ],
      [
        "data/cobblemon/pokemon_interactions/other.json",
        { interactions: [{ requirements: [{ variant: "owner_held_item", itemCondition: "m:unknown" }], effects: [{ variant: "give_item", item: "m:thing" }] }] },
      ],
    ]);
    const species = (slug: string) => ({ pt: slug, en: slug });
    const r = interactionRoutes(files, species, (id) => itemName(resolve, id));
    expect(r.get("cobblemon:moomoo_milk")?.[0]?.note).toEqual({ pt: "Interagir com miltank com Frasco de Vidro na mão.", en: "Interact with miltank holding Glass Bottle." });
    expect(r.get("m:thing")?.[0]?.note).toEqual({ pt: "Interagir com other com m:unknown na mão.", en: "Interact with other holding m:unknown." });
  });

  it("reads assets/<ns>/lang/{en_us,pt_br}.json of an opened jar folder, sorted", () => {
    write("jar/assets/b/lang/en_us.json", "{}");
    write("jar/assets/a/lang/pt_br.json", "{}");
    write("jar/assets/a/lang/de_de.json", "{}");
    expect(readJarLangFiles(path.join(tmp, "jar")).map((f) => f.path)).toEqual(["assets/a/lang/pt_br.json", "assets/b/lang/en_us.json"]);
  });

  it("vanilla pt_br: snapshot path, and the launcher asset store via the version's asset index on the real instance", () => {
    expect(vanillaPtBrPath(path.join(tmp, "snap"), "snapshot")).toBe(path.join(tmp, "snap", "vanilla", "assets", "minecraft", "lang", "pt_br.json"));
    write("mc/Install/versions/1.21.1/1.21.1.json", JSON.stringify({ assetIndex: { id: "17" } }));
    write("mc/Install/assets/indexes/17.json", JSON.stringify({ objects: { "minecraft/lang/pt_br.json": { hash: "2fc38389ff" } } }));
    const root = path.join(tmp, "mc", "Instances", "Pack");
    expect(vanillaPtBrPath(root, "instance")).toBe(path.join(tmp, "mc", "Install", "assets", "objects", "2f", "2fc38389ff"));
    expect(vanillaPtBrPath(path.join(tmp, "none", "a", "b"), "instance")).toBeNull();
  });
});

describe("vanilla item texture by the item model (U8)", () => {
  const files: Record<string, unknown> = {
    "assets/minecraft/models/item/apple.json": { parent: "minecraft:item/generated", textures: { layer0: "minecraft:item/apple" } },
    "assets/minecraft/models/item/poppy.json": { parent: "minecraft:item/generated", textures: { layer0: "minecraft:block/poppy" } },
    "assets/minecraft/models/item/bone.json": { parent: "item/handheld", textures: { layer0: "item/bone" } },
    "assets/minecraft/models/item/dirt.json": { parent: "minecraft:block/dirt" },
    "assets/minecraft/models/block/dirt.json": { parent: "minecraft:block/cube_all", textures: { all: "minecraft:block/dirt" } },
    "assets/minecraft/models/item/basalt.json": { parent: "minecraft:block/basalt" },
    "assets/minecraft/models/block/basalt.json": { parent: "minecraft:block/cube_column", textures: { end: "minecraft:block/basalt_top", side: "minecraft:block/basalt_side" } },
    "assets/minecraft/models/item/jack_o_lantern.json": { parent: "minecraft:block/jack_o_lantern" },
    "assets/minecraft/models/block/jack_o_lantern.json": { textures: { front: "minecraft:block/jack_o_lantern", side: "minecraft:block/pumpkin_side" } },
    "assets/minecraft/models/item/odd.json": { parent: "minecraft:block/odd" },
    "assets/minecraft/models/block/odd.json": { textures: { top: "minecraft:block/odd_top" } },
    "assets/minecraft/models/item/shield.json": { parent: "builtin/entity" },
  };
  const read: ReadVanilla = (rel) => (rel in files ? new TextEncoder().encode(JSON.stringify(files[rel])) : null);

  it("uses layer0 for flat items (item/ or block/ texture)", () => {
    expect(chooseVanillaTexture(read, "apple")).toEqual({ texture: "item/apple", via: "layer0" });
    expect(chooseVanillaTexture(read, "poppy")).toEqual({ texture: "block/poppy", via: "layer0" });
    expect(chooseVanillaTexture(read, "bone")).toEqual({ texture: "item/bone", via: "layer0" });
  });

  it("block items take one face of the block model: all, then front, then side", () => {
    expect(chooseVanillaTexture(read, "dirt")).toMatchObject({ texture: "block/dirt", via: "blockFace", face: "all" });
    expect(chooseVanillaTexture(read, "basalt")).toMatchObject({ texture: "block/basalt_side", face: "side" });
    expect(chooseVanillaTexture(read, "jack_o_lantern")).toMatchObject({ texture: "block/jack_o_lantern", face: "front" });
  });

  it("anything else has no texture, with the reason", () => {
    expect(chooseVanillaTexture(read, "odd")).toEqual({ texture: null, reason: "modelo de bloco sem face all/front/side (block/odd)" });
    expect(chooseVanillaTexture(read, "shield").texture).toBeNull();
    expect(chooseVanillaTexture(read, "missing")).toEqual({ texture: null, reason: "sem modelo de item" });
  });
});
