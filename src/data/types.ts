// Contrato compartilhado do dataset (SPEC secao 5.1.3, 5.1.5, 5.1.6).
// Escrito completo na Onda 0 (B1.5) e CONGELADO durante as Ondas 1 e 1b: mudancas voltam ao orquestrador.
// Somente tipos (nenhum valor). Importado pelo app (src/) e pelo pipeline (tools/dataset) via "@dataset-types".

/** Ids dos 18 tipos, no formato do Cobblemon. */
export type TypeId =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

/** Texto bilingue (pt-BR / en). */
export interface LocalizedText {
  pt: string;
  en: string;
}

// ---------------------------------------------------------------------------
// dataset-manifest.json
// ---------------------------------------------------------------------------

export interface DatasetCounts {
  species: number;
  spawnEntries: number;
  fossilRoutes: number;
  moves: number;
  abilities: number;
  items: number;
  balls: number;
  trainers: number;
  keyTrainers: Record<string, number>;
  series: number;
  cries: number;
  itemTextures: number;
  sprites: number;
}

export interface LevelCapConfig {
  initialLevelCap: number;
  relativeLevelCap: number;
  initialSeries: string;
  freeroamRequiresCompletedSeries: boolean;
}

export interface MediaTotals {
  criesBytes: number;
  sfxBytes: number;
  itemTexturesBytes: number;
  spritesBytes: number;
  totalBytes: number;
}

export interface DatasetFiles {
  speciesIndex: string;
  typeChart: string;
  moves: string;
  abilities: string;
  items: string;
  balls: string;
  series: string;
  fossils: string;
  biomes: string;
  speciesDir: string;
  trainersDir: string;
}

export interface DatasetSource {
  file: string;
  sizeBytes: number;
  mtime: string;
}

export interface PackInfo {
  name: string;
  version: string;
  minecraft: string;
}

export interface DatasetManifest {
  /** ex. "atm1.3.0-cobblemon1.7.3-20260923-3f9a1c2b" */
  datasetVersion: string;
  /** ISO */
  generatedAt: string;
  /** "All the Mons", "1.3.0", "1.21.1" */
  pack: PackInfo;
  /** "1.7.3" */
  cobblemonVersion: string;
  /** jars/pastas lidos (fingerprint) */
  sources: DatasetSource[];
  counts: DatasetCounts;
  levelCapConfig: LevelCapConfig;
  media: MediaTotals;
  files: DatasetFiles;
}

/** public/data/current.json */
export interface CurrentDatasetPointer {
  datasetVersion: string;
}

// ---------------------------------------------------------------------------
// species-index.json / species/<dex>.json
// ---------------------------------------------------------------------------

export type RarityBucket = "common" | "uncommon" | "rare" | "ultra-rare";

/** primary null = sem spawn (secao 5.1.4). */
export interface RarityInfo {
  primary: RarityBucket | null;
  secondary: RarityBucket[];
}

/** Filtro RF-13; ["none"] quando a especie nao evolui. */
export type EvolutionMethod = "level" | "item" | "friendship" | "trade" | "move" | "other" | "none";

export interface SpeciesSummary {
  /** nationalPokedexNumber (1..1025, 9901, 9902) */
  dex: number;
  /** id do Cobblemon, ex. "charizard" */
  slug: string;
  name: LocalizedText;
  /** nomes pt e en normalizados (normalizeSearch) separados por "|" */
  searchKey: string;
  types: TypeId[];
  /** "gen1".."gen9", "gen7b", "gen8a" ou "custom" */
  generation: string;
  /** inclui "legendary" | "mythical" | "ultra_beast" | "custom" quando presentes */
  labels: string[];
  bst: number;
  rarity: RarityInfo;
  evolutionMethods: EvolutionMethod[];
  /** false para 9901/9902 */
  hasSprite: boolean;
  /** id da PokeAPI para artwork (== dex; null para custom) */
  artworkId: number | null;
}

export type SpeciesIndexFile = SpeciesSummary[];

export interface BaseStats {
  hp: number;
  attack: number;
  defence: number;
  specialAttack: number;
  specialDefence: number;
  speed: number;
}

export interface AbilityRef {
  id: string;
  hidden: boolean;
}

export interface SpeciesMoves {
  level: { level: number; move: string }[];
  tm: string[];
  egg: string[];
  tutor: string[];
}

