// Regras de exibicao da tela Treinadores (F8), puras e testaveis com o dataset real.
// O cap vem SEMPRE de computeSeriesCap (B6.3) sobre a serie inteira; a busca so filtra a exibicao.
import type { LevelCapConfig, LocalizedText, SeriesInfo, SpeciesSummary, TrainerInfo } from "../../data/types";
import {
  computeSeriesCap,
  computeTrainerLevel,
  isSeriesCompleted,
  isSeriesUnlocked,
  requiredDefeatsSatisfied,
  type SeriesCapResult,
} from "../../domain/level-cap";
import { normalizeSearch } from "../../domain/normalize";

export type TrainerStepState = "done" | "next" | "locked";

/** Treinadores-chave da serie (optional === false) na ordem topologica do dataset (series.keyTrainerIds, B5.2). */
export function keyTrainersOf(series: Pick<SeriesInfo, "keyTrainerIds">, trainers: readonly TrainerInfo[]): TrainerInfo[] {
  const byId = new Map(trainers.map((t) => [t.id, t]));
  const out: TrainerInfo[] = [];
  for (const id of series.keyTrainerIds) {
    const t = byId.get(id);
    if (t && !t.optional) out.push(t);
  }
  return out;
}

export interface SeriesView {
  cap: SeriesCapResult;
  /** nivel do treinador (tr-capchip "Cap -> N") por id */
  levels: Map<string, number>;
  states: Map<string, TrainerStepState>;
  /** pre-requisito pendente (vale tambem para derrotado cujo pre-requisito foi desmarcado, RF-60) */
  blocked: Set<string>;
  defeatedCount: number;
}

export function buildSeriesView(
  keyTrainers: readonly TrainerInfo[],
  allTrainers: readonly TrainerInfo[],
  defeated: ReadonlySet<string>,
  config: Pick<LevelCapConfig, "initialLevelCap" | "relativeLevelCap">,
): SeriesView {
  const cap = computeSeriesCap({ keyTrainers, allTrainers, defeated, config, mode: "series" });
  const byId = new Map(allTrainers.map((t) => [t.id, t]));
  for (const t of keyTrainers) if (!byId.has(t.id)) byId.set(t.id, t);
  const memo = new Map<string, number>();
  const availableIds = new Set(cap.available.map((t) => t.id));
  const levels = new Map<string, number>();
  const states = new Map<string, TrainerStepState>();
  const blocked = new Set<string>();
  let defeatedCount = 0;
  for (const t of keyTrainers) {
    levels.set(t.id, computeTrainerLevel(t, byId, config.relativeLevelCap, memo));
    const ok = requiredDefeatsSatisfied(t.requiredDefeats, defeated);
    if (!ok) blocked.add(t.id);
    if (defeated.has(t.id)) {
      defeatedCount++;
      states.set(t.id, "done");
    } else states.set(t.id, availableIds.has(t.id) ? "next" : "locked");
  }
  return { cap, levels, states, blocked, defeatedCount };
}

/** Texto de busca de um treinador: nome, tipo (PT/EN) e nomes PT/EN + slug de todo Pokemon do time. */
export function trainerSearchKey(t: TrainerInfo, speciesByDex: ReadonlyMap<number, SpeciesSummary>): string {
  const parts = [t.name, t.typeLabel.pt, t.typeLabel.en];
  for (const m of t.team) {
    parts.push(m.species);
    const s = m.dex === null ? undefined : speciesByDex.get(m.dex);
    if (s) parts.push(s.name.pt, s.name.en);
  }
  return normalizeSearch(parts.join(" | "));
}

/** Filtra a EXIBICAO por texto normalizado (PT e EN ao mesmo tempo). Texto vazio = todos. */
export function filterTrainers(
  trainers: readonly TrainerInfo[],
  query: string,
  speciesByDex: ReadonlyMap<number, SpeciesSummary>,
): readonly TrainerInfo[] {
  const q = normalizeSearch(query);
  if (!q) return trainers;
  return trainers.filter((t) => trainerSearchKey(t, speciesByDex).includes(q));
}

export interface SeriesChipView {
  series: SeriesInfo;
  unlocked: boolean;
  completed: boolean;
  /** requiredSeries: AND entre grupos, OR dentro; cada grupo = titulos das series */
  requires: LocalizedText[][];
}

export function seriesChips(allSeries: readonly SeriesInfo[], defeated: ReadonlySet<string>, config: Pick<LevelCapConfig, "freeroamRequiresCompletedSeries">): SeriesChipView[] {
  const byId = new Map(allSeries.map((s) => [s.id, s]));
  return allSeries.map((series) => ({
    series,
    unlocked: isSeriesUnlocked(series, allSeries, defeated, config),
    completed: series.special === null && series.keyTrainerIds.length > 0 && isSeriesCompleted(series, defeated),
    requires: series.requiredSeries
      .filter((g) => g.length > 0)
      .map((g) => g.map((id) => byId.get(id)?.title ?? { pt: id, en: id })),
  }));
}

/** Ordem do picker: series normais (ordem do dataset) e o Modo Livre por ultimo. */
export function orderSeries(allSeries: readonly SeriesInfo[]): SeriesInfo[] {
  return [...allSeries.filter((s) => s.special !== "freeroam"), ...allSeries.filter((s) => s.special === "freeroam")];
}

/** Classe de badge do tipo de treinador (style.css .role-*). */
export function roleClass(type: string): string {
  if (type === "leader") return "role-leader";
  if (type === "rival") return "role-rival";
  if (type === "e4") return "role-elite";
  if (type === "champ") return "role-champion";
  if (type.startsWith("team_") && !type.startsWith("team_allthemods")) return "role-rocket";
  return "role-other";
}

/** Rotulo de bioma do whitelist do treinador (ex. "is_cave") pelo biomes.json ("#cobblemon:is_cave"). */
export function biomeLabel(tag: string, biomes: Readonly<Record<string, LocalizedText>> | null): LocalizedText {
  if (biomes) {
    const direct = biomes[tag] ?? biomes[`#${tag}`];
    if (direct) return direct;
    const suffix = `:${tag}`;
    for (const [k, v] of Object.entries(biomes)) if (k.endsWith(suffix)) return v;
  }
  const human = tag.replace(/^#?[a-z0-9_]+:/, "").replace(/^is_/, "").replace(/[_/]/g, " ");
  const text = human.charAt(0).toUpperCase() + human.slice(1);
  return { pt: text, en: text };
}

/** Nome humanizado de um id sem entrada no items.json (ex. "minecraft:gunpowder" -> "Gunpowder"). */
export function humanizeId(id: string): string {
  const path = id.includes(":") ? id.slice(id.indexOf(":") + 1) : id;
  const text = path.split("/").pop()!.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
