// pokemon-generation T1.3: Hero (geracao longa + raridade) e cadeia de evolucao com o selo em cada estagio, com as
// fichas REAIS do dataset publicado. O destaque esperado e DERIVADO do `generation` de cada no (LESSONS 2026-09-29):
// .evo-gen-diff sse a geracao do no difere da do no raiz (CA-11..CA-15, CA-19); indice ausente (CA-17); no sintetico
// sem geracao (CA-18); nenhum texto de jogo na cadeia (CA-16).
import { readFileSync } from "node:fs";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DatasetManifest, EvolutionChain, SpeciesDetail, SpeciesSummary } from "../../../src/data/types";

vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  return { ...real, loadItems: async () => ({}) };
});

const { EvolutionPanel } = await import("../../../src/screens/Detail/EvolutionPanel");
const { HeroCard } = await import("../../../src/screens/Detail/HeroCard");
const { configureAudio } = await import("../../../src/audio/sfx");
const { MemoryAdapter } = await import("../../../src/storage");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore, usePreferencesStore } = await import("../../../src/state/preferences-store");
const { resetCapturedStore, setUserStoreStorage } = await import("../../../src/state/captured-store");
const { resetTeamStore } = await import("../../../src/state/team-store");

const VERSION = (JSON.parse(readFileSync("public/data/current.json", "utf8")) as { datasetVersion: string }).datasetVersion;
const DIR = `public/data/${VERSION}`;
const INDEX = JSON.parse(readFileSync(`${DIR}/species-index.json`, "utf8")) as SpeciesSummary[];
const MANIFEST = JSON.parse(readFileSync(`${DIR}/dataset-manifest.json`, "utf8")) as DatasetManifest;
const detail = (dex: number) => JSON.parse(readFileSync(`${DIR}/species/${dex}.json`, "utf8")) as SpeciesDetail;

// rotulo longo do requisito (RF-08), escrito aqui de proposito
const SPECIAL: Record<string, string> = { custom: "Pack", gen7b: "Gen 7 (Let's Go)", gen8a: "Gen 8 (Arceus)" };
const longPt = (g: string) => SPECIAL[g] ?? `Geração ${g.slice(3)}`;
const longEn = (g: string) => SPECIAL[g] ?? `Generation ${g.slice(3)}`;

beforeEach(async () => {
  configureAudio(() => {
    const el = new EventTarget() as unknown as HTMLAudioElement;
    Object.assign(el, { paused: true, currentTime: 0, play: () => Promise.resolve(), pause() {} });
    return el;
  });
  const storage = new MemoryAdapter();
  await storage.init();
  setUserStoreStorage(storage);
  resetCapturedStore();
  resetTeamStore();
  resetDatasetStore();
  resetNavigationStore();
  resetPreferencesStore();
  useDatasetStore.setState({ status: "ready", ready: true, speciesIndex: INDEX, manifest: MANIFEST });
});

afterEach(() => {
  cleanup();
  configureAudio(null);
});

function renderChain(chain: EvolutionChain, currentDex: number) {
  return render(<EvolutionPanel chain={chain} currentDex={currentDex} />);
}

function checkChain(dex: number, lang: "pt" | "en" = "pt") {
  const chain = detail(dex).evolutionChain;
  const rootGen = chain.nodes.find((n) => n.dex === chain.root)!.generation;
  const { container, unmount } = renderChain(chain, dex);
  let highlighted = 0;
  for (const n of chain.nodes) {
    const boxes = [...container.querySelectorAll(`[data-evo='${n.dex}']`)];
    expect(boxes.length, `node ${n.dex}`).toBeGreaterThan(0);
    for (const box of boxes) {
      const badge = box.querySelector(".evo-gen");
      expect(badge, `node ${n.dex}`).not.toBeNull();
      const diff = n.generation !== rootGen;
      expect(badge!.classList.contains("evo-gen-diff"), `node ${n.dex}`).toBe(diff);
      const long = lang === "pt" ? longPt(n.generation) : longEn(n.generation);
      const suffix = lang === "pt" ? ", diferente da base" : ", different from the base";
      expect(badge!.getAttribute("aria-label")).toBe(diff ? `${long}${suffix}` : long);
      expect(badge!.getAttribute("role")).toBe("img");
      if (diff) highlighted++;
    }
  }
  // nenhum texto de jogo na cadeia (RF-15)
  expect(container.querySelector("[data-game], .game-chip")).toBeNull();
  const text = container.textContent ?? "";
  for (const g of MANIFEST.games) expect(text.includes(g.name), g.name).toBe(false);
  unmount();
  return { chain, highlighted };
}

