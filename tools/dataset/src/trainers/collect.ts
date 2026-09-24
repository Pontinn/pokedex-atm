// B5.1: coleta os treinadores (data/rctmod/trainers/**) e as definicoes de spawn/mob
// (data/rctmod/mobs/trainers/single/**, default.json) do jar rctmod e do kubejs.
// Precedencia (SPEC 5.1.1 passo 3-4): kubejs sobrescreve um id ja definido pelo jar.
import { parseJsonStrict, readJsonEntries } from "../jar-reader";
import { PipelineError } from "../lib/errors";
import type { SourceReader } from "../source-reader";

export const TRAINERS_PREFIX = "data/rctmod/trainers/";
export const MOB_SINGLE_PREFIX = "data/rctmod/mobs/trainers/single/";
export const MOB_DEFAULT_PATH = "data/rctmod/mobs/trainers/default.json";

export type TrainerSource = "rctmod" | "kubejs";

export interface RawEntry {
  source: TrainerSource;
  path: string;
  data: Record<string, unknown>;
}

export interface CollectedTrainers {
  /** id -> arquivo de time/bag (data/rctmod/trainers/<id>.json); kubejs vence em colisao de id */
  trainers: Map<string, RawEntry>;
  /** id -> definicao de spawn/mob (mobs/trainers/single/<id>.json); kubejs vence em colisao de id */
  mobs: Map<string, RawEntry>;
  /** mobs/trainers/default.json (obrigatorio no jar) */
  defaultMob: Record<string, unknown>;
}

function idFromPath(p: string): string {
  const base = p.split("/").pop() ?? p;
  return base.replace(/\.json$/, "");
}

function asObject(value: unknown, where: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new PipelineError("E_SPECIES_INVALID", "esperado objeto JSON", where);
  }
  return value as Record<string, unknown>;
}

export function collectTrainers(reader: SourceReader): CollectedTrainers {
  const trainers = new Map<string, RawEntry>();
  const mobs = new Map<string, RawEntry>();

  const jar = reader.jar("rctmod");
  const jarEntries = reader.readJar(jar, [TRAINERS_PREFIX, MOB_SINGLE_PREFIX, MOB_DEFAULT_PATH]);

  for (const { path, data } of readJsonEntries(jarEntries, TRAINERS_PREFIX, jar.fileName)) {
    trainers.set(idFromPath(path), { source: "rctmod", path, data: asObject(data, `${jar.fileName}!${path}`) });
  }
  for (const { path, data } of readJsonEntries(jarEntries, MOB_SINGLE_PREFIX, jar.fileName)) {
    mobs.set(idFromPath(path), { source: "rctmod", path, data: asObject(data, `${jar.fileName}!${path}`) });
  }
  const defaultBytes = jarEntries.get(MOB_DEFAULT_PATH);
  if (!defaultBytes) {
    throw new PipelineError("E_SNAPSHOT_INCOMPLETE", "mobs/trainers/default.json ausente", `${jar.fileName}!${MOB_DEFAULT_PATH}`);
  }
  const defaultMob = asObject(
    parseJsonStrict(defaultBytes, `${jar.fileName}!${MOB_DEFAULT_PATH}`),
    `${jar.fileName}!${MOB_DEFAULT_PATH}`,
  );

  // kubejs/data/rctmod/** (precedencia 4): sobrescreve um id ja existente no jar (report nao aqui; B5.1 passo 3)
  const kubejs = reader.readTree("kubejs");
  for (const { path, data } of readJsonEntries(kubejs, TRAINERS_PREFIX, "kubejs")) {
    trainers.set(idFromPath(path), { source: "kubejs", path, data: asObject(data, `kubejs!${path}`) });
  }
  for (const { path, data } of readJsonEntries(kubejs, MOB_SINGLE_PREFIX, "kubejs")) {
    mobs.set(idFromPath(path), { source: "kubejs", path, data: asObject(data, `kubejs!${path}`) });
  }

  return { trainers, mobs, defaultMob };
}
