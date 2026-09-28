// U7c (pwa-auto-update): fontes de obtencao que nao sao receita nem loot table. Cada uma so entra com prova num
// arquivo do pack (nada inferido de codigo):
//   shop            config/cobblemon_battle_tower/bp_shop_items.json (items[] + _default_items quando load_default_items)
//   ritual          kubejs/server_scripts/** `summoningrituals.altar(...)` com itemOutputs/displayOutputs literais
//   questReward     config/ftbquests/quests/chapters/*.snbt (recompensa item, e random/loot/choice via reward_tables/*.snbt);
//                   titulos de capitulo/quest de config/ftbquests/quests/lang/{pt_br,en_us}.snbt
//   trade           data/<ns>/wanderer_trades/*.json (Apotheosis/Placebo, `output.id`) = vendedor ambulante
//   worldgen        data/<ns>/neoforge/biome_modifier (neoforge:add_features) -> placed_feature -> configured_feature ->
//                   bloco colocado; conta para o item de mesmo id cujo bloco so derruba ele mesmo (loot.blockSelfDrops)
//   structurePlaced data/<ns>/structure/**/*.nbt (jars e kubejs/data): ids de item no NBT dos blocos/entidades
//   special         tera shards (config/mega_showdown/config.json teraShardDropRate/stellarShardDropRate) e
//                   data/cobblemon/pokemon_interactions/*.json (efeito give_item)
import type { ItemNamedRef, ItemQuestRef, LocalizedText } from "../../../../src/data/types";
import type { PipelineContext } from "../context";
import { isNbtObject, parseNbt, type Nbt } from "../lib/nbt";
import { isSnbtObject, parseSnbt, type Snbt } from "../lib/snbt";
import { modJarPaths, parseLenient, readJarData } from "./recipes";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const decoder = new TextDecoder();
const addTo = <V>(m: Map<string, V[]>, key: string, value: V) => {
  const list = m.get(key) ?? [];
  list.push(value);
  m.set(key, list);
};
/** id de item sem componentes/contagem: `2x ns:path[...]` / `ns:path{...}` -> `ns:path` */
export function bareItemId(raw: string): string | null {
  const m = /^(?:\d+x\s+)?([a-z0-9_.-]+:[a-z0-9_./-]+)/.exec(raw.trim());
  return m ? (m[1] as string) : null;
}

// ---------------------------------------------------------------------------------------------------------------
// Loja de BP da Battle Tower
// ---------------------------------------------------------------------------------------------------------------

