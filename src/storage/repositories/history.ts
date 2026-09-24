// Historico (RF-43..46): regras de B6.6 (src/domain/history.ts).
import { pushHistory } from "../../domain/history";
import type { HistoryEntry } from "../types";
import { readDoc, updateDoc, type RepoStorage } from "./shared";

export function createHistoryRepository(storage: RepoStorage, now: () => number = Date.now) {
  return {
    async get(): Promise<HistoryEntry[]> {
      return (await readDoc(storage, "history")).entries;
    },
    async push(dex: number, at: number = now()): Promise<HistoryEntry[]> {
      const doc = await updateDoc(storage, "history", (d) => ({ ...d, entries: pushHistory(d.entries, dex, at) }));
      return doc.entries;
    },
  };
}
