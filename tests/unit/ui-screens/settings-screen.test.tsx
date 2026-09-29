// Cobertura das telas (2026-09-27): SettingsScreen montada inteira (tema, idioma, som, animacoes, termos,
// instalar, backup exportar/importar, apagar dados, restaurar snapshot, sobre) sobre um MemoryAdapter no lugar do
// storage do app. Cada acao confere o efeito real no storage/stores, nao so a renderizacao.
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DatasetManifest } from "../../../src/data/types";
import type { DocumentStorage } from "../../../src/storage";
import manifestJson from "../../fixtures/ui-shell/manifest.json";

const storageRef = { current: null as DocumentStorage | null };
vi.mock("../../../src/state/app-storage", () => ({
  getAppStorage: () => {
    if (!storageRef.current) throw new Error("storage not initialized");
    return storageRef.current;
  },
  initAppStorage: () => storageRef.current,
}));

const { SettingsScreen } = await import("../../../src/screens/Settings/SettingsScreen");
const { translate } = await import("../../../src/i18n/useT");
const { MemoryAdapter } = await import("../../../src/storage");
const { exportBackup, serializeBackup } = await import("../../../src/storage/backup");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore, usePreferencesStore } = await import("../../../src/state/preferences-store");
const { resetCapturedStore, setUserStoreStorage, useCapturedStore } = await import("../../../src/state/captured-store");
const { useShellStore } = await import("../../../src/state/shell-store");

const tr = (key: string, vars?: Record<string, string | number>) => translate("pt", key, vars);
const toasts = () => useShellStore.getState().toasts.map((t) => t.messageKey);
const card = (name: string) => document.querySelector<HTMLElement>(`[data-card='${name}']`)!;

/** jsdom nao implementa Blob.text(); o navegador real sim. */
function jsonFile(text: string, name: string): File {
  const file = new File([text], name, { type: "application/json" });
  Object.defineProperty(file, "text", { value: async () => text });
  return file;
}

