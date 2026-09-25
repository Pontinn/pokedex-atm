// Store de progresso de treinadores (F8; SPEC chama de trainer-progress-store). Doc `trainerProgress` de B7.1.
// Mesmo padrao das stores de F2.2 (captured-store.ts): hidratacao preguicosa e idempotente, escrita do doc INTEIRO
// a partir da memoria numa fila serial, erro de escrita mantem a memoria e sobe toast persistente, e reidratacao
// pelo evento global "pontindex:data-changed" (backup/sync/apagar dados).
import { useEffect } from "react";
import { create } from "zustand";
import type { TrainerProgressDoc } from "../storage/types";
import {
  createHydrator,
  createWriteChain,
  onDataChanged,
  reportPersistError,
  userStoreStorage,
  type PersistErrorCode,
} from "./captured-store";

export function emptyTrainerProgress(): TrainerProgressDoc {
  return { schemaVersion: 1, activeSeriesId: null, freeroam: { active: false, pausedSeriesId: null }, series: {} };
}

export interface TrainersState {
  progress: TrainerProgressDoc;
  hydrated: boolean;
  persistError: PersistErrorCode | null;
  hydrate(): Promise<void>;
  reload(): Promise<void>;
  /** escolhe a serie ativa (sai do Modo Livre); null = nenhuma */
  setActiveSeries(seriesId: string | null): Promise<void>;
  /** pausa a serie ativa e entra no Modo Livre (cap 100) */
  enterFreeroam(): Promise<void>;
  /** sai do Modo Livre e retoma a serie pausada */
  leaveFreeroam(): Promise<void>;
  markDefeated(seriesId: string, trainerId: string, at?: number): Promise<void>;
  unmarkDefeated(seriesId: string, trainerId: string): Promise<void>;
}

const enqueue = createWriteChain();

const hydrator = createHydrator(async () => {
  const doc = await userStoreStorage().readOrDefault("trainerProgress");
  useTrainersStore.setState({ progress: structuredClone(doc), hydrated: true });
});

function persist(): Promise<void> {
  return enqueue(async () => {
    try {
      await userStoreStorage().write("trainerProgress", useTrainersStore.getState().progress);
      useTrainersStore.setState({ persistError: null });
    } catch (err) {
      useTrainersStore.setState({ persistError: reportPersistError("trainerProgress", err) });
    }
  });
}

export const useTrainersStore = create<TrainersState>()((set, get) => {
  async function apply(next: (doc: TrainerProgressDoc) => TrainerProgressDoc | null): Promise<void> {
    await hydrator.ensure();
    const doc = next(get().progress);
    if (!doc) return;
    set({ progress: doc });
    await persist();
  }
  return {
    progress: emptyTrainerProgress(),
    hydrated: false,
    persistError: null,
    hydrate: () => hydrator.ensure(),
    reload: () => hydrator.reload(),
    setActiveSeries: (seriesId) =>
      apply((doc) =>
        doc.activeSeriesId === seriesId && !doc.freeroam.active
          ? null
          : { ...doc, activeSeriesId: seriesId, freeroam: { active: false, pausedSeriesId: null } },
      ),
    enterFreeroam: () =>
      apply((doc) => (doc.freeroam.active ? null : { ...doc, freeroam: { active: true, pausedSeriesId: doc.activeSeriesId } })),
    leaveFreeroam: () =>
      apply((doc) =>
        doc.freeroam.active
          ? { ...doc, activeSeriesId: doc.freeroam.pausedSeriesId, freeroam: { active: false, pausedSeriesId: null } }
          : null,
      ),
    markDefeated: (seriesId, trainerId, at = Date.now()) =>
      apply((doc) => {
        const current = doc.series[seriesId]?.defeated ?? {};
        if (Object.hasOwn(current, trainerId)) return null;
        return { ...doc, series: { ...doc.series, [seriesId]: { defeated: { ...current, [trainerId]: { at } } } } };
      }),
    unmarkDefeated: (seriesId, trainerId) =>
      apply((doc) => {
        const current = doc.series[seriesId]?.defeated;
        if (!current || !Object.hasOwn(current, trainerId)) return null;
        const defeated = { ...current };
        delete defeated[trainerId];
        return { ...doc, series: { ...doc.series, [seriesId]: { defeated } } };
      }),
  };
});

onDataChanged("trainerProgress", () => hydrator.reload());

/** Hidrata ao montar; devolve `hydrated`. */
export function useTrainersHydrated(): boolean {
  const hydrated = useTrainersStore((s) => s.hydrated);
  useEffect(() => {
    useTrainersStore
      .getState()
      .hydrate()
      .catch((err) => console.warn("[trainers-store] hydrate failed", err));
  }, []);
  return hydrated;
}

/** So para testes. */
export function resetTrainersStore(): void {
  hydrator.reset();
  useTrainersStore.setState({ progress: emptyTrainerProgress(), hydrated: false, persistError: null });
}
