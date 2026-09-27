// Cobertura das telas (2026-09-27): DetailScreen montada inteira (hero + 8 paineis) com os loaders mockados,
// ficha real do Charizard (tests/fixtures/rules-storage/species-6.json) e stores de usuario em memoria.
// Cobre estados notFound/erro/carregando, efeitos de abertura (historico, grito, som de evolucao), Capturei,
// time, shiny em current.ui.shiny, calculadora aberta por current.ui.calcOpen e a recomendacao RF-110.
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BallsFile, SpeciesDetail, SpeciesSummary } from "../../../src/data/types";
import speciesJson from "../../fixtures/rules-storage/species-6.json";
import ballsJson from "../../fixtures/rules-storage/balls.json";

const charizard = speciesJson as unknown as SpeciesDetail;
const loaderState = { species: null as null | ((dex: number) => Promise<SpeciesDetail>) };

vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  return {
    ...real,
    loadSpecies: (dex: number) => loaderState.species!(dex),
    loadMoves: async () => ({}),
    loadAbilities: async () => ({
      blaze: { id: "blaze", name: { pt: "Chama", en: "Blaze" }, description: { pt: "Fogo forte.", en: "Strong fire." } },
    }),
    loadItems: async () => ({}),
    loadBalls: async () => ballsJson as unknown as BallsFile,
    loadBiomes: async () => ({}),
  };
});

const { DetailScreen, CRY_DELAY_MS } = await import("../../../src/screens/Detail/DetailScreen");
const { configureAudio } = await import("../../../src/audio/sfx");
const { translate } = await import("../../../src/i18n/useT");
const { MemoryAdapter } = await import("../../../src/storage");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore, usePreferencesStore } = await import("../../../src/state/preferences-store");
const { resetCapturedStore, setUserStoreStorage, useCapturedStore } = await import("../../../src/state/captured-store");
const { resetTeamStore, useTeamStore } = await import("../../../src/state/team-store");
const { resetHistoryStore, useHistoryStore } = await import("../../../src/state/history-store");

const tr = (key: string, vars?: Record<string, string | number>) => translate("pt", key, vars);
let played: string[] = [];

function summary(dex: number): SpeciesSummary {
  return { ...charizard, dex } as SpeciesSummary;
}

function renderDetail(dex = 6) {
  useNavigationStore.getState().navigate("detail", { dex });
  return render(<DetailScreen entryId={1} params={{ dex }} />);
}

