// Pagina do item (F9.3; porta itemPageBodyHTML/renderItemPage, app.js:883-915): hero com textura pixelada, Como obter
// honesto (RF-68/69: receita so "Sim", drops, plantavel, loot, pesca, fossil, drop de treinador e as fontes do contrato v2: bloco, mob,
// missao, loja de BP, estrutura, ritual, troca, worldgen, mecanica especial; sem rota ou nao obtivel = .ob-none; listas longas com
// "e mais N" expansivel) e Usado em (RF-70:
// evolucoes, fosseis, formas, bola). Todo item citado no app abre aqui; Voltar restaura a origem (pilha F1.3).
import "./item.css";
import { memo, useMemo, useState, type ReactNode } from "react";
import { Ban, Bone, CircleArrowUp, Fish, Flame, Gift, Hammer, Handshake, Landmark, Lightbulb, Mountain, PackageOpen, Pickaxe, ScrollText, Skull, Sprout, Store, Swords } from "lucide-react";
import type { ScreenProps } from "../../components/ScreenRouter";
import { ArrowLeft, ArrowRight, HeartPulse, Info, Package, Sparkles, Target } from "../../components/Icon";
import { InlineError } from "../../components/InlineError";
import { itemTextureUrl } from "../../components/ItemTile";
import { PokeballSpinner } from "../../components/PokeballSpinner";
import { TermsToggle } from "../../components/TermsToggle";
import type { BallInfo, BallsFile, BiomeLabels, ItemInfo, ItemObtainRoute, ItemTrainerDrop, SeriesFile, SpeciesSummary } from "../../data/types";
import { loadBalls, loadBiomes, loadItems, loadSeries } from "../../data/loaders";
import { termPair, useT } from "../../i18n/useT";
import { useNavigationActions } from "../../navigation/useNavigation";
import { useDatasetStore } from "../../state/dataset-store";
import { usePreferencesStore, useTermsLanguage } from "../../state/preferences-store";
import type { UiLanguage } from "../../storage/types";
import { ballMultiplier } from "../Balls/ball-model";
import { SpeciesSprite } from "../Home/SpeciesSprite";
import { BaitEffectsPanel, PotRecipeList } from "./BaitParts";
import { BerryObtainRow } from "./BerryParts";
import { CATEGORY_CLASS, CATEGORY_LABEL } from "../Items/item-model";
import { biomeLabel } from "../Trainers/trainer-model";
import { useLoader } from "../Trainers/use-loader";
import {
  berryObtainExtras,
  capList,
  chanceLabel,
  idLabels,
  lootLabels,
  namedRefLabels,
  pageObtainRoutes,
  questLabel,
  recipeLabels,
  seriesTitle,
  showsEffect,
  traderKey,
  uniqueEvolutions,
  unknownItemName,
  unobtainableKey,
} from "./item-page-model";

const loadItemPageData = () => Promise.all([loadItems(), loadBalls(), loadBiomes().catch(() => null)]);
/** Titulos das series (Drop de treinador): carregados a parte, sem segurar a pagina; falha cai no id humanizado. */
const loadSeriesTitles = () => loadSeries().catch((): SeriesFile | null => null);

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

/**
 * Treinador que dropa o item (U5b): chip com o nome + chance, abre o treinador na tela Treinadores (serie em
 * `ui.seriesId`, acordeao em `ui.openTrainerId`); serie e "so na 1a vitoria" em pilulas. `levelRange` fica de fora:
 * o pipeline nao confirmou se a condicao e o nivel do treinador ou do jogador.
 */
function TrainerDropChip({ drop, series, uiLang }: { drop: ItemTrainerDrop; series: SeriesFile | null; uiLang: UiLanguage }) {
  const t = useT();
  const { navigate } = useNavigationActions();
  const name = drop.name ?? drop.id;
  const chance = chanceLabel(drop.chance);
  const body = (
    <>
      <Swords aria-hidden="true" />
      <span>{name}</span>
      {chance != null ? <b>{chance}</b> : null}
    </>
  );
  const seriesId = drop.series;
  return (
    <span className="ob-trainer" data-trainer={drop.id}>
      {seriesId != null ? (
        <button
          type="button"
          className="mon-chip trainer-chip"
          data-nav
          title={t("ip.openTrainer", { name })}
          onClick={() => navigate("trainers", {}, { seriesId, openTrainerId: drop.id })}
        >
          {body}
        </button>
      ) : (
        <span className="mon-chip trainer-chip">{body}</span>
      )}
      {seriesId != null ? <span className="biome">{seriesTitle(seriesId, series, uiLang)}</span> : null}
      {drop.firstDefeatOnly ? <span className="biome ob-first">{t("ip.firstWinOnly")}</span> : null}
    </span>
  );
}

