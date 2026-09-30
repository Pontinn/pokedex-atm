// berry-mutations T1.4: linhas de baga da pagina do item (Encontrada no mundo, Cresce melhor em, Como cruzar e Usada
// em cruzamento) montadas no ItemScreen com loaders mockados; item com berry null identico ao de hoje.
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ItemBerry, ItemInfo, ItemsFile } from "../../../src/data/types";

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
    berry: null,
    ...patch,
  };
}

function berry(patch: Partial<ItemBerry>): ItemBerry {
  return { spawn: [], mutationPairs: [], mutationUses: [], ...patch };
}

const FOREST = "#minecraft:is_forest";
const JUNGLE = "#minecraft:is_jungle";

const items: ItemsFile = {
  // baga de mundo: 2 rotas + plantable; usada em cruzamento; tem descricao (linha effect)
  "cobblemon:occa_berry": item("cobblemon:occa_berry", {
    name: { pt: "Baga Occa", en: "Occa Berry" },
    description: { pt: "Reduz dano.", en: "Reduces damage." },
    category: "berry",
    obtain: [
      { kind: "craftable", recipeTypes: [] },
      { kind: "plantable", biomeTags: [FOREST], mulches: [] },
      { kind: "structureLoot", tables: ["minecraft:chests/village/village_weaponsmith"] },
    ],
    berry: berry({
      spawn: [{ variant: "preferredBiome", biomeTags: [FOREST, JUNGLE] }],
      mutationUses: [
        { partner: "cobblemon:cheri_berry", result: "cobblemon:lum_berry" },
        { partner: "cobblemon:persim_berry", result: "cobblemon:lum_berry" },
        { partner: "cobblemon:aspear_berry", result: "cobblemon:figy_berry" },
      ],
    }),
  }),
  // baga so de cruzamento: grupo de 3 parceiros (um fora do catalogo)
  "cobblemon:lum_berry": item("cobblemon:lum_berry", {
    name: { pt: "Baga Lum", en: "Lum Berry" },
    category: "berry",
    obtain: [{ kind: "plantable", biomeTags: [FOREST], mulches: [] }],
    berry: berry({
      mutationPairs: [
        { a: "cobblemon:aspear_berry", b: "cobblemon:oran_berry" },
        { a: "cobblemon:cheri_berry", b: "cobblemon:oran_berry" },
        { a: "cobblemon:ghost_berry", b: "cobblemon:oran_berry" },
      ],
    }),
  }),
  // resultado de 1 par (sem "uma destas:")
  "cobblemon:figy_berry": item("cobblemon:figy_berry", {
    name: { pt: "Baga Figy", en: "Figy Berry" },
    category: "berry",
    obtain: [{ kind: "plantable", biomeTags: [JUNGLE], mulches: [] }],
    berry: berry({ mutationPairs: [{ a: "cobblemon:cheri_berry", b: "cobblemon:persim_berry" }] }),
  }),
  // all_biome
  "cobblemon:oran_berry": item("cobblemon:oran_berry", {
    name: { pt: "Baga Oran", en: "Oran Berry" },
    category: "berry",
    obtain: [{ kind: "plantable", biomeTags: [FOREST], mulches: [] }],
    berry: berry({ spawn: [{ variant: "allBiome", biomeTags: [] }] }),
  }),
  // preferredBiomeTags vazio: mantem "Plantavel / Pode ser plantado"
  "cobblemon:plain_berry": item("cobblemon:plain_berry", {
    name: { pt: "Baga Plana", en: "Plain Berry" },
    category: "berry",
    obtain: [{ kind: "plantable", biomeTags: [], mulches: [] }],
    berry: berry({}),
  }),
  "cobblemon:red_apricorn": item("cobblemon:red_apricorn", {
    name: { pt: "Apricorn Vermelho", en: "Red Apricorn" },
    category: "other",
    obtain: [
      { kind: "craftable", recipeTypes: [] },
      { kind: "plantable", biomeTags: [], mulches: [] },
    ],
  }),
  "cobblemon:surprise_mulch": item("cobblemon:surprise_mulch", { name: { pt: "Adubo Surpresa", en: "Surprise Mulch" } }),
  "cobblemon:cheri_berry": item("cobblemon:cheri_berry", { name: { pt: "Baga Cheri", en: "Cheri Berry" }, category: "berry" }),
  "cobblemon:aspear_berry": item("cobblemon:aspear_berry", { name: { pt: "Baga Aspear", en: "Aspear Berry" }, category: "berry" }),
  "cobblemon:persim_berry": item("cobblemon:persim_berry", { name: { pt: "Baga Persim", en: "Persim Berry" }, category: "berry" }),
};

vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  return {
    ...real,
    loadItems: async () => items,
    loadBalls: async () => [],
    loadBiomes: async () => ({ [FOREST]: { pt: "Floresta", en: "Forest" }, [JUNGLE]: { pt: "Selva", en: "Jungle" } }),
  };
});

const { ItemScreen } = await import("../../../src/screens/Item/ItemScreen");
const { translate } = await import("../../../src/i18n/useT");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore, usePreferencesStore } = await import("../../../src/state/preferences-store");

const tr = (key: string) => translate("pt", key);

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

async function renderItem(itemId: string) {
  useNavigationStore.getState().navigate("item", { itemId });
  render(<ItemScreen entryId={1} params={{ itemId }} />);
  return waitFor(() => {
    const el = document.querySelector<HTMLElement>(`.item-body[data-item='${itemId}']`);
    if (!el) throw new Error("carregando");
    return el;
  });
}

const rows = (el: HTMLElement, panel: string) => [...el.querySelectorAll(`${panel} [data-row]`)].map((r) => r.getAttribute("data-row"));

describe("ItemScreen berry rows", () => {
  it("world berry: existing routes without plantable, then berryWorld and berryGrowth with biome chips", async () => {
    const el = await renderItem("cobblemon:occa_berry");
    expect(rows(el, ".item-obtain")).toEqual(["craftable", "structureLoot", "berryWorld", "berryGrowth"]);
    const world = el.querySelector(".item-obtain [data-row='berryWorld']")!;
    expect(world.textContent).toContain(tr("ip.berryWorld"));
    expect(world.textContent).toContain(tr("ip.berryWorldText"));
    expect([...world.querySelectorAll(".biome")].map((b) => b.textContent)).toEqual(["Floresta", "Selva"]);
    const growth = el.querySelector(".item-obtain [data-row='berryGrowth']")!;
    expect(growth.textContent).toContain(tr("ip.berryGrowth"));
    expect(growth.textContent).toContain(tr("ip.berryGrowthText"));
    expect([...growth.querySelectorAll(".biome")].map((b) => b.textContent)).toEqual(["Floresta"]);
    expect(el.querySelector("[data-row='mutation']")).toBeNull();
  });

  it("all_biome berry shows the any-biome text without chips", async () => {
    const el = await renderItem("cobblemon:oran_berry");
    const world = el.querySelector(".item-obtain [data-row='berryWorld']")!;
    expect(world.textContent).toContain(tr("ip.berryWorldAny"));
    expect(world.querySelectorAll(".biome")).toHaveLength(0);
  });

  it("berry with empty preferred biomes keeps the Plantable row with 'Pode ser plantado'", async () => {
    const el = await renderItem("cobblemon:plain_berry");
    expect(rows(el, ".item-obtain")).toEqual(["plantable"]);
    const p = el.querySelector(".item-obtain [data-row='plantable']")!;
    expect(p.textContent).toContain(tr("ip.plant"));
    expect(p.textContent).toContain(tr("ip.plantAny"));
  });

  it("apricorn (berry null) keeps the same Como obter as today and gets no berry rows", async () => {
    const el = await renderItem("cobblemon:red_apricorn");
    expect(rows(el, ".item-obtain")).toEqual(["craftable", "plantable"]);
    expect(el.querySelector(".item-obtain [data-row='plantable']")!.textContent).toContain(tr("ip.plantAny"));
    expect(el.querySelector("[data-row='berryWorld'], [data-row='berryGrowth'], [data-row='mutation'], [data-row='mutationUses']")).toBeNull();
  });

  it("mutation row: grouped pair with 'uma destas:', no .ob-more, missing partner as plain text, PT chance", async () => {
    const el = await renderItem("cobblemon:lum_berry");
    expect(rows(el, ".item-obtain")).toEqual(["berryGrowth", "mutation"]);
    const mut = el.querySelector<HTMLElement>(".item-obtain [data-row='mutation']")!;
    expect(mut.textContent).toContain(tr("ip.mut.title"));
    const grp = mut.querySelector("[data-mut-fixed='cobblemon:oran_berry']")!;
    expect(grp.textContent).toContain(tr("ip.mut.oneOf"));
    // Oran + Aspear + Cheri como botoes; ghost fora do catalogo vira texto simples
    expect([...grp.querySelectorAll("button[data-item]")].map((b) => b.getAttribute("data-item"))).toEqual(["cobblemon:oran_berry", "cobblemon:aspear_berry", "cobblemon:cheri_berry"]);
    const missing = grp.querySelector("[data-item='cobblemon:ghost_berry']")!;
    expect(missing.hasAttribute("data-item-missing")).toBe(true);
    expect(missing.tagName).not.toBe("BUTTON");
    expect(mut.querySelector(".ob-more")).toBeNull();
    expect(mut.querySelector(".mon-chip, .tag")).toBeNull();
    const chance = mut.querySelector("[data-mut-chance]")!;
    expect(chance.textContent).toContain("12,5%");
    expect(chance.textContent!.replace(/\s+/g, " ")).toContain("50% com Adubo Surpresa");
    expect(mut.querySelector(".mut-how")!.textContent).toBe(tr("ip.mut.how"));
  });

  it("single-partner group has no 'uma destas:'", async () => {
    const el = await renderItem("cobblemon:figy_berry");
    const grp = el.querySelector(".item-obtain [data-mut-fixed='cobblemon:cheri_berry']")!;
    expect(grp.textContent).not.toContain(tr("ip.mut.oneOf"));
    expect(grp.querySelectorAll("button[data-item]")).toHaveLength(2);
  });

  it("EN interface shows 12.5% and 50% with", async () => {
    usePreferencesStore.getState().setUiLanguage("en");
    const el = await renderItem("cobblemon:lum_berry");
    const chance = el.querySelector("[data-mut-chance]")!;
    expect(chance.textContent).toContain("12.5%");
    expect(chance.textContent).toContain("50% with");
  });

  it("berry names follow the itempage terms toggle (EN names with PT interface)", async () => {
    usePreferencesStore.getState().setTermsLanguage("en");
    const el = await renderItem("cobblemon:lum_berry");
    const chance = el.querySelector("[data-mut-chance]")!;
    expect(chance.textContent).toContain("12,5%");
    expect(chance.textContent).toContain("Surprise Mulch");
    expect(el.querySelector("[data-mut-fixed] button[data-item='cobblemon:cheri_berry']")!.textContent).toContain("Cheri Berry");
  });

  it("clicking a partner navigates to that item page", async () => {
    const el = await renderItem("cobblemon:lum_berry");
    fireEvent.click(el.querySelector("[data-mut-fixed] button[data-item='cobblemon:cheri_berry']")!);
    expect(useNavigationStore.getState().current.screen).toBe("item");
    expect(useNavigationStore.getState().current.params).toEqual({ itemId: "cobblemon:cheri_berry" });
  });

  it("mutationUses row comes after effect in Usado em, grouped by result", async () => {
    const el = await renderItem("cobblemon:occa_berry");
    expect(rows(el, ".item-used")).toEqual(["effect", "mutationUses"]);
    const uses = el.querySelector<HTMLElement>(".item-used [data-row='mutationUses']")!;
    expect(uses.textContent).toContain(tr("ip.mut.uses"));
    const groups = [...uses.querySelectorAll("[data-mut-result]")];
    expect(groups.map((g) => g.getAttribute("data-mut-result"))).toEqual(["cobblemon:figy_berry", "cobblemon:lum_berry"]);
    expect(groups[0]!.textContent).not.toContain(tr("ip.mut.oneOf"));
    expect(groups[1]!.textContent).toContain(tr("ip.mut.oneOf"));
    expect(groups[1]!.textContent).toContain(tr("ip.mut.equals"));
    expect(uses.querySelector(".mon-chip, .tag, .ob-more")).toBeNull();
  });

  it("berry without uses and non-berry item get no mutationUses row", async () => {
    const el = await renderItem("cobblemon:lum_berry");
    expect(el.querySelector("[data-row='mutationUses']")).toBeNull();
    cleanup();
    const el2 = await renderItem("cobblemon:red_apricorn");
    expect(el2.querySelector(".item-used")).toBeNull();
  });
});
