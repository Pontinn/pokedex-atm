// spawn-bait T1.4: pagina do item com o painel "Efeitos de isca" (BaitEffectsPanel), os ingredientes da Panela de
// Fogueira (PotRecipeList) e o rotulo da estacao vindo do dicionario (ip.station.campfirePot). Itens REAIS do
// items.json publicado (Occa, maca dourada encantada, Poke-Lanche, Pokeisca) mais um sintetico "so na vara".
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BallsFile, ItemInfo, ItemsFile } from "../../../src/data/types";

const root = join(__dirname, "../../../public/data");
const version = (JSON.parse(readFileSync(join(root, "current.json"), "utf8")) as { datasetVersion: string }).datasetVersion;
const realItems = JSON.parse(readFileSync(join(root, version, "items.json"), "utf8")) as ItemsFile;
const occa = realItems["cobblemon:occa_berry"]!;
const items: ItemsFile = {
  ...realItems,
  "t:rod_only": { ...occa, id: "t:rod_only", name: { pt: "Baga Teste", en: "Test Berry" }, bait: { ...occa.bait!, seasoning: false } },
  "t:odd_pot": {
    ...realItems["cobblemon:poke_bait"]!,
    id: "t:odd_pot",
    obtain: [
      {
        kind: "craftable",
        recipeTypes: ["cobblemon:cooking_pot"],
        potRecipes: [
          {
            recipeId: "t:odd",
            recipeType: "cobblemon:cooking_pot",
            seasoningTag: "t:other_filter",
            ingredients: [
              { kind: "tag", id: "c:crops/weird_thing", count: 2 },
              { kind: "item", id: "t:nameless", count: 1, name: null },
              { kind: "item", id: "t:named", count: 1, name: { pt: "", en: "Named Only EN" } },
            ],
          },
        ],
      },
    ],
  } satisfies ItemInfo,
};
const balls: BallsFile = [];

vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  return { ...real, loadItems: async () => items, loadBalls: async () => balls, loadBiomes: async () => ({}) };
});

const { ItemScreen } = await import("../../../src/screens/Item/ItemScreen");
const { ingredientTagLabel, recipeLabels } = await import("../../../src/screens/Item/item-page-model");
const { translate } = await import("../../../src/i18n/useT");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore, usePreferencesStore } = await import("../../../src/state/preferences-store");

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

async function body(): Promise<HTMLElement> {
  return waitFor(() => {
    const el = document.querySelector<HTMLElement>(".item-body");
    if (!el) throw new Error("carregando");
    return el;
  });
}

describe("BaitEffectsPanel", () => {
  it("Occa: game text in PT, seasoning yes, panel after Como obter and before Usado em", async () => {
    renderItem("cobblemon:occa_berry");
    const el = await body();
    const panel = el.querySelector("[data-bait-effects]")!;
    expect(panel.querySelector("h3")!.textContent).toBe("Efeitos de isca");
    expect(panel.querySelector("[data-row='bait-typing'] .ob-title")!.textContent).toBe("Tipo");
    expect(panel.textContent).toContain("100% de probabilidade de aumentar em 10× a chance de fisgar Pokémon do Tipo Fogo");
    expect(panel.querySelector("[data-row='bait-seasoning']")!.textContent).toContain("Aceito como tempero do Poké-Lanche e da Pokéisca");
    expect(panel.textContent).not.toMatch(/Charizard|Pokémon:/);
    const sections = [...el.querySelectorAll("section")].map((s) => s.className);
    expect(sections.indexOf("panel item-bait")).toBeGreaterThan(sections.indexOf("panel item-obtain"));
    expect(sections.indexOf("panel item-bait")).toBeLessThan(sections.findIndex((c) => c.includes("item-used")));
  });

  it("the itempage card toggle switches the game text to EN", async () => {
    usePreferencesStore.setState({ termsOverrides: { itempage: "en" } });
    renderItem("cobblemon:occa_berry");
    const el = await body();
    expect(el.querySelector("[data-bait-effects]")!.textContent).toContain("100% - 10× Chance for Fire Types");
  });

  it("enchanted golden apple: bite time, rarity (+10) and shiny (6x) rows", async () => {
    renderItem("minecraft:enchanted_golden_apple");
    const el = await body();
    const rows = [...el.querySelectorAll("[data-bait-effects] [data-row]")].map((r) => r.getAttribute("data-row"));
    expect(rows).toEqual(["bait-biteTime", "bait-rarityBucket", "bait-shinyReroll", "bait-seasoning"]);
    const text = el.querySelector("[data-bait-effects]")!.textContent!;
    expect(text).toContain("+10");
    expect(text).toContain("6×");
  });

  it("seasoning false shows the rod only line (RF-55)", async () => {
    renderItem("t:rod_only");
    const el = await body();
    expect(el.querySelector("[data-row='bait-seasoning']")!.textContent).toContain("Só na vara");
  });

  it("no panel for empty effects (Poké Bait) nor for items without bait", async () => {
    renderItem("cobblemon:poke_bait");
    let el = await body();
    expect(el.querySelector("[data-bait-effects]")).toBeNull();
    cleanup();
    renderItem("cobblemon:ability_capsule");
    el = await body();
    expect(el.querySelector("[data-bait-effects]")).toBeNull();
  });
});

