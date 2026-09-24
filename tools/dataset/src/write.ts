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

// BUGFIX (achado pelo B2.5/Onda 2 rodando o pipeline completo de verdade neste PC, repetidas vezes):
// quando `finalDir` ja existe (reexecucao com o mesmo datasetVersion, ex. mesmo dia/mesmos dados),
// `replaceDirAtomic` renomeia finalDir -> "<finalDir>.old-<ts>" antes de mover o staging para o lugar.
// Nesta maquina (pasta do projeto sob Desktop, sincronizada pelo OneDrive) esse RENAME especifico do
// diretorio ja publicado falha de forma consistente com EPERM, mesmo sem nenhum processo Node segurando
// arquivo algum (confirmado matando todos os node.exe e tentando de novo: mesmo erro). Um DELETE simples
// (`rm -rf` / `rmSync`) do MESMO diretorio, em compensacao, funciona sem falhas (confirmado manualmente):
// o filtro de sincronizacao intercepta rename de pastas publicadas de um jeito que nao intercepta delete.
// Solucao: quando finalDir ja existe, remove-lo com rmSync (retry curto) ANTES de chamar
// `replaceDirAtomic` (congelado, sem mudar sua assinatura), para que ela caia no caminho simples
// (so renomeia o staging para o lugar, sem precisar da dança old/backup).
function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function removeIfExistsWithRetry(dir: string, attempts = 5): void {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      rmSync(dir, { recursive: true, force: true });
      return;
    } catch (error) {
      const transient = error instanceof Error && /EPERM|EBUSY/.test(error.message);
      if (!transient || attempt === attempts) throw error;
      sleepSync(300 * attempt);
    }
  }
}

function replaceDirAtomicWithRetry(finalDir: string, stagingDir: string, attempts = 5): void {
  if (existsSync(finalDir)) removeIfExistsWithRetry(finalDir);
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      replaceDirAtomic(finalDir, stagingDir);
      return;
    } catch (error) {
      const transient = error instanceof Error && /EPERM|EBUSY/.test(error.message);
      if (!transient || attempt === attempts) throw error;
      sleepSync(300 * attempt);
    }
  }
}

// Mesmo lock transitorio (ver nota acima) tambem pode atingir o rename de um ARQUIVO pequeno logo apos
// o rename de uma pasta grande no mesmo diretorio pai (current.json, escrito por ultimo): mesmo retry.
function writeJsonAtomicWithRetry(filePath: string, data: unknown, options: { pretty?: boolean } = {}, attempts = 5): void {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      writeJsonAtomic(filePath, data, options);
      return;
    } catch (error) {
      const transient = error instanceof Error && /EPERM|EBUSY/.test(error.message);
      if (!transient || attempt === attempts) throw error;
      sleepSync(300 * attempt);
    }
  }
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
  replaceDirAtomicWithRetry(path.join(dataRoot, options.datasetVersion), stagingData);

  const stagingAssets = path.join(ctx.outDir, "assets");
  if (existsSync(stagingAssets)) {
    for (const category of readdirSync(stagingAssets)) {
      replaceDirAtomicWithRetry(path.join(options.publicDir, "assets", category), path.join(stagingAssets, category));
    }
  }

  const pointer: CurrentDatasetPointer = { datasetVersion: options.datasetVersion };
  writeJsonAtomicWithRetry(path.join(dataRoot, "current.json"), pointer, { pretty: true });

  if (!ctx.flags.keepOld) {
    for (const entry of readdirSync(dataRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name !== options.datasetVersion) {
        removeIfExistsWithRetry(path.join(dataRoot, entry.name));
      }
    }
  }
}
