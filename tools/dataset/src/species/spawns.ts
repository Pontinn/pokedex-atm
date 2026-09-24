// B2.3: spawn_pool_world/*.json de todos os jars + kubejs (SPEC 5.1.1, 5.1.2, 5.1.3, 5.1.5).
import type { SpawnEntry, SpawnTimeRange } from "../../../../src/data/types";
import type { PipelineContext } from "../context";
import { readJsonEntries } from "../jar-reader";
import { PipelineError } from "../lib/errors";
import type { JarRef } from "../source-reader";
import { isRarityBucket } from "./rarity";

/**
 * Namespaces com pasta spawn_pool_world verificados no snapshot atm-1.3.0 (Cobblemon base + os 3
 * namespaces do ccc: legendary_spawns_ccc, paradox_spawns_ccc, ub_spawns_ccc). O SourceReader so filtra
 * por prefixo exato (sem glob), entao a lista e fixada aqui como em REQUIRED_JARS/LANG_NAMESPACES;
 * um namespace novo em versao futura exigiria acrescentar aqui (nao ha forma de descobrir via o reader).
 */
export const SPAWN_NAMESPACES = ["cobblemon", "legendary_spawns_ccc", "paradox_spawns_ccc", "ub_spawns_ccc"] as const;
const SPAWN_PREFIXES = SPAWN_NAMESPACES.map((ns) => `data/${ns}/spawn_pool_world/`);
const KUBEJS_SPAWN_PREFIX = "data/cobblemon/spawn_pool_world/";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const strArray = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

const KNOWN_TOP_KEYS = new Set([
  "id",
  "pokemon",
  "type",
  "presets",
  "spawnablePositionType",
  "context",
  "condition",
  "anticondition",
  "bucket",
  "level",
]);
const KNOWN_CONDITION_KEYS = new Set(["biomes", "minSkyLight", "maxSkyLight", "canSeeSky", "structures", "neededBaseBlocks", "timeRange"]);

function extraOf(raw: Json): Record<string, unknown> {
  const extra: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) if (!KNOWN_TOP_KEYS.has(k)) extra[k] = v;
  const condition = raw.condition;
  if (isObject(condition)) {
    const rest: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(condition)) if (!KNOWN_CONDITION_KEYS.has(k)) rest[k] = v;
    if (Object.keys(rest).length) extra.condition = rest;
  }
  return extra;
}

let sequence = 0;

function parseEntry(raw: unknown, source: string, report: PipelineContext["report"], where: string): SpawnEntry | null {
  if (!isObject(raw)) return null;
  const pokemonRaw = raw.pokemon;
  if (typeof pokemonRaw !== "string" || !pokemonRaw.trim()) {
    report.warn("W_SPAWN_INVALID", "entrada de spawn sem pokemon", where);
    return null;
  }
  const bucket = raw.bucket;
  if (!isRarityBucket(bucket)) {
    // SPEC B2.3 edge case: "bucket fora dos 4 valores -> erro" (nunca visto no snapshot real; falha alta).
    throw new PipelineError("E_SPECIES_INVALID", `bucket de spawn desconhecido: "${String(bucket)}"`, where);
  }
  const condition = isObject(raw.condition) ? raw.condition : {};
  const anticondition = isObject(raw.anticondition) ? raw.anticondition : {};
  const hasSkyLight = typeof condition.minSkyLight === "number" || typeof condition.maxSkyLight === "number";
  sequence += 1;
  return {
    id: typeof raw.id === "string" ? `${source}:${raw.id}` : `${source}:${sequence}`,
    source,
    bucket,
    level: typeof raw.level === "string" ? raw.level : String(raw.level ?? ""),
    // spawnablePositionType (Eevee) e context (Jirachi/Creepyon) sao os dois nomes vistos no snapshot.
    context: typeof raw.spawnablePositionType === "string" ? raw.spawnablePositionType : typeof raw.context === "string" ? raw.context : "",
    presets: strArray(raw.presets),
    biomes: strArray(condition.biomes),
    antiBiomes: strArray(anticondition.biomes),
    skyLight: hasSkyLight
      ? { min: typeof condition.minSkyLight === "number" ? condition.minSkyLight : 0, max: typeof condition.maxSkyLight === "number" ? condition.maxSkyLight : 15 }
      : null,
    canSeeSky: typeof condition.canSeeSky === "boolean" ? condition.canSeeSky : null,
    timeRange: (typeof condition.timeRange === "string" ? condition.timeRange : "any") as SpawnTimeRange,
    structures: strArray(condition.structures),
    neededBaseBlocks: strArray(condition.neededBaseBlocks),
    extra: extraOf(raw),
  };
}

function collectFile(data: unknown, source: string, where: string, report: PipelineContext["report"], out: Map<string, SpawnEntry[]>): void {
  if (!isObject(data) || !Array.isArray(data.spawns)) return;
  // "enabled": false -> arquivo inteiro ignorado (verificado no snapshot: 0000_pidgey_herd.json e um teste
  // desabilitado, type "pokemon-herd", sem campo "pokemon" no nivel esperado).
  if (data.enabled === false) return;
  for (const raw of data.spawns) {
    // type "pokemon-herd" (varias especies em herdablePokemon[]) tem esquema diferente do spawn simples de
    // uma especie (SpawnEntry); nao ha spawn "pokemon-herd" habilitado no snapshot, mas o filtro fica por
    // seguranca (evita um aviso W_SPAWN_INVALID espurio para um tipo de entrada fora do escopo do B2.3).
    if (isObject(raw) && typeof raw.type === "string" && raw.type !== "pokemon") continue;
    const entry = parseEntry(raw, source, report, where);
    if (!entry) continue;
    // sufixo de aspecto ("magikarp calico=...") nunca visto no snapshot, mas tratado por seguranca (SPEC B2.3 passo 1).
    const slug = (isObject(raw) && typeof raw.pokemon === "string" ? raw.pokemon : "").split(" ")[0] as string;
    const list = out.get(slug);
    if (list) list.push(entry);
    else out.set(slug, [entry]);
  }
}

/** slug -> todas as entradas de spawn (todas contam, mesmo especie com spawn base + spawn de addon). */
export function collectSpawnsBySlug(ctx: Pick<PipelineContext, "reader" | "report">): Map<string, SpawnEntry[]> {
  const out = new Map<string, SpawnEntry[]>();
  for (const jar of ctx.reader.listJars() as JarRef[]) {
    const entries = ctx.reader.readJar(jar, SPAWN_PREFIXES);
    for (const prefix of SPAWN_PREFIXES) {
      for (const { path, data } of readJsonEntries(entries, prefix, jar.fileName)) {
        collectFile(data, jar.id, `${jar.fileName}!${path}`, ctx.report, out);
      }
    }
  }
  const kubejs = ctx.reader.readTree("kubejs");
  for (const { path, data } of readJsonEntries(kubejs, KUBEJS_SPAWN_PREFIX, "kubejs")) {
    collectFile(data, "kubejs", `kubejs!${path}`, ctx.report, out);
  }
  return out;
}
