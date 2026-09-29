// Cobertura das telas (2026-09-27): TrainersScreen montada inteira (picker de series, Modo Livre, cap,
// linha do tempo, busca, acordeao com o time e chips de item segurado 0-2) com loaders mockados e store de
// progresso em memoria. Fixtures pequenas tipadas com src/data/types.ts.
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DatasetManifest, ItemsFile, SeriesFile, SpeciesSummary, TrainerInfo, TrainersFile } from "../../../src/data/types";
import manifestJson from "../../fixtures/ui-shell/manifest.json";

const series: SeriesFile = [
  {
    id: "s1",
    title: { pt: "Serie Um", en: "Series One" },
    description: { pt: "", en: "" },
    difficulty: 1,
    requiredSeries: [],
    special: null,
    keyTrainerIds: ["t_a", "t_b"],
    trainersFile: "trainers/s1.json",
  },
  {
    id: "s2",
    title: { pt: "Serie Dois", en: "Series Two" },
    description: { pt: "", en: "" },
    difficulty: 2,
    requiredSeries: [["s1"]],
    special: null,
    keyTrainerIds: ["t_x"],
    trainersFile: "trainers/s2.json",
  },
  {
    id: "freeroam",
    title: { pt: "Modo Livre", en: "Free Roam" },
    description: { pt: "", en: "" },
    difficulty: null,
    requiredSeries: [],
    special: "freeroam",
    keyTrainerIds: [],
    trainersFile: "",
  },
];

function trainer(id: string, name: string, patch: Partial<TrainerInfo> = {}): TrainerInfo {
  return {
    id,
    name,
    type: "leader",
    typeLabel: { pt: "Lider", en: "Leader" },
    optional: false,
    requiredDefeats: [],
    signatureItem: null,
    biomes: { whitelist: [], blacklist: [] },
    source: "rctmod",
    team: [],
    maxTeamLevel: 14,
    bag: [],
    ...patch,
  };
}

const trainersFile: TrainersFile = {
  seriesId: "s1",
  trainers: [
    trainer("t_a", "Roark", {
      signatureItem: "cobblemon:hard_stone",
      biomes: { whitelist: ["#minecraft:is_mountain"], blacklist: [] },
      bag: [{ item: "cobblemon:potion", quantity: 3 }],
      team: [
        { species: "geodude", dex: 74, level: 12, gender: null, nature: null, ability: "sturdy", moveset: ["tackle", "rock_throw"], heldItems: ["cobblemon:hard_stone", "cobblemon:oran_berry"] },
        { species: "onix", dex: 95, level: 14, gender: null, nature: null, ability: null, moveset: [], heldItems: [] },
        { species: "mystery_mon", dex: null, level: 10, gender: null, nature: null, ability: null, moveset: [], heldItems: ["cobblemon:leftovers"] },
      ],
    }),
    trainer("t_b", "Mars", { requiredDefeats: [["t_a"]], maxTeamLevel: 20, typeLabel: { pt: "Comandante", en: "Commander" } }),
  ],
};

const items: ItemsFile = {
  "cobblemon:hard_stone": {
    id: "cobblemon:hard_stone",
    namespace: "cobblemon",
    path: "hard_stone",
    name: { pt: "Pedra Dura", en: "Hard Stone" },
    description: null,
    category: "held",
    texture: null,
    tags: [],
    obtain: [],
    usedIn: { evolutions: [], fossils: [], forms: [], ball: false },
    cooking: null,
    bait: null,
  },
};

const loaderState = { seriesFail: false, trainersFail: false };

vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  return {
    ...real,
    loadSeries: async () => {
      if (loaderState.seriesFail) throw new Error("network");
      return series;
    },
    loadTrainers: async () => {
      if (loaderState.trainersFail) throw new Error("network");
      return trainersFile;
    },
    loadItems: async () => items,
    loadBiomes: async () => ({ "#minecraft:is_mountain": { pt: "Montanha", en: "Mountain" } }),
    loadMoves: async () => ({ tackle: { id: "tackle", name: { pt: "Investida", en: "Tackle" } } }),
    loadAbilities: async () => ({ sturdy: { id: "sturdy", name: { pt: "Robustez", en: "Sturdy" }, description: { pt: "", en: "" } } }),
  };
});

