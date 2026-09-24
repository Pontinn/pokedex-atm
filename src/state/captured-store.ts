// Store de capturados (F2.2; CONGELADA depois de F2, consumida pelos grupos A e B). Doc `captured` de B7.1.
// Tambem exporta a base comum das stores de dados do usuario (time e historico importam daqui):
// - storage: getAppStorage() do boot, ou o injetado por setUserStoreStorage (testes);
// - hidratacao preguicosa e idempotente (o boot.ts e congelado): quem usa chama `hydrate()` (ou o hook useXHydrated);
// - escritas serializadas por store, sempre o doc INTEIRO a partir da memoria (nunca ler-modificar-gravar concorrente);
// - erro de escrita: o estado fica em memoria, `persistError` recebe o codigo e sobe toast persistente (SPEC 5.3);
// - reidratacao: evento global "pontindex:data-changed" (backup/sync/apagar dados, agente C);
// - orfaos (RF-123): o doc guarda ids desconhecidos intactos; a UI filtra com o indice do dataset.
import { useEffect } from "react";
import { create } from "zustand";
import type { DocKey, DocMap, DocumentStorage } from "../storage";
import { getAppStorage } from "./app-storage";
import { useDatasetStore } from "./dataset-store";
import { useShellStore } from "./shell-store";

// ---------------------------------------------------------------------------
// Base comum (time/historico importam daqui)
// ---------------------------------------------------------------------------

export const DATA_CHANGED_EVENT = "pontindex:data-changed";

let injectedStorage: DocumentStorage | null = null;

/** Troca o storage das stores de usuario (testes). `null` volta ao do app. */
export function setUserStoreStorage(storage: DocumentStorage | null): void {
  injectedStorage = storage;
}

export function userStoreStorage(): DocumentStorage {
  return injectedStorage ?? getAppStorage();
}

export type PersistErrorCode = "QUOTA_EXCEEDED" | "BLOCKED" | "UNAVAILABLE" | "UNKNOWN";

export function persistErrorCode(err: unknown): PersistErrorCode {
  const code = (err as { code?: unknown } | null)?.code;
  return code === "QUOTA_EXCEEDED" || code === "BLOCKED" || code === "UNAVAILABLE" ? code : "UNKNOWN";
}

export function reportPersistError(key: DocKey, err: unknown): PersistErrorCode {
  console.warn(`[${key}-store] write failed`, err);
  useShellStore.getState().pushToast("error.storage", { tone: "error", persistent: true });
  return persistErrorCode(err);
}

/** Fila serial de tarefas assincronas de uma store. */
export function createWriteChain() {
  let tail: Promise<unknown> = Promise.resolve();
  return function enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = tail.then(task, task);
    tail = run.catch(() => undefined);
    return run;
  };
}

