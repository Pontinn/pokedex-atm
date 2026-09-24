import { createHash } from "node:crypto";

/** SHA-256 em hex. */
export function sha256Hex(data: string | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

/** 8 primeiros hex do SHA-256 (sufixo do datasetVersion, SPEC 5.1.1). */
export function sha8(data: string | Uint8Array): string {
  return sha256Hex(data).slice(0, 8);
}
