// B5.1: TrainerInfo por id = arquivo de time/bag (trainers/<id>.json) + definicao de spawn/mob
// (mobs/trainers/single/<id>.json, com fallback em default.json quando o treinador nao tem mob file).
import type { LocalizedText, TrainerInfo, TrainerTeamMember } from "../../../../src/data/types";
import type { LangTable, MergedSpecies, ReportSink } from "../context";
import type { CollectedTrainers, RawEntry } from "./collect";

const strArray = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const strArrayArray = (v: unknown): string[][] =>
  Array.isArray(v) ? v.map((inner) => strArray(inner)).filter((inner) => inner.length > 0) : [];

export function humanize(id: string): string {
  return id
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** slug (Cobblemon) -> dex, a partir das especies ja mescladas (B2.2). */
export function buildSlugIndex(species: ReadonlyMap<number, MergedSpecies>): ReadonlyMap<string, number> {
  const bySlug = new Map<string, number>();
  for (const s of species.values()) bySlug.set(s.slug, s.dex);
  return bySlug;
}

function parseTeamMember(raw: unknown, slugIndex: ReadonlyMap<string, number>, trainerId: string, report: ReportSink): TrainerTeamMember {
  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const species = typeof obj.species === "string" ? obj.species : "";
  const dex = slugIndex.get(species) ?? null;
  if (species && dex === null) {
    report.warn("W_TRAINER_SPECIES_UNKNOWN", `treinador ${trainerId}: especie desconhecida "${species}"`, { trainerId, species });
  }
  return {
    species,
    dex,
    level: typeof obj.level === "number" ? obj.level : 0,
    gender: typeof obj.gender === "string" ? obj.gender : null,
    nature: typeof obj.nature === "string" ? obj.nature : null,
    ability: typeof obj.ability === "string" ? obj.ability : null,
    moveset: strArray(obj.moveset),
    heldItem: typeof obj.heldItem === "string" ? obj.heldItem : null,
  };
}

/** `type.rctmod.<type>.title` (nome do SPEC) nao existe no lang real; a chave verificada e `trainer_type.rctmod.<type>.title`. */
export function typeLabelKey(type: string): string {
  return `trainer_type.rctmod.${type}.title`;
}

function resolveTypeLabel(type: string, lang: LangTable): LocalizedText {
  return lang.text(typeLabelKey(type)) ?? { pt: humanize(type), en: humanize(type) };
}

export interface MergedTrainer {
  info: TrainerInfo;
  /** series[] do mob file (ou [] via default.json); NAO faz parte do TrainerInfo escrito (so decide em quais trainers/<serie>.json o treinador entra). */
  series: string[];
}

/** Merge de um treinador (mecanismo B5.1 passo 2); trainerId e a chave (nome do arquivo). */
export function mergeTrainer(
  id: string,
  trainerEntry: RawEntry,
  mobEntry: RawEntry | undefined,
  defaultMob: Record<string, unknown>,
  slugIndex: ReadonlyMap<string, number>,
  lang: LangTable,
  report: ReportSink,
): MergedTrainer {
  const t = trainerEntry.data;
  const mob = mobEntry?.data ?? defaultMob;
  const team = (Array.isArray(t.team) ? t.team : []).map((m) => parseTeamMember(m, slugIndex, id, report));
  const maxTeamLevel = team.length ? Math.max(...team.map((m) => m.level)) : 0;
  const type = typeof mob.type === "string" ? mob.type : "normal";
  const bag = (Array.isArray(t.bag) ? t.bag : [])
    .filter((b): b is Record<string, unknown> => typeof b === "object" && b !== null)
    .map((b) => ({ item: typeof b.item === "string" ? b.item : "", quantity: typeof b.quantity === "number" ? b.quantity : 0 }))
    .filter((b) => b.item !== "");

  const info: TrainerInfo = {
    id,
    name: typeof t.name === "string" ? t.name : humanize(id),
    type,
    typeLabel: resolveTypeLabel(type, lang),
    optional: mob.optional !== false,
    requiredDefeats: strArrayArray(mob.requiredDefeats),
    signatureItem: typeof mob.signatureItem === "string" ? mob.signatureItem : null,
    biomes: {
      whitelist: strArray(mob.biomeTagWhitelist),
      blacklist: strArray(mob.biomeTagBlacklist),
    },
    source: (mobEntry?.source ?? trainerEntry.source) as TrainerInfo["source"],
    team,
    maxTeamLevel,
    bag,
  };
  return { info, series: strArray(mob.series) };
}

/** Merge de todos os treinadores coletados; um MergedTrainer por id (trainers.trainers e a fonte da uniao de ids). */
export function mergeTrainers(
  collected: CollectedTrainers,
  species: ReadonlyMap<number, MergedSpecies>,
  lang: LangTable,
  report: ReportSink,
): Map<string, MergedTrainer> {
  const slugIndex = buildSlugIndex(species);
  const out = new Map<string, MergedTrainer>();
  for (const [id, entry] of collected.trainers) {
    const mobEntry = collected.mobs.get(id);
    out.set(id, mergeTrainer(id, entry, mobEntry, collected.defaultMob, slugIndex, lang, report));
  }
  return out;
}
