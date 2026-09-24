// Preferencias (RF-79..94): patch parcial sobre o doc inteiro.
import type { PreferencesDoc } from "../types";
import { readDoc, updateDoc, type RepoStorage } from "./shared";

export type PreferencesPatch = Partial<Omit<PreferencesDoc, "schemaVersion">>;

export function createPreferencesRepository(storage: RepoStorage) {
  return {
    get(): Promise<PreferencesDoc> {
      return readDoc(storage, "preferences");
    },
    set(patch: PreferencesPatch): Promise<PreferencesDoc> {
      return updateDoc(storage, "preferences", (doc) => ({ ...doc, ...patch, schemaVersion: 1 }));
    },
  };
}
