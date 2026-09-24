// Telas ficticias rolaveis do harness (F1.3): exercitam a pilha de navegacao, o ScreenRouter e a ponte popstate
// sem nenhuma tela real. Os textos sao do dicionario (regra no-literal-jsx-text vale tambem aqui).
import { useEffect } from "react";
import { ScreenRouter, type ScreenProps, type ScreenRegistry } from "../../src/components/ScreenRouter";
import { TermsToggle } from "../../src/components/TermsToggle";
import { useT } from "../../src/i18n/useT";
import { useNavigationStore } from "../../src/navigation/navigation-store";
import { installHistoryBridge } from "../../src/navigation/history-bridge";
import type { ScreenId } from "../../src/navigation/types";

const LABEL_KEYS: Partial<Record<ScreenId, string>> = {
  home: "nav.home",
  dex: "nav.dex",
  detail: "detail.stats",
  balls: "nav.balls",
  items: "nav.items",
};

function DummyScreen({ entryId }: ScreenProps) {
  const t = useT();
  const screen = useNavigationStore((s) => s.current.screen);
  const navigate = useNavigationStore((s) => s.navigate);
  const goBack = useNavigationStore((s) => s.goBack);
  const targets: ScreenId[] = ["dex", "detail", "balls", "items"];
  return (
    <section className="card" data-testid={`dummy-${screen}`} data-entry={entryId} style={{ marginTop: 16 }}>
      <div className="card-head">
        <h2>{t(LABEL_KEYS[screen] ?? "nav.home")}</h2>
        <TermsToggle cardKey={`harness-${screen}`} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-ghost detail-back" data-testid="app-back" onClick={() => goBack(false)}>
          {t("detail.back")}
        </button>
        {targets.map((target) => (
          <button
            key={target}
            type="button"
            className="btn btn-primary"
            data-testid={`go-${target}`}
            onClick={() => navigate(target, target === "detail" ? { dex: 6 } : undefined)}
          >
            {t(LABEL_KEYS[target] ?? "nav.home")}
          </button>
        ))}
      </div>
      {/* conteudo alto para rolar #main */}
      <div style={{ height: 3000 }} data-testid="tall" />
    </section>
  );
}

const SCREENS: ScreenRegistry = {};
for (const id of ["home", "dex", "detail", "balls", "items"] as const) SCREENS[id] = DummyScreen;

export function HarnessNavigation() {
  useEffect(() => installHistoryBridge(), []);
  return <ScreenRouter screens={SCREENS} />;
}
