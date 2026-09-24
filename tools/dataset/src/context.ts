// Contrato compartilhado do pipeline (dono = Onda 0 / B2.1; CONGELADO nas Ondas 1 e 1b).
// Cada etapa escreve SO as proprias chaves de `counts` (COUNT_OWNERS) e SO dentro de `ctx.outDir` (staging).
import { mkdirSync } from "node:fs";
import path from "node:path";
import type {
  AbilityRef,
  BaseStats,
  DatasetCounts,
  DatasetManifest,
  LevelCapConfig,
  LocalizedText,
  MediaTotals,
  PackInfo,
  SpeciesDrop,
  SpeciesMoves,
  TypeId,
} from "../../../src/data/types";
import type { SourceReader } from "./source-reader";

// ---------------------------------------------------------------------------
// Etapas e flags
// ---------------------------------------------------------------------------

/** Etapas na ordem final de execucao (index.ts). */
export const STAGES = ["speciesCore", "speciesDerive", "pokeapi", "media", "balls", "trainers", "items", "write"] as const;
export type StageName = (typeof STAGES)[number];

export interface CliFlags {
  /** --instance <dir> (null = nao passado) */
  instance: string | null;
  skipMedia: boolean;
  offline: boolean;
  report: boolean;
  keepOld: boolean;
  /** --only <stage>: roda speciesCore + so a etapa pedida; publicacao NUNCA roda */
  only: StageName | null;
  /** --out <dir> (null = padrao tools/dataset/out/_staging) */
  out: string | null;
  /**
   * --publish-dir <dir>: raiz onde a publicacao escreve data/ e assets/ (null/ausente = public/ do repo, padrao
   * do `npm run dataset`). So aceita subpasta de tools/dataset/out/: existe para os testes nunca tocarem public/.
   */
  publishDir?: string | null;
}

// ---------------------------------------------------------------------------
// Contagens (dono por chave)
// ---------------------------------------------------------------------------

export type CountKey = keyof DatasetCounts;

/** Unico dono de cada chave de counts (SPEC B2.1 passo 6). setCount recusa outro dono. */
export const COUNT_OWNERS: Readonly<Record<CountKey, StageName>> = {
  species: "speciesCore", // B2.2
  spawnEntries: "speciesDerive", // B2.3
  fossilRoutes: "speciesDerive", // B2.3
  moves: "pokeapi", // B3.2
  abilities: "pokeapi", // B3.2
  sprites: "pokeapi", // B3.3 (Onda 2)
  cries: "media", // B3.4
  itemTextures: "media", // B3.4
  balls: "balls", // B4.3
  trainers: "trainers", // B5.1
  keyTrainers: "trainers", // B5.2
  series: "trainers", // B5.2
  items: "items", // B4.1
};

// ---------------------------------------------------------------------------
// Midia
// ---------------------------------------------------------------------------

export type MediaCategory = "cries" | "sfx" | "itemTextures" | "sprites";

/** Chamado por B3.4 (cries, sfx, itemTextures) e B3.3 (sprites). */
export interface MediaRegistry {
  register(category: MediaCategory, files: number, bytes: number): void;
  totals(): MediaTotals;
  files(category: MediaCategory): number;
}

// ---------------------------------------------------------------------------
// Lang
// ---------------------------------------------------------------------------

export interface LangTable {
  /** chave -> texto (pt_br / en_us), ja com a precedencia aplicada (Cobblemon vence) */
  readonly pt: ReadonlyMap<string, string>;
  readonly en: ReadonlyMap<string, string>;
  has(key: string): boolean;
  /** {pt, en} com fallback en -> pt (e pt -> en); sem nenhum: null + aviso no report */
  text(key: string): LocalizedText | null;
}

// ---------------------------------------------------------------------------
// Especie mesclada (formato interno, produzido por B2.2 / species/merge.ts)
// ---------------------------------------------------------------------------

/** Forma crua da especie, ja com a origem; B2.4 converte para SpeciesForm (requiredItems, artworkId). */
export interface MergedForm {
  name: string;
  /** "cobblemon" | "allthemons" | "ccc" | "legendarymonuments" | "mega_showdown" | "zamega" | "kubejs" */
  source: string;
  aspects: string[];
  battleOnly: boolean;
  labels: string[];
  /** [] quando a forma nao redefine os tipos */
  types: TypeId[];
  baseStats: BaseStats | null;
  abilities: AbilityRef[];
  /** JSON original da forma (evolutions, drops, moves etc. quando presentes) */
  raw: Record<string, unknown>;
}

