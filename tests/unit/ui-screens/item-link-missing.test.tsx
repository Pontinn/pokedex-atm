// U9 (pwa-auto-update): id de item fora do items.json vira texto simples (sem link para pagina inexistente) em
// ItemLink (ficha), ItemChip (Treinadores) e no metodo da EvolutionPanel; id presente segue link. Aresta de troca:
// o `requiredItem` e a especie parceira ("Troca com Shelmet"), link para a ficha quando a especie existe.
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EvolutionChain, EvolutionEdge, ItemInfo, ItemsFile, SpeciesSummary } from "../../../src/data/types";

function item(id: string, pt: string, en: string): ItemInfo {
  const path = id.slice(id.indexOf(":") + 1);
  return {
    id,
    namespace: id.slice(0, id.indexOf(":")),
    path,
    name: { pt, en },
    description: null,
    category: "other",
    texture: null,
    tags: [],
    obtain: [],
    usedIn: { evolutions: [], fossils: [], forms: [], ball: false },
    cooking: null,
  };
}

const items: ItemsFile = {
  "cobblemon:shell_helmet": item("cobblemon:shell_helmet", "Capacete de Casco", "Shell Helmet"),
  "cobblemon:thunder_stone": item("cobblemon:thunder_stone", "Pedra do Trovao", "Thunder Stone"),
};

vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  return { ...real, loadItems: async () => items };
});

const { ItemLink, hasItemPage } = await import("../../../src/screens/Detail/ItemLink");
const { ItemChip } = await import("../../../src/screens/Trainers/TrainerTeam");
const { EvolutionPanel, methodParts } = await import("../../../src/screens/Detail/EvolutionPanel");
const { configureAudio } = await import("../../../src/audio/sfx");
const { translate } = await import("../../../src/i18n/useT");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore } = await import("../../../src/state/preferences-store");

function species(dex: number, slug: string, name: string): SpeciesSummary {
  return { dex, slug, name: { pt: name, en: name }, searchKey: slug, types: ["bug"] } as unknown as SpeciesSummary;
}

const edge = (p: Partial<EvolutionEdge>): EvolutionEdge => ({ id: "e", from: 588, to: 589, toSlug: "escavalier", variant: "level_up", requiredItem: null, requirements: [], ...p });

function chain(edges: EvolutionEdge[]): EvolutionChain {
  return {
    root: 588,
    nodes: [
      { dex: 588, slug: "karrablast", name: { pt: "Karrablast", en: "Karrablast" }, types: ["bug"] },
      { dex: 589, slug: "escavalier", name: { pt: "Escavalier", en: "Escavalier" }, types: ["bug", "steel"] },
    ],
    edges,
  } as EvolutionChain;
}

const current = () => useNavigationStore.getState().current;

beforeEach(() => {
  configureAudio(() => {
    const el = new EventTarget() as unknown as HTMLAudioElement;
    Object.assign(el, { paused: true, currentTime: 0, play: () => Promise.resolve(), pause() {} });
    return el;
  });
  resetDatasetStore();
  resetNavigationStore();
  resetPreferencesStore();
  useDatasetStore.setState({
    status: "ready",
    ready: true,
    speciesIndex: [species(588, "karrablast", "Karrablast"), species(589, "escavalier", "Escavalier"), species(616, "shelmet", "Shelmet")],
  });
});

afterEach(() => cleanup());

describe("hasItemPage", () => {
  it("catalogo carregando conta como pagina; carregado, so ids presentes", () => {
    expect(hasItemPage(null, "x:y")).toBe(true);
    expect(hasItemPage(items, "cobblemon:shell_helmet")).toBe(true);
    expect(hasItemPage(items, "mega_showdown:darkinium-z")).toBe(false);
    expect(hasItemPage(items, "toString")).toBe(false);
  });
});

