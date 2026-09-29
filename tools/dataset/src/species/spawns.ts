// B2.3: spawn_pool_world/*.json de todos os jars + kubejs (SPEC 5.1.1, 5.1.2, 5.1.3, 5.1.5).
import type { SpawnEntry, SpawnTimeRange } from "../../../../src/data/types";
import type { PipelineContext } from "../context";
import { readJsonEntries } from "../jar-reader";
import { PipelineError } from "../lib/errors";
import TOML from "@iarna/toml";
import { MODS_TOML, type JarId, type JarRef, type SourceReader } from "../source-reader";
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

// BUGFIX (achado pelo B2.5/Onda 2 ao validar species/*.json contra speciesDetailSchema, real run):
// condition.timeRange no snapshot real usa presets nomeados ("morning","noon","dawn","dusk","twilight",
// alem de "day"/"night") e faixas numericas de tick ("5000-10999" etc, dex 741 Oricorio confirmado),
// nao so os 2 nomes literais que o codigo original repassava direto (cast) para o enum fechado
// SpawnTimeRange ("day"|"night"|"any"), quebrando a validacao de schema. Mapeado por janela do dia
// (Minecraft: 0-12000 = dia, 12000-24000 = noite); nome desconhecido ou fora do padrao -> "any".
const NAMED_TIME_RANGE: Readonly<Record<string, SpawnTimeRange>> = {
  day: "day",
  dawn: "day",
  morning: "day",
  noon: "day",
  afternoon: "day",
  night: "night",
  dusk: "night",
  twilight: "night",
  evening: "night",
};

