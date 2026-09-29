// spawn-bait T1.4: bloco "Iscas" (BaitBlock) e chips de pesca (FishingConds) no painel Onde encontrar, com o
// items.json e as fichas REAIS publicadas; fixture pequena para os casos de borda (seasoning false, sem baga).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ItemInfo, ItemsFile, SpawnEntry, SpawnFishing, SpeciesDetail } from "../../../src/data/types";

const root = join(__dirname, "../../../public/data");
const version = (JSON.parse(readFileSync(join(root, "current.json"), "utf8")) as { datasetVersion: string }).datasetVersion;
const realItems = JSON.parse(readFileSync(join(root, version, "items.json"), "utf8")) as ItemsFile;
const species = (dex: number) => JSON.parse(readFileSync(join(root, version, "species", `${dex}.json`), "utf8")) as SpeciesDetail;

vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  return { ...real, loadItems: async () => realItems, loadBiomes: async () => ({}) };
});

const { BaitBlock, FishingConds } = await import("../../../src/screens/Detail/BaitBlock");
const { WherePanel, eggGroupLabel } = await import("../../../src/screens/Detail/WherePanel");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore, usePreferencesStore } = await import("../../../src/state/preferences-store");
const { resetDatasetStore } = await import("../../../src/state/dataset-store");

