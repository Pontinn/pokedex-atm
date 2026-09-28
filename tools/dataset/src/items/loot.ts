// B4.2 passo 4 + U7b (pwa-auto-update): loot tables de TODOS os namespaces -> structureLoot/fishing.
// Fontes (prioridade crescente, mesmo id = o de cima sobrescreve, como os datapacks):
//   1. vanilla: snapshot `vanilla/1.21.1.jar/` | instancia `../../Install/versions/1.21.1/1.21.1.jar`
//   2. todo jar de `mods/` (snapshot: pasta, instancia: zip), em ordem alfabetica
//   3. `kubejs/data/<ns>/loot_table/**`
// Tabela com `neoforge:conditions` que nao passam (mod ausente ou condicao nao comprovavel) fica de fora.
// Itens de uma tabela: entradas `minecraft:item`, `minecraft:tag` (tag de item resolvida nas mesmas fontes),
// `minecraft:loot_table` (referencia em qualquer namespace ou tabela inline, recursivo, com visitados) e os
// filhos de `alternatives`/`group`/`sequence`. So o que as tabelas provam: nada de chance aqui.
// Classificacao pelo caminho (`classifyLootTable`). So `structure` e `fishing` viram rota no items.json; o
// resto (blocos, entidades, gameplay, grupos de treinador, outros) fica no report ate existir rota no
// contrato do app (HANDOFF "U7b needs"). Namespace cobblemon mantem a regra antiga (tudo que nao e pesca
// vira structureLoot) para nao tirar rota que o site ja mostra.
import { existsSync } from "node:fs";
import type { PipelineContext } from "../context";
import { evalConditions, modJarPaths, parseLenient, readJarData, readModIds, resolveItemTags, vanillaJarPath, VANILLA_VERSION } from "./recipes";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

const LOOT_RE = /^data\/([^/]+)\/loot_table\/(.+)\.json$/;
const ITEM_TAG_RE = /^data\/([^/]+)\/tags\/items?\/(.+)\.json$/;
const LOOT_OR_TAG_RE = /^data\/[^/]+\/(?:loot_table\/.+|tags\/items?\/.+)\.json$/;

export type LootCategory = "structure" | "fishing" | "block" | "entity" | "gameplay" | "trainer" | "trainerGroup" | "subTable" | "other";

/** Primeiro segmento do caminho que e loot de estrutura (bau, arqueologia, vaso/spawner/dispenser de estrutura). */
const STRUCTURE_FIRST = new Set([
  "chests",
  "archaeology",
  "archeology",
  "archaeological_site",
  "wishing_weald",
  "structures",
  "ruins",
  "ruin",
  "village",
  "villages",
  "shipwreck_coves",
  "spawners",
  "pots",
  "dispensers",
  "desert_outpost",
  "igloo",
  "witch_hut",
  "spire",
  "mage",
  "underground",
  "lodge_drinkables",
]);
/** Tabelas que so existem para serem referenciadas por outras (nunca rota por si). */
const SUB_TABLE_FIRST = new Set(["sets", "selectors", "generic"]);

/** Categoria de uma tabela `<ns>:<caminho>` pelo caminho. */
export function classifyLootTable(id: string): LootCategory {
  const colon = id.indexOf(":");
  const ns = id.slice(0, colon);
  const segs = id.slice(colon + 1).split("/");
  const first = segs[0] ?? "";
  if (ns === "rctmod" && first === "trainers") return segs[1] === "groups" ? "trainerGroup" : "trainer";
  if (ns === "rctmod" && first === "generic") return "subTable";
  // pesca: pasta/arquivo "fishing" (gameplay/fishing/**, fishing/pokerod), nunca um bau tematico (chests/fishing)
  if (segs.includes("fishing") && !segs.includes("chests")) return "fishing";
  if (first === "blocks") return "block"; // U7c: blocos (inclusive cobblemon) viram blockDrop
  if (ns === "cobblemon") return "structure"; // regra antiga do pipeline (B4.2 passo 4)
  if (SUB_TABLE_FIRST.has(first)) return "subTable";
  if (first === "entities" || first === "bosses") return "entity";
  if (first === "gameplay") return "gameplay";
  if (first === "inject" || first === "injection") return segs[1] === "chests" ? "structure" : segs[1] === "entities" ? "entity" : "gameplay";
  if (STRUCTURE_FIRST.has(first) || first.endsWith("_dungeon") || segs.includes("chests")) return "structure";
  return "other";
}

