// Esquemas zod dos arquivos do dataset (SPEC 5.1.3). Dono unico: B7.4. Usados pelos loaders e pelo pipeline (B2.5).
// Cada esquema e anotado com o tipo de src/data/types.ts, entao divergencia de contrato quebra o typecheck.
import { z } from "zod";
import type {
  AbilitiesFile,
  AbilityInfo,
  BallInfo,
  BallsFile,
  BiomeLabels,
  CurrentDatasetPointer,
  DatasetManifest,
  EvolutionEdge,
  FossilsFile,
  ItemInfo,
  ItemsFile,
  MoveInfo,
  MovesFile,
  ObtainRoute,
  SeriesFile,
  SpawnEntry,
  SpeciesDetail,
  SpeciesIndexFile,
  SpeciesSummary,
  TrainersFile,
  TypeChartFile,
  TypeId,
} from "./types";

const TYPE_ID_LIST = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
] as const satisfies readonly TypeId[];

export const typeIdSchema = z.enum(TYPE_ID_LIST);
export const localizedTextSchema = z.object({ pt: z.string(), en: z.string() });
const rarityBucket = z.enum(["common", "uncommon", "rare", "ultra-rare"]);
const baseStatsSchema = z.object({
  hp: z.number(),
  attack: z.number(),
  defence: z.number(),
  specialAttack: z.number(),
  specialDefence: z.number(),
  speed: z.number(),
});
const abilityRef = z.object({ id: z.string(), hidden: z.boolean() });

export const currentDatasetPointerSchema: z.ZodType<CurrentDatasetPointer> = z.object({ datasetVersion: z.string().min(1) });

export const datasetManifestSchema: z.ZodType<DatasetManifest> = z.object({
  datasetVersion: z.string().min(1),
  generatedAt: z.string(),
  pack: z.object({ name: z.string(), version: z.string(), minecraft: z.string() }),
  cobblemonVersion: z.string(),
  sources: z.array(z.object({ file: z.string(), sizeBytes: z.number(), mtime: z.string() })),
  counts: z.object({
    species: z.number(),
    spawnEntries: z.number(),
    fossilRoutes: z.number(),
    moves: z.number(),
    abilities: z.number(),
    items: z.number(),
    balls: z.number(),
    trainers: z.number(),
    keyTrainers: z.record(z.string(), z.number()),
    series: z.number(),
    cries: z.number(),
    itemTextures: z.number(),
    sprites: z.number(),
  }),
  levelCapConfig: z.object({
    initialLevelCap: z.number(),
    relativeLevelCap: z.number(),
    initialSeries: z.string(),
    freeroamRequiresCompletedSeries: z.boolean(),
  }),
  media: z.object({
    criesBytes: z.number(),
    sfxBytes: z.number(),
    itemTexturesBytes: z.number(),
    spritesBytes: z.number(),
    totalBytes: z.number(),
  }),
  files: z.object({
    speciesIndex: z.string(),
    typeChart: z.string(),
    moves: z.string(),
    abilities: z.string(),
    items: z.string(),
    balls: z.string(),
    series: z.string(),
    fossils: z.string(),
    biomes: z.string(),
    speciesDir: z.string(),
    trainersDir: z.string(),
  }),
});

const summaryShape = {
  dex: z.number().int().positive(),
  slug: z.string(),
  name: localizedTextSchema,
  searchKey: z.string(),
  types: z.array(typeIdSchema),
  generation: z.string(),
  labels: z.array(z.string()),
  bst: z.number(),
  rarity: z.object({ primary: rarityBucket.nullable(), secondary: z.array(rarityBucket) }),
  evolutionMethods: z.array(z.enum(["level", "item", "friendship", "trade", "move", "other", "none"])),
  hasSprite: z.boolean(),
  artworkId: z.number().nullable(),
};

export const speciesSummarySchema: z.ZodType<SpeciesSummary> = z.object(summaryShape);
export const speciesIndexSchema: z.ZodType<SpeciesIndexFile> = z.array(speciesSummarySchema);

const evolutionRequirementSchema = z.union([
  z.object({ kind: z.literal("level"), minLevel: z.number() }),
  z.object({ kind: z.literal("friendship"), amount: z.number() }),
  z.object({ kind: z.literal("timeRange"), range: z.string() }),
  z.object({ kind: z.literal("hasMoveType"), type: typeIdSchema }),
  z.object({ kind: z.literal("heldItem"), item: z.string() }),
  z.object({ kind: z.literal("other"), raw: z.record(z.string(), z.unknown()) }),
]);

export const evolutionEdgeSchema: z.ZodType<EvolutionEdge> = z.object({
  id: z.string(),
  from: z.number(),
  to: z.number(),
  toSlug: z.string(),
  variant: z.enum(["level_up", "item_interact", "trade", "block_click", "other"]),
  requiredItem: z.string().nullable(),
  requirements: z.array(evolutionRequirementSchema),
});

