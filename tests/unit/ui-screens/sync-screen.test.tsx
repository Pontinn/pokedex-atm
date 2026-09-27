// Cobertura das telas (2026-09-27): SyncScreen montada inteira (explicacao, Gerar/Receber em current.ui.mode,
// QR com carrossel, copiar/baixar, colar codigo, frames parciais, arquivo .pdx, camera indisponivel, resumo com
// Mesclar/Substituir e Aplicar) sobre MemoryAdapter no lugar do storage do app. O codec e o real (src/sync).
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DocumentStorage } from "../../../src/storage";

const storageRef = { current: null as DocumentStorage | null };
vi.mock("../../../src/state/app-storage", () => ({
  getAppStorage: () => {
    if (!storageRef.current) throw new Error("storage not initialized");
    return storageRef.current;
  },
  initAppStorage: () => storageRef.current,
}));
// jsdom nao tem canvas 2D: o desenho do QR vira no-op (o texto do frame fica em data-qr-text)
vi.mock("qrcode", () => ({ default: { toCanvas: vi.fn(async () => undefined) } }));

const { SyncScreen } = await import("../../../src/screens/Sync/SyncScreen");
const { FRAME_INTERVAL_MS } = await import("../../../src/screens/Sync/QrFrames");
const { translate } = await import("../../../src/i18n/useT");
const { MemoryAdapter } = await import("../../../src/storage");
const { encodeSyncCode, splitFrames } = await import("../../../src/sync");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore } = await import("../../../src/state/preferences-store");
const { resetCapturedStore, setUserStoreStorage, useCapturedStore } = await import("../../../src/state/captured-store");
const { useShellStore } = await import("../../../src/state/shell-store");

const tr = (key: string, vars?: Record<string, string | number>) => translate("pt", key, vars);
const toasts = () => useShellStore.getState().toasts.map((t) => t.messageKey);
const panel = (name: string) => document.querySelector<HTMLElement>(`[data-panel='${name}']`)!;
const syncUi = () => useNavigationStore.getState().current.ui as { mode: string | null };

async function capturedDoc(storage: DocumentStorage, dexes: number[]) {
  const entries = Object.fromEntries(dexes.map((d, i) => [String(d), { capturedAt: 1_700_000_000_000 + i }]));
  await storage.write("captured", { schemaVersion: 1, entries } as never);
}

/** Codigo PDX1 real gerado de outro aparelho com os capturados informados. */
async function codeFrom(dexes: number[]) {
  const other = new MemoryAdapter();
  await other.init();
  await capturedDoc(other, dexes);
  return encodeSyncCode(await other.readAll());
}

beforeEach(async () => {
  const storage = new MemoryAdapter();
  await storage.init();
  storageRef.current = storage;
  setUserStoreStorage(storage);
  resetCapturedStore();
  resetDatasetStore();
  resetNavigationStore();
  resetPreferencesStore();
  useShellStore.setState({ toasts: [] });
  useDatasetStore.setState({ status: "ready", ready: true, speciesIndex: [] });
  useNavigationStore.getState().navigate("sync", {});
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function renderSync() {
  return render(<SyncScreen entryId={1} params={{}} />);
}

function receiveTab() {
  fireEvent.click(screen.getByRole("button", { name: tr("sync.receive") }));
  expect(syncUi().mode).toBe("receive");
}

describe("SyncScreen: gerar", () => {
  it("abre em Gerar com a explicacao; sem dados avisa sync.nothingYet e mostra 1 QR", async () => {
    renderSync();
    expect(screen.getByText(tr("sync.explainer1"))).toBeTruthy();
    expect(panel("generate")).not.toBeNull();
    await act(async () => {
      fireEvent.click(panel("generate").querySelector("[data-action='generate']")!);
    });
    await waitFor(() => expect(document.querySelector("[data-result]")).not.toBeNull());
    expect(document.querySelector("[data-nothing]")).not.toBeNull();
    expect(document.querySelector(".qr-frames")!.getAttribute("data-frames")).toBe("1");
    expect((document.getElementById("sync-code-out") as HTMLTextAreaElement).value.startsWith("PDX1.")).toBe(true);
  });

  it("com capturados gera o codigo com resumo; copiar usa a area de transferencia e mostra toast", async () => {
    await capturedDoc(storageRef.current!, [1, 4, 7]);
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderSync();
    await act(async () => {
      fireEvent.click(panel("generate").querySelector("[data-action='generate']")!);
    });
    await waitFor(() => expect(document.querySelector("[data-result]")).not.toBeNull());
    expect(document.querySelector("[data-nothing]")).toBeNull();
    expect(document.querySelector("[data-sum='captured']")!.textContent).toBe(tr("sync.sumCaptured", { n: 3 }));
    await act(async () => {
      fireEvent.click(document.querySelector("[data-action='copy']")!);
    });
    const text = (document.getElementById("sync-code-out") as HTMLTextAreaElement).value;
    expect(writeText).toHaveBeenCalledWith(text);
    expect(toasts()).toContain("sync.copied");
  });

  it("sem clipboard mostra sync.copyManual; baixar gera um .pdx", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    Object.assign(URL, { createObjectURL: vi.fn(() => "blob:x"), revokeObjectURL: vi.fn() });
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      names.push(this.download);
    });
    renderSync();
    await act(async () => {
      fireEvent.click(panel("generate").querySelector("[data-action='generate']")!);
    });
    await waitFor(() => expect(document.querySelector("[data-result]")).not.toBeNull());
    await act(async () => {
      fireEvent.click(document.querySelector("[data-action='copy']")!);
    });
    expect(screen.getByText(tr("sync.copyManual"))).toBeTruthy();
    fireEvent.click(document.querySelector("[data-action='download-pdx']")!);
    expect(names[0]).toMatch(/^pontindex-\d{4}-\d{2}-\d{2}\.pdx$/);
  });

  it("falha ao ler o storage mostra sync.applyFailed", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(storageRef.current!, "readAll").mockRejectedValue(new Error("boom"));
    renderSync();
    await act(async () => {
      fireEvent.click(panel("generate").querySelector("[data-action='generate']")!);
    });
    expect(await screen.findByRole("alert")).toBeTruthy();
  });
});

