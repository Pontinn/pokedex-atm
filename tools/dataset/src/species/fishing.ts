// spawn-bait B1.2: condicoes de pesca tipadas do spawn (SPEC 2.4 item 10, RF-41/RF-46).
import type { SpawnFishing, SpawnLureMultiplier } from "../../../../src/data/types";
import type { PipelineContext } from "../context";
import { parseJsonStrict, readJsonEntries } from "../jar-reader";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

export const LURE_KEYS = new Set(["minLureLevel", "maxLureLevel"]);
const POKEROD_PREFIX = "data/cobblemon/pokerods/";
const KUBEJS_POKEROD_DIR = "kubejs/data/cobblemon/pokerods";

/** Condicao com pelo menos uma chave e todas de nivel de Lure (valores numericos). */
export function isLureOnlyCondition(c: unknown): boolean {
  if (!isObject(c)) return false;
  const entries = Object.entries(c);
  return entries.length > 0 && entries.every(([k, v]) => LURE_KEYS.has(k) && typeof v === "number");
}

/** { multiplier, condition } com condicao so de Lure -> multiplicador tipado; qualquer outro formato = null. */
export function lureMultiplierOf(m: unknown): SpawnLureMultiplier | null {
  if (!isObject(m) || typeof m.multiplier !== "number" || !isLureOnlyCondition(m.condition)) return null;
  const condition = m.condition as Json;
  return {
    lureMin: typeof condition.minLureLevel === "number" ? condition.minLureLevel : null,
    lureMax: typeof condition.maxLureLevel === "number" ? condition.maxLureLevel : null,
    multiplier: m.multiplier,
  };
}

/** rodType ("cobblemon:<arquivo>") -> pokeBallId, de data/cobblemon/pokerods/ dos jars obrigatorios e do kubejs (kubejs vence). */
export function collectPokeRods(ctx: Pick<PipelineContext, "reader">): Map<string, string> {
  const rods = new Map<string, string>();
  const add = (fileName: string, data: unknown) => {
    if (!fileName.endsWith(".json") || !isObject(data) || typeof data.pokeBallId !== "string") return;
    rods.set(`cobblemon:${fileName.slice(0, -".json".length)}`, data.pokeBallId);
  };
  for (const jar of ctx.reader.listJars()) {
    const entries = ctx.reader.readJar(jar, [POKEROD_PREFIX]);
    for (const { path, data } of readJsonEntries(entries, POKEROD_PREFIX, jar.fileName)) add(path.slice(POKEROD_PREFIX.length), data);
  }
  for (const [rel, bytes] of ctx.reader.readTree(KUBEJS_POKEROD_DIR)) {
    if (rel.endsWith(".json")) add(rel, parseJsonStrict(bytes, `${KUBEJS_POKEROD_DIR}/${rel}`));
  }
  return rods;
}

/** condition.bait/rodType/min|maxLureLevel + multiplicadores so de Lure; null quando o spawn nao tem nada disso. */
export function fishingOf(raw: Json, rods: ReadonlyMap<string, string>): SpawnFishing | null {
  const condition = isObject(raw.condition) ? raw.condition : {};
  const bait = typeof condition.bait === "string" ? condition.bait : null;
  const rodType = typeof condition.rodType === "string" ? condition.rodType : null;
  const minLureLevel = typeof condition.minLureLevel === "number" ? condition.minLureLevel : null;
  const maxLureLevel = typeof condition.maxLureLevel === "number" ? condition.maxLureLevel : null;
  const lureMultipliers: SpawnLureMultiplier[] = [];
  const single = lureMultiplierOf(raw.weightMultiplier);
  if (single) lureMultipliers.push(single);
  if (Array.isArray(raw.weightMultipliers)) {
    for (const m of raw.weightMultipliers) {
      const typed = lureMultiplierOf(m);
      if (typed) lureMultipliers.push(typed);
    }
  }
  if (bait === null && rodType === null && minLureLevel === null && maxLureLevel === null && lureMultipliers.length === 0) return null;
  return { bait, rodType, rodBall: rodType ? rods.get(rodType) ?? null : null, minLureLevel, maxLureLevel, lureMultipliers };
}
