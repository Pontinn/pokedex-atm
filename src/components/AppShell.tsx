// Shell do app (F1.4): sidebar no desktop; topbar-aparelho + tab bar + sheet "Mais" no mobile (< 900 px).
// <main id="main"> e o container de rolagem da pilha de navegacao (MAIN_SCROLL_ID, F1.3).
// No mobile a linha "Feito por Pontin · GitHub" fica no fim do conteudo rolavel do <main> (nao flutua).
import { Suspense, useEffect } from "react";
import { useNavigationStore } from "../navigation/navigation-store";
import { SCREENS } from "../screens/registry";
import { useDatasetStore } from "../state/dataset-store";
import { usePreferencesStore } from "../state/preferences-store";
import { useShellStore } from "../state/shell-store";
import { ErrorBoundary } from "./ErrorBoundary";
import { InlineError } from "./InlineError";
import { MadeByLinks } from "./MadeBy";
import { MoreSheet } from "./MoreSheet";
import { PokeballSpinner } from "./PokeballSpinner";
import { ScreenRouter } from "./ScreenRouter";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";
import { Topbar } from "./Topbar";
import { useIsMobile } from "./useIsMobile";
import { Watermark } from "./Watermark";

function DatasetNotice() {
  const status = useDatasetStore((s) => s.status);
  const errorCode = useDatasetStore((s) => s.errorCode);
  const load = useDatasetStore((s) => s.load);
  if (status !== "error") return null;
  const messageKey = errorCode === "NOT_FOUND" ? "dataset.missing" : errorCode === "INVALID" ? "dataset.invalid" : "error.load";
  return (
    <div className="dataset-notice">
      <InlineError messageKey={messageKey} onRetry={() => void load()} />
    </div>
  );
}

/** Erro de gravacao das preferencias -> toast persistente (SPEC F1.4 passo 7). */
function usePersistErrorToast() {
  const persistError = usePreferencesStore((s) => s.persistError);
  const pushToast = useShellStore((s) => s.pushToast);
  useEffect(() => {
    if (persistError) pushToast("error.storage", { tone: "error", persistent: true });
  }, [persistError, pushToast]);
}

export function AppShell() {
  const mobile = useIsMobile();
  const entryId = useNavigationStore((s) => s.current.id);
  const go = useNavigationStore((s) => s.go);
  const setMoreOpen = useShellStore((s) => s.setMoreOpen);
  usePersistErrorToast();

  // o sheet fecha ao trocar de tela ou ao virar desktop
  useEffect(() => setMoreOpen(false), [entryId, setMoreOpen]);
  useEffect(() => {
    if (!mobile) setMoreOpen(false);
  }, [mobile, setMoreOpen]);

  return (
    <div id="app" className={`app${mobile ? " mobile" : ""}`}>
      <Watermark />
      <Sidebar />
      <Topbar />
      <main className="main" id="main">
        <DatasetNotice />
        <ErrorBoundary key={entryId} onHome={() => go("home")}>
          <Suspense fallback={<PokeballSpinner size="lg" />}>
            <ScreenRouter screens={SCREENS} />
          </Suspense>
        </ErrorBoundary>
        {mobile ? (
          <footer className="main-foot">
            <MadeByLinks variant="foot" />
          </footer>
        ) : null}
      </main>
      <TabBar />
      <MoreSheet />
    </div>
  );
}