export interface SpeciesDrop {
  item: string;
  percentage: number | null;
  quantityRange: string | null;
}

export type EvolutionRequirement =
  | { kind: "level"; minLevel: number }
  | { kind: "friendship"; amount: number }
  | { kind: "timeRange"; range: string }
  | { kind: "hasMoveType"; type: TypeId }
  | { kind: "heldItem"; item: string }
  | { kind: "other"; raw: Record<string, unknown> };

export type EvolutionVariant = "level_up" | "item_interact" | "trade" | "block_click" | "other";

export interface EvolutionEdge {
  id: string;
  from: number;
  to: number;
  toSlug: string;
  variant: EvolutionVariant;
  /** ex. "cobblemon:thunder_stone" */
  requiredItem: string | null;
  requirements: EvolutionRequirement[];
}

export interface EvolutionChainNode {
  dex: number;
  slug: string;
  name: LocalizedText;
  types: TypeId[];
}

export interface EvolutionChain {
  root: number;
  nodes: EvolutionChainNode[];
  edges: EvolutionEdge[];
}

export interface SpeciesForm {
  /** "Mega-X" | "Mega-Y" | "Gmax" | "Mega-Z" | "Patrickyu" | regionais */
  name: string;
  aspects: string[];
  battleOnly: boolean;
  labels: string[];
  types: TypeId[];
  baseStats: BaseStats | null;
  abilities: AbilityRef[];
  /** "cobblemon" | "mega_showdown" | "zamega" | "allthemons" | ... */
  source: string;
  /** ids de item resolvidos, ex. ["mega_showdown:charizardite_x","mega_showdown:keystone"] */
  requiredItems: string[];
  /** id da PokeAPI da variante (charizard-mega-x -> 10034), null se nao existir */
  artworkId: number | null;
}

export type SpawnTimeRange = "day" | "night" | "any";

/** Multiplicador de peso cuja condicao e SO nivel de Lure (spawn-bait RF-46). null = sem limite nesse lado. */
export interface SpawnLureMultiplier {
  lureMin: number | null;
  lureMax: number | null;
  multiplier: number;
}

/** Condicoes de pesca tipadas (spawn-bait RF-41/RF-46); null no SpawnEntry quando o spawn nao tem nenhuma. */
export interface SpawnFishing {
  /** condition.bait: isca exigida na vara, ex. "cobblemon:love_sweet" */
  bait: string | null;
  /** condition.rodType, ex. "cobblemon:love_rod" */
  rodType: string | null;
  /** pokeBallId da vara (data/<ns>/pokerods/<path>.json), ex. "cobblemon:love_ball"; null sem rodType ou sem arquivo */
  rodBall: string | null;
  minLureLevel: number | null;
  maxLureLevel: number | null;
  /** weightMultiplier (objeto) + weightMultipliers (lista) com condicao so de Lure, singular primeiro, ordem do arquivo */
  lureMultipliers: SpawnLureMultiplier[];
}

export interface SpawnEntry {
  id: string;
  source: string;
  bucket: RarityBucket;
  /** ex. "5-33" */
  level: string;
  /** "grounded" | "submerged" | "surface" | "fishing" | ... */
  context: string;
  presets: string[];
  /** tags/ids brutos, ex. "#cobblemon:is_overworld" */
  biomes: string[];
  antiBiomes: string[];
  skyLight: { min: number; max: number } | null;
  canSeeSky: boolean | null;
  /** vem de condition.timeRange quando existir, senao "any" */
  timeRange: SpawnTimeRange;
  structures: string[];
  neededBaseBlocks: string[];
  fishing: SpawnFishing | null;
  extra: Record<string, unknown>;
}

/** Addons com texto curto fixo em i18n (obtain.addon.<addon>). */
export type ObtainAddon = "legendarymonuments" | "raiddens" | "ultrawormholes" | "summoningrituals" | "ccc";

/** Rotas "Como obter" da especie (secao 5.1.5), ja na ordem de confianca. */
export type ObtainRoute =
  | { kind: "evolution"; from: number; fromSlug: string; edge: EvolutionEdge; fromHasSpawn: boolean }
  | { kind: "fossil"; items: string[]; source: string }
  | { kind: "packSpawn"; entries: SpawnEntry[] }
  | { kind: "addon"; addon: ObtainAddon; entries?: SpawnEntry[] }
  | { kind: "breeding"; eggGroups: string[] }
  | { kind: "none" };

