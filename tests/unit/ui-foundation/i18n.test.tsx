import { act, fireEvent, render, renderHook, screen, within } from "@testing-library/react";
import { openDB } from "idb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TermsToggle } from "../../../src/components/TermsToggle";
import { EXCLUDED_MESSAGE_KEYS, MESSAGES } from "../../../src/i18n/messages";
import { TYPE_NAMES } from "../../../src/i18n/types";
import { MissingMessageError, gameName, interpolate, termPair, translate, useT } from "../../../src/i18n/useT";
import {
  flushPreferences,
  hydratePreferences,
  resetPreferencesStore,
  usePreferencesStore,
  useTermsLanguage,
} from "../../../src/state/preferences-store";
import { DOC_DEFAULTS, createPreferencesRepository, createStorageAdapter, type DocumentStorage } from "../../../src/storage";

let dbCounter = 0;
const newDbName = () => `pontindex-test-i18n-${Date.now()}-${dbCounter++}`;

async function openRepo(dbName: string) {
  const adapter = createStorageAdapter({ dbName });
  await adapter.init();
  return { adapter, repo: createPreferencesRepository(adapter) };
}

describe("F1.2 dicionario", () => {
  it("toda chave tem pt e en nao vazios", () => {
    const keys = Object.keys(MESSAGES);
    expect(keys.length).toBeGreaterThan(200);
    for (const [key, msg] of Object.entries(MESSAGES)) {
      expect(msg.pt.trim(), `${key}.pt`).not.toBe("");
      expect(msg.en.trim(), `${key}.en`).not.toBe("");
    }
  });

  it("chaves excluidas pela SPEC nao existem", () => {
    for (const key of ["detail.noSpawn", "detail.noSpawnDesc", "evo.methods", "captured.progress", "home.lastCaught", "ip.noDesc"]) {
      expect(key in MESSAGES, key).toBe(false);
    }
    for (const key of EXCLUDED_MESSAGE_KEYS) expect(key in MESSAGES, key).toBe(false);
  });

  it("chaves de tema seguem THEME_IDS e nenhum texto usa travessao", () => {
    expect("theme.classic" in MESSAGES).toBe(true);
    expect("theme.classico" in MESSAGES).toBe(false);
    const dash = String.fromCharCode(0x2014);
    for (const msg of Object.values(MESSAGES)) expect(msg.pt + msg.en).not.toContain(dash);
  });

  it("TYPE_NAMES cobre os 18 tipos", () => {
    expect(Object.keys(TYPE_NAMES)).toHaveLength(18);
    expect(TYPE_NAMES.fire).toEqual({ pt: "Fogo", en: "Fire" });
  });
});

describe("F1.2 translate/useT", () => {
  beforeEach(() => resetPreferencesStore());

  it("chave inexistente lanca em dev", () => {
    expect(() => translate("pt", "chave.inexistente")).toThrow(MissingMessageError);
  });

  it("interpolacao {n}", () => {
    expect(translate("pt", "sync.missingFrames", { n: 3 })).toBe("Faltam 3 frames");
    expect(translate("en", "ball.criticalText", { n: 12, b: 1.5 })).toContain("12");
    expect(interpolate("{a} e {b}", { a: 1 })).toBe("1 e {b}");
  });

  it("useT segue o uiLanguage da store", () => {
    const { result } = renderHook(() => useT());
    expect(result.current("nav.home")).toBe("Início");
    act(() => usePreferencesStore.getState().setUiLanguage("en"));
    expect(result.current("nav.home")).toBe("Home");
    expect(document.documentElement.lang).toBe("en");
  });

  it("gameName e termPair", () => {
    const item = { name: { pt: "Pedra do Fogo", en: "Fire Stone" } };
    expect(gameName(item, "pt")).toBe("Pedra do Fogo");
    expect(gameName(item, "en")).toBe("Fire Stone");
    expect(gameName({ pt: "", en: "Only EN" }, "pt")).toBe("Only EN");
    expect(termPair(item.name, "pt")).toEqual({ primary: "Pedra do Fogo", secondary: "Fire Stone" });
    expect(termPair({ pt: "Normal", en: "Normal" }, "en")).toEqual({ primary: "Normal", secondary: null });
  });
});

