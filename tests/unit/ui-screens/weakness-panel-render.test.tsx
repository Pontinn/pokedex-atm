// T1: WeaknessPanel (src/screens/Detail/WeaknessPanel.tsx, F4.2): o seletor Todos/Fraquezas/Resistencias
// (current.ui.weakFilter) filtra a grade renderizada sem remontar o painel inteiro.
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { WeaknessPanel } from "../../../src/screens/Detail/WeaknessPanel";
import { resetNavigationStore } from "../../../src/navigation/navigation-store";
import { useNavigationStore } from "../../../src/navigation/navigation-store";
import { resetPreferencesStore } from "../../../src/state/preferences-store";

describe("WeaknessPanel", () => {
  beforeEach(() => {
    resetNavigationStore();
    resetPreferencesStore();
    useNavigationStore.getState().navigate("detail", { dex: 6 });
  });
  afterEach(() => cleanup());

  it("Todos mostra todos os grupos; Fraquezas so > x1; Resistencias so < x1 (Charizard fogo/voador)", () => {
    render(<WeaknessPanel types={["fire", "flying"]} />);
    // Todos: Rock x4, Water/Electric x2, Fire x1/2, Ground x0 (mais outros grupos de resistencia)
    expect(document.querySelectorAll(".weak-row").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText("x4")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Fraquezas" }));
    let mults = [...document.querySelectorAll(".weak-row")].map((r) => r.getAttribute("data-mult"));
    expect(mults.sort()).toEqual(["2", "4"]);

    fireEvent.click(screen.getByRole("button", { name: "Resistências" }));
    mults = [...document.querySelectorAll(".weak-row")].map((r) => r.getAttribute("data-mult"));
    expect(mults).not.toContain("4");
    expect(mults).not.toContain("2");
    expect(mults.length).toBeGreaterThan(0);
  });

  it("persiste o filtro em current.ui.weakFilter (RF-18) e o TermsToggle do card 'weak' esta presente", () => {
    render(<WeaknessPanel types={["water"]} />);
    fireEvent.click(screen.getByRole("button", { name: "Fraquezas" }));
    expect((useNavigationStore.getState().current.ui as { weakFilter: string }).weakFilter).toBe("weak");
    expect(document.querySelector('[data-tcard="weak"]')).not.toBeNull();
  });

  it("tipo Normal: unica fraqueza e Lutador (x2)", () => {
    render(<WeaknessPanel types={["normal"]} />);
    fireEvent.click(screen.getByRole("button", { name: "Fraquezas" }));
    const rows = document.querySelectorAll(".weak-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]?.getAttribute("data-mult")).toBe("2");
  });

  it("grade vazia (sem multiplicadores diferentes de x1) mostra o traco '-'", () => {
    render(<WeaknessPanel types={[]} />);
    expect(document.querySelectorAll(".weak-row")).toHaveLength(0);
    expect(screen.getByText("-")).toBeTruthy();
  });
});
