// B4.2 passo 4: data/cobblemon/loot_table/**.json (jars + kubejs, mesmo caminho relativo em ambos) ->
// structureLoot/fishing. Entradas type:"minecraft:item" contam direto; type:"minecraft:loot_table"
// referenciando "cobblemon:sets/*" e expandido um nivel (SPEC B4.2 passo 4).
import type { PipelineContext } from "../context";
import { readJsonEntries } from "../jar-reader";

const LOOT_PREFIX = "data/cobblemon/loot_table/";
const FISHING_PATH_RE = /(^|\/)fishing\//;

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

interface ParsedTable {
  id: string;
  isFishing: boolean;
  directItems: Set<string>;
  nestedTableRefs: Set<string>;
}

function tableIdFromPath(path: string): string {
  return path.slice(LOOT_PREFIX.length).replace(/\.json$/, "");
}

function parseTable(path: string, data: unknown): ParsedTable {
  const id = tableIdFromPath(path);
  const directItems = new Set<string>();
  const nestedTableRefs = new Set<string>();
  const pools = isObject(data) && Array.isArray(data.pools) ? data.pools : [];
  for (const pool of pools) {
    if (!isObject(pool) || !Array.isArray(pool.entries)) continue;
    for (const entry of pool.entries) {
      if (!isObject(entry)) continue;
      if (entry.type === "minecraft:item" && typeof entry.name === "string") directItems.add(entry.name);
      if (entry.type === "minecraft:loot_table" && typeof entry.value === "string" && entry.value.startsWith("cobblemon:sets/")) {
        nestedTableRefs.add(entry.value.slice("cobblemon:".length));
      }
    }
  }
  return { id, isFishing: FISHING_PATH_RE.test(id) || id.startsWith("fishing"), directItems, nestedTableRefs };
}

export interface LootResult {
  /** itemId -> tabelas de estrutura que o contem (id humanizado = caminho sem .json) */
  structureLoot: Map<string, Set<string>>;
  /** itemId -> aparece em alguma tabela de pesca */
  fishing: Set<string>;
}

/** Percorre todas as loot tables do Cobblemon (jars + kubejs) e monta o indice item -> tabelas. */
export function collectLoot(ctx: Pick<PipelineContext, "reader">): LootResult {
  const tables = new Map<string, ParsedTable>();
  for (const jar of ctx.reader.listJars()) {
    const entries = ctx.reader.readJar(jar, [LOOT_PREFIX]);
    for (const { path, data } of readJsonEntries<Json>(entries, LOOT_PREFIX, jar.fileName)) {
      const table = parseTable(path, data);
      tables.set(table.id, table);
    }
  }
  const kubejs = ctx.reader.readTree("kubejs");
  for (const { path, data } of readJsonEntries<Json>(kubejs, LOOT_PREFIX, "kubejs")) {
    const table = parseTable(path, data);
    tables.set(table.id, table); // kubejs pode sobrescrever/injetar tabelas com o mesmo id
  }

  const structureLoot = new Map<string, Set<string>>();
  const fishing = new Set<string>();
  for (const table of tables.values()) {
    const items = new Set(table.directItems);
    for (const ref of table.nestedTableRefs) {
      const nested = tables.get(ref);
      if (nested) for (const item of nested.directItems) items.add(item);
    }
    for (const item of items) {
      if (table.isFishing) {
        fishing.add(item);
      } else {
        const set = structureLoot.get(item) ?? new Set<string>();
        set.add(table.id);
        structureLoot.set(item, set);
      }
    }
  }
  return { structureLoot, fishing };
}
