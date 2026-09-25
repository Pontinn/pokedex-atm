// T1: PokemonCard (src/screens/Dex/PokemonCard.tsx, F3.1): especie custom sem sprite usa o placeholder da
// pokebola (SpeciesSprite); selos Lendario/Mitico e raridade; marca de capturado; onOpen no clique.
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PokemonCard, specialLabel } from "../../../src/screens/Dex/PokemonCard";
import { resetPreferencesStore } from "../../../src/state/preferences-store";
import { resetCapturedStore, useCapturedStore } from "../../../src/state/captured-store";
import type { SpeciesSummary } from "../../../src/data/types";

function species(overrides: Partial<SpeciesSummary> = {}): SpeciesSummary {
  return {
    dex: 9901,
    slug: "creepyon",
    name: { pt: "Creepyon", en: "Creepyon" },
    searchKey: "creepyon",
    types: ["ghost"],
    generation: "custom",
    labels: ["custom"],
    bst: 400,
    rarity: { primary: null, secondary: [] },
    evolutionMethods: ["none"],
    hasSprite: false,
    artworkId: null,
    ...overrides,
  };
}

describe("PokemonCard", () => {
  beforeEach(() => {
    resetPreferencesStore();
    resetCapturedStore();
  });
  afterEach(() => cleanup());

  it("especie custom sem sprite usa o placeholder (sprite-fallback), nunca imagem quebrada", () => {
    const { container } = render(<PokemonCard species={species()} onOpen={vi.fn()} />);
    const img = container.querySelector(".pcard-art img") as HTMLImageElement;
    expect(img.className).toContain("sprite-fallback");
    expect(img.src).toContain("pokeball");
  });

  it("clique no card chama onOpen com o dex", () => {
    const onOpen = vi.fn();
    const { container } = render(<PokemonCard species={species({ dex: 6 })} onOpen={onOpen} />);
    fireEvent.click(container.querySelector(".pcard")!);
    expect(onOpen).toHaveBeenCalledWith(6);
  });

  it("lendario prevalece sobre mitico (specialLabel) e mostra o selo", () => {
    expect(specialLabel(["legendary", "mythical"])).toBe("legendary");
    expect(specialLabel(["mythical"])).toBe("mythical");
    expect(specialLabel([])).toBeNull();
    const { container } = render(<PokemonCard species={species({ labels: ["legendary", "mythical"], dex: 150 })} onOpen={vi.fn()} />);
    expect(container.querySelector(".badge-legendary")).not.toBeNull();
    expect(container.querySelector(".badge-mythical")).toBeNull();
  });

  it("badge de raridade so aparece quando primary != null", () => {
    const { container: none } = render(<PokemonCard species={species()} onOpen={vi.fn()} />);
    expect(none.querySelector('[class*="badge-"]')).toBeNull();
    const { container: rare } = render(
      <PokemonCard species={species({ dex: 7, rarity: { primary: "rare", secondary: [] } })} onOpen={vi.fn()} />,
    );
    expect(rare.querySelector(".badge-rare")).not.toBeNull();
  });

  it("marca de capturado so aparece quando o dex esta em captured-store", () => {
    const { container: notCaught } = render(<PokemonCard species={species({ dex: 4 })} onOpen={vi.fn()} />);
    expect(notCaught.querySelector(".caught-mark")).toBeNull();
    useCapturedStore.setState({ entries: { "4": { capturedAt: Date.now() } } });
    const { container: caught } = render(<PokemonCard species={species({ dex: 4 })} onOpen={vi.fn()} />);
    expect(caught.querySelector(".caught-mark")).not.toBeNull();
  });

  it("footer opcional (Capturados: data + desmarcar) so renderiza quando fornecido", () => {
    const { container: without } = render(<PokemonCard species={species()} onOpen={vi.fn()} />);
    expect(without.querySelector(".pcard-foot")).toBeNull();
    const { container: withFooter } = render(
      <PokemonCard species={species({ dex: 1 })} onOpen={vi.fn()} footer={<span data-testid="rodape" />} />,
    );
    expect(withFooter.querySelector(".pcard-foot")?.querySelector('[data-testid="rodape"]')).not.toBeNull();
  });
});
