// Onda 2 (Juncao): B3.3 (sprites + artwork ids), B4.1 (catalogo de itens), B4.2 (rotas de obtencao do
// item e "Usado em"), B2.5 (indice, fichas, tabela de tipos, biomas; PRIMEIRA execucao completa do
// pipeline COM publicacao). Roda o pipeline real (--offline) sobre o snapshot data-source/atm-1.3.0:
// como B3.3 e artwork-ids ja rodaram de verdade contra a rede antes deste commit (ver HANDOFF_join.md),
// o cache em tools/dataset/.cache/{pokeapi,sprites}/ ja esta quente e --offline garante 0 chamadas de
// rede aqui (regra do ambiente: testes unitarios nunca tocam rede).
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runPipeline } from "../../../tools/dataset/src/index";
import { sha256Hex } from "../../../tools/dataset/src/lib/hash";
import {
  speciesDetailSchema,
  speciesIndexSchema,
  datasetManifestSchema,
  typeChartSchema,
  biomeLabelsSchema,
  itemsFileSchema,
} from "../../../src/data/schemas";
import type {
  CurrentDatasetPointer,
  DatasetManifest,
  ItemsFile,
  SpeciesDetail,
  SpeciesIndexFile,
} from "../../../src/data/types";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const OUT_DIR = "tools/dataset/out/_join_test";
// Higiene: o teste NUNCA publica em public/ (o dev server e o dataset versionado vivem la). A publicacao
// vai para esta pasta temporaria (tools/dataset/out/ e gitignored) e as assercoes leem dela.
const PUBLISH_DIR = "tools/dataset/out/_publish_test";
const PUB_DATA = `${PUBLISH_DIR}/data`;
const PUB_ASSETS = `${PUBLISH_DIR}/assets`;
// Pipeline real offline (1027 especies + midia) com I/O sincrono pesado: folga ampla para maquina carregada.
const PIPELINE_TIMEOUT_MS = 600_000;

function readJson<T>(...parts: string[]): T {
  return JSON.parse(readFileSync(path.join(REPO_ROOT, ...parts), "utf8")) as T;
}

function readTextIfExists(relPath: string): string | null {
  const abs = path.join(REPO_ROOT, relPath);
  return existsSync(abs) ? readFileSync(abs, "utf8") : null;
}

let datasetVersion: string;
let index: SpeciesIndexFile;
let manifest: DatasetManifest;
let items: ItemsFile;
let publicPointerBefore: string | null;

beforeAll(async () => {
  publicPointerBefore = readTextIfExists("public/data/current.json");
  rmSync(path.join(REPO_ROOT, PUBLISH_DIR), { recursive: true, force: true });
  await runPipeline(["--offline", "--out", OUT_DIR, "--publish-dir", PUBLISH_DIR, "--report"]);
  const pointer = readJson<CurrentDatasetPointer>(PUB_DATA, "current.json");
  datasetVersion = pointer.datasetVersion;
  index = readJson<SpeciesIndexFile>(PUB_DATA, datasetVersion, "species-index.json");
  manifest = readJson<DatasetManifest>(PUB_DATA, datasetVersion, "dataset-manifest.json");
  items = readJson<ItemsFile>(PUB_DATA, datasetVersion, "items.json");
}, PIPELINE_TIMEOUT_MS);

afterAll(() => {
  rmSync(path.join(REPO_ROOT, PUBLISH_DIR), { recursive: true, force: true });
}, 120_000);

function speciesFile(dex: number): SpeciesDetail {
  return readJson<SpeciesDetail>(PUB_DATA, datasetVersion, "species", `${dex}.json`);
}

describe("test hygiene", () => {
  it("the pipeline run publishes into the temp dir and leaves public/data/current.json untouched", () => {
    expect(existsSync(path.join(REPO_ROOT, PUB_DATA, "current.json"))).toBe(true);
    expect(readTextIfExists("public/data/current.json")).toBe(publicPointerBefore);
  });
});

