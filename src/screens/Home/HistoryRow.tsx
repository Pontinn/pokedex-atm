// Historico na Home (F2.2; RF-43..46): cards .hist com sprite, #dex, nome e chips, do mais recente, so especies do
// dataset atual (orfaos escondidos). Sem botao de limpar (RF-46). Vazio -> EmptyState.
import { memo } from "react";
import { EmptyState } from "../../components/EmptyState";
import { TypeChip } from "../../components/TypeChip";
import { gameName, useT } from "../../i18n/useT";
import { useNavigationActions } from "../../navigation/useNavigation";
import { useHistoryHydrated, useHistoryStore } from "../../state/history-store";
import { usePreferencesStore } from "../../state/preferences-store";
import { formatDex, SpeciesSprite } from "./SpeciesSprite";
import { useSpeciesByDex } from "./TeamSlots";

export const HistoryRow = memo(function HistoryRow() {
  const t = useT();
  const { navigate } = useNavigationActions();
  const lang = usePreferencesStore((s) => s.uiLanguage);
  const hydrated = useHistoryHydrated();
  const entries = useHistoryStore((s) => s.entries);
  const byDex = useSpeciesByDex();
  const items = entries.flatMap((e) => {
    const s = byDex.get(e.dex);
    return s ? [s] : [];
  });
  return (
    <>
      <div className="section-head">
        <h3>{t("home.history")}</h3>
        <span className="muted">{t("home.historyHint")}</span>
      </div>
      {hydrated && items.length === 0 ? (
        <EmptyState messageKey="home.historyEmpty" />
      ) : (
        <div className="history-row" id="history-row">
          {items.map((s, i) => (
            <button
              key={s.dex}
              type="button"
              className="card hist clickable"
              data-nav=""
              data-dex={s.dex}
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => navigate("detail", { dex: s.dex })}
            >
              <SpeciesSprite species={s} />
              <div className="hist-info">
                <div className="dex-num">{formatDex(s.dex)}</div>
                <div className="hist-name">{gameName(s, lang)}</div>
                <div className="chips">
                  {s.types.map((type) => (
                    <TypeChip key={type} type={type} lang={lang} size="sm" />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
});
