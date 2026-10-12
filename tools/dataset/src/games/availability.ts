// pokemon-generation B1.2: regra dos jogos principais aplicada no build sobre o recorte curado da PokeAPI.
// Pura: sem rede e sem cache, so le o arquivo versionado em tools/dataset/curated/ (o coletor fica em snapshot.ts).
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { DatasetSource, GameInfo } from "../../../../src/data/types";
import { PipelineError } from "../lib/errors";

/** Recorte curado (gerado por npm run dataset:snapshot-games, versionado). */
export const GAME_SNAPSHOT_FILE = path.resolve(import.meta.dirname, "../../curated/pokeapi-game-availability.json");
/** Caminho do recorte relativo a raiz do repo, como aparece em dataset-manifest.json sources. */
const GAME_SNAPSHOT_SOURCE_PATH = "tools/dataset/curated/pokeapi-game-availability.json";

/** IDEA secao 2: edicoes so do Japao (mesma dex kanto) e spin-off. */
export const EXCLUDED_VERSION_GROUPS = ["red-green-japan", "blue-japan", "champions"] as const;
/** national nao e jogo; conquest-gallery e spin-off. */
export const EXCLUDED_POKEDEXES = ["national", "conquest-gallery"] as const;

const positiveInt = z.number().int().positive();

export const gameSnapshotSchema = z
  .object({
    source: z
      .object({
        api: z.string().url(),
        capturedAt: z.string().datetime(),
        script: z.string().min(1),
        license: z.string().min(1),
        urls: z.array(z.string().startsWith("/")).min(1),
      })
      .strict(),
    pokemonSpeciesIds: z.array(positiveInt).min(1),
    versionGroups: z.array(
      z
        .object({
          id: positiveInt,
          name: z.string().min(1),
          order: z.number().int(),
          pokedexes: z.array(z.string()),
          versions: z.array(z.object({ name: z.string().min(1), nameEn: z.string().min(1) }).strict()).min(1),
        })
        .strict(),
    ),
    pokedexes: z.array(
      z
        .object({
          id: positiveInt,
          name: z.string().min(1),
          isMainSeries: z.boolean(),
          versionGroups: z.array(z.string()),
          species: z.array(positiveInt),
        })
        .strict(),
    ),
  })
  .strict();

export type GameSnapshot = z.infer<typeof gameSnapshotSchema>;

function invalid(message: string, detail?: string): PipelineError {
  return new PipelineError("E_GAME_SNAPSHOT_INVALID", message, detail);
}

