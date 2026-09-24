// @vitest-environment jsdom
// F2.2: stores de capturados/time/historico sobre o IndexedDB real do app (fake-indexeddb), incluindo "reload"
// (nova instancia do adapter no mesmo banco) e a reidratacao pelo evento global "pontindex:data-changed".
import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { IndexedDbAdapter, type DocumentStorage } from "../../../src/storage";
import {
  DATA_CHANGED_EVENT,
  capturedKnownList,
  resetCapturedStore,
  setUserStoreStorage,
  useCapturedStore,
} from "../../../src/state/captured-store";
import { resetHistoryStore, sanitizeHistory, useHistoryStore } from "../../../src/state/history-store";
import { resetTeamStore, useTeamStore } from "../../../src/state/team-store";
import { useShellStore } from "../../../src/state/shell-store";
import { resetDatasetStore, useDatasetStore } from "../../../src/state/dataset-store";
import type { SpeciesSummary } from "../../../src/data/types";

let dbCounter = 0;
let dbName = "";
const opened: DocumentStorage[] = [];

async function openAdapter(): Promise<DocumentStorage> {
  const adapter = new IndexedDbAdapter({ dbName });
  await adapter.init();
  opened.push(adapter);
  return adapter;
}

function resetStores() {
  resetCapturedStore();
  resetTeamStore();
  resetHistoryStore();
}

/** Simula fechar e reabrir o app: stores zeradas + adapter novo no mesmo banco. */
async function reopen(): Promise<DocumentStorage> {
  resetStores();
  const adapter = await openAdapter();
  setUserStoreStorage(adapter);
  return adapter;
}

function fakeIndex(dexes: number[]): SpeciesSummary[] {
  return dexes.map((dex) => ({ dex }) as SpeciesSummary);
}

beforeEach(async () => {
  dbName = `home-stores-${++dbCounter}`;
  resetStores();
  resetDatasetStore();
  useShellStore.setState({ toasts: [] });
  setUserStoreStorage(await openAdapter());
});

afterEach(() => {
  for (const a of opened.splice(0)) a.close();
  setUserStoreStorage(null);
});

describe("team-store", () => {
  it("7th Pokemon -> full warning toast and nothing is added; reload keeps the team", async () => {
    const team = useTeamStore.getState();
    for (const dex of [6, 448, 25, 150, 133, 94]) expect((await team.addToTeam(dex)).ok).toBe(true);
    const r = await useTeamStore.getState().addToTeam(149);
    expect(r).toMatchObject({ ok: false, reason: "full" });
    expect(useTeamStore.getState().slots).toEqual([6, 448, 25, 150, 133, 94]);
    expect(useShellStore.getState().toasts.map((t) => t.messageKey)).toEqual(["home.teamFull"]);
    // ja no time -> ok sem mudanca e sem toast
    expect((await useTeamStore.getState().addToTeam(25)).ok).toBe(true);
    expect(useShellStore.getState().toasts).toHaveLength(1);

    await reopen();
    await useTeamStore.getState().hydrate();
    expect(useTeamStore.getState().slots).toEqual([6, 448, 25, 150, 133, 94]);
  });

  it("remove keeps positions, setSlots undoes, orphans count as occupied with their own toast", async () => {
    for (const dex of [6, 25, 94]) await useTeamStore.getState().addToTeam(dex);
    const previous = await useTeamStore.getState().removeFromTeam(25);
    expect(previous).toEqual([6, 25, 94, null, null, null]);
    expect(useTeamStore.getState().slots).toEqual([6, null, 94, null, null, null]);
    await useTeamStore.getState().setSlots(previous);
    await reopen();
    await useTeamStore.getState().hydrate();
    expect(useTeamStore.getState().slots).toEqual([6, 25, 94, null, null, null]);

    // 3 orfaos (ids fora do dataset atual) + 3 conhecidos = cheio
    for (const dex of [7777, 8888, 9999]) await useTeamStore.getState().addToTeam(dex);
    useDatasetStore.setState({ speciesIndex: fakeIndex([6, 25, 94, 1]) });
    const r = await useTeamStore.getState().addToTeam(1);
    expect(r.ok).toBe(false);
    expect(useShellStore.getState().toasts.at(-1)?.messageKey).toBe("home.teamFullOrphans");
    expect(useTeamStore.getState().slots).toEqual([6, 25, 94, 7777, 8888, 9999]);
  });
});

