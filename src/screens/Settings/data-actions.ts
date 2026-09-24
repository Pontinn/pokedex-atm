// Acoes de dados compartilhadas por Configuracoes e Sincronizar (agente C).
// Reidratacao depois de backup/sync/apagar: a store de preferencias e recarregada do storage e um evento
// global "pontindex:data-changed" avisa as stores das outras telas (capturados, time, historico, treinadores).
import { createPreferencesRepository, type DocKey, type DocMap, type DocumentStorage } from "../../storage";
import { flushPreferences, hydratePreferences, usePreferencesStore } from "../../state/preferences-store";
import { getAppStorage } from "../../state/app-storage";
import type { UiLanguage } from "../../storage/types";

export const DATA_CHANGED_EVENT = "pontindex:data-changed";

export interface DataChangedDetail {
  keys: DocKey[];
}

/** Recarrega as preferencias do storage e avisa as outras stores. */
export async function rehydrateAll(storage: DocumentStorage, keys: DocKey[]): Promise<void> {
  await flushPreferences();
  if (keys.includes("preferences")) await hydratePreferences(createPreferencesRepository(storage));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<DataChangedDetail>(DATA_CHANGED_EVENT, { detail: { keys } }));
  }
}

/** Troca o idioma padrao dos termos e limpa os overrides por card (app.js:1343, RF-86). */
export async function applyTermsDefault(lang: UiLanguage): Promise<void> {
  const store = usePreferencesStore.getState();
  const hadOverrides = Object.keys(store.termsOverrides).length > 0;
  store.setTermsLanguage(lang);
  if (!hadOverrides) return;
  usePreferencesStore.setState({ termsOverrides: {} });
  await flushPreferences();
  await createPreferencesRepository(getAppStorage()).set({ termsOverrides: {} });
}

/** Le os docs do storage, com padrao para os ausentes. */
export async function readLocalDocs(storage: DocumentStorage): Promise<DocMap> {
  const keys: DocKey[] = ["captured", "team", "history", "trainerProgress", "preferences", "meta"];
  const out = {} as Record<DocKey, unknown>;
  for (const key of keys) out[key] = await storage.readOrDefault(key);
  return out as unknown as DocMap;
}

/** Quantidade de registros por doc (para o modal de apagar e as previas). */
export function countRecords(docs: Partial<DocMap>, key: DocKey): number {
  switch (key) {
    case "captured":
      return Object.keys(docs.captured?.entries ?? {}).length;
    case "team":
      return (docs.team?.slots ?? []).filter((s) => s !== null).length;
    case "history":
      return docs.history?.entries.length ?? 0;
    case "trainerProgress":
      return Object.values(docs.trainerProgress?.series ?? {}).reduce((n, s) => n + Object.keys(s.defeated).length, 0);
    case "preferences":
      return docs.preferences ? 1 : 0;
    default:
      return 0;
  }
}
