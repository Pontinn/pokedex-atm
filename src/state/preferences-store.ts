// Store de preferencias (F1.2, Zustand). Persiste pelo repositorio `preferences` de B7.1 e aplica o tema com
// applyTheme (F1.1). Cada campo e um slice proprio para que so os consumidores afetados re-renderizem (RF-04).
import { create } from "zustand";
import { DOC_DEFAULTS, type PreferencesPatch } from "../storage";
import type { PreferencesDoc, UiLanguage } from "../storage/types";
import type { ThemeId } from "../styles/themes";
import { applyTheme } from "../styles/theme-meta";

/** Subconjunto do repositorio de B7.1 que a store usa (createPreferencesRepository). */
export interface PreferencesRepositoryLike {
  get(): Promise<PreferencesDoc>;
  set(patch: PreferencesPatch): Promise<PreferencesDoc>;
}

export interface PreferencesState {
  hydrated: boolean;
  theme: ThemeId;
  uiLanguage: UiLanguage;
  termsLanguage: UiLanguage;
  termsOverrides: Record<string, UiLanguage>;
  soundEnabled: boolean;
  reduceMotion: boolean | null;
  /** ultimo erro de gravacao (F1.4 mostra toast); null = ok */
  persistError: unknown;
  setTheme(theme: string): void;
  setUiLanguage(lang: UiLanguage): void;
  setTermsLanguage(lang: UiLanguage): void;
  setTermsOverride(cardKey: string, lang: UiLanguage): void;
  setSoundEnabled(enabled: boolean): void;
  setReduceMotion(value: boolean | null): void;
}

let repository: PreferencesRepositoryLike | null = null;
let writeChain: Promise<unknown> = Promise.resolve();

export function htmlLang(lang: UiLanguage): string {
  return lang === "pt" ? "pt-BR" : "en";
}

function applyLanguage(lang: UiLanguage) {
  if (typeof document !== "undefined") document.documentElement.lang = htmlLang(lang);
}

const defaults = DOC_DEFAULTS.preferences;

export const usePreferencesStore = create<PreferencesState>()((set) => {
  /** Grava o patch em serie (o repositorio faz ler-mesclar-gravar; a fila evita perder patches concorrentes). */
  const persist = (patch: PreferencesPatch) => {
    const repo = repository;
    if (!repo) return;
    writeChain = writeChain
      .then(() => repo.set(patch))
      .then(
        () => set({ persistError: null }),
        (err: unknown) => {
          console.warn("[preferences] failed to persist", err);
          set({ persistError: err });
        },
      );
  };

  return {
    hydrated: false,
    theme: defaults.theme,
    uiLanguage: defaults.uiLanguage,
    termsLanguage: defaults.termsLanguage,
    termsOverrides: { ...defaults.termsOverrides },
    soundEnabled: defaults.soundEnabled,
    reduceMotion: defaults.reduceMotion,
    persistError: null,

    setTheme(theme) {
      const id = applyTheme(theme);
      set({ theme: id });
      persist({ theme: id });
    },
    setUiLanguage(lang) {
      // RF-85: trocar o idioma da interface nao mexe nos overrides dos cards
      applyLanguage(lang);
      set({ uiLanguage: lang });
      persist({ uiLanguage: lang });
    },
    setTermsLanguage(lang) {
      set({ termsLanguage: lang });
      persist({ termsLanguage: lang });
    },
    setTermsOverride(cardKey, lang) {
      let next: Record<string, UiLanguage> = {};
      set((s) => {
        next = { ...s.termsOverrides, [cardKey]: lang };
        return { termsOverrides: next };
      });
      persist({ termsOverrides: next });
    },
    setSoundEnabled(enabled) {
      set({ soundEnabled: enabled });
      persist({ soundEnabled: enabled });
    },
    setReduceMotion(value) {
      set({ reduceMotion: value });
      persist({ reduceMotion: value });
    },
  };
});

/**
 * Hidrata a store a partir do repositorio (antes do 1o render, F1.4) e aplica tema e idioma no <html>.
 * Tema salvo desconhecido cai para "classic" com aviso (applyTheme).
 */
export async function hydratePreferences(repo: PreferencesRepositoryLike): Promise<PreferencesDoc> {
  repository = repo;
  const doc = await repo.get();
  const theme = applyTheme(doc.theme);
  applyLanguage(doc.uiLanguage);
  usePreferencesStore.setState({
    hydrated: true,
    theme,
    uiLanguage: doc.uiLanguage,
    termsLanguage: doc.termsLanguage,
    termsOverrides: { ...doc.termsOverrides },
    soundEnabled: doc.soundEnabled,
    reduceMotion: doc.reduceMotion,
    persistError: null,
  });
  return doc;
}

/** Aguarda as gravacoes pendentes (testes e "Apagar dados"). */
export function flushPreferences(): Promise<unknown> {
  return writeChain;
}

/** Idioma efetivo dos termos de um card: override do card ou o padrao (RF-84/RF-86). */
export function useTermsLanguage(cardKey: string): UiLanguage {
  return usePreferencesStore((s) => s.termsOverrides[cardKey] ?? s.termsLanguage);
}

/** So para testes: desliga o repositorio e volta aos padroes. */
export function resetPreferencesStore(): void {
  repository = null;
  writeChain = Promise.resolve();
  usePreferencesStore.setState({
    hydrated: false,
    theme: defaults.theme,
    uiLanguage: defaults.uiLanguage,
    termsLanguage: defaults.termsLanguage,
    termsOverrides: { ...defaults.termsOverrides },
    soundEnabled: defaults.soundEnabled,
    reduceMotion: defaults.reduceMotion,
    persistError: null,
  });
}
