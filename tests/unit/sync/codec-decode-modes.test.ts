// T1: modos do bloco capturedAt em decodeBody (src/sync/codec.ts): o encoder atual sempre grava o modo 1
// (ASSUMPTION A6), mas o decoder aceita o modo 0 (compatibilidade) e recusa um modo desconhecido; a lista
// modo 1 fora de ordem tambem e "corrupted". Os payloads sao gerados por encodePayload e remontados a mao
// (wrapPayload) para simular bytes de outra versao/corrompidos, sem depender de layout interno nao exportado.
import { describe, expect, it } from "vitest";
import { DOC_DEFAULTS } from "../../../src/storage/defaults";
import { encodePayload, wrapPayload, decodeSyncCode, DEFAULT_MAX_DEX } from "../../../src/sync/codec";
import type { DocMap } from "../../../src/storage/types";

const NOW = 1_700_000_000_000;

function emptyDocs(): Partial<DocMap> {
  return { captured: structuredClone(DOC_DEFAULTS.captured) };
}

// offset do byte "mode" quando nao ha capturados nem dex custom: header (3 magic + 1 versao + 1 schema + 4
// segundos) + u16 maxDex + bitmap (DEFAULT_MAX_DEX+1 bits) + u8 customCount(=0).
const MODE_OFFSET = 9 + 2 + Math.ceil((DEFAULT_MAX_DEX + 1) / 8) + 1;

describe("decodeSyncCode: modo de capturedAt", () => {
  it("payload sem nenhum capturado tem o byte de modo (1) exatamente no offset calculado", () => {
    const payload = encodePayload(emptyDocs(), NOW);
    expect(payload[MODE_OFFSET]).toBe(1);
  });

  it("modo 0 (compatibilidade): sem capturados, decodifica normalmente com entries vazio", () => {
    const payload = encodePayload(emptyDocs(), NOW);
    payload[MODE_OFFSET] = 0;
    const text = wrapPayload(payload);
    const res = decodeSyncCode(text, { now: NOW });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.value.docs.captured.entries).toEqual({});
  });

  it("modo desconhecido (2) -> corrupted", () => {
    const payload = encodePayload(emptyDocs(), NOW);
    payload[MODE_OFFSET] = 2;
    const text = wrapPayload(payload);
    const res = decodeSyncCode(text, { now: NOW });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe("corrupted");
  });

  it("modo 1 com a lista de (dex, capturedAt) fora de ordem -> corrupted", () => {
    const docs: Partial<DocMap> = {
      captured: {
        schemaVersion: 1,
        entries: {
          "6": { capturedAt: NOW - 1000 },
          "25": { capturedAt: NOW - 2000 },
        },
      },
    };
    const payload = encodePayload(docs, NOW);
    // apos o byte de modo (1), vem (u16 dex, u32 segundos) para dex=6 e depois dex=25, em ordem crescente;
    // trocar os dois blocos de 6 bytes quebra a ordem esperada (bitmap ja fixa dexes=[6,25] ascendente).
    const entryStart = MODE_OFFSET + 1;
    const first = payload.slice(entryStart, entryStart + 6);
    const second = payload.slice(entryStart + 6, entryStart + 12);
    payload.set(second, entryStart);
    payload.set(first, entryStart + 6);
    const text = wrapPayload(payload);
    const res = decodeSyncCode(text, { now: NOW });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("corrupted");
      expect(res.error.message).toContain("out of order");
    }
  });
});
