// Erros nomeados do pipeline (codigo de saida 1, mensagem com o codigo e o caminho).
export type PipelineErrorCode =
  | "E_NODE_VERSION"
  | "E_CLI_ARGS"
  | "E_INSTANCE_NOT_FOUND"
  | "E_SOURCE_MODE_UNKNOWN"
  | "E_JAR_MISSING"
  | "E_JAR_DUPLICATE"
  | "E_JAR_UNREADABLE"
  | "E_SNAPSHOT_INCOMPLETE"
  | "E_JSON_INVALID"
  | "E_SPECIES_INVALID"
  | "E_OUT_DIR_UNSAFE"
  | "E_PUBLISH_FORBIDDEN"
  | "E_WRITE_FAILED";

export class PipelineError extends Error {
  readonly code: PipelineErrorCode;
  readonly detail: string | undefined;

  constructor(code: PipelineErrorCode, message: string, detail?: string) {
    super(`${code}: ${message}${detail ? ` (${detail})` : ""}`);
    this.name = "PipelineError";
    this.code = code;
    this.detail = detail;
  }
}

export function isPipelineError(error: unknown): error is PipelineError {
  return error instanceof PipelineError;
}
