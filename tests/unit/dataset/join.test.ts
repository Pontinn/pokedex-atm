// Onda 2 (Juncao): B3.3 (sprites + artwork ids), B4.1 (catalogo de itens), B4.2 (rotas de obtencao do
// item e "Usado em"), B2.5 (indice, fichas, tabela de tipos, biomas; PRIMEIRA execucao completa do
// pipeline COM publicacao). Roda o pipeline real (--offline) sobre o snapshot data-source/atm-1.3.0:
// como B3.3 e artwork-ids ja rodaram de verdade contra a rede antes deste commit (ver HANDOFF_join.md),
// o cache em tools/dataset/.cache/{pokeapi,sprites}/ ja esta quente e --offline garante 0 chamadas de
// rede aqui (regra do ambiente: testes unitarios nunca tocam rede).
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, beforeAll } from "vitest";
import { runPipeline } from "../../../tools/dataset/src/index";
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

function readJson<T>(...parts: string[]): T {
  return JSON.parse(readFileSync(path.join(REPO_ROOT, ...parts), "utf8")) as T;
}

let datasetVersion: string;
let index: SpeciesIndexFile;
let manifest: DatasetManifest;
let items: ItemsFile;

beforeAll(async () => {
  await runPipeline(["--offline", "--out", OUT_DIR, "--report"]);
  const pointer = readJson<CurrentDatasetPointer>("public/data/current.json");
  datasetVersion = pointer.datasetVersion;
  index = readJson<SpeciesIndexFile>("public/data", datasetVersion, "species-index.json");
  manifest = readJson<DatasetManifest>("public/data", datasetVersion, "dataset-manifest.json");
  items = readJson<ItemsFile>("public/data", datasetVersion, "items.json");
}, 180_000);

function speciesFile(dex: number): SpeciesDetail {
  return readJson<SpeciesDetail>("public/data", datasetVersion, "species", `${dex}.json`);
}

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
    const typeChart = readJson("public/data", datasetVersion, "type-chart.json");
    expect(typeChartSchema.safeParse(typeChart).success).toBe(true);
    const biomes = readJson("public/data", datasetVersion, "biomes.json");
    expect(biomeLabelsSchema.safeParse(biomes).success).toBe(true);
  });

  it("published assets exist (sprites, cries, sfx, item textures)", () => {
    expect(existsSync(path.join(REPO_ROOT, "public/assets/sprites/6.png"))).toBe(true);
    expect(existsSync(path.join(REPO_ROOT, "public/assets/cries"))).toBe(true);
    expect(existsSync(path.join(REPO_ROOT, "public/assets/sfx"))).toBe(true);
    expect(existsSync(path.join(REPO_ROOT, "public/assets/items"))).toBe(true);
  });
});

describe("sprites and artwork ids (B3.3)", () => {
  it("downloads 1025 sprites (dex 1..1025) and registers the count", () => {
    expect(manifest.counts.sprites).toBe(1025);
    expect(existsSync(path.join(REPO_ROOT, "public/assets/sprites/1.png"))).toBe(true);
    expect(existsSync(path.join(REPO_ROOT, "public/assets/sprites/1025.png"))).toBe(true);
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

  it("cobblemon:potion has pt/en description and a texture", () => {
    const potion = items["cobblemon:potion"];
    expect(potion?.description?.pt).toBeTruthy();
    expect(potion?.description?.en).toBeTruthy();
    expect(potion?.texture).toBeTruthy();
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