describe("ItemLink (ficha)", () => {
  it("id fora do items.json: texto com nome humanizado, sem botao", () => {
    const { container } = render(<ItemLink id="mega_showdown:darkinium-z" items={items} lang="pt" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector("[data-item-missing]")?.textContent).toBe("Darkinium-Z");
  });
  it("id presente: botao que abre a pagina do item", () => {
    render(<ItemLink id="cobblemon:shell_helmet" items={items} lang="pt" />);
    fireEvent.click(screen.getByRole("button", { name: /Capacete de Casco/ }));
    expect(current().screen).toBe("item");
    expect(current().params).toEqual({ itemId: "cobblemon:shell_helmet" });
  });
});

describe("ItemChip (Treinadores)", () => {
  it("id fora do items.json: chip sem link, com quantidade", () => {
    const { container } = render(<ItemChip id="allthemons:badge" items={items} lang="pt" quantity={2} />);
    expect(screen.queryByRole("button")).toBeNull();
    const chip = container.querySelector('[data-item-missing="allthemons:badge"]');
    expect(chip?.textContent).toBe("Badge x2");
    expect(chip?.className).not.toContain("it-link");
  });
  it("id presente: botao que abre a pagina do item", () => {
    render(<ItemChip id="cobblemon:thunder_stone" items={items} lang="en" />);
    fireEvent.click(screen.getByRole("button", { name: /Thunder Stone/ }));
    expect(current().screen).toBe("item");
    expect(current().params).toEqual({ itemId: "cobblemon:thunder_stone" });
  });
});

describe("EvolutionPanel", () => {
  it("troca com especie do dataset: 'Troca com Shelmet' com link para a ficha, sem link de item", async () => {
    const { container } = render(<EvolutionPanel chain={chain([edge({ variant: "trade", requiredItem: "shelmet" })])} currentDex={588} />);
    await waitFor(() => expect(container.querySelector('[data-species="shelmet"]')).not.toBeNull());
    expect(container.querySelector("[data-edge]")?.textContent).toBe("Troca com Shelmet");
    expect(container.querySelector("[data-item]")).toBeNull();
    fireEvent.click(container.querySelector('[data-species="shelmet"]') as HTMLElement);
    expect(current().screen).toBe("detail");
    expect(current().params).toEqual({ dex: 616 });
  });
  it("troca com parceiro fora do dataset: texto simples", async () => {
    useDatasetStore.setState({ speciesIndex: [species(588, "karrablast", "Karrablast"), species(589, "escavalier", "Escavalier")] });
    const { container } = render(<EvolutionPanel chain={chain([edge({ variant: "trade", requiredItem: "shelmet" })])} currentDex={588} />);
    expect(container.querySelector('[data-partner="shelmet"]')?.textContent).toBe("Shelmet");
    expect(container.querySelector("[data-edge] button")).toBeNull();
  });
  it("item fora do items.json: texto simples; item presente: link para a pagina do item", async () => {
    const { container } = render(
      <EvolutionPanel
        chain={chain([
          edge({ id: "a", variant: "item_interact", requiredItem: "cobblemon:shell_helmet" }),
          edge({ id: "b", variant: "item_interact", requiredItem: "mega_showdown:baxcalibrite" }),
        ])}
        currentDex={588}
      />,
    );
    await waitFor(() => expect(container.querySelector('[data-item-missing="mega_showdown:baxcalibrite"]')).not.toBeNull());
    expect(container.querySelector('[data-edge="b"] button')).toBeNull();
    fireEvent.click(container.querySelector('[data-edge="a"] button[data-item="cobblemon:shell_helmet"]') as HTMLElement);
    expect(current().screen).toBe("item");
    expect(current().params).toEqual({ itemId: "cobblemon:shell_helmet" });
  });
  it("methodParts: troca com parceiro vira 'Troca com <nome>' (Como obter da ficha)", () => {
    const t = (k: string, v?: Record<string, string | number>) => translate("pt", k, v);
    expect(methodParts(edge({ variant: "trade", requiredItem: "shelmet" }), t, "pt", (i) => i, () => "Shelmet")).toEqual(["Troca com Shelmet"]);
    expect(methodParts(edge({ variant: "trade", requiredItem: "shelmet" }), t, "pt", (i) => i)).toEqual(["Troca com Shelmet"]);
    expect(methodParts(edge({ variant: "trade" }), t, "pt", (i) => i)).toEqual(["Troca"]);
  });
});