describe("evolution chain generation seals (published species)", () => {
  it("Zubat, Crobat, Tyrogue, Pichu, Charmander and Eevee: highlight iff the node generation differs from the root", () => {
    for (const dex of [41, 169, 236, 172, 4, 133]) checkChain(dex);
  });

  it("derived examples: Crobat in Zubat's chain; Hitmonlee and Hitmonchan in Tyrogue's, Hitmontop not; Charmander none", () => {
    const z = renderChain(detail(41).evolutionChain, 41);
    expect(z.container.querySelector("[data-evo='169'] .evo-gen-diff")).not.toBeNull();
    expect(z.container.querySelector("[data-evo='169'] .evo-gen")!.getAttribute("aria-label")).toBe("Geração 2, diferente da base");
    expect(z.container.querySelectorAll(".evo-gen-diff").length).toBe(1);
    z.unmount();
    const ty = renderChain(detail(236).evolutionChain, 236);
    expect(ty.container.querySelector("[data-evo='106'] .evo-gen-diff")).not.toBeNull();
    expect(ty.container.querySelector("[data-evo='107'] .evo-gen-diff")).not.toBeNull();
    expect(ty.container.querySelector("[data-evo='237'] .evo-gen-diff")).toBeNull();
    expect(ty.container.querySelector("[data-evo='237'] .evo-gen")!.textContent).toBe("Gen 2");
    ty.unmount();
    expect(checkChain(4).highlighted).toBe(0);
  });

  it("EN accessible name", () => {
    usePreferencesStore.setState({ uiLanguage: "en" });
    checkChain(41, "en");
    checkChain(236, "en");
  });

  it("seals do not depend on the species index (index not loaded yet)", () => {
    useDatasetStore.setState({ speciesIndex: null });
    for (const dex of [41, 236]) checkChain(dex);
  });

  it("synthetic node renders without a seal and without error; root without generation = no highlight", () => {
    const base = detail(41).evolutionChain;
    const chain: EvolutionChain = { ...base, nodes: base.nodes.filter((n) => n.dex !== 169) };
    const { container, unmount } = renderChain(chain, 41);
    const ghost = container.querySelector("[data-evo='169']");
    expect(ghost).not.toBeNull();
    expect(ghost!.querySelector(".badge")).toBeNull();
    expect(container.querySelectorAll(".evo-gen").length).toBe(2);
    unmount();
    const noRoot: EvolutionChain = { ...base, nodes: base.nodes.filter((n) => n.dex !== 41) };
    const r = renderChain(noRoot, 42);
    expect(r.container.querySelector("[data-evo='41'] .badge")).toBeNull();
    expect(r.container.querySelectorAll(".evo-gen").length).toBe(2);
    expect(r.container.querySelector(".evo-gen-diff")).toBeNull();
  });
});

describe("hero seals (published species)", () => {
  const classes = (root: HTMLElement) => [...root.querySelectorAll(".seal .badge")].map((el) => el.className.replace("badge ", ""));

  it("Charizard: long generation + rarity; Mewtwo: legendary, generation, rarity (order)", () => {
    const { container, unmount } = render(<HeroCard detail={detail(6)} />);
    expect(container.querySelector(".seal .badge-gen")!.textContent).toBe("Geração 1");
    expect(classes(container)).toEqual(["badge-gen", "badge-ultra"]);
    expect(container.querySelector(".seal")!.classList.contains("seal-empty")).toBe(false);
    unmount();
    const m = render(<HeroCard detail={detail(150)} />);
    expect(classes(m.container)).toEqual(["badge-legendary", "badge-gen", "badge-ultra"]);
    m.unmount();
    usePreferencesStore.setState({ uiLanguage: "en" });
    const e = render(<HeroCard detail={detail(6)} />);
    expect(e.container.querySelector(".seal .badge-gen")!.textContent).toBe("Generation 1");
  });

  it("custom species shows Pack; unknown generation without rarity keeps the empty seal row", () => {
    const { container, unmount } = render(<HeroCard detail={detail(9901)} />);
    expect(container.querySelector(".seal .badge-gen")!.textContent).toBe("Pack");
    unmount();
    const odd = { ...detail(6), generation: "unknown", labels: [], rarity: { primary: null, secondary: [] } } as SpeciesDetail;
    const r = render(<HeroCard detail={odd} />);
    expect(r.container.querySelector(".seal .badge")).toBeNull();
    expect(r.container.querySelector(".seal")!.classList.contains("seal-empty")).toBe(true);
  });
});
