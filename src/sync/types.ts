// Tipos do codigo de sincronizacao (SPEC 5.4, B7.2).
import type { DocMap } from "../storage/types";

export type SyncErrorCode = "foreignApp" | "unsupportedVersion" | "corrupted" | "incomplete" | "oversized" | "empty";

export class SyncError extends Error {
  readonly code: SyncErrorCode;
  constructor(code: SyncErrorCode, message: string = code) {
    super(message);
    this.name = "SyncError";
    this.code = code;
  }
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export interface SyncSummary {
  captured: number;
  team: number;
  history: number;
  trainersDefeated: Record<string, number>;
  preferences: boolean;
  /** ms */
  exportedAt: number;
  /** dex/trainerIds que o dataset local nao conhece (mantidos como orfaos, RF-123) */
  unknownIds: number;
}

export interface SyncEncoded {
  /** "PDX1.<base64url>" */
  text: string;
  /** um item se couber em 1 QR; senao frames "PDXF.i/n.<session>.<chunk>" */
  frames: string[];
  /** tamanho do payload binario antes da compressao */
  bytes: number;
  summary: SyncSummary;
}

export type UserDocs = Omit<DocMap, "meta">;

export interface SyncDecoded {
  docs: UserDocs;
  summary: SyncSummary;
  schemaVersion: number;
  /** ms */
  exportedAt: number;
}

export const SYNC_PREFIX = "PDX1.";
export const FRAME_PREFIX = "PDXF.";
export const SUPPORTED_SYNC_VERSION = 1;
export const MAX_TEXT_LENGTH = 200_000;
export const MAX_COMPRESSED_BYTES = 65_536;
export const MAX_INFLATED_BYTES = 524_288;
export const FRAME_CAPACITY = 900;