export interface SpeciesDetail extends SpeciesSummary {
  pokedexText: LocalizedText | null;
  /** como no Cobblemon (dm, hg); Charizard 17 / 905 */
  height: number;
  weight: number;
  /** -1 = sem genero */
  maleRatio: number;
  catchRate: number;
  baseFriendship: number;
  eggCycles: number;
  experienceGroup: string;
  baseStats: BaseStats;
  evYield: BaseStats;
  abilities: AbilityRef[];
  /** ids do Cobblemon, ex. "monster","dragon","undiscovered" */
  eggGroups: string[];
  moves: SpeciesMoves;
  /** saidas desta especie */
  evolutions: EvolutionEdge[];
  preEvolution: { dex: number; slug: string } | null;
  evolutionChain: EvolutionChain;
  /** [] quando nao ha; nunca inclui a forma base */
  forms: SpeciesForm[];
  /** achatado de drops.entries[] (amount descartado de proposito) */
  drops: SpeciesDrop[];
  spawns: SpawnEntry[];
  obtain: ObtainRoute[];
  /** "charizard" -> assets/cries/charizard.ogg */
  cry: string | null;
}

// ---------------------------------------------------------------------------
// type-chart.json
// ---------------------------------------------------------------------------

export type TypeMultiplier = 0 | 0.5 | 1 | 2;

/** atacante -> defensor -> multiplicador */
export interface TypeChartFile {
  attackers: TypeId[];
  matrix: Record<TypeId, Record<TypeId, TypeMultiplier>>;
}

// ---------------------------------------------------------------------------
// moves.json / abilities.json
// ---------------------------------------------------------------------------

export type MoveCategory = "physical" | "special" | "status";

export interface MoveInfo {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  type: TypeId | null;
  category: MoveCategory | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  pokeapiId: number | null;
}

export type MovesFile = Record<string, MoveInfo>;

export interface AbilityInfo {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
}

export type AbilitiesFile = Record<string, AbilityInfo>;

// ---------------------------------------------------------------------------
// items.json
// ---------------------------------------------------------------------------

export type ItemCategory =
  | "medicine"
  | "ivCandy"
  | "vitamin"
  | "expCandy"
  | "evolution"
  | "held"
  | "battle"
  | "cooking"
  | "berry"
  | "bait"
  | "ball"
  | "fossil"
  | "mint"
  | "other";

export type ItemTag = "bait" | "evBerry" | "apricorn";

/** Tipos de efeito de isca publicados (type "cobblemon:<snake>" do spawn_bait_effects em camelCase). */
export type BaitEffectKind =
  | "typing" | "eggGroup" | "nature" | "ev" | "iv" | "biteTime" | "levelRaise"
  | "pokemonChance" | "genderChance" | "haChance" | "friendship" | "dropsReroll" | "shinyReroll" | "rarityBucket";

export interface BaitEffect {
  kind: BaitEffectKind;
  /** path da subcategoria sem namespace ("fire", "water_1", "atk", "male"); null quando o efeito nao tem */
  subcategory: string | null;
  /** 0..1 */
  chance: number;
  /** valor cru do arquivo; null quando ausente (pokemon_chance, ha_chance, gender_chance) */
  value: number | null;
  /** tooltip do jogo renderizado (cobblemon.fishing_bait_effects.<tipo>.tooltip), PT cai para EN */
  text: LocalizedText;
}

export interface ItemBait {
  /** na ordem do arquivo vencedor (kubejs > jar) */
  effects: BaitEffect[];
  /** aceito como tempero pela Panela de Fogueira (tag bait_seasoning + excecao curada) */
  seasoning: boolean;
}

export type RecipeIngredient =
  | { kind: "item"; id: string; count: number; name: LocalizedText | null }
  | { kind: "tag"; id: string; count: number };

/** Receita da Panela de Fogueira com temperos de isca (Poke-Lanche, Pokeisca). */
export interface PotRecipe {
  /** id da receita, ex. "cobblemon:campfire_pot/poke_snack" */
  recipeId: string;
  /** "cobblemon:cooking_pot" | "cobblemon:cooking_pot_shapeless" */
  recipeType: string;
  /** "cobblemon:recipe_filters/bait_seasoning" */
  seasoningTag: string;
  ingredients: RecipeIngredient[];
}

