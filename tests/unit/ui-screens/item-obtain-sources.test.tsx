// U5b/U7e (pwa-auto-update): fontes "Drop de treinador" (trainerDrop) e "Nao obtivel" (unobtainable) no Como obter
// do item, com schema zod, rotulo de chance e link para o treinador na tela Treinadores.
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BallsFile, ItemInfo, ItemsFile, SeriesFile } from "../../../src/data/types";

function item(id: string, patch: Partial<ItemInfo>): ItemInfo {
  const path = id.slice(id.indexOf(":") + 1);
  return {
    id,
    namespace: id.slice(0, id.indexOf(":")),
    path,
    name: { pt: path, en: path },
    description: null,
    category: "other",
    texture: null,
    tags: [],
    obtain: [],
    usedIn: { evolutions: [], fossils: [], forms: [], ball: false },
    cooking: null,
    bait: null,
    ...patch,
  };
}

const items: ItemsFile = {
  "allthemons:the_kitty_badge": item("allthemons:the_kitty_badge", {
    obtain: [
      {
        kind: "trainerDrop",
        trainers: [
          { id: "team_allthemods_satherov", name: "Satherov", series: "atm_team", chance: 1, levelRange: { min: 90, max: 100 }, firstDefeatOnly: false },
          { id: "boss_giovanni_0045", name: "Boss Giovanni", series: "radicalred", chance: 0.125, levelRange: null, firstDefeatOnly: true },
          { id: "ghost_trainer", name: null, series: null, chance: null, levelRange: null, firstDefeatOnly: false },
        ],
      },
    ],
  }),
  "cobblemon:npc_editor": item("cobblemon:npc_editor", { obtain: [{ kind: "unobtainable", reason: "creativeOnly" }] }),
  "cobblemon:bugwort": item("cobblemon:bugwort", { obtain: [{ kind: "unobtainable", reason: "notRegistered" }] }),
  "mega_showdown:plate": item("mega_showdown:plate", { obtain: [{ kind: "unobtainable" }] }),
  "cobblemon:old_none": item("cobblemon:old_none", { obtain: [{ kind: "none" }] }),
};

const series: SeriesFile = [
  { id: "atm_team", title: { pt: "Time ATM", en: "ATM Team" }, description: { pt: "", en: "" }, difficulty: 5, requiredSeries: [], special: null, keyTrainerIds: [], trainersFile: "trainers/atm_team.json" },
];
const balls: BallsFile = [];

vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  return { ...real, loadItems: async () => items, loadBalls: async () => balls, loadBiomes: async () => ({}), loadSeries: async () => series };
});

const { ItemScreen } = await import("../../../src/screens/Item/ItemScreen");
const { chanceLabel, seriesTitle, unobtainableKey } = await import("../../../src/screens/Item/item-page-model");
const { itemsFileSchema } = await import("../../../src/data/schemas");
const { translate } = await import("../../../src/i18n/useT");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore, usePreferencesStore } = await import("../../../src/state/preferences-store");

const pt = (key: string, vars?: Record<string, string | number>) => translate("pt", key, vars);

