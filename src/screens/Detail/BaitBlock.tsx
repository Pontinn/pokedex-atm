// Bloco "Iscas" do painel "Onde encontrar" (spawn-bait F1.3): Poke-Lanche para spawns de terra/agua, Pokeisca (ou
// baga na vara) para spawns de pesca, as 3 melhores bagas do Pokemon e os reforcos genericos. Sem numeros no bloco
// (RF-13). Classes proprias bait-*: nada de .badge/.tag/.drop/.ob-* aqui dentro (contagens do e2e de #where-panel).
import { Cake, Fish } from "lucide-react";
import { memo, useMemo, type CSSProperties } from "react";
import { Skeleton } from "../../components/Skeleton";
import type { ItemsFile, SpeciesDetail, TypeId } from "../../data/types";
import { POKE_BAIT_ITEM_ID, SNACK_ITEM_ID, baitContexts, getBaitIndex, recommendBerries, type BaitPick } from "../../domain/bait";
import { TYPE_NAMES } from "../../i18n/types";
import { useT } from "../../i18n/useT";
import type { UiLanguage } from "../../storage/types";
import { ItemLink } from "./ItemLink";
import { eggGroupLabel } from "./WherePanel";

function pickLabels(pick: BaitPick, lang: UiLanguage): string {
  return pick.kind === "typing"
    ? pick.labels.map((x) => TYPE_NAMES[x as TypeId]?.[lang] ?? x).join("/")
    : pick.labels.map((g) => eggGroupLabel(g, lang)).join("/");
}

export const BaitBlock = memo(function BaitBlock({ detail, items, lang }: { detail: SpeciesDetail; items: ItemsFile | null; lang: UiLanguage }) {
  const t = useT();
  const ctx = baitContexts(detail.spawns);
  const index = items ? getBaitIndex(items) : null;
  const picks = useMemo(() => (index ? recommendBerries(detail, index) : null), [detail, index]);
  if (!ctx) return null;
  return (
    <div className="bait" data-bait="" style={{ "--i": 7 } as CSSProperties}>
      <span className="k">{t("where.bait.title")}</span>
      {ctx.snack ? (
        <div className="bait-row" data-bait-row="snack">
          <span className="bait-ico">
            <Cake aria-hidden="true" />
          </span>
          <ItemLink id={SNACK_ITEM_ID} items={items} lang={lang} className="bait-name it-link" size={24} />
          <span className="bait-hint">{t("where.bait.snackHint")}</span>
        </div>
      ) : null}
      {ctx.rod ? (
        <div className="bait-row" data-bait-row="rod">
          <span className="bait-ico">
            <Fish aria-hidden="true" />
          </span>
          <ItemLink id={POKE_BAIT_ITEM_ID} items={items} lang={lang} className="bait-name it-link" size={24} />
          <span className="bait-or">{t("where.bait.rodOr")}</span>
          <span className="bait-hint">{t("where.bait.rodHint")}</span>
        </div>
      ) : null}
      <div className="bait-line" data-bait-line="berries">
        <span className="bait-label">{t("where.bait.berries")}</span>
        {picks === null ? (
          <Skeleton height={14} width="60%" className="bait-skeleton" />
        ) : picks.length ? (
          picks.map((p) => (
            <span className="bait-berry" key={p.itemId} data-bait-berry={p.itemId}>
              <ItemLink id={p.itemId} items={items} lang={lang} className="bait-berry-link it-link" size={18} />
              <span className="bait-why">{`(${pickLabels(p, lang)})`}</span>
            </span>
          ))
        ) : (
          <span className="bait-empty">{t("where.bait.noBerries")}</span>
        )}
      </div>
      <div className="bait-line" data-bait-line="boosts">
        <span className="bait-label">{t("where.bait.boosts")}</span>
        {index === null ? (
          <Skeleton height={14} width="60%" className="bait-skeleton" />
        ) : (
          index.boosters.map((b) => (
            <span className="bait-boost" key={b.itemId} data-bait-boost={b.itemId}>
              <ItemLink id={b.itemId} items={items} lang={lang} className="bait-boost-link it-link" size={18} />
              {b.rarity ? <span className="bait-badge bait-badge-rarity">{t("where.bait.rarity")}</span> : null}
              {b.shiny ? <span className="bait-badge bait-badge-shiny">{t("where.bait.shiny")}</span> : null}
            </span>
          ))
        )}
      </div>
    </div>
  );
});
