// Historico de fichas vistas (RF-43..46): max 20, mais recente primeiro, sem duplicados.
import type { HistoryEntry } from "../storage/types";

export const HISTORY_LIMIT = 20;

function assertDex(dex: number): void {
  if (!Number.isInteger(dex) || dex <= 0) throw new RangeError(`invalid dex: ${dex}`);
}

/** Remove a entrada do mesmo dex, insere no topo e corta em HISTORY_LIMIT. Nao altera `entries`. */
export function pushHistory(entries: readonly HistoryEntry[], dex: number, now: number): HistoryEntry[] {
  assertDex(dex);
  const rest = entries.filter((e) => e.dex !== dex);
  return [{ dex, viewedAt: now }, ...rest].slice(0, HISTORY_LIMIT);
}

/** Uniao de duas listas: dedup por dex mantendo o maior viewedAt, ordena desc, corta em 20 (sync, §5.4.4). */
export function mergeHistory(a: readonly HistoryEntry[], b: readonly HistoryEntry[]): HistoryEntry[] {
  const byDex = new Map<number, HistoryEntry>();
  for (const e of [...a, ...b]) {
    const prev = byDex.get(e.dex);
    if (!prev || e.viewedAt > prev.viewedAt) byDex.set(e.dex, { dex: e.dex, viewedAt: e.viewedAt });
  }
  return [...byDex.values()]
    .sort((x, y) => y.viewedAt - x.viewedAt || x.dex - y.dex)
    .slice(0, HISTORY_LIMIT);
}
