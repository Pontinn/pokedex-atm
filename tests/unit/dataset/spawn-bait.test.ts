// spawn-bait T1.2: pesca tipada, efeitos de isca (kubejs vence), tooltip do jogo, temperos, receitas da panela,
// catalogo com os ids de isca e texturas de mod.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { createContext, type PipelineContext } from "../../../tools/dataset/src/context";
import { openSource } from "../../../tools/dataset/src/instance";
import { buildLangTable } from "../../../tools/dataset/src/lang";
import { createReportSink } from "../../../tools/dataset/src/report";
import { collectPokeRods, fishingOf, isLureOnlyCondition, lureMultiplierOf } from "../../../tools/dataset/src/species/fishing";
import { collectSpawnsBySlug } from "../../../tools/dataset/src/species/spawns";
import {
  baitTypePath,
  buildSeasoningSet,
  collectBaitEffects,
  loadSeasoningExtra,
  normalizeBaitEffects,
  renderBaitTooltip,
  SEASONING_EXTRA_FILE,
} from "../../../tools/dataset/src/items/bait";
import { parsePotIngredients, toPotRecipe } from "../../../tools/dataset/src/items/pot-recipes";
import { gatherRecipes } from "../../../tools/dataset/src/items/recipes";
import { buildCatalog } from "../../../tools/dataset/src/items/catalog";
import { publishModItemTextures } from "../../../tools/dataset/src/media/mod-item-textures";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const snapshot = path.join(repoRoot, "data-source/atm-1.3.0");
const outRoot = path.join(repoRoot, "tools/dataset/out");
const cobblemonJar = path.join(snapshot, "mods/Cobblemon-neoforge-1.7.3+1.21.1.jar");
const { reader } = openSource(snapshot, () => {});

function warnSink() {
  const codes: string[] = [];
  return { codes, report: { warn: (code: string) => codes.push(code), section: () => {}, warnings: [], sections: {} } };
}

/** lang do jogo como o pipeline le: en/pt do jar Cobblemon com o pt_br do kubejs por cima. */
function gameLang(): { pt: Map<string, string>; en: Map<string, string> } {
  const read = (f: string) => JSON.parse(readFileSync(f, "utf8").replace(/^\uFEFF/, "")) as Record<string, string>;
  const en = new Map(Object.entries(read(path.join(cobblemonJar, "assets/cobblemon/lang/en_us.json"))));
  const pt = new Map(Object.entries(read(path.join(cobblemonJar, "assets/cobblemon/lang/pt_br.json"))));
  for (const [k, v] of Object.entries(read(path.join(snapshot, "kubejs/assets/cobblemon/lang/pt_br.json")))) pt.set(k, v);
  return { pt, en };
}

// Exemplos crus da SPEC 5.3 (spawn_pool_world do allthemons e do Cobblemon, conferidos no snapshot)
const STARYU_10 = { weight: 1.84, weightMultiplier: { multiplier: 3, condition: { minLureLevel: 3 } }, condition: { minLureLevel: 1, minY: -60, maxY: 13 } };
const STARYU_4 = {
  weight: 1.84,
  condition: { minLureLevel: 1 },
  weightMultipliers: [
    { multiplier: 1.5, condition: { timeRange: "night" } },
    { multiplier: 3, condition: { minLureLevel: 3 } },
  ],
};
const STARYU_2 = { weight: 5.52, weightMultiplier: { multiplier: 1.5, condition: { timeRange: "night" } } };
const WOOPER_16 = {
  weight: 2,
  condition: { rodType: "cobblemon:love_rod" },
  weightMultipliers: [
    { multiplier: 3, condition: { minLureLevel: 2, maxLureLevel: 2 } },
    { multiplier: 5, condition: { minLureLevel: 3 } },
  ],
};
const WOOPER_17 = { weight: 20, condition: { bait: "cobblemon:love_sweet" } };

