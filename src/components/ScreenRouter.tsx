// Renderiza a tela do topo da pilha (F1.3). key={entryId}: uma tela restaurada remonta com o `ui` salvo
// e o scroll e reaplicado pela pilha depois do 1o paint (requestAnimationFrame duplo).
// So le id/tela/params: updateUi (abas, filtros) NAO re-renderiza a tela inteira (RF-04); cada bloco le seu slice.
import type { ComponentType } from "react";
import { useNavigationStore } from "../navigation/navigation-store";
import type { ScreenId, ScreenParams } from "../navigation/types";

export interface ScreenProps {
  entryId: number;
  params: ScreenParams;
}

export type ScreenRegistry = Partial<Record<ScreenId, ComponentType<ScreenProps>>>;

export interface ScreenRouterProps {
  screens: ScreenRegistry;
  /** tela sem componente registrado */
  fallback?: ComponentType<ScreenProps>;
}

export function ScreenRouter({ screens, fallback }: ScreenRouterProps) {
  const entryId = useNavigationStore((s) => s.current.id);
  const screen = useNavigationStore((s) => s.current.screen);
  const params = useNavigationStore((s) => s.current.params);
  const Screen = screens[screen] ?? fallback;
  if (!Screen) return null;
  return (
    <div className="screen" key={entryId} data-screen={screen} data-entry-id={entryId}>
      <Screen entryId={entryId} params={params} />
    </div>
  );
}
