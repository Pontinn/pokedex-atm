// B4.2 passo 3: data/cobblemon/berries/<id>.json -> plantable (preferredBiomeTags, favoriteMulches);
// apricorns e mints entram como plantable sem bioma preferido [ASSUMPTION SPEC 5.1.6].
import type { PipelineContext } from "../context";
import { readJsonEntries } from "../jar-reader";
import type { BerrySpawn, ItemBerry } from "../../../../src/data/types";

const BERRIES_PREFIX = "data/cobblemon/berries/";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export interface PlantableInfo {
  biomeTags: string[];
  mulches: string[];
}

/** itemId ("cobblemon:<id>_berry") -> dados de plantio, a partir dos arquivos berries/*.json. */
export function collectBerryPlantable(ctx: Pick<PipelineContext, "reader">): Map<string, PlantableInfo> {
  const out = new Map<string, PlantableInfo>();
  for (const jar of ctx.reader.listJars()) {
    const entries = ctx.reader.readJar(jar, [BERRIES_PREFIX]);
    for (const { path, data } of readJsonEntries<Json>(entries, BERRIES_PREFIX, jar.fileName)) {
      if (!isObject(data)) continue;
      const fileName = (path.split("/").pop() ?? path).replace(/\.json$/, "");
      out.set(`cobblemon:${fileName}`, {
        biomeTags: strings(data.preferredBiomeTags),
        mulches: strings(data.favoriteMulches),
      });
    }
  }
  return out;
}

// berry-mutations B1.2: spawnConditions (spawn natural) e mutations (cruzamento) dos mesmos arquivos.
// Regra da SPEC 2.4 itens 2 e 3: pares por par nao ordenado (a < b por code unit), usos derivados dos pares.
const SPAWN_VARIANTS: Readonly<Record<string, BerrySpawn["variant"]>> = { preferred_biome: "preferredBiome", all_biome: "allBiome", specific_biome: "specificBiome" };
const byCodeUnit = (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0);

/** Pura: id ("cobblemon:<arquivo>") -> JSON cru do arquivo de baga => id -> origem e cruzamentos. */
export function buildBerryOrigins(files: ReadonlyMap<string, Json>, report: PipelineContext["report"]): Map<string, ItemBerry> {
  const out = new Map<string, ItemBerry>();
  const ids = [...files.keys()].sort(byCodeUnit);
  for (const id of ids) out.set(id, { spawn: [], mutationPairs: [], mutationUses: [] });

  for (const id of ids) {
    const data = files.get(id)!;
    const conditions = Array.isArray(data.spawnConditions) ? data.spawnConditions : [];
    for (const e of conditions) {
      const cond = isObject(e) ? e : {};
      const key = String(cond.variant).replace(/^cobblemon:/, "");
      const variant = Object.hasOwn(SPAWN_VARIANTS, key) ? SPAWN_VARIANTS[key] : undefined;
      if (!variant) {
        report.warn("W_BERRY_SPAWN_UNKNOWN", `variante de spawn desconhecida "${String(cond.variant)}" em ${id} (pulada)`, { item: id, variant: cond.variant });
        continue;
      }
      if (variant === "preferredBiome") out.get(id)!.spawn.push({ variant, biomeTags: strings(data.preferredBiomeTags) });
      else if (variant === "allBiome") out.get(id)!.spawn.push({ variant, biomeTags: [] });
      else if (typeof cond.biome === "string") out.get(id)!.spawn.push({ variant, biomeTags: [cond.biome] });
      else report.warn("W_BERRY_SPAWN_BIOME_MISSING", `specific_biome sem biome em ${id} (pulada)`, { item: id });
    }
  }

  const pairKeys = new Map<string, Set<string>>();
  for (const aId of ids) {
    const mutations = files.get(aId)!.mutations;
    if (!isObject(mutations)) continue;
    for (const [bId, cId] of Object.entries(mutations)) {
      if (typeof cId !== "string") continue;
      const other = files.get(bId)?.mutations;
      if (!isObject(other) || other[aId] !== cId) {
        report.warn("W_BERRY_MUTATION_ASYMMETRIC", `cruzamento ${aId} + ${bId} = ${cId} sem o espelho em ${bId} (entra do mesmo jeito)`, { a: aId, b: bId, result: cId });
      }
      if (!files.has(cId) || !files.has(bId)) {
        report.warn("W_BERRY_MUTATION_UNKNOWN_ID", `cruzamento ${aId} + ${bId} = ${cId} cita baga sem arquivo em berries/`, { a: aId, b: bId, result: cId });
      }
      const target = out.get(cId);
      if (!target) continue;
      const [a, b] = [aId, bId].sort(byCodeUnit) as [string, string];
      const seen = pairKeys.get(cId) ?? new Set<string>();
      pairKeys.set(cId, seen);
      if (seen.has(`${a}|${b}`)) continue;
      seen.add(`${a}|${b}`);
      target.mutationPairs.push({ a, b });
    }
  }

  const useKeys = new Map<string, Set<string>>();
  const addUse = (owner: string, partner: string, result: string) => {
    const berry = out.get(owner);
    if (!berry) return;
    const seen = useKeys.get(owner) ?? new Set<string>();
    useKeys.set(owner, seen);
    if (seen.has(`${partner}|${result}`)) return;
    seen.add(`${partner}|${result}`);
    berry.mutationUses.push({ partner, result });
  };
  for (const [result, berry] of out) {
    for (const { a, b } of berry.mutationPairs) {
      addUse(a, b, result);
      addUse(b, a, result);
    }
  }

  for (const berry of out.values()) {
    berry.mutationPairs.sort((x, y) => byCodeUnit(x.a, y.a) || byCodeUnit(x.b, y.b));
    berry.mutationUses.sort((x, y) => byCodeUnit(x.partner, y.partner) || byCodeUnit(x.result, y.result));
  }
  return out;
}

/** itemId -> origem e cruzamentos, lendo os mesmos berries/*.json de collectBerryPlantable (ultimo vence). */
export function collectBerryOrigins(ctx: Pick<PipelineContext, "reader" | "report">): Map<string, ItemBerry> {
  const files = new Map<string, Json>();
  for (const jar of ctx.reader.listJars()) {
    const entries = ctx.reader.readJar(jar, [BERRIES_PREFIX]);
    for (const { path, data } of readJsonEntries<Json>(entries, BERRIES_PREFIX, jar.fileName)) {
      if (!isObject(data)) continue;
      const fileName = (path.split("/").pop() ?? path).replace(/\.json$/, "");
      files.set(`cobblemon:${fileName}`, data);
    }
  }
  return buildBerryOrigins(files, ctx.report);
}