describe("full pipeline run with publication (B2.5)", () => {
  it("publishes a dataset version and species-index.json with 1027 entries", () => {
    expect(datasetVersion).toMatch(/^atm1\.3\.0-cobblemon1\.7\.3-\d{8}-[0-9a-f]{8}$/);
    expect(index).toHaveLength(1027);
  });

  it("Quagsire searchKey contains 'pantano'", () => {
    const quagsire = index.find((s) => s.slug === "quagsire");
    expect(quagsire?.searchKey).toContain("pantano");
  });

  it("speciesDetailSchema validates 100% of species/*.json", () => {
    for (const summary of index) {
      const detail = speciesFile(summary.dex);
      const check = speciesDetailSchema.safeParse(detail);
      expect(check.success, `species/${summary.dex}.json: ${check.success ? "" : check.error?.message}`).toBe(true);
    }
  });

  it("species-index.json validates against speciesIndexSchema", () => {
    expect(speciesIndexSchema.safeParse(index).success).toBe(true);
  });

  it("dataset-manifest.json validates and stays within the media budget", () => {
    expect(datasetManifestSchema.safeParse(manifest).success).toBe(true);
    expect(manifest.counts.species).toBe(1027);
    expect(manifest.media.totalBytes).toBeLessThanOrEqual(26 * 1024 * 1024);
    expect(manifest.media.totalBytes).toBeGreaterThan(0);
  });

  it("type-chart.json and biomes.json validate against their schemas", () => {
    const typeChart = readJson(PUB_DATA, datasetVersion, "type-chart.json");
    expect(typeChartSchema.safeParse(typeChart).success).toBe(true);
    const biomes = readJson(PUB_DATA, datasetVersion, "biomes.json");
    expect(biomeLabelsSchema.safeParse(biomes).success).toBe(true);
  });

  it("published assets exist (sprites, cries, sfx, item textures)", () => {
    expect(existsSync(path.join(REPO_ROOT, PUB_ASSETS, "sprites/6.png"))).toBe(true);
    expect(existsSync(path.join(REPO_ROOT, PUB_ASSETS, "cries"))).toBe(true);
    expect(existsSync(path.join(REPO_ROOT, PUB_ASSETS, "sfx"))).toBe(true);
    expect(existsSync(path.join(REPO_ROOT, PUB_ASSETS, "items"))).toBe(true);
  });
});

describe("sprites and artwork ids (B3.3)", () => {
  it("downloads 1025 sprites (dex 1..1025) and registers the count", () => {
    expect(manifest.counts.sprites).toBe(1025);
    expect(existsSync(path.join(REPO_ROOT, PUB_ASSETS, "sprites/1.png"))).toBe(true);
    expect(existsSync(path.join(REPO_ROOT, PUB_ASSETS, "sprites/1025.png"))).toBe(true);
  });

  it("Charizard Mega-X artworkId === 10034", () => {
    const charizard = speciesFile(6);
    const megaX = charizard.forms.find((f) => f.name === "Mega-X");
    expect(megaX?.artworkId).toBe(10034);
  });
});

