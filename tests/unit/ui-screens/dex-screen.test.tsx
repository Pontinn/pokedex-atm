// Cobertura das telas (2026-09-27): DexScreen montada inteira (busca com debounce, chips de tipo, selects de
// geracao/evolucao/ordem, status capturado e grade virtualizada) com indice pequeno no dataset-store e capturados em
// memoria. A grade virtualizada so e montada (jsdom nao faz layout; os cards sao cobertos em pokemon-card.test.tsx
// e no e2e). Filtros vivem em current.ui (pilha) e a tela nao remonta ao filtrar (data-mount-id estavel).
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { SpeciesSummary, TypeId } from "../../../src/data/types";

const { DexScreen } = await import("../../../src/screens/Dex/DexScreen");
const { LIST_SEARCH_DEBOUNCE_MS } = await import("../../../src/screens/Dex/ListSearch");
const { translate } = await import("../../../src/i18n/useT");
const { MemoryAdapter } = await import("../../../src/storage");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore } = await import("../../../src/state/preferences-store");
const { resetCapturedStore, setUserStoreStorage, useCapturedStore } = await import("../../../src/state/captured-store");

const tr = (key: string, vars?: Record<string, string | number>) => translate("pt", key, vars);

function sp(dex: number, pt: string, en: string, types: TypeId[], generation: string, bst: number, evo: SpeciesSummary["evolutionMethods"]): SpeciesSummary {
  return {
    dex,
    slug: en.toLowerCase(),
    name: { pt, en },
    searchKey: `${pt.toLowerCase()}|${en.toLowerCase()}`,
    types,
    generation,
    labels: [],
    bst,
    rarity: { primary: "common", secondary: [] },
    evolutionMethods: evo,
    hasSprite: true,
    artworkId: dex,
  };
}

const index: SpeciesSummary[] = [
  sp(6, "Charizard", "Charizard", ["fire", "flying"], "gen1", 534, ["none"]),
  sp(1, "Bulbasaur", "Bulbasaur", ["grass", "poison"], "gen1", 318, ["level"]),
  sp(133, "Eevee", "Eevee", ["normal"], "gen1", 325, ["item", "friendship"]),
  sp(152, "Chikorita", "Chikorita", ["grass"], "gen2", 318, ["level"]),
  sp(9901, "Patrickyu", "Patrickyu", ["fire"], "custom", 600, ["none"]),
];

type DexUi = { filters: { types: string[]; generation: string | null; evolution: string | null; query: string }; sort: string; status: string };
const ui = () => useNavigationStore.getState().current.ui as DexUi;
const count = () => Number(document.getElementById("dex-count")!.textContent);

beforeEach(async () => {
  const storage = new MemoryAdapter();
  await storage.init();
  setUserStoreStorage(storage);
  resetCapturedStore();
  resetDatasetStore();
  resetNavigationStore();
  resetPreferencesStore();
  useDatasetStore.setState({ status: "ready", ready: true, speciesIndex: index });
  useNavigationStore.getState().navigate("dex", {});
});

afterEach(() => cleanup());

function renderDex() {
  const main = document.createElement("div");
  main.id = "main";
  document.body.appendChild(main);
  const view = render(<DexScreen entryId={1} params={{}} />, { container: main });
  return { ...view, main };
}