beforeEach(() => {
  resetNavigationStore();
  resetPreferencesStore();
  resetDatasetStore();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const FORBIDDEN = [".tag", ".badge", ".drop", "[data-drop]", ".ob-none", ".ob-link", "[data-obtain]", ".spawn-entry", ".biome", ".cond"];

function berryIds(el: ParentNode): (string | null)[] {
  return [...el.querySelectorAll("[data-bait-berry]")].map((e) => e.getAttribute("data-bait-berry"));
}

describe("BaitBlock", () => {
  it("Charizard: snack row only, Occa/Coba/Lum in order with type and egg group labels (PT)", () => {
    const { container } = render(<BaitBlock detail={species(6)} items={realItems} lang="pt" />);
    const block = container.querySelector("[data-bait]")!;
    expect(block).not.toBeNull();
    expect([...block.querySelectorAll("[data-bait-row]")].map((r) => r.getAttribute("data-bait-row"))).toEqual(["snack"]);
    expect(berryIds(block)).toEqual(["cobblemon:occa_berry", "cobblemon:coba_berry", "cobblemon:lum_berry"]);
    const text = block.textContent!;
    for (const s of ["Iscas", "Poké-Lanche", "(Fogo)", "(Voador)", "(Dragão/Monstro)", "Reforços (qualquer Pokémon)"]) expect(text).toContain(s);
    expect(text).not.toMatch(/x\d/);
    expect(block.querySelectorAll("[data-bait-boost]")).toHaveLength(7);
    expect(block.querySelector("[data-bait-boost='minecraft:golden_apple']")!.textContent).toMatch(/raridade.*shiny/);
    for (const sel of FORBIDDEN) expect(block.querySelectorAll(sel)).toHaveLength(0);
  });

  it("names follow the card toggle: EN labels with the card in EN", () => {
    const { container } = render(<BaitBlock detail={species(6)} items={realItems} lang="en" />);
    const text = container.querySelector("[data-bait]")!.textContent!;
    for (const s of ["(Fire)", "(Flying)", "(Dragon/Monster)", "Occa Berry", "Poké Snack"]) expect(text).toContain(s);
  });

  it("interface in EN keeps the UI strings in EN", () => {
    usePreferencesStore.setState({ uiLanguage: "en" });
    const { container } = render(<BaitBlock detail={species(6)} items={realItems} lang="pt" />);
    const text = container.querySelector("[data-bait]")!.textContent!;
    expect(text).toContain("Bait");
    expect(text).toContain("Best berries");
    expect(text).toContain("Boosters (any Pokémon)");
    expect(text).toContain("(Fogo)");
  });

  it("rows by spawn context: Magikarp both, Feebas rod only, 1011 no block", () => {
    const mk = render(<BaitBlock detail={species(129)} items={realItems} lang="pt" />);
    expect([...mk.container.querySelectorAll("[data-bait-row]")].map((r) => r.getAttribute("data-bait-row"))).toEqual(["snack", "rod"]);
    expect(mk.container.querySelector("[data-bait-row='rod']")!.textContent).toContain("ou baga na vara");
    mk.unmount();
    const fb = render(<BaitBlock detail={species(349)} items={realItems} lang="pt" />);
    expect([...fb.container.querySelectorAll("[data-bait-row]")].map((r) => r.getAttribute("data-bait-row"))).toEqual(["rod"]);
    fb.unmount();
    const none = render(<BaitBlock detail={species(1011)} items={realItems} lang="pt" />);
    expect(none.container.querySelector("[data-bait]")).toBeNull();
  });

  it("items loading shows skeletons instead of berries and boosters", () => {
    const { container } = render(<BaitBlock detail={species(6)} items={null} lang="pt" />);
    const block = container.querySelector("[data-bait]")!;
    expect(block.querySelectorAll(".skeleton")).toHaveLength(2);
    expect(block.querySelector("[data-bait-row='snack'] [data-item='cobblemon:poke_snack']")).not.toBeNull();
    expect(block.querySelectorAll("[data-bait-berry]")).toHaveLength(0);
  });

  it("small fixture: seasoning false never shows; no berry shows the empty text", () => {
    const base = realItems["cobblemon:occa_berry"]!;
    const mk = (id: string, sub: string, seasoning: boolean): ItemInfo => ({
      ...base,
      id,
      bait: { seasoning, effects: [{ kind: "typing", subcategory: sub, chance: 1, value: 10, text: { pt: "x", en: "x" } }] },
    });
    const items: ItemsFile = { "t:fire_ok": mk("t:fire_ok", "fire", true), "t:fire_rod": mk("t:fire_rod", "fire", false) };
    const detail = { ...species(6), eggGroups: ["undiscovered"] };
    const r = render(<BaitBlock detail={detail} items={items} lang="pt" />);
    expect(berryIds(r.container)).toEqual(["t:fire_ok"]);
    r.unmount();
    const empty = render(<BaitBlock detail={{ ...detail, types: ["ghost"] }} items={items} lang="pt" />);
    expect(empty.container.querySelector(".bait-empty")!.textContent).toBe("Nenhuma baga de tipo ou grupo de ovo para este Pokémon");
    expect(empty.container.querySelectorAll("[data-bait-boost]")).toHaveLength(0);
  });

  it("clicking a berry opens its item page", () => {
    const { container } = render(<BaitBlock detail={species(6)} items={realItems} lang="pt" />);
    fireEvent.click(container.querySelector("[data-bait-berry='cobblemon:occa_berry'] button")!);
    expect(useNavigationStore.getState().current.screen).toBe("item");
    expect(useNavigationStore.getState().current.params).toEqual({ itemId: "cobblemon:occa_berry" });
  });

  it("eggGroupLabel follows the given language and humanizes unknown groups", () => {
    expect(eggGroupLabel("dragon", "pt")).toBe("Dragão");
    expect(eggGroupLabel("dragon", "en")).toBe("Dragon");
    expect(eggGroupLabel("weird_group", "pt")).toBe("Weird Group");
  });
});

function fishing(patch: Partial<SpawnFishing>): SpawnFishing {
  return { bait: null, rodType: null, rodBall: null, minLureLevel: null, maxLureLevel: null, lureMultipliers: [], ...patch };
}

describe("FishingConds", () => {
  const spawn = (dex: number, id: string) => species(dex).spawns.find((s) => s.id === id)!;

  it("Staryu-10: Lure 1+ and Lure 3+: x3", () => {
    const { container } = render(<FishingConds fishing={spawn(120, "allthemons:staryu-10").fishing!} items={realItems} lang="pt" />);
    const chips = [...container.querySelectorAll(".fish-cond")].map((c) => c.textContent);
    expect(chips).toEqual(["Lure 1+", "Lure 3+: x3"]);
  });

  it("only lure multipliers shows only the multipliers; max only uses 'até'", () => {
    const { container } = render(
      <FishingConds fishing={fishing({ maxLureLevel: 2, lureMultipliers: [{ lureMin: 2, lureMax: 2, multiplier: 3 }, { lureMin: null, lureMax: 1, multiplier: 0.6 }] })} items={realItems} lang="pt" />,
    );
    expect([...container.querySelectorAll(".fish-cond")].map((c) => c.textContent)).toEqual(["Lure até 2", "Lure 2 a 2: x3", "Lure até 1: x0.6"]);
  });

  it("Wooper-16: rod with the Love Ball bobber and 2 multipliers; Wooper-17: required bait clickable", () => {
    const r16 = render(<FishingConds fishing={spawn(194, "cobblemon:wooper-true-16").fishing!} items={realItems} lang="pt" />);
    const rod = r16.container.querySelector("[data-fish='rod']")!;
    expect(rod.textContent).toContain("Pokévara com boia:");
    expect(rod.querySelector("button[data-item='cobblemon:love_ball']")).not.toBeNull();
    expect(r16.container.textContent).toContain("Lure 2 a 2: x3");
    expect(r16.container.textContent).toContain("Lure 3+: x5");
    r16.unmount();
    const r17 = render(<FishingConds fishing={spawn(194, "cobblemon:wooper-true-17").fishing!} items={realItems} lang="pt" />);
    expect(r17.container.querySelector("[data-fish='bait']")!.textContent).toContain("Isca exigida:");
    fireEvent.click(r17.container.querySelector("button[data-item='cobblemon:love_sweet']")!);
    expect(useNavigationStore.getState().current.params).toEqual({ itemId: "cobblemon:love_sweet" });
  });

  it("rod without bobber falls back to the humanized rod id; bait outside the catalog is plain text", () => {
    const { container } = render(<FishingConds fishing={fishing({ rodType: "cobblemon:mystery_rod", bait: "t:unknown_bait" })} items={realItems} lang="en" />);
    expect(container.querySelector("[data-fish='rod']")!.textContent).toContain("Mystery Rod");
    expect(container.querySelector("[data-fish='bait'] button")).toBeNull();
    expect(container.querySelector("[data-fish='bait'] [data-item-missing]")).not.toBeNull();
  });

  it("Goomy range in EN", () => {
    usePreferencesStore.setState({ uiLanguage: "en" });
    const { container } = render(<FishingConds fishing={fishing({ minLureLevel: 2, maxLureLevel: 2 })} items={realItems} lang="en" />);
    expect(container.textContent).toBe("Lure 2 to 2");
  });
});

describe("WherePanel with bait and fishing", () => {
  function counts(detail: SpeciesDetail): number[] {
    const r = render(<WherePanel detail={detail} />);
    const out = [".spawn-entry", ".spawn-entry .badge", ".spawn-entry .tag", ".spawn-entry .biome", ".spawn-entry .cond"].map((s) => r.container.querySelectorAll(s).length);
    r.unmount();
    return out;
  }

  it("fishing chips do not change the counts the e2e relies on", async () => {
    const staryu = species(120);
    const plain: SpeciesDetail = { ...staryu, spawns: staryu.spawns.map((s: SpawnEntry) => ({ ...s, fishing: null })) };
    const r = render(<WherePanel detail={staryu} />);
    await waitFor(() => expect(r.container.querySelectorAll("[data-bait-berry]").length).toBe(2));
    expect(r.container.querySelectorAll("[data-fishing]").length).toBeGreaterThan(0);
    r.unmount();
    expect(counts(staryu)).toEqual(counts(plain));
  });

  it("the block sits between the spawn list and the drops", async () => {
    const r = render(<WherePanel detail={species(6)} />);
    await waitFor(() => expect(r.container.querySelectorAll("[data-bait-berry]").length).toBe(3));
    const where = r.container.querySelector(".where")!;
    const order = [...where.children].map((c) => c.className.split(" ")[0]);
    expect(order).toEqual(["kv", "spawn-list", "bait", "drops"]);
  });

  it("no spawn: no block", () => {
    const r = render(<WherePanel detail={species(1011)} />);
    expect(r.container.querySelector("[data-bait]")).toBeNull();
  });
});
