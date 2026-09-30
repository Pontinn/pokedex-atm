// Tela Itens & Comidas (F9.2; porta renderItems/itemGridHTML, app.js:1185-1200): abas por categoria
// (current.ui.category), busca PT/EN em TODOS os itens quando ha texto (current.ui.query, RF-67) e card com a tag da
// categoria em linha propria ACIMA do nome (decisao do Pontin 2026-09-24, feedback/2.png). So a grade re-renderiza
// ao trocar aba/busca (RF-04).
import "./items.css";
import { memo, useMemo } from "react";
import type { ComponentType } from "react";
import { Bone, Cherry, CookingPot, Fish, Leaf } from "lucide-react";
import type { ScreenProps } from "../../components/ScreenRouter";
import { EmptyState } from "../../components/EmptyState";
import { Backpack, ChevronDown, CircleDot, HeartPulse, Package, Sparkle, Sparkles, Star, Swords, Zap } from "../../components/Icon";
import { InlineError } from "../../components/InlineError";
import { ItemTile } from "../../components/ItemTile";
import { PokeballSpinner } from "../../components/PokeballSpinner";
import { TermsToggle } from "../../components/TermsToggle";
import type { ItemCategory, ItemInfo, ItemsFile } from "../../data/types";
import { loadItems } from "../../data/loaders";
import { termPair, useT } from "../../i18n/useT";
import { useNavigationActions, useScreenUi } from "../../navigation/useNavigation";
import { usePreferencesStore, useTermsLanguage } from "../../state/preferences-store";
import type { UiLanguage } from "../../storage/types";
import { ListSearch, useListQuery } from "../Trainers/ListSearch";
import { useLoader } from "../Trainers/use-loader";
import { CATEGORY_CLASS, CATEGORY_LABEL, berryOrigins, effectiveTab, filterItems, visibleTabs } from "./item-model";

/** Icone por categoria quando o item nao tem textura (app.js:1149-1151). */
const CATEGORY_ICON: Readonly<Record<ItemCategory, ComponentType<{ "aria-hidden"?: boolean }>>> = {
  medicine: HeartPulse,
  ivCandy: Sparkles,
  vitamin: Zap,
  expCandy: Star,
  evolution: Sparkle,
  held: Backpack,
  battle: Swords,
  cooking: CookingPot,
  berry: Cherry,
  bait: Fish,
  ball: CircleDot,
  fossil: Bone,
  mint: Leaf,
  other: Package,
};

const ItemIcon = memo(function ItemIcon({ item }: { item: ItemInfo }) {
  const cls = `item-tile-wrap cat-${CATEGORY_CLASS[item.category]}`;
  if (item.texture) {
    return (
      <span className={cls}>
        <ItemTile texture={item.texture} size={48} />
      </span>
    );
  }
  const Icon = CATEGORY_ICON[item.category];
  return (
    <span className={cls}>
      <span className="it-tile" style={{ width: 48, height: 48 }} aria-hidden="true">
        <Icon aria-hidden />
      </span>
    </span>
  );
});

const ItemCard = memo(function ItemCard({ item, index, lang, uiLang, open }: { item: ItemInfo; index: number; lang: UiLanguage; uiLang: UiLanguage; open: boolean }) {
  const t = useT();
  const { navigate, updateUi } = useNavigationActions();
  const name = termPair(item.name, lang);
  const desc = item.description ? item.description[uiLang] || item.description.en : null;
  const origins = berryOrigins(item);
  return (
    <article className={`item-card${open ? " open" : ""}`} style={{ ["--i" as string]: Math.min(index, 16) }} data-item={item.id}>
      <div className="item-head">
        <button type="button" className="item-link it-link" data-nav onClick={() => navigate("item", { itemId: item.id })}>
          <ItemIcon item={item} />
          <span className="item-names">
            <span className="tag item-tag">{t(CATEGORY_LABEL[item.category])}</span>
            <span className="item-name">{name.primary}</span>
            {name.secondary ? <span className="item-alt">{name.secondary}</span> : null}
            {origins.length ? (
              <span className="item-origins">
                {origins.map((o) => (
                  <span key={o} className="item-origin" data-origin={o}>
                    {t(`item.origin.${o}`)}
                  </span>
                ))}
              </span>
            ) : null}
          </span>
        </button>
        {desc ? (
          <button
            type="button"
            className="tr-caret item-caret"
            aria-expanded={open}
            aria-label={t(open ? "item.collapse" : "item.expand")}
            title={t(open ? "item.collapse" : "item.expand")}
            onClick={() => updateUi<"items">({ openItemId: open ? null : item.id })}
          >
            <ChevronDown aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {desc ? <p className="item-desc">{desc}</p> : <p className="item-desc item-desc-none">{t("item.noDesc")}</p>}
    </article>
  );
});

const ItemGrid = memo(function ItemGrid({ items, tab }: { items: readonly ItemInfo[]; tab: ItemCategory | null }) {
  const t = useT();
  const query = useListQuery("items");
  const openId = useScreenUi("items", "openItemId");
  const lang = useTermsLanguage("items");
  const uiLang = usePreferencesStore((s) => s.uiLanguage);
  const shown = useMemo(() => filterItems(items, tab, query, lang), [items, tab, query, lang]);
  if (shown.length === 0) {
    return (
      <EmptyState messageKey="item.none">{query.trim() ? <p className="empty-query">{`"${query.trim()}"`}</p> : null}</EmptyState>
    );
  }
  return (
    <div className="item-grid" id="item-grid" aria-label={t("nav.items")} data-count={shown.length}>
      {shown.map((it, i) => (
        <ItemCard key={it.id} item={it} index={i} lang={lang} uiLang={uiLang} open={openId === it.id} />
      ))}
    </div>
  );
});

const ItemTabs = memo(function ItemTabs({ tabs, active }: { tabs: readonly ItemCategory[]; active: ItemCategory | null }) {
  const t = useT();
  const query = useListQuery("items");
  const { updateUi } = useNavigationActions();
  const searching = query.trim() !== "";
  return (
    <div className="tabs item-tabs" id="item-tabs" role="tablist" aria-label={t("item.tabs")}>
      {tabs.map((c) => {
        const on = !searching && c === active;
        return (
          <button key={c} type="button" role="tab" aria-selected={on} className={on ? "active" : undefined} data-icat={c} onClick={() => updateUi<"items">({ category: c, query: "", openItemId: null })}>
            {t(CATEGORY_LABEL[c])}
          </button>
        );
      })}
    </div>
  );
});

function ItemsBody({ file }: { file: ItemsFile }) {
  const items = useMemo(() => Object.values(file), [file]);
  const tabs = useMemo(() => visibleTabs(items), [items]);
  const saved = useScreenUi("items", "category");
  const tab = effectiveTab(saved, tabs);
  return (
    <>
      <ItemTabs tabs={tabs} active={tab} />
      <ItemGrid items={items} tab={tab} />
    </>
  );
}

export function ItemsScreen(_props: ScreenProps) {
  const t = useT();
  const data = useLoader(loadItems, []);
  return (
    <div className="items-screen">
      <div className="page-head">
        <h2>{t("nav.items")}</h2>
      </div>
      <div className="item-top">
        <div className="item-tools">
          <ListSearch screen="items" id="item-q" labelKey="item.searchLabel" placeholderKey="item.searchPh" clearKey="item.searchClear" />
          <TermsToggle cardKey="items" />
        </div>
        {data.error ? null : data.data ? <ItemsBody file={data.data} /> : null}
      </div>
      {data.error ? <InlineError onRetry={data.retry} /> : data.data ? null : <PokeballSpinner />}
    </div>
  );
}
