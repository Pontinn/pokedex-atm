// B3.4 passo 4: orcamento de midia desta etapa (cries + sfx + itemTextures; sprites entra em B2.5/B3.3,
// Onda 2, que faz a checagem final com o total de todas as categorias).
import type { PipelineContext } from "../context";

/** Limite de seguranca acima dos ~22 MB previstos para esta etapa (SPEC B3.4 [ASSUMPTION]). */
export const MEDIA_BUDGET_BYTES = 26 * 1024 * 1024;

export function checkBudget(ctx: PipelineContext): void {
  const totals = ctx.media.totals();
  const stageBytes = totals.criesBytes + totals.sfxBytes + totals.itemTexturesBytes;
  if (stageBytes > MEDIA_BUDGET_BYTES) {
    throw new Error(
      `E_MEDIA_BUDGET: midia desta etapa (${stageBytes} bytes) excede o limite de ${MEDIA_BUDGET_BYTES} bytes`,
    );
  }
}
