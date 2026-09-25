// Pagina do item (F9.3; porta itemPageBodyHTML/renderItemPage, app.js:883-915): hero com textura pixelada, Como obter
// honesto (RF-68/69: receita so "Sim", drops, plantavel, loot, pesca, fossil; sem rota = .ob-none) e Usado em (RF-70:
// evolucoes, fosseis, formas, bola). Todo item citado no app abre aqui; Voltar restaura a origem (pilha F1.3).
import "./item.css";
import { memo, useMemo, type ReactNode } from "react";
import { Bone, CircleArrowUp, Fish, Gift, Hammer, PackageOpen, Sprout } from "lucide-react";
import type { ScreenProps } from "../../components/ScreenRouter";
import { ArrowLeft, ArrowRight, HeartPulse, Info, Package, Sparkles, Target } from "../../components/Icon";
import { InlineError } from "../../components/InlineError";
import { itemTextureUrl } from "../../components/ItemTile";
import { PokeballSpinner } from "../../components/PokeballSpinner";
import { TermsToggle } from "../../components/TermsToggle";
import type { BallInfo, BallsFile, BiomeLabels, ItemInfo, ItemObtainRoute, SpeciesSummary } from "../../data/types";
import { loadBalls, loadBiomes, loadItems } from "../../data/loaders";
import { termPair, useT } from "../../i18n/useT";
import { useNavigationActions } from "../../navigation/useNavigation";
import { useDatasetStore } from "../../state/dataset-store";
import { usePreferencesStore, useTermsLanguage } from "../../state/preferences-store";
import type { UiLanguage } from "../../storage/types";
import { ballMultiplier } from "../Balls/ball-model";
import { SpeciesSprite } from "../Home/SpeciesSprite";
import { CATEGORY_CLASS, CATEGORY_LABEL } from "../Items/item-model";
import { biomeLabel } from "../Trainers/trainer-model";
import { useLoader } from "../Trainers/use-loader";
import { lootLabels, obtainRows, recipeLabels, showsEffect, unknownItemName } from "./item-page-model";

const loadItemPageData = () => Promise.all([loadItems(), loadBalls(), loadBiomes().catch(() => null)]);

function useSpeciesMap(): Map<number, SpeciesSummary> {
  const index = useDatasetStore((s) => s.speciesIndex);
  return useMemo(() => new Map((index ?? []).map((s) => [s.dex, s])), [index]);
}

/** Chip de Pokemon (.mon-chip, style.css 957-961): sprite + nome no idioma do card + extra (ex. "25%"); abre a ficha. */
const MonChip = memo(function MonChip({ dex, species, lang, extra }: { dex: number; species: SpeciesSummary | undefined; lang: UiLanguage; extra?: ReactNode }) {
  const t = useT();
  const { navigate } = useNavigationActions();
  const name = species ? termPair(species.name, lang).primary : `#${dex}`;
  return (
    <button type="button" className="mon-chip" data-nav data-dex={dex} title={t("ip.openEntry", { name })} onClick={() => navigate("detail", { dex })}>
      <SpeciesSprite species={species ?? { dex, hasSprite: false }} size={28} />
      <span>{name}</span>
      {extra != null ? <b>{extra}</b> : null}
    </button>
  );
});

function Row({ icon, title, children, none, index, kind }: { icon: ReactNode; title: string; children: ReactNode; none?: boolean; index: number; kind: string }) {
  return (
    <div className={`ob-row${none ? " ob-none" : ""}`} style={{ ["--i" as string]: index }} data-row={kind}>
      <span className="ob-ico" aria-hidden="true">
        {icon}
      </span>
      <div className="ob-body">
        <div className="ob-title">{title}</div>
        <div className="ob-text">{children}</div>
      </div>
    </div>
  );
}