describe("fishing.ts: condicoes de pesca tipadas", () => {
  it("isLureOnlyCondition: so min, so max, ambos; misto, vazio e nao numerico = false", () => {
    expect(isLureOnlyCondition({ minLureLevel: 3 })).toBe(true);
    expect(isLureOnlyCondition({ maxLureLevel: 2 })).toBe(true);
    expect(isLureOnlyCondition({ minLureLevel: 2, maxLureLevel: 2 })).toBe(true);
    expect(isLureOnlyCondition({ minLureLevel: 2, timeRange: "night" })).toBe(false);
    expect(isLureOnlyCondition({})).toBe(false);
    expect(isLureOnlyCondition({ minLureLevel: "2" })).toBe(false);
    expect(isLureOnlyCondition(null)).toBe(false);
    expect(lureMultiplierOf({ multiplier: 3, condition: { minLureLevel: 3 } })).toEqual({ lureMin: 3, lureMax: null, multiplier: 3 });
    expect(lureMultiplierOf({ multiplier: 1.5, condition: { timeRange: "night" } })).toBeNull();
    expect(lureMultiplierOf({ condition: { minLureLevel: 3 } })).toBeNull();
  });

  it("fishingOf com os exemplos da SPEC 5.3 e null sem condicao de pesca", () => {
    const rods = new Map([["cobblemon:love_rod", "cobblemon:love_ball"]]);
    expect(fishingOf(STARYU_10, rods)).toEqual({ bait: null, rodType: null, rodBall: null, minLureLevel: 1, maxLureLevel: null, lureMultipliers: [{ lureMin: 3, lureMax: null, multiplier: 3 }] });
    expect(fishingOf(STARYU_4, rods)?.lureMultipliers).toEqual([{ lureMin: 3, lureMax: null, multiplier: 3 }]);
    expect(fishingOf(WOOPER_16, rods)).toEqual({
      bait: null,
      rodType: "cobblemon:love_rod",
      rodBall: "cobblemon:love_ball",
      minLureLevel: null,
      maxLureLevel: null,
      lureMultipliers: [
        { lureMin: 2, lureMax: 2, multiplier: 3 },
        { lureMin: 3, lureMax: null, multiplier: 5 },
      ],
    });
    expect(fishingOf(WOOPER_17, rods)?.bait).toBe("cobblemon:love_sweet");
    expect(fishingOf(STARYU_2, rods)).toBeNull();
    // vara sem arquivo de pokerod: rodBall null
    expect(fishingOf({ condition: { rodType: "cobblemon:unknown_rod" } }, rods)?.rodBall).toBeNull();
  });

  it("collectPokeRods no snapshot: love_rod -> love_ball, master_rod -> master_ball", () => {
    const rods = collectPokeRods({ reader });
    expect(rods.get("cobblemon:love_rod")).toBe("cobblemon:love_ball");
    expect(rods.get("cobblemon:master_rod")).toBe("cobblemon:master_ball");
  });

  it("extra so perde o que foi tipado (Staryu-10, Staryu-4, Staryu-2 e Wooper-16 no snapshot)", () => {
    const { report } = warnSink();
    const bySlug = collectSpawnsBySlug({ reader, report } as never);
    const find = (slug: string, id: string) => bySlug.get(slug)?.find((e) => e.id === id);
    expect(find("staryu", "allthemons:staryu-10")?.extra).toEqual({ weight: 1.84, condition: { minY: -60, maxY: 13 } });
    expect(find("staryu", "allthemons:staryu-4")?.extra).toEqual({ weight: 1.84, weightMultipliers: [{ multiplier: 1.5, condition: { timeRange: "night" } }] });
    expect(find("staryu", "allthemons:staryu-2")?.extra).toEqual({ weight: 5.52, weightMultiplier: { multiplier: 1.5, condition: { timeRange: "night" } } });
    expect(find("staryu", "allthemons:staryu-2")?.fishing).toBeNull();
    const wooper = find("wooper", "cobblemon:wooper-true-16");
    expect(wooper?.extra).toEqual({ weight: 2 });
    expect(wooper?.fishing?.rodBall).toBe("cobblemon:love_ball");
    // chave fishing antes de extra (ordem do contrato)
    const keys = Object.keys(wooper ?? {});
    expect(keys.indexOf("fishing")).toBe(keys.indexOf("extra") - 1);
  });
});

