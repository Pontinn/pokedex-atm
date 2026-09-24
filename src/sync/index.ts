// Fachada publica do sync (SPEC 5.5). Carregar em chunk lazy na tela Sincronizar.
export * from "./types";
export { encodeSyncCode, decodeSyncCode, encodePayload, wrapPayload, base64urlEncode, base64urlDecode, DEFAULT_MAX_DEX } from "./codec";
export { splitFrames, FrameCollector, randomSessionId, type FrameStatus } from "./frames";
export { mergeDocuments, type MergeMode } from "./merge";
export { summarize } from "./summary";