function ObtainRow({ route, index, lang, uiLang, species, biomes }: { route: ItemObtainRoute; index: number; lang: UiLanguage; uiLang: UiLanguage; species: Map<number, SpeciesSummary>; biomes: BiomeLabels | null }) {
  const t = useT();
  switch (route.kind) {
    case "craftable":
      return (
        <Row icon={<Hammer />} title={t("ip.craft")} index={index} kind="craftable">
          <span className="badge badge-uncommon">
            {route.recipeTypes.length ? t("ip.craftTypes", { types: recipeLabels(route.recipeTypes, uiLang).join(", ") }) : t("ip.craftYes")}
          </span>
        </Row>
      );
    case "drop":
      return (
        <Row icon={<Gift />} title={t("ip.drop")} index={index} kind="drop">
          <span className="mon-chips">
            {route.from.map((d) => (
              <MonChip key={d.dex} dex={d.dex} species={species.get(d.dex)} lang={lang} extra={d.percentage != null ? `${d.percentage}%` : (d.quantityRange ?? undefined)} />
            ))}
          </span>
        </Row>
      );
    case "plantable":
      return (
        <Row icon={<Sprout />} title={t("ip.plant")} index={index} kind="plantable">
          {route.biomeTags.length ? (
            <>
              <span>{t("ip.plantText")}</span>
              <span className="chips">
                {route.biomeTags.map((b) => (
                  <span key={b} className="biome">
                    {biomeLabel(b, biomes)[uiLang]}
                  </span>
                ))}
              </span>
            </>
          ) : (
            <span>{t("ip.plantAny")}</span>
          )}
        </Row>
      );
    case "structureLoot":
      return (
        <Row icon={<PackageOpen />} title={t("ip.loot")} index={index} kind="structureLoot">
          <span className="chips">
            {lootLabels(route.tables).map((l) => (
              <span key={l} className="biome">
                {l}
              </span>
            ))}
          </span>
        </Row>
      );
    case "fishing":
      return (
        <Row icon={<Fish />} title={t("ip.fish")} index={index} kind="fishing">
          {t("ip.fishText")}
        </Row>
      );
    case "fossilRevive":
      return (
        <Row icon={<Bone />} title={t("ip.revive")} index={index} kind="fossilRevive">
          <span className="mon-chips">
            {route.species.map((dex) => (
              <MonChip key={dex} dex={dex} species={species.get(dex)} lang={lang} />
            ))}
          </span>
        </Row>
      );
    default:
      return (
        <Row icon={<Info />} title={t("obtain.none")} none index={index} kind="none">
          {t("obtain.noneHint")}
        </Row>
      );
  }
}

function UsedIn({ item, ball, lang, uiLang, species }: { item: ItemInfo; ball: BallInfo | undefined; lang: UiLanguage; uiLang: UiLanguage; species: Map<number, SpeciesSummary> }) {
  const t = useT();
  const rows: ReactNode[] = [];
  const u = item.usedIn;
  if (u.evolutions.length) {
    rows.push(
      <Row key="evo" icon={<CircleArrowUp />} title={t("ip.evolves")} index={rows.length} kind="evolutions">
        <span className="mon-chips">
          {u.evolutions.map((e) => (
            <span key={`${e.from}-${e.to}`} className="evo-pair">
              <MonChip dex={e.from} species={species.get(e.from)} lang={lang} />
              <ArrowRight aria-hidden="true" />
              <MonChip dex={e.to} species={species.get(e.to)} lang={lang} />
            </span>
          ))}
        </span>
      </Row>,
    );
  }
  if (u.fossils.length) {
    rows.push(
      <Row key="fossil" icon={<Bone />} title={t("ip.revive")} index={rows.length} kind="fossils">
        <span className="mon-chips">
          {u.fossils.map((dex) => (
            <MonChip key={dex} dex={dex} species={species.get(dex)} lang={lang} />
          ))}
        </span>
      </Row>,
    );
  }
  if (u.forms.length) {
    rows.push(
      <Row key="form" icon={<Sparkles />} title={t("ip.form")} index={rows.length} kind="forms">
        <span className="mon-chips">
          {u.forms.map((f) => (
            <MonChip key={`${f.dex}-${f.form}`} dex={f.dex} species={species.get(f.dex)} lang={lang} extra={f.form} />
          ))}
        </span>
      </Row>,
    );
  }
  if (ball) {
    const m = ballMultiplier(ball);
    const text = m.kind === "flat" ? m.text : m.kind === "range" ? t("ball.range", { w: m.worst, b: m.best }) : t("ball.guaranteed");
    rows.push(
      <Row key="ball" icon={<Target />} title={t("ip.mult")} index={rows.length} kind="ball">
        <b>{text}</b>
        <span>{ball.effect[uiLang] || ball.effect.en}</span>
      </Row>,
    );
  }
  if (showsEffect(item)) {
    rows.push(
      <Row key="effect" icon={<HeartPulse />} title={t("ip.effect")} index={rows.length} kind="effect">
        {item.description![uiLang] || item.description!.en}
      </Row>,
    );
  }
  if (!rows.length) return null;
  return (
    <section className="panel item-used" style={{ ["--i" as string]: 2 }}>
      <h3>{t("ip.used")}</h3>
      <div className="ob-list">{rows}</div>
    </section>
  );
}