export interface MergedSpecies {
  dex: number;
  /** nome do arquivo sem extensao, ex. "charizard" */
  slug: string;
  /** jar que definiu o arquivo base ("cobblemon" ou "allthemons" para 9901/9902) */
  source: string;
  /** caminho do arquivo base dentro do jar, ex. "data/cobblemon/species/generation1/charizard.json" */
  file: string;
  name: LocalizedText;
  pokedexText: LocalizedText | null;
  /** "gen1".."gen9", "gen7b", "gen8a" ou "custom" */
  generation: string;
  labels: string[];
  implemented: boolean;
  types: TypeId[];
  baseStats: BaseStats;
  evYield: BaseStats;
  abilities: AbilityRef[];
  eggGroups: string[];
  catchRate: number;
  baseFriendship: number;
  eggCycles: number;
  experienceGroup: string;
  height: number;
  weight: number;
  maleRatio: number;
  moves: SpeciesMoves;
  /** achatado de drops.entries[] (amount descartado) */
  drops: SpeciesDrop[];
  /** evolutions[] cru do Cobblemon (ou da adicao, quando presente); B2.4 converte para EvolutionEdge */
  evolutionsRaw: Record<string, unknown>[];
  /** preEvolution cru (slug, pode ter aspectos apos espaco), null quando ausente */
  preEvolutionRaw: string | null;
  forms: MergedForm[];
  features: string[];
  /** JSON final mesclado (qualquer campo nao tipado acima) */
  raw: Record<string, unknown>;
  /** campo -> origens que o alteraram (override/adicao), para o merge-report */
  origins: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

export interface ReportWarning {
  code: string;
  message: string;
  stage: StageName | "setup";
  data?: unknown;
}

export interface ReportSink {
  warn(code: string, message: string, data?: unknown): void;
  /** dados livres por etapa, gravados em report.json (ex. merge-report resumido) */
  section(name: string, data: unknown): void;
  /** tempo por etapa (ms) */
  timing(stage: StageName, ms: number): void;
  readonly warnings: readonly ReportWarning[];
  readonly sections: Readonly<Record<string, unknown>>;
  readonly timings: Readonly<Partial<Record<StageName, number>>>;
}

// ---------------------------------------------------------------------------
// Fonte detectada (B2.1 / instance.ts)
// ---------------------------------------------------------------------------

export type SourceMode = "snapshot" | "instance";

export interface SourceInfo {
  root: string;
  mode: SourceMode;
  pack: PackInfo;
  cobblemonVersion: string;
  sources: DatasetManifest["sources"];
}

// ---------------------------------------------------------------------------
// Contexto
// ---------------------------------------------------------------------------

export interface PipelineContext {
  reader: SourceReader;
  source: SourceInfo;
  lang: LangTable;
  /** dex -> especie mesclada (B2.2) */
  species: Map<number, MergedSpecies>;
  counts: Partial<DatasetCounts>;
  media: MediaRegistry;
  /** B5.2 */
  levelCapConfig: LevelCapConfig | null;
  /** raiz de staging: JSON em <outDir>/data/, midia em <outDir>/assets/{cries,sfx,items,sprites}/ */
  outDir: string;
  report: ReportSink;
  flags: CliFlags;
  /** etapa em execucao (mantida pelo index.ts; usada por setCount e report.warn) */
  currentStage: StageName | "setup";
  /** grava counts[key] se a etapa atual for a dona (COUNT_OWNERS); senao lanca erro */
  setCount<K extends CountKey>(key: K, value: DatasetCounts[K]): void;
  /** <DATASET_CACHE_DIR>/<stage>/ (padrao tools/dataset/.cache/<stage>/), criada sob demanda; so "pokeapi" e "sprites" */
  cacheDir(stage: "pokeapi" | "sprites"): string;
  /** caminho dentro de <outDir>/data/ (JSON do dataset) */
  dataPath(...parts: string[]): string;
  /** caminho dentro de <outDir>/assets/ (midia) */
  assetPath(...parts: string[]): string;
}

/** LangTable vazia (valor inicial de ctx.lang; runSpeciesCore/B2.2 troca pela tabela carregada). */
export function emptyLangTable(): LangTable {
  const empty = new Map<string, string>();
  return { pt: empty, en: empty, has: () => false, text: () => null };
}

export function createMediaRegistry(): MediaRegistry {
  const files: Record<MediaCategory, number> = { cries: 0, sfx: 0, itemTextures: 0, sprites: 0 };
  const bytes: Record<MediaCategory, number> = { cries: 0, sfx: 0, itemTextures: 0, sprites: 0 };
  return {
    register(category, count, size) {
      files[category] += count;
      bytes[category] += size;
    },
    files: (category) => files[category],
    totals: () => ({
      criesBytes: bytes.cries,
      sfxBytes: bytes.sfx,
      itemTexturesBytes: bytes.itemTextures,
      spritesBytes: bytes.sprites,
      totalBytes: bytes.cries + bytes.sfx + bytes.itemTextures + bytes.sprites,
    }),
  };
}

export interface CreateContextOptions {
  reader: SourceReader;
  source: SourceInfo;
  lang: LangTable;
  outDir: string;
  cacheRoot: string;
  report: ReportSink;
  flags: CliFlags;
}

export function createContext(options: CreateContextOptions): PipelineContext {
  const ctx: PipelineContext = {
    reader: options.reader,
    source: options.source,
    lang: options.lang,
    species: new Map(),
    counts: {},
    media: createMediaRegistry(),
    levelCapConfig: null,
    outDir: options.outDir,
    report: options.report,
    flags: options.flags,
    currentStage: "setup",
    setCount(key, value) {
      const owner = COUNT_OWNERS[key];
      if (ctx.currentStage !== owner) {
        throw new Error(`counts.${key} pertence a etapa "${owner}", nao a "${ctx.currentStage}"`);
      }
      ctx.counts[key] = value;
    },
    cacheDir(stage) {
      const dir = path.join(options.cacheRoot, stage);
      mkdirSync(dir, { recursive: true });
      return dir;
    },
    dataPath: (...parts) => path.join(options.outDir, "data", ...parts),
    assetPath: (...parts) => path.join(options.outDir, "assets", ...parts),
  };
  return ctx;
}
