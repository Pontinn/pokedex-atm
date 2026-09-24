// i18n por modulo de dono (preparo das telas em paralelo): o agregador tem exatamente a uniao dos modulos,
// nenhuma chave aparece em dois modulos e toda chave de todo modulo tem pt e en nao vazios.
import { describe, expect, it } from "vitest";
import { MESSAGES, MESSAGE_MODULES, type MessageKey } from "../../../src/i18n/messages";

describe("i18n modules", () => {
  it("MESSAGES is the disjoint union of every module", () => {
    const seen = new Map<string, string>();
    for (const [mod, entries] of Object.entries(MESSAGE_MODULES)) {
      for (const key of Object.keys(entries)) {
        expect(seen.get(key), `${key} in ${mod} and ${seen.get(key)}`).toBeUndefined();
        seen.set(key, mod);
      }
    }
    expect([...seen.keys()].sort()).toEqual(Object.keys(MESSAGES).sort());
  });

  it("every key of every module has non-empty pt and en", () => {
    for (const [mod, entries] of Object.entries(MESSAGE_MODULES)) {
      for (const [key, msg] of Object.entries(entries as Record<string, { pt: string; en: string }>)) {
        expect(msg.pt.trim(), `${mod}:${key} pt`).not.toBe("");
        expect(msg.en.trim(), `${mod}:${key} en`).not.toBe("");
      }
    }
  });

  it("the key union still rejects unknown keys at compile time", () => {
    const known: MessageKey = "nav.home";
    // @ts-expect-error chave inexistente nao pertence a MessageKey
    const unknown: MessageKey = "nav.doesNotExist";
    expect([known, unknown]).toHaveLength(2);
  });
});