describe("SyncScreen: QrFrames", () => {
  it("varios frames: carrossel automatico e setas pausam e navegam", async () => {
    const { QrFrames } = await import("../../../src/screens/Sync/QrFrames");
    vi.useFakeTimers();
    render(<QrFrames frames={["A", "B", "C"]} />);
    const box = document.querySelector(".qr-frames")!;
    expect(box.getAttribute("data-frame-index")).toBe("1");
    act(() => void vi.advanceTimersByTime(FRAME_INTERVAL_MS));
    expect(box.getAttribute("data-frame-index")).toBe("2");
    fireEvent.click(screen.getByRole("button", { name: tr("sync.prevFrame") }));
    expect(box.getAttribute("data-frame-index")).toBe("1");
    fireEvent.click(screen.getByRole("button", { name: tr("sync.prevFrame") }));
    expect(box.getAttribute("data-frame-index")).toBe("3");
    act(() => void vi.advanceTimersByTime(FRAME_INTERVAL_MS * 3));
    expect(box.getAttribute("data-frame-index")).toBe("3");
    fireEvent.click(screen.getByRole("button", { name: tr("sync.nextFrame") }));
    expect(box.getAttribute("data-frame-index")).toBe("1");
    expect(document.querySelector("canvas")!.getAttribute("data-qr-text")).toBe("A");
  });
});