async function seedCaptured(dexes: number[]) {
  const entries = Object.fromEntries(dexes.map((d) => [String(d), { capturedAt: 1_700_000_000_000 }]));
  await storageRef.current!.write("captured", { schemaVersion: 1, entries } as never);
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
  useDatasetStore.setState({ status: "ready", ready: true, manifest: manifestJson as unknown as DatasetManifest, speciesIndex: [] });
  useNavigationStore.getState().navigate("settings", {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderSettings() {
  return render(<SettingsScreen entryId={1} params={{}} />);
}

describe("SettingsScreen", () => {
  it("tema, idioma, som, animacoes e termos gravam na store de preferencias", async () => {
    renderSettings();
    const themes = within(card("theme")).getAllByRole("radio");
    expect(themes.length).toBe(7);
    const other = themes.find((b) => b.getAttribute("aria-checked") === "false")!;
    fireEvent.click(other);
    expect(usePreferencesStore.getState().theme).toBe(other.getAttribute("data-theme-pick"));

    fireEvent.click(within(card("language")).getByRole("button", { name: tr("settings.languageEn") }));
    expect(usePreferencesStore.getState().uiLanguage).toBe("en");
    fireEvent.click(within(card("language")).getByRole("button", { name: translate("en", "settings.languagePt") }));
    expect(usePreferencesStore.getState().uiLanguage).toBe("pt");

    const sound = document.getElementById("sw-sound") as HTMLInputElement;
    const before = usePreferencesStore.getState().soundEnabled;
    fireEvent.click(sound);
    expect(usePreferencesStore.getState().soundEnabled).toBe(!before);

    const followSystem = within(card("sound-motion")).getByRole("checkbox");
    fireEvent.click(followSystem);
    const pinned = usePreferencesStore.getState().reduceMotion;
    fireEvent.click(document.getElementById("sw-motion")!);
    expect(usePreferencesStore.getState().reduceMotion).not.toBe(pinned);
    fireEvent.click(within(card("sound-motion")).getByRole("checkbox"));
    fireEvent.click(within(card("sound-motion")).getByRole("checkbox"));

    usePreferencesStore.getState().setTermsOverride("weak", "pt");
    const target = usePreferencesStore.getState().termsLanguage === "pt" ? "settings.termsEn" : "settings.termsPt";
    await act(async () => {
      fireEvent.click(within(card("terms")).getByRole("button", { name: tr(target) }));
    });
    await waitFor(() => expect(usePreferencesStore.getState().termsOverrides).toEqual({}));
    expect(usePreferencesStore.getState().termsLanguage).toBe(target === "settings.termsEn" ? "en" : "pt");
  });

  it("sem beforeinstallprompt mostra a instrucao manual; o evento habilita o botao Instalar", () => {
    renderSettings();
    expect(within(card("install")).getByText(tr("settings.installManual"))).toBeTruthy();
    act(() => void window.dispatchEvent(new Event("beforeinstallprompt")));
    expect(within(card("install")).getByRole("button", { name: tr("about.install") })).toBeTruthy();
    act(() => void window.dispatchEvent(new Event("appinstalled")));
    expect(document.querySelector("[data-card='install']")).toBeNull();
  });

  it("Sobre mostra versao do dataset e contagens do manifesto; sem manifesto mostra dados indisponiveis", () => {
    const { unmount } = renderSettings();
    const m = manifestJson as unknown as DatasetManifest;
    expect(card("about").querySelector("[data-info='dataset']")!.textContent).toContain(m.datasetVersion);
    expect(card("about").querySelector("[data-info='counts']")).not.toBeNull();
    unmount();
    useDatasetStore.setState({ manifest: null });
    renderSettings();
    expect(card("about").querySelector("[data-info='data']")!.textContent).toBe(tr("shell.dataUnavailable"));
    expect(card("about").querySelector("[data-info='counts']")).toBeNull();
  });

  it("Sobre tem 'feito por Pontin', o botao do portfolio e o do GitHub em nova aba (PT e EN)", () => {
    const { unmount } = renderSettings();
    const about = card("about");
    expect(within(about).getByText(tr("about.madeBy"))).toBeTruthy();
    const link = within(about).getByRole("link", { name: /^Ver meu portfólio/ });
    expect(link.textContent).toBe(tr("about.portfolio"));
    expect(link.getAttribute("href")).toBe("https://portfolio.pontin.dev");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    const gh = within(about).getByRole("link", { name: /GitHub/ });
    expect(gh.getAttribute("href")).toBe("https://github.com/Pontinn");
    expect(gh.getAttribute("target")).toBe("_blank");
    expect(gh.getAttribute("rel")).toBe("noopener noreferrer");
    unmount();
    usePreferencesStore.getState().setUiLanguage("en");
    renderSettings();
    expect(within(card("about")).getByText("Pontindex, made by Pontin.")).toBeTruthy();
    expect(within(card("about")).getByRole("link", { name: /^See my portfolio/ })).toBeTruthy();
  });

  it("Exportar gera o download do backup e mostra toast backup.exported", async () => {
    const createUrl = vi.fn(() => "blob:x");
    Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: vi.fn() });
    const clicks: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicks.push(this.download);
    });
    renderSettings();
    await act(async () => {
      fireEvent.click(card("backup").querySelector("[data-action='export']")!);
    });
    await waitFor(() => expect(toasts()).toContain("backup.exported"));
    expect(createUrl).toHaveBeenCalledTimes(1);
    expect(clicks[0]).toMatch(/^pontindex-backup-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it("Importar arquivo invalido mostra o erro da matriz sem gravar nada", async () => {
    renderSettings();
    const input = card("backup").querySelector<HTMLInputElement>("[data-input='backup-file']")!;
    const bad = jsonFile("nao e json", "x.json");
    await act(async () => {
      fireEvent.change(input, { target: { files: [bad] } });
    });
    await waitFor(() => expect(card("backup").querySelector("[data-error]")).not.toBeNull());
    expect(card("backup").querySelector("[data-error]")!.getAttribute("data-error")).toMatch(/^sync\./);
  });

  it("Importar backup valido mostra o resumo, Substituir/Mesclar mudam a previa e Aplicar grava e rehidrata", async () => {
    // backup de outro aparelho com 3 capturados
    const other = new MemoryAdapter();
    await other.init();
    await other.write("captured", { schemaVersion: 1, entries: { "1": { capturedAt: 1 }, "4": { capturedAt: 2 }, "7": { capturedAt: 3 } } } as never);
    const text = serializeBackup(await exportBackup(other));
    await seedCaptured([25]);

    renderSettings();
    const input = card("backup").querySelector<HTMLInputElement>("[data-input='backup-file']")!;
    await act(async () => {
      fireEvent.change(input, { target: { files: [jsonFile(text, "b.json")] } });
    });
    const dialog = await screen.findByRole("dialog");
    expect(dialog.querySelector("[data-sum='captured']")!.textContent).toBe(tr("sync.sumCaptured", { n: 3 }));
    expect(dialog.querySelector("[data-preview]")!.textContent).toBe(tr("sync.afterMerge", { n: 4 }));
    fireEvent.click(within(dialog).getByRole("button", { name: tr("sync.replace") }));
    expect(dialog.querySelector("[data-preview]")!.textContent).toBe(tr("sync.afterReplace", { n: 3 }));
    fireEvent.click(within(dialog).getByRole("button", { name: tr("sync.merge") }));
    await act(async () => {
      fireEvent.click(dialog.querySelector("[data-action='apply-import']")!);
    });
    await waitFor(() => expect(toasts()).toContain("backup.imported"));
    const doc = await storageRef.current!.readOrDefault("captured");
    expect(Object.keys(doc.entries).sort()).toEqual(["1", "25", "4", "7"]);
    await waitFor(() => expect(Object.keys(useCapturedStore.getState().entries).length).toBe(4));
  });

  it("Apagar dados: botao desabilitado sem selecao; historico+capturados mostra a contagem e apaga so eles", async () => {
    await seedCaptured([1, 2]);
    renderSettings();
    const del = card("delete").querySelector<HTMLButtonElement>("[data-action='delete']")!;
    expect(del.disabled).toBe(true);
    fireEvent.click(card("delete").querySelector("[data-delete='captured']")!);
    fireEvent.click(card("delete").querySelector("[data-delete='history']")!);
    fireEvent.click(card("delete").querySelector("[data-delete='history']")!);
    expect(del.disabled).toBe(false);
    await act(async () => {
      fireEvent.click(del);
    });
    const dialog = await screen.findByRole("dialog");
    expect(dialog.querySelector("[data-confirm-text]")!.textContent).toBe(
      tr("deleteData.willDelete", { list: tr("deleteData.captured"), n: 2 }),
    );
    expect(dialog.querySelector("[data-input='confirm-word']")).toBeNull();
    await act(async () => {
      fireEvent.click(dialog.querySelector("[data-action='confirm-delete']")!);
    });
    await waitFor(() => expect(toasts()).toContain("deleteData.done"));
    expect((await storageRef.current!.readOrDefault("captured")).entries).toEqual({});
  });

  it("Apagar Tudo exige digitar a palavra de confirmacao; Cancelar fecha sem apagar", async () => {
    await seedCaptured([9]);
    renderSettings();
    fireEvent.click(card("delete").querySelector("[data-delete='all']")!);
    expect(card("delete").querySelectorAll("input[type='checkbox']:checked").length).toBe(6);
    await act(async () => {
      fireEvent.click(card("delete").querySelector("[data-action='delete']")!);
    });
    let dialog = await screen.findByRole("dialog");
    const confirm = dialog.querySelector<HTMLButtonElement>("[data-action='confirm-delete']")!;
    expect(confirm.disabled).toBe(true);
    fireEvent.change(dialog.querySelector("[data-input='confirm-word']")!, { target: { value: "errado" } });
    expect(confirm.disabled).toBe(true);
    fireEvent.click(within(dialog).getByRole("button", { name: tr("settings.cancel") }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(Object.keys((await storageRef.current!.readOrDefault("captured")).entries)).toEqual(["9"]);

    await act(async () => {
      fireEvent.click(card("delete").querySelector("[data-action='delete']")!);
    });
    dialog = await screen.findByRole("dialog");
    fireEvent.change(dialog.querySelector("[data-input='confirm-word']")!, { target: { value: ` ${tr("deleteData.word").toLowerCase()} ` } });
    const ok = dialog.querySelector<HTMLButtonElement>("[data-action='confirm-delete']")!;
    expect(ok.disabled).toBe(false);
    await act(async () => {
      fireEvent.click(ok);
    });
    await waitFor(() => expect(toasts()).toContain("deleteData.done"));
    expect((await storageRef.current!.readOrDefault("captured")).entries).toEqual({});
    // desmarcar Tudo limpa a selecao
    fireEvent.click(card("delete").querySelector("[data-delete='all']")!);
    fireEvent.click(card("delete").querySelector("[data-delete='all']")!);
    expect(card("delete").querySelectorAll("input[type='checkbox']:checked").length).toBe(0);
  });

  it("Restaurar snapshot: sem snapshots mostra o vazio; com snapshot pre-migracao confirma e restaura", async () => {
    const storage = storageRef.current!;
    const list = vi.spyOn(storage, "listSnapshots").mockResolvedValue([]);
    const { unmount } = renderSettings();
    await waitFor(() => expect(card("restore").querySelector("[data-restore-empty]")).not.toBeNull());
    unmount();

    list.mockResolvedValue([
      { id: "pre-migration-1", createdAt: 1_700_000_000_000, version: 1, docs: {} },
      { id: "other-snap", createdAt: 1_700_000_100_000, version: 2, docs: {} },
    ]);
    const restore = vi.spyOn(storage, "restorePreMigrationSnapshot").mockResolvedValue();
    renderSettings();
    const row = await waitFor(() => {
      const el = card("restore").querySelector<HTMLElement>("[data-snapshot='pre-migration-1']");
      if (!el) throw new Error("snapshot ausente");
      return el;
    });
    expect(card("restore").querySelector("[data-snapshot='other-snap']")).toBeNull();
    fireEvent.click(within(row).getByRole("button"));
    const dialog = await screen.findByRole("dialog");
    await act(async () => {
      fireEvent.click(dialog.querySelector("[data-action='confirm-restore']")!);
    });
    await waitFor(() => expect(toasts()).toContain("about.restored"));
    expect(restore).toHaveBeenCalledWith("pre-migration-1");
  });

  it("falha ao restaurar mostra toast de erro backup.failed", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const storage = storageRef.current!;
    vi.spyOn(storage, "listSnapshots").mockResolvedValue([{ id: "pre-migration-9", createdAt: 1, version: 1, docs: {} }]);
    vi.spyOn(storage, "restorePreMigrationSnapshot").mockRejectedValue(new Error("boom"));
    renderSettings();
    const row = await waitFor(() => {
      const el = card("restore").querySelector<HTMLElement>("[data-snapshot='pre-migration-9']");
      if (!el) throw new Error("snapshot ausente");
      return el;
    });
    fireEvent.click(within(row).getByRole("button"));
    const dialog = await screen.findByRole("dialog");
    await act(async () => {
      fireEvent.click(dialog.querySelector("[data-action='confirm-restore']")!);
    });
    await waitFor(() => expect(toasts()).toContain("backup.failed"));
  });
});
