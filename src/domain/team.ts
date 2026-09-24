// Time de 6 slots (RF-38..40): slots fixos, null = vazio, remover mantem a ordem.
export const TEAM_SIZE = 6;

export type TeamSlots = (number | null)[];

export type AddToTeamResult = { ok: true; slots: TeamSlots } | { ok: false; reason: "full"; slots: TeamSlots };

function assertDex(dex: number): void {
  if (!Number.isInteger(dex) || dex <= 0) throw new RangeError(`invalid dex: ${dex}`);
}

/** Normaliza para exatamente TEAM_SIZE posicoes (corta excesso, completa com null, valores invalidos viram null). */
export function normalizeTeam(slots: readonly (number | null | undefined)[]): TeamSlots {
  const out: TeamSlots = [];
  for (let i = 0; i < TEAM_SIZE; i++) {
    const v = slots[i];
    out.push(typeof v === "number" && Number.isInteger(v) && v > 0 ? v : null);
  }
  return out;
}

/** Ja presente -> ok sem mudanca; preenche o primeiro null; sem vaga -> reason "full". */
export function addToTeam(slots: readonly (number | null)[], dex: number): AddToTeamResult {
  assertDex(dex);
  const next = normalizeTeam(slots);
  if (next.includes(dex)) return { ok: true, slots: next };
  const free = next.indexOf(null);
  if (free === -1) return { ok: false, reason: "full", slots: next };
  next[free] = dex;
  return { ok: true, slots: next };
}

/** Troca o slot do dex por null, mantendo a posicao dos demais. */
export function removeFromTeam(slots: readonly (number | null)[], dex: number): TeamSlots {
  assertDex(dex);
  return normalizeTeam(slots).map((s) => (s === dex ? null : s));
}

export function isTeamEmpty(slots: readonly (number | null)[]): boolean {
  return normalizeTeam(slots).every((s) => s === null);
}
