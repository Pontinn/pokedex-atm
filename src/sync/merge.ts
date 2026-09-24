// Mesclar/Substituir (SPEC 5.4.4, RF-78). Nunca toca `meta`.
import { mergeHistory } from "../domain/history";
import { isTeamEmpty, normalizeTeam } from "../domain/team";
import { DOC_DEFAULTS } from "../storage/defaults";
import type { DocMap, TrainerProgressDoc } from "../storage/types";

export type MergeMode = "merge" | "replace";

function earliest(a: number | undefined, b: number | undefined): number {
  if (a === undefined) return b!;
  if (b === undefined) return a;
  return Math.min(a, b);
}

function mergeTrainerProgress(local: TrainerProgressDoc, incoming: TrainerProgressDoc): TrainerProgressDoc {
  const series: TrainerProgressDoc["series"] = structuredClone(local.series);
  for (const [sid, s] of Object.entries(incoming.series)) {
    const target = Object.hasOwn(series, sid) ? series[sid]! : (series[sid] = { defeated: {} });
    for (const [tid, v] of Object.entries(s.defeated)) {
      const prev = Object.hasOwn(target.defeated, tid) ? target.defeated[tid]?.at : undefined;
      target.defeated[tid] = { at: earliest(prev, v.at) };
    }
  }
  const receiverHasActive = local.activeSeriesId !== null || local.freeroam.active;
  return {
    schemaVersion: 1,
    activeSeriesId: receiverHasActive ? local.activeSeriesId : incoming.activeSeriesId,
    freeroam: structuredClone(receiverHasActive ? local.freeroam : incoming.freeroam),
    series,
  };
}

export function mergeDocuments(local: DocMap, incoming: Partial<DocMap>, mode: MergeMode): DocMap {
  if (mode === "replace") {
    return {
      captured: structuredClone(incoming.captured ?? DOC_DEFAULTS.captured),
      team: structuredClone(incoming.team ?? DOC_DEFAULTS.team),
      history: structuredClone(incoming.history ?? DOC_DEFAULTS.history),
      trainerProgress: structuredClone(incoming.trainerProgress ?? DOC_DEFAULTS.trainerProgress),
      preferences: structuredClone(incoming.preferences ?? DOC_DEFAULTS.preferences),
      meta: structuredClone(local.meta),
    };
  }

  const captured = structuredClone(local.captured);
  for (const [dex, v] of Object.entries(incoming.captured?.entries ?? {})) {
    captured.entries[dex] = { capturedAt: earliest(captured.entries[dex]?.capturedAt, v.capturedAt) };
  }

  const localTeam = normalizeTeam(local.team.slots);
  const team =
    isTeamEmpty(localTeam) && incoming.team
      ? { schemaVersion: 1 as const, slots: normalizeTeam(incoming.team.slots) }
      : { schemaVersion: 1 as const, slots: localTeam };

  return {
    captured,
    team,
    history: { schemaVersion: 1, entries: mergeHistory(local.history.entries, incoming.history?.entries ?? []) },
    trainerProgress: incoming.trainerProgress
      ? mergeTrainerProgress(local.trainerProgress, incoming.trainerProgress)
      : structuredClone(local.trainerProgress),
    preferences: structuredClone(local.preferences),
    meta: structuredClone(local.meta),
  };
}
