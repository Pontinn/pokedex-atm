// Store do dataset carregado no boot (F1.4): manifesto + indice de especies + tabela de tipos (SPEC 2.4).
// O resto do dataset e carregado sob demanda pelas telas (src/data/loaders.ts). `ready` = boot terminou
// (com sucesso ou com erro); a tampa do boot so abre depois disso.
import { create } from "zustand";
import { DatasetError, loadManifest, loadSpeciesIndex, loadTypeChart } from "../data/loaders";
import type { DatasetManifest, SpeciesIndexFile, TypeChartFile } from "../data/types";

export type DatasetStatus = "loading" | "ready" | "error";

export interface DatasetState {
  status: DatasetStatus;
  ready: boolean;
  manifest: DatasetManifest | null;
  speciesIndex: SpeciesIndexFile | null;
  typeChart: TypeChartFile | null;
  /** codigo do erro de carga (NOT_FOUND = dataset nao publicado) */
  errorCode: DatasetError["code"] | "UNKNOWN" | null;
  load(): Promise<void>;
}

let inFlight: Promise<void> | null = null;

export const useDatasetStore = create<DatasetState>()((set) => ({
  status: "loading",
  ready: false,
  manifest: null,
  speciesIndex: null,
  typeChart: null,
  errorCode: null,
  load() {
    if (inFlight) return inFlight;
    set({ status: "loading", errorCode: null });
    inFlight = (async () => {
      try {
        const manifest = await loadManifest();
        const [speciesIndex, typeChart] = await Promise.all([loadSpeciesIndex(), loadTypeChart()]);
        set({ status: "ready", ready: true, manifest, speciesIndex, typeChart, errorCode: null });
      } catch (err) {
        console.warn("[dataset] boot load failed", err);
        set({ status: "error", ready: true, errorCode: err instanceof DatasetError ? err.code : "UNKNOWN" });
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  },
}));

/** So para testes. */
export function resetDatasetStore(): void {
  inFlight = null;
  useDatasetStore.setState({ status: "loading", ready: false, manifest: null, speciesIndex: null, typeChart: null, errorCode: null });
}