describe("SyncScreen: receber", () => {
  it("botao Receber desabilitado com texto vazio; codigo invalido mostra o erro da matriz", async () => {
    renderSync();
    receiveTab();
    const btn = panel("receive").querySelector<HTMLButtonElement>("[data-action='receive']")!;
    expect(btn.disabled).toBe(true);
    fireEvent.change(document.getElementById("sync-code-in")!, { target: { value: "PDX1.lixo" } });
    expect(btn.disabled).toBe(false);
    await act(async () => {
      fireEvent.click(btn);
    });
    await waitFor(() => expect(panel("receive").querySelector("[data-error]")).not.toBeNull());
    expect(panel("receive").querySelector("[data-error]")!.getAttribute("data-error")).toMatch(/^sync\./);
  });

  it("frame de texto que nao e PDX mostra aviso de frame invalido", async () => {
    renderSync();
    receiveTab();
    fireEvent.change(document.getElementById("sync-code-in")!, { target: { value: "PDXF.qualquer" } });
    await act(async () => {
      fireEvent.click(panel("receive").querySelector("[data-action='receive']")!);
    });
    expect(panel("receive").querySelector("[data-warn]")!.getAttribute("data-warn")).toBe("sync.invalidFrame");
  });

  it("colar codigo valido mostra resumo; Mesclar/Substituir mudam a previa; Aplicar grava, rehidrata e volta ao modo padrao", async () => {
    await capturedDoc(storageRef.current!, [25]);
    const code = await codeFrom([1, 4]);
    renderSync();
    receiveTab();
    fireEvent.change(document.getElementById("sync-code-in")!, { target: { value: code.text } });
    await act(async () => {
      fireEvent.click(panel("receive").querySelector("[data-action='receive']")!);
    });
    const summary = await waitFor(() => {
      const el = document.querySelector<HTMLElement>("[data-sync-summary]");
      if (!el) throw new Error("resumo ausente");
      return el;
    });
    expect(summary.querySelector("[data-preview]")!.textContent).toBe(tr("sync.afterMerge", { n: 3 }));
    fireEvent.click(within(summary).getByRole("button", { name: tr("sync.replace") }));
    expect(summary.querySelector("[data-preview]")!.textContent).toBe(tr("sync.afterReplace", { n: 2 }));
    await act(async () => {
      fireEvent.click(panel("receive").querySelector("[data-action='apply']")!);
    });
    await waitFor(() => expect(toasts()).toContain("sync.applied"));
    expect(Object.keys((await storageRef.current!.readOrDefault("captured")).entries).sort()).toEqual(["1", "4"]);
    await waitFor(() => expect(Object.keys(useCapturedStore.getState().entries).sort()).toEqual(["1", "4"]));
    expect(syncUi().mode).toBeNull();
  });

  it("Cancelar no resumo volta para as entradas sem gravar", async () => {
    const code = await codeFrom([3]);
    renderSync();
    receiveTab();
    fireEvent.change(document.getElementById("sync-code-in")!, { target: { value: code.text } });
    await act(async () => {
      fireEvent.click(panel("receive").querySelector("[data-action='receive']")!);
    });
    await waitFor(() => expect(document.querySelector("[data-sync-summary]")).not.toBeNull());
    fireEvent.click(panel("receive").querySelector("[data-action='cancel']")!);
    expect(document.querySelector("[data-sync-summary]")).toBeNull();
    expect((await storageRef.current!.readOrDefault("captured")).entries).toEqual({});
  });

  it("frames colados um a um mostram progresso ate completar; Cancelar zera o coletor", async () => {
    const code = await codeFrom([1, 2, 3, 4, 5, 6]);
    const frames = splitFrames(code.text, 40, "abc123");
    expect(frames.length).toBeGreaterThan(2);
    renderSync();
    receiveTab();
    const input = document.getElementById("sync-code-in")!;
    const send = async (value: string) => {
      fireEvent.change(input, { target: { value } });
      await act(async () => {
        fireEvent.click(panel("receive").querySelector("[data-action='receive']")!);
      });
    };
    await send(frames[0]!);
    expect(panel("receive").querySelector("[data-progress]")).not.toBeNull();
    fireEvent.click(panel("receive").querySelector("[data-action='cancel-frames']")!);
    expect(panel("receive").querySelector("[data-progress]")).toBeNull();
    for (const f of frames) await send(f);
    await waitFor(() => expect(document.querySelector("[data-sync-summary]")).not.toBeNull());
  });

  it("arquivo .pdx alimenta o mesmo fluxo", async () => {
    const code = await codeFrom([9]);
    renderSync();
    receiveTab();
    const file = new File([code.text], "x.pdx", { type: "text/plain" });
    Object.defineProperty(file, "text", { value: async () => code.text });
    await act(async () => {
      fireEvent.change(panel("receive").querySelector("[data-input='sync-file']")!, { target: { files: [file] } });
    });
    await waitFor(() => expect(document.querySelector("[data-sync-summary]")).not.toBeNull());
  });

  it("camera sem getUserMedia mostra o aviso de camera indisponivel", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    renderSync();
    receiveTab();
    await act(async () => {
      fireEvent.click(panel("receive").querySelector("[data-action='open-camera']")!);
    });
    await waitFor(() => expect(panel("receive").querySelector("[data-camera-off]")).not.toBeNull());
  });

  it("falha ao gravar no Aplicar mostra sync.applyFailed", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const code = await codeFrom([2]);
    vi.spyOn(storageRef.current!, "writeMany").mockRejectedValue(new Error("quota"));
    renderSync();
    receiveTab();
    fireEvent.change(document.getElementById("sync-code-in")!, { target: { value: code.text } });
    await act(async () => {
      fireEvent.click(panel("receive").querySelector("[data-action='receive']")!);
    });
    await waitFor(() => expect(document.querySelector("[data-sync-summary]")).not.toBeNull());
    await act(async () => {
      fireEvent.click(panel("receive").querySelector("[data-action='apply']")!);
    });
    await waitFor(() => expect(panel("receive").querySelector("[data-error='sync.applyFailed']")).not.toBeNull());
  });
});