beforeEach(() => {
  resetDatasetStore();
  resetNavigationStore();
  resetPreferencesStore();
  useDatasetStore.setState({ status: "ready", ready: true, speciesIndex: [] });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderItem(itemId: string) {
  useNavigationStore.getState().navigate("item", { itemId });
  return render(<ItemScreen entryId={1} params={{ itemId }} />);
}

async function obtainRow(kind: string): Promise<HTMLElement> {
  return waitFor(() => {
    const el = document.querySelector<HTMLElement>(`.item-obtain [data-row='${kind}']`);
    if (!el) throw new Error("carregando");
    return el;
  });
}

describe("modelo", () => {
  it("chanceLabel: 1 -> 100%, fracao com 1 casa, null sem rotulo", () => {
    expect(chanceLabel(1)).toBe("100%");
    expect(chanceLabel(0.125)).toBe("12.5%");
    expect(chanceLabel(0.3333)).toBe("33.3%");
    expect(chanceLabel(null)).toBeNull();
  });
  it("seriesTitle usa o titulo do series.json e cai no id humanizado", () => {
    expect(seriesTitle("atm_team", series, "en")).toBe("ATM Team");
    expect(seriesTitle("atm_team", series, "pt")).toBe("Time ATM");
    expect(seriesTitle("radicalred", null, "pt")).toBeTruthy();
  });
  it("unobtainableKey por motivo", () => {
    expect(unobtainableKey("creativeOnly")).toBe("ip.unobtainable.creativeOnly");
    expect(unobtainableKey("notRegistered")).toBe("ip.unobtainable.notRegistered");
    expect(unobtainableKey(undefined)).toBe("ip.unobtainable");
  });
});

describe("schema do items.json", () => {
  it("aceita trainerDrop e unobtainable (com e sem motivo) junto com none", () => {
    expect(itemsFileSchema.safeParse(items).success).toBe(true);
  });
  it("rejeita motivo desconhecido e treinador sem firstDefeatOnly", () => {
    const badReason = { x: item("a:x", { obtain: [{ kind: "unobtainable", reason: "lost" } as never] }) };
    expect(itemsFileSchema.safeParse(badReason).success).toBe(false);
    const badTrainer = { x: item("a:x", { obtain: [{ kind: "trainerDrop", trainers: [{ id: "t", name: "T", series: "s", chance: 1, levelRange: null }] } as never] }) };
    expect(itemsFileSchema.safeParse(badTrainer).success).toBe(false);
  });
});

describe("Como obter", () => {
  it("Drop de treinador: um chip por treinador com chance, serie e so na 1a vitoria; sem levelRange", async () => {
    renderItem("allthemons:the_kitty_badge");
    const row = await obtainRow("trainerDrop");
    expect(row.querySelector(".ob-title")!.textContent).toBe(pt("ip.trainerDrop"));
    const entries = [...row.querySelectorAll<HTMLElement>(".ob-trainer")];
    expect(entries.map((e) => e.dataset.trainer)).toEqual(["team_allthemods_satherov", "boss_giovanni_0045", "ghost_trainer"]);

    const [sath, gio, ghost] = entries as [HTMLElement, HTMLElement, HTMLElement];
    expect(sath.querySelector("button")!.textContent).toBe("Satherov100%");
    expect(sath.textContent).toContain("Time ATM");
    expect(sath.textContent).not.toContain(pt("ip.firstWinOnly"));
    expect(gio.querySelector("button")!.textContent).toBe("Boss Giovanni12.5%");
    expect(gio.textContent).toContain(pt("ip.firstWinOnly"));
    // sem serie: sem link, nome cai no id, sem chance
    expect(ghost.querySelector("button")).toBeNull();
    expect(ghost.textContent).toBe("ghost_trainer");
    // levelRange nao e exibido (semantica nao confirmada)
    expect(row.textContent).not.toMatch(/90/);

    fireEvent.click(sath.querySelector("button")!);
    const cur = useNavigationStore.getState().current;
    expect(cur.screen).toBe("trainers");
    expect(cur.ui).toMatchObject({ seriesId: "atm_team", openTrainerId: "team_allthemods_satherov" });
  });

  it("textos em EN", async () => {
    usePreferencesStore.setState({ uiLanguage: "en" });
    renderItem("allthemons:the_kitty_badge");
    const row = await obtainRow("trainerDrop");
    expect(row.textContent).toContain("Trainer drop");
    expect(row.textContent).toContain("first win only");
    expect(row.textContent).toContain("ATM Team");
  });

  it("Nao obtivel: so no modo criativo, nao registrado e sem motivo; nunca o Sem rota", async () => {
    const cases: [string, string][] = [
      ["cobblemon:npc_editor", "Não obtível no All the Mons (só no modo criativo)"],
      ["cobblemon:bugwort", pt("ip.unobtainable.notRegistered")],
      ["mega_showdown:plate", "Não obtível no All the Mons"],
    ];
    for (const [id, title] of cases) {
      const view = renderItem(id);
      const row = await obtainRow("unobtainable");
      expect(row.classList.contains("ob-none")).toBe(true);
      expect(row.querySelector(".ob-title")!.textContent).toBe(title);
      expect(row.textContent).toContain(pt("ip.unobtainableHint"));
      expect(document.querySelector(".item-obtain [data-row='none']")).toBeNull();
      view.unmount();
      resetNavigationStore();
    }
    expect(translate("en", "ip.unobtainable.creativeOnly")).toBe("Not obtainable in All the Mons (creative mode only)");
  });

  it("none continua renderizando o Sem rota (compatibilidade)", async () => {
    renderItem("cobblemon:old_none");
    const row = await obtainRow("none");
    expect(row.textContent).toContain(pt("obtain.none"));
  });
});
