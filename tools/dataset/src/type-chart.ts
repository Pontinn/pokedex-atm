// B2.5 passo 2: emite type-chart.json a partir de src/domain/type-chart.ts (fonte unica, B6.1), para
// que o app e o pipeline usem exatamente a mesma tabela (nunca redefinida aqui).
import type { TypeChartFile } from "../../../src/data/types";
import { TYPE_IDS, typeChartMatrix } from "../../../src/domain/type-chart";

export function buildTypeChartFile(): TypeChartFile {
  return { attackers: [...TYPE_IDS], matrix: typeChartMatrix() };
}