describe("bait.ts: tooltip do jogo", () => {
  const lang = gameLang();
  const render = (kind: Parameters<typeof baitTypePath>[0], subcategory: string | null, chance: number, value: number | null) =>
    renderBaitTooltip({ kind, subcategory, chance, value }, baitTypePath(kind), lang);

  it("typing (Occa, PT e EN exatos) e eggGroup (Lum)", () => {
    expect(render("typing", "fire", 1, 10)).toEqual({
      pt: "100% de probabilidade de aumentar em 10× a chance de fisgar Pokémon do Tipo Fogo",
      en: "100% - 10× Chance for Fire Types",
    });
    expect(render("eggGroup", "dragon", 1, 10).en).toBe("100% - 10× Chance for Dragon Egg Group");
  });

  it("biteTime x100, shinyReroll +1, nature/genderChance pelo lang, chance 0.05 -> 5%", () => {
    expect(render("biteTime", null, 1, 0.125).en).toBe("100% - Reduce Bite Time 12%");
    expect(render("shinyReroll", null, 1, 4).en).toBe("100% - 5× Shiny Chance");
    expect(render("shinyReroll", null, 1, 5).pt).toBe("100% de probabilidade de aumentar em 6× a chance de fisgar um Brilhante");
    expect(render("nature", "atk", 1, 0).en).toBe("100% - Attract Attack Nature");
    expect(render("genderChance", "male", 0.25, null).en).toBe("25% - Attract Male Gender");
    expect(render("haChance", null, 0.05, null).en).toBe("5% - Attract Hidden Ability");
  });

  it("template ausente = aviso W_BAIT_TOOLTIP_MISSING e o typePath como texto; PT ausente cai para EN", () => {
    const { codes, report } = warnSink();
    expect(renderBaitTooltip({ kind: "typing", subcategory: "fire", chance: 1, value: 10 }, "typing", { pt: new Map(), en: new Map() }, report)).toEqual({ pt: "typing", en: "typing" });
    expect(codes).toEqual(["W_BAIT_TOOLTIP_MISSING"]);
    const onlyEn = { pt: new Map<string, string>(), en: new Map([["cobblemon.fishing_bait_effects.friendship.tooltip", "%1$s%% - Boost Friendship +%3$s"]]) };
    expect(renderBaitTooltip({ kind: "friendship", subcategory: null, chance: 1, value: 100 }, "friendship", onlyEn)).toEqual({
      pt: "100% - Boost Friendship +100",
      en: "100% - Boost Friendship +100",
    });
  });
});

