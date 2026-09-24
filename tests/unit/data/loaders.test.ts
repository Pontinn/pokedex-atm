// @vitest-environment node
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DatasetError,
  configureLoaders,
  loadManifest,
  loadSpecies,
  loadTypeChart,
} from "../../../src/data/loaders";
import { speciesDetailSchema } from "../../../src/data/schemas";
import { typeChartMatrix, TYPE_IDS } from "../../../src/domain/type-chart";
import { MemoryCache } from "../../../src/data/cache";

const species6 = JSON.parse(readFileSync(new URL("../../fixtures/rules-storage/species-6.json", import.meta.url), "utf8"));
const VER = "atm1.3.0-cobblemon1.7.3-20260924-deadbeef";
const manifest = {
  datasetVersion: VER,
  generatedAt: "2026-09-24T00:00:00.000Z",
  pack: { name: "All the Mons", version: "1.3.0", minecraft: "1.21.1" },
  cobblemonVersion: "1.7.3",
  sources: [],
  counts: {
    species: 1027, spawnEntries: 0, fossilRoutes: 16, moves: 0, abilities: 0, items: 0, balls: 48, trainers: 0,
    keyTrainers: { bdsp: 33 }, series: 6, cries: 0, itemTextures: 0, sprites: 0,
  },
  levelCapConfig: { initialLevelCap: 15, relativeLevelCap: 0, initialSeries: "empty", freeroamRequiresCompletedSeries: true },
  media: { criesBytes: 0, sfxBytes: 0, itemTexturesBytes: 0, spritesBytes: 0, totalBytes: 0 },
  files: {
    speciesIndex: "species-index.json", typeChart: "type-chart.json", moves: "moves.json", abilities: "abilities.json",
    items: "items.json", balls: "balls.json", series: "series.json", fossils: "fossils.json", biomes: "biomes.json",
    speciesDir: "species", trainersDir: "trainers",
  },
};

type Route = unknown | (() => Response | Promise<Response>);
const json = (v: unknown, status = 200) => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json" } });

function setup(routes: Record<string, Route>) {
  const calls: string[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    const r = routes[url];
    if (r === undefined) return new Response("nope", { status: 404 });
    return typeof r === "function" ? (r as () => Response)() : json(r);
  });
  const sleeps: number[] = [];
  configureLoaders({ fetch: fetchMock as unknown as typeof fetch, sleep: async (ms) => void sleeps.push(ms) });
  return { calls, sleeps };
}

afterEach(() => configureLoaders({}));

const base = { "/data/current.json": { datasetVersion: VER }, [`/data/${VER}/dataset-manifest.json`]: manifest };

describe("dataset loaders", () => {
  it("schemas accept the example species file", () => {
    expect(speciesDetailSchema.safeParse(species6).success).toBe(true);
  });

  it("resolves the version via current.json and a cache hit does not refetch", async () => {
    const { calls } = setup({ ...base, [`/data/${VER}/species/6.json`]: species6 });
    const [a, b] = await Promise.all([loadSpecies(6), loadSpecies(6)]); // dedup em voo
    const c = await loadSpecies(6);
    expect(a.slug).toBe("charizard");
    expect(b).toBe(a);
    expect(c).toBe(a);
    expect(calls.filter((u) => u.endsWith("/species/6.json"))).toHaveLength(1);
    expect(calls.filter((u) => u.endsWith("current.json"))).toHaveLength(1);
    expect(calls.every((u) => u.startsWith("/data/"))).toBe(true);
  });

  it("2 network failures + success -> resolves after retries of 500 and 1500 ms", async () => {
    let n = 0;
    const { sleeps } = setup({
      ...base,
      [`/data/${VER}/species/6.json`]: () => (++n <= 2 ? new Response("boom", { status: 503 }) : json(species6)),
    });
    await expect(loadSpecies(6)).resolves.toMatchObject({ dex: 6 });
    expect(n).toBe(3);
    expect(sleeps).toEqual([500, 1500]);
  });

  it("3 network failures -> NETWORK (and the failure is not cached)", async () => {
    let n = 0;
    setup({ ...base, [`/data/${VER}/species/6.json`]: () => (++n <= 3 ? new Response("x", { status: 500 }) : json(species6)) });
    await expect(loadSpecies(6)).rejects.toMatchObject({ code: "NETWORK" });
    await expect(loadSpecies(6)).resolves.toMatchObject({ dex: 6 });
  });

  it("invalid JSON or schema mismatch -> INVALID", async () => {
    setup({
      ...base,
      [`/data/${VER}/species/6.json`]: () => new Response("{not json", { status: 200 }),
      [`/data/${VER}/species/7.json`]: { ...species6, types: ["lava"] },
    });
    await expect(loadSpecies(6)).rejects.toBeInstanceOf(DatasetError);
    await expect(loadSpecies(6)).rejects.toMatchObject({ code: "INVALID" });
    await expect(loadSpecies(7)).rejects.toMatchObject({ code: "INVALID" });
  });

  it("missing current.json -> NOT_FOUND (boot error screen), no retries", async () => {
    const { sleeps } = setup({});
    await expect(loadManifest()).rejects.toMatchObject({ code: "NOT_FOUND", url: "/data/current.json" });
    expect(sleeps).toEqual([]);
  });

  it("type chart schema accepts the domain matrix", async () => {
    setup({ ...base, [`/data/${VER}/type-chart.json`]: { attackers: TYPE_IDS, matrix: typeChartMatrix() } });
    const chart = await loadTypeChart();
    expect(chart.matrix.rock.fire).toBe(2);
  });

  it("MemoryCache does not keep failures", async () => {
    const c = new MemoryCache<number>();
    await expect(c.get("k", () => Promise.reject(new Error("x")))).rejects.toThrow("x");
    await expect(c.get("k", () => Promise.resolve(1))).resolves.toBe(1);
    expect(c.has("k")).toBe(true);
  });
});
