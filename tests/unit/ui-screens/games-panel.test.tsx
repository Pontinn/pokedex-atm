// pokemon-generation T1.3: painel "Jogos" (GamesPanel/gamesOf): ordem do catalogo, id desconhecido ignorado, estados
// "So no pack" (null) e "Nao aparece nos jogos oficiais" ([]) (CA-28), manifest ausente = nada (CA-45), lista
// semantica com rotulo, EN (CA-43) e nota so com lista.
import { readFileSync } from "node:fs";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DatasetManifest, GameInfo, SpeciesDetail } from "../../../src/data/types";
import { gamesOf, GamesPanel } from "../../../src/screens/Detail/GamesPanel";
import { resetDatasetStore, useDatasetStore } from "../../../src/state/dataset-store";
import { resetPreferencesStore, usePreferencesStore } from "../../../src/state/preferences-store";

const VERSION = (JSON.parse(readFileSync("public/data/current.json", "utf8")) as { datasetVersion: string }).datasetVersion;
const DIR = `public/data/${VERSION}`;
const MANIFEST = JSON.parse(readFileSync(`${DIR}/dataset-manifest.json`, "utf8")) as DatasetManifest;
const detail = (dex: number) => JSON.parse(readFileSync(`${DIR}/species/${dex}.json`, "utf8")) as SpeciesDetail;

const CATALOG: GameInfo[] = [
  { id: 1, slug: "red-blue", name: "Red / Blue" },
  { id: 7, slug: "firered-leafgreen", name: "FireRed / LeafGreen" },
  { id: 3, slug: "gold-silver", name: "Gold / Silver" },
];

beforeEach(() => {
  resetDatasetStore();
  resetPreferencesStore();
  useDatasetStore.setState({ status: "ready", ready: true, manifest: MANIFEST });
});
afterEach(() => cleanup());

describe("gamesOf", () => {
  it("keeps the catalog order, ignores unknown ids and null = empty", () => {
    expect(gamesOf([3, 1, 999], CATALOG).map((g) => g.id)).toEqual([1, 3]);
    expect(gamesOf([7], CATALOG)).toEqual([CATALOG[1]]);
    expect(gamesOf([], CATALOG)).toEqual([]);
    expect(gamesOf(null, CATALOG)).toEqual([]);
  });
});

describe("GamesPanel", () => {
  it("official species: semantic list in catalog order with label and the National Dex note", () => {
    const zubat = detail(41);
    const { container } = render(<GamesPanel detail={zubat} />);
    const panel = container.querySelector("#games-panel")!;
    expect(panel.querySelector("h3")!.textContent).toBe("Jogos");
    const list = panel.querySelector("ul.games-list")!;
    expect(list.getAttribute("aria-labelledby")).toBe("games-available");
    expect(panel.querySelector("#games-available")!.textContent).toBe("Disponível em");
    const want = MANIFEST.games.filter((g) => zubat.games!.includes(g.id));
    expect([...list.querySelectorAll("li.game-chip")].map((li) => li.getAttribute("data-game"))).toEqual(want.map((g) => g.slug));
    expect([...list.querySelectorAll("li")].map((li) => li.textContent)).toEqual(want.map((g) => g.name));
    expect(list.querySelector("[data-game='firered-leafgreen']")).not.toBeNull();
    expect(panel.querySelector(".games-note")!.textContent).toBe("Lista pela Pokédex regional de cada jogo; a National Dex do pós-jogo não entra");
    expect(panel.querySelector("[data-games]")).toBeNull();
  });

  it("Crobat has no FireRed / LeafGreen; Hitmonlee has it and Tyrogue does not", () => {
    const has = (dex: number) => {
      const { container, unmount } = render(<GamesPanel detail={detail(dex)} />);
      const r = container.querySelector("[data-game='firered-leafgreen']") !== null;
      unmount();
      return r;
    };
    expect(has(169)).toBe(false);
    expect(has(106)).toBe(true);
    expect(has(236)).toBe(false);
  });

  it("custom species (games null) -> exact 'Só no pack' without note", () => {
    const { container } = render(<GamesPanel detail={detail(9901)} />);
    const p = container.querySelector("[data-games='pack']")!;
    expect(p.textContent).toBe("Só no pack");
    expect(p.classList.contains("muted")).toBe(true);
    expect(container.querySelector(".games-note")).toBeNull();
    expect(container.querySelector("ul")).toBeNull();
  });

  it("official species without games ([]) -> exact 'Não aparece nos jogos oficiais' without note", () => {
    const { container } = render(<GamesPanel detail={{ ...detail(41), games: [] }} />);
    expect(container.querySelector("[data-games='none']")!.textContent).toBe("Não aparece nos jogos oficiais");
    expect(container.querySelector(".games-note")).toBeNull();
    cleanup();
    const unknownOnly = render(<GamesPanel detail={{ ...detail(41), games: [999] }} />);
    expect(unknownOnly.container.querySelector("[data-games='none']")).not.toBeNull();
  });

  it("no catalog (manifest null) -> nothing rendered", () => {
    useDatasetStore.setState({ manifest: null });
    const { container } = render(<GamesPanel detail={detail(41)} />);
    expect(container.innerHTML).toBe("");
  });

  it("EN: title, label, note and states; game names are data (same in both languages)", () => {
    usePreferencesStore.setState({ uiLanguage: "en" });
    const { container, unmount } = render(<GamesPanel detail={detail(41)} />);
    expect(container.querySelector("h3")!.textContent).toBe("Games");
    expect(container.querySelector("#games-available")!.textContent).toBe("Available in");
    expect(container.querySelector(".games-note")!.textContent).toBe("Listed by each game's regional Pokédex; the post-game National Dex is not counted");
    expect(container.querySelector("[data-game='firered-leafgreen']")!.textContent).toBe("FireRed / LeafGreen");
    unmount();
    const pack = render(<GamesPanel detail={detail(9901)} />);
    expect(pack.container.querySelector("[data-games='pack']")!.textContent).toBe("Pack only");
    cleanup();
    const none = render(<GamesPanel detail={{ ...detail(41), games: [] }} />);
    expect(none.container.querySelector("[data-games='none']")!.textContent).toBe("Not in the official games");
  });
});
