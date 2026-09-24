// Parse das flags do `npm run dataset` (contrato congelado: ordem das etapas e --only/--out).
import { STAGES, type CliFlags, type StageName } from "./context";
import { PipelineError } from "./lib/errors";

export const USAGE = `uso: npm run dataset -- [--instance <dir>] [--skip-media] [--offline] [--report] [--keep-old]
                              [--only <${STAGES.join("|")}>] [--out <dir>]
                              [--publish-dir <dir>]`;

export function parseCliArgs(argv: readonly string[]): CliFlags {
  const flags: CliFlags = {
    instance: null,
    skipMedia: false,
    offline: false,
    report: false,
    keepOld: false,
    only: null,
    out: null,
    publishDir: null,
  };
  const takeValue = (i: number, name: string): string => {
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new PipelineError("E_CLI_ARGS", `${name} exige um valor`, USAGE);
    }
    return value;
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    switch (arg) {
      case "--instance":
        flags.instance = takeValue(i, arg);
        i++;
        break;
      case "--out":
        flags.out = takeValue(i, arg);
        i++;
        break;
      case "--publish-dir":
        flags.publishDir = takeValue(i, arg);
        i++;
        break;
      case "--only": {
        const value = takeValue(i, arg);
        if (!(STAGES as readonly string[]).includes(value)) {
          throw new PipelineError("E_CLI_ARGS", `etapa desconhecida em --only: ${value}`, USAGE);
        }
        flags.only = value as StageName;
        i++;
        break;
      }
      case "--skip-media":
        flags.skipMedia = true;
        break;
      case "--offline":
        flags.offline = true;
        break;
      case "--report":
        flags.report = true;
        break;
      case "--keep-old":
        flags.keepOld = true;
        break;
      default:
        throw new PipelineError("E_CLI_ARGS", `argumento desconhecido: ${arg}`, USAGE);
    }
  }
  return flags;
}
