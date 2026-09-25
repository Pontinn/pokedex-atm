// T1: MovesPanel/MovesTable (src/screens/Detail/MovesPanel.tsx, F4.4): aba vazia mostra EmptyState
// ("moves.empty"), skeleton enquanto moves.json carrega e erro inline com retry na falha do loader.
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MoveInfo, MovesFile, SpeciesMoves } from "../../../src/data/types";
import { resetNavigationStore, useNavigationStore } from "../../../src/navigation/navigation-store";
import { resetPreferencesStore } from "../../../src/state/preferences-store";

const loaderState = { impl: null as null | (() => Promise<MovesFile>) };
vi.mock("../../../src/data/loaders", () => ({
  loadMoves: () => loaderState.impl!(),
}));

const { MovesPanel } = await import("../../../src/screens/Detail/MovesPanel");

const ember: MoveInfo = {
  id: "ember",
  name: { pt: "Incinerar", en: "Ember" },
  description: { pt: "Chamas fracas.", en: "Weak flames." },
  type: "fire",
  category: "special",
  power: 40,
  accuracy: 100,
  pp: 25,
  pokeapiId: 52,
};
const file: MovesFile = { ember };
const moves: SpeciesMoves = { level: [{ level: 5, move: "ember" }], tm: [], egg: [], tutor: [] };

describe("MovesPanel", () => {
  beforeEach(() => {
    resetNavigationStore();
    resetPreferencesStore();
    useNavigationStore.getState().navigate("detail", { dex: 6 });
    loaderState.impl = async () => file;
  });
  afterEach(() => cleanup());

  it("enquanto moves.json carrega, mostra skeleton", () => {
    loaderState.impl = () => new Promise(() => {});
    render(<MovesPanel moves={moves} />);
    expect(document.querySelector(".skeleton")).not.toBeNull();
  });

  it("aba Ovo vazia (sem golpes) mostra o estado vazio moves.empty", async () => {
    render(<MovesPanel moves={moves} />);
    await screen.findByText("Incinerar");
    fireEvent.click(screen.getByRole("tab", { name: "Ovo" }));
    expect(await screen.findByText("Nenhum golpe nesta categoria.")).toBeTruthy();
    expect(document.querySelector(".empty-state")).not.toBeNull();
  });

  it("aba Nivel com golpes renderiza a tabela; clicar na linha com descricao abre o texto", async () => {
    render(<MovesPanel moves={moves} />);
    const row = await screen.findByText("Incinerar");
    const tr = row.closest("tr")!;
    expect(tr.className).not.toContain("open");
    fireEvent.click(tr);
    expect(tr.className).toContain("open");
  });

  it("falha no loadMoves mostra erro inline com retry", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    loaderState.impl = async () => {
      throw new Error("network");
    };
    render(<MovesPanel moves={moves} />);
    const alert = await screen.findByRole("alert");
    expect(alert).toBeTruthy();
    loaderState.impl = async () => file;
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /tentar/i }));
    });
    await waitFor(() => expect(screen.getByText("Incinerar")).toBeTruthy());
  });
});