/** item -> menor preco em BP (null se o arquivo nao traz numero). Entradas com `command` nao sao item. */
export function parseBpShop(data: unknown): Map<string, number | null> {
  const out = new Map<string, number | null>();
  if (!isObject(data)) return out;
  const byId = new Map<string, Json>();
  const lists = [data.load_default_items === true ? data._default_items : undefined, data.items];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const e of list) if (isObject(e)) byId.set(typeof e.id === "string" ? e.id : JSON.stringify(e), e); // items[] sobrescreve o padrao de mesmo id
  }
  for (const e of byId.values()) {
    if (typeof e.item_id !== "string" || e.command !== undefined) continue;
    const item = bareItemId(e.item_id);
    if (!item) continue;
    const price = typeof e.bp_cost === "number" ? e.bp_cost : null;
    const prev = out.get(item);
    out.set(item, prev === undefined ? price : prev === null ? price : price === null ? prev : Math.min(prev, price));
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Summoning Rituals (kubejs)
// ---------------------------------------------------------------------------------------------------------------

/** item -> ids dos rituais (`.id("...")` do bloco; sem id = `arquivo:linha`). */
export function parseRituals(scripts: ReadonlyMap<string, string>): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const [file, text] of [...scripts].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const starts = [...text.matchAll(/summoningrituals\s*\.\s*altar\s*\(/g)].map((m) => m.index ?? 0);
    starts.forEach((start, k) => {
      const block = text.slice(start, starts[k + 1] ?? text.length);
      const idMatch = /\.id\(\s*["']([^"']+)["']\s*\)/.exec(block);
      const line = text.slice(0, start).split("\n").length;
      const ritual = idMatch ? (idMatch[1] as string) : `${file}:${line}`;
      for (const m of block.matchAll(/\.(?:itemOutputs|displayOutputs)\(\s*\[([\s\S]*?)\]\s*\)/g)) {
        for (const s of (m[1] as string).matchAll(/"([^"]+)"|'([^']+)'/g)) {
          const item = bareItemId((s[1] ?? s[2]) as string);
          if (item && !(out.get(item) ?? []).includes(ritual)) addTo(out, item, ritual);
        }
      }
    });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// FTB Quests
// ---------------------------------------------------------------------------------------------------------------

/** Texto do FTB sem codigos de cor (`&6`, `§a`) e sem espacos nas pontas. */
const cleanFtb = (s: string) =>
  s
    .replace(/(?<!\\)[&§][0-9a-fk-or]/gi, "")
    .replace(/\\&/g, "&")
    .trim();

/** Chaves `chapter.<ID>.title` / `quest.<ID>.title` de um lang .snbt. */
export function parseFtbLang(text: string): Map<string, string> {
  const out = new Map<string, string>();
  const data = parseSnbt(text);
  if (!isSnbtObject(data)) return out;
  for (const [k, v] of Object.entries(data)) {
    const s = typeof v === "string" ? v : Array.isArray(v) && typeof v[0] === "string" ? v[0] : null;
    if (s !== null && /^(chapter|quest)\.[0-9A-F]+\.title$/.test(k) && cleanFtb(s)) out.set(k, cleanFtb(s));
  }
  return out;
}

/** table_id (long com sinal, decimal) -> id hex do reward table (`0C83C7A93ED80A36`). */
export function rewardTableHex(tableId: Snbt | undefined): string | null {
  if (typeof tableId !== "number" && typeof tableId !== "string") return null;
  try {
    return BigInt.asUintN(64, BigInt(tableId)).toString(16).toUpperCase().padStart(16, "0");
  } catch {
    return null;
  }
}

const itemOfReward = (r: Snbt): string | null => {
  if (!isSnbtObject(r)) return null;
  const item = r.item;
  if (typeof item === "string") return bareItemId(item);
  if (isSnbtObject(item) && typeof item.id === "string") return bareItemId(item.id);
  return null;
};

export interface QuestSources {
  chapters: ReadonlyMap<string, string>;
  rewardTables: ReadonlyMap<string, string>;
  langPt: ReadonlyMap<string, string>;
  langEn: ReadonlyMap<string, string>;
}

/** item -> quests que o dao como recompensa (item direto ou reward table sorteada/escolhida). */
export function parseQuestRewards(src: QuestSources): Map<string, ItemQuestRef[]> {
  const tables = new Map<string, string[]>();
  for (const text of src.rewardTables.values()) {
    const t = parseSnbt(text);
    if (!isSnbtObject(t) || typeof t.id !== "string") continue;
    const items = (Array.isArray(t.rewards) ? t.rewards : []).map(itemOfReward).filter((x): x is string => x !== null);
    tables.set(t.id.toUpperCase(), items);
  }
  const text = (key: string): LocalizedText | null => {
    const en = src.langEn.get(key);
    const pt = src.langPt.get(key) ?? en;
    return pt && en ? { pt, en } : pt ? { pt, en: pt } : null;
  };
  const out = new Map<string, ItemQuestRef[]>();
  for (const [, body] of [...src.chapters].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const ch = parseSnbt(body);
    if (!isSnbtObject(ch) || typeof ch.id !== "string") continue;
    const chapter = text(`chapter.${ch.id}.title`);
    for (const q of Array.isArray(ch.quests) ? ch.quests : []) {
      if (!isSnbtObject(q) || typeof q.id !== "string") continue;
      const items = new Set<string>();
      for (const r of Array.isArray(q.rewards) ? q.rewards : []) {
        if (!isSnbtObject(r)) continue;
        const direct = r.type === "item" ? itemOfReward(r) : null;
        if (direct) items.add(direct);
        if (r.type === "random" || r.type === "loot" || r.type === "choice") {
          const hex = rewardTableHex(r.table_id);
          for (const it of (hex && tables.get(hex)) || []) items.add(it);
        }
      }
      const ref: ItemQuestRef = { chapter, title: text(`quest.${q.id}.title`) };
      for (const it of items) {
        const list = out.get(it) ?? [];
        if (!list.some((x) => JSON.stringify(x) === JSON.stringify(ref))) list.push(ref);
        out.set(it, list);
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Estruturas .nbt
// ---------------------------------------------------------------------------------------------------------------

/** Chaves cujo conteudo e loja/equipamento/estado de mob, nao item deixado na estrutura. */
const STRUCTURE_SKIP_KEYS = new Set(["Offers", "CobbleMerchantShop", "HandItems", "ArmorItems", "Brain", "Attributes", "Inventory"]);

/**
 * ids de item deixados numa estrutura: no NBT de blocos e entidades, conteudo de `Items[]` (bau, vitrine...),
 * `item`/`Item` (vaso, bloco escovavel, moldura; string ou {id}) e `rewards[].item` (trial spawner). Loja de NPC
 * (`Offers`, `CobbleMerchantShop`) e equipamento de mob ficam de fora.
 */
export function structureItemIds(root: Nbt): Set<string> {
  const out = new Set<string>();
  const take = (x: Nbt | undefined): void => {
    const raw = typeof x === "string" ? x : isNbtObject(x) && typeof x.id === "string" ? x.id : null;
    const id = raw ? bareItemId(raw) : null;
    if (id) out.add(id);
  };
  const walk = (v: Nbt): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (isNbtObject(v)) {
      for (const [k, x] of Object.entries(v)) {
        if (STRUCTURE_SKIP_KEYS.has(k)) continue;
        if (k === "Items" && Array.isArray(x)) x.forEach(take);
        else if (k === "item" || k === "Item") take(x);
        if (typeof x === "object") walk(x);
      }
    }
  };
  if (!isNbtObject(root)) return out;
  for (const list of [root.blocks, root.entities]) {
    if (!Array.isArray(list)) continue;
    for (const b of list) if (isNbtObject(b) && b.nbt !== undefined) walk(b.nbt);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Worldgen
// ---------------------------------------------------------------------------------------------------------------

/** configured feature id -> blocos colocados (`Name` de qualquer block state no JSON). */
function blocksOfFeature(data: unknown): Set<string> {
  const out = new Set<string>();
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (isObject(v)) {
      if (typeof v.Name === "string") out.add(v.Name);
      Object.values(v).forEach(walk);
    }
  };
  walk(data);
  return out;
}

export interface WorldgenFiles {
  biomeModifiers: ReadonlyMap<string, unknown>;
  placed: ReadonlyMap<string, unknown>;
  configured: ReadonlyMap<string, unknown>;
}

/** bloco -> configured features (ids) adicionadas por biome modifiers `neoforge:add_features`. */
export function worldgenBlocks(files: WorldgenFiles): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const mod of files.biomeModifiers.values()) {
    if (!isObject(mod) || mod.type !== "neoforge:add_features") continue;
    const feats = typeof mod.features === "string" ? [mod.features] : Array.isArray(mod.features) ? mod.features.filter((f): f is string => typeof f === "string") : [];
    for (const placedId of feats) {
      const placed = files.placed.get(placedId);
      const configuredId = isObject(placed) && typeof placed.feature === "string" ? placed.feature : null;
      if (!configuredId) continue;
      for (const block of blocksOfFeature(files.configured.get(configuredId))) {
        if (!(out.get(block) ?? []).includes(configuredId)) addTo(out, block, configuredId);
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// special (config / interactions)
// ---------------------------------------------------------------------------------------------------------------

export interface SpecialRoute {
  note: LocalizedText;
  evidence: string;
}

const TERA_TYPES = ["bug", "dark", "dragon", "electric", "fairy", "fighting", "fire", "flying", "ghost", "grass", "ground", "ice", "normal", "poison", "psychic", "rock", "steel", "water"];

/** Tera shards pela config do Mega Showdown: `<tipo>_tera_shard` por teraShardDropRate, `stellar_tera_shard` por stellarShardDropRate. */
export function teraShardRoutes(config: unknown, file: string): Map<string, SpecialRoute> {
  const out = new Map<string, SpecialRoute>();
  if (!isObject(config)) return out;
  const tera = config.teraShardDropRate;
  const stellar = config.stellarShardDropRate;
  if (typeof tera === "number" && tera > 0) {
    for (const t of TERA_TYPES) {
      out.set(`mega_showdown:${t}_tera_shard`, {
        note: { pt: `Cai ao derrotar Pokémon do tipo Tera correspondente (taxa ${tera} na config do Mega Showdown).`, en: `Drops from defeated Pokémon of the matching Tera type (rate ${tera} in the Mega Showdown config).` },
        evidence: `${file}:teraShardDropRate`,
      });
    }
  }
  if (typeof stellar === "number" && stellar > 0) {
    out.set("mega_showdown:stellar_tera_shard", {
      note: { pt: `Cai ao derrotar Pokémon do tipo Tera Estelar (taxa ${stellar} na config do Mega Showdown).`, en: `Drops from defeated Pokémon of the Stellar Tera type (rate ${stellar} in the Mega Showdown config).` },
      evidence: `${file}:stellarShardDropRate`,
    });
  }
  return out;
}

/** give_item de data/cobblemon/pokemon_interactions/<especie>.json -> item -> rotas (nome da especie do dataset). */
export function interactionRoutes(files: ReadonlyMap<string, unknown>, speciesName: (slug: string) => LocalizedText | null): Map<string, SpecialRoute[]> {
  const out = new Map<string, SpecialRoute[]>();
  for (const [file, data] of [...files].sort(([a], [b]) => (a < b ? -1 : 1))) {
    if (!isObject(data) || !Array.isArray(data.interactions)) continue;
    const slug = /([^/]+)\.json$/.exec(file)?.[1] ?? "";
    const name = speciesName(slug);
    if (!name) continue;
    data.interactions.forEach((it, k) => {
      if (!isObject(it) || !Array.isArray(it.effects)) return;
      const held = Array.isArray(it.requirements)
        ? it.requirements.find((r): r is Json => isObject(r) && r.variant === "owner_held_item" && typeof r.itemCondition === "string")
        : undefined;
      for (const e of it.effects) {
        if (!isObject(e) || e.variant !== "give_item" || typeof e.item !== "string") continue;
        const item = bareItemId(e.item);
        if (!item) continue;
        const withItem = held ? ` com ${held.itemCondition as string} na mão` : "";
        const withItemEn = held ? ` holding ${held.itemCondition as string}` : "";
        addTo(out, item, {
          note: { pt: `Interagir com ${name.pt}${withItem}.`, en: `Interact with ${name.en}${withItemEn}.` },
          evidence: `${file}:interactions[${k}]`,
        });
      }
    });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Coleta (fonte real ou snapshot)
// ---------------------------------------------------------------------------------------------------------------

export interface ExtraSources {
  shop: Map<string, number | null>;
  rituals: Map<string, string[]>;
  quests: Map<string, ItemQuestRef[]>;
  trades: Set<string>;
  worldgenBlocks: Map<string, string[]>;
  structures: Map<string, string[]>;
  special: Map<string, SpecialRoute[]>;
}

const textOf = (bytes: Uint8Array) => decoder.decode(bytes).replace(/^\uFEFF/, "");

function jsonMap(files: readonly { path: string; bytes: Uint8Array }[], re: RegExp): Map<string, unknown> {
  const out = new Map<string, unknown>();
  for (const f of files) {
    const m = re.exec(f.path);
    if (!m) continue;
    const data = parseLenient(f.bytes);
    if (data !== undefined) out.set(`${m[1] as string}:${m[2] as string}`, data);
  }
  return out;
}

export function collectExtraSources(ctx: Pick<PipelineContext, "reader" | "report">, speciesName: (slug: string) => LocalizedText | null): ExtraSources {
  const r = ctx.reader;
  const readOpt = (rel: string) => (r.exists(rel) ? r.readFile(rel) : null);

  const shopBytes = readOpt("config/cobblemon_battle_tower/bp_shop_items.json");
  const shop = shopBytes ? parseBpShop(parseLenient(shopBytes)) : new Map<string, number | null>();

  const scripts = new Map<string, string>();
  for (const [rel, bytes] of r.readTree("kubejs/server_scripts")) if (rel.endsWith(".js")) scripts.set(`kubejs/server_scripts/${rel}`, textOf(bytes));
  const rituals = parseRituals(scripts);

  const Q = "config/ftbquests/quests";
  const chapters = new Map<string, string>();
  for (const [rel, bytes] of r.readTree(`${Q}/chapters`)) if (rel.endsWith(".snbt")) chapters.set(rel, textOf(bytes));
  const rewardTables = new Map<string, string>();
  for (const [rel, bytes] of r.readTree(`${Q}/reward_tables`)) if (rel.endsWith(".snbt")) rewardTables.set(rel, textOf(bytes));
  const langOf = (code: string) => {
    const b = readOpt(`${Q}/lang/${code}.snbt`);
    return b ? parseFtbLang(textOf(b)) : new Map<string, string>();
  };
  const quests = parseQuestRewards({ chapters, rewardTables, langPt: langOf("pt_br"), langEn: langOf("en_us") });

  const jarFiles: { path: string; bytes: Uint8Array }[] = [];
  const nbtFiles: { path: string; bytes: Uint8Array }[] = [];
  const DATA_RE = /^data\/[^/]+\/(?:wanderer_trades\/.+|neoforge\/biome_modifier\/.+|worldgen\/(?:placed_feature|configured_feature)\/.+|pokemon_interactions\/.+)\.json$/;
  const NBT_RE = /^data\/[^/]+\/structures?\/.+\.nbt$/;
  for (const jar of modJarPaths(r.root)) {
    jarFiles.push(...readJarData(jar.path, ["wanderer_trades", "neoforge", "worldgen", "pokemon_interactions"], DATA_RE));
    nbtFiles.push(...readJarData(jar.path, ["structure", "structures"], NBT_RE));
  }
  for (const [rel, bytes] of r.readTree("kubejs/data")) {
    const p = `data/${rel}`;
    if (DATA_RE.test(p)) jarFiles.push({ path: p, bytes });
    else if (NBT_RE.test(p)) nbtFiles.push({ path: p, bytes });
  }

  const trades = new Set<string>();
  for (const data of jsonMap(jarFiles, /^data\/([^/]+)\/wanderer_trades\/(.+)\.json$/).values()) {
    if (isObject(data) && isObject(data.output) && typeof data.output.id === "string") {
      const id = bareItemId(data.output.id);
      if (id) trades.add(id);
    }
  }

  const worldgen = worldgenBlocks({
    biomeModifiers: jsonMap(jarFiles, /^data\/([^/]+)\/neoforge\/biome_modifier\/(.+)\.json$/),
    placed: jsonMap(jarFiles, /^data\/([^/]+)\/worldgen\/placed_feature\/(.+)\.json$/),
    configured: jsonMap(jarFiles, /^data\/([^/]+)\/worldgen\/configured_feature\/(.+)\.json$/),
  });

  const structures = new Map<string, string[]>();
  const nbtByPath = new Map<string, Uint8Array>();
  for (const f of nbtFiles) nbtByPath.set(f.path, f.bytes); // kubejs por ultimo: mesmo caminho sobrescreve o jar
  for (const [p, bytes] of [...nbtByPath].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const m = /^data\/([^/]+)\/structures?\/(.+)\.nbt$/.exec(p);
    if (!m) continue;
    let root: Nbt;
    try {
      root = parseNbt(bytes);
    } catch {
      ctx.report.warn("W_STRUCTURE_NBT_UNREADABLE", `estrutura ilegivel: ${p}`, { path: p });
      continue;
    }
    const structureId = `${m[1] as string}:${m[2] as string}`;
    for (const item of structureItemIds(root)) if (!(structures.get(item) ?? []).includes(structureId)) addTo(structures, item, structureId);
  }

  const special = new Map<string, SpecialRoute[]>();
  const msConfig = readOpt("config/mega_showdown/config.json");
  if (msConfig) for (const [item, route] of teraShardRoutes(parseLenient(msConfig), "config/mega_showdown/config.json")) addTo(special, item, route);
  const interactions = new Map<string, unknown>();
  for (const f of jarFiles) {
    const m = /^data\/cobblemon\/pokemon_interactions\/(.+)\.json$/.exec(f.path);
    if (m) interactions.set(f.path, parseLenient(f.bytes));
  }
  for (const [item, routes] of interactionRoutes(interactions, speciesName)) for (const route of routes) addTo(special, item, route);

  return { shop, rituals, quests, trades, worldgenBlocks: worldgen, structures, special };
}

/** Estruturas como ItemNamedRef (sem nome no lang do jogo: null). */
export const structureRefs = (ids: readonly string[]): ItemNamedRef[] => [...new Set(ids)].sort().map((id) => ({ id, name: null }));