/** Le e valida o recorte curado. Ausente = E_GAME_SNAPSHOT_MISSING; JSON ou forma invalida = E_GAME_SNAPSHOT_INVALID. */
export function loadGameSnapshot(file = GAME_SNAPSHOT_FILE): GameSnapshot {
  if (!existsSync(file)) {
    throw new PipelineError("E_GAME_SNAPSHOT_MISSING", "recorte curado de jogos ausente; rode npm run dataset:snapshot-games", file);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw invalid(`recorte curado de jogos nao e JSON valido: ${String(error)}`, file);
  }
  const parsed = gameSnapshotSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`);
    throw invalid(`recorte curado de jogos fora do formato: ${issues.join("; ")}`, file);
  }
  return parsed.data;
}

/** Jogo derivado: o GameInfo publicado + ordem e Pokedexes elegiveis (so para o build e o report). */
export interface DerivedGame extends GameInfo {
  order: number;
  pokedexes: string[];
}

function assertUnique(values: readonly (string | number)[], what: string): void {
  const seen = new Set<string | number>();
  for (const v of values) {
    if (seen.has(v)) throw invalid(`${what} duplicado no recorte: ${v}`);
    seen.add(v);
  }
}

/** Integridade: ids e nomes sem duplicata; version-group <-> Pokedex espelhados nos dois sentidos. */
function assertIntegrity(s: GameSnapshot): void {
  assertUnique(s.versionGroups.map((g) => g.id), "id de version-group");
  assertUnique(s.versionGroups.map((g) => g.name), "nome de version-group");
  assertUnique(s.pokedexes.map((p) => p.id), "id de Pokedex");
  assertUnique(s.pokedexes.map((p) => p.name), "nome de Pokedex");
  const groupByName = new Map(s.versionGroups.map((g) => [g.name, g]));
  const dexByName = new Map(s.pokedexes.map((p) => [p.name, p]));
  for (const g of s.versionGroups) {
    for (const name of g.pokedexes) {
      const dex = dexByName.get(name);
      if (!dex) throw invalid(`version-group ${g.name} aponta Pokedex inexistente: ${name}`);
      if (!dex.versionGroups.includes(g.name)) throw invalid(`espelho quebrado: Pokedex ${name} nao lista o version-group ${g.name}`);
    }
  }
  for (const p of s.pokedexes) {
    for (const name of p.versionGroups) {
      const group = groupByName.get(name);
      if (!group) throw invalid(`Pokedex ${p.name} aponta version-group inexistente: ${name}`);
      if (!group.pokedexes.includes(p.name)) throw invalid(`espelho quebrado: version-group ${name} nao lista a Pokedex ${p.name}`);
    }
  }
}

function isProperSubset(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size >= b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

/**
 * Regra da IDEA secao 2 (SPEC 2.5 item 1): Pokedex elegivel = main series fora de EXCLUDED_POKEDEXES; candidato =
 * version-group fora de EXCLUDED_VERSION_GROUPS com >= 1 Pokedex elegivel; DLC = candidato cujo conjunto de
 * Pokedexes elegiveis e subconjunto PROPRIO do de outro candidato (descartado: ja esta no jogo base). Conjuntos
 * iguais nao fundem. Ordem cronologica por version-group.order, desempate por id.
 */
export function deriveGames(s: GameSnapshot): DerivedGame[] {
  assertIntegrity(s);
  const excludedDex = new Set<string>(EXCLUDED_POKEDEXES);
  const excludedGroups = new Set<string>(EXCLUDED_VERSION_GROUPS);
  const eligibleDex = new Set(s.pokedexes.filter((p) => p.isMainSeries && !excludedDex.has(p.name)).map((p) => p.name));

  const candidates = s.versionGroups
    .filter((g) => !excludedGroups.has(g.name))
    .map((g) => ({ group: g, dexes: g.pokedexes.filter((name) => eligibleDex.has(name)) }))
    .filter((c) => c.dexes.length > 0)
    .map((c) => ({ ...c, set: new Set(c.dexes) }));

  const games = candidates
    .filter((c) => !candidates.some((other) => other !== c && isProperSubset(c.set, other.set)))
    .map(
      ({ group, dexes }): DerivedGame => ({
        id: group.id,
        slug: group.name,
        name: group.versions.map((v) => v.nameEn).join(" / "),
        order: group.order,
        pokedexes: dexes,
      }),
    )
    .sort((a, b) => a.order - b.order || a.id - b.id);

  if (games.length === 0) throw invalid("nenhum jogo principal derivado do recorte");
  return games;
}

/** especie -> ids de jogo na ordem de `games` (uniao das Pokedexes elegiveis de cada jogo, sem duplicata). */
export function buildGameAvailability(s: GameSnapshot, games: readonly DerivedGame[]): Map<number, number[]> {
  const speciesByDex = new Map(s.pokedexes.map((p) => [p.name, p.species]));
  const availability = new Map<number, number[]>();
  for (const game of games) {
    const inGame = new Set<number>();
    for (const name of game.pokedexes) for (const dex of speciesByDex.get(name) ?? []) inGame.add(dex);
    for (const dex of inGame) {
      const list = availability.get(dex);
      if (list) list.push(game.id);
      else availability.set(dex, [game.id]);
    }
  }
  return availability;
}

/**
 * Juncao so por numero (SPEC 2.5 item 2): custom -> null (so no pack), mas erro se o numero colide com uma especie
 * oficial do recorte; oficial fora de pokemon-species -> erro (build falha); senao a lista (vazia = sem jogo).
 */
export function gamesForSpecies(
  dex: number,
  generation: string,
  availability: ReadonlyMap<number, number[]>,
  speciesIds: ReadonlySet<number>,
): number[] | null {
  if (generation === "custom") {
    if (speciesIds.has(dex)) {
      throw new PipelineError("E_GAMES_CUSTOM_IN_SOURCE", `especie custom ${dex} colide com um numero oficial da PokeAPI`, String(dex));
    }
    return null;
  }
  if (!speciesIds.has(dex)) {
    throw new PipelineError("E_GAMES_NO_SOURCE", `especie ${dex} ausente em pokemon-species do recorte de jogos`, String(dex));
  }
  return [...(availability.get(dex) ?? [])];
}

/** Entrada canonica de dataset-manifest.json sources: tamanho do JSON compacto e data da captura (igual em qualquer PC). */
export function gameSnapshotSource(s: GameSnapshot): DatasetSource {
  return { file: GAME_SNAPSHOT_SOURCE_PATH, sizeBytes: Buffer.byteLength(JSON.stringify(s)), mtime: s.source.capturedAt };
}