describe("item catalog with categories, tags and textures (B4.1)", () => {
  it("items.json has at least 932 entries and validates against itemsFileSchema", () => {
    expect(Object.keys(items).length).toBeGreaterThanOrEqual(932);
    expect(itemsFileSchema.safeParse(items).success).toBe(true);
  });

  it("allthemons:the_kitty_badge is a trainer drop of Satherov, linked to the atm_team trainers file (U5a)", () => {
    const route = (items["allthemons:the_kitty_badge"]?.obtain as { kind: string; trainers?: unknown[] }[]).find((r) => r.kind === "trainerDrop");
    expect(route?.trainers).toEqual([
      { id: "team_allthemods_satherov", name: "Satherov", series: "atm_team", chance: 1, levelRange: { min: 90, max: 100 }, firstDefeatOnly: false },
    ]);
    const atm = readJson<{ trainers: { id: string }[] }>(PUB_DATA, datasetVersion, "trainers/atm_team.json");
    expect(atm.trainers.some((t) => t.id === "team_allthemods_satherov")).toBe(true);
  });

  it("every item shows how to get it: zero `none`, `unobtainable` only as the single route, phantom ids out (U7d)", () => {
    const all = Object.values(items);
    expect(all.filter((it) => it.obtain.length === 0 || it.obtain.some((r) => r.kind === "none")).map((it) => it.id)).toEqual([]);
    expect(all.filter((it) => it.obtain.length > 1 && it.obtain.some((r) => r.kind === "unobtainable")).map((it) => it.id)).toEqual([]);
    for (const id of ["karrablast", "shelmet", "mega_showdown:darkinium-z", "mega_showdown:mimikium-z", "mega_showdown:baxcalibrite", "allthemons:badge"]) {
      expect(items[id]).toBeUndefined();
    }
    expect(items["cobblemon:bugwort"]?.obtain).toEqual([{ kind: "unobtainable", reason: "notRegistered" }]);
    expect(items["cobblemon:npc_editor"]?.obtain).toEqual([{ kind: "unobtainable", reason: "creativeOnly" }]);
    expect(items["zamega:baxcalibrite"]?.obtain.some((r) => r.kind === "craftable")).toBe(true);
  });

  it("U7c sources reach items.json (shop, ritual, structurePlaced, questReward, blockDrop, mobDrop, special)", () => {
    const kinds = (id: string) => (items[id]?.obtain ?? []).map((r) => r.kind);
    expect(items["cobblemon:metal_alloy"]?.obtain).toEqual([{ kind: "shop", shop: "battleTowerBp", price: 5 }]);
    expect(kinds("allthemons:imbued_pokemon_egg")).toEqual(["ritual"]);
    expect(kinds("mega_showdown:flame_plate")).toEqual(["structurePlaced"]);
    expect(kinds("mega_showdown:wishing_star")).toEqual(["blockDrop", "questReward"]);
    expect(kinds("mega_showdown:red_orb")).toContain("mobDrop");
    expect(kinds("cobblemon:moomoo_milk")).toContain("special");
    expect(kinds("mega_showdown:max_mushroom")).toContain("worldgen");
  });

  it("U8: game names for refs and minecraft items, vanilla textures, special notes without raw ids", () => {
    const all = Object.values(items);
    const minecraft = all.filter((it) => it.namespace === "minecraft");
    expect(minecraft.length).toBeGreaterThan(100);
    // PT do lang pt_br do Minecraft (diferente do en) e textura versionada do jar vanilla
    expect(minecraft.filter((it) => it.name.pt === it.name.en).map((it) => it.id)).toEqual([]);
    expect(minecraft.filter((it) => !/^assets\/items\/minecraft\/[a-z0-9_]+\.png\?v=[0-9a-f]{8}$/.test(it.texture ?? "")).map((it) => it.id)).toEqual([]);
    expect(items["minecraft:apple"]?.name).toEqual({ pt: "Maçã", en: "Apple" });
    const refs = (kind: string) =>
      all.flatMap((it) => it.obtain.flatMap((r) => (r.kind === kind ? ("blocks" in r ? r.blocks : "mobs" in r ? r.mobs : "structures" in r ? r.structures : []) : [])));
    const named = (kind: string) => refs(kind).filter((r) => r.name !== null).length / refs(kind).length;
    expect(named("blockDrop")).toBeGreaterThan(0.95);
    expect(named("mobDrop")).toBeGreaterThan(0.95);
    expect(refs("mobDrop").find((r) => r.id === "cataclysm:ignis")?.name?.en).toBe("Ignis");
    const notes = all.flatMap((it) => it.obtain.flatMap((r) => (r.kind === "special" ? [r.note.pt, r.note.en] : [])));
    expect(notes.filter((n) => /\b[a-z_]+:[a-z_]+\b/.test(n))).toEqual([]);
    expect(items["cobblemon:moomoo_milk"]?.obtain.find((r) => r.kind === "special")).toMatchObject({
      note: { pt: "Interagir com Miltank com Frasco de Vidro na mão.", en: "Interact with Miltank holding Glass Bottle." },
    });
  });

  it("cobblemon:potion has pt/en description and a texture", () => {
    const potion = items["cobblemon:potion"];
    expect(potion?.description?.pt).toBeTruthy();
    expect(potion?.description?.en).toBeTruthy();
    expect(potion?.texture).toBeTruthy();
  });

  it("every texture path carries ?v=<sha8 of the published file bytes> (U3 cache busting)", () => {
    const textures = Object.values(items).flatMap((it) => (it.texture ? [it.texture] : []));
    expect(textures.length).toBeGreaterThan(0);
    for (const texture of textures) {
      const match = /^(assets\/items\/.+\.png)\?v=([0-9a-f]{8})$/.exec(texture);
      expect(match, texture).not.toBeNull();
      const bytes = readFileSync(path.join(REPO_ROOT, PUBLISH_DIR, match?.[1] ?? ""));
      expect(match?.[2]).toBe(sha256Hex(bytes).slice(0, 8));
    }
  });

  it("cobblemon:aguav_berry has the 'bait' tag", () => {
    expect(items["cobblemon:aguav_berry"]?.tags).toContain("bait");
  });
});

describe("item obtain routes and used-in index (B4.2)", () => {
  it("cobblemon:fire_stone is craftable and used by the Eevee -> Flareon evolution", () => {
    const fireStone = items["cobblemon:fire_stone"];
    expect(fireStone?.obtain.some((r) => r.kind === "craftable")).toBe(true);
    expect(fireStone?.usedIn.evolutions).toContainEqual({ from: 133, to: 136 });
  });

  it("cobblemon:old_amber_fossil.usedIn.fossils contains 142 (Aerodactyl)", () => {
    expect(items["cobblemon:old_amber_fossil"]?.usedIn.fossils).toContain(142);
  });

  it("allthemons:pika_star.usedIn.fossils contains 150 (Mewtwo)", () => {
    expect(items["allthemons:pika_star"]?.usedIn.fossils).toContain(150);
  });

  it('items.json["silentgear:sinew"].obtain has a drop route including Mareep (dex 179)', () => {
    const sinew = items["silentgear:sinew"];
    const dropRoute = sinew?.obtain.find((r) => r.kind === "drop");
    expect(dropRoute && "from" in dropRoute ? dropRoute.from.some((f) => f.dex === 179) : false).toBe(true);
  });
});
