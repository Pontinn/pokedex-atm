// Loaders do dataset (RF-100..102): /data/current.json -> /data/<ver>/..., cache em memoria, dedup, timeout 15 s,
// 2 retries (500 ms, 1500 ms), validacao zod. Nenhum loader acessa nada fora de /data (RF-101).
import type { z } from "zod";
import { MemoryCache } from "./cache";
import {
  abilitiesFileSchema,
  ballsFileSchema,
  biomeLabelsSchema,
  currentDatasetPointerSchema,
  datasetManifestSchema,
  fossilsFileSchema,
  itemsFileSchema,
  movesFileSchema,
  seriesFileSchema,
  speciesDetailSchema,
  speciesIndexSchema,
  trainersFileSchema,
  typeChartSchema,
} from "./schemas";
import type {
  AbilitiesFile,
  BallsFile,
  BiomeLabels,
  DatasetManifest,
  FossilsFile,
  ItemsFile,
  MovesFile,
  SeriesFile,
  SpeciesDetail,
  SpeciesIndexFile,
  TrainersFile,
  TypeChartFile,
} from "./types";

export type DatasetErrorCode = "NOT_FOUND" | "NETWORK" | "INVALID";

export class DatasetError extends Error {
  constructor(
    readonly code: DatasetErrorCode,
    readonly url: string,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DatasetError";
  }
}

export interface LoaderConfig {
  baseUrl: string;
  fetch: typeof fetch;
  timeoutMs: number;
  retryDelaysMs: readonly number[];
  sleep: (ms: number) => Promise<void>;
}

const defaultConfig = (): LoaderConfig => ({
  baseUrl: "/data",
  fetch: (...args) => globalThis.fetch(...args),
  timeoutMs: 15_000,
  retryDelaysMs: [500, 1500],
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
});

let config: LoaderConfig = defaultConfig();
const cache = new MemoryCache();

/** Testes/plataformas: troca fetch, base, tempos. Limpa o cache. */
export function configureLoaders(patch: Partial<LoaderConfig>): void {
  config = { ...defaultConfig(), ...patch };
  cache.clear();
}

export function clearDatasetCache(): void {
  cache.clear();
}

async function fetchOnce(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  let res: Response;
  try {
    res = await config.fetch(url, { signal: controller.signal });
  } catch (e) {
    throw new DatasetError("NETWORK", url, controller.signal.aborted ? "timeout" : "network error", e);
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 404) throw new DatasetError("NOT_FOUND", url, "not found");
  if (!res.ok) throw new DatasetError("NETWORK", url, `HTTP ${res.status}`);
  try {
    return await res.json();
  } catch (e) {
    throw new DatasetError("INVALID", url, "invalid json", e);
  }
}

/** Retenta so falhas de rede (NETWORK); NOT_FOUND e INVALID sao definitivos. */
async function fetchWithRetry(url: string): Promise<unknown> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fetchOnce(url);
    } catch (e) {
      const retryable = e instanceof DatasetError && e.code === "NETWORK";
      const delay = config.retryDelaysMs[attempt];
      if (!retryable || delay === undefined) throw e;
      await config.sleep(delay);
    }
  }
}

function load<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const url = `${config.baseUrl}/${path}`;
  return cache.get(url, async () => {
    const raw = await fetchWithRetry(url);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      throw new DatasetError("INVALID", url, parsed.error.issues[0]?.message ?? "schema mismatch", parsed.error);
    }
    return parsed.data;
  }) as Promise<T>;
}

/** /data/current.json -> datasetVersion (ausente = build sem dataset: NOT_FOUND, a UI mostra "rode npm run dataset"). */
export async function loadDatasetVersion(): Promise<string> {
  return (await load("current.json", currentDatasetPointerSchema)).datasetVersion;
}

async function versioned<T>(file: (m: DatasetManifest) => string, schema: z.ZodType<T>): Promise<T> {
  const manifest = await loadManifest();
  return load(`${manifest.datasetVersion}/${file(manifest)}`, schema);
}

export async function loadManifest(): Promise<DatasetManifest> {
  const ver = await loadDatasetVersion();
  return load(`${ver}/dataset-manifest.json`, datasetManifestSchema);
}

export const loadSpeciesIndex = (): Promise<SpeciesIndexFile> => versioned((m) => m.files.speciesIndex, speciesIndexSchema);
export const loadSpecies = (dex: number): Promise<SpeciesDetail> =>
  versioned((m) => `${m.files.speciesDir.replace(/\/$/, "")}/${dex}.json`, speciesDetailSchema);
export const loadMoves = (): Promise<MovesFile> => versioned((m) => m.files.moves, movesFileSchema);
export const loadAbilities = (): Promise<AbilitiesFile> => versioned((m) => m.files.abilities, abilitiesFileSchema);
export const loadItems = (): Promise<ItemsFile> => versioned((m) => m.files.items, itemsFileSchema);
export const loadBalls = (): Promise<BallsFile> => versioned((m) => m.files.balls, ballsFileSchema);
export const loadSeries = (): Promise<SeriesFile> => versioned((m) => m.files.series, seriesFileSchema);
export const loadTrainers = (seriesId: string): Promise<TrainersFile> =>
  versioned((m) => `${m.files.trainersDir.replace(/\/$/, "")}/${seriesId}.json`, trainersFileSchema);
export const loadTypeChart = (): Promise<TypeChartFile> => versioned((m) => m.files.typeChart, typeChartSchema);
export const loadBiomes = (): Promise<BiomeLabels> => versioned((m) => m.files.biomes, biomeLabelsSchema);
export const loadFossils = (): Promise<FossilsFile> => versioned((m) => m.files.fossils, fossilsFileSchema);
