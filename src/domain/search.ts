// Busca bilingue sem acento (RF-05..07, RF-67). normalizeSearch vem de normalize.ts (fonte unica, B1.5).
import type { ItemInfo, SpeciesSummary } from "../data/types";
import { normalizeSearch } from "./normalize";

export { normalizeSearch };

const DEX_QUERY = /^#?0*(\d{1,4})$/;

/** "25", "025", "0025", "#25" -> 25; "0" ou texto -> null. */
export function parseDexQuery(q: string): number | null {
  const m = DEX_QUERY.exec(q.trim());
  if (!m) return null;
  const n = Number(m[1]);
  return n > 0 ? n : null;
}

type Scored<T> = { item: T; rank: number; tie: number | string };

function byScore<T>(a: Scored<T>, b: Scored<T>): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  return typeof a.tie === "number" && typeof b.tie === "number" ? a.tie - b.tie : String(a.tie).localeCompare(String(b.tie));
}

/** rank 0 = alguma palavra/nome comeca com a query; 1 = substring; -1 = nao casa. Sem regex sobre a query. */
function matchRank(parts: readonly string[], norm: string): number {
  if (parts.some((p) => p.startsWith(norm) || p.split(/\s+/).some((w) => w.startsWith(norm)))) return 0;
  return parts.some((p) => p.includes(norm)) ? 1 : -1;
}

export function searchSpecies(index: readonly SpeciesSummary[], q: string, limit: number = Number.POSITIVE_INFINITY): SpeciesSummary[] {
  const dex = parseDexQuery(q);
  if (dex !== null) return index.filter((s) => s.dex === dex).slice(0, limit);
  const norm = normalizeSearch(q);
  if (!norm) return [];
  const scored: Scored<SpeciesSummary>[] = [];
  for (const s of index) {
    const rank = matchRank(s.searchKey.split("|"), norm);
    if (rank >= 0) scored.push({ item: s, rank, tie: s.dex });
  }
  return scored.sort(byScore).slice(0, limit).map((x) => x.item);
}

export function searchItems(
  items: readonly ItemInfo[] | Readonly<Record<string, ItemInfo>>,
  q: string,
  limit: number = Number.POSITIVE_INFINITY,
): ItemInfo[] {
  const norm = normalizeSearch(q);
  if (!norm) return [];
  const list = Array.isArray(items) ? (items as readonly ItemInfo[]) : Object.values(items);
  const scored: Scored<ItemInfo>[] = [];
  for (const item of list) {
    const rank = matchRank([normalizeSearch(item.name.pt), normalizeSearch(item.name.en)], norm);
    if (rank >= 0) scored.push({ item, rank, tie: item.id });
  }
  return scored.sort(byScore).slice(0, limit).map((x) => x.item);
}
