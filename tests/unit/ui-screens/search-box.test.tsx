// T1: SearchBox (src/screens/Home/SearchBox.tsx, F2.1): busca vazia (sem resultados) mostra o estado vazio
// inline "home.noResults", enquanto texto vazio nao abre o dropdown.
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchBox, SEARCH_DEBOUNCE_MS } from "../../../src/screens/Home/SearchBox";
import { resetDatasetStore, useDatasetStore } from "../../../src/state/dataset-store";
import { resetNavigationStore, useNavigationStore } from "../../../src/navigation/navigation-store";
import type { SpeciesSummary } from "../../../src/data/types";

const charizard: SpeciesSummary = {
  dex: 6,
  slug: "charizard",
  name: { pt: "Charizard", en: "Charizard" },
  searchKey: "charizard",
  types: ["fire", "flying"],
  generation: "gen1",
  labels: [],
  bst: 534,
  rarity: { primary: null, secondary: [] },
  evolutionMethods: ["level"],
  hasSprite: true,
  artworkId: 6,
};

describe("SearchBox", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetDatasetStore();
    resetNavigationStore();
    useDatasetStore.setState({ speciesIndex: [charizard] });
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("texto vazio nao abre o dropdown", () => {
    render(<SearchBox />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("busca sem correspondencia mostra o estado vazio 'Nenhum Pokémon encontrado para \"xyz\"'", () => {
    render(<SearchBox />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "xyz" } });
    act(() => void vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText('Nenhum Pokémon encontrado para "xyz"')).toBeTruthy();
    expect(screen.queryByRole("option")).toBeNull();
  });

  it("busca com correspondencia mostra o resultado e Enter navega para a ficha", () => {
    render(<SearchBox />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "charizard" } });
    act(() => void vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(screen.getByRole("option", { name: /Charizard/ })).toBeTruthy();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(useNavigationStore.getState().current.screen).toBe("detail");
    expect(useNavigationStore.getState().current.params).toEqual({ dex: 6 });
  });

  it("dataset ainda carregando: input desabilitado com spinner", () => {
    useDatasetStore.setState({ speciesIndex: null });
    render(<SearchBox />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