/**
 * Lista de uma fonte (chips, Pokemon, treinadores) com limite (U7e): mostra os primeiros `OBTAIN_LIST_CAP` e um chip
 * "e mais N" que abre o resto; aberta, "mostrar menos" fecha de novo. Vale para todas as fontes de lista.
 */
function CappedList({ entries, className }: { entries: { key: string; node: ReactNode }[]; className: string }) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const { shown, hidden } = capList(entries, expanded);
  const collapsible = expanded && capList(entries, false).hidden > 0;
  return (
    <span className={className}>
      {shown.map((e) => (
        <span key={e.key} className="ob-entry">
          {e.node}
        </span>
      ))}
      {hidden > 0 ? (
        <button type="button" className="biome ob-more" aria-expanded="false" title={t("ip.moreTitle", { n: hidden })} onClick={() => setExpanded(true)}>
          {t("ip.more", { n: hidden })}
        </button>
      ) : null}
      {collapsible ? (
        <button type="button" className="biome ob-more" aria-expanded="true" onClick={() => setExpanded(false)}>
          {t("ip.less")}
        </button>
      ) : null}
    </span>
  );
}

/** Chips de texto (.biome) com limite. */
export function LabelChips({ labels }: { labels: readonly string[] }) {
  return <CappedList className="chips" entries={labels.map((l) => ({ key: l, node: <span className="biome">{l}</span> }))} />;
}