function deriveTimeRange(raw: unknown): SpawnTimeRange {
  if (typeof raw !== "string") return "any";
  const named = NAMED_TIME_RANGE[raw.toLowerCase()];
  if (named) return named;
  const match = /^(\d+)-(\d+)$/.exec(raw);
  if (match) {
    const mid = (Number(match[1]) + Number(match[2])) / 2;
    return mid < 12000 ? "day" : "night";
  }
  return "any";
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
    timeRange: deriveTimeRange(condition.timeRange),
    structures: strArray(condition.structures),
    neededBaseBlocks: strArray(condition.neededBaseBlocks),
    fishing: null,
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

// ---------------------------------------------------------------------------
// Resolucao de arquivos com o MESMO resource location (auditoria A1)
// ---------------------------------------------------------------------------

/**
 * Politica para arquivos spawn_pool_world presentes em mais de um jar SEM nenhuma ordem de carga entre os
 * mods, nem direta nem transitiva (nenhum caso no atm-1.3.0). "sum" = todas as entradas contam
 * (SPEC 5.1.2); um JarId = esse jar vence quando estiver entre os donos.
 */
export type SpawnCollisionPolicy = "sum" | JarId;
export const SPAWN_COLLISION_WINNER: SpawnCollisionPolicy = "sum";

export interface SpawnCollision {
  /** caminho do arquivo dentro do datapack (resource location), ex. data/cobblemon/spawn_pool_world/0120_staryu.json */
  path: string;
  /** donos, na ordem de leitura (jar id ou "kubejs") */
  mods: string[];
  /** "kubejs" (kubejs substitui), "loadOrder:<jar>" (ordem de carga do neoforge.mods.toml), "policy:<SPAWN_COLLISION_WINNER>" */
  resolution: string;
  /**
   * cadeia de ordem de carga usada, do mod que carrega antes ao vencedor, uma por perdedor
   * (ex. ["mega_showdown < allthemons < ccc"]); [] para kubejs e policy.
   */
  chain: string[];
}

interface ModsTomlDeps {
  mods?: { modId?: string }[];
  dependencies?: Record<string, { modId?: string; ordering?: string }[]>;
}

/**
 * Relacao "carrega depois de" entre os jars, lida do META-INF/neoforge.mods.toml de TODOS os jars:
 * A depende de B com ordering="AFTER" => A carrega depois de B; ordering="BEFORE" => B carrega depois de A.
 * Fecho transitivo (so entre mods presentes): ex. allthemons declara mega_showdown AFTER e ccc BEFORE
 * ("fix load order of CCC"), entao mega_showdown < allthemons < ccc e o ccc carrega depois do mega_showdown.
 */
export interface LoadOrder {
  /** ordering declarado diretamente entre os dois mods */
  direct: (a: string, b: string) => boolean;
  /** a carrega depois de b pelo fecho transitivo */
  transitive: (a: string, b: string) => boolean;
  /** cadeia do que carrega antes (b) ao que carrega depois (a), ex. ["mega_showdown","allthemons","ccc"]; null sem ordem */
  chain: (a: string, b: string) => string[] | null;
}

export function buildLoadOrder(reader: SourceReader): LoadOrder {
  const decoder = new TextDecoder();
  const modIdToJar = new Map<string, string>();
  const tomls: { jar: string; toml: ModsTomlDeps }[] = [];
  for (const jar of reader.listJars() as JarRef[]) {
    const bytes = reader.readJar(jar, []).get(MODS_TOML);
    if (!bytes) continue;
    let toml: ModsTomlDeps;
    try {
      toml = TOML.parse(decoder.decode(bytes)) as ModsTomlDeps;
    } catch {
      continue;
    }
    for (const m of toml.mods ?? []) if (m.modId) modIdToJar.set(m.modId, jar.id);
    tomls.push({ jar: jar.id, toml });
  }
  // after.get(x) = jars que x carrega depois (declarado)
  const after = new Map<string, Set<string>>();
  const add = (later: string, earlier: string) => {
    if (later === earlier) return;
    const set = after.get(later) ?? new Set<string>();
    set.add(earlier);
    after.set(later, set);
  };
  for (const { jar, toml } of tomls) {
    for (const [owner, deps] of Object.entries(toml.dependencies ?? {})) {
      if (modIdToJar.get(owner) !== jar) continue;
      for (const dep of deps ?? []) {
        const other = dep.modId ? modIdToJar.get(dep.modId) : undefined;
        if (!other) continue;
        const ordering = String(dep.ordering ?? "NONE").toUpperCase();
        if (ordering === "AFTER") add(jar, other);
        else if (ordering === "BEFORE") add(other, jar);
      }
    }
  }
  // BFS de a (carrega depois) ate b (carrega antes) pelas arestas "after"
  const chain = (a: string, b: string): string[] | null => {
    if (a === b) return null;
    const prev = new Map<string, string>();
    const queue = [a];
    const seen = new Set([a]);
    while (queue.length) {
      const x = queue.shift() as string;
      for (const y of after.get(x) ?? []) {
        if (seen.has(y)) continue;
        seen.add(y);
        prev.set(y, x);
        if (y === b) {
          const path = [b];
          let cur = b;
          while (cur !== a) {
            cur = prev.get(cur) as string;
            path.push(cur);
          }
          return path; // b ... a (do que carrega antes ao que carrega depois)
        }
        queue.push(y);
      }
    }
    return null;
  };
  return {
    direct: (a, b) => after.get(a)?.has(b) ?? false,
    transitive: (a, b) => chain(a, b) !== null,
    chain,
  };
}

interface SpawnFile {
  source: string;
  where: string;
  path: string;
  data: unknown;
}

/**
 * Arquivos que valem no jogo por resource location: kubejs substitui jar (datapack, kubejs carrega por
 * ultimo); entre jars, o arquivo do mod que carrega depois de TODOS os outros donos pela ordem de carga
 * transitiva (neoforge.mods.toml) substitui os demais; so sem ordem nenhuma vale SPAWN_COLLISION_WINNER.
 * Toda colisao entra em `collisions` com a resolucao e a cadeia usada.
 */
export function resolveSpawnFiles(
  files: readonly SpawnFile[],
  order: LoadOrder,
  collisions: SpawnCollision[],
  policy: SpawnCollisionPolicy = SPAWN_COLLISION_WINNER,
): SpawnFile[] {
  const byPath = new Map<string, SpawnFile[]>();
  for (const f of files) byPath.set(f.path, [...(byPath.get(f.path) ?? []), f]);
  const out: SpawnFile[] = [];
  for (const [p, owners] of byPath) {
    if (owners.length === 1) {
      out.push(owners[0] as SpawnFile);
      continue;
    }
    const mods = owners.map((o) => o.source);
    const kube = owners.filter((o) => o.source === "kubejs");
    if (kube.length > 0) {
      out.push(...kube);
      collisions.push({ path: p, mods, resolution: "kubejs", chain: [] });
      continue;
    }
    const winner = owners.find((o) => owners.every((other) => other === o || order.transitive(o.source, other.source)));
    if (winner) {
      out.push(winner);
      const chain = owners
        .filter((o) => o !== winner)
        .map((o) => (order.chain(winner.source, o.source) ?? []).join(" < "));
      collisions.push({ path: p, mods, resolution: `loadOrder:${winner.source}`, chain });
      continue;
    }
    const chosen = policy === "sum" ? undefined : owners.find((o) => o.source === policy);
    if (chosen) out.push(chosen);
    else out.push(...owners);
    collisions.push({ path: p, mods, resolution: `policy:${chosen ? policy : "sum"}`, chain: [] });
  }
  return out;
}

/** slug -> todas as entradas de spawn dos arquivos que valem no jogo (ver resolveSpawnFiles). */
export function collectSpawnsBySlug(
  ctx: Pick<PipelineContext, "reader" | "report">,
  collisions: SpawnCollision[] = [],
): Map<string, SpawnEntry[]> {
  const files: SpawnFile[] = [];
  for (const jar of ctx.reader.listJars() as JarRef[]) {
    const entries = ctx.reader.readJar(jar, SPAWN_PREFIXES);
    for (const prefix of SPAWN_PREFIXES) {
      for (const { path, data } of readJsonEntries(entries, prefix, jar.fileName)) {
        files.push({ source: jar.id, where: `${jar.fileName}!${path}`, path, data });
      }
    }
  }
  const kubejs = ctx.reader.readTree("kubejs");
  for (const { path, data } of readJsonEntries(kubejs, KUBEJS_SPAWN_PREFIX, "kubejs")) {
    files.push({ source: "kubejs", where: `kubejs!${path}`, path, data });
  }
  const out = new Map<string, SpawnEntry[]>();
  for (const f of resolveSpawnFiles(files, buildLoadOrder(ctx.reader as SourceReader), collisions)) {
    collectFile(f.data, f.source, f.where, ctx.report, out);
  }
  return out;
}