/** Rotas "Como obter" do item (secao 5.1.6). */
export type ItemObtainRoute =
  | { kind: "craftable"; recipeTypes: string[]; potRecipes?: PotRecipe[] }
  | { kind: "drop"; from: { dex: number; percentage: number | null; quantityRange: string | null }[] }
  | { kind: "plantable"; biomeTags: string[]; mulches: string[] }
  | { kind: "structureLoot"; tables: string[] }
  | { kind: "fishing" }
  | { kind: "fossilRevive"; species: number[] }
  | { kind: "trainerDrop"; trainers: ItemTrainerDrop[] }
  /** Quebrar um bloco que solta o item (contrato v2, U7c). Bloco que so solta ele mesmo nao conta. */
  | { kind: "blockDrop"; blocks: ItemNamedRef[] }
  /** Mobs (entities/...), inclusive global loot modifiers de bosses. */
  | { kind: "mobDrop"; mobs: ItemNamedRef[] }
  /** Recompensas do FTB Quests. */
  | { kind: "questReward"; quests: ItemQuestRef[] }
  /** Loja de BP da Battle Tower. */
  | { kind: "shop"; shop: ItemShopId; price: number | null }
  /** Item ja colocado em estrutura .nbt (vitrine, moldura, recompensa de trial spawner). */
  | { kind: "structurePlaced"; structures: ItemNamedRef[] }
  /** Summoning Rituals (kubejs): ids dos rituais. */
  | { kind: "ritual"; rituals: string[] }
  /** Troca com aldeao / vendedor ambulante. */
  | { kind: "trade"; traders: ItemTrader[] }
  /** Gerado no mundo (features de worldgen), so com prova. */
  | { kind: "worldgen"; features: string[] }
  /** Mecanica pontual provada por arquivo/config; evidence = "arquivo:chave". */
  | { kind: "special"; note: LocalizedText; evidence: string }
  /** Comprovadamente sem rota no pack (U7d): so no modo criativo ou nem registrado no jogo. */
  | { kind: "unobtainable"; reason?: ItemUnobtainableReason }
  | { kind: "none" };

export type ItemUnobtainableReason = "creativeOnly" | "notRegistered";

/** Referencia com nome do lang do pack (null quando o jogo nao tem nome). */
export interface ItemNamedRef {
  id: string;
  name: LocalizedText | null;
}

export interface ItemQuestRef {
  chapter: LocalizedText | null;
  title: LocalizedText | null;
}

export type ItemShopId = "battleTowerBp";

export type ItemTrader = "wanderingTrader" | "villager";

/** Um treinador que dropa o item (loot rctmod do kubejs, U5a). */
export interface ItemTrainerDrop {
  /** TrainerInfo.id */
  id: string;
  /** TrainerInfo.name; null se o treinador nao esta em trainers/*.json */
  name: string | null;
  /** SeriesInfo.id cujo trainersFile tem o treinador; null se nao esta */
  series: string | null;
  /** 0..1 por vitoria; 1 = garantido; null = nao calculavel */
  chance: number | null;
  /** condicao rctmod:level_range crua (semantica nao confirmada: a UI nao mostra) */
  levelRange: { min: number; max: number } | null;
  /** so na primeira vitoria (rctmod:defeat_count == 1) */
  firstDefeatOnly: boolean;
}

export interface ItemUsedIn {
  evolutions: { from: number; to: number }[];
  fossils: number[];
  forms: { dex: number; form: string }[];
  ball: boolean;
}

/** berry-mutations: variante de spawn natural da baga (spawnConditions[].variant sem namespace, em camelCase). */
export type BerrySpawnVariant = "preferredBiome" | "allBiome" | "specificBiome";

export interface BerrySpawn {
  variant: BerrySpawnVariant;
  /** preferredBiome = preferredBiomeTags da baga; specificBiome = [biome] (tag); allBiome = [] */
  biomeTags: string[];
}

/** Par nao ordenado que gera a baga (a < b por code unit). */
export interface BerryMutationPair {
  a: string;
  b: string;
}

/** Cruzamento em que a baga e ingrediente: esta baga + partner = result. */
export interface BerryMutationUse {
  partner: string;
  result: string;
}

