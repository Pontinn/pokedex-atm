// Resolucao de caminhos e validacoes de ambiente do pipeline.
import path from "node:path";
import type { CliFlags } from "./context";
import { PipelineError } from "./lib/errors";

/** Raiz do repositorio (tools/dataset/src -> ../../..). O projeto e ESM: import.meta.dirname e nativo no Node 24. */
export const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");

export const DEFAULT_SOURCE = "data-source/atm-1.3.0";
export const DEFAULT_OUT = "tools/dataset/out/_staging";
export const OUT_ROOT = "tools/dataset/out";
export const DEFAULT_CACHE = "tools/dataset/.cache";

export interface PipelineConfig {
  repoRoot: string;
  /** fonte resolvida (absoluta) */
  sourceRoot: string;
  /** de onde veio a fonte */
  sourceOrigin: "flag" | "env" | "default";
  /** staging absoluto */
  outDir: string;
  /** raiz do cache (DATASET_CACHE_DIR), subpasta por etapa */
  cacheRoot: string;
  /** public/ do app (so publish usa) */
  publicDir: string;
}

export function assertNodeVersion(version = process.versions.node): void {
  const major = Number(version.split(".")[0]);
  if (!Number.isFinite(major) || major < 24) {
    throw new PipelineError("E_NODE_VERSION", `Node >= 24 e obrigatorio (atual ${version})`);
  }
}

/** Precedencia da fonte: --instance > ATM_INSTANCE_DIR > data-source/atm-1.3.0 (relativo a raiz do repo). */
export function resolveConfig(flags: CliFlags, env: NodeJS.ProcessEnv = process.env, repoRoot = REPO_ROOT): PipelineConfig {
  let sourceRoot: string;
  let sourceOrigin: PipelineConfig["sourceOrigin"];
  if (flags.instance) {
    sourceRoot = path.resolve(flags.instance);
    sourceOrigin = "flag";
  } else if (env.ATM_INSTANCE_DIR) {
    sourceRoot = path.resolve(env.ATM_INSTANCE_DIR);
    sourceOrigin = "env";
  } else {
    sourceRoot = path.resolve(repoRoot, DEFAULT_SOURCE);
    sourceOrigin = "default";
  }
  const outDir = path.resolve(repoRoot, flags.out ?? DEFAULT_OUT);
  const outRoot = path.resolve(repoRoot, OUT_ROOT);
  const rel = path.relative(outRoot, outDir);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
    // o staging e apagado a cada execucao: so e permitido dentro de tools/dataset/out/<pasta>/
    throw new PipelineError("E_OUT_DIR_UNSAFE", "--out deve ser uma subpasta de tools/dataset/out/", outDir);
  }
  const cacheRoot = path.resolve(repoRoot, env.DATASET_CACHE_DIR ?? DEFAULT_CACHE);
  return { repoRoot, sourceRoot, sourceOrigin, outDir, cacheRoot, publicDir: path.join(repoRoot, "public") };
}
