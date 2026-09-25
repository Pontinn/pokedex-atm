// F1.4: shell (sidebar, tab bar, sheet "Mais"), boot com o dataset mockado e registro completo de telas.
// Nao depende do dataset real: os loaders sao mockados.
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";


const loaderState = { fail: null as null | "NOT_FOUND" };

vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  const manifest = (await import("../../fixtures/ui-shell/manifest.json")).default;
  return {
    ...real,
    loadManifest: vi.fn(async () => {
      if (loaderState.fail) throw new real.DatasetError(loaderState.fail, "/data/current.json", "not found");
      return manifest;
    }),
    loadSpeciesIndex: vi.fn(async () => []),
    loadTypeChart: vi.fn(async () => ({ attackers: [], matrix: [] })),
    // a tela real de Treinadores (F8) carrega as series ao abrir
    loadSeries: vi.fn(async () => []),
  };
});

const { App } = await import("../../../src/App");
const { resetBootSplash } = await import("../../../src/components/BootSplash");
const { configureAudio } = await import("../../../src/audio/sfx");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore, usePreferencesStore } = await import("../../../src/state/preferences-store");
const { useShellStore } = await import("../../../src/state/shell-store");
const { SCREENS } = await import("../../../src/screens/registry");
const { SCREEN_IDS } = await import("../../../src/navigation/types");

let played: string[] = [];

function setWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  window.dispatchEvent(new Event("resize"));
}

beforeEach(() => {
  played = [];
  loaderState.fail = null;
  configureAudio((src) => {
    const el = new EventTarget() as unknown as HTMLAudioElement;
    Object.assign(el, { paused: true, currentTime: 0, play: () => (played.push(src), Promise.resolve()) });
    return el;
  });
  resetBootSplash();
  resetDatasetStore();
  resetNavigationStore();
  resetPreferencesStore();
  useShellStore.setState({ moreOpen: false, toasts: [] });
  setWidth(1280);
});

afterEach(() => {
  cleanup();
  configureAudio(null);
});

describe("screen registry", () => {
  it("has one component per ScreenId", () => {
    expect(Object.keys(SCREENS).sort()).toEqual([...SCREEN_IDS].sort());
  });
});

describe("boot splash", () => {
  it("stays closed while loading, then plays pokedex_open once and opens", async () => {
    render(<App />);
    const boot = document.querySelector(".boot")!;
    expect(boot.getAttribute("data-phase")).toBe("closed");
    expect(played).toEqual([]);
    await act(() => useDatasetStore.getState().load());
    expect(document.querySelector(".boot")?.getAttribute("data-phase")).toBe("opening");
    expect(played).toEqual(["/assets/sfx/pokedex_open.ogg"]);
    fireEvent.animationEnd(document.querySelector(".boot-lid-top")!);
    expect(document.querySelector(".boot")).toBeNull();
  });

  it("with sound off, opening the app is silent", async () => {
    usePreferencesStore.setState({ soundEnabled: false });
    render(<App />);
    await act(() => useDatasetStore.getState().load());
    expect(played).toEqual([]);
  });

  it("missing dataset (NOT_FOUND) opens the lid and shows the 'run npm run dataset' error with retry", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    loaderState.fail = "NOT_FOUND";
    render(<App />);
    await act(() => useDatasetStore.getState().load());
    expect(useDatasetStore.getState().status).toBe("error");
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("npm run dataset");
    loaderState.fail = null;
    await act(async () => {
      fireEvent.click(within(alert).getByRole("button"));
      await useDatasetStore.getState().load();
    });
    expect(useDatasetStore.getState().status).toBe("ready");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("desktop sidebar", () => {
  it("shows every nav item, the data version from the manifest and navigates", async () => {
    render(<App />);
    await act(() => useDatasetStore.getState().load());
    const sidebar = document.querySelector(".sidebar") as HTMLElement;
    const labels = [...sidebar.querySelectorAll(".nav-item")].map((b) => b.textContent);
    expect(labels).toEqual(["Início", "Pokédex", "Capturados", "Comparar", "Treinadores", "Pokébolas", "Itens & Comidas", "Sincronizar", "Configurações"]);
    expect(sidebar.querySelector(".sidebar-version")?.textContent).toBe("Dados: All the Mons 1.3.0 / Cobblemon 1.7.3");
    fireEvent.click(within(sidebar).getByText("Treinadores"));
    expect(useNavigationStore.getState().current.screen).toBe("trainers");
    expect(within(sidebar).getByText("Treinadores").closest("button")?.className).toContain("active");
    expect(document.querySelector(".trainers-screen")).not.toBeNull();
  });

  it("toggles language, sound and theme", async () => {
    render(<App />);
    const sidebar = document.querySelector(".sidebar") as HTMLElement;
    fireEvent.click(sidebar.querySelector(".tgl-lang")!);
    expect(usePreferencesStore.getState().uiLanguage).toBe("en");
    expect(within(sidebar).getByText("Items & Food")).toBeTruthy();
    fireEvent.click(sidebar.querySelector(".tgl-sound")!);
    expect(usePreferencesStore.getState().soundEnabled).toBe(false);
    fireEvent.click(sidebar.querySelector(".tgl-theme")!);
    expect(document.documentElement.dataset.theme).toBe("black");
  });
});

describe("mobile shell", () => {
  it("uses the mobile layout under 900 px; Mais opens the sheet and a sheet item navigates and closes it", async () => {
    setWidth(390);
    render(<App />);
    const app = document.getElementById("app")!;
    expect(app.className).toContain("mobile");
    const tabbar = document.querySelector(".tabbar") as HTMLElement;
    expect([...tabbar.querySelectorAll(".tab-label")].map((l) => l.textContent)).toEqual(["Início", "Pokédex", "Capturados", "Comparar", "Mais"]);
    const sheet = document.querySelector(".more-sheet")!;
    expect(sheet.className).not.toContain("open");
    fireEvent.click(within(tabbar).getByText("Mais"));
    expect(sheet.className).toContain("open");
    expect([...sheet.querySelectorAll(".sheet-item-label")].map((l) => l.textContent)).toEqual(["Treinadores", "Pokébolas", "Itens & Comidas", "Sincronizar", "Configurações"]);
    fireEvent.click(within(sheet as HTMLElement).getByText("Pokébolas"));
    expect(useNavigationStore.getState().current.screen).toBe("balls");
    expect(sheet.className).not.toContain("open");
    fireEvent.click(within(tabbar).getByText("Capturados"));
    expect(useNavigationStore.getState().current.screen).toBe("captured");
    act(() => setWidth(1280));
    expect(app.className).not.toContain("mobile");
  });
});
