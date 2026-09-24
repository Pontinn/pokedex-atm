// B4.3: catalogo das Pokebolas + tabela de regras. Nunca escreve em public/ (so ctx.outDir de staging).
import type { BallInfo, BallsFile } from "../../../../src/data/types";
import type { PipelineContext } from "../context";
import { writeJsonAtomic } from "../lib/fs-atomic";
import { BALL_RULES, EXPECTED_BALL_COUNT } from "./ball-rules";
import { buildBallCatalog, collectBallIds } from "./catalog";

/** Pokebolas e tabela de regras. */
export async function runBallsStage(ctx: PipelineContext): Promise<void> {
  const ids = collectBallIds(ctx.reader);
  if (ids.length !== EXPECTED_BALL_COUNT) {
    ctx.report.warn(
      "W_BALL_COUNT",
      `esperado ${EXPECTED_BALL_COUNT} texturas de bola, encontrado ${ids.length}`,
      ids,
    );
  }
  const catalog = buildBallCatalog(ids, ctx.lang);

  const missingRule = ids.filter((id) => !(id in BALL_RULES));
  const extraRules = Object.keys(BALL_RULES).filter((id) => !ids.includes(id));
  if (missingRule.length || extraRules.length) {
    throw new Error(
      `E_BALL_RULE_MISMATCH: tabela curada de regras nao bate com o catalogo de texturas ` +
        `(faltando: ${JSON.stringify(missingRule)}; sobrando: ${JSON.stringify(extraRules)})`,
    );
  }

  const balls: BallsFile = catalog.map((entry): BallInfo => {
    const curated = BALL_RULES[entry.id];
    if (!curated) throw new Error(`E_BALL_RULE_MISSING: sem regra curada para "${entry.id}"`);
    return {
      id: entry.id,
      itemId: entry.itemId,
      name: entry.name,
      effect: entry.effect,
      rule: curated.rule,
      tags: curated.tags,
    };
  });

  writeJsonAtomic(ctx.dataPath("balls.json"), balls);
  ctx.setCount("balls", balls.length);
  ctx.report.section("balls", { count: balls.length });
}