/** Itens (ids) que uma tabela pode dar, expandindo referencias e tags. `visited` evita ciclo. */
export function lootTableItems(
  id: string,
  tables: ReadonlyMap<string, unknown>,
  tags: ReadonlyMap<string, ReadonlySet<string>>,
  cache: Map<string, Set<string>> = new Map(),
  visiting: Set<string> = new Set(),
): Set<string> {
  const done = cache.get(id);
  if (done) return done;
  const out = new Set<string>();
  if (visiting.has(id) || !tables.has(id)) return out;
  visiting.add(id);
  const walkEntry = (e: unknown): void => {
    if (!isObject(e)) return;
    const name = typeof e.name === "string" ? e.name : null;
    if (e.type === "minecraft:item" && name) out.add(name);
    else if (e.type === "minecraft:tag" && name) for (const x of tags.get(name.replace(/^#/, "")) ?? []) out.add(x);
    else if (e.type === "minecraft:loot_table") {
      const ref = typeof e.value === "string" ? e.value : name;
      if (ref) for (const x of lootTableItems(ref, tables, tags, cache, visiting)) out.add(x);
      else if (isObject(e.value)) walkTable(e.value);
    }
    if (Array.isArray(e.children)) e.children.forEach(walkEntry);
  };
  const walkTable = (data: unknown): void => {
    const pools = isObject(data) && Array.isArray(data.pools) ? data.pools : [];
    for (const pool of pools) if (isObject(pool) && Array.isArray(pool.entries)) pool.entries.forEach(walkEntry);
  };
  walkTable(tables.get(id));
  visiting.delete(id);
  cache.set(id, out);
  return out;
}

export interface LootResult {
  /** itemId -> tabelas de estrutura que o contem (`<ns>:<caminho>`; cobblemon sem o namespace, como antes) */
  structureLoot: Map<string, Set<string>>;
  /** itemId -> aparece em alguma tabela de pesca */
  fishing: Set<string>;
  /** U7c: itemId -> ids dos blocos (`<ns>:<bloco>`, da tabela `<ns>:blocks/<bloco>`) que o soltam (bloco que so solta ele mesmo fica de fora) */
  blockDrop: Map<string, Set<string>>;
  /** U7c: itemId -> ids dos mobs (`mobIdOfTable`: entities/, bosses/, inject/entities/), inclusive por loot modifier */
  mobDrop: Map<string, Set<string>>;
  /** categorias sem rota no contrato do app ainda: itemId -> tabelas (so report) */
  pending: Record<"gameplay" | "trainerGroup" | "other", Map<string, Set<string>>>;
  /** tabelas de bloco que so derrubam o proprio bloco (circular: nao e rota), por item */
  blockSelfDrops: Map<string, Set<string>>;
}

const addTo = (m: Map<string, Set<string>>, key: string, value: string) => {
  const s = m.get(key) ?? new Set<string>();
  s.add(value);
  m.set(key, s);
};

/** Label da tabela no items.json: cobblemon sem namespace (formato antigo), outros `<ns>:<caminho>`. */
export function lootTableLabelId(id: string): string {
  return id.startsWith("cobblemon:") ? id.slice("cobblemon:".length) : id;
}

/** Id do bloco de uma tabela `<ns>:blocks/<caminho>` -> `<ns>:<caminho>`. */
export function blockIdOfTable(id: string): string {
  return id.replace(":blocks/", ":");
}

/**
 * Id do mob de uma tabela de entidade: `<ns>:entities/<mob>[/<variante>]` e `<ns>:bosses/<mob>` -> `<ns>:<mob>`;
 * `<ns>:inject(ion)/entities/<mob>` -> `minecraft:<mob>` so se a tabela `minecraft:entities/<mob>` existe (prova do alvo),
 * senao fica o id da tabela.
 */
export function mobIdOfTable(id: string, tables: ReadonlyMap<string, unknown>): string {
  const colon = id.indexOf(":");
  const ns = id.slice(0, colon);
  const segs = id.slice(colon + 1).split("/");
  if (segs[0] === "entities" || segs[0] === "bosses") return `${ns}:${segs[1] ?? ""}`;
  if ((segs[0] === "inject" || segs[0] === "injection") && segs[1] === "entities" && segs[2]) {
    return tables.has(`minecraft:entities/${segs[2]}`) ? `minecraft:${segs[2]}` : id;
  }
  return id;
}

/** Tabelas referenciadas por outra tabela (`minecraft:loot_table` com id). */
export function referencedTables(tables: ReadonlyMap<string, unknown>): Set<string> {
  const out = new Set<string>();
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (isObject(v)) {
      if (v.type === "minecraft:loot_table") {
        const ref = typeof v.value === "string" ? v.value : typeof v.name === "string" ? v.name : null;
        if (ref) out.add(ref);
      }
      Object.values(v).forEach(walk);
    }
  };
  for (const data of tables.values()) walk(data);
  return out;
}

/** Item somado por um global loot modifier (`productivelib:item_modifier`) as tabelas das condicoes `neoforge:loot_table_id`. */
export interface LootModifierAddition {
  /** `<ns>:<caminho>` do arquivo do modifier */
  modifier: string;
  item: string;
  tables: string[];
}

/** Indice item -> tabelas por categoria (puro, testavel). */
export function buildLootIndex(
  tables: ReadonlyMap<string, unknown>,
  tags: ReadonlyMap<string, ReadonlySet<string>>,
  modifiers: readonly LootModifierAddition[] = [],
): LootResult {
  const result: LootResult = {
    structureLoot: new Map(),
    fishing: new Set(),
    blockDrop: new Map(),
    mobDrop: new Map(),
    pending: { gameplay: new Map(), trainerGroup: new Map(), other: new Map() },
    blockSelfDrops: new Map(),
  };
  const cache = new Map<string, Set<string>>();
  const referenced = referencedTables(tables);
  const itemsById = new Map<string, Set<string>>();
  for (const id of tables.keys()) itemsById.set(id, new Set(lootTableItems(id, tables, tags, cache)));
  // loot modifier: o item entra na tabela alvo como uma entrada a mais (a tabela alvo nao precisa estar nas fontes)
  for (const m of modifiers) {
    for (const t of m.tables) {
      const s = itemsById.get(t) ?? new Set<string>();
      s.add(m.item);
      itemsById.set(t, s);
    }
  }
  for (const id of [...itemsById.keys()].sort()) {
    const category = classifyLootTable(id);
    if (category === "subTable" || category === "trainer") continue; // trainer: trainer-drops.ts
    // bloco/mob referenciado por outra tabela (ex. eternal_starlight:bosses/boss_common) so conta pela tabela que o usa
    if ((category === "block" || category === "entity") && referenced.has(id)) continue;
    const items = itemsById.get(id) ?? new Set<string>();
    for (const item of items) {
      if (category === "structure") addTo(result.structureLoot, item, lootTableLabelId(id));
      else if (category === "fishing") result.fishing.add(item);
      else if (category === "block") {
        // blocks/<caminho> que derruba o item de mesmo id (<ns>:<caminho>) e o proprio bloco: nao e rota
        const blockId = blockIdOfTable(id);
        if (blockId === item) addTo(result.blockSelfDrops, item, id);
        else addTo(result.blockDrop, item, blockIdOfTable(id));
      } else if (category === "entity") addTo(result.mobDrop, item, mobIdOfTable(id, tables));
      else addTo(result.pending[category], item, id);
    }
  }
  return result;
}

export interface LootSources {
  tables: Map<string, unknown>;
  tags: Map<string, Set<string>>;
  /** tabelas descartadas por neoforge:conditions (id -> motivo) */
  droppedByCondition: Map<string, string>;
  /** fontes lidas (vanilla, jars, kubejs) */
  sourceFiles: number;
  /** global loot modifiers ativos que somam um item a tabelas (U7c) */
  modifiers: LootModifierAddition[];
}

const GLM_LIST = "data/neoforge/loot_modifiers/global_loot_modifiers.json";
const GLM_RE = /^data\/[^/]+\/loot_modifiers\/.+\.json$/;

/**
 * Tabelas das condicoes `neoforge:loot_table_id` (direto ou em any_of/all_of). Qualquer outra condicao (ferramenta,
 * bloco, "morto por" uma entidade especifica...) = null: a rota nao e um drop comum da tabela e fica de fora.
 */
function lootTableIdsOf(conditions: unknown): string[] | null {
  const out: string[] = [];
  let other = false;
  const walk = (c: unknown): void => {
    if (Array.isArray(c)) c.forEach(walk);
    else if (isObject(c) && c.condition === "neoforge:loot_table_id" && typeof c.loot_table_id === "string") out.push(c.loot_table_id);
    else if (isObject(c) && (c.condition === "minecraft:any_of" || c.condition === "minecraft:all_of")) walk(c.terms);
    else other = true;
  };
  walk(conditions);
  return other ? null : out;
}

/** Modifiers listados em `global_loot_modifiers.json` (jars e kubejs, kubejs por ultimo) com `addition.id` e tabela alvo. */
export function parseLootModifiers(files: readonly { path: string; bytes: Uint8Array }[]): LootModifierAddition[] {
  const byPath = new Map(files.map((f) => [f.path, f.bytes]));
  const active: string[] = [];
  for (const f of files) {
    if (f.path !== GLM_LIST) continue;
    const list = parseLenient(f.bytes);
    if (!isObject(list) || !Array.isArray(list.entries)) continue;
    if (list.replace === true) active.length = 0;
    for (const e of list.entries) if (typeof e === "string" && !active.includes(e)) active.push(e);
  }
  const out: LootModifierAddition[] = [];
  for (const id of active) {
    const [ns, rest] = id.split(":");
    const bytes = byPath.get(`data/${ns}/loot_modifiers/${rest}.json`);
    const data = bytes ? parseLenient(bytes) : undefined;
    if (!isObject(data) || !isObject(data.addition) || typeof data.addition.id !== "string") continue;
    const tables = lootTableIdsOf(data.conditions);
    if (tables && tables.length > 0) out.push({ modifier: id, item: data.addition.id, tables: [...new Set(tables)].sort() });
  }
  return out;
}

/** Le as loot tables e as tags de item de todas as fontes (vanilla < jars < kubejs), condicoes avaliadas. */
export function readLootSources(ctx: Pick<PipelineContext, "reader" | "report">): LootSources {
  const root = ctx.reader.root;
  const files: { path: string; bytes: Uint8Array }[] = [];
  const vanilla = vanillaJarPath(root, ctx.reader.mode);
  if (existsSync(vanilla)) files.push(...readJarData(vanilla, ["loot_table", "tags"], LOOT_OR_TAG_RE));
  else ctx.report.warn("W_LOOT_VANILLA_MISSING", `jar vanilla ${VANILLA_VERSION} nao encontrado: loot do minecraft fica de fora`, { path: vanilla });
  const glmFiles: { path: string; bytes: Uint8Array }[] = [];
  for (const jar of modJarPaths(root)) {
    files.push(...readJarData(jar.path, ["loot_table", "tags"], LOOT_OR_TAG_RE));
    glmFiles.push(...readJarData(jar.path, ["loot_modifiers"], GLM_RE));
  }
  for (const [rel, bytes] of ctx.reader.readTree("kubejs/data")) {
    const p = `data/${rel}`;
    if (LOOT_OR_TAG_RE.test(p)) files.push({ path: p, bytes });
    else if (GLM_RE.test(p)) glmFiles.push({ path: p, bytes });
  }

  const modIds = readModIds(ctx);
  const tables = new Map<string, unknown>();
  const droppedByCondition = new Map<string, string>();
  const tagFiles: { path: string; bytes: Uint8Array }[] = [];
  for (const f of files) {
    const m = LOOT_RE.exec(f.path);
    if (!m) {
      if (ITEM_TAG_RE.test(f.path)) tagFiles.push(f);
      continue;
    }
    const id = `${m[1] as string}:${m[2] as string}`;
    const data = parseLenient(f.bytes);
    if (data === undefined) continue;
    const status = isObject(data) ? evalConditions(data["neoforge:conditions"], modIds) : "ok";
    if (status !== "ok") {
      tables.delete(id);
      droppedByCondition.set(id, status);
      continue;
    }
    droppedByCondition.delete(id);
    tables.set(id, data);
  }
  return { tables, tags: resolveItemTags(tagFiles), droppedByCondition, sourceFiles: files.length, modifiers: parseLootModifiers(glmFiles) };
}

/** Percorre as loot tables de todas as fontes e monta o indice item -> tabelas. */
export function collectLoot(ctx: Pick<PipelineContext, "reader" | "report">, catalogIds?: ReadonlySet<string>): LootResult {
  const sources = readLootSources(ctx);
  const result = buildLootIndex(sources.tables, sources.tags, sources.modifiers);
  const inCatalog = (m: Map<string, Set<string>>) =>
    Object.fromEntries(
      [...m]
        .filter(([item]) => !catalogIds || catalogIds.has(item))
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([item, t]) => [item, [...t].sort()]),
    );
  ctx.report.section("loot", {
    files: sources.sourceFiles,
    tables: sources.tables.size,
    droppedByCondition: [...sources.droppedByCondition.keys()].filter((id) => classifyLootTable(id) !== "subTable").length,
    structureLootItems: [...result.structureLoot.keys()].filter((id) => !catalogIds || catalogIds.has(id)).length,
    fishingItems: [...result.fishing].filter((id) => !catalogIds || catalogIds.has(id)).length,
    blockDropItems: [...result.blockDrop.keys()].filter((id) => !catalogIds || catalogIds.has(id)).length,
    mobDropItems: [...result.mobDrop.keys()].filter((id) => !catalogIds || catalogIds.has(id)).length,
    lootModifiers: sources.modifiers,
    pendingContract: {
      gameplay: inCatalog(result.pending.gameplay),
      trainerGroup: inCatalog(result.pending.trainerGroup),
      other: inCatalog(result.pending.other),
    },
    blockSelfDrops: inCatalog(result.blockSelfDrops),
  });
  return result;
}