function ItemHero({ item, name, lang, uiLang, unknown }: { item: ItemInfo | null; name: ReturnType<typeof termPair>; lang: UiLanguage; uiLang: UiLanguage; unknown: boolean }) {
  const t = useT();
  const src = itemTextureUrl(item?.texture);
  const cat = item ? CATEGORY_CLASS[item.category] : "other";
  const desc = item?.description ? item.description[uiLang] || item.description.en : null;
  return (
    <section className={`item-hero card cat-${cat}`} data-lang={lang}>
      <div className="item-hero-tile">{src ? <img src={src} alt="" /> : <Package aria-hidden="true" />}</div>
      <div className="item-hero-info">
        <span className="badge badge-common">{unknown ? t("ip.otherMod") : t(CATEGORY_LABEL[item!.category])}</span>
        <h2>{name.primary}</h2>
        {name.secondary ? <div className="item-alt">{name.secondary}</div> : null}
        <p className="item-hero-desc">{unknown ? t("ip.otherModHint") : (desc ?? t("ip.noDesc"))}</p>
        {item?.cooking?.effectNote === "pending" ? (
          <div className="notice item-cooking-note">
            <Info aria-hidden="true" />
            <span>{t("ip.cookingPending")}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ItemBody({ itemId, items, balls, biomes }: { itemId: string; items: Record<string, ItemInfo>; balls: BallsFile; biomes: BiomeLabels | null }) {
  const t = useT();
  const lang = useTermsLanguage("itempage");
  const uiLang = usePreferencesStore((s) => s.uiLanguage);
  const species = useSpeciesMap();
  const item = items[itemId] ?? null;
  const unknown = item === null;
  const name = termPair(item ? item.name : unknownItemName(itemId), lang);
  const ball = useMemo(() => (item?.usedIn.ball ? balls.find((b) => b.itemId === itemId) : undefined), [item, balls, itemId]);
  return (
    <div className="item-body" data-item={itemId}>
      <ItemHero item={item} name={name} lang={lang} uiLang={uiLang} unknown={unknown} />
      <section className="panel item-obtain" style={{ ["--i" as string]: 1 }}>
        <h3>{t("ip.obtain")}</h3>
        <div className="ob-list">
          {obtainRows(item).map((r, i) => (
            <ObtainRow key={`${r.kind}-${i}`} route={r} index={i} lang={lang} uiLang={uiLang} species={species} biomes={biomes} />
          ))}
        </div>
      </section>
      {item ? <UsedIn item={item} ball={ball} lang={lang} uiLang={uiLang} species={species} /> : null}
    </div>
  );
}

export function ItemScreen({ params }: ScreenProps) {
  const t = useT();
  const { goBack } = useNavigationActions();
  const itemId = (params as { itemId?: string }).itemId ?? "";
  const data = useLoader(loadItemPageData, []);
  return (
    <div className="item-screen">
      <div className="item-page-head">
        <button type="button" className="detail-back" onClick={() => goBack()}>
          <ArrowLeft aria-hidden="true" />
          {t("ip.back")}
        </button>
        <TermsToggle cardKey="itempage" />
      </div>
      {data.error ? (
        <InlineError onRetry={data.retry} />
      ) : data.data ? (
        <ItemBody itemId={itemId} items={data.data[0]} balls={data.data[1]} biomes={data.data[2]} />
      ) : (
        <PokeballSpinner />
      )}
    </div>
  );
}
