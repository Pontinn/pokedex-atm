// @vitest-environment jsdom
// F8.1: store de progresso de treinadores sobre o IndexedDB do app (fake-indexeddb): serie ativa persiste no
// "reload", Modo Livre pausa e retoma, derrotados por serie, e reidratacao pelo evento "pontindex:data-changed".
import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { IndexedDbAdapter, type DocumentStorage } from "../../../src/storage";
import { DATA_CHANGED_EVENT, setUserStoreStorage } from "../../../src/state/captured-store";
import { resetTrainersStore, useTrainersStore } from "../../../src/state/trainers-store";

let dbCounter = 0;
let dbName = "";
const opened: DocumentStorage[] = [];

async function openAdapter(): Promise<DocumentStorage> {
  const adapter = new IndexedDbAdapter({ dbName });
  await adapter.init();
  opened.push(adapter);
  return adapter;
}

async function reopen(): Promise<DocumentStorage> {
  resetTrainersStore();
  const adapter = await openAdapter();
  setUserStoreStorage(adapter);
  await useTrainersStore.getState().hydrate();
  return adapter;
}

beforeEach(async () => {
  dbName = `trainers-store-${++dbCounter}`;
  resetTrainersStore();
  setUserStoreStorage(await openAdapter());
});

afterEach(() => {
  for (const a of opened.splice(0)) a.close();
  setUserStoreStorage(null);
});

describe("trainers-store", () => {
  it("starts with no active series and persists the choice across a reload", async () => {
    await useTrainersStore.getState().hydrate();
    expect(useTrainersStore.getState().progress.activeSeriesId).toBeNull();
    await useTrainersStore.getState().setActiveSeries("bdsp");
    await reopen();
    expect(useTrainersStore.getState().progress.activeSeriesId).toBe("bdsp");
  });

  it("freeroam pauses the active series and leaving restores it", async () => {
    const s = useTrainersStore.getState();
    await s.setActiveSeries("bdsp");
    await s.enterFreeroam();
    expect(useTrainersStore.getState().progress.freeroam).toEqual({ active: true, pausedSeriesId: "bdsp" });
    await reopen();
    expect(useTrainersStore.getState().progress.freeroam.active).toBe(true);
    await useTrainersStore.getState().leaveFreeroam();
    expect(useTrainersStore.getState().progress.activeSeriesId).toBe("bdsp");
    expect(useTrainersStore.getState().progress.freeroam).toEqual({ active: false, pausedSeriesId: null });
    // escolher outra serie durante o Modo Livre sai dele
    await useTrainersStore.getState().enterFreeroam();
    await useTrainersStore.getState().setActiveSeries("radicalred");
    expect(useTrainersStore.getState().progress).toMatchObject({ activeSeriesId: "radicalred", freeroam: { active: false } });
  });

  it("mark/unmark defeated per series; re-marking keeps the date; reload keeps it", async () => {
    const s = useTrainersStore.getState();
    await s.markDefeated("bdsp", "gym_leader_roark_0395", 100);
    await s.markDefeated("bdsp", "gym_leader_roark_0395", 200);
    await s.markDefeated("bdsp", "commander_mars_03c2", 300);
    expect(useTrainersStore.getState().progress.series.bdsp!.defeated).toEqual({
      gym_leader_roark_0395: { at: 100 },
      commander_mars_03c2: { at: 300 },
    });
    await useTrainersStore.getState().unmarkDefeated("bdsp", "commander_mars_03c2");
    await useTrainersStore.getState().unmarkDefeated("nope", "x");
    await reopen();
    expect(useTrainersStore.getState().progress.series.bdsp!.defeated).toEqual({ gym_leader_roark_0395: { at: 100 } });
  });

  it("reloads from storage on pontindex:data-changed with its key or without keys, ignores other keys", async () => {
    await useTrainersStore.getState().hydrate();
    const other = await openAdapter();
    const doc = await other.readOrDefault("trainerProgress");
    await other.write("trainerProgress", { ...doc, activeSeriesId: "unbound" });

    window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { detail: { keys: ["team"] } }));
    await new Promise((r) => setTimeout(r, 30));
    expect(useTrainersStore.getState().progress.activeSeriesId).toBeNull();

    window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { detail: { keys: ["trainerProgress"] } }));
    await expect.poll(() => useTrainersStore.getState().progress.activeSeriesId).toBe("unbound");

    await other.write("trainerProgress", { ...doc, activeSeriesId: "bdsp" });
    window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { detail: {} }));
    await expect.poll(() => useTrainersStore.getState().progress.activeSeriesId).toBe("bdsp");
  });
});
