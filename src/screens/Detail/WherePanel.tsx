// Onde encontrar + Como obter (F5.1; porta whereHTML app.js:857-869 SEM o ramo noSpawn e obtainHTML app.js:822-837,
// style.css:604-646). Raridade principal + secundarias (linha omitida se primary == null, RF-10), TODAS as entradas
// de spawn (RF-115, colapsa apos 6), drops clicaveis e rotas "Como obter" na ordem recebida (RF-26).
import { ArrowUpCircle, Bone, Egg, Puzzle } from "lucide-react";
import { memo, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Badge } from "../../components/Badge";
import { ArrowRight, Cloud, Info, MapPin, Moon, Sun } from "../../components/Icon";
import { TermsToggle } from "../../components/TermsToggle";
import { loadBiomes } from "../../data/loaders";
import type { BiomeLabels, ItemsFile, LocalizedText, ObtainRoute, RarityBucket, SpawnEntry, SpeciesDetail, SpeciesDrop } from "../../data/types";
import { hasMessage, useT, type TranslateFn } from "../../i18n/useT";
import { useNavigationActions } from "../../navigation/useNavigation";
import { useTermsLanguage } from "../../state/preferences-store";
import type { UiLanguage } from "../../storage/types";
import { RARITY_BADGE } from "../Dex/PokemonCard";
import { SpeciesSprite } from "../Home/SpeciesSprite";
import { useSpeciesByDex } from "../Home/TeamSlots";
import { methodParts, useItems } from "./EvolutionPanel";
import { ItemLink, itemDisplayName } from "./ItemLink";

export const SPAWN_COLLAPSE_AFTER = 6;

