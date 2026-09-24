// Progresso de treinadores (RF-60..62, RF-111, RF-124): derrotados por serie, serie ativa e Modo Livre.
import type { TrainerProgressDoc } from "../types";
import { readDoc, updateDoc, type RepoStorage } from "./shared";

export function createTrainerProgressRepository(storage: RepoStorage, now: () => number = Date.now) {
  return {
    get(): Promise<TrainerProgressDoc> {
      return readDoc(storage, "trainerProgress");
    },
    markDefeated(seriesId: string, trainerId: string, at: number = now()) {
      return updateDoc(storage, "trainerProgress", (doc) => {
        const s = (doc.series[seriesId] ??= { defeated: {} });
        if (!(trainerId in s.defeated)) s.defeated[trainerId] = { at };
        return doc;
      });
    },
    unmarkDefeated(seriesId: string, trainerId: string) {
      return updateDoc(storage, "trainerProgress", (doc) => {
        const s = doc.series[seriesId];
        if (s) delete s.defeated[trainerId];
        return doc;
      });
    },
    setActiveSeries(seriesId: string | null) {
      return updateDoc(storage, "trainerProgress", (doc) => ({
        ...doc,
        activeSeriesId: seriesId,
        freeroam: { active: false, pausedSeriesId: null },
      }));
    },
    /** Pausa a serie ativa e entra no Modo Livre (cap 100). */
    enterFreeroam() {
      return updateDoc(storage, "trainerProgress", (doc) =>
        doc.freeroam.active ? doc : { ...doc, freeroam: { active: true, pausedSeriesId: doc.activeSeriesId } },
      );
    },
    /** Sai do Modo Livre e retoma a serie pausada. */
    leaveFreeroam() {
      return updateDoc(storage, "trainerProgress", (doc) =>
        doc.freeroam.active
          ? { ...doc, activeSeriesId: doc.freeroam.pausedSeriesId, freeroam: { active: false, pausedSeriesId: null } }
          : doc,
      );
    },
  };
}
