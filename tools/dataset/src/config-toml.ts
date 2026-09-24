// B5.2 passo 3: le config/rctmod-server.toml (@iarna/toml) -> LevelCapConfig; ausencia do arquivo usa
// os padroes do mod e report (SPEC 5.1.1: arquivo de configuracao, precedencia 5, ultimo estagio).
import { parse } from "@iarna/toml";
import type { LevelCapConfig } from "../../../src/data/types";
import type { ReportSink } from "./context";
import type { SourceReader } from "./source-reader";

export const RCTMOD_CONFIG_PATH = "config/rctmod-server.toml";

/** Padroes do mod (verificados em config/rctmod-server.toml: [Players] initialLevelCap=15 etc.). */
export const DEFAULT_LEVEL_CAP_CONFIG: LevelCapConfig = {
  initialLevelCap: 15,
  relativeLevelCap: 0,
  initialSeries: "empty",
  freeroamRequiresCompletedSeries: true,
};

export function loadLevelCapConfig(reader: SourceReader, report: ReportSink): LevelCapConfig {
  if (!reader.exists(RCTMOD_CONFIG_PATH)) {
    report.warn("W_CONFIG_MISSING", "config/rctmod-server.toml ausente; usando os padroes do mod", RCTMOD_CONFIG_PATH);
    return { ...DEFAULT_LEVEL_CAP_CONFIG };
  }
  const bytes = reader.readFile(RCTMOD_CONFIG_PATH);
  const text = new TextDecoder("utf-8").decode(bytes);
  const parsed = parse(text) as Record<string, unknown>;
  const players = (typeof parsed.Players === "object" && parsed.Players !== null ? parsed.Players : {}) as Record<string, unknown>;
  return {
    initialLevelCap: typeof players.initialLevelCap === "number" ? players.initialLevelCap : DEFAULT_LEVEL_CAP_CONFIG.initialLevelCap,
    relativeLevelCap: typeof players.relativeLevelCap === "number" ? players.relativeLevelCap : DEFAULT_LEVEL_CAP_CONFIG.relativeLevelCap,
    initialSeries: typeof players.initialSeries === "string" ? players.initialSeries : DEFAULT_LEVEL_CAP_CONFIG.initialSeries,
    freeroamRequiresCompletedSeries:
      typeof players.freeroamRequiresCompletedSeries === "boolean"
        ? players.freeroamRequiresCompletedSeries
        : DEFAULT_LEVEL_CAP_CONFIG.freeroamRequiresCompletedSeries,
  };
}