/** Rotulo do bioma: biomes.json (tag exata, com ou sem #), senao id humanizado; tag custom de lendario -> "Bioma especial". */
export function biomeText(tag: string, biomes: BiomeLabels | null, lang: UiLanguage, t: TranslateFn): string {
  const hit = biomes?.[tag] ?? biomes?.[tag.startsWith("#") ? tag.slice(1) : `#${tag}`];
  if (hit) return hit[lang] || hit.en;
  const path = tag.replace(/^#/, "");
  const local = path.includes(":") ? path.slice(path.indexOf(":") + 1) : path;
  const human = local.replace(/^is_/, "").replace(/[_/]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  if (/^legendary_spawns/.test(path)) return t("where.specialBiome", { name: human });
  return human;
}

export function contextText(context: string, t: TranslateFn): string {
  const key = `where.ctx.${context}`;
  return hasMessage(key) ? t(key) : context.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function eggGroupText(group: string, t: TranslateFn): string {
  const key = `egg.${group}`;
  return hasMessage(key) ? t(key) : group.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function addonText(addon: string, t: TranslateFn): string {
  const key = `obtain.addon.${addon}`;
  return hasMessage(key) ? t(key) : addon.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function useBiomes(): BiomeLabels | null {
  const [biomes, setBiomes] = useState<BiomeLabels | null>(null);
  useEffect(() => {
    let alive = true;
    loadBiomes().then(
      (data) => alive && setBiomes(data),
      (err: unknown) => console.warn("[detail] loadBiomes failed", err),
    );
    return () => {
      alive = false;
    };
  }, []);
  return biomes;
}

function RarityBadge({ bucket, small }: { bucket: RarityBucket; small?: boolean }) {
  const t = useT();
  const r = RARITY_BADGE[bucket];
  return (
    <Badge className={`${r.cls}${small ? " badge-sm" : ""}`} title={bucket}>
      {t(r.key)}
    </Badge>
  );
}

function TimeIcon({ range }: { range: SpawnEntry["timeRange"] }) {
  if (range === "day") return <Sun aria-hidden="true" />;
  if (range === "night") return <Moon aria-hidden="true" />;
  return <Cloud aria-hidden="true" />;
}

const SpawnEntryRow = memo(function SpawnEntryRow({ entry, biomes, lang, index }: { entry: SpawnEntry; biomes: BiomeLabels | null; lang: UiLanguage; index: number }) {
  const t = useT();
  const conds: ReactNode[] = [];
  conds.push(
    <span className="cond" key="time">
      <TimeIcon range={entry.timeRange} />
      {t(entry.timeRange === "day" ? "cond.day" : entry.timeRange === "night" ? "cond.night" : "cond.any")}
    </span>,
  );
  if (entry.canSeeSky != null)
    conds.push(
      <span className="cond" key="sky">
        {t(entry.canSeeSky ? "cond.sky" : "where.covered")}
      </span>,
    );
  if (entry.skyLight)
    conds.push(
      <span className="cond" key="light">
        {t("where.skyLight", { min: entry.skyLight.min, max: entry.skyLight.max })}
      </span>,
    );
  return (
    <div className="spawn-entry" data-spawn={entry.id} style={{ "--i": index } as CSSProperties}>
      <div className="spawn-head">
        <RarityBadge bucket={entry.bucket} />
        <span className="spawn-level">
          {t("where.level")} <b>{entry.level}</b>
        </span>
        <span className="spawn-ctx">{contextText(entry.context, t)}</span>
        {entry.source !== "cobblemon" ? <span className="tag">{entry.source === "allthemons" ? t("obtain.packTag") : addonText(entry.source, t)}</span> : null}
      </div>
      <div className="chips">
        {entry.biomes.map((b) => (
          <span className="biome" key={b} data-biome={b}>
            {biomeText(b, biomes, lang, t)}
          </span>
        ))}
        {entry.structures.map((s) => (
          <span className="biome biome-structure" key={s}>
            {biomeText(s, null, lang, t)}
          </span>
        ))}
      </div>
      <div className="chips">{conds}</div>
    </div>
  );
});

function SpawnList({ spawns, biomes, lang }: { spawns: readonly SpawnEntry[]; biomes: BiomeLabels | null; lang: UiLanguage }) {
  const t = useT();
  const [all, setAll] = useState(false);
  const shown = all ? spawns : spawns.slice(0, SPAWN_COLLAPSE_AFTER);
  return (
    <div className="spawn-list">
      {shown.map((e, i) => (
        <SpawnEntryRow key={e.id} entry={e} biomes={biomes} lang={lang} index={i} />
      ))}
      {spawns.length > SPAWN_COLLAPSE_AFTER ? (
        <button type="button" className="btn btn-ghost spawn-more" onClick={() => setAll((v) => !v)}>
          {all ? t("where.showLess") : t("where.showAll", { n: spawns.length })}
        </button>
      ) : null}
    </div>
  );
}

function Drops({ drops, items, lang }: { drops: readonly SpeciesDrop[]; items: ItemsFile | null; lang: UiLanguage }) {
  const t = useT();
  if (drops.length === 0) return null;
  return (
    <div className="drops">
      <span className="k">{t("where.drops")}</span>
      {drops.map((d) => (
        <div className="drop" key={d.item} data-drop={d.item}>
          <ItemLink id={d.item} items={items} lang={lang} className="drop-name it-link" size={24} />
          <span className="pct">{d.percentage != null ? `${d.percentage}%` : (d.quantityRange ?? "")}</span>
          {d.percentage != null ? (
            <div className="drop-bar">
              <i style={{ "--w": `${Math.min(100, d.percentage)}%` } as CSSProperties} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function name(text: LocalizedText | undefined, lang: UiLanguage, fallback: string): string {
  return text ? text[lang] || text.en : fallback;
}

function entrySummary(entries: readonly SpawnEntry[] | undefined, biomes: BiomeLabels | null, lang: UiLanguage, t: TranslateFn): ReactNode {
  const first = entries?.[0];
  if (!first) return null;
  const tags = [...new Set(entries.flatMap((e) => e.biomes))].slice(0, 4);
  return (
    <>
      <RarityBadge bucket={first.bucket} small />
      <b>
        {t("where.level")} {first.level}
      </b>
      <span>{tags.map((b) => biomeText(b, biomes, lang, t)).join(", ")}</span>
    </>
  );
}

function ObtainRow({ icon, title, children, extra, kind }: { icon: ReactNode; title: string; children?: ReactNode; extra?: ReactNode; kind: string }) {
  return (
    <div className={`ob-row${kind === "none" ? " ob-none" : ""}`} data-obtain={kind}>
      <span className="ob-ico">{icon}</span>
      <div className="ob-body">
        <div className="ob-title">{title}</div>
        {children ? <div className="ob-text">{children}</div> : null}
      </div>
      {extra}
    </div>
  );
}

/**
 * Auditoria S2 (SPEC 5.1.5 / F5.1 passo 3): a unica rota e `none` mas a especie nasce no mundo (ex. Magby, Mantyke,
 * bebes `undiscovered`) -> o painel aponta para "Onde encontrar" em vez de dizer "sem rota".
 */
export function isWildOnly(routes: readonly ObtainRoute[], spawnCount: number): boolean {
  return spawnCount > 0 && routes.every((r) => r.kind === "none");
}

function ObtainPanel({
  routes,
  items,
  biomes,
  lang,
  spawnCount,
}: {
  routes: readonly ObtainRoute[];
  items: ItemsFile | null;
  biomes: BiomeLabels | null;
  lang: UiLanguage;
  spawnCount: number;
}) {
  const t = useT();
  const byDex = useSpeciesByDex();
  const { navigate } = useNavigationActions();
  const list = routes.length ? routes : ([{ kind: "none" }] as const);
  const wildOnly = isWildOnly(list, spawnCount);
  return (
    <div className="obtain">
      <div className="ob-head">{t("obtain.title")}</div>
      <div className="ob-list">
        {list.map((r, i) => {
          switch (r.kind) {
            case "evolution": {
              const pre = byDex.get(r.from);
              const preName = name(pre?.name, lang, r.fromSlug);
              const method = [
                ...(r.edge.requiredItem ? [itemDisplayName(items, r.edge.requiredItem, lang)] : []),
                ...methodParts(r.edge, t, lang, (id) => itemDisplayName(items, id, lang)),
              ].join(" + ");
              return (
                <ObtainRow
                  key={i}
                  kind="evolution"
                  icon={<ArrowUpCircle aria-hidden="true" />}
                  title={t("obtain.evo")}
                  extra={
                    pre ? (
                      <button type="button" className="ob-link" data-nav="" data-open={r.from} onClick={() => navigate("detail", { dex: r.from })}>
                        <SpeciesSprite species={pre} size={32} />
                        <span>{preName}</span>
                        <ArrowRight aria-hidden="true" />
                      </button>
                    ) : null
                  }
                >
                  {t("obtain.evolveFrom", { name: preName, method: method || t("evo.levelUp") })}
                </ObtainRow>
              );
            }
            case "fossil":
              return (
                <ObtainRow key={i} kind="fossil" icon={<Bone aria-hidden="true" />} title={t("obtain.fossil")}>
                  <span>{t("obtain.fossilText")}</span>
                  {r.items.map((id, j) => (
                    <span key={id} className="ob-item">
                      {j > 0 ? <span className="muted">{"/"}</span> : null}
                      <ItemLink id={id} items={items} lang={lang} />
                    </span>
                  ))}
                </ObtainRow>
              );
            case "packSpawn":
              return (
                <ObtainRow key={i} kind="packSpawn" icon={<MapPin aria-hidden="true" />} title={t("obtain.spawn")}>
                  {entrySummary(r.entries, biomes, lang, t)}
                  <span className="tag">{t("obtain.packTag")}</span>
                </ObtainRow>
              );
            case "addon":
              return (
                <ObtainRow key={i} kind="addon" icon={<Puzzle aria-hidden="true" />} title={`${t("obtain.addon")}: ${addonText(r.addon, t)}`}>
                  <span>{t("obtain.viaAddon", { addon: addonText(r.addon, t) })}</span>
                  {entrySummary(r.entries, biomes, lang, t)}
                </ObtainRow>
              );
            case "breeding":
              return (
                <ObtainRow key={i} kind="breeding" icon={<Egg aria-hidden="true" />} title={t("obtain.breed")}>
                  {t("obtain.breedText", { g: r.eggGroups.map((g) => eggGroupText(g, t)).join(" / ") })}
                </ObtainRow>
              );
            default:
              return wildOnly ? (
                <ObtainRow key={i} kind="none" icon={<MapPin aria-hidden="true" />} title={t("obtain.wildOnly")} />
              ) : (
                <ObtainRow key={i} kind="none" icon={<Info aria-hidden="true" />} title={t("obtain.none")}>
                  {t("obtain.noneHint")}
                </ObtainRow>
              );
          }
        })}
      </div>
    </div>
  );
}

export const WherePanel = memo(function WherePanel({ detail }: { detail: SpeciesDetail }) {
  const t = useT();
  const lang = useTermsLanguage("where");
  const items = useItems();
  const biomes = useBiomes();
  const { rarity, spawns, drops, obtain } = detail;
  return (
    <div className="panel where-panel" id="where-panel" style={{ "--i": 6 } as CSSProperties}>
      <div className="panel-head">
        <h3>{t("detail.where")}</h3>
        <TermsToggle cardKey="where" />
      </div>
      {rarity.primary || spawns.length || drops.length ? (
        <div className="where">
          {rarity.primary ? (
            <div className="kv where-rarity">
              <span className="k">{t("where.bucket")}</span>
              <div className="chips">
                <RarityBadge bucket={rarity.primary} />
                {rarity.secondary.map((b) => (
                  <RarityBadge key={b} bucket={b} small />
                ))}
              </div>
            </div>
          ) : null}
          {spawns.length ? <SpawnList spawns={spawns} biomes={biomes} lang={lang} /> : null}
          <Drops drops={drops} items={items} lang={lang} />
        </div>
      ) : null}
      <ObtainPanel routes={obtain} items={items} biomes={biomes} lang={lang} spawnCount={spawns.length} />
    </div>
  );
});
