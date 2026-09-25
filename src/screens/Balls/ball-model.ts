// Regras de exibicao da grade de Pokebolas (F9.1), puras e testaveis com o dataset real.
import type { BallInfo, BallTag } from "../../data/types";
import { normalizeSearch } from "../../domain/normalize";

export type BallFilter = "all" | BallTag;
export const BALL_FILTERS: readonly BallFilter[] = ["all", "night", "water", "fishing", "first", "caught", "after"];

export function isBallFilter(v: unknown): v is BallFilter {
  return typeof v === "string" && (BALL_FILTERS as readonly string[]).includes(v);
}

const fmt = (n: number) => String(n);

/** Multiplicador resumido: flat -> "1.5x"; conditional -> "1x a 4x"; guaranteed -> null (UI mostra "Garantida"). */
export function ballMultiplier(ball: Pick<BallInfo, "rule">): { kind: "flat"; text: string } | { kind: "range"; worst: string; best: string } | { kind: "guaranteed" } {
  const r = ball.rule;
  if (r.kind === "flat") return { kind: "flat", text: `${fmt(r.multiplier)}x` };
  if (r.kind === "guaranteed") return { kind: "guaranteed" };
  return { kind: "range", worst: fmt(r.worstMultiplier), best: fmt(r.bestMultiplier) };
}

/** Tag E texto (nome PT ou EN, sem acento). */
export function filterBalls(balls: readonly BallInfo[], filter: BallFilter, query: string): readonly BallInfo[] {
  const q = normalizeSearch(query);
  if (filter === "all" && !q) return balls;
  return balls.filter(
    (b) =>
      (filter === "all" || b.tags.includes(filter)) &&
      (!q || normalizeSearch(`${b.name.pt} | ${b.name.en}`).includes(q)),
  );
}