function byId(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} ausente`);
  return el;
}

function detailUi() {
  return useNavigationStore.getState().current.ui as { shiny: boolean; calcOpen: boolean; calcInputs: Record<string, unknown> };
}

beforeEach(async () => {
  played = [];
  configureAudio((src) => {
    const el = new EventTarget() as unknown as HTMLAudioElement;
    Object.assign(el, { paused: true, currentTime: 0, play: () => (played.push(src), Promise.resolve()), pause() {} });
    return el;
  });
  const storage = new MemoryAdapter();
  await storage.init();
  setUserStoreStorage(storage);
  resetCapturedStore();
  resetTeamStore();
  resetHistoryStore();
  resetDatasetStore();
  resetNavigationStore();
  resetPreferencesStore();
  useDatasetStore.setState({ status: "ready", ready: true, speciesIndex: [4, 5, 6].map(summary) });
  loaderState.species = async () => charizard;
});

afterEach(() => {
  cleanup();
  configureAudio(null);
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("DetailScreen", () => {
  it("dex fora do indice mostra detail.notFound sem pedir a ficha", () => {
    const spy = vi.fn(async () => charizard);
    loaderState.species = spy;
    renderDetail(999);
    expect(screen.getByText(tr("detail.notFound"))).toBeTruthy();
    expect(spy).not.toHaveBeenCalled();
  });

  it("enquanto a ficha carrega mostra o skeleton do hero; falha mostra erro inline e o retry recarrega", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    let fail = true;
    loaderState.species = async () => {
      if (fail) throw new Error("network");
      return charizard;
    };
    renderDetail();
    expect(document.querySelector(".hero-skeleton[aria-busy='true']")).not.toBeNull();
    const alert = await screen.findByRole("alert");
    expect(alert).toBeTruthy();
    fail = false;
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /tentar/i }));
    });
    await waitFor(() => expect(document.querySelector(".hero-card[data-dex='6']")).not.toBeNull());
  });

  it("renderiza hero e todos os paineis da ficha; abrir registra historico e toca evolucao + grito apos o atraso", async () => {
    renderDetail();
    await waitFor(() => expect(document.querySelector(".hero-card")).not.toBeNull());
    expect(screen.getByRole("heading", { level: 2, name: "Charizard" })).toBeTruthy();
    for (const id of ["evo-panel", "abilities-panel", "where-panel", "best-panel", "forms-panel", "calc"]) {
      expect(document.getElementById(id), id).not.toBeNull();
    }
    await waitFor(() => expect(useHistoryStore.getState().entries.map((e) => e.dex)).toEqual([6]));
    expect(played.some((s) => s.includes("evolution_notification"))).toBe(true);
    await waitFor(() => expect(played.some((s) => s.includes("charizard"))).toBe(true), { timeout: CRY_DELAY_MS + 1000 });
    // habilidade carregada do abilities.json mockado
    await waitFor(() => expect(document.querySelector("[data-ability='blaze'] .ab-desc")?.textContent).toBe("Fogo forte."));
    // habilidade ausente no abilities.json cai no id humanizado
    expect(document.querySelector("[data-ability='solarpower'] .ab-name")?.textContent).toContain("Solarpower");
    // melhores pokebolas: ranking aparece depois do loadBalls
    await waitFor(() => expect(document.querySelectorAll(".best-ball").length).toBeGreaterThan(0));
  });

  it("som desligado: abre a ficha sem tocar grito nem som de evolucao", async () => {
    usePreferencesStore.setState({ soundEnabled: false });
    renderDetail();
    await waitFor(() => expect(document.querySelector(".hero-card")).not.toBeNull());
    await new Promise((r) => setTimeout(r, CRY_DELAY_MS + 50));
    expect(played.filter((s) => s.includes("charizard") || s.includes("evolution_notification"))).toEqual([]);
  });

  it("shiny alterna current.ui.shiny; botao Adicionar ao time grava no time e vira No time", async () => {
    renderDetail();
    const shiny = await waitFor(() => byId("shiny-btn"));
    expect(shiny.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(shiny);
    expect(detailUi().shiny).toBe(true);
    expect(document.getElementById("shiny-btn")!.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(document.getElementById("btn-team")!);
    await waitFor(() => expect(useTeamStore.getState().slots).toContain(6));
    await waitFor(() => expect(document.getElementById("btn-team")!.textContent).toContain(tr("detail.inTeam")));
    fireEvent.click(document.getElementById("btn-team")!);
    await waitFor(() => expect(useTeamStore.getState().slots).not.toContain(6));
  });

  it("Capturei abre o overlay de captura; ja capturado pede confirmacao e Desmarcar remove", async () => {
    renderDetail();
    const caught = await waitFor(() => byId("btn-caught"));
    fireEvent.click(caught);
    expect(screen.getByRole("dialog")).toBeTruthy();
    // segundo clique com o overlay aberto nao abre outro
    fireEvent.click(caught);
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    cleanup();

    await act(async () => {
      await useCapturedStore.getState().mark(6);
    });
    renderDetail();
    await waitFor(() => expect(document.getElementById("btn-caught")!.getAttribute("aria-pressed")).toBe("true"));
    fireEvent.click(document.getElementById("btn-caught")!);
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: tr("detail.unmark") }));
    await waitFor(() => expect(useCapturedStore.getState().entries["6"]).toBeUndefined());
  });

  it("calculadora aberta (current.ui.calcOpen) mostra saida e recomendacao; Aplicar grava natureza/IVs/EVs em calcInputs", async () => {
    renderDetail();
    await waitFor(() => expect(document.getElementById("calc")).not.toBeNull());
    expect(document.getElementById("calc-out")).toBeNull();
    act(() => useNavigationStore.getState().updateUi<"detail">({ calcOpen: true }));
    expect(document.getElementById("calc-out")).not.toBeNull();
    expect(document.getElementById("type-calc")).not.toBeNull();
    const rec = document.getElementById("calc-rec")!;
    expect(rec.getAttribute("data-role")).toBeTruthy();
    fireEvent.click(within(rec).getByRole("button", { name: tr("calc.apply") }));
    const inputs = detailUi().calcInputs;
    expect(typeof inputs.nature).toBe("string");
    expect(Object.keys(inputs).filter((k) => k.startsWith("ev.")).length).toBe(6);

    fireEvent.change(document.getElementById("c-lv")!, { target: { value: "150" } });
    expect(detailUi().calcInputs.level).toBe(100);
  });

  it("Voltar volta para a tela anterior da pilha", async () => {
    useNavigationStore.getState().navigate("dex", {});
    renderDetail();
    fireEvent.click(screen.getByRole("button", { name: tr("detail.back") }));
    expect(useNavigationStore.getState().current.screen).toBe("dex");
  });
});
