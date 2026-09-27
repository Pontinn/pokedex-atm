// Cobertura das telas (2026-09-27): CompareScreen montada inteira (padrao pelos 2 ultimos do historico, lados vazios,
// stats espelhados com vencedor, Trocar lados em current.ui, Trocar Pokemon pelo ComparePicker com teclado).
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SpeciesDetail, SpeciesSummary } from "../../../src/data/types";
import speciesJson from "../../fixtures/rules-storage/species-6.json";

const charizard = speciesJson as unknown as SpeciesDetail;
const blastoise: SpeciesDetail = {
  ...charizard,
  dex: 9,
  slug: "blastoise",
  name: { pt: "Blastoise", en: "Blastoise" },
  searchKey: "blastoise|blastoise",
  types: ["water"],
  cry: null,
  baseStats: { hp: 79, attack: 83, defence: 100, specialAttack: 85, specialDefence: 105, speed: 78 },
};
const details = new Map<number, SpeciesDetail>([
  [6, charizard],
  [9, blastoise],
]);
const loaderState = { fail: false };

vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  return {
    ...real,
    loadSpecies: async (dex: number) => {
      if (loaderState.fail) throw new Error("network");
      return details.get(dex)!;
    },
  };
});

const { CompareScreen } = await import("../../../src/screens/Compare/CompareScreen");
const { translate } = await import("../../../src/i18n/useT");
const { MemoryAdapter } = await import("../../../src/storage");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore } = await import("../../../src/state/preferences-store");
const { setUserStoreStorage } = await import("../../../src/state/captured-store");
const { resetHistoryStore, useHistoryStore } = await import("../../../src/state/history-store");

const tr = (key: string) => translate("pt", key);
const ui = () => useNavigationStore.getState().current.ui as { left: number | null; right: number | null };
const side = (s: "left" | "right") => document.querySelector<HTMLElement>(`[data-side='${s}']`)!;

beforeEach(async () => {
  loaderState.fail = false;
  const storage = new MemoryAdapter();
  await storage.init();
  setUserStoreStorage(storage);
  resetHistoryStore();
  resetDatasetStore();
  resetNavigationStore();
  resetPreferencesStore();
  useDatasetStore.setState({ status: "ready", ready: true, speciesIndex: [charizard, blastoise] as SpeciesSummary[] });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderCompare(ui?: { left: number | null; right: number | null }) {
  useNavigationStore.getState().navigate("compare", {}, ui);
  return render(<CompareScreen entryId={1} params={{}} />);
}

describe("CompareScreen", () => {
  it("sem historico os dois lados pedem escolha e os stats mostram '-'", async () => {
    renderCompare();
    await act(async () => {
      await useHistoryStore.getState().hydrate();
    });
    expect(side("left").textContent).toContain(tr("compare.pick"));
    expect(side("right").textContent).toContain(tr("compare.pick"));
    expect(document.querySelector(".cmp-total")!.textContent).toContain("-");
  });

  it("padrao pelos 2 ultimos do historico, vencedor em .win e Total; Trocar lados inverte current.ui", async () => {
    await useHistoryStore.getState().push(9);
    await useHistoryStore.getState().push(6);
    renderCompare();
    await waitFor(() => expect(ui().left).not.toBeNull());
    expect([ui().left, ui().right].sort()).toEqual([6, 9]);
    await waitFor(() => expect(side("left").querySelector("h3")).not.toBeNull());
    await waitFor(() => expect(side("right").querySelector("h3")).not.toBeNull());
    const total = document.querySelector(".cmp-total")!;
    const values = [...total.querySelectorAll(".v")].map((v) => Number(v.textContent));
    expect(values.sort()).toEqual([530, 534]);
    expect(total.querySelector(".win")!.textContent).toBe("534");
    const before = { ...ui() };
    fireEvent.click(document.getElementById("cmp-swap")!);
    expect(ui()).toEqual({ left: before.right, right: before.left });
  });

  it("Trocar Pokemon abre o picker; digitar e Enter escolhe; Esc fecha", async () => {
    renderCompare({ left: 6, right: null });
    await waitFor(() => expect(side("left").querySelector("h3")).not.toBeNull());
    fireEvent.click(side("right").querySelector(".cmp-change")!);
    const input = document.getElementById("cmp-q-right") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "blast" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(ui().right).toBe(9);
    await waitFor(() => expect(side("right").querySelector("h3")!.textContent).toBe("Blastoise"));

    fireEvent.click(side("left").querySelector(".cmp-change")!);
    fireEvent.keyDown(document.getElementById("cmp-q-left")!, { key: "Escape" });
    expect(document.getElementById("cmp-q-left")).toBeNull();
    fireEvent.click(side("left").querySelector(".cmp-change")!);
    fireEvent.click(screen.getByRole("button", { name: tr("compare.close") }));
    expect(document.getElementById("cmp-q-left")).toBeNull();
  });

  it("falha ao carregar a ficha de um lado mostra erro inline", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    loaderState.fail = true;
    renderCompare({ left: 6, right: 9 });
    await waitFor(() => expect(screen.getAllByRole("alert").length).toBeGreaterThan(0));
  });
});