describe("history-store", () => {
  it("21st entry drops the oldest; revisit moves to top; reload keeps history", async () => {
    for (let dex = 1; dex <= 21; dex++) await useHistoryStore.getState().push(dex, 1000 + dex);
    const entries = useHistoryStore.getState().entries;
    expect(entries).toHaveLength(20);
    expect(entries[0]).toEqual({ dex: 21, viewedAt: 1021 });
    expect(entries.some((e) => e.dex === 1)).toBe(false);
    await useHistoryStore.getState().push(5, 5000);
    expect(useHistoryStore.getState().entries[0]).toEqual({ dex: 5, viewedAt: 5000 });
    expect(useHistoryStore.getState().entries.filter((e) => e.dex === 5)).toHaveLength(1);

    await reopen();
    await useHistoryStore.getState().hydrate();
    expect(useHistoryStore.getState().entries.map((e) => e.dex)).toEqual([5, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 4, 3, 2]);
  });

  it("corrupted history with repeated dex is deduplicated on read", () => {
    expect(
      sanitizeHistory([
        { dex: 6, viewedAt: 10 },
        { dex: 25, viewedAt: 30 },
        { dex: 6, viewedAt: 50 },
      ]),
    ).toEqual([
      { dex: 6, viewedAt: 50 },
      { dex: 25, viewedAt: 30 },
    ]);
  });
});

describe("captured-store", () => {
  it("mark keeps the first date, unmark removes, orphans stay stored but hidden, reload keeps it", async () => {
    await useCapturedStore.getState().mark(6, 100);
    await useCapturedStore.getState().mark(6, 999);
    await useCapturedStore.getState().mark(7777, 200);
    expect(useCapturedStore.getState().entries).toEqual({ "6": { capturedAt: 100 }, "7777": { capturedAt: 200 } });
    expect(capturedKnownList(useCapturedStore.getState().entries, new Set([6]))).toEqual([{ dex: 6, capturedAt: 100 }]);
    await useCapturedStore.getState().mark(25, 300);
    await useCapturedStore.getState().unmark(25);
    await reopen();
    await useCapturedStore.getState().hydrate();
    expect(useCapturedStore.getState().entries).toEqual({ "6": { capturedAt: 100 }, "7777": { capturedAt: 200 } });
  });
});

describe("data-changed event (backup/sync/delete from agent C)", () => {
  it("reloads only the stores whose key is in detail.keys, all when keys is absent", async () => {
    await useTeamStore.getState().addToTeam(6);
    await useHistoryStore.getState().push(6, 10);
    await useCapturedStore.getState().mark(6, 10);
    // outro modulo escreve direto no storage (como applyBackup/deleteData)
    const other = await openAdapter();
    await other.writeMany({
      team: { schemaVersion: 1, slots: [25, null, null, null, null, null] },
      history: { schemaVersion: 1, entries: [{ dex: 25, viewedAt: 99 }] },
      captured: { schemaVersion: 1, entries: { "25": { capturedAt: 99 } } },
    });

    window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { detail: { keys: ["team"] } }));
    await expect.poll(() => useTeamStore.getState().slots[0]).toBe(25);
    expect(useHistoryStore.getState().entries[0]?.dex).toBe(6);
    expect(Object.keys(useCapturedStore.getState().entries)).toEqual(["6"]);

    window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { detail: {} }));
    await expect.poll(() => useHistoryStore.getState().entries[0]?.dex).toBe(25);
    await expect.poll(() => Object.keys(useCapturedStore.getState().entries)).toEqual(["25"]);
  });
});