const { TrainersScreen } = await import("../../../src/screens/Trainers/TrainersScreen");
const { configureAudio } = await import("../../../src/audio/sfx");
const { translate } = await import("../../../src/i18n/useT");
const { MemoryAdapter } = await import("../../../src/storage");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore } = await import("../../../src/state/preferences-store");
const { setUserStoreStorage } = await import("../../../src/state/captured-store");
const { resetTrainersStore, useTrainersStore } = await import("../../../src/state/trainers-store");
const { useShellStore } = await import("../../../src/state/shell-store");
const { LIST_SEARCH_DEBOUNCE_MS } = await import("../../../src/screens/Trainers/ListSearch");

const tr = (key: string) => translate("pt", key);
let played: string[] = [];

function species(dex: number, pt: string, en: string): SpeciesSummary {
  return { dex, slug: en.toLowerCase(), name: { pt, en }, searchKey: "", types: ["rock", "ground"], generation: "gen1", labels: [], bst: 300, rarity: { primary: null, secondary: [] }, evolutionMethods: ["none"], hasSprite: true, artworkId: dex };
}

function renderScreen() {
  useNavigationStore.getState().navigate("trainers", {});
  return render(<TrainersScreen entryId={1} params={{}} />);
}

function seriesChip(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-series='${id}']`);
  if (!el) throw new Error(`serie ${id} ausente`);
  return el;
}

beforeEach(async () => {
  played = [];
  loaderState.seriesFail = false;
  loaderState.trainersFail = false;
  configureAudio((src) => {
    const el = new EventTarget() as unknown as HTMLAudioElement;
    Object.assign(el, { paused: true, currentTime: 0, play: () => (played.push(src), Promise.resolve()), pause() {} });
    return el;
  });
  const storage = new MemoryAdapter();
  await storage.init();
  setUserStoreStorage(storage);
  resetTrainersStore();
  resetDatasetStore();
  resetNavigationStore();
  resetPreferencesStore();
  useShellStore.setState({ toasts: [] });
  useDatasetStore.setState({
    status: "ready",
    ready: true,
    manifest: manifestJson as unknown as DatasetManifest,
    speciesIndex: [species(74, "Geodude", "Geodude"), species(95, "Onix", "Onix")],
  });
});

afterEach(() => {
  cleanup();
  configureAudio(null);
  vi.restoreAllMocks();
});

describe("TrainersScreen", () => {
  it("falha ao carregar series mostra erro inline com retry", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    loaderState.seriesFail = true;
    renderScreen();
    expect(await screen.findByRole("alert")).toBeTruthy();
    loaderState.seriesFail = false;
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /tentar/i }));
    });
    await waitFor(() => expect(document.getElementById("tr-series")).not.toBeNull());
  });

  it("sem serie ativa pede para escolher; serie bloqueada e Modo Livre bloqueado nao respondem ao clique", async () => {
    renderScreen();
    expect(await screen.findByText(tr("tr.chooseSeries"))).toBeTruthy();
    const s2 = seriesChip("s2");
    expect(s2.getAttribute("aria-disabled")).toBe("true");
    expect(s2.textContent).toContain(tr("tr.requiresSeries"));
    fireEvent.click(s2);
    const free = seriesChip("freeroam");
    expect(free.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(free);
    expect(useTrainersStore.getState().progress.activeSeriesId).toBeNull();
    expect(useTrainersStore.getState().progress.freeroam.active).toBe(false);
  });

  it("escolher a serie persiste activeSeriesId e mostra cap, contador, proximo e a linha do tempo", async () => {
    renderScreen();
    fireEvent.click(await waitFor(() => seriesChip("s1")));
    await waitFor(() => expect(useTrainersStore.getState().progress.activeSeriesId).toBe("s1"));
    expect(await screen.findByTestId("tr-cap")).toBeTruthy();
    expect(screen.getByTestId("tr-cap").textContent).toBe("15");
    expect(screen.getByTestId("tr-count").textContent).toContain("0");
    expect(screen.getByTestId("tr-next").textContent).toContain("Roark");
    const steps = [...document.querySelectorAll<HTMLElement>(".tr-step")];
    expect(steps.map((s) => s.dataset.trainer)).toEqual(["t_a", "t_b"]);
    expect(steps[0]!.dataset.state).toBe("next");
    expect(steps[1]!.className).toContain("blocked");
    expect(steps[1]!.textContent).toContain(tr("tr.requires"));
    // bioma traduzido pelo biomes.json mockado
    await waitFor(() => expect(steps[0]!.textContent).toContain("Montanha"));
  });

  it("marcar Derrotado grava no store, sobe o cap, toca levelup e desbloqueia o proximo", async () => {
    await useTrainersStore.getState().setActiveSeries("s1");
    renderScreen();
    const box = await waitFor(() => {
      const el = document.querySelector<HTMLInputElement>("[data-trd='t_a']");
      if (!el) throw new Error("checkbox ausente");
      return el;
    });
    fireEvent.click(box);
    await waitFor(() => expect(document.querySelector("[data-trainer='t_a']")!.getAttribute("data-state")).toBe("done"));
    expect(Number(screen.getByTestId("tr-cap").textContent)).toBeGreaterThan(15);
    await waitFor(() => expect(played.some((s) => s.includes("levelup"))).toBe(true));
    expect(document.querySelector("[data-trainer='t_b']")!.className).not.toContain("blocked");
    fireEvent.click(document.querySelector<HTMLInputElement>("[data-trd='t_a']")!);
    await waitFor(() => expect(document.querySelector("[data-trainer='t_a']")!.getAttribute("data-state")).not.toBe("done"));
  });

  it("acordeao abre o time (current.ui.openTrainerId) com golpes, habilidade, 0-2 chips de item segurado, item de spawn e mochila", async () => {
    await useTrainersStore.getState().setActiveSeries("s1");
    renderScreen();
    const toggle = await waitFor(() => {
      const el = document.querySelector<HTMLElement>("[data-trainer='t_a'] .tr-toggle");
      if (!el) throw new Error("toggle ausente");
      return el;
    });
    fireEvent.click(toggle);
    expect((useNavigationStore.getState().current.ui as { openTrainerId: string | null }).openTrainerId).toBe("t_a");
    const geodude = await waitFor(() => {
      const el = document.querySelector<HTMLElement>("[data-species='geodude']");
      if (!el) throw new Error("time ainda carregando");
      return el;
    });
    expect(geodude.textContent).toContain("Robustez");
    expect(geodude.textContent).toContain("Investida");
    // golpe ausente do moves.json cai no id humanizado
    expect(geodude.textContent).toContain("Rock throw");
    const held = geodude.querySelectorAll(".tr-held [data-item-open]");
    // U9: so o item do items.json vira link; oran_berry (fora do fixture) e texto simples, sem pagina inexistente
    expect([...held].map((b) => b.getAttribute("data-item-open"))).toEqual(["cobblemon:hard_stone"]);
    expect(held[0]!.tagName).toBe("BUTTON");
    const missing = geodude.querySelector(".tr-held [data-item-missing='cobblemon:oran_berry']");
    expect(missing?.tagName).toBe("SPAN");
    expect(missing?.textContent).toContain("Oran berry");
    expect(held[0]!.textContent).toContain("Pedra Dura");
    expect(document.querySelector("[data-species='onix'] .tr-held")).toBeNull();
    expect(document.querySelectorAll("[data-species='mystery_mon'] .tr-held [data-item-missing]")).toHaveLength(1);
    expect(document.querySelector("[data-species='mystery_mon']")!.textContent).toContain("Mystery mon");
    expect(document.querySelector(".tr-spawn [data-item-open='cobblemon:hard_stone']")).not.toBeNull();
    expect(document.querySelector(".tr-foot [data-item-missing='cobblemon:potion']")!.textContent).toContain("x3");

    fireEvent.click(held[0]!);
    expect(useNavigationStore.getState().current.screen).toBe("item");
    expect(useNavigationStore.getState().current.params).toEqual({ itemId: "cobblemon:hard_stone" });
  });

  it("treinador sem time conhecido mostra tr.teamUnknown; caret fecha o acordeao", async () => {
    await useTrainersStore.getState().setActiveSeries("s1");
    renderScreen();
    const caret = await waitFor(() => {
      const el = document.querySelector<HTMLElement>("[data-trainer='t_b'] .tr-caret");
      if (!el) throw new Error("caret ausente");
      return el;
    });
    fireEvent.click(caret);
    expect(await screen.findByText(tr("tr.teamUnknown"))).toBeTruthy();
    fireEvent.click(caret);
    expect((useNavigationStore.getState().current.ui as { openTrainerId: string | null }).openTrainerId).toBeNull();
  });

  it("busca filtra por nome do Pokemon do time (filters.query) e sem resultado mostra tr.searchNone", async () => {
    await useTrainersStore.getState().setActiveSeries("s1");
    renderScreen();
    const input = await waitFor(() => {
      const el = document.getElementById("tr-q") as HTMLInputElement | null;
      if (!el) throw new Error("busca ausente");
      return el;
    });
    fireEvent.change(input, { target: { value: "onix" } });
    await waitFor(() => expect(document.querySelectorAll(".tr-step")).toHaveLength(1), { timeout: LIST_SEARCH_DEBOUNCE_MS + 1000 });
    expect((useNavigationStore.getState().current.ui as { filters: { query: string } }).filters.query).toBe("onix");
    fireEvent.change(input, { target: { value: "zzz" } });
    expect(await screen.findByText(tr("tr.searchNone"))).toBeTruthy();
  });

  it("falha ao carregar os treinadores da serie mostra erro inline", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    loaderState.trainersFail = true;
    await useTrainersStore.getState().setActiveSeries("s1");
    renderScreen();
    expect(await screen.findByRole("alert")).toBeTruthy();
  });

  it("serie ativa salva que sumiu do dataset volta para nenhuma com toast tr.seriesGone", async () => {
    await useTrainersStore.getState().setActiveSeries("old_series");
    renderScreen();
    await waitFor(() => expect(useTrainersStore.getState().progress.activeSeriesId).toBeNull());
    expect(useShellStore.getState().toasts.map((t) => t.messageKey)).toContain("tr.seriesGone");
  });

  it("Modo Livre desbloqueado (serie concluida) entra e sai, com cap 100", async () => {
    const s = useTrainersStore.getState();
    await s.setActiveSeries("s1");
    await s.markDefeated("s1", "t_a");
    await s.markDefeated("s1", "t_b");
    renderScreen();
    const free = await waitFor(() => seriesChip("freeroam"));
    await waitFor(() => expect(free.getAttribute("aria-disabled")).toBe("false"));
    fireEvent.click(free);
    await waitFor(() => expect(document.querySelector("#tr-header[data-mode='freeroam']")).not.toBeNull());
    expect(screen.getByTestId("tr-cap").textContent).toBe("100");
    fireEvent.click(seriesChip("freeroam"));
    await waitFor(() => expect(useTrainersStore.getState().progress.freeroam.active).toBe(false));
    expect(within(document.getElementById("tr-series")!).getAllByRole("button").length).toBe(3);
  });

  it("link de Drop de treinador (ui.seriesId + openTrainerId) mostra a serie sem mudar a ativa e rola ate o treinador", async () => {
    const scrolled: string[] = [];
    const proto = HTMLElement.prototype as unknown as { scrollIntoView?: (this: HTMLElement) => void };
    const original = proto.scrollIntoView;
    proto.scrollIntoView = function (this: HTMLElement) {
      scrolled.push(this.dataset.trainer ?? "");
    };
    try {
      useNavigationStore.getState().navigate("trainers", {}, { seriesId: "s1", openTrainerId: "t_b" });
      render(<TrainersScreen entryId={1} params={{}} />);
      const notice = await waitFor(() => {
        const el = document.querySelector<HTMLElement>(".tr-viewing");
        if (!el) throw new Error("carregando");
        return el;
      });
      expect(notice.getAttribute("data-viewing")).toBe("s1");
      expect(notice.textContent).toContain("Serie Um");
      const step = await waitFor(() => {
        const el = document.querySelector<HTMLElement>(".tr-list [data-trainer='t_b']");
        if (!el) throw new Error("carregando");
        return el;
      });
      expect(step.classList.contains("open")).toBe(true);
      await waitFor(() => expect(scrolled).toEqual(["t_b"]));
      expect(useTrainersStore.getState().progress.activeSeriesId).toBeNull();

      fireEvent.click(within(notice).getByRole("button", { name: tr("tr.viewingBack") }));
      expect(document.querySelector(".tr-viewing")).toBeNull();
      expect(document.querySelector(".tr-choose")).not.toBeNull();
    } finally {
      proto.scrollIntoView = original;
    }
  });
});