/** Hidratacao unica com dedup em voo. */
export function createHydrator(load: () => Promise<void>) {
  let done = false;
  let inFlight: Promise<void> | null = null;
  const ensure = (): Promise<void> => {
    if (done) return Promise.resolve();
    if (!inFlight) {
      inFlight = load()
        .then(() => {
          done = true;
        })
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  };
  return {
    ensure,
    /** Recarrega do storage mesmo se ja hidratada. */
    reload(): Promise<void> {
      done = false;
      inFlight = null;
      return ensure();
    },
    reset(): void {
      done = false;
      inFlight = null;
    },
  };
}

/** Liga a reidratacao ao evento global do agente C. */
export function onDataChanged(key: DocKey, reload: () => Promise<void>): void {
  if (typeof window === "undefined") return;
  window.addEventListener(DATA_CHANGED_EVENT, (ev) => {
    const keys = (ev as CustomEvent<{ keys?: DocKey[] }>).detail?.keys;
    if (!keys || keys.includes(key)) void reload().catch((err) => console.warn(`[${key}-store] reload failed`, err));
  });
}

let knownCacheSrc: unknown = null;
let knownCache: ReadonlySet<number> | null = null;

/** Conjunto de dex do dataset atual (memoizado por indice); null enquanto o indice nao carregou. */
export function knownDexSet(index: readonly { dex: number }[] | null): ReadonlySet<number> | null {
  if (!index) return null;
  if (index !== knownCacheSrc) {
    knownCacheSrc = index;
    knownCache = new Set(index.map((s) => s.dex));
  }
  return knownCache;
}

export function useKnownDexSet(): ReadonlySet<number> | null {
  return knownDexSet(useDatasetStore((s) => s.speciesIndex));
}

export function assertDex(dex: number): void {
  if (!Number.isInteger(dex) || dex <= 0) throw new RangeError(`invalid dex: ${dex}`);
}

// ---------------------------------------------------------------------------
// Capturados
// ---------------------------------------------------------------------------

export type CapturedEntries = DocMap["captured"]["entries"];

export interface CapturedState {
  /** doc cru: chave String(dex) -> { capturedAt }; inclui orfaos (RF-123) */
  entries: CapturedEntries;
  hydrated: boolean;
  persistError: PersistErrorCode | null;
  /** hidrata do storage uma vez (idempotente) */
  hydrate(): Promise<void>;
  /** recarrega do storage (backup/sync/apagar) */
  reload(): Promise<void>;
  /** marca como capturado; re-marcar mantem a data original */
  mark(dex: number, at?: number): Promise<void>;
  /** desmarca */
  unmark(dex: number): Promise<void>;
}

const enqueueCaptured = createWriteChain();

const capturedHydrator = createHydrator(async () => {
  const doc = await userStoreStorage().readOrDefault("captured");
  useCapturedStore.setState({ entries: { ...doc.entries }, hydrated: true });
});

function persistCaptured(): Promise<void> {
  return enqueueCaptured(async () => {
    const doc: DocMap["captured"] = { schemaVersion: 1, entries: useCapturedStore.getState().entries };
    try {
      await userStoreStorage().write("captured", doc);
      useCapturedStore.setState({ persistError: null });
    } catch (err) {
      useCapturedStore.setState({ persistError: reportPersistError("captured", err) });
    }
  });
}

export const useCapturedStore = create<CapturedState>()((set, get) => ({
  entries: {},
  hydrated: false,
  persistError: null,
  hydrate: () => capturedHydrator.ensure(),
  reload: () => capturedHydrator.reload(),
  async mark(dex, at = Date.now()) {
    assertDex(dex);
    await capturedHydrator.ensure();
    if (String(dex) in get().entries) return;
    set({ entries: { ...get().entries, [String(dex)]: { capturedAt: at } } });
    await persistCaptured();
  },
  async unmark(dex) {
    assertDex(dex);
    await capturedHydrator.ensure();
    if (!(String(dex) in get().entries)) return;
    const next = { ...get().entries };
    delete next[String(dex)];
    set({ entries: next });
    await persistCaptured();
  },
}));

onDataChanged("captured", () => capturedHydrator.reload());

/** Hidrata ao montar (componentes que leem capturados); devolve `hydrated`. */
export function useCapturedHydrated(): boolean {
  const hydrated = useCapturedStore((s) => s.hydrated);
  useEffect(() => {
    useCapturedStore
      .getState()
      .hydrate()
      .catch((err) => console.warn("[captured-store] hydrate failed", err));
  }, []);
  return hydrated;
}

/** true se o dex esta capturado (re-renderiza so quando ESTE dex muda). */
export function useIsCaptured(dex: number): boolean {
  return useCapturedStore((s) => String(dex) in s.entries);
}

/** Lista {dex, capturedAt} so com especies do dataset atual (orfaos escondidos, nao apagados). */
export function capturedKnownList(
  entries: CapturedEntries,
  known: ReadonlySet<number> | null,
): { dex: number; capturedAt: number }[] {
  const out: { dex: number; capturedAt: number }[] = [];
  for (const [k, v] of Object.entries(entries)) {
    const dex = Number(k);
    if (known && !known.has(dex)) continue;
    out.push({ dex, capturedAt: v.capturedAt });
  }
  return out;
}

/** Quantidade de capturados conhecidos no dataset atual (contador da Home e da lista, RF-52). */
export function useCapturedKnownCount(): number {
  const known = useKnownDexSet();
  return useCapturedStore((s) => {
    if (!known) return 0;
    let n = 0;
    for (const k of Object.keys(s.entries)) if (known.has(Number(k))) n++;
    return n;
  });
}

/** So para testes. */
export function resetCapturedStore(): void {
  capturedHydrator.reset();
  useCapturedStore.setState({ entries: {}, hydrated: false, persistError: null });
}
