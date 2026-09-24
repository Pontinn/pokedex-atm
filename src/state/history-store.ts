// Store do historico de fichas vistas (F2.2; CONGELADA depois de F2). Doc `history` de B7.1, regras de
// src/domain/history.ts (B6.6): mais recente primeiro, sem duplicados, max 20, sem botao de limpar (RF-46).
// Quem registra a visita e a ficha (grupo A): `useHistoryStore.getState().push(dex)` ao abrir a ficha.
import { useEffect } from "react";
import { create } from "zustand";
import { HISTORY_LIMIT, pushHistory } from "../domain/history";
import type { DocMap, HistoryEntry } from "../storage";
import {
  assertDex,
  createHydrator,
  createWriteChain,
  onDataChanged,
  reportPersistError,
  userStoreStorage,
  type PersistErrorCode,
} from "./captured-store";

export interface HistoryState {
  /** [0] = mais recente; inclui orfaos (a UI filtra com o indice do dataset) */
  entries: HistoryEntry[];
  hydrated: boolean;
  persistError: PersistErrorCode | null;
  hydrate(): Promise<void>;
  reload(): Promise<void>;
  /** move/insere o dex no topo e corta em 20 (pushHistory de B6.6) */
  push(dex: number, at?: number): Promise<void>;
}

/** Leitura defensiva: ordena desc, deduplica por dex (fica a visita mais recente) e corta em 20. */
export function sanitizeHistory(entries: readonly HistoryEntry[]): HistoryEntry[] {
  const seen = new Set<number>();
  const out: HistoryEntry[] = [];
  for (const e of [...entries].sort((a, b) => b.viewedAt - a.viewedAt)) {
    if (seen.has(e.dex)) continue;
    seen.add(e.dex);
    out.push({ dex: e.dex, viewedAt: e.viewedAt });
  }
  return out.slice(0, HISTORY_LIMIT);
}

const enqueueHistory = createWriteChain();

const historyHydrator = createHydrator(async () => {
  const doc = await userStoreStorage().readOrDefault("history");
  useHistoryStore.setState({ entries: sanitizeHistory(doc.entries), hydrated: true });
});

function persistHistory(): Promise<void> {
  return enqueueHistory(async () => {
    const doc: DocMap["history"] = { schemaVersion: 1, entries: useHistoryStore.getState().entries };
    try {
      await userStoreStorage().write("history", doc);
      useHistoryStore.setState({ persistError: null });
    } catch (err) {
      useHistoryStore.setState({ persistError: reportPersistError("history", err) });
    }
  });
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  entries: [],
  hydrated: false,
  persistError: null,
  hydrate: () => historyHydrator.ensure(),
  reload: () => historyHydrator.reload(),
  async push(dex, at = Date.now()) {
    assertDex(dex);
    await historyHydrator.ensure();
    set({ entries: pushHistory(get().entries, dex, at) });
    await persistHistory();
  },
}));

onDataChanged("history", () => historyHydrator.reload());

/** Hidrata ao montar; devolve `hydrated`. */
export function useHistoryHydrated(): boolean {
  const hydrated = useHistoryStore((s) => s.hydrated);
  useEffect(() => {
    useHistoryStore
      .getState()
      .hydrate()
      .catch((err) => console.warn("[history-store] hydrate failed", err));
  }, []);
  return hydrated;
}

/** So para testes. */
export function resetHistoryStore(): void {
  historyHydrator.reset();
  useHistoryStore.setState({ entries: [], hydrated: false, persistError: null });
}