/** Origem e cruzamentos da baga (data/cobblemon/berries/<id>.json); null em todo item sem esse arquivo. */
export interface ItemBerry {
  /** spawnConditions resolvidas; [] = nao nasce no mundo */
  spawn: BerrySpawn[];
  /** pares que geram esta baga, cada par uma vez, ordenados por a e depois b */
  mutationPairs: BerryMutationPair[];
  /** cruzamentos em que esta baga entra, ordenados por partner e depois result */
  mutationUses: BerryMutationUse[];
}

export interface ItemInfo {
  /** id completo, ex. "cobblemon:potion" */
  id: string;
  namespace: string;
  path: string;
  name: LocalizedText;
  /** .tooltip do lang */
  description: LocalizedText | null;
  category: ItemCategory;
  /** ex. "assets/items/cobblemon/potion.png" */
  texture: string | null;
  tags: ItemTag[];
  obtain: ItemObtainRoute[];
  usedIn: ItemUsedIn;
  /** itens de cozinha sem efeito numerico confirmado */
  cooking: { effectNote: "pending" } | null;
  /** efeitos de isca (spawn_bait_effects); null quando o item nao tem arquivo de efeito */
  bait: ItemBait | null;
  /** berry-mutations: origem e cruzamentos; null quando o item nao tem arquivo em data/cobblemon/berries/ */
  berry: ItemBerry | null;
}

export type ItemsFile = Record<string, ItemInfo>;

// ---------------------------------------------------------------------------
// balls.json
// ---------------------------------------------------------------------------

export type BallCondition =
  | "firstTurn"
  | "lightLevel0"
  | "turn10"
  | "targetLevelBelow30"
  | "playerLevelHigher"
  | "fullMoonNight"
  | "fishing"
  | "submerged"
  | "registeredCaught"
  | "oppositeGender"
  | "sleeping"
  | "forestOrPlains"
  | "outsideBattle"
  | "heavyTarget"
  | "ultraBeast"
  | "minBaseSpeedAbove"
  | "hasAnyType";

export interface BallApplies {
  types?: TypeId[];
  minBaseSpeed?: number;
  label?: string;
  spawnContext?: string[];
  genderless?: false;
}

/** heavyTarget NAO usa `applies`: multiplicador sai da faixa de peso (HEAVY_BALL_BANDS). */
export type BallRule =
  | { kind: "flat"; multiplier: number }
  | { kind: "guaranteed" }
  | {
      kind: "conditional";
      bestMultiplier: number;
      worstMultiplier: number;
      condition: BallCondition;
      applies?: BallApplies;
    };

export type BallTag = "night" | "water" | "fishing" | "first" | "caught" | "after";

export interface BallInfo {
  id: string;
  itemId: string;
  name: LocalizedText;
  effect: LocalizedText;
  rule: BallRule;
  tags: BallTag[];
}

export type BallsFile = BallInfo[];

// ---------------------------------------------------------------------------
// series.json / trainers/<seriesId>.json
// ---------------------------------------------------------------------------

export interface SeriesInfo {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  difficulty: number | null;
  requiredSeries: string[][];
  special: "freeroam" | null;
  keyTrainerIds: string[];
  trainersFile: string;
}

export type SeriesFile = SeriesInfo[];

export interface TrainerTeamMember {
  species: string;
  dex: number | null;
  level: number;
  gender: string | null;
  nature: string | null;
  ability: string | null;
  moveset: string[];
  /** 0 a 2 ids de item com namespace, ordem do cru (auditoria T1: antes `heldItem: string | null`). */
  heldItems: string[];
}

export interface TrainerInfo {
  id: string;
  name: string;
  type: string;
  typeLabel: LocalizedText;
  optional: boolean;
  requiredDefeats: string[][];
  signatureItem: string | null;
  biomes: { whitelist: string[]; blacklist: string[] };
  source: "rctmod" | "kubejs";
  team: TrainerTeamMember[];
  maxTeamLevel: number;
  bag: { item: string; quantity: number }[];
}

export interface TrainersFile {
  seriesId: string;
  trainers: TrainerInfo[];
}

// ---------------------------------------------------------------------------
// fossils.json / biomes.json
// ---------------------------------------------------------------------------

export interface FossilRoute {
  result: number;
  resultSlug: string;
  fossils: string[];
  source: string;
}

export type FossilsFile = FossilRoute[];

/** tag -> rotulo humanizado */
export type BiomeLabels = Record<string, LocalizedText>;
