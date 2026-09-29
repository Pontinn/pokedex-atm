// Iscas de spawn (spawn-bait, SPEC F1.2): regra das 3 melhores bagas, contextos das linhas Poke-Lanche/Pokeisca,
// reforcos genericos e faixa de Lure. Funcoes puras sobre items.json + ficha: sem fetch, sem React (RNF-10).
import type { ItemsFile, SpawnEntry, SpeciesDetail } from "../data/types";

export const SNACK_ITEM_ID = "cobblemon:poke_snack";
export const POKE_BAIT_ITEM_ID = "cobblemon:poke_bait";
/** a Panela de Fogueira aceita ate 3 temperos */
export const MAX_SEASONINGS = 3;

export interface BaitPick {
  itemId: string;
  kind: "typing" | "eggGroup";
  /** subcategorias do mesmo kind da baga, na ordem do arquivo (Lum -> ["dragon", "monster"]) */
  labels: string[];
}

export interface BaitBooster {
  itemId: string;
  rarity: boolean;
  shiny: boolean;
}

export interface BaitIndex {
  byType: Map<string, string[]>;
  byEggGroup: Map<string, string[]>;
  labels: Map<string, { typing: string[]; eggGroup: string[] }>;
  boosters: BaitBooster[];
}

function byId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function push(map: Map<string, string[]>, key: string, id: string): void {
  const list = map.get(key);
  if (list) {
    if (!list.includes(id)) list.push(id);
  } else map.set(key, [id]);
}

/** Indice das candidatas: so itens aceitos como tempero pela panela (RF-08/16/55); listas ordenadas por id. */
export function buildBaitIndex(items: ItemsFile): BaitIndex {
  const byType = new Map<string, string[]>();
  const byEggGroup = new Map<string, string[]>();
  const labels = new Map<string, { typing: string[]; eggGroup: string[] }>();
  const boosters: BaitBooster[] = [];
  for (const id of Object.keys(items).sort(byId)) {
    const bait = items[id]?.bait;
    if (!bait?.seasoning) continue;
    const own = { typing: [] as string[], eggGroup: [] as string[] };
    let rarity = false;
    let shiny = false;
    for (const e of bait.effects) {
      if (e.kind === "typing" && e.subcategory) {
        push(byType, e.subcategory, id);
        if (!own.typing.includes(e.subcategory)) own.typing.push(e.subcategory);
      } else if (e.kind === "eggGroup" && e.subcategory) {
        push(byEggGroup, e.subcategory, id);
        if (!own.eggGroup.includes(e.subcategory)) own.eggGroup.push(e.subcategory);
      } else if (e.kind === "rarityBucket") rarity = true;
      else if (e.kind === "shinyReroll") shiny = true;
    }
    if (own.typing.length || own.eggGroup.length) labels.set(id, own);
    if (rarity || shiny) boosters.push({ itemId: id, rarity, shiny });
  }
  return { byType, byEggGroup, labels, boosters };
}

const cache = new WeakMap<ItemsFile, BaitIndex>();

/** buildBaitIndex memoizado por objeto items (o catalogo carregado e sempre o mesmo objeto). */
export function getBaitIndex(items: ItemsFile): BaitIndex {
  let index = cache.get(items);
  if (!index) {
    index = buildBaitIndex(items);
    cache.set(items, index);
  }
  return index;
}

/** Reforcos genericos (efeito de raridade ou shiny), ordenados por id. */
export function baitBoosters(items: ItemsFile): BaitBooster[] {
  return getBaitIndex(items).boosters;
}

/**
 * Linhas do bloco: Poke-Lanche se algum spawn nao e de pesca, Pokeisca se algum e de pesca; null sem spawn
 * (sem bloco, RF-06).
 */
export function baitContexts(spawns: readonly Pick<SpawnEntry, "context">[]): { snack: boolean; rod: boolean } | null {
  if (spawns.length === 0) return null;
  return { snack: spawns.some((s) => s.context !== "fishing"), rod: spawns.some((s) => s.context === "fishing") };
}

/**
 * 3 melhores bagas: bagas de tipo na ordem dos tipos do Pokemon, depois de grupo de ovo na ordem da ficha; sem
 * repetir (fica a primeira posicao); corta em max. Grupo sem baga nao acrescenta e nada e completado (RF-52/53).
 */
export function recommendBerries(species: Pick<SpeciesDetail, "types" | "eggGroups">, index: BaitIndex, max = MAX_SEASONINGS): BaitPick[] {
  const picks: BaitPick[] = [];
  const seen = new Set<string>();
  const take = (ids: readonly string[] | undefined, kind: BaitPick["kind"]): void => {
    for (const id of ids ?? []) {
      if (picks.length >= max) return;
      if (seen.has(id)) continue;
      seen.add(id);
      picks.push({ itemId: id, kind, labels: [...(index.labels.get(id)?.[kind] ?? [])] });
    }
  };
  for (const type of species.types) take(index.byType.get(type), "typing");
  for (const group of species.eggGroups) take(index.byEggGroup.get(group), "eggGroup");
  return picks;
}

export type LureRangeKey = "where.fish.rangeMin" | "where.fish.rangeMax" | "where.fish.rangeBoth";

/** Faixa de nivel de Lure para o texto: ambos -> "a", so min -> "+", so max -> "ate"; nenhum -> null. */
export function lureRange(min: number | null, max: number | null): { key: LureRangeKey; vars: Record<string, number> } | null {
  if (min != null && max != null) return { key: "where.fish.rangeBoth", vars: { min, max } };
  if (min != null) return { key: "where.fish.rangeMin", vars: { min } };
  if (max != null) return { key: "where.fish.rangeMax", vars: { max } };
  return null;
}
