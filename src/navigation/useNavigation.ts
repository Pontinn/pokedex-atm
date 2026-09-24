// Hooks de navegacao (F1.3). Cada bloco le so o proprio slice (RF-04: sem re-render global).
import { useEffect } from "react";
import { installHistoryBridge } from "./history-bridge";
import { useNavigationStore } from "./navigation-store";
import type { NavEntry, ScreenId, UiStateMap } from "./types";

export function useCurrentEntry(): NavEntry {
  return useNavigationStore((s) => s.current);
}

export function useCurrentScreen(): ScreenId {
  return useNavigationStore((s) => s.current.screen);
}

/** Le um campo do estado de UI da tela atual. */
export function useScreenUi<S extends ScreenId, K extends keyof UiStateMap[S]>(_screen: S, key: K): UiStateMap[S][K] {
  return useNavigationStore((s) => (s.current.ui as UiStateMap[S])[key]);
}

export function useNavigationActions() {
  const navigate = useNavigationStore((s) => s.navigate);
  const go = useNavigationStore((s) => s.go);
  const goBack = useNavigationStore((s) => s.goBack);
  const updateUi = useNavigationStore((s) => s.updateUi);
  return { navigate, go, goBack, updateUi };
}

/** Liga a ponte popstate/Alt+Seta enquanto o componente estiver montado (AppShell em F1.4). */
export function useHistoryBridge(): void {
  useEffect(() => installHistoryBridge(), []);
}