describe("F1.2 preferences-store + TermsToggle (fake-indexeddb)", () => {
  let adapter: DocumentStorage | null = null;

  beforeEach(() => resetPreferencesStore());
  afterEach(async () => {
    await flushPreferences();
    adapter?.close();
    adapter = null;
    vi.restoreAllMocks();
  });

  it("TermsToggle grava o override pelo repositorio e so o card consumidor re-renderiza", async () => {
    const dbName = newDbName();
    const opened = await openRepo(dbName);
    adapter = opened.adapter;
    await hydratePreferences(opened.repo);

    const renders = { moves: 0, abilities: 0 };
    function Card({ cardKey }: { cardKey: "moves" | "abilities" }) {
      renders[cardKey] += 1;
      const lang = useTermsLanguage(cardKey);
      return (
        <section data-testid={cardKey} data-lang={lang}>
          <TermsToggle cardKey={cardKey} />
        </section>
      );
    }
    render(
      <>
        <Card cardKey="moves" />
        <Card cardKey="abilities" />
      </>,
    );
    expect(renders).toEqual({ moves: 1, abilities: 1 });

    fireEvent.click(within(screen.getByTestId("moves")).getByRole("button", { name: "EN" }));
    expect(screen.getByTestId("moves").dataset.lang).toBe("en");
    expect(screen.getByTestId("abilities").dataset.lang).toBe("pt");
    expect(renders).toEqual({ moves: 2, abilities: 1 });

    await flushPreferences();
    const saved = await opened.repo.get();
    expect(saved.termsOverrides).toEqual({ moves: "en" });

    // trocar o idioma da interface nao altera os overrides (RF-85)
    act(() => usePreferencesStore.getState().setUiLanguage("en"));
    await flushPreferences();
    const afterLang = await opened.repo.get();
    expect(afterLang.uiLanguage).toBe("en");
    expect(afterLang.termsOverrides).toEqual({ moves: "en" });
    expect(usePreferencesStore.getState().termsOverrides).toEqual({ moves: "en" });

    // reabrir o banco reidrata o override (persistido, RF-86)
    adapter.close();
    const reopened = await openRepo(dbName);
    adapter = reopened.adapter;
    resetPreferencesStore();
    await hydratePreferences(reopened.repo);
    expect(usePreferencesStore.getState().termsOverrides).toEqual({ moves: "en" });
  });

  it('tema salvo "inexistente" no IndexedDB hidrata como classic com aviso', async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const dbName = newDbName();
    const first = await openRepo(dbName);
    await first.repo.set({ termsLanguage: "en" });
    first.adapter.close();

    // grava o doc cru (a API do repositorio recusa tema invalido)
    const raw = await openDB(dbName, 1);
    const rec = (await raw.get("documents", "preferences")) as { key: string; doc: Record<string, unknown> };
    await raw.put("documents", { key: "preferences", doc: { ...rec.doc, theme: "inexistente" } });
    raw.close();

    const opened = await openRepo(dbName);
    adapter = opened.adapter;
    document.documentElement.dataset.theme = "black";
    await hydratePreferences(opened.repo);
    expect(document.documentElement.dataset.theme).toBe("classic");
    expect(usePreferencesStore.getState().theme).toBe("classic");
    expect(usePreferencesStore.getState().termsLanguage).toBe("en");
    expect(warn).toHaveBeenCalled();
  });

  it("repositorio devolvendo tema desconhecido passa por applyTheme (classic + aviso)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const doc = structuredClone(DOC_DEFAULTS.preferences);
    const repo = {
      get: async () => ({ ...doc, theme: "inexistente" as never }),
      set: async () => doc,
    };
    await hydratePreferences(repo);
    expect(document.documentElement.dataset.theme).toBe("classic");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("inexistente"));
  });
});
