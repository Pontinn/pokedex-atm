// Tela Pokebolas (F9.1; porta renderBalls/ballGridHTML, app.js:1155-1162): todas as bolas do dataset
// (balls.json.length), filtro por tag (current.ui.filter) E busca PT/EN (current.ui.filters.query).
// So a grade re-renderiza ao trocar filtro/busca (RF-04).
import "./balls.css";
import { memo, useMemo } from "react";
import type { ScreenProps } from "../../components/ScreenRouter";
import { EmptyState } from "../../components/EmptyState";
import { InlineError } from "../../components/InlineError";
import { ItemTile } from "../../components/ItemTile";
import { PokeballSpinner } from "../../components/PokeballSpinner";
import { SegmentedControl } from "../../components/SegmentedControl";
import { TermsToggle } from "../../components/TermsToggle";
import type { BallInfo, ItemsFile } from "../../data/types";
import { loadBalls, loadItems } from "../../data/loaders";
import { termPair, useT } from "../../i18n/useT";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { usePreferencesStore, useTermsLanguage } from "../../state/preferences-store";
import type { UiLanguage } from "../../storage/types";
import { ListSearch, useListQuery } from "../Trainers/ListSearch";
import { useLoader } from "../Trainers/use-loader";
import { BALL_FILTERS, ballMultiplier, filterBalls, isBallFilter, type BallFilter } from "./ball-model";

const loadBallData = () => Promise.all([loadBalls(), loadItems()]);

const BallCard = memo(function BallCard({ ball, index, items, lang, uiLang }: { ball: BallInfo; index: number; items: ItemsFile; lang: UiLanguage; uiLang: UiLanguage }) {
  const t = useT();
  const { navigate } = useNavigationActions();
  const name = termPair(ball.name, lang);
  const mult = ballMultiplier(ball);
  const multText = mult.kind === "flat" ? mult.text : mult.kind === "range" ? t("ball.range", { w: mult.worst, b: mult.best }) : t("ball.guaranteed");
  return (
    <button
      type="button"
      className="ball-card it-link"
      style={{ ["--i" as string]: Math.min(index, 16) }}
      data-nav
      data-ball={ball.id}
      onClick={() => navigate("item", { itemId: ball.itemId })}
    >
      <ItemTile texture={items[ball.itemId]?.texture} size={52} />
      <span className="ball-info">
        <span className="ball-name">
          <span className="ball-name-main">{name.primary}</span>
          {name.secondary ? <small>{name.secondary}</small> : null}
          <span className={`ball-mult${mult.kind === "guaranteed" ? " ball-mult-guaranteed" : ""}`}>{multText}</span>
        </span>
        <span className="ball-eff">{ball.effect[uiLang] || ball.effect.en}</span>
      </span>
    </button>
  );
});

const BallGrid = memo(function BallGrid({ balls, items }: { balls: readonly BallInfo[]; items: ItemsFile }) {
  const t = useT();
  const raw = useScreenUi("balls", "filter");
  const filter: BallFilter = isBallFilter(raw) ? raw : "all";
  const query = useListQuery("balls");
  const lang = useTermsLanguage("balls");
  const uiLang = usePreferencesStore((s) => s.uiLanguage);
  const shown = useMemo(() => filterBalls(balls, filter, query), [balls, filter, query]);
  if (shown.length === 0) {
    return query.trim() ? (
      <EmptyState messageKey="ball.none">
        <p className="empty-query">{`"${query.trim()}"`}</p>
      </EmptyState>
    ) : (
      <EmptyState messageKey="ball.noneFilter" />
    );
  }
  return (
    <div className="ball-grid" id="ball-grid" aria-label={t("nav.balls")} data-count={shown.length}>
      {shown.map((b, i) => (
        <BallCard key={b.id} ball={b} index={i} items={items} lang={lang} uiLang={uiLang} />
      ))}
    </div>
  );
});

const BallFilters = memo(function BallFilters() {
  const t = useT();
  const raw = useScreenUi("balls", "filter");
  const { updateUi } = useNavigationActions();
  const options = useMemo(() => BALL_FILTERS.map((f) => ({ value: f, label: t(`ball.${f}`) })), [t]);
  return (
    <SegmentedControl
      className="seg-tabs ball-filters"
      ariaLabel={t("ball.filters")}
      options={options}
      value={isBallFilter(raw) ? raw : "all"}
      onChange={(v) => updateUi<"balls">({ filter: v })}
    />
  );
});

export function BallsScreen(_props: ScreenProps) {
  const t = useT();
  const data = useLoader(loadBallData, []);
  return (
    <div className="balls-screen">
      <div className="page-head">
        <h2>{t("nav.balls")}</h2>
        <span className="muted">{t("ball.hint")}</span>
      </div>
      <div className="list-top">
        <ListSearch screen="balls" id="ball-q" labelKey="ball.searchLabel" placeholderKey="ball.searchPh" clearKey="ball.searchClear" />
      </div>
      <div className="page-tools">
        <BallFilters />
        <TermsToggle cardKey="balls" />
      </div>
      {data.error ? <InlineError onRetry={data.retry} /> : data.data ? <BallGrid balls={data.data[0]} items={data.data[1]} /> : <PokeballSpinner />}
    </div>
  );
}
