// Reduzir animacoes (F1.4, RF-93): preferencia null segue prefers-reduced-motion do sistema; true/false sobrescreve.
// Aplica html.reduce-motion (base.css), o interruptor unico que zera animacoes e transicoes.
import { usePreferencesStore } from "./preferences-store";

export const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const REDUCE_MOTION_CLASS = "reduce-motion";

type MatchMediaFn = ((query: string) => MediaQueryList) | undefined;

function systemPrefersReduced(matchMediaFn: MatchMediaFn): boolean {
  if (typeof matchMediaFn !== "function") return false;
  try {
    return matchMediaFn(REDUCE_MOTION_QUERY).matches;
  } catch {
    return false;
  }
}

export function resolveReduceMotion(pref: boolean | null, matchMediaFn: MatchMediaFn = globalThis.matchMedia?.bind(globalThis)): boolean {
  return pref ?? systemPrefersReduced(matchMediaFn);
}

export function applyReduceMotion(on: boolean, root: HTMLElement = document.documentElement): void {
  root.classList.toggle(REDUCE_MOTION_CLASS, on);
}

/** Aplica agora e acompanha a store e a preferencia do sistema. Devolve o uninstall. */
export function installMotionPreference(matchMediaFn: MatchMediaFn = globalThis.matchMedia?.bind(globalThis)): () => void {
  const update = () => applyReduceMotion(resolveReduceMotion(usePreferencesStore.getState().reduceMotion, matchMediaFn));
  update();
  const unsubscribe = usePreferencesStore.subscribe((s, prev) => {
    if (s.reduceMotion !== prev.reduceMotion) update();
  });
  let mql: MediaQueryList | null = null;
  try {
    mql = typeof matchMediaFn === "function" ? matchMediaFn(REDUCE_MOTION_QUERY) : null;
    mql?.addEventListener?.("change", update);
  } catch {
    mql = null;
  }
  return () => {
    unsubscribe();
    mql?.removeEventListener?.("change", update);
  };
}