export const spawnEntrySchema: z.ZodType<SpawnEntry> = z.object({
  id: z.string(),
  source: z.string(),
  bucket: rarityBucket,
  level: z.string(),
  context: z.string(),
  presets: z.array(z.string()),
  biomes: z.array(z.string()),
  antiBiomes: z.array(z.string()),
  skyLight: z.object({ min: z.number(), max: z.number() }).nullable(),
  canSeeSky: z.boolean().nullable(),
  timeRange: z.enum(["day", "night", "any"]),
  structures: z.array(z.string()),
  neededBaseBlocks: z.array(z.string()),
  extra: z.record(z.string(), z.unknown()),
});

export const obtainRouteSchema: z.ZodType<ObtainRoute> = z.union([
  z.object({ kind: z.literal("evolution"), from: z.number(), fromSlug: z.string(), edge: evolutionEdgeSchema, fromHasSpawn: z.boolean() }),
  z.object({ kind: z.literal("fossil"), items: z.array(z.string()), source: z.string() }),
  z.object({ kind: z.literal("packSpawn"), entries: z.array(spawnEntrySchema) }),
  z.object({
    kind: z.literal("addon"),
    addon: z.enum(["legendarymonuments", "raiddens", "ultrawormholes", "summoningrituals", "ccc"]),
    entries: z.array(spawnEntrySchema).optional(),
  }),
  z.object({ kind: z.literal("breeding"), eggGroups: z.array(z.string()) }),
  z.object({ kind: z.literal("none") }),
]);

export const speciesDetailSchema: z.ZodType<SpeciesDetail> = z.object({
  ...summaryShape,
  pokedexText: localizedTextSchema.nullable(),
  height: z.number(),
  weight: z.number(),
  maleRatio: z.number(),
  catchRate: z.number(),
  baseFriendship: z.number(),
  eggCycles: z.number(),
  experienceGroup: z.string(),
  baseStats: baseStatsSchema,
  evYield: baseStatsSchema,
  abilities: z.array(abilityRef),
  eggGroups: z.array(z.string()),
  moves: z.object({
    level: z.array(z.object({ level: z.number(), move: z.string() })),
    tm: z.array(z.string()),
    egg: z.array(z.string()),
    tutor: z.array(z.string()),
  }),
  evolutions: z.array(evolutionEdgeSchema),
  preEvolution: z.object({ dex: z.number(), slug: z.string() }).nullable(),
  evolutionChain: z.object({
    root: z.number(),
    nodes: z.array(z.object({ dex: z.number(), slug: z.string(), name: localizedTextSchema, types: z.array(typeIdSchema) })),
    edges: z.array(evolutionEdgeSchema),
  }),
  forms: z.array(
    z.object({
      name: z.string(),
      aspects: z.array(z.string()),
      battleOnly: z.boolean(),
      labels: z.array(z.string()),
      types: z.array(typeIdSchema),
      baseStats: baseStatsSchema.nullable(),
      abilities: z.array(abilityRef),
      source: z.string(),
      requiredItems: z.array(z.string()),
      artworkId: z.number().nullable(),
    }),
  ),
  drops: z.array(z.object({ item: z.string(), percentage: z.number().nullable(), quantityRange: z.string().nullable() })),
  spawns: z.array(spawnEntrySchema),
  obtain: z.array(obtainRouteSchema),
  cry: z.string().nullable(),
});

const multiplier = z.union([z.literal(0), z.literal(0.5), z.literal(1), z.literal(2)]);
export const typeChartSchema = z
  .object({ attackers: z.array(typeIdSchema), matrix: z.record(typeIdSchema, z.record(typeIdSchema, multiplier)) })
  .refine(
    (v) => TYPE_ID_LIST.every((a) => v.matrix[a] && TYPE_ID_LIST.every((d) => v.matrix[a]![d] !== undefined)),
    "type chart must cover 18 x 18",
  ) as unknown as z.ZodType<TypeChartFile>;

export const moveInfoSchema: z.ZodType<MoveInfo> = z.object({
  id: z.string(),
  name: localizedTextSchema,
  description: localizedTextSchema,
  type: typeIdSchema.nullable(),
  category: z.enum(["physical", "special", "status"]).nullable(),
  power: z.number().nullable(),
  accuracy: z.number().nullable(),
  pp: z.number().nullable(),
  pokeapiId: z.number().nullable(),
});
export const movesFileSchema: z.ZodType<MovesFile> = z.record(z.string(), moveInfoSchema);

export const abilityInfoSchema: z.ZodType<AbilityInfo> = z.object({
  id: z.string(),
  name: localizedTextSchema,
  description: localizedTextSchema,
});
export const abilitiesFileSchema: z.ZodType<AbilitiesFile> = z.record(z.string(), abilityInfoSchema);

