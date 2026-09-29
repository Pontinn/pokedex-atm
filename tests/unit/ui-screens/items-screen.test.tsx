// Cobertura das telas (2026-09-27): ItemsScreen montada inteira (abas por categoria em current.ui.category, busca em
// todos os itens via current.ui.query, card expansivel em current.ui.openItemId, abrir a pagina do item, vazio e erro).
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ItemInfo, ItemsFile } from "../../../src/data/types";

function item(id: string, pt: string, en: string, category: ItemInfo["category"], description: ItemInfo["description"], texture: string | null = null): ItemInfo {
  const path = id.slice(id.indexOf(":") + 1);
  return { id, namespace: "cobblemon", path, name: { pt, en }, description, category, texture, tags: [], obtain: [], usedIn: { evolutions: [], fossils: [], forms: [], ball: false }, cooking: null, bait: null };
}

const items: ItemsFile = {
  "cobblemon:potion": item("cobblemon:potion", "Poção", "Potion", "medicine", { pt: "Cura 20 PS.", en: "Heals 20 HP." }, "assets/items/cobblemon/potion.png"),
  "cobblemon:super_potion": item("cobblemon:super_potion", "Super Poção", "Super Potion", "medicine", null),
  "cobblemon:fire_stone": item("cobblemon:fire_stone", "Pedra do Fogo", "Fire Stone", "evolution", null),
};

const loaderState = { fail: false };
vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  return {
    ...real,
    loadItems: async () => {
      if (loaderState.fail) throw new Error("network");
      return items;
    },
  };
});

const { ItemsScreen } = await import("../../../src/screens/Items/ItemsScreen");
const { LIST_SEARCH_DEBOUNCE_MS } = await import("../../../src/screens/Trainers/ListSearch");
const { translate } = await import("../../../src/i18n/useT");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore } = await import("../../../src/state/preferences-store");

const tr = (key: string) => translate("pt", key);
const ui = () => useNavigationStore.getState().current.ui as { category: string; query: string; openItemId: string | null };
const shownIds = () => [...document.querySelectorAll("#item-grid [data-item]")].map((e) => e.getAttribute("data-item"));

beforeEach(() => {
  loaderState.fail = false;
  resetNavigationStore();
  resetPreferencesStore();
  useNavigationStore.getState().navigate("items", {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function renderItems() {
  render(<ItemsScreen entryId={1} params={{}} />);
  await waitFor(() => expect(document.getElementById("item-tabs")).not.toBeNull());
}

describe("ItemsScreen", () => {
  it("abas so das categorias presentes; trocar de aba grava current.ui.category e filtra a grade", async () => {
    await renderItems();
    const tabs = [...document.querySelectorAll("#item-tabs [data-icat]")].map((b) => b.getAttribute("data-icat"));
    expect(tabs.sort()).toEqual(["evolution", "medicine"]);
    fireEvent.click(document.querySelector("[data-icat='evolution']")!);
    expect(ui().category).toBe("evolution");
    expect(shownIds()).toEqual(["cobblemon:fire_stone"]);
    fireEvent.click(document.querySelector("[data-icat='medicine']")!);
    expect(shownIds().sort()).toEqual(["cobblemon:potion", "cobblemon:super_potion"]);
    // item sem descricao mostra item.noDesc e nao tem caret
    const sp = document.querySelector("[data-item='cobblemon:super_potion']")!;
    expect(sp.textContent).toContain(tr("item.noDesc"));
    expect(sp.querySelector(".item-caret")).toBeNull();
  });

  it("caret abre/fecha a descricao (openItemId) e clicar no nome abre a pagina do item", async () => {
    await renderItems();
    fireEvent.click(document.querySelector("[data-icat='medicine']")!);
    const card = document.querySelector<HTMLElement>("[data-item='cobblemon:potion']")!;
    fireEvent.click(card.querySelector(".item-caret")!);
    expect(ui().openItemId).toBe("cobblemon:potion");
    expect(document.querySelector("[data-item='cobblemon:potion']")!.className).toContain("open");
    fireEvent.click(document.querySelector("[data-item='cobblemon:potion'] .item-caret")!);
    expect(ui().openItemId).toBeNull();
    fireEvent.click(document.querySelector("[data-item='cobblemon:potion'] .item-link")!);
    expect(useNavigationStore.getState().current.screen).toBe("item");
    expect(useNavigationStore.getState().current.params).toEqual({ itemId: "cobblemon:potion" });
  });

  it("busca procura em todas as categorias (PT/EN) e sem resultado mostra item.none", async () => {
    await renderItems();
    const input = document.getElementById("item-q") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "stone" } });
    await waitFor(() => expect(ui().query).toBe("stone"), { timeout: LIST_SEARCH_DEBOUNCE_MS + 1000 });
    expect(shownIds()).toEqual(["cobblemon:fire_stone"]);
    expect(document.querySelector("#item-tabs [aria-selected='true']")).toBeNull();
    fireEvent.change(input, { target: { value: "zzzz" } });
    expect(await screen.findByText(tr("item.none"))).toBeTruthy();
    // trocar de aba limpa a busca e o campo
    fireEvent.click(document.querySelector("[data-icat='medicine']")!);
    expect(ui().query).toBe("");
    await waitFor(() => expect(input.value).toBe(""));
  });

  it("erro do loader mostra retry que recarrega", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    loaderState.fail = true;
    render(<ItemsScreen entryId={1} params={{}} />);
    expect(await screen.findByRole("alert")).toBeTruthy();
    loaderState.fail = false;
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /tentar/i }));
    });
    await waitFor(() => expect(document.getElementById("item-grid")).not.toBeNull());
  });
});
