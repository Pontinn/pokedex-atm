// B3.2: catalogo de golpes (mecanica via PokeAPI; nome/descricao do lang).
import type { LocalizedText, MoveCategory, MovesFile, TypeId } from "../../../src/data/types";
import type { PipelineContext } from "./context";
import { createPokeapiClient, type PokeapiClient } from "./pokeapi/client";
import { MOVE_ALIASES } from "./pokeapi/move-aliases";
import { writeJsonAtomic } from "./lib/fs-atomic";

/** so [a-z0-9], minusculo (SPEC B3.2 passo 1). */
export function normalizeMoveToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export interface PokeapiMoveListEntry {
  name: string;
  url: string;
}

export interface PokeapiMoveDetail {
  id: number;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  type?: { name: string } | null;
  damage_class?: { name: string } | null;
}

function humanize(id: string): LocalizedText {
  const text = id
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return { pt: text, en: text };
}

/**
 * Uniao de todos os moves das especies (base; formas nao incluem moves no schema de saida).
 * O lang do Cobblemon tambem tem `cobblemon.move.<id>.desc` para golpes que NENHUMA especie usa
 * (Z-Moves e golpes G-Max, ex. "gmaxwildfire", "aciddownpour"): confirmado que a PokeAPI publica
 * NAO modela esses golpes (404 em /move/g-max-wildfire), entao usa-los aqui faria o build falhar
 * por um golpe que a UI nunca precisa (nenhuma especie o aprende). Por isso a fonte e SO as especies.
 */
export function collectMoveIds(ctx: PipelineContext): Set<string> {
  const ids = new Set<string>();
  for (const species of ctx.species.values()) {
    for (const entry of species.moves.level) ids.add(entry.move);
    for (const move of species.moves.tm) ids.add(move);
    for (const move of species.moves.egg) ids.add(move);
    for (const move of species.moves.tutor) ids.add(move);
  }
  return ids;
}

/** Constroi moves.json; lanca erro listando os golpes sem correspondencia na PokeAPI (R1: build nunca prossegue com dados parciais). */
export async function buildMoves(
  ctx: PipelineContext,
  client: PokeapiClient,
): Promise<{ moves: MovesFile; unmatched: string[] }> {
  const ids = [...collectMoveIds(ctx)].sort();
  const list = await client.getJson<{ results: PokeapiMoveListEntry[] }>("/move?limit=2000");
  if (!list) throw new Error("E_POKEAPI_UNAVAILABLE: lista de golpes (move?limit=2000) indisponivel");
  const byNormalized = new Map<string, PokeapiMoveListEntry>();
  for (const entry of list.results) byNormalized.set(normalizeMoveToken(entry.name), entry);

  const moves: MovesFile = {};
  const unmatched: string[] = [];
  for (const id of ids) {
    const aliasTarget = MOVE_ALIASES[id] ?? id;
    const entry = byNormalized.get(normalizeMoveToken(aliasTarget));
    if (!entry) {
      unmatched.push(id);
      continue;
    }
    const detail = await client.getJson<PokeapiMoveDetail>(entry.url);
    if (!detail) {
      unmatched.push(id);
      continue;
    }
    const langName = ctx.lang.text(`cobblemon.move.${id}`);
    const langDesc = ctx.lang.text(`cobblemon.move.${id}.desc`);
    if (!langName) ctx.report.warn("W_MOVE_NO_LANG", `golpe sem nome no lang: ${id}`);
    moves[id] = {
      id,
      name: langName ?? humanize(id),
      description: langDesc ?? { pt: "", en: "" },
      type: (detail.type?.name as TypeId | undefined) ?? null,
      category: (detail.damage_class?.name as MoveCategory | undefined) ?? null,
      power: detail.power ?? null,
      accuracy: detail.accuracy ?? null,
      pp: detail.pp ?? null,
      pokeapiId: detail.id ?? null,
    };
  }
  return { moves, unmatched };
}

export async function runMoves(ctx: PipelineContext, client?: PokeapiClient): Promise<void> {
  const pokeapi = client ?? createPokeapiClient({ cacheDir: ctx.cacheDir("pokeapi"), offline: ctx.flags.offline });
  const { moves, unmatched } = await buildMoves(ctx, pokeapi);
  if (unmatched.length > 0) {
    throw new Error(`E_MOVE_UNMATCHED: ${unmatched.length} golpe(s) sem correspondencia na PokeAPI: ${unmatched.join(", ")}`);
  }
  ctx.setCount("moves", Object.keys(moves).length);
  writeJsonAtomic(ctx.dataPath("moves.json"), moves);
}
