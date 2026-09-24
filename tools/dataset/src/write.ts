// Publicacao do staging em public/ (contrato congelado; chamado SOMENTE por runWriteStage de B2.5, Onda 2).
// Com --only a publicacao NUNCA roda: nada e escrito em public/data/, public/assets/ nem current.json.
import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import type { CurrentDatasetPointer } from "../../../src/data/types";
import type { PipelineContext } from "./context";
import { PipelineError } from "./lib/errors";
import { replaceDirAtomic, writeJsonAtomic } from "./lib/fs-atomic";

export interface PublishOptions {
  /** raiz public/ do app */
  publicDir: string;
  datasetVersion: string;
}

/**
 * Move <outDir>/data/ para public/data/<datasetVersion>/ e <outDir>/assets/<cat>/ para public/assets/<cat>/,
 * depois atualiza public/data/current.json. Sem --keep-old, remove as outras versoes de public/data/.
 */
export function publish(ctx: PipelineContext, options: PublishOptions): void {
  if (ctx.flags.only) {
    throw new PipelineError("E_PUBLISH_FORBIDDEN", `publicacao proibida com --only ${ctx.flags.only}`);
  }
  const stagingData = path.join(ctx.outDir, "data");
  if (!existsSync(stagingData)) throw new PipelineError("E_WRITE_FAILED", "staging sem data/", stagingData);
  const dataRoot = path.join(options.publicDir, "data");
  replaceDirAtomic(path.join(dataRoot, options.datasetVersion), stagingData);

  const stagingAssets = path.join(ctx.outDir, "assets");
  if (existsSync(stagingAssets)) {
    for (const category of readdirSync(stagingAssets)) {
      replaceDirAtomic(path.join(options.publicDir, "assets", category), path.join(stagingAssets, category));
    }
  }

  const pointer: CurrentDatasetPointer = { datasetVersion: options.datasetVersion };
  writeJsonAtomic(path.join(dataRoot, "current.json"), pointer, { pretty: true });

  if (!ctx.flags.keepOld) {
    for (const entry of readdirSync(dataRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name !== options.datasetVersion) {
        rmSync(path.join(dataRoot, entry.name), { recursive: true, force: true });
      }
    }
  }
}
