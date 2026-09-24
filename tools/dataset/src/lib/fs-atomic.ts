// Escrita atomica: arquivo .tmp + rename; troca de pasta inteira via staging + rename.
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PipelineError } from "./errors";

/** Escreve JSON (compacto por padrao; pretty para relatorios) em path.tmp e renomeia sobre path. */
export function writeJsonAtomic(filePath: string, data: unknown, options: { pretty?: boolean } = {}): number {
  const text = options.pretty ? `${JSON.stringify(data, null, 2)}\n` : JSON.stringify(data);
  return writeFileAtomic(filePath, text);
}

/** Escreve bytes/texto em path.tmp e renomeia; devolve o tamanho em bytes. */
export function writeFileAtomic(filePath: string, content: string | Uint8Array): number {
  const tmp = `${filePath}.tmp`;
  try {
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(tmp, content);
    renameSync(tmp, filePath);
  } catch (error) {
    rmSync(tmp, { force: true });
    throw new PipelineError("E_WRITE_FAILED", `falha ao escrever ${filePath}`, String(error));
  }
  return typeof content === "string" ? Buffer.byteLength(content) : content.byteLength;
}

/**
 * Substitui finalDir pelo conteudo de stagingDir: renomeia o antigo para .old, move o novo, apaga o .old.
 * Em falha, restaura o antigo (nada parcial fica no lugar final).
 */
export function replaceDirAtomic(finalDir: string, stagingDir: string): void {
  if (!existsSync(stagingDir)) throw new PipelineError("E_WRITE_FAILED", "staging inexistente", stagingDir);
  const backup = `${finalDir}.old-${Date.now()}`;
  mkdirSync(path.dirname(finalDir), { recursive: true });
  const hadOld = existsSync(finalDir);
  try {
    if (hadOld) renameSync(finalDir, backup);
    renameSync(stagingDir, finalDir);
  } catch (error) {
    if (hadOld && !existsSync(finalDir) && existsSync(backup)) renameSync(backup, finalDir);
    throw new PipelineError("E_WRITE_FAILED", `falha ao publicar ${finalDir}`, String(error));
  }
  if (hadOld) rmSync(backup, { recursive: true, force: true });
}

/** Recria uma pasta vazia (apaga a anterior). */
export function resetDir(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}