describe("PotRecipeList", () => {
  it("Poké Snack: 4 ingredients in order, tag with a human label, item links and the seasoning note", async () => {
    renderItem("cobblemon:poke_snack");
    const el = await body();
    const recipe = el.querySelector("[data-pot-recipe='cobblemon:campfire_pot/poke_snack']")!;
    const ings = [...recipe.querySelectorAll(".pot-ing")];
    expect(ings.map((i) => i.getAttribute("data-ingredient"))).toEqual(["c:drinks/milk", "minecraft:honey_bottle", "cobblemon:vivichoke", "cobblemon:hearty_grains"]);
    expect(ings.map((i) => i.querySelector("b")!.textContent)).toEqual(["3x", "2x", "1x", "3x"]);
    expect(ings[0]!.textContent).toBe("3xQualquer leite");
    expect(ings[0]!.querySelector("button")).toBeNull();
    expect(ings[1]!.querySelector("button[data-item='minecraft:honey_bottle']")!.textContent).toContain("Frasco de Mel");
    expect(recipe.querySelector(".pot-seasoning")!.textContent).toBe("mais até 3 temperos da lista de iscas (bagas e frutas aceitas pela panela)");
    expect(el.querySelector(".item-hero .badge")!.textContent).toBe("Iscas");
    expect(el.querySelector(".item-cooking-note")).toBeNull();
    expect(el.querySelector("[data-row='craftable'] .badge")!.textContent).toContain("Panela de Fogueira");
    fireEvent.click(ings[2]!.querySelector("button")!);
    expect(useNavigationStore.getState().current.params).toEqual({ itemId: "cobblemon:vivichoke" });
  });

  it("Poké Bait: wheat outside the catalog is plain text with the game name; mushrooms tag", async () => {
    renderItem("cobblemon:poke_bait");
    const el = await body();
    const wheat = el.querySelector("[data-ingredient='minecraft:wheat']")!;
    expect(wheat.querySelector("button")).toBeNull();
    expect(wheat.textContent).toBe("1xTrigo");
    expect(el.querySelector("[data-ingredient='c:mushrooms']")!.textContent).toContain("Qualquer cogumelo");
  });

  it("unknown tag, nameless item and other seasoning filter", async () => {
    renderItem("t:odd_pot");
    const el = await body();
    expect(el.querySelector("[data-ingredient='c:crops/weird_thing']")!.textContent).toBe("2xQualquer Weird thing");
    expect(el.querySelector("[data-ingredient='t:nameless']")!.textContent).toBe("1xNameless");
    expect(el.querySelector("[data-ingredient='t:named']")!.textContent).toBe("1xNamed Only EN");
    expect(el.querySelector(".pot-seasoning")).toBeNull();
  });

  it("craftable without potRecipes renders as before", async () => {
    renderItem("cobblemon:ability_capsule");
    const el = await body();
    expect(el.querySelector("[data-pot-recipe]")).toBeNull();
    expect(el.querySelector("[data-row='craftable'] .badge")!.textContent).toMatch(/^Sim, tem receita/);
  });

  it("station label comes from ip.station.campfirePot: PT and EN interface", async () => {
    expect(recipeLabels(["cobblemon:cooking_pot"], "pt")).toEqual([translate("pt", "ip.station.campfirePot")]);
    usePreferencesStore.setState({ uiLanguage: "en" });
    renderItem("cobblemon:poke_snack");
    const el = await body();
    expect(el.querySelector("[data-row='craftable'] .badge")!.textContent).toContain("Campfire Pot");
    expect(el.querySelector(".pot-label")!.textContent).toBe("Ingredients:");
    expect(el.querySelector("[data-ingredient='c:drinks/milk']")!.textContent).toBe("3xAny milk");
  });

  it("ingredientTagLabel never returns the raw id", () => {
    const t = (key: string, vars?: Record<string, string | number>) => translate("en", key, vars);
    expect(ingredientTagLabel("c:mushrooms", t)).toBe("Any mushroom");
    expect(ingredientTagLabel("#c:foods/raw_fish", t)).toBe("Any Raw fish");
  });
});
