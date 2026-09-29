// Cobertura das telas (2026-09-27): ItemScreen montada inteira (hero, Como obter com todas as rotas, Usado em com
// evolucoes/fosseis/formas/bola/efeito, item de outro mod, erro com retry, Voltar e chips que abrem a ficha).
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BallsFile, ItemInfo, ItemsFile, SpeciesSummary } from "../../../src/data/types";

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
  "cobblemon:fire_stone": item("cobblemon:fire_stone", {
    name: { pt: "Pedra do Fogo", en: "Fire Stone" },
    description: { pt: "Faz evoluir.", en: "Evolves." },
    category: "evolution",
    texture: "assets/items/cobblemon/fire_stone.png",
    obtain: [
      { kind: "craftable", recipeTypes: ["minecraft:crafting_shaped"] },
      { kind: "craftable", recipeTypes: [] },
      { kind: "drop", from: [{ dex: 37, percentage: 25, quantityRange: null }, { dex: 58, percentage: null, quantityRange: "1-2" }] },
      { kind: "plantable", biomeTags: ["#minecraft:is_forest"], mulches: [] },
      { kind: "plantable", biomeTags: [], mulches: [] },
      { kind: "structureLoot", tables: ["minecraft:chests/village/village_weaponsmith"] },
      { kind: "fishing" },
      { kind: "fossilRevive", species: [138] },
    ],
    usedIn: {
      evolutions: [{ from: 37, to: 38 }, { from: 37, to: 38 }, { from: 58, to: 59 }],
      fossils: [138],
      forms: [{ dex: 6, form: "Mega-X" }],
      ball: false,
    },
  }),
  "cobblemon:great_ball": item("cobblemon:great_ball", {
    name: { pt: "Grande Bola", en: "Great Ball" },
    category: "ball",
    usedIn: { evolutions: [], fossils: [], forms: [], ball: true },
  }),
  "cobblemon:oran_berry": item("cobblemon:oran_berry", {
    name: { pt: "Fruta Oran", en: "Oran Berry" },
    description: { pt: "Cura 10 PS.", en: "Heals 10 HP." },
    category: "berry",
    cooking: { effectNote: "pending" },
    bait: null,
  }),
};

const balls: BallsFile = [
  { id: "great_ball", itemId: "cobblemon:great_ball", name: { pt: "Grande Bola", en: "Great Ball" }, effect: { pt: "Taxa 1.5x", en: "Rate 1.5x" }, rule: { kind: "flat", multiplier: 1.5 }, tags: [] },
];

const loaderState = { fail: false };
vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  return {
    ...real,
    loadItems: async () => {
      if (loaderState.fail) throw new Error("network");
      return items;
    },
    loadBalls: async () => balls,
    loadBiomes: async () => ({ "#minecraft:is_forest": { pt: "Floresta", en: "Forest" } }),
  };
});

const { ItemScreen } = await import("../../../src/screens/Item/ItemScreen");
const { translate } = await import("../../../src/i18n/useT");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore } = await import("../../../src/state/preferences-store");

const tr = (key: string, vars?: Record<string, string | number>) => translate("pt", key, vars);

function sp(dex: number, pt: string): SpeciesSummary {
  return { dex, slug: pt.toLowerCase(), name: { pt, en: pt }, searchKey: "", types: ["fire"], generation: "gen1", labels: [], bst: 1, rarity: { primary: null, secondary: [] }, evolutionMethods: ["none"], hasSprite: true, artworkId: dex };
}

beforeEach(() => {
  loaderState.fail = false;
  resetDatasetStore();
  resetNavigationStore();
  resetPreferencesStore();
  useDatasetStore.setState({ status: "ready", ready: true, speciesIndex: [sp(37, "Vulpix"), sp(38, "Ninetales"), sp(58, "Growlithe"), sp(59, "Arcanine"), sp(138, "Omanyte")] });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderItem(itemId: string) {
  useNavigationStore.getState().navigate("item", { itemId });
  return render(<ItemScreen entryId={1} params={{ itemId }} />);
}

async function body() {
  return waitFor(() => {
    const el = document.querySelector<HTMLElement>(".item-body");
    if (!el) throw new Error("carregando");
    return el;
  });
}

describe("ItemScreen", () => {
  it("item com todas as rotas de Como obter e todos os blocos de Usado em", async () => {
    renderItem("cobblemon:fire_stone");
    const el = await body();
    expect(el.querySelector("h2")!.textContent).toBeTruthy();
    const kinds = [...el.querySelectorAll(".item-obtain [data-row]")].map((r) => r.getAttribute("data-row"));
    expect(kinds).toEqual(["craftable", "craftable", "drop", "plantable", "plantable", "structureLoot", "fishing", "fossilRevive"]);
    const drop = el.querySelector(".item-obtain [data-row='drop']")!;
    expect(drop.textContent).toContain("25%");
    expect(drop.textContent).toContain("1-2");
    expect(el.querySelector(".item-obtain [data-row='plantable']")!.textContent).toContain("Floresta");
    const used = [...el.querySelectorAll(".item-used [data-row]")].map((r) => r.getAttribute("data-row"));
    expect(used).toEqual(["evolutions", "fossils", "forms"]);
    // par de evolucao repetido aparece uma vez so
    expect(el.querySelectorAll(".item-used .evo-pair")).toHaveLength(2);
    expect(el.querySelector(".item-used [data-row='forms']")!.textContent).toContain("Mega-X");
    expect(el.querySelector(".item-hero-tile img")).not.toBeNull();

    fireEvent.click(el.querySelector(".item-obtain [data-row='drop'] [data-dex='37']")!);
    expect(useNavigationStore.getState().current.screen).toBe("detail");
    expect(useNavigationStore.getState().current.params).toEqual({ dex: 37 });
  });

  it("pokebola mostra o multiplicador; sem rota mostra obtain.none", async () => {
    renderItem("cobblemon:great_ball");
    const el = await body();
    expect(el.querySelector(".item-obtain [data-row='none']")!.textContent).toContain(tr("obtain.none"));
    const ball = el.querySelector(".item-used [data-row='ball']")!;
    expect(ball.textContent).toContain("Taxa 1.5x");
  });

  it("fruta mostra efeito e o aviso de cozinha pendente", async () => {
    renderItem("cobblemon:oran_berry");
    const el = await body();
    expect(el.querySelector(".item-used [data-row='effect']")!.textContent).toContain("Cura 10 PS.");
    expect(el.querySelector(".item-cooking-note")).not.toBeNull();
  });

  it("item de outro mod (fora do items.json) mostra o aviso e nome humanizado, sem Usado em", async () => {
    renderItem("othermod:shiny_thing");
    const el = await body();
    expect(el.textContent).toContain(tr("ip.otherMod"));
    expect(el.textContent).toContain(tr("ip.otherModHint"));
    expect(el.querySelector(".item-used")).toBeNull();
  });

  it("erro do loader mostra retry; Voltar desempilha", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    loaderState.fail = true;
    useNavigationStore.getState().navigate("items", {});
    renderItem("cobblemon:fire_stone");
    expect(await screen.findByRole("alert")).toBeTruthy();
    loaderState.fail = false;
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /tentar/i }));
    });
    await body();
    fireEvent.click(screen.getByRole("button", { name: tr("ip.back") }));
    expect(useNavigationStore.getState().current.screen).toBe("items");
  });
});
