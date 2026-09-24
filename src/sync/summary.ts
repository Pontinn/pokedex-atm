// Resumo exibido antes de aplicar (SPEC 5.4.4, RF-75): contagens e ids que o dataset local nao conhece.
import { toKnownSet, type KnownDex } from "../storage/filter-known";
import type { DocMap } from "../storage/types";
import type { SyncSummary } from "./types";

export function summarize(
  docs: Partial<DocMap>,
  datasetIndex: KnownDex | null,
  opts: { exportedAt?: number; knownTrainerIds?: ReadonlySet<string> } = {},
): SyncSummary {
  const capturedDex = Object.keys(docs.captured?.entries ?? {}).map(Number);
  const teamDex = (docs.team?.slots ?? []).filter((s): s is number => s !== null);
  const historyDex = (docs.history?.entries ?? []).map((e) => e.dex);
  const trainersDefeated: Record<string, number> = {};
  const trainerIds: string[] = [];
  for (const [sid, s] of Object.entries(docs.trainerProgress?.series ?? {})) {
    const ids = Object.keys(s.defeated);
    trainersDefeated[sid] = ids.length;
    trainerIds.push(...ids);
  }
  let unknownIds = 0;
  if (datasetIndex) {
    const known = toKnownSet(datasetIndex);
    const unknownDex = new Set([...capturedDex, ...teamDex, ...historyDex].filter((d) => !known.has(d)));
    unknownIds += unknownDex.size;
  }
  if (opts.knownTrainerIds) {
    const known = opts.knownTrainerIds;
    unknownIds += new Set(trainerIds.filter((t) => !known.has(t))).size;
  }
  return {
    captured: capturedDex.length,
    team: teamDex.length,
    history: historyDex.length,
    trainersDefeated,
    preferences: docs.preferences !== undefined,
    exportedAt: opts.exportedAt ?? 0,
    unknownIds,
  };
}
