// B2.5 (Onda 2, Juncao): ultima etapa do pipeline. Escreve species-index.json, species/<dex>.json,
// type-chart.json, biomes.json, fossils.json e dataset-manifest.json no staging, valida tudo contra
// src/data/schemas.ts (B7.4, importado) e, fora de --only, publica em public/ via write.ts (publish).
import { existsSync } from "node:fs";
import type {
  DatasetCounts,
  DatasetManifest,
  EvolutionEdge,
  EvolutionMethod,
  SpeciesDetail,
  SpeciesIndexFile,
  SpeciesSummary,
} from "../../../../src/data/types";
import { datasetManifestSchema, speciesDetailSchema, speciesIndexSchema } from "../../../../src/data/schemas";
import { normalizeSearch } from "../../../../src/domain/normalize";
import { buildBiomeLabels } from "../biomes";
import type { PipelineContext } from "../context";
import { resolvePublishDir } from "../config";
import { buildDatasetVersion, datasetContentHash, type ManifestContent } from "../lib/dataset-version";
import { writeJsonAtomic } from "../lib/fs-atomic";
import { MEDIA_BUDGET_BYTES } from "../media/budget";
import { publish } from "../write";
import { buildTypeChartFile } from "../type-chart";
import type { DerivedSpecies } from "./stage-derive";
import { collectFossils, resolveFossils } from "./fossils";

const MAX_SPRITE_DEX = 1025;

function evolutionMethodOf(edge: EvolutionEdge): EvolutionMethod {
  if (edge.requiredItem) return "item";
  if (edge.requirements.some((r) => r.kind === "friendship")) return "friendship";
  if (edge.requirements.some((r) => r.kind === "hasMoveType")) return "move";
  if (edge.variant === "trade") return "trade";
  if (edge.variant === "level_up") return "level";
  return "other";
}

function evolutionMethods(edges: readonly EvolutionEdge[]): EvolutionMethod[] {
  if (edges.length === 0) return ["none"];
  return [...new Set(edges.map(evolutionMethodOf))];
}

function bstOf(stats: SpeciesDetail["baseStats"]): number {
  return stats.hp + stats.attack + stats.defence + stats.specialAttack + stats.specialDefence + stats.speed;
}

const REQUIRED_COUNT_KEYS: (keyof DatasetCounts)[] = [
  "species",
  "spawnEntries",
  "fossilRoutes",
  "moves",
  "abilities",
  "items",
  "balls",
  "trainers",
  "keyTrainers",
  "series",
  "cries",
  "itemTextures",
  "sprites",
];

function assertCountsComplete(ctx: PipelineContext): DatasetCounts {
  const missing = REQUIRED_COUNT_KEYS.filter((key) => ctx.counts[key] === undefined);
  if (missing.length > 0) {
    throw new Error(
      `E_COUNTS_INCOMPLETE: write precisa do pipeline completo (rode sem --only); faltam: ${missing.join(", ")}`,
    );
  }
  return ctx.counts as DatasetCounts;
}

function buildSpeciesDetail(ctx: PipelineContext, merged: DerivedSpecies): SpeciesDetail {
  const dex = merged.dex;
  const hasSprite = dex <= MAX_SPRITE_DEX && existsSync(ctx.assetPath("sprites", `${dex}.png`));
  const artworkId = dex <= MAX_SPRITE_DEX ? dex : null;
  const cry = existsSync(ctx.assetPath("cries", `${merged.slug}.ogg`)) ? merged.slug : null;
  const searchKey = `${normalizeSearch(merged.name.pt)}|${normalizeSearch(merged.name.en)}`;

  const summary: SpeciesSummary = {
    dex,
    slug: merged.slug,
    name: merged.name,
    searchKey,
    types: merged.types,
    generation: merged.generation,
    labels: merged.labels,
    bst: bstOf(merged.baseStats),
    rarity: merged.rarity,
    evolutionMethods: evolutionMethods(merged.evolutions),
    hasSprite,
    artworkId,
  };

  return {
    ...summary,
    pokedexText: merged.pokedexText,
    height: merged.height,
    weight: merged.weight,
    maleRatio: merged.maleRatio,
    catchRate: merged.catchRate,
    baseFriendship: merged.baseFriendship,
    eggCycles: merged.eggCycles,
    experienceGroup: merged.experienceGroup,
    baseStats: merged.baseStats,
    evYield: merged.evYield,
    abilities: merged.abilities,
    eggGroups: merged.eggGroups,
    moves: merged.moves,
    evolutions: merged.evolutions,
    preEvolution: merged.preEvolution,
    evolutionChain: merged.evolutionChain,
    forms: merged.resolvedForms,
    drops: merged.drops,
    spawns: merged.spawns,
    obtain: merged.obtain,
    cry,
  };
}

