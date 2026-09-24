// Erros tipados da persistencia (SPEC 5.3 "Quota/erro").
import type { StorageError, StorageErrorCode } from "./types";

export class StorageFailure extends Error implements StorageError {
  readonly code: StorageErrorCode;
  override readonly cause?: unknown;

  constructor(code: StorageErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "StorageFailure";
    this.code = code;
    this.cause = cause;
  }
}

export function isStorageError(e: unknown): e is StorageFailure {
  return e instanceof StorageFailure;
}

/** QuotaExceededError -> QUOTA_EXCEEDED; InvalidStateError -> UNAVAILABLE; blocked -> BLOCKED; resto -> UNKNOWN. */
export function toStorageError(e: unknown): StorageFailure {
  if (e instanceof StorageFailure) return e;
  const name = e && typeof e === "object" && "name" in e ? String((e as { name: unknown }).name) : "";
  const message = e instanceof Error ? e.message : String(e);
  if (name === "QuotaExceededError") return new StorageFailure("QUOTA_EXCEEDED", message, e);
  if (name === "InvalidStateError") return new StorageFailure("UNAVAILABLE", message, e);
  if (name === "BlockedError" || name === "blocked") return new StorageFailure("BLOCKED", message, e);
  return new StorageFailure("UNKNOWN", message, e);
}
