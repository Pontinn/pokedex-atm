// berry-mutations T1.4: tag de origem nos cards das bagas e filtro de origem (SegmentedControl) na listagem de itens,
// com o estado em current.ui.origin; .item-tag intocado.
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ItemBerry, ItemInfo, ItemsFile } from "../../../src/data/types";

function item(id: string, pt: string, en: string, category: ItemInfo["category"], berry: ItemBerry | null = null): ItemInfo {
  const path = id.slice(id.indexOf(":") + 1);
  return { id, namespace: "cobblemon", path, name: { pt, en }, description: null, category, texture: null, tags: [], obtain: [], usedIn: { evolutions: [], fossils: [], forms: [], ball: false }, cooking: null, bait: null, berry };
}

const world: ItemBerry = { spawn: [{ variant: "preferredBiome", biomeTags: ["#minecraft:is_forest"] }], mutationPairs: [], mutationUses: [] };
const mutation: ItemBerry = { spawn: [], mutationPairs: [{ a: "cobblemon:aspear_berry", b: "cobblemon:oran_berry" }], mutationUses: [] };
const both: ItemBerry = { spawn: [{ variant: "specificBiome", biomeTags: ["cobblemon:is_mirage_island"] }], mutationPairs: [{ a: "cobblemon:kelpsy_berry", b: "cobblemon:pamtre_berry" }], mutationUses: [] };

const items: ItemsFile = {
  "cobblemon:occa_berry": item("cobblemon:occa_berry", "Baga Occa", "Occa Berry", "berry", world),
  "cobblemon:sitrus_berry": item("cobblemon:sitrus_berry", "Baga Sitrus", "Sitrus Berry", "berry", mutation),
  "cobblemon:liechi_berry": item("cobblemon:liechi_berry", "Baga Liechi", "Liechi Berry", "berry", both),
  "cobblemon:red_apricorn": item("cobblemon:red_apricorn", "Apricorn Vermelho", "Red Apricorn", "berry"),
  "cobblemon:potion": item("cobblemon:potion", "Poção", "Potion", "medicine"),
};

vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  return { ...real, loadItems: async () => items };
});

const { ItemsScreen } = await import("../../../src/screens/Items/ItemsScreen");
const { CATEGORY_LABEL } = await import("../../../src/screens/Items/item-model");
const { translate } = await import("../../../src/i18n/useT");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore } = await import("../../../src/state/preferences-store");

const tr = (key: string) => translate("pt", key);
const ui = () => useNavigationStore.getState().current.ui as { category: string; query: string; openItemId: string | null; origin: string };
const shownIds = () => [...document.querySelectorAll("#item-grid [data-item]")].map((e) => e.getAttribute("data-item"));
const cardEl = (id: string) => document.querySelector<HTMLElement>(`.item-card[data-item='${id}']`)!;

beforeEach(() => {
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

function filterGroup() {
  return screen.getByRole("group", { name: tr("item.origin.filter") });
}

describe("ItemsScreen origin tag", () => {
  it("berry cards show .item-origin in the order mutation, world; .item-tag stays the first child", async () => {
    await renderItems();
    fireEvent.click(document.querySelector("[data-icat='berry']")!);
    const origins = (id: string) => [...cardEl(id).querySelectorAll(".item-origin")].map((o) => o.getAttribute("data-origin"));
    expect(origins("cobblemon:occa_berry")).toEqual(["world"]);
    expect(origins("cobblemon:sitrus_berry")).toEqual(["mutation"]);
    expect(origins("cobblemon:liechi_berry")).toEqual(["mutation", "world"]);
    expect(cardEl("cobblemon:liechi_berry").querySelector(".item-origin")!.textContent).toBe(tr("item.origin.mutation"));
    const names = cardEl("cobblemon:occa_berry").querySelector(".item-names")!;
    expect(names.firstElementChild!.className).toBe("tag item-tag");
    expect(names.firstElementChild!.textContent).toBe(tr(CATEGORY_LABEL.berry));
    expect(names.lastElementChild!.className).toBe("item-origins");
  });

  it("non-berry items (berry null) have no .item-origins", async () => {
    await renderItems();
    fireEvent.click(document.querySelector("[data-icat='berry']")!);
    expect(cardEl("cobblemon:red_apricorn").querySelector(".item-origins")).toBeNull();
    fireEvent.click(document.querySelector("[data-icat='medicine']")!);
    expect(cardEl("cobblemon:potion").querySelector(".item-origins")).toBeNull();
  });
});

describe("ItemsScreen origin filter", () => {
  it("renders a labelled group with 3 buttons and 'Todos' pressed by default", async () => {
    await renderItems();
    const group = filterGroup();
    const buttons = [...group.querySelectorAll("button")];
    expect(buttons.map((b) => b.textContent)).toEqual([tr("item.origin.all"), tr("item.origin.mutation"), tr("item.origin.world")]);
    expect(buttons[0]!.getAttribute("aria-pressed")).toBe("true");
    expect(buttons[1]!.getAttribute("aria-pressed")).toBe("false");
  });

  it("clicking Mutacao writes ui.origin and narrows the grid; switching tab keeps origin", async () => {
    await renderItems();
    fireEvent.click(document.querySelector("[data-icat='berry']")!);
    expect(shownIds()).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: tr("item.origin.mutation") }));
    expect(ui().origin).toBe("mutation");
    expect(shownIds().sort()).toEqual(["cobblemon:liechi_berry", "cobblemon:sitrus_berry"]);
    fireEvent.click(screen.getByRole("button", { name: tr("item.origin.world") }));
    expect(shownIds().sort()).toEqual(["cobblemon:liechi_berry", "cobblemon:occa_berry"]);
    fireEvent.click(document.querySelector("[data-icat='medicine']")!);
    expect(ui().origin).toBe("world");
    expect(ui().category).toBe("medicine");
  });

  it("unknown ui.origin is treated as Todos", async () => {
    useNavigationStore.getState().updateUi<"items">({ origin: "xyz", category: "berry" });
    await renderItems();
    expect(screen.getByRole("button", { name: tr("item.origin.all") }).getAttribute("aria-pressed")).toBe("true");
    expect(shownIds()).toHaveLength(4);
  });

  it("filter without results shows the item.none empty state", async () => {
    await renderItems();
    fireEvent.click(document.querySelector("[data-icat='medicine']")!);
    fireEvent.click(screen.getByRole("button", { name: tr("item.origin.mutation") }));
    expect(await screen.findByText(tr("item.none"))).toBeTruthy();
    expect(document.querySelector(".items-screen .empty-state")).not.toBeNull();
    expect(document.getElementById("item-grid")).toBeNull();
  });
});