describe("DexScreen", () => {
  it("sem indice (dataset carregando) mostra o spinner e contagem 0", () => {
    useDatasetStore.setState({ speciesIndex: null });
    renderDex();
    expect(count()).toBe(0);
    expect(document.querySelector(".dex-loading")).not.toBeNull();
  });

  it("lista tudo por numero e monta a grade virtualizada (layout real e coberto pelo e2e)", () => {
    renderDex();
    expect(count()).toBe(5);
    const grid = document.querySelector<HTMLElement>(".poke-grid-virtual");
    expect(grid).not.toBeNull();
    // jsdom sem layout: largura 0 = 1 coluna e nenhuma linha montada ainda
    expect(grid!.dataset.columns).toBe("1");
  });

  it("chips de tipo sao OR, gravam em current.ui.filters.types e nao remontam a tela", () => {
    renderDex();
    const mount = document.querySelector(".dex-screen")!.getAttribute("data-mount-id");
    fireEvent.click(document.querySelector("[data-ftype='grass']")!);
    expect(ui().filters.types).toEqual(["grass"]);
    expect(count()).toBe(2);
    fireEvent.click(document.querySelector("[data-ftype='fire']")!);
    expect(count()).toBe(4);
    expect(document.querySelector("[data-ftype='fire']")!.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(document.querySelector("[data-ftype='grass']")!);
    expect(ui().filters.types).toEqual(["fire"]);
    expect(document.querySelector(".dex-screen")!.getAttribute("data-mount-id")).toBe(mount);
  });

  it("geracao, metodo de evolucao e ordenacao combinam e gravam na pilha", () => {
    renderDex();
    const gen = document.getElementById("f-gen") as HTMLSelectElement;
    // geracoes ordenadas: gen1, gen2, custom (por ultimo, com rotulo proprio)
    expect([...gen.options].map((o) => o.value)).toEqual(["all", "gen1", "gen2", "custom"]);
    expect(gen.options[3]!.textContent).toBe(tr("dex.genCustom"));
    fireEvent.change(gen, { target: { value: "gen1" } });
    expect(ui().filters.generation).toBe("gen1");
    expect(count()).toBe(3);
    fireEvent.change(document.getElementById("f-evo")!, { target: { value: "level" } });
    expect(ui().filters.evolution).toBe("level");
    expect(count()).toBe(1);
    fireEvent.change(document.getElementById("f-evo")!, { target: { value: "all" } });
    fireEvent.change(gen, { target: { value: "all" } });
    expect(ui().filters).toMatchObject({ generation: null, evolution: null });
    fireEvent.change(document.getElementById("f-sort")!, { target: { value: "bst" } });
    expect(ui().sort).toBe("bst");
  });

  it("status Capturados/Faltando usa o store de capturados", async () => {
    await act(async () => {
      await useCapturedStore.getState().mark(6);
    });
    renderDex();
    fireEvent.click(screen.getByRole("button", { name: tr("dex.onlyCaught") }));
    expect(ui().status).toBe("caught");
    await waitFor(() => expect(count()).toBe(1));
    fireEvent.click(screen.getByRole("button", { name: tr("dex.onlyMissing") }));
    await waitFor(() => expect(count()).toBe(4));
  });

  it("busca com debounce grava filters.query; sem resultado mostra dex.noneQuery; Esc e o x limpam", async () => {
    renderDex();
    const input = document.getElementById("dex-search") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "eev" } });
    expect(ui().filters.query).toBe("");
    await waitFor(() => expect(ui().filters.query).toBe("eev"), { timeout: LIST_SEARCH_DEBOUNCE_MS + 1000 });
    expect(count()).toBe(1);
    fireEvent.change(input, { target: { value: "#152" } });
    await waitFor(() => expect(count()).toBe(1));
    fireEvent.change(input, { target: { value: "zzzz" } });
    expect(await screen.findByText(tr("dex.noneQuery", { q: "zzzz" }))).toBeTruthy();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.value).toBe("");
    expect(ui().filters.query).toBe("");
    fireEvent.change(input, { target: { value: "char" } });
    fireEvent.click(screen.getByRole("button", { name: tr("dex.clearSearch") }));
    expect(input.value).toBe("");
  });

  it("texto restaurado da pilha volta no campo de busca", () => {
    useNavigationStore.getState().updateUi<"dex">({ filters: { types: [], generation: null, evolution: null, query: "bulba" } });
    renderDex();
    expect((document.getElementById("dex-search") as HTMLInputElement).value).toBe("bulba");
    expect(count()).toBe(1);
  });
});
