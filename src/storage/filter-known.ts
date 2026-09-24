// Orfaos (RF-123): esconde ids que nao existem no dataset atual, sem tocar no storage.
export type KnownDex = ReadonlySet<number> | readonly { dex: number }[];

export function toKnownSet(datasetIndex: KnownDex): ReadonlySet<number> {
  if (datasetIndex instanceof Set) return datasetIndex;
  return new Set((datasetIndex as readonly { dex: number }[]).map((s) => s.dex));
}

export function filterKnown<T extends { dex: number }>(entries: readonly T[], datasetIndex: KnownDex): T[] {
  const known = toKnownSet(datasetIndex);
  return entries.filter((e) => known.has(e.dex));
}
