// @vitest-environment node
// Os schemas zod dos loaders aceitam os arquivos REAIS publicados em public/data/<current>/ (somente leitura).
// Pega divergencia entre o pipeline (tools/dataset) e o app (ex.: condicao de bola nova no pipeline).
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { z } from "zod";
import {
  abilitiesFileSchema,
  ballsFileSchema,
  biomeLabelsSchema,
  currentDatasetPointerSchema,
  datasetManifestSchema,
  fossilsFileSchema,
  itemInfoSchema,
  itemsFileSchema,
  movesFileSchema,
  seriesFileSchema,
  speciesDetailSchema,
  speciesIndexSchema,
  spawnEntrySchema,
  trainersFileSchema,
  typeChartSchema,
} from "../../../src/data/schemas";

const DATA = new URL("../../../public/data/", import.meta.url);
const hasData = existsSync(new URL("current.json", DATA));
const readJson = (url: URL): unknown => JSON.parse(readFileSync(url, "utf8"));

function expectParses(schema: z.ZodTypeAny, value: unknown, label: string): void {
  const res = schema.safeParse(value);
  if (!res.success) {
    const issues = res.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`${label} nao passa no schema:\n${issues.join("\n")}`);
  }
  // Nenhum campo descartado em silencio (z.object remove chaves desconhecidas).
  expect(res.data, `${label}: schema descarta campos do arquivo`).toEqual(value);
}

describe.skipIf(!hasData)("schemas vs dataset publicado", () => {
  const pointer = currentDatasetPointerSchema.parse(readJson(new URL("current.json", DATA)));
  const base = new URL(`${pointer.datasetVersion}/`, DATA);
  const manifest = datasetManifestSchema.parse(readJson(new URL("dataset-manifest.json", base)));
  const f = manifest.files;

  it.each([
    ["balls", f.balls, ballsFileSchema],
    ["species index", f.speciesIndex, speciesIndexSchema],
    ["type chart", f.typeChart, typeChartSchema],
    ["moves", f.moves, movesFileSchema],
    ["abilities", f.abilities, abilitiesFileSchema],
    ["items", f.items, itemsFileSchema],
    ["series", f.series, seriesFileSchema],
    ["fossils", f.fossils, fossilsFileSchema],
    ["biomes", f.biomes, biomeLabelsSchema],
  ] as const)("%s", (label, file, schema) => {
    expectParses(schema, readJson(new URL(file, base)), label);
  });

  // spawn-bait T1.3: objetos novos estritos (campo desconhecido rejeita o arquivo)
  it("spawn-bait: poke_snack com potRecipes passa; campo extra em potRecipes ou em fishing e rejeitado", () => {
    const items = readJson(new URL(f.items, base)) as Record<string, Record<string, unknown>>;
    const snack = items["cobblemon:poke_snack"];
    expectParses(itemInfoSchema, snack, "items[cobblemon:poke_snack]");
    const route = (snack?.obtain as { kind: string; potRecipes?: Record<string, unknown>[] }[]).find((r) => r.kind === "craftable");
    expect(route?.potRecipes).toHaveLength(1);
    const tampered = { ...snack, obtain: [{ ...route, potRecipes: [{ ...route?.potRecipes?.[0], extra: 1 }] }] };
    expect(itemInfoSchema.safeParse(tampered).success).toBe(false);
    const staryu = (readJson(new URL(`${f.speciesDir.replace(/\/$/, "")}/120.json`, base)) as { spawns: Record<string, unknown>[] }).spawns.find((s) => s.id === "allthemons:staryu-10");
    expectParses(spawnEntrySchema, staryu, "species/120 staryu-10");
    expect(spawnEntrySchema.safeParse({ ...staryu, fishing: { ...(staryu?.fishing as object), extra: 1 } }).success).toBe(false);
    expect(spawnEntrySchema.safeParse({ ...staryu, fishing: null }).success).toBe(true);
  });

  // berry-mutations T1.2: berry obrigatorio e estrito (campo desconhecido ou variante fora do enum rejeita o item)
  it("berry-mutations: lum_berry passes; extra field in berry, spawn or mutationPairs and unknown variant are rejected; berry null passes; missing key is rejected", () => {
    const items = readJson(new URL(f.items, base)) as Record<string, Record<string, unknown>>;
    const lum = items["cobblemon:lum_berry"]!;
    const liechi = items["cobblemon:liechi_berry"]!;
    expectParses(itemInfoSchema, lum, "items[cobblemon:lum_berry]");
    expectParses(itemInfoSchema, liechi, "items[cobblemon:liechi_berry]");
    const lumBerry = lum.berry as { mutationPairs: Record<string, unknown>[] };
    const liechiBerry = liechi.berry as { spawn: Record<string, unknown>[] };
    expect(lumBerry.mutationPairs.length).toBeGreaterThan(0);
    expect(liechiBerry.spawn.length).toBeGreaterThan(0);
    expect(itemInfoSchema.safeParse({ ...lum, berry: { ...lumBerry, extra: 1 } }).success).toBe(false);
    expect(itemInfoSchema.safeParse({ ...liechi, berry: { ...liechiBerry, spawn: [{ ...liechiBerry.spawn[0], extra: 1 }] } }).success).toBe(false);
    expect(itemInfoSchema.safeParse({ ...lum, berry: { ...lumBerry, mutationPairs: [{ ...lumBerry.mutationPairs[0], extra: 1 }] } }).success).toBe(false);
    expect(itemInfoSchema.safeParse({ ...liechi, berry: { ...liechiBerry, spawn: [{ ...liechiBerry.spawn[0], variant: "x" }] } }).success).toBe(false);
    expect(itemInfoSchema.safeParse({ ...lum, berry: null }).success).toBe(true);
    const { berry: _berry, ...withoutKey } = lum;
    expect(itemInfoSchema.safeParse(withoutKey).success).toBe(false);
  });

  it("balls: todas as 48 bolas, incluindo fast_ball e net_ball", () => {
    const balls = ballsFileSchema.parse(readJson(new URL(f.balls, base)));
    expect(balls).toHaveLength(manifest.counts.balls);
    const cond = (id: string) => balls.find((b) => b.id === id)?.rule;
    expect(cond("fast_ball")).toMatchObject({ kind: "conditional", condition: "minBaseSpeedAbove" });
    expect(cond("net_ball")).toMatchObject({ kind: "conditional", condition: "hasAnyType" });
  });

  it("trainers: todos os arquivos de serie", () => {
    const dir = new URL(`${f.trainersDir.replace(/\/$/, "")}/`, base);
    const files = readdirSync(dir).filter((n) => n.endsWith(".json"));
    expect(files.length).toBeGreaterThan(0);
    for (const name of files) expectParses(trainersFileSchema, readJson(new URL(name, dir)), `trainers/${name}`);
  });

  it("species: todas as fichas", () => {
    const dir = new URL(`${f.speciesDir.replace(/\/$/, "")}/`, base);
    const files = readdirSync(dir).filter((n) => n.endsWith(".json"));
    expect(files).toHaveLength(manifest.counts.species);
    for (const name of files) expectParses(speciesDetailSchema, readJson(new URL(name, dir)), `species/${name}`);
  }, 60_000);
});