export async function runWriteStage(ctx: PipelineContext): Promise<void> {
  const counts = assertCountsComplete(ctx);

  // 1) species-index.json + species/<dex>.json (dex asc, custom 9901/9902 no fim).
  const dexes = [...ctx.species.keys()].sort((a, b) => {
    const aCustom = a > MAX_SPRITE_DEX;
    const bCustom = b > MAX_SPRITE_DEX;
    if (aCustom !== bCustom) return aCustom ? 1 : -1;
    return a - b;
  });

  const details: SpeciesDetail[] = [];
  for (const dex of dexes) {
    const merged = ctx.species.get(dex) as DerivedSpecies;
    details.push(buildSpeciesDetail(ctx, merged));
  }

  for (const detail of details) {
    const check = speciesDetailSchema.safeParse(detail);
    if (!check.success) {
      throw new Error(`E_SCHEMA_INVALID: species/${detail.dex}.json nao valida contra speciesDetailSchema: ${check.error.message}`);
    }
    writeJsonAtomic(ctx.dataPath("species", `${detail.dex}.json`), detail);
  }

  const index: SpeciesIndexFile = details.map(
    ({
      dex,
      slug,
      name,
      searchKey,
      types,
      generation,
      labels,
      bst,
      rarity,
      evolutionMethods: methods,
      hasSprite,
      artworkId,
    }): SpeciesSummary => ({
      dex,
      slug,
      name,
      searchKey,
      types,
      generation,
      labels,
      bst,
      rarity,
      evolutionMethods: methods,
      hasSprite,
      artworkId,
    }),
  );
  const indexCheck = speciesIndexSchema.safeParse(index);
  if (!indexCheck.success) {
    throw new Error(`E_SCHEMA_INVALID: species-index.json nao valida: ${indexCheck.error.message}`);
  }
  writeJsonAtomic(ctx.dataPath("species-index.json"), index);

  // 2) type-chart.json (fonte unica: src/domain/type-chart.ts, B6.1).
  writeJsonAtomic(ctx.dataPath("type-chart.json"), buildTypeChartFile());

  // 3) fossils.json (recomputado das mesmas funcoes puras de B2.3; contagem ja pertence a speciesDerive).
  const slugToDex = new Map<string, number>();
  for (const ms of ctx.species.values()) slugToDex.set(ms.slug, ms.dex);
  const fossils = resolveFossils(collectFossils(ctx), slugToDex, ctx.report);
  writeJsonAtomic(ctx.dataPath("fossils.json"), fossils);

  // 4) biomes.json.
  writeJsonAtomic(ctx.dataPath("biomes.json"), buildBiomeLabels(ctx));

  // 5) dataset-manifest.json.
  const media = ctx.media.totals();
  if (media.totalBytes > MEDIA_BUDGET_BYTES) {
    throw new Error(`E_MEDIA_BUDGET: midia total (${media.totalBytes} bytes, com sprites) excede o limite de ${MEDIA_BUDGET_BYTES} bytes`);
  }
  if (!ctx.levelCapConfig) throw new Error("E_LEVEL_CAP_CONFIG_MISSING: trainers stage nao rodou (levelCapConfig nulo)");

  // U11: o sufixo da versao e o hash do conteudo de TODOS os arquivos do staging (ja escritos pelas etapas
  // anteriores e acima) + o manifest sem datasetVersion/generatedAt. Mesmo conteudo = mesma pasta.
  const generatedAt = new Date();
  const manifestContent: ManifestContent = {
    pack: ctx.source.pack,
    cobblemonVersion: ctx.source.cobblemonVersion,
    sources: ctx.source.sources,
    counts,
    levelCapConfig: ctx.levelCapConfig,
    media,
    files: {
      speciesIndex: "species-index.json",
      typeChart: "type-chart.json",
      moves: "moves.json",
      abilities: "abilities.json",
      items: "items.json",
      balls: "balls.json",
      series: "series.json",
      fossils: "fossils.json",
      biomes: "biomes.json",
      speciesDir: "species",
      trainersDir: "trainers",
    },
  };
  const datasetVersion = buildDatasetVersion(
    ctx.source.pack.version,
    ctx.source.cobblemonVersion,
    generatedAt,
    datasetContentHash(ctx.dataPath(), manifestContent),
  );

  const manifest: DatasetManifest = { datasetVersion, generatedAt: generatedAt.toISOString(), ...manifestContent };
  const manifestCheck = datasetManifestSchema.safeParse(manifest);
  if (!manifestCheck.success) {
    throw new Error(`E_SCHEMA_INVALID: dataset-manifest.json nao valida: ${manifestCheck.error.message}`);
  }
  writeJsonAtomic(ctx.dataPath("dataset-manifest.json"), manifest);

  // 6) publicacao (nunca roda com --only: publish() ja recusa nesse caso).
  if (!ctx.flags.only) {
    publish(ctx, { publicDir: resolvePublishDir(ctx.flags), datasetVersion });
  }
}