describe("bait.ts: efeitos e temperos", () => {
  it("normalizeBaitEffects: namespace removido, tipo desconhecido pulado, duplicata uma vez", () => {
    const { codes, report } = warnSink();
    const out = normalizeBaitEffects(
      [
        { type: "cobblemon:nature", subcategory: "cobblemon:atk", chance: 0.5, value: 0 },
        { type: "cobblemon:tera", subcategory: "fire", chance: 1, value: 1 },
        { type: "cobblemon:nature", subcategory: "atk", chance: 1, value: 0 },
        { type: "cobblemon:egg_group", subcategory: "water_1", chance: 1, value: 10 },
      ],
      report,
      "x:y",
    );
    expect(out).toEqual([
      { kind: "nature", subcategory: "atk", chance: 0.5, value: 0 },
      { kind: "eggGroup", subcategory: "water_1", chance: 1, value: 10 },
    ]);
    expect(codes).toEqual(["W_BAIT_EFFECT_UNKNOWN", "W_BAIT_EFFECT_DUPLICATE"]);
  });

  it("collectBaitEffects no snapshot: 80 itens (78 do jar + 3 do kubejs, 1 sobrescrito), kubejs vence", () => {
    const effects = collectBaitEffects({ reader, report: warnSink().report } as never);
    expect(effects.size).toBe(80);
    expect(effects.get("minecraft:enchanted_golden_apple")?.map((e) => [e.type, e.value])).toEqual([
      ["cobblemon:bite_time", 0.1],
      ["cobblemon:rarity_bucket", 10],
      ["cobblemon:shiny_reroll", 5],
    ]);
    expect(effects.has("allthemodium:allthemodium_apple")).toBe(true);
    expect(effects.has("allthemons:mythical_pecha_berry")).toBe(false);
    expect(effects.get("cobblemon:poke_bait")).toEqual([]);
  });

  it("buildSeasoningSet: tag bait_seasoning resolvida (bagas + 7 vanilla) + 2 allthemodium curados", () => {
    const { itemTags } = gatherRecipes({ reader, report: warnSink().report } as never);
    const seasoning = buildSeasoningSet(itemTags, loadSeasoningExtra());
    const effects = collectBaitEffects({ reader, report: warnSink().report } as never);
    const berries = [...effects.keys()].filter((id) => id.startsWith("cobblemon:") && id.endsWith("_berry"));
    expect(berries.length).toBe(70);
    for (const id of berries) expect(seasoning.has(id)).toBe(true);
    for (const id of ["apple", "sweet_berries", "golden_apple", "enchanted_golden_apple", "golden_carrot", "glistering_melon_slice", "glow_berries"]) {
      expect(seasoning.has(`minecraft:${id}`)).toBe(true);
    }
    expect(seasoning.has("allthemodium:allthemodium_apple")).toBe(true);
    expect(seasoning.has("allthemodium:allthemodium_carrot")).toBe(true);
    expect(seasoning.has("cobblemon:poke_bait")).toBe(false);
    expect(seasoning.has("allthemons:mythical_pecha_berry")).toBe(false);
  });

  it("loadSeasoningExtra: arquivo curado valido; id invalido rejeitado; ausente = vazio", () => {
    expect([...loadSeasoningExtra(SEASONING_EXTRA_FILE).keys()]).toEqual(["allthemodium:allthemodium_apple", "allthemodium:allthemodium_carrot"]);
    const dir = mkdtempSync(path.join(outRoot, "_t_seasoning-"));
    try {
      const bad = path.join(dir, "bad.json");
      writeFileSync(bad, JSON.stringify({ "Not An Id": "prova" }));
      expect(() => loadSeasoningExtra(bad)).toThrow(/temperos curados invalidos/);
      const broken = path.join(dir, "broken.json");
      writeFileSync(broken, "{");
      expect(() => loadSeasoningExtra(broken)).toThrow(/JSON invalido/);
      expect(loadSeasoningExtra(path.join(dir, "missing.json")).size).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("pot-recipes.ts: ingredientes da Panela de Fogueira", () => {
  const read = (name: string) => JSON.parse(readFileSync(path.join(cobblemonJar, `data/cobblemon/recipe/campfire_pot/${name}.json`), "utf8")) as Record<string, unknown>;

  it("shaped do Poke-Lanche: ordem da primeira ocorrencia e contagens 3/2/1/3", () => {
    expect(parsePotIngredients(read("poke_snack"))).toEqual([
      { kind: "tag", id: "c:drinks/milk", count: 3 },
      { kind: "item", id: "minecraft:honey_bottle", count: 2 },
      { kind: "item", id: "cobblemon:vivichoke", count: 1 },
      { kind: "item", id: "cobblemon:hearty_grains", count: 3 },
    ]);
  });

  it("shapeless da Pokeisca e iguais somados", () => {
    expect(parsePotIngredients(read("poke_bait"))).toEqual([
      { kind: "item", id: "minecraft:honey_bottle", count: 1 },
      { kind: "tag", id: "c:mushrooms", count: 1 },
      { kind: "item", id: "minecraft:wheat", count: 1 },
    ]);
    expect(parsePotIngredients({ ingredients: [{ item: "a:b" }, { tag: "c:d" }, { item: "a:b" }] })).toEqual([
      { kind: "item", id: "a:b", count: 2 },
      { kind: "tag", id: "c:d", count: 1 },
    ]);
  });

  it("formato desconhecido = null (lista de alternativas, simbolo sem chave, sem pattern nem ingredients)", () => {
    expect(parsePotIngredients({ ingredients: [[{ item: "a:b" }, { item: "a:c" }]] })).toBeNull();
    expect(parsePotIngredients({ pattern: ["AB"], key: { A: { item: "a:b" } } })).toBeNull();
    expect(parsePotIngredients({ pattern: [1], key: {} })).toBeNull();
    expect(parsePotIngredients({ result: { id: "a:b" } })).toBeNull();
    expect(toPotRecipe({ seasoningTag: "t:x", ingredients: [["a:b"]] })).toEqual({ seasoningTag: "t:x", ingredients: [], unparsed: true });
    expect(toPotRecipe({ ingredients: [] })).toBeNull();
  });
});

describe("catalogo e midia das iscas", () => {
  const tmp = mkdtempSync(path.join(outRoot, "_t_spawn_bait-"));
  afterAll(() => rmSync(tmp, { recursive: true, force: true }));
  const makeCtx = (sub = "out"): PipelineContext => {
    const { table } = buildLangTable([]);
    const ctx = createContext({
      reader,
      source: { root: snapshot, mode: "snapshot", pack: { name: "All the Mons", version: "1.3.0", minecraft: "1.21.1" }, cobblemonVersion: "1.7.3", sources: [] },
      lang: table,
      outDir: path.join(tmp, sub),
      cacheRoot: path.join(tmp, "cache"),
      report: createReportSink(() => ctx.currentStage),
      flags: { instance: null, skipMedia: false, offline: true, report: false, keepOld: false, only: null, out: null },
    });
    return ctx;
  };
  const NEW_IDS = [
    "allthemodium:allthemodium_apple",
    "allthemodium:allthemodium_carrot",
    "cobblemon:poke_snack",
    "minecraft:enchanted_golden_apple",
    "minecraft:glistering_melon_slice",
    "minecraft:glow_berries",
    "minecraft:golden_apple",
    "minecraft:golden_carrot",
  ];

  it("buildCatalog com baitItemIds: os 8 entram referenceOnly + viaBait; id ja referenciado nao e viaBait", () => {
    const ctx = makeCtx();
    const catalog = buildCatalog(ctx, {
      lang: ctx.lang,
      textureManifest: new Map(),
      fossilItemIds: new Set(["cobblemon:helix_fossil"]),
      gameItemName: () => null,
      baitItemIds: new Set([...NEW_IDS, "cobblemon:helix_fossil"]),
    });
    for (const id of NEW_IDS) {
      const e = catalog.find((c) => c.id === id);
      expect(e, id).toBeDefined();
      expect(e?.referenceOnly).toBe(true);
      expect(e?.viaBait).toBe(true);
    }
    expect(catalog.find((c) => c.id === "cobblemon:helix_fossil")?.viaBait).toBe(false);
    expect(buildCatalog(ctx, { lang: ctx.lang, textureManifest: new Map(), fossilItemIds: new Set() }).length).toBe(0);
  });

  it("publishModItemTextures no snapshot publica os 2 PNGs do allthemodium (bytes do jar)", async () => {
    const ctx = makeCtx();
    const res = await publishModItemTextures(ctx, [
      { namespace: "allthemodium", path: "allthemodium_apple" },
      { namespace: "allthemodium", path: "allthemodium_carrot" },
      { namespace: "allthemodium", path: "no_such_item" },
      { namespace: "othermod", path: "x" },
    ]);
    expect([...res.published]).toEqual([
      ["allthemodium:allthemodium_apple", "allthemodium/allthemodium_apple.png"],
      ["allthemodium:allthemodium_carrot", "allthemodium/allthemodium_carrot.png"],
    ]);
    expect(res.missing.map((m) => m.id)).toEqual(["allthemodium:no_such_item", "othermod:x"]);
    const published = readFileSync(path.join(ctx.outDir, "assets/items/allthemodium/allthemodium_apple.png"));
    const raw = readFileSync(path.join(snapshot, "mods/allthemodium-3.0.1_mc_1.21.1.jar/assets/allthemodium/textures/item/allthemodium_apple.png"));
    expect(Buffer.compare(published, raw)).toBe(0);
    expect(ctx.report.warnings.some((w) => w.code === "W_MOD_TEXTURE_UNRESOLVED")).toBe(true);
  });

  it("publishModItemTextures com skipMedia ou sem refs nao publica nada", async () => {
    const ctx = makeCtx("out-skip");
    ctx.flags.skipMedia = true;
    expect((await publishModItemTextures(ctx, [{ namespace: "allthemodium", path: "allthemodium_apple" }])).published.size).toBe(0);
    ctx.flags.skipMedia = false;
    expect((await publishModItemTextures(ctx, [])).published.size).toBe(0);
    mkdirSync(ctx.outDir, { recursive: true });
    expect(existsSync(path.join(ctx.outDir, "assets/items/allthemodium"))).toBe(false);
  });
});
