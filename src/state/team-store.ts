// Store do time de 6 (F2.2; CONGELADA depois de F2, consumida pela ficha/capturados do grupo A). Doc `team` de B7.1,
// regras de src/domain/team.ts (B6.6). Base comum (storage, fila, hidratacao, reidratacao) em captured-store.ts.
import { useEffect } from "react";
import { create } from "zustand";
import { addToTeam as addToTeamRule, normalizeTeam, removeFromTeam as removeFromTeamRule, type AddToTeamResult, type TeamSlots } from "../domain/team";
import type { DocMap } from "../storage";
import {
  assertDex,
  createHydrator,
  createWriteChain,
  knownDexSet,
  onDataChanged,
  reportPersistError,
  userStoreStorage,
  type PersistErrorCode,
} from "./captured-store";
import { useDatasetStore } from "./dataset-store";
import { useShellStore } from "./shell-store";

export interface TeamState {
  /** sempre 6 posicoes; null = vazio; dex orfao (RF-123) fica guardado e a UI o mostra como vazio */
  slots: TeamSlots;
  hydrated: boolean;
  persistError: PersistErrorCode | null;
  hydrate(): Promise<void>;
  reload(): Promise<void>;
  /**
   * Adiciona no 1o slot livre. Ja no time -> ok sem mudanca. Cheio (orfaos contam como ocupados) ->
   * `{ok:false, reason:"full"}` + toast `home.teamFull` (ou `home.teamFullOrphans` se ha orfaos). Nunca lanca por "cheio".
   */
  addToTeam(dex: number): Promise<AddToTeamResult>;
  /** Esvazia o slot do dex (mantem a posicao dos outros). Devolve os slots ANTERIORES (para "desfazer"). */
  removeFromTeam(dex: number): Promise<TeamSlots>;
  /** Substitui os 6 slots (desfazer remocao). */
  setSlots(slots: readonly (number | null)[]): Promise<void>;
}

const enqueueTeam = createWriteChain();

const teamHydrator = createHydrator(async () => {
  const doc = await userStoreStorage().readOrDefault("team");
  useTeamStore.setState({ slots: normalizeTeam(doc.slots), hydrated: true });
});

function persistTeam(): Promise<void> {
  return enqueueTeam(async () => {
    const doc: DocMap["team"] = { schemaVersion: 1, slots: useTeamStore.getState().slots };
    try {
      await userStoreStorage().write("team", doc);
      useTeamStore.setState({ persistError: null });
    } catch (err) {
      useTeamStore.setState({ persistError: reportPersistError("team", err) });
    }
  });
}

export const useTeamStore = create<TeamState>()((set, get) => ({
  slots: normalizeTeam([]),
  hydrated: false,
  persistError: null,
  hydrate: () => teamHydrator.ensure(),
  reload: () => teamHydrator.reload(),
  async addToTeam(dex) {
    assertDex(dex);
    await teamHydrator.ensure();
    const result = addToTeamRule(get().slots, dex);
    if (!result.ok) {
      const known = knownDexSet(useDatasetStore.getState().speciesIndex);
      const hasOrphans = known ? result.slots.some((s) => s !== null && !known.has(s)) : false;
      useShellStore.getState().pushToast(hasOrphans ? "home.teamFullOrphans" : "home.teamFull");
      return result;
    }
    if (result.slots.some((s, i) => s !== get().slots[i])) {
      set({ slots: result.slots });
      await persistTeam();
    }
    return result;
  },
  async removeFromTeam(dex) {
    assertDex(dex);
    await teamHydrator.ensure();
    const previous = get().slots;
    const next = removeFromTeamRule(previous, dex);
    if (next.some((s, i) => s !== previous[i])) {
      set({ slots: next });
      await persistTeam();
    }
    return previous;
  },
  async setSlots(slots) {
    await teamHydrator.ensure();
    set({ slots: normalizeTeam(slots) });
    await persistTeam();
  },
}));

onDataChanged("team", () => teamHydrator.reload());

/** Hidrata ao montar; devolve `hydrated`. */
export function useTeamHydrated(): boolean {
  const hydrated = useTeamStore((s) => s.hydrated);
  useEffect(() => {
    useTeamStore
      .getState()
      .hydrate()
      .catch((err) => console.warn("[team-store] hydrate failed", err));
  }, []);
  return hydrated;
}

/** true se o dex esta no time. */
export function useIsInTeam(dex: number): boolean {
  return useTeamStore((s) => s.slots.includes(dex));
}

/** So para testes. */
export function resetTeamStore(): void {
  teamHydrator.reset();
  useTeamStore.setState({ slots: normalizeTeam([]), hydrated: false, persistError: null });
}
