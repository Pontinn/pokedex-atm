// pokemon-generation T1.3: rotulos do selo de geracao (RF-05 curto, RF-08 longo), selo em todo card do indice
// publicado (CA-02, CA-03), ordem dos selos no card e no Hero (CA-07, CA-08) e Badge sem label inalterado.
import { readFileSync } from "node:fs";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Badge } from "../../../src/components/Badge";
import type { SpeciesSummary } from "../../../src/data/types";
import { translate } from "../../../src/i18n/useT";
import { generationLabel, GenerationBadge } from "../../../src/screens/Dex/GenerationBadge";
import { PokemonCard, SpeciesBadges } from "../../../src/screens/Dex/PokemonCard";
import { resetCapturedStore } from "../../../src/state/captured-store";
import { resetPreferencesStore, usePreferencesStore } from "../../../src/state/preferences-store";

const VERSION = (JSON.parse(readFileSync("public/data/current.json", "utf8")) as { datasetVersion: string }).datasetVersion;
const INDEX = JSON.parse(readFileSync(`public/data/${VERSION}/species-index.json`, "utf8")) as SpeciesSummary[];
const pt = (k: string, v?: Record<string, string | number>) => translate("pt", k, v);
const en = (k: string, v?: Record<string, string | number>) => translate("en", k, v);

// tabela do requisito (RF-05 curto / RF-08 longo), escrita aqui de proposito
function expectedShort(gen: string): string | null {
  if (gen === "custom") return "Pack";
  if (gen === "gen7b") return "Gen 7 (Let's Go)";
  if (gen === "gen8a") return "Gen 8 (Arceus)";
  const m = /^gen(\d+)$/.exec(gen);
  return m ? `Gen ${m[1]}` : null;
}

const RARITY_CLASSES = ["badge-common", "badge-uncommon", "badge-rare", "badge-ultra"];

function sp(overrides: Partial<SpeciesSummary> = {}): SpeciesSummary {
  return {
    dex: 150,
    slug: "mewtwo",
    name: { pt: "Mewtwo", en: "Mewtwo" },
    searchKey: "mewtwo",
    types: ["psychic"],
    generation: "gen1",
    labels: ["legendary"],
    bst: 680,
    rarity: { primary: "ultra-rare", secondary: [] },
    evolutionMethods: ["none"],
    hasSprite: true,
    artworkId: 150,
    games: [1],
    ...overrides,
  };
}

beforeEach(() => {
  resetPreferencesStore();
  resetCapturedStore();
});
afterEach(() => cleanup());

describe("generationLabel", () => {
  it("short and long labels follow the requirement table in PT and EN", () => {
    for (const t of [pt, en]) {
      expect(generationLabel("gen1", "short", t)).toBe("Gen 1");
      expect(generationLabel("gen9", "short", t)).toBe("Gen 9");
      expect(generationLabel("gen10", "short", t)).toBe("Gen 10");
      expect(generationLabel("gen7b", "short", t)).toBe("Gen 7 (Let's Go)");
      expect(generationLabel("gen8a", "short", t)).toBe("Gen 8 (Arceus)");
      expect(generationLabel("custom", "short", t)).toBe("Pack");
      expect(generationLabel("gen7b", "long", t)).toBe("Gen 7 (Let's Go)");
      expect(generationLabel("gen8a", "long", t)).toBe("Gen 8 (Arceus)");
      expect(generationLabel("custom", "long", t)).toBe("Pack");
    }
    expect(generationLabel("gen1", "long", pt)).toBe("Geração 1");
    expect(generationLabel("gen2", "long", en)).toBe("Generation 2");
  });

  it("unknown or empty value -> null (no seal, never an error)", () => {
    for (const v of ["", "gen", "genX", "gen1b", "Gen1", "custom2", "foo"]) {
      expect(generationLabel(v, "short", pt)).toBeNull();
      expect(generationLabel(v, "long", pt)).toBeNull();
    }
    for (const g of [null, undefined, "", "foo"]) {
      const { container } = render(<GenerationBadge generation={g} form="short" />);
      expect(container.innerHTML).toBe("");
    }
  });

  it("every distinct generation of the published index has both labels", () => {
    const gens = [...new Set(INDEX.map((s) => s.generation))];
    expect(gens.length).toBeGreaterThan(0);
    for (const g of gens) {
      expect(generationLabel(g, "short", pt), g).not.toBeNull();
      expect(generationLabel(g, "long", pt), g).not.toBeNull();
    }
  });
});

describe("generation seal on cards (published index)", () => {
  it("every card of the 1027 species shows the expected short seal and no rarity class", () => {
    const onOpen = vi.fn();
    for (const s of INDEX) {
      const { container, unmount } = render(<PokemonCard species={s} onOpen={onOpen} />);
      const seal = container.querySelectorAll(".badge-gen");
      expect(seal.length, `dex ${s.dex}`).toBe(1);
      expect(seal[0]!.textContent, `dex ${s.dex}`).toBe(expectedShort(s.generation));
      for (const cls of RARITY_CLASSES) expect(container.querySelector(`.${cls}`), `dex ${s.dex} ${cls}`).toBeNull();
      unmount();
    }
    expect(INDEX.length).toBe(1027);
  });
});

describe("SpeciesBadges order", () => {
  const classes = (root: HTMLElement) => [...root.querySelectorAll(".badge")].map((el) => el.className);

  it("card = [special?, generation]; hero = [special?, long generation, rarity?]", () => {
    const { container: card } = render(<SpeciesBadges species={sp()} variant="card" />);
    expect(classes(card)).toEqual(["badge badge-legendary", "badge badge-gen"]);
    const { container: hero } = render(<SpeciesBadges species={sp()} variant="hero" />);
    expect(classes(hero)).toEqual(["badge badge-legendary", "badge badge-gen", "badge badge-ultra"]);
    expect(hero.querySelector(".badge-gen")!.textContent).toBe("Geração 1");
    const { container: plainCard } = render(<SpeciesBadges species={sp({ labels: [], rarity: { primary: "common", secondary: [] } })} variant="card" />);
    expect(classes(plainCard)).toEqual(["badge badge-gen"]);
    const { container: plainHero } = render(<SpeciesBadges species={sp({ labels: [], rarity: { primary: null, secondary: [] } })} variant="hero" />);
    expect(classes(plainHero)).toEqual(["badge badge-gen"]);
    const { container: mythic } = render(<SpeciesBadges species={sp({ labels: ["mythical"], generation: "gen7b" })} variant="card" />);
    expect(classes(mythic)).toEqual(["badge badge-mythical", "badge badge-gen"]);
    expect(mythic.querySelector(".badge-gen")!.textContent).toBe("Gen 7 (Let's Go)");
  });

  it("hero long label follows the UI language (EN)", () => {
    usePreferencesStore.setState({ uiLanguage: "en" });
    const { container } = render(<SpeciesBadges species={sp()} variant="hero" />);
    expect(container.querySelector(".badge-gen")!.textContent).toBe("Generation 1");
  });
});

describe("Badge label", () => {
  it("without label: no role and no aria-label (same HTML as before); with label: role img + aria-label", () => {
    const { container: plain } = render(<Badge className="badge-rare">{"x"}</Badge>);
    expect(plain.innerHTML).toBe('<span class="badge badge-rare">x</span>');
    const { container: named } = render(<Badge className="badge-gen" label="Geração 1">{"Gen 1"}</Badge>);
    const el = named.querySelector(".badge")!;
    expect(el.getAttribute("role")).toBe("img");
    expect(el.getAttribute("aria-label")).toBe("Geração 1");
  });
});