export function Row({ icon, title, children, none, index, kind }: { icon: ReactNode; title: string; children: ReactNode; none?: boolean; index: number; kind: string }) {
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

function ObtainRow({
  route,
  index,
  lang,
  uiLang,
  species,
  biomes,
  series,
  items,
}: {
  route: ItemObtainRoute;
  index: number;
  lang: UiLanguage;
  uiLang: UiLanguage;
  species: Map<number, SpeciesSummary>;
  biomes: BiomeLabels | null;
  series: SeriesFile | null;
  items: Record<string, ItemInfo>;
}) {
  const t = useT();
  switch (route.kind) {
    case "craftable":
      return (
        <Row icon={<Hammer />} title={t("ip.craft")} index={index} kind="craftable">
          <span className="badge badge-uncommon">
            {route.recipeTypes.length ? t("ip.craftTypes", { types: recipeLabels(route.recipeTypes, uiLang).join(", ") }) : t("ip.craftYes")}
          </span>
          {route.potRecipes?.length ? <PotRecipeList recipes={route.potRecipes} items={items} lang={lang} /> : null}
        </Row>
      );
    case "drop":
      return (
        <Row icon={<Gift />} title={t("ip.drop")} index={index} kind="drop">
          <CappedList
            className="mon-chips"
            entries={route.from.map((d) => ({
              key: String(d.dex),
              node: <MonChip dex={d.dex} species={species.get(d.dex)} lang={lang} extra={d.percentage != null ? `${d.percentage}%` : (d.quantityRange ?? undefined)} />,
            }))}
          />
        </Row>
      );
    case "plantable":
      return (
        <Row icon={<Sprout />} title={t("ip.plant")} index={index} kind="plantable">
          {route.biomeTags.length ? (
            <>
              <span>{t("ip.plantText")}</span>
              <LabelChips labels={[...new Set(route.biomeTags.map((b) => biomeLabel(b, biomes)[uiLang]))]} />
            </>
          ) : (
            <span>{t("ip.plantAny")}</span>
          )}
        </Row>
      );
    case "structureLoot":
      return (
        <Row icon={<PackageOpen />} title={t("ip.loot")} index={index} kind="structureLoot">
          <LabelChips labels={lootLabels(route.tables)} />
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
          <CappedList className="mon-chips" entries={route.species.map((dex) => ({ key: String(dex), node: <MonChip dex={dex} species={species.get(dex)} lang={lang} /> }))} />
        </Row>
      );
    case "trainerDrop":
      return (
        <Row icon={<Swords />} title={t("ip.trainerDrop")} index={index} kind="trainerDrop">
          <span>{t("ip.trainerDropText")}</span>
          <CappedList className="ob-trainers" entries={route.trainers.map((d) => ({ key: d.id, node: <TrainerDropChip drop={d} series={series} uiLang={uiLang} /> }))} />
        </Row>
      );
    case "blockDrop":
      return (
        <Row icon={<Pickaxe />} title={t("ip.blockDrop")} index={index} kind="blockDrop">
          <span>{t("ip.blockDropText")}</span>
          <LabelChips labels={namedRefLabels(route.blocks, lang)} />
        </Row>
      );
    case "mobDrop":
      return (
        <Row icon={<Skull />} title={t("ip.mobDrop")} index={index} kind="mobDrop">
          <span>{t("ip.mobDropText")}</span>
          <LabelChips labels={namedRefLabels(route.mobs, lang)} />
        </Row>
      );
    case "questReward":
      return (
        <Row icon={<ScrollText />} title={t("ip.questReward")} index={index} kind="questReward">
          <CappedList
            className="ob-quests"
            entries={route.quests.map((q, i) => {
              const { title, chapter } = questLabel(q, lang);
              return {
                key: `${i}-${chapter ?? ""}-${title ?? ""}`,
                node: (
                  <span className="biome ob-quest">
                    <span>{title ?? t("ip.questUntitled")}</span>
                    {chapter ? <small>{chapter}</small> : null}
                  </span>
                ),
              };
            })}
          />
        </Row>
      );
    case "shop":
      return (
        <Row icon={<Store />} title={t(`ip.shop.${route.shop}`)} index={index} kind="shop">
          {route.price != null ? <b>{t("ip.shopPrice", { price: route.price })}</b> : <span>{t("ip.shopNoPrice")}</span>}
        </Row>
      );
    case "structurePlaced":
      return (
        <Row icon={<Landmark />} title={t("ip.structurePlaced")} index={index} kind="structurePlaced">
          <span>{t("ip.structurePlacedText")}</span>
          <LabelChips labels={namedRefLabels(route.structures, lang)} />
        </Row>
      );
    case "ritual":
      return (
        <Row icon={<Flame />} title={t("ip.ritual")} index={index} kind="ritual">
          <LabelChips labels={idLabels(route.rituals)} />
        </Row>
      );
    case "trade":
      return (
        <Row icon={<Handshake />} title={t("ip.trade")} index={index} kind="trade">
          <LabelChips labels={[...new Set(route.traders)].map((tr) => t(traderKey(tr)))} />
        </Row>
      );
    case "worldgen":
      return (
        <Row icon={<Mountain />} title={t("ip.worldgen")} index={index} kind="worldgen">
          <LabelChips labels={idLabels(route.features)} />
        </Row>
      );
    case "special":
      return (
        <Row icon={<Lightbulb />} title={t("ip.special")} index={index} kind="special">
          <span data-evidence={route.evidence}>{route.note[uiLang] || route.note.en}</span>
        </Row>
      );
    case "unobtainable":
      return (
        <Row icon={<Ban />} title={t(unobtainableKey(route.reason))} none index={index} kind="unobtainable">
          {t("ip.unobtainableHint")}
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
          {uniqueEvolutions(u.evolutions).map((e) => (
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
        <p className="item-hero-desc">{unknown ? t("ip.otherModHint") : (desc ?? t("item.noDesc"))}</p>
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

function ItemBody({ itemId, items, balls, biomes, series }: { itemId: string; items: Record<string, ItemInfo>; balls: BallsFile; biomes: BiomeLabels | null; series: SeriesFile | null }) {
  const t = useT();
  const lang = useTermsLanguage("itempage");
  const uiLang = usePreferencesStore((s) => s.uiLanguage);
  const species = useSpeciesMap();
  const item = items[itemId] ?? null;
  const unknown = item === null;
  const name = termPair(item ? item.name : unknownItemName(itemId), lang);
  const ball = useMemo(() => (item?.usedIn.ball ? balls.find((b) => b.itemId === itemId) : undefined), [item, balls, itemId]);
  const routes = pageObtainRoutes(item);
  const extras = berryObtainExtras(item);
  return (
    <div className="item-body" data-item={itemId}>
      <ItemHero item={item} name={name} lang={lang} uiLang={uiLang} unknown={unknown} />
      <section className="panel item-obtain" style={{ ["--i" as string]: 1 }}>
        <h3>{t("ip.obtain")}</h3>
        <div className="ob-list">
          {routes.map((r, i) => (
            <ObtainRow key={`${r.kind}-${i}`} route={r} index={i} lang={lang} uiLang={uiLang} species={species} biomes={biomes} series={series} items={items} />
          ))}
          {extras.map((k, j) => (
            <BerryObtainRow key={k} kind={k} item={item!} index={routes.length + j} biomes={biomes} uiLang={uiLang} items={items} lang={lang} />
          ))}
        </div>
      </section>
      {item?.bait && item.bait.effects.length ? <BaitEffectsPanel bait={item.bait} lang={lang} /> : null}
      {item ? <UsedIn item={item} ball={ball} lang={lang} uiLang={uiLang} species={species} /> : null}
    </div>
  );
}

export function ItemScreen({ params }: ScreenProps) {
  const t = useT();
  const { goBack } = useNavigationActions();
  const itemId = (params as { itemId?: string }).itemId ?? "";
  const data = useLoader(loadItemPageData, []);
  const series = useLoader(loadSeriesTitles, []);
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
        <ItemBody itemId={itemId} items={data.data[0]} balls={data.data[1]} biomes={data.data[2]} series={series.data ?? null} />
      ) : (
        <PokeballSpinner />
      )}
    </div>
  );
}
