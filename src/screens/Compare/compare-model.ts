// Regras puras de Comparar (F7.1).
import type { HistoryEntry } from "../../storage/types";

export type Side = "left" | "right";

/** Lado vencedor de uma linha; empate (inclui o mesmo Pokemon dos dois lados) ou lado vazio = nenhum. */
export function winner(a: number | null, b: number | null): Side | null {
  if (a == null || b == null || a === b) return null;
  return a > b ? "left" : "right";
}

/** Lados iniciais: params da navegacao, senao os 2 ultimos do historico ([0] = mais recente), senao vazio. */
export function compareDefaults(params: { left?: number; right?: number }, history: readonly HistoryEntry[]): { left: number | null; right: number | null } {
  const recent = history.map((h) => h.dex);
  const left = params.left ?? recent[0] ?? null;
  const right = params.right ?? recent.find((d) => d !== left) ?? null;
  return { left, right };
}