export const itemInfoSchema: z.ZodType<ItemInfo> = z.object({
  id: z.string(),
  namespace: z.string(),
  path: z.string(),
  name: localizedTextSchema,
  description: localizedTextSchema.nullable(),
  category: z.enum([
    "medicine", "ivCandy", "vitamin", "expCandy", "evolution", "held", "battle",
    "cooking", "berry", "bait", "ball", "fossil", "mint", "other",
  ]),
  texture: z.string().nullable(),
  tags: z.array(z.enum(["bait", "evBerry", "apricorn"])),
  obtain: z.array(
    z.union([
      z.object({ kind: z.literal("craftable"), recipeTypes: z.array(z.string()) }),
      z.object({
        kind: z.literal("drop"),
        from: z.array(z.object({ dex: z.number(), percentage: z.number().nullable(), quantityRange: z.string().nullable() })),
      }),
      z.object({ kind: z.literal("plantable"), biomeTags: z.array(z.string()), mulches: z.array(z.string()) }),
      z.object({ kind: z.literal("structureLoot"), tables: z.array(z.string()) }),
      z.object({ kind: z.literal("fishing") }),
      z.object({ kind: z.literal("fossilRevive"), species: z.array(z.number()) }),
      z.object({ kind: z.literal("none") }),
    ]),
  ),
  usedIn: z.object({
    evolutions: z.array(z.object({ from: z.number(), to: z.number() })),
    fossils: z.array(z.number()),
    forms: z.array(z.object({ dex: z.number(), form: z.string() })),
    ball: z.boolean(),
  }),
  cooking: z.object({ effectNote: z.literal("pending") }).nullable(),
});
export const itemsFileSchema: z.ZodType<ItemsFile> = z.record(z.string(), itemInfoSchema);

const ballCondition = z.enum([
  "firstTurn", "lightLevel0", "turn10", "targetLevelBelow30", "playerLevelHigher", "fullMoonNight", "fishing",
  "submerged", "registeredCaught", "oppositeGender", "sleeping", "forestOrPlains", "outsideBattle", "heavyTarget", "ultraBeast",
]);
export const ballInfoSchema: z.ZodType<BallInfo> = z.object({
  id: z.string(),
  itemId: z.string(),
  name: localizedTextSchema,
  effect: localizedTextSchema,
  rule: z.union([
    z.object({ kind: z.literal("flat"), multiplier: z.number() }),
    z.object({ kind: z.literal("guaranteed") }),
    z.object({
      kind: z.literal("conditional"),
      bestMultiplier: z.number(),
      worstMultiplier: z.number(),
      condition: ballCondition,
      applies: z
        .object({
          types: z.array(typeIdSchema).optional(),
          minBaseSpeed: z.number().optional(),
          label: z.string().optional(),
          spawnContext: z.array(z.string()).optional(),
          genderless: z.literal(false).optional(),
        })
        .optional(),
    }),
  ]),
  tags: z.array(z.enum(["night", "water", "fishing", "first", "caught", "after"])),
});
export const ballsFileSchema: z.ZodType<BallsFile> = z.array(ballInfoSchema);

export const seriesFileSchema: z.ZodType<SeriesFile> = z.array(
  z.object({
    id: z.string(),
    title: localizedTextSchema,
    description: localizedTextSchema,
    difficulty: z.number().nullable(),
    requiredSeries: z.array(z.array(z.string())),
    special: z.literal("freeroam").nullable(),
    keyTrainerIds: z.array(z.string()),
    trainersFile: z.string(),
  }),
);

export const trainersFileSchema: z.ZodType<TrainersFile> = z.object({
  seriesId: z.string(),
  trainers: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      typeLabel: localizedTextSchema,
      optional: z.boolean(),
      requiredDefeats: z.array(z.array(z.string())),
      signatureItem: z.string().nullable(),
      biomes: z.object({ whitelist: z.array(z.string()), blacklist: z.array(z.string()) }),
      source: z.enum(["rctmod", "kubejs"]),
      team: z.array(
        z.object({
          species: z.string(),
          dex: z.number().nullable(),
          level: z.number(),
          gender: z.string().nullable(),
          nature: z.string().nullable(),
          ability: z.string().nullable(),
          moveset: z.array(z.string()),
          heldItem: z.string().nullable(),
        }),
      ),
      maxTeamLevel: z.number(),
      bag: z.array(z.object({ item: z.string(), quantity: z.number() })),
    }),
  ),
});

export const fossilsFileSchema: z.ZodType<FossilsFile> = z.array(
  z.object({ result: z.number(), resultSlug: z.string(), fossils: z.array(z.string()), source: z.string() }),
);

export const biomeLabelsSchema: z.ZodType<BiomeLabels> = z.record(z.string(), localizedTextSchema);
